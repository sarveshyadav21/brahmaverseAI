'use strict';

const app = require('../src/app');
const { api, resetDb, createEmployees, createEnquiry, prisma } = require('./helpers');

let employees;

beforeAll(async () => {
  await resetDb();
  // Bulk-create 20 employees once for the entire concurrency test file
  employees = await createEmployees(20);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Enquiry Claim Concurrency Suite', () => {
  // ─────────────────────────────────────────────────────────────
  // 1. 20-way Race Condition on Single Lead
  // ─────────────────────────────────────────────────────────────
  it('1. 20 parallel claims on one enquiry by 20 different employees yields exactly one 200 and nineteen 409', async () => {
    const enquiry = await createEnquiry();

    // 20 concurrent PATCH requests dispatched via Promise.all
    const responses = await Promise.all(
      employees.map((emp) =>
        api(app)
          .patch(`/api/enquiries/${enquiry.id}/claim`)
          .set('Authorization', `Bearer ${emp.token}`)
      )
    );

    const successful = responses.filter((r) => r.status === 200);
    const conflicts = responses.filter((r) => r.status === 409);

    expect(successful.length).toBe(1);
    expect(conflicts.length).toBe(19);

    // Verify database row matches the winner
    const winnerEmpId = successful[0].body.data.claimedById;
    const dbRecord = await prisma.enquiry.findUnique({ where: { id: enquiry.id } });

    expect(dbRecord.claimedById).toBe(winnerEmpId);
    expect(dbRecord.claimedAt).not.toBeNull();
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Idempotency (Sequential & Parallel)
  // ─────────────────────────────────────────────────────────────
  it('2. The same user claims the same enquiry twice (sequentially, then in parallel): both return 200, claimedAt unchanged', async () => {
    const emp = employees[0];

    // Part A: Sequential claiming by same user
    const enqSeq = await createEnquiry();
    const resSeq1 = await api(app)
      .patch(`/api/enquiries/${enqSeq.id}/claim`)
      .set('Authorization', `Bearer ${emp.token}`);

    expect(resSeq1.status).toBe(200);
    const claimedAtSeq1 = new Date(resSeq1.body.data.claimedAt).getTime();

    // Small delay to verify timestamp is not refreshed
    await new Promise((resolve) => setTimeout(resolve, 50));

    const resSeq2 = await api(app)
      .patch(`/api/enquiries/${enqSeq.id}/claim`)
      .set('Authorization', `Bearer ${emp.token}`);

    expect(resSeq2.status).toBe(200);
    // Compare exact ISO string between responses
    expect(resSeq2.body.data.claimedAt).toBe(resSeq1.body.data.claimedAt);

    // Verify directly against the value persisted in the PostgreSQL database
    const dbSeq = await prisma.enquiry.findUnique({ where: { id: enqSeq.id } });
    expect(dbSeq.claimedAt.toISOString()).toBe(resSeq1.body.data.claimedAt);

    // Part B: Parallel claiming by same user
    const enqPar = await createEnquiry();
    const [resPar1, resPar2] = await Promise.all([
      api(app)
        .patch(`/api/enquiries/${enqPar.id}/claim`)
        .set('Authorization', `Bearer ${emp.token}`),
      api(app)
        .patch(`/api/enquiries/${enqPar.id}/claim`)
        .set('Authorization', `Bearer ${emp.token}`),
    ]);

    expect(resPar1.status).toBe(200);
    expect(resPar2.status).toBe(200);

    // Compare exact ISO strings between both parallel responses
    expect(resPar1.body.data.claimedAt).toBe(resPar2.body.data.claimedAt);

    // Verify directly against the persisted DB record
    const dbPar = await prisma.enquiry.findUnique({ where: { id: enqPar.id } });
    expect(dbPar.claimedAt.toISOString()).toBe(resPar1.body.data.claimedAt);
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Nonexistent ID Handling
  // ─────────────────────────────────────────────────────────────
  it('3. Claiming a nonexistent id returns 404', async () => {
    const emp = employees[0];
    const res = await api(app)
      .patch('/api/enquiries/99999999/claim')
      .set('Authorization', `Bearer ${emp.token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Lead Visibility Partitioning After Claim
  // ─────────────────────────────────────────────────────────────
  it('4. After a claim, the enquiry is absent from other users GET /public and present only in the winner GET /my', async () => {
    const winner = employees[1];
    const otherUser = employees[2];
    const enquiry = await createEnquiry();

    // Winner claims the enquiry
    const claimRes = await api(app)
      .patch(`/api/enquiries/${enquiry.id}/claim`)
      .set('Authorization', `Bearer ${winner.token}`);
    expect(claimRes.status).toBe(200);

    // Other user checks unclaimed /public feed — should NOT contain the claimed enquiry
    const publicRes = await api(app)
      .get('/api/enquiries/public')
      .set('Authorization', `Bearer ${otherUser.token}`);
    expect(publicRes.status).toBe(200);
    const publicIds = publicRes.body.data.map((e) => e.id);
    expect(publicIds).not.toContain(enquiry.id);

    // Winner checks /my feed — MUST contain the claimed enquiry
    const winnerMyRes = await api(app)
      .get('/api/enquiries/my')
      .set('Authorization', `Bearer ${winner.token}`);
    expect(winnerMyRes.status).toBe(200);
    const winnerMyIds = winnerMyRes.body.data.map((e) => e.id);
    expect(winnerMyIds).toContain(enquiry.id);

    // Other user checks /my feed — MUST NOT contain the enquiry
    const otherMyRes = await api(app)
      .get('/api/enquiries/my')
      .set('Authorization', `Bearer ${otherUser.token}`);
    expect(otherMyRes.status).toBe(200);
    const otherMyIds = otherMyRes.body.data.map((e) => e.id);
    expect(otherMyIds).not.toContain(enquiry.id);
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Repeated 20-way Race (5 Iterations)
  // ─────────────────────────────────────────────────────────────
  it('5. Repeat the 20-way race 5 times in a loop on different enquiries to verify stability without flakiness', async () => {
    for (let round = 1; round <= 5; round++) {
      const enquiry = await createEnquiry({ message: `Concurrency iteration ${round}` });

      const responses = await Promise.all(
        employees.map((emp) =>
          api(app)
            .patch(`/api/enquiries/${enquiry.id}/claim`)
            .set('Authorization', `Bearer ${emp.token}`)
        )
      );

      const successful = responses.filter((r) => r.status === 200);
      const conflicts = responses.filter((r) => r.status === 409);

      expect(successful.length).toBe(1);
      expect(conflicts.length).toBe(19);

      const winnerEmpId = successful[0].body.data.claimedById;
      const dbRecord = await prisma.enquiry.findUnique({ where: { id: enquiry.id } });
      expect(dbRecord.claimedById).toBe(winnerEmpId);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 6. ID Boundary: Exceeding 32-bit Integer Maximum
  // ─────────────────────────────────────────────────────────────
  it('6. PATCH /api/enquiries/99999999999/claim (above 32-bit int max) must return 422 or 404, never 500', async () => {
    const emp = employees[0];
    const res = await api(app)
      .patch('/api/enquiries/99999999999/claim')
      .set('Authorization', `Bearer ${emp.token}`);

    // Must be either a validation error (422) or not found (404), never an unhandled server error (500)
    expect([404, 422]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });
});

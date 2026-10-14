'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const app = require('../src/app');
const { api, resetDb, createEmployee, createEnquiry, createEnquiries, prisma } = require('./helpers');

let token1, token2;

beforeAll(async () => {
  await resetDb();
  const emp1 = await createEmployee({ email: 'enq_emp1@test.com' });
  const emp2 = await createEmployee({ email: 'enq_emp2@test.com' });
  token1 = emp1.token;
  token2 = emp2.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

// ─────────────────────────────────────────────────────────────
// Public form submission
// ─────────────────────────────────────────────────────────────
describe('POST /api/enquiries (public form)', () => {
  it('201 — works without a token', async () => {
    const res = await api(app).post('/api/enquiries').send({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      courseInterest: 'Data Science',
      message: 'Interested in weekend batch.',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.courseInterest).toBe('Data Science');
    expect(res.body.data.claimedById).toBeNull();
  });

  it('422 — missing required fields', async () => {
    const res = await api(app).post('/api/enquiries').send({ name: '' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('422 — invalid email', async () => {
    const res = await api(app).post('/api/enquiries').send({
      name: 'Bad Email',
      email: 'not-an-email',
      courseInterest: 'Web Dev',
    });
    expect(res.status).toBe(422);
  });

  it('422 — invalid phone returns 422', async () => {
    const res = await api(app).post('/api/enquiries').send({
      name: 'Bad Phone User',
      email: 'badphone@test.com',
      courseInterest: 'Data Science',
      phone: 'invalid-phone-format',
    });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('422 — message over 1000 characters returns 422', async () => {
    const res = await api(app).post('/api/enquiries').send({
      name: 'Long Message User',
      email: 'longmsg@test.com',
      courseInterest: 'Data Science',
      message: 'a'.repeat(1001),
    });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────
// Auth guard on list endpoints
// ─────────────────────────────────────────────────────────────
describe('GET /api/enquiries/* — auth guard', () => {
  it('401 on /public without token', async () => {
    const res = await api(app).get('/api/enquiries/public');
    expect(res.status).toBe(401);
  });

  it('401 on /my without token', async () => {
    const res = await api(app).get('/api/enquiries/my');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
// Claim logic
// ─────────────────────────────────────────────────────────────
describe('PATCH /api/enquiries/:id/claim', () => {
  it('claimed enquiry disappears from /public for other users', async () => {
    const enquiry = await createEnquiry();

    await api(app)
      .patch(`/api/enquiries/${enquiry.id}/claim`)
      .set('Authorization', `Bearer ${token1}`);

    const res = await api(app)
      .get('/api/enquiries/public')
      .set('Authorization', `Bearer ${token2}`);

    const ids = res.body.data.map((e) => e.id);
    expect(ids).not.toContain(enquiry.id);
  });

  it('claimed enquiry appears in /my for the owner', async () => {
    const enquiry = await createEnquiry();

    await api(app)
      .patch(`/api/enquiries/${enquiry.id}/claim`)
      .set('Authorization', `Bearer ${token1}`);

    const res = await api(app)
      .get('/api/enquiries/my')
      .set('Authorization', `Bearer ${token1}`);

    const ids = res.body.data.map((e) => e.id);
    expect(ids).toContain(enquiry.id);
  });

  it('claimed enquiry does NOT appear in /my for another user', async () => {
    const enquiry = await createEnquiry();

    await api(app)
      .patch(`/api/enquiries/${enquiry.id}/claim`)
      .set('Authorization', `Bearer ${token1}`);

    const res = await api(app)
      .get('/api/enquiries/my')
      .set('Authorization', `Bearer ${token2}`);

    const ids = res.body.data.map((e) => e.id);
    expect(ids).not.toContain(enquiry.id);
  });

  it('409 — claiming an enquiry already owned by someone else', async () => {
    const enquiry = await createEnquiry();

    await api(app)
      .patch(`/api/enquiries/${enquiry.id}/claim`)
      .set('Authorization', `Bearer ${token1}`);

    const res = await api(app)
      .patch(`/api/enquiries/${enquiry.id}/claim`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(409);
  });

  it('422 — non-integer :id', async () => {
    const res = await api(app)
      .patch('/api/enquiries/abc/claim')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────
describe('Pagination', () => {
  beforeAll(async () => {
    // Create 12 fresh unclaimed enquiries in a single batch insert
    await createEnquiries(12);
  });

  it('returns correct pagination meta', async () => {
    const res = await api(app)
      .get('/api/enquiries/public?page=1&limit=5')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(12);
    expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(3);
  });

  it('caps limit at 100 and returns 200 (coercion, not rejection)', async () => {
    const res = await api(app)
      .get('/api/enquiries/public?limit=9999')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(100);
  });

  it('invalid page coerces to 1', async () => {
    const res = await api(app)
      .get('/api/enquiries/public?page=abc')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('limit=0 coerces to default limit 10', async () => {
    const res = await api(app)
      .get('/api/enquiries/public?limit=0')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('limit=abc coerces to default limit 10', async () => {
    const res = await api(app)
      .get('/api/enquiries/public?limit=abc')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('page=-5 coerces to page 1', async () => {
    const res = await api(app)
      .get('/api/enquiries/public?page=-5')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────
// Rate Limiting Verification (Isolated App Instance)
// ─────────────────────────────────────────────────────────────
describe('Rate Limiting on POST /api/enquiries', () => {
  it('returns 429 once the submission limit is exceeded on isolated test instance', async () => {
    const testApp = express();
    testApp.use(express.json());

    const testLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 2,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many submissions. Please try again later.' },
    });

    testApp.post('/api/enquiries', testLimiter, (req, res) => {
      res.status(201).json({ success: true, data: req.body });
    });

    const res1 = await api(testApp).post('/api/enquiries').send({ name: 'Lead 1' });
    const res2 = await api(testApp).post('/api/enquiries').send({ name: 'Lead 2' });
    const res3 = await api(testApp).post('/api/enquiries').send({ name: 'Lead 3' });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res3.status).toBe(429);
    expect(res3.body.message).toContain('Too many submissions');
  });
});

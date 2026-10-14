'use strict';

const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { api, resetDb, createEmployee, prisma } = require('./helpers');
const { JWT_SECRET } = require('../src/config/env');

beforeAll(resetDb);
afterAll(async () => {
  await prisma.$disconnect();
});

// ─────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('201 — registers successfully, response has no passwordHash', async () => {
    const res = await api(app).post('/api/auth/register').send({
      name: 'Asha Verma',
      email: 'asha_reg@company.com',
      password: 'StrongPass123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('asha_reg@company.com');
    expect(res.body.data).not.toHaveProperty('passwordHash');
    expect(res.body.data).not.toHaveProperty('password_hash');
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('409 — duplicate email', async () => {
    await api(app).post('/api/auth/register').send({
      name: 'Dup User',
      email: 'dup@company.com',
      password: 'StrongPass123',
    });
    const res = await api(app).post('/api/auth/register').send({
      name: 'Dup User 2',
      email: 'dup@company.com',
      password: 'StrongPass123',
    });
    expect(res.status).toBe(409);
  });

  it('409 — duplicate email, different letter case', async () => {
    await api(app).post('/api/auth/register').send({
      name: 'Case User',
      email: 'casecheck@company.com',
      password: 'StrongPass123',
    });
    const res = await api(app).post('/api/auth/register').send({
      name: 'Case User 2',
      email: 'CASECHECK@COMPANY.COM',
      password: 'StrongPass123',
    });
    expect(res.status).toBe(409);
  });

  it('422 — short password returns validation errors', async () => {
    const res = await api(app).post('/api/auth/register').send({
      name: 'Short',
      email: 'short@test.com',
      password: '123',
    });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('422 — missing name', async () => {
    const res = await api(app).post('/api/auth/register').send({
      email: 'noname@test.com',
      password: 'StrongPass123',
    });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  const email = 'login_test@company.com';
  const password = 'StrongPass123';

  beforeAll(async () => {
    await createEmployee({ name: 'Login Test', email, password });
  });

  it('200 — succeeds and returns a JWT token; no passwordHash in response', async () => {
    const res = await api(app).post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.employee).not.toHaveProperty('passwordHash');
    expect(res.body.data.employee).not.toHaveProperty('password_hash');
  });

  it('401 — wrong password returns generic "Invalid credentials"', async () => {
    const res = await api(app).post('/api/auth/login').send({ email, password: 'WrongPass!' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('401 — unknown email returns the same generic "Invalid credentials"', async () => {
    const res = await api(app).post('/api/auth/login').send({
      email: 'nobody@company.com',
      password: 'AnyPass123',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
});

// ─────────────────────────────────────────────────────────────
// JWT Verification Edge Cases
// ─────────────────────────────────────────────────────────────
describe('JWT Authentication Edge Cases', () => {
  it('401 — expired JWT returns 401', async () => {
    const expiredToken = jwt.sign(
      { sub: 1, email: 'expired@test.com' },
      JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const res = await api(app)
      .get('/api/enquiries/public')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('401 — malformed JWT returns 401', async () => {
    const res = await api(app)
      .get('/api/enquiries/public')
      .set('Authorization', 'Bearer not.a.valid.jwt.payload');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('401 — token with wrong signature returns 401', async () => {
    const wrongSignatureToken = jwt.sign(
      { sub: 1, email: 'wrong_sig@test.com' },
      'completely_different_secret_key_at_least_32_chars_long'
    );
    const res = await api(app)
      .get('/api/enquiries/public')
      .set('Authorization', `Bearer ${wrongSignatureToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

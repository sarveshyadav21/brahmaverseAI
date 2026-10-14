'use strict';

const fs = require('fs');
const path = require('path');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');
const { PASSWORD_PEPPER, BCRYPT_ROUNDS } = require('../src/config/env');
const { signToken } = require('../src/utils/token');
const { seed } = require('../prisma/seed');

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const DEFAULT_PASSWORD = 'Password123!';
const AUDIT_STORE_PATH = path.resolve(__dirname, '.api-audit-store.jsonl');

// Compute password hash ONCE per test run using the app's pepper
let cachedPasswordHash = null;
function getSharedPasswordHash() {
  if (!cachedPasswordHash) {
    const salt = bcrypt.genSaltSync(BCRYPT_ROUNDS || 4);
    cachedPasswordHash = bcrypt.hashSync(DEFAULT_PASSWORD + PASSWORD_PEPPER, salt);
  }
  return cachedPasswordHash;
}

/**
 * Log target database (host and database name only, never credentials).
 */
function logConnectedDb() {
  const activeUrl = process.env.DATABASE_URL || '';
  try {
    const parsed = new URL(activeUrl.replace(/^postgresql:/, 'http:'));
    console.log(`[test:db] Connected to host: ${parsed.host}, database: ${parsed.pathname.replace(/^\//, '')}`);
  } catch {
    console.log('[test:db] Connected to database.');
  }
}

/**
 * Guard to prevent running tests against main database unless explicitly permitted.
 */
function verifyDatabaseTarget() {
  logConnectedDb();
  if (process.env.DATABASE_URL_TEST) {
    return;
  }
  if (process.env.ALLOW_TEST_ON_MAIN_DB === 'true') {
    return;
  }
  throw new Error(
    '[helpers:resetDb] Tests are configured to run against the main database, which will be truncated. ' +
    'Set ALLOW_TEST_ON_MAIN_DB=true in your environment or provide DATABASE_URL_TEST to proceed.'
  );
}

/**
 * Fast atomic database truncation.
 * Called once in beforeAll per test suite.
 */
async function resetDb({ seedAfter = false } = {}) {
  verifyDatabaseTarget();
  await prisma.$executeRawUnsafe('TRUNCATE "enquiries", "employees" RESTART IDENTITY CASCADE');
  if (seedAfter) {
    await seed(prisma);
  }
}

/**
 * Create a single employee directly in DB and return with JWT token.
 */
async function createEmployee(overrides = {}) {
  const email = overrides.email || `emp_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;
  const name = overrides.name || 'Test Employee';
  const password = overrides.password || DEFAULT_PASSWORD;

  const passwordHash =
    password === DEFAULT_PASSWORD
      ? getSharedPasswordHash()
      : bcrypt.hashSync(password + PASSWORD_PEPPER, bcrypt.genSaltSync(BCRYPT_ROUNDS || 4));

  const emp = await prisma.employee.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const token = signToken({ sub: emp.id, email: emp.email });
  return { ...emp, password, token };
}

/**
 * Create n employees in bulk using createMany and return array with JWT tokens.
 */
async function createEmployees(n, overrides = {}) {
  const passwordHash = getSharedPasswordHash();
  const emails = [];
  const employeesData = [];

  for (let i = 1; i <= n; i++) {
    const email = `user${i}_${RUN_ID}@test.com`;
    emails.push(email);
    employeesData.push({
      name: overrides.namePrefix ? `${overrides.namePrefix} ${i}` : `Employee ${i}`,
      email,
      passwordHash,
    });
  }

  await prisma.employee.createMany({
    data: employeesData,
    skipDuplicates: true,
  });

  const records = await prisma.employee.findMany({
    where: { email: { in: emails } },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { id: 'asc' },
  });

  return records.map((emp) => ({
    ...emp,
    password: DEFAULT_PASSWORD,
    token: signToken({ sub: emp.id, email: emp.email }),
  }));
}

/**
 * Create a single enquiry directly in DB.
 */
async function createEnquiry(overrides = {}) {
  const defaults = {
    name: 'Rahul Sharma',
    email: `enq_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`,
    courseInterest: 'Data Science',
    phone: '+91 98765 43210',
    message: 'Test enquiry message',
  };
  const data = { ...defaults, ...overrides };

  return prisma.enquiry.create({
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      courseInterest: true,
      message: true,
      claimedById: true,
      claimedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Create n enquiries in bulk using createMany.
 */
async function createEnquiries(n, overrides = {}) {
  const runId = Math.random().toString(36).slice(2, 7);
  const data = [];

  for (let i = 1; i <= n; i++) {
    data.push({
      name: `Lead ${i}`,
      email: `lead_${i}_${runId}@example.com`,
      phone: '+91 98765 00000',
      courseInterest: overrides.courseInterest || 'Data Science',
      message: overrides.message || `Bulk lead ${i}`,
      claimedById: overrides.claimedById || null,
      claimedAt: overrides.claimedAt || null,
    });
  }

  await prisma.enquiry.createMany({ data });

  return prisma.enquiry.findMany({
    where: { email: { contains: runId } },
    orderBy: { id: 'asc' },
  });
}

function sanitizePayload(data) {
  if (!data || typeof data !== 'object') return data;
  const copy = Array.isArray(data) ? [...data] : { ...data };
  for (const key of Object.keys(copy)) {
    if (/password|token|secret/i.test(key)) {
      copy[key] = '***[REDACTED]***';
    } else if (typeof copy[key] === 'object') {
      copy[key] = sanitizePayload(copy[key]);
    }
  }
  return copy;
}

function recordApiCall(entry) {
  try {
    fs.appendFileSync(AUDIT_STORE_PATH, JSON.stringify(entry) + '\n', 'utf8');
  } catch {
    // Non-fatal if logging fails
  }
}

/**
 * Supertest wrapper that records API calls into shared persistent store.
 */
function api(targetApp) {
  const req = request(targetApp);
  const wrap = (method) => {
    return (url, ...rest) => {
      const supertestReq = req[method](url, ...rest);
      const startTime = process.hrtime.bigint();
      const testName =
        typeof expect !== 'undefined' && expect.getState
          ? expect.getState().currentTestName || '[Setup / Hook]'
          : '[Setup / Hook]';

      let capturedBody = null;
      const originalSend = supertestReq.send.bind(supertestReq);
      supertestReq.send = function (data) {
        capturedBody = data;
        return originalSend(data);
      };

      const originalThen = supertestReq.then.bind(supertestReq);
      supertestReq.then = function (resolve, reject) {
        return originalThen(
          (res) => {
            const endTime = process.hrtime.bigint();
            const durationMs = Math.round(Number(endTime - startTime) / 1e4) / 100;
            const authHeader = supertestReq.header ? supertestReq.header['authorization'] : null;
            const sanitizedAuth = authHeader
              ? authHeader.length > 25
                ? `${authHeader.substring(0, 18)}...[REDACTED]`
                : authHeader
              : null;

            recordApiCall({
              testName,
              timestamp: new Date().toISOString(),
              method: method.toUpperCase(),
              url,
              auth: sanitizedAuth,
              inputBody: sanitizePayload(capturedBody),
              statusCode: res.status,
              durationMs,
              responseBody: sanitizePayload(res.body),
            });
            return resolve ? resolve(res) : res;
          },
          (err) => {
            if (reject) return reject(err);
            throw err;
          }
        );
      };

      return supertestReq;
    };
  };

  return {
    get: wrap('get'),
    post: wrap('post'),
    patch: wrap('patch'),
    put: wrap('put'),
    delete: wrap('delete'),
  };
}

module.exports = {
  api,
  resetDb,
  verifyDatabaseTarget,
  createEmployee,
  createEmployees,
  createEnquiry,
  createEnquiries,
  getSharedPasswordHash,
  prisma,
};

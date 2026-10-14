'use strict';

const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { PASSWORD_PEPPER, BCRYPT_ROUNDS } = require('../config/env');
const { signToken } = require('../utils/token');
const ApiError = require('../utils/ApiError');

// Fields returned for an employee — passwordHash is never included
const EMPLOYEE_SELECT = { id: true, name: true, email: true, createdAt: true };

/**
 * Register a new employee.
 * - Lowercases email (handled by validator's normalizeEmail)
 * - Peppers then bcrypt-hashes the password
 * - Returns the employee without passwordHash
 */
async function register({ name, email, password }) {
  const existing = await prisma.employee.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // Two-layer defense:
  // 1. Salt: Unique cryptographic salt generated per password (prevents rainbow table attacks)
  // 2. Pepper: Secret key held strictly in server environment (protects hash if DB leaks)
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  const peppered = password + PASSWORD_PEPPER;
  const passwordHash = await bcrypt.hash(peppered, salt);

  const employee = await prisma.employee.create({
    data: { name, email, passwordHash },
    select: EMPLOYEE_SELECT,
  });

  return employee;
}

/**
 * Verify credentials and return a signed JWT.
 * Uses the same generic error message for unknown email and wrong password
 * to prevent account enumeration.
 */
async function login({ email, password }) {
  const INVALID = 'Invalid credentials';

  const employee = await prisma.employee.findUnique({
    where: { email },
    // Fetch passwordHash only here — never returned to the caller
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  if (!employee) {
    // Perform a dummy hash to keep response time consistent (timing-safe)
    await bcrypt.hash(password + PASSWORD_PEPPER, BCRYPT_ROUNDS);
    throw new ApiError(401, INVALID);
  }

  const isMatch = await bcrypt.compare(password + PASSWORD_PEPPER, employee.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, INVALID);
  }

  const token = signToken({ sub: employee.id, email: employee.email });

  return {
    token,
    employee: { id: employee.id, name: employee.name, email: employee.email },
  };
}

module.exports = { register, login };

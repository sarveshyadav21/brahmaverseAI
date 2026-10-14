const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ override: true });

// Always ensure .env values take precedence over any shell session variables
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
  for (const [key, val] of Object.entries(envConfig)) {
    process.env[key] = val;
  }
  if (!envConfig.DATABASE_URL_TEST) {
    delete process.env.DATABASE_URL_TEST;
  }
}

// In test mode, swap DATABASE_URL for the test database or enforce ALLOW_TEST_ON_MAIN_DB guard
if (process.env.NODE_ENV === 'test') {
  if (process.env.DATABASE_URL_TEST) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
    process.env.DATABASE_URL_UNPOOLED =
      process.env.DATABASE_URL_TEST_UNPOOLED || process.env.DATABASE_URL_TEST;
  } else if (process.env.ALLOW_TEST_ON_MAIN_DB === 'true') {
    // Allowed to run on main database per explicit user opt-in
  } else {
    throw new Error(
      '[env] Tests are configured to run against the main database, which will be truncated. ' +
      'To allow running tests against the main database, set ALLOW_TEST_ON_MAIN_DB=true in your environment, ' +
      'or configure DATABASE_URL_TEST with a dedicated test database.'
    );
  }
}

const required = ['DATABASE_URL', 'DATABASE_URL_UNPOOLED', 'JWT_SECRET', 'PASSWORD_PEPPER'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }
}

// Enforce minimum secret lengths outside of test to prevent weak configs
if (process.env.NODE_ENV !== 'test') {
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('[env] JWT_SECRET must be at least 32 characters');
  }
  if (process.env.PASSWORD_PEPPER.length < 32) {
    throw new Error('[env] PASSWORD_PEPPER must be at least 32 characters');
  }
}

const defaultRounds = process.env.NODE_ENV === 'test' ? 4 : 10;
const BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS
  ? parseInt(process.env.BCRYPT_ROUNDS, 10)
  : defaultRounds;

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  PASSWORD_PEPPER: process.env.PASSWORD_PEPPER,
  BCRYPT_ROUNDS,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

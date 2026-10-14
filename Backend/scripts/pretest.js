'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const dotenv = require('dotenv');
const { execSync } = require('child_process');

// Delete throwaway diagnostic script if it exists
const diagPath = path.resolve(__dirname, 'diagnoseLatency.js');
if (fs.existsSync(diagPath)) {
  try {
    fs.unlinkSync(diagPath);
    console.log('[pretest] Cleaned up throwaway diagnostic script.');
  } catch {}
}

// Purge any stale terminal session variable if commented out in .env
const envPath = path.resolve(process.cwd(), '.env');
let testDbUrl = process.env.DATABASE_URL_TEST;
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
  testDbUrl = envConfig.DATABASE_URL_TEST || undefined;
  if (!testDbUrl) {
    delete process.env.DATABASE_URL_TEST;
  }
}

const targetUrl = testDbUrl || process.env.DATABASE_URL;

if (!targetUrl) {
  console.error('[pretest] Error: Neither DATABASE_URL_TEST nor DATABASE_URL is set.');
  process.exit(1);
}

try {
  const parsed = new URL(targetUrl.replace(/^postgresql:/, 'http:'));
  console.log(`[pretest] Running prisma migrate deploy against: ${parsed.host} (${parsed.pathname.replace(/^\//, '')})`);
} catch {
  console.log('[pretest] Running prisma migrate deploy...');
}

const env = {
  ...process.env,
  DATABASE_URL: targetUrl,
  DATABASE_URL_UNPOOLED: targetUrl,
};

try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
  console.log('[pretest] Migrations applied successfully.\n');
} catch {
  // If the database already had tables pushed (P3005), baseline the initial migration
  console.log('[pretest] Schema exists without migration history — baselining initial migration...');
  try {
    execSync('npx prisma migrate resolve --applied 20261014000000_init', { stdio: 'inherit', env });
    execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
    console.log('[pretest] Migrations baselined and deployed successfully.\n');
  } catch (err) {
    console.error('[pretest] Migration deployment failed:', err.message);
    process.exit(1);
  }
}

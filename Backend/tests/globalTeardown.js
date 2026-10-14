'use strict';

const prisma = require('../src/config/prisma');
const { seed } = require('../prisma/seed');

module.exports = async function globalTeardown() {
  if (process.env.DATABASE_URL_TEST) {
    console.log('\n[jest:globalTeardown] Dedicated test database in use (DATABASE_URL_TEST). Skipping re-seed.');
    await prisma.$disconnect();
    return;
  }

  console.log('\n[jest:globalTeardown] Restoring main database to seeded state...');
  try {
    await prisma.$executeRawUnsafe('TRUNCATE "enquiries", "employees" RESTART IDENTITY CASCADE');
    await seed(prisma);
    console.log('[jest:globalTeardown] Main database restored to seeded state.');
  } catch (err) {
    console.warn('[jest:globalTeardown] Warning: Failed to restore database:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
};

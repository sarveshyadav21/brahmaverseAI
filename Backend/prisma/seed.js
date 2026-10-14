'use strict';

const bcrypt = require('bcryptjs');
const defaultPrisma = require('../src/config/prisma');
require('dotenv').config();
const PASSWORD_PEPPER =
  process.env.PASSWORD_PEPPER || '8e1c3b5a7d9f2e4b6c8a0d2f4b6e8a0c2d4f6a8b0c2e4f6a8b0d2e4f6a8b0c2e';

/**
 * Seed database with demo counselors and initial enquiries.
 * Can be called programmatically (e.g. from tests or global teardown) or via CLI.
 */
async function seed(prisma = defaultPrisma) {
  console.log('[seed] Seeding database...');

  // Reset existing records atomically
  await prisma.$executeRawUnsafe('TRUNCATE "enquiries", "employees" RESTART IDENTITY CASCADE');

  // Pre-hash password once
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!' + PASSWORD_PEPPER, salt);

  const counselor1 = await prisma.employee.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@crm.com',
      passwordHash,
    },
  });

  const counselor2 = await prisma.employee.create({
    data: {
      name: 'Rohan Gupta',
      email: 'rohan@crm.com',
      passwordHash,
    },
  });

  console.log('[seed] Created 2 counselors:');
  console.log('       - priya@crm.com / Password123!');
  console.log('       - rohan@crm.com / Password123!');

  // Seed sample unclaimed enquiries in bulk via createMany
  const enquiries = [
    {
      name: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      phone: '+91 98765 43210',
      courseInterest: 'Full Stack Web Development',
      message: 'Looking for the next batch starting in November.',
    },
    {
      name: 'Ananya Iyer',
      email: 'ananya.iyer@example.com',
      phone: '+91 98765 12345',
      courseInterest: 'Data Science & Machine Learning',
      message: 'Interested in weekend online live classes.',
    },
    {
      name: 'Devansh Verma',
      email: 'devansh.v@example.com',
      phone: '+91 91234 56789',
      courseInterest: 'Cloud Computing & DevOps',
      message: 'Need placement assistance details.',
    },
    {
      name: 'Sneha Kulkarni',
      email: 'sneha.k@example.com',
      phone: '+91 99887 76655',
      courseInterest: 'UI/UX Design',
      message: 'Can I attend a free demo session first?',
    },
    {
      name: 'Karan Mehra',
      email: 'karan.m@example.com',
      phone: '+91 94567 89012',
      courseInterest: 'Cybersecurity Fundamentals',
      message: 'Does this cover ethical hacking certification prep?',
    },
  ];

  await prisma.enquiry.createMany({ data: enquiries });

  // Seed one enquiry claimed by counselor1
  await prisma.enquiry.create({
    data: {
      name: 'Vikram Malhotra',
      email: 'vikram.m@example.com',
      phone: '+91 93214 56780',
      courseInterest: 'Artificial Intelligence & Generative AI',
      message: 'Already spoken on call, following up.',
      claimedById: counselor1.id,
      claimedAt: new Date(),
    },
  });

  console.log('[seed] Seeded 5 unclaimed enquiries and 1 claimed enquiry.');
  console.log('[seed] Seeding completed successfully!');
  return { counselor1, counselor2 };
}

if (require.main === module) {
  seed(defaultPrisma)
    .catch((e) => {
      console.error('[seed] Error while seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      await defaultPrisma.$disconnect();
    });
}

module.exports = { seed };

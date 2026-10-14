'use strict';

const prisma = require('../src/config/prisma');

async function checkSeedState() {
  const employeeCount = await prisma.employee.count();
  const enquiryCount = await prisma.enquiry.count();
  const employees = await prisma.employee.findMany({
    select: { id: true, name: true, email: true },
  });
  const enquiries = await prisma.enquiry.findMany({
    select: { id: true, name: true, courseInterest: true, claimedById: true },
  });

  console.log('\n--- Database State Verification ---');
  console.log(`Total Employees : ${employeeCount}`);
  employees.forEach((e) => console.log(`  - [ID ${e.id}] ${e.name} (${e.email})`));

  console.log(`Total Enquiries : ${enquiryCount}`);
  enquiries.forEach((q) =>
    console.log(
      `  - [ID ${q.id}] ${q.name} - ${q.courseInterest} (claimedById: ${q.claimedById ?? 'None'})`
    )
  );
  console.log('-----------------------------------\n');
}

if (require.main === module) {
  checkSeedState().finally(() => prisma.$disconnect());
}

module.exports = { checkSeedState };

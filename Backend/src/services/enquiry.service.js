'use strict';

const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { parsePaginationParams, buildPagination } = require('../utils/pagination');

// Consistent field selection — passwordHash never included
const ENQUIRY_SELECT = {
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
};

const ORDER_BY = [{ createdAt: 'desc' }, { id: 'desc' }];

/** Create a new enquiry from the public form */
async function submitEnquiry(data) {
  return prisma.enquiry.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      courseInterest: data.courseInterest,
      message: data.message || null,
    },
    select: ENQUIRY_SELECT,
  });
}

/** Paginated list of unclaimed (public) enquiries */
async function getPublicEnquiries(query) {
  const { page, limit, skip } = parsePaginationParams(query);
  const where = { claimedById: null };

  const [enquiries, total] = await prisma.$transaction([
    prisma.enquiry.findMany({ where, select: ENQUIRY_SELECT, orderBy: ORDER_BY, skip, take: limit }),
    prisma.enquiry.count({ where }),
  ]);

  return { data: enquiries, pagination: buildPagination(total, page, limit) };
}

/** Paginated list of enquiries claimed by the logged-in employee */
async function getMyEnquiries(employeeId, query) {
  const { page, limit, skip } = parsePaginationParams(query);
  const where = { claimedById: employeeId };

  const [enquiries, total] = await prisma.$transaction([
    prisma.enquiry.findMany({ where, select: ENQUIRY_SELECT, orderBy: ORDER_BY, skip, take: limit }),
    prisma.enquiry.count({ where }),
  ]);

  return { data: enquiries, pagination: buildPagination(total, page, limit) };
}

/**
 * Atomic + idempotent claim.
 *
 * Uses a single conditional UPDATE (WHERE claimedById IS NULL).
 * PostgreSQL serialises concurrent UPDATEs on the same row — the second
 * request re-evaluates the WHERE clause, finds it false, and updates 0 rows.
 * No explicit transaction or SELECT FOR UPDATE needed.
 *
 * Outcomes:
 *   - count=1, claimedById=me  → we won (200)
 *   - count=0, claimedById=me  → idempotent retry by same user (200)
 *   - count=0, claimedById≠me  → someone else won (409)
 *   - enquiry missing          → 404
 */
async function claimEnquiry(id, employeeId) {
  await prisma.enquiry.updateMany({
    where: { id, claimedById: null },
    data: { claimedById: employeeId, claimedAt: new Date() },
  });

  const enquiry = await prisma.enquiry.findUnique({ where: { id }, select: ENQUIRY_SELECT });

  if (!enquiry) throw new ApiError(404, 'Enquiry not found.');
  if (enquiry.claimedById === employeeId) return enquiry; // won, or idempotent retry
  throw new ApiError(409, 'This enquiry has already been claimed by another counselor.');
}

module.exports = { submitEnquiry, getPublicEnquiries, getMyEnquiries, claimEnquiry };

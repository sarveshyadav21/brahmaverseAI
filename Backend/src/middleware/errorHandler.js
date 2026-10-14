'use strict';

const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // --- Known operational errors ---
  if (err instanceof ApiError) {
    const body = { success: false, message: err.message };
    if (err.errors && err.errors.length > 0) body.errors = err.errors;
    return res.status(err.statusCode).json(body);
  }

  // --- Prisma unique constraint violation (P2002) → 409 ---
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
  }

  // --- Prisma record not found (P2025) → 404 ---
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  // --- Unexpected errors: log server-side, return generic message ---
  if (process.env.NODE_ENV !== 'test') {
    console.error('[ERROR]', { method: req.method, url: req.originalUrl, err });
  }

  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
  });
}

module.exports = errorHandler;

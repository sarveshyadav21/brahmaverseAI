'use strict';

/**
 * Wraps an async Express route handler so rejected promises are passed to next().
 * Removes the need for try/catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

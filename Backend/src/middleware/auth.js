'use strict';

const { verifyToken } = require('../utils/token');
const ApiError = require('../utils/ApiError');

/**
 * Middleware: verify Bearer JWT and set req.employee = { id, email }.
 */
function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Authentication required. Provide a Bearer token.'));
    }

    const token = header.slice(7);
    const decoded = verifyToken(token); // throws ApiError on failure

    req.employee = { id: decoded.sub, email: decoded.email };
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = auth;

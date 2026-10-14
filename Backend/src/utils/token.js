'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const ApiError = require('./ApiError');

/**
 * Sign a JWT with HS256.
 * @param {{ sub: number, email: string }} payload
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify a JWT. Throws ApiError(401) for expired or invalid tokens.
 * @param {string} token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token has expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid token. Please log in again.');
  }
}

module.exports = { signToken, verifyToken };

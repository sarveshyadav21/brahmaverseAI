'use strict';

/**
 * apiLogger.js
 * In-memory collector for API requests executed during tests.
 * Captures request inputs, response outputs, status codes, and execution durations.
 */

const records = [];

function getActiveTestName() {
  try {
    if (typeof expect !== 'undefined' && typeof expect.getState === 'function') {
      const state = expect.getState();
      if (state && state.currentTestName) {
        return state.currentTestName;
      }
    }
  } catch {
    // fallback if outside expect scope
  }
  return '[Setup / Hook]';
}

function apiLoggingMiddleware(req, res, next) {
  const startTime = process.hrtime.bigint();
  const testName = getActiveTestName();

  // Capture original methods to intercept response body
  const originalSend = res.send;
  const originalJson = res.json;

  let responseBody = null;

  res.send = function (body) {
    if (responseBody === null) {
      try {
        responseBody = typeof body === 'string' ? JSON.parse(body) : body;
      } catch {
        responseBody = body;
      }
    }
    return originalSend.apply(this, arguments);
  };

  res.json = function (json) {
    if (responseBody === null) {
      responseBody = json;
    }
    return originalJson.apply(this, arguments);
  };

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6;

    // Sanitize authorization header for readability
    const authHeader = req.headers['authorization'];
    const sanitizedAuth = authHeader
      ? authHeader.length > 25
        ? `${authHeader.substring(0, 18)}...[truncated]`
        : authHeader
      : null;

    records.push({
      testName,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      query: Object.keys(req.query || {}).length > 0 ? req.query : null,
      inputBody: req.body && Object.keys(req.body).length > 0 ? req.body : null,
      auth: sanitizedAuth,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      responseBody,
    });
  });

  next();
}

function getRecords() {
  return [...records];
}

function clearRecords() {
  records.length = 0;
}

module.exports = {
  apiLoggingMiddleware,
  getRecords,
  clearRecords,
};

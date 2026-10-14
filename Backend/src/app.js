'use strict';

// Must be first — fails fast if required env vars are missing
require('./config/env');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const prisma = require('./config/prisma');
const { CORS_ORIGIN, NODE_ENV } = require('./config/env');

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '10kb' }));

// ── Test API Audit Logger (captures inputs, outputs, time in test mode) ───────
if (NODE_ENV === 'test') {
  try {
    const { apiLoggingMiddleware } = require('../tests/apiLogger');
    app.use(apiLoggingMiddleware);
  } catch {
    // Ignore in non-test environments
  }
}

// ── Request logging (skipped in test) ────────────────────────────────────────
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ success: true, data: { status: 'ok' } });
  } catch {
    res.status(503).json({ success: false, message: 'Database unavailable' });
  }
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 + error handler (must be last) ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;

'use strict';

const app = require('./app');
const { PORT } = require('./config/env');
const prisma = require('./config/prisma');

const server = app.listen(PORT, () => {
  console.log(`[server] CRM Backend running → http://localhost:${PORT}`);
  console.log(`[server] Health check       → http://localhost:${PORT}/health`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n[server] ${signal} received — shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[server] Shutdown complete.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

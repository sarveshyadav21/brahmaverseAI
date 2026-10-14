'use strict';

const { PrismaClient } = require('@prisma/client');
const { DATABASE_URL } = require('./env');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;

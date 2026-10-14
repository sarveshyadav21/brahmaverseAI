module.exports = {
  testEnvironment: 'node',
  // 15s when local test DB is active, 120s for cloud DB over network
  testTimeout: process.env.DATABASE_URL_TEST ? 15000 : 120000,
  // Load .env before any test file runs
  setupFiles: ['dotenv/config'],
  // Custom reporter outputs test-execution.log with detailed API inputs/outputs and timings
  reporters: ['default', '<rootDir>/tests/testReporter.js'],
  globalTeardown: '<rootDir>/tests/globalTeardown.js',
};

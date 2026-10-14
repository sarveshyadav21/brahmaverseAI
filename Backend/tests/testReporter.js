'use strict';

const fs = require('fs');
const path = require('path');

class TestAuditReporter {
  constructor(globalConfig, options) {
    this.globalConfig = globalConfig;
    this.options = options;
    this.logFilePath = path.resolve(process.cwd(), 'test-execution.log');
    this.storePath = path.resolve(__dirname, '.api-audit-store.jsonl');
  }

  onRunStart() {
    try {
      if (fs.existsSync(this.storePath)) {
        fs.unlinkSync(this.storePath);
      }
    } catch {
      // Non-fatal
    }
  }

  onRunComplete(contexts, results) {
    const apiRecords = [];
    if (fs.existsSync(this.storePath)) {
      try {
        const lines = fs.readFileSync(this.storePath, 'utf8').split('\n');
        for (const line of lines) {
          if (line.trim()) {
            apiRecords.push(JSON.parse(line));
          }
        }
      } catch (err) {
        console.warn('[Audit Reporter] Warning reading store:', err.message);
      }
    }

    // Map API records by testName for direct correlation
    const apiByTest = new Map();
    const setupRecords = [];

    for (const rec of apiRecords) {
      if (!rec.testName || rec.testName === '[Setup / Hook]') {
        setupRecords.push(rec);
      } else {
        if (!apiByTest.has(rec.testName)) {
          apiByTest.set(rec.testName, []);
        }
        apiByTest.get(rec.testName).push(rec);
      }
    }

    const lines = [];
    const border = '='.repeat(100);
    const doubleSub = '═'.repeat(100);

    lines.push(border);
    lines.push('                          CRM BACKEND — TEST EXECUTION & API AUDIT REPORT');
    lines.push(border);
    lines.push(`Generated At         : ${new Date().toLocaleString()} (${new Date().toISOString()})`);
    lines.push(`Total Duration       : ${(results.startTime ? ((Date.now() - results.startTime) / 1000).toFixed(2) : 0)} s`);
    lines.push(`Test Suites          : ${results.numPassedTestSuites} passed, ${results.numFailedTestSuites} failed, ${results.numTotalTestSuites} total`);
    lines.push(`Test Cases           : ${results.numPassedTests} passed, ${results.numFailedTests} failed, ${results.numTotalTests} total`);
    lines.push(`API Calls Executed   : ${apiRecords.length} total calls captured`);
    lines.push(border);
    lines.push('');

    // Iterate test suites
    for (const suite of results.testResults) {
      const suiteName = path.relative(process.cwd(), suite.testFilePath);
      const suiteStatus = suite.numFailingTests === 0 ? 'PASSED' : 'FAILED';
      const suiteDuration = suite.perfStats ? `${((suite.perfStats.end - suite.perfStats.start) / 1000).toFixed(2)}s` : 'N/A';

      lines.push(doubleSub);
      lines.push(`[SUITE] ${suiteName}  —  ${suiteStatus} (${suiteDuration})`);
      lines.push(doubleSub);

      for (const test of suite.testResults) {
        const isPass = test.status === 'passed';
        const symbol = isPass ? '✔ [PASS]' : '✖ [FAIL]';
        const duration = typeof test.duration === 'number' ? `${test.duration} ms` : 'N/A';

        lines.push('');
        lines.push(`  ${symbol} ${test.fullName} (${duration})`);

        if (!isPass && test.failureMessages && test.failureMessages.length > 0) {
          lines.push('    ┌─ FAILURE DETAILS:');
          for (const msg of test.failureMessages) {
            const cleanMsg = msg.replace(/\u001b\[[0-9;]*m/g, ''); // strip ansi codes
            for (const l of cleanMsg.split('\n')) {
              lines.push(`    │  ${l}`);
            }
          }
          lines.push('    └────────────────────────────────────────────────────────────────────────────────────────');
        }

        // Associated API calls
        const calls = apiByTest.get(test.fullName) || [];
        if (calls.length > 0) {
          lines.push('    ┌─ API REQUEST & RESPONSE AUDIT:');
          calls.forEach((c, idx) => {
            lines.push(`    │  #${idx + 1} ${c.method} ${c.url}  →  Status: ${c.statusCode} (${c.durationMs} ms)`);
            if (c.auth) {
              lines.push(`    │     Authorization : ${c.auth}`);
            }
            if (c.inputBody) {
              lines.push(`    │     Input Body    : ${JSON.stringify(c.inputBody, null, 2).replace(/\n/g, '\n    │                     ')}`);
            } else {
              lines.push(`    │     Input Body    : [None / Empty]`);
            }
            if (c.responseBody !== null && c.responseBody !== undefined) {
              lines.push(`    │     Output Response: ${JSON.stringify(c.responseBody, null, 2).replace(/\n/g, '\n    │                      ')}`);
            } else {
              lines.push(`    │     Output Response: [Empty Body]`);
            }
            if (idx < calls.length - 1) {
              lines.push('    │  ' + '-'.repeat(80));
            }
          });
          lines.push('    └────────────────────────────────────────────────────────────────────────────────────────');
        } else {
          lines.push('    [No direct API call captured under this test case]');
        }
      }
      lines.push('');
    }

    // Setup & Hook API calls
    if (setupRecords.length > 0) {
      lines.push(doubleSub);
      lines.push('[SETUP & HOOK API CALLS (beforeAll / afterAll / helper calls)]');
      lines.push(doubleSub);
      setupRecords.forEach((c, idx) => {
        lines.push(`  #${idx + 1} ${c.method} ${c.url}  →  Status: ${c.statusCode} (${c.durationMs} ms)`);
        if (c.auth) lines.push(`     Authorization : ${c.auth}`);
        if (c.inputBody) lines.push(`     Input Body    : ${JSON.stringify(c.inputBody)}`);
        if (c.responseBody) lines.push(`     Output Body   : ${JSON.stringify(c.responseBody)}`);
        lines.push('');
      });
    }

    lines.push(border);
    lines.push('                                    END OF AUDIT REPORT');
    lines.push(border);

    const logContent = lines.join('\n');
    fs.writeFileSync(this.logFilePath, logContent, 'utf-8');

    // Clean up temporary store
    try {
      if (fs.existsSync(this.storePath)) {
        fs.unlinkSync(this.storePath);
      }
    } catch {}

    console.log(`\n📄 [Audit Reporter] Test & API execution log successfully written to:`);
    console.log(`   ${this.logFilePath}\n`);
  }
}

module.exports = TestAuditReporter;

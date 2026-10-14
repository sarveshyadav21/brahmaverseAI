'use strict';

const app = require('../src/app');
const { api } = require('./helpers');
const fs = require('fs');
const path = require('path');

async function test() {
  console.log('Testing api(app)...');
  const res = await api(app).get('/health');
  console.log('Got response:', res.status, res.body);

  const storePath = path.resolve(__dirname, '.api-audit-store.jsonl');
  if (fs.existsSync(storePath)) {
    console.log('Store file contents:');
    console.log(fs.readFileSync(storePath, 'utf8'));
  } else {
    console.log('Store file DOES NOT EXIST!');
  }
}

test();

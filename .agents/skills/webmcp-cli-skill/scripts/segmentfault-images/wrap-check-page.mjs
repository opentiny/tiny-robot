#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runWrapCheckPage } from '../shared/wrap-check-page.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
runWrapCheckPage(process.argv, {
  checkPagePath: path.join(__dirname, 'check-page.js'),
});

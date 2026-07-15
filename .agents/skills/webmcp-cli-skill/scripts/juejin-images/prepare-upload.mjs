#!/usr/bin/env node
import { platform } from './platform.mjs';
import { runPrepareUpload } from '../shared/prepare-upload.mjs';

runPrepareUpload(process.argv, platform);

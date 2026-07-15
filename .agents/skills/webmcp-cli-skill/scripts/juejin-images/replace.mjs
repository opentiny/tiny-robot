#!/usr/bin/env node
import { platform } from './platform.mjs';
import { runReplace } from '../shared/replace.mjs';

runReplace(process.argv, platform);

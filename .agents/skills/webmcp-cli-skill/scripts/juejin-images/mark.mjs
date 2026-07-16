#!/usr/bin/env node
import { platform } from './platform.mjs';
import { runMark } from '../shared/mark.mjs';

runMark(process.argv, platform);

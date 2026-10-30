const { existsSync, readFileSync } = require('node:fs');
const { parseEnv } = require('node:util');

const DEFAULT_DEEPSEEK_API_BASE_URL = 'https://api.deepseek.com';

function readDeepSeekEnv(envPath) {
  if (!existsSync(envPath)) return {};
  return parseEnv(readFileSync(envPath, 'utf8'));
}

function normalizeTarget(value) {
  const url = new URL(value || DEFAULT_DEEPSEEK_API_BASE_URL);
  if (url.protocol !== 'https:') {
    throw new Error('DEEPSEEK_API_BASE_URL must use HTTPS.');
  }
  url.pathname = url.pathname.replace(/\/+$/, '');
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

function createDeepSeekProxyConfig({ envPath }) {
  const env = readDeepSeekEnv(envPath);
  const apiKey = env.DEEPSEEK_API_KEY?.trim();
  const proxy = {
    target: normalizeTarget(env.DEEPSEEK_API_BASE_URL),
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/api/deepseek': '' },
  };

  if (apiKey) {
    proxy.headers = { Authorization: `Bearer ${apiKey}` };
  }

  return { '/api/deepseek': proxy };
}

module.exports = { createDeepSeekProxyConfig, readDeepSeekEnv };

const assert = require('node:assert/strict');
const { existsSync, mkdtempSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const test = require('node:test');

function loadProxyModule() {
  const modulePath = join(__dirname, 'deepseek-proxy.cjs');
  return existsSync(modulePath) ? require(modulePath) : {};
}

test('loads the DeepSeek key into the dev proxy instead of browser configuration', () => {
  const { createDeepSeekProxyConfig } = loadProxyModule();
  assert.equal(typeof createDeepSeekProxyConfig, 'function');

  const directory = mkdtempSync(join(tmpdir(), 'tr-chat-deepseek-'));
  const envPath = join(directory, '.env.local');
  writeFileSync(
    envPath,
    'DEEPSEEK_API_KEY="sk-test-only"\nDEEPSEEK_API_BASE_URL=https://api.deepseek.com\n',
  );

  try {
    assert.deepEqual(createDeepSeekProxyConfig({ envPath }), {
      '/api/deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        secure: true,
        headers: { Authorization: 'Bearer sk-test-only' },
        pathRewrite: { '^/api/deepseek': '' },
      },
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('keeps the proxy available without fabricating an Authorization header when the key is absent', () => {
  const { createDeepSeekProxyConfig } = loadProxyModule();
  assert.equal(typeof createDeepSeekProxyConfig, 'function');

  const config = createDeepSeekProxyConfig({ envPath: join(tmpdir(), 'missing-deepseek.env') });
  assert.deepEqual(config['/api/deepseek'], {
    target: 'https://api.deepseek.com',
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/api/deepseek': '' },
  });
});

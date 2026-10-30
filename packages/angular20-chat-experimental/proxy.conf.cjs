const { join } = require('node:path');
const { createDeepSeekProxyConfig } = require('./deepseek-proxy.cjs');

module.exports = createDeepSeekProxyConfig({ envPath: join(__dirname, '.env.local') });

import { resolve } from 'node:path'
import process from 'node:process'
import { configDotenv } from 'dotenv'
import { loadEnv, mergeConfig } from 'vite'
import { createDevProxyConfig } from './dev-proxy.ts'
import baseConfig from './vite.config.base.ts'

// 加载 dev.env 文件
configDotenv({
  path: resolve(import.meta.dirname, '../dev.env'),
})

// 加载环境变量（development 模式会读取 .env.development 和 .env）
const env = loadEnv('development', process.cwd())
const useMock = env.VITE_USE_MOCK === 'true'
const proxyConfig = createDevProxyConfig(env, useMock)

export default mergeConfig(
  {
    mode: 'development',
    server: {
      open: process.env.CI !== 'true',
      fs: {
        strict: true,
      },
      proxy: {
        ...proxyConfig,
      },
    },
    define: {
      // 确保 VITE_LOWCODE_DESIGNER_ENABLED 被注入到客户端代码
      'import.meta.env.VITE_LOWCODE_DESIGNER_ENABLED': JSON.stringify(
        process.env.VITE_LOWCODE_DESIGNER_ENABLED || 'false',
      ),
      // 确保 VITE_LOWCODE_DESIGNER_URL 被注入到客户端代码
      'import.meta.env.VITE_LOWCODE_DESIGNER_URL': JSON.stringify(
        process.env.VITE_LOWCODE_DESIGNER_URL || 'http://localhost:8090',
      ),
      // 确保可选功能开关被注入到客户端代码
      'import.meta.env.VITE_TINY_EDITOR_ENABLED': JSON.stringify(
        process.env.VITE_TINY_EDITOR_ENABLED || 'false',
      ),
      // 模拟登录开关：仅前端项目为 true，登录不请求后端接口
      'import.meta.env.VITE_MOCK_LOGIN_ENABLED': JSON.stringify(
        process.env.VITE_MOCK_LOGIN_ENABLED || 'false',
      ),
    },
    plugins: [],
  },
  baseConfig,
)

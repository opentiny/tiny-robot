import { resolve } from 'node:path'
import process from 'node:process'
import { configDotenv } from 'dotenv'
import { mergeConfig } from 'vite'
import { vueManualChunk } from './manual-chunks.ts'
import configCompressPlugin from './plugin/compress.ts'
import configVisualizerPlugin from './plugin/visualizer.ts'
import baseConfig from './vite.config.base.ts'

// 加载 dev.env 文件（与 vite.config.dev.ts 保持一致），
// 让仓库内默认的功能开关在 prod 构建时同样生效；CI 通过环境变量显式设置时优先生效
configDotenv({
  path: resolve(import.meta.dirname, '../dev.env'),
})

export default mergeConfig(
  {
    mode: 'production',
    base: process.env.VITE_BASE || '/',
    plugins: [configCompressPlugin('gzip'), configVisualizerPlugin()],
    define: {
      // 确保环境变量被注入到客户端代码
      'import.meta.env.VITE_LOWCODE_DESIGNER_ENABLED': JSON.stringify(
        process.env.VITE_LOWCODE_DESIGNER_ENABLED || 'false',
      ),
      'import.meta.env.VITE_LOWCODE_DESIGNER_URL': JSON.stringify(
        process.env.VITE_LOWCODE_DESIGNER_URL || '/designer',
      ),
      'import.meta.env.VITE_TINY_EDITOR_ENABLED': JSON.stringify(
        process.env.VITE_TINY_EDITOR_ENABLED || 'false',
      ),
      // 模拟登录开关：仅前端项目为 true，登录不请求后端接口
      'import.meta.env.VITE_MOCK_LOGIN_ENABLED': JSON.stringify(
        process.env.VITE_MOCK_LOGIN_ENABLED || 'false',
      ),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: vueManualChunk,
        },
      },
      chunkSizeWarningLimit: 2000,
    },
  },
  baseConfig,
)

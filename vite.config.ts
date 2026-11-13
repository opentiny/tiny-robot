import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { demoModel } from './server/model'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'DASHSCOPE_')
  return {
    plugins: [
      vue(),
      demoModel({
        apiKey: env.DASHSCOPE_API_KEY?.trim() ?? '',
        baseUrl: env.DASHSCOPE_BASE_URL?.trim() ?? '',
        model: env.DASHSCOPE_MODEL?.trim() ?? '',
      }),
    ],
  }
})

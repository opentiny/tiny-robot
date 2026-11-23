import { mergeConfig } from 'vite'
import baseConfig from './vite.config.preview.base.ts'

export default mergeConfig(
  {
    mode: 'development',
    server: {
      open: true,
      fs: {
        strict: true,
      },
    },
    plugins: [],
  },
  baseConfig,
)

import process from 'node:process'
import { mergeConfig } from 'vite'
import { vueManualChunk } from './manual-chunks.ts'
import configCompressPlugin from './plugin/compress.ts'
import configVisualizerPlugin from './plugin/visualizer.ts'
import baseConig from './vite.config.preview.base.ts'

export default mergeConfig(
  {
    mode: 'pages',
    mock: true,
    base: `${process.env.static_url_prefix}/tiny-pro-vue/${process.env.staticReleaseVersion}/vue-pro/pages`,
    plugins: [
      configCompressPlugin('gzip'),
      configVisualizerPlugin(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: vueManualChunk,
        },
      },
      chunkSizeWarningLimit: 2000,
    },
  },
  baseConig,
)

import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { generateVanillaTheme } from './scripts/vanilla-theme.mjs'

generateVanillaTheme()

function verifyVanillaGraph(): Plugin {
  return {
    name: 'tiny-robot-vanilla-browser-graph-check',
    generateBundle(_outputOptions, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        if (output.imports.length || output.dynamicImports.length) {
          throw new Error(`Vanilla browser output must be a single file: ${output.fileName}`)
        }
        for (const moduleId of Object.keys(output.modules)) {
          if (/node_modules\/(?:vue|@vue|@floating-ui)/.test(moduleId)) {
            throw new Error(`Vanilla browser output has a framework dependency: ${moduleId}`)
          }
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [verifyVanillaGraph()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/vanilla/umd.ts'),
      name: 'TinyRobotVanilla',
      formats: ['umd', 'iife'],
      fileName: (format) => `vanilla/vanilla.${format === 'iife' ? 'global' : format}.js`,
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    sourcemap: false,
  },
})

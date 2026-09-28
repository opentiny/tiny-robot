import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

function emitVanillaStyle(): Plugin {
  return {
    name: 'tiny-robot-vanilla-style',
    generateBundle() {
      const source = readFileSync(resolve(__dirname, 'src/vanilla/quick-assist/style.css'), 'utf8')
      this.emitFile({ type: 'asset', fileName: 'vanilla/style.css', source })
    },
  }
}

function verifyVanillaGraph(): Plugin {
  return {
    name: 'tiny-robot-vanilla-graph-check',
    generateBundle(_outputOptions, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        if (output.imports.length || output.dynamicImports.length) {
          throw new Error(`QuickAssist vanilla output must be a single file: ${output.fileName}`)
        }
        for (const moduleId of Object.keys(output.modules)) {
          if (/node_modules\/(?:vue|@vue|@floating-ui)/.test(moduleId)) {
            throw new Error(`QuickAssist vanilla output has a framework dependency: ${moduleId}`)
          }
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [emitVanillaStyle(), verifyVanillaGraph()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/vanilla/index.ts'),
      formats: ['es'],
      fileName: () => 'vanilla/index.js',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'vanilla/index.js',
        chunkFileNames: 'vanilla/[name].js',
        assetFileNames: 'vanilla/[name][extname]',
        inlineDynamicImports: true,
      },
    },
    sourcemap: false,
  },
})

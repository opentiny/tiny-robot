import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

function verifyVanillaGraph(): Plugin {
  return {
    name: 'tiny-robot-vanilla-umd-graph-check',
    generateBundle(_outputOptions, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        if (output.imports.length || output.dynamicImports.length) {
          throw new Error(`Vanilla UMD output must be a single file: ${output.fileName}`)
        }
        for (const moduleId of Object.keys(output.modules)) {
          if (/node_modules\/(?:vue|@vue|@floating-ui)/.test(moduleId)) {
            throw new Error(`Vanilla UMD output has a framework dependency: ${moduleId}`)
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
      formats: ['umd'],
      fileName: () => 'vanilla/vanilla.umd.js',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'vanilla/vanilla.umd.js',
        inlineDynamicImports: true,
      },
    },
    sourcemap: false,
  },
})

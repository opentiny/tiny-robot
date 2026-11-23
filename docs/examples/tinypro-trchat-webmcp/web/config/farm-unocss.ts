import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { JsPlugin } from '@farmfe/core'
import { tsImport } from 'tsx/esm/api'
import { createGenerator, type UnoGenerator, type UserConfig } from 'unocss'

const VIRTUAL_ID = 'virtual:uno.css'
const RESOLVED_ID = '/__virtual__/uno.css'
const SOURCE_EXTENSIONS = new Set(['.vue', '.ts', '.tsx', '.js', '.jsx', '.html'])

async function collectSources(dir: string, files: string[]) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist')
      continue
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory())
      await collectSources(fullPath, files)
    else if (SOURCE_EXTENSIONS.has(extname(entry.name)))
      files.push(fullPath)
  }
  return files
}

async function loadUnoConfig(root: string, stamp: number) {
  // 不能静态 import uno.config.ts。Farm 编译配置时会把它交给 SWC，文件里的中文标点会直接 panic。
  // 查询参数用来绕开 tsx 的模块缓存，配置改过之后才会读到新内容。
  const href = `${pathToFileURL(join(root, 'uno.config.ts')).href}?t=${stamp}`
  const mod = await tsImport(href, import.meta.url)
  return mod.default as UserConfig
}

export function farmUnoCss(root: string): JsPlugin {
  let generatorPromise: Promise<UnoGenerator> | undefined
  let configStamp = 0

  async function getGenerator() {
    const { mtimeMs } = await stat(join(root, 'uno.config.ts'))
    if (generatorPromise && mtimeMs === configStamp)
      return generatorPromise
    configStamp = mtimeMs
    generatorPromise = loadUnoConfig(root, mtimeMs).then(config => createGenerator(config))
    return generatorPromise
  }

  return {
    name: 'farm-unocss',
    resolve: {
      filters: {
        importers: ['.*'],
        sources: ['^virtual:uno\\.css$'],
      },
      executor(param) {
        if (param.source !== VIRTUAL_ID)
          return null
        return {
          resolvedPath: RESOLVED_ID,
          sideEffects: true,
        }
      },
    },
    load: {
      filters: {
        resolvedPaths: ['^/__virtual__/uno\\.css$'],
      },
      async executor(_param, context) {
        const generatorInstance = await getGenerator()
        const files = await collectSources(join(root, 'src'), [])
        files.push(join(root, 'index.html'))
        for (const file of files)
          context?.addWatchFile(RESOLVED_ID, file)
        context?.addWatchFile(RESOLVED_ID, join(root, 'uno.config.ts'))

        const contents = await Promise.all(files.map(file => readFile(file, 'utf8')))
        const result = await generatorInstance.generate(contents.join('\n'))
        return {
          content: result.css,
          moduleType: 'css',
        }
      },
    },
  }
}

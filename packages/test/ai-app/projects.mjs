import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))
export const testProjectsRoot = path.join(root, '.artifacts/ai-apps/projects')

export function copyAppForTest(source, destination) {
  if (path.resolve(source) === path.resolve(destination)) throw new Error('测试副本必须与示例目录分开')
  fs.rmSync(destination, { recursive: true, force: true })
  fs.cpSync(source, destination, {
    recursive: true,
    filter(file) {
      const name = path.basename(file)
      if (['node_modules', 'dist', '.angular', 'out-tsc', 'vendor', '.git'].includes(name)) return false
      if (name === '.env' || (name.startsWith('.env.') && name !== '.env.example')) return false
      if (name.endsWith('.generated.ts')) return false
      return path.relative(source, file).split(path.sep).join('/') !== 'public/candidate.json'
    },
  })
}

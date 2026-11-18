import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const keys = ['VITE_QWEN_API_URL', 'VITE_DEEPSEEK_API_URL', 'VITE_ALIYUN_DASHSCOPE_KEY', 'VITE_DEEPSEEK_API_KEY']
export function readClientEnv(root, shell = process.env) {
  let values = {}
  for (const name of ['.env', '.env.local']) {
    const file = join(root, name)
    if (existsSync(file)) values = { ...values, ...parseEnv(readFileSync(file, 'utf8')) }
  }
  return Object.fromEntries(keys.map((key) => [key, shell[key] ?? values[key] ?? '']))
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const output = join(
    root,
    process.argv.includes('--test') ? 'src/environments/env.test.generated.ts' : 'src/environments/env.generated.ts',
  )
  const content = `// Generated from the public client environment.\nexport const env = ${JSON.stringify(readClientEnv(root), null, 2)} as const\n`
  mkdirSync(dirname(output), { recursive: true })
  if (!existsSync(output) || readFileSync(output, 'utf8') !== content) writeFileSync(output, content)
}

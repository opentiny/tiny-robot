import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { digest, packCandidate } from './candidate.mjs'
import { root, hosts, selectHosts } from './projects.mjs'

export function run(command, args, cwd = root, env = {}) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', env: { ...process.env, ...env } })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} 执行失败（${result.status}）`)
}

export function verifyInstalled(project, candidate) {
  for (const pkg of candidate.packages) {
    const directory = fs.realpathSync(path.join(project, 'node_modules', pkg.name))
    const installed = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'))
    if (
      installed.name !== pkg.name ||
      installed.version !== pkg.version ||
      !directory.includes(`${path.sep}node_modules${path.sep}`)
    )
      throw new Error(`依赖来源不正确：${pkg.name}`)
    for (const [file, expected] of Object.entries(pkg.files)) {
      if (digest(fs.readFileSync(path.join(directory, file))) !== expected)
        throw new Error(`安装产物与候选包不一致：${pkg.name}/${file}`)
    }
  }
}

export function prepareExamples(selected = hosts, { build = true } = {}) {
  if (build) run('pnpm', ['build:components'])
  const candidate = packCandidate(root)
  for (const host of selected) {
    const project = path.join(root, host.directory)
    const packageFile = path.join(project, 'package.json')
    const manifest = JSON.parse(fs.readFileSync(packageFile, 'utf8'))
    const overrides = { vue: '3.5.41' }
    for (const pkg of candidate.packages) {
      const spec =
        'file:' + path.relative(project, path.join(candidate.directory, pkg.tarball)).split(path.sep).join('/')
      manifest.dependencies[pkg.name] = spec
      overrides[pkg.name] = spec
    }
    const content = JSON.stringify(manifest, null, 2) + '\n'
    const workspace =
      'packages:\n  - .\noverrides:\n' +
      Object.entries(overrides)
        .map(([name, value]) => `  '${name}': '${value}'`)
        .join('\n') +
      '\nonlyBuiltDependencies:\n  - esbuild\n'
    fs.writeFileSync(packageFile, content)
    fs.writeFileSync(path.join(project, 'pnpm-workspace.yaml'), workspace)
    const key = digest(content + workspace)
    const stamp = path.join(project, 'node_modules/.wc-candidate')
    let installed = false
    try {
      installed = fs.readFileSync(stamp, 'utf8') === key
      if (installed) verifyInstalled(project, candidate)
    } catch {
      installed = false
    }
    if (!installed) {
      run('pnpm', ['install', '--no-frozen-lockfile'], project)
      verifyInstalled(project, candidate)
      fs.writeFileSync(stamp, key)
    }
    fs.mkdirSync(path.join(project, 'public'), { recursive: true })
    fs.writeFileSync(
      path.join(project, 'public/candidate.json'),
      JSON.stringify(
        {
          id: candidate.id,
          packages: candidate.packages.map(({ name, version, sha256 }) => ({ name, version, sha256 })),
        },
        null,
        2,
      ) + '\n',
    )
    console.log(`[${host.id}] 候选包 ${candidate.id} 已校验`)
  }
  return candidate
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  prepareExamples(selectHosts(process.argv.slice(2)), { build: !process.argv.includes('--skip-build') })
}

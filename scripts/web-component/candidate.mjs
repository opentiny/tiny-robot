import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { resolvePublishedDependencyRange } from '../publish-version-utils.js'

export const PACKAGE_DIRS = ['components', 'kit', 'svgs', 'chat']
export const digest = (data) => crypto.createHash('sha256').update(data).digest('hex')

export function filesIn(directory, prefix = '') {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const relative = path.posix.join(prefix, entry.name)
      return entry.isDirectory() ? filesIn(path.join(directory, entry.name), relative) : [relative]
    })
}

export function fingerprintPackages(root) {
  const hash = crypto.createHash('sha256')
  for (const dir of PACKAGE_DIRS) {
    const source = path.join(root, 'packages', dir)
    for (const relative of [
      'package.json',
      ...filesIn(path.join(source, 'dist')).map((file) => `dist/${file}`),
      ...fs
        .readdirSync(source)
        .filter((name) => name.startsWith('README'))
        .sort(),
    ]) {
      hash
        .update(`${dir}/${relative}\0`)
        .update(fs.readFileSync(path.join(source, relative)))
        .update('\0')
    }
  }
  return hash.digest('hex').slice(0, 16)
}

export function rewriteManifest(manifest, versions) {
  const copy = structuredClone(manifest)
  for (const section of ['dependencies', 'peerDependencies', 'optionalDependencies', 'devDependencies']) {
    for (const [name, spec] of Object.entries(copy[section] ?? {})) {
      if (!spec.startsWith('workspace:')) continue
      const version = versions.get(name)
      if (!version) throw new Error(`缺少工作区依赖版本：${name}`)
      copy[section][name] = resolvePublishedDependencyRange(spec, version)
    }
  }
  return copy
}

export function packCandidate(root) {
  const id = fingerprintPackages(root)
  const output = path.join(root, '.artifacts/web-component/candidates', id)
  const manifestPath = path.join(output, 'provenance.json')
  if (fs.existsSync(manifestPath)) {
    const cached = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    for (const pkg of cached.packages) {
      if (digest(fs.readFileSync(path.join(output, pkg.tarball))) !== pkg.sha256)
        throw new Error(`候选包损坏：${pkg.name}`)
    }
    return { ...cached, directory: output }
  }
  fs.mkdirSync(output, { recursive: true })
  const packages = PACKAGE_DIRS.map((dir) => {
    const source = path.join(root, 'packages', dir)
    return { dir, source, manifest: JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8')) }
  })
  const versions = new Map(packages.map(({ manifest }) => [manifest.name, manifest.version]))
  const records = []
  for (const pkg of packages) {
    const staging = path.join(output, 'staging', pkg.dir)
    fs.mkdirSync(staging, { recursive: true })
    fs.writeFileSync(
      path.join(staging, 'package.json'),
      JSON.stringify(rewriteManifest(pkg.manifest, versions), null, 2) + '\n',
    )
    fs.cpSync(path.join(pkg.source, 'dist'), path.join(staging, 'dist'), { recursive: true })
    for (const name of fs.readdirSync(pkg.source).filter((name) => name.startsWith('README')))
      fs.copyFileSync(path.join(pkg.source, name), path.join(staging, name))
    const result = spawnSync('npm', ['pack', staging, '--pack-destination', output, '--ignore-scripts', '--json'], {
      encoding: 'utf8',
      env: { ...process.env, npm_config_cache: path.join(root, '.artifacts/web-component/npm-cache') },
    })
    if (result.status !== 0) throw new Error(result.stderr)
    const tarball = JSON.parse(result.stdout)[0].filename
    records.push({
      name: pkg.manifest.name,
      version: pkg.manifest.version,
      tarball,
      sha256: digest(fs.readFileSync(path.join(output, tarball))),
      files: Object.fromEntries(
        filesIn(path.join(staging, 'dist')).map((name) => [
          `dist/${name}`,
          digest(fs.readFileSync(path.join(staging, 'dist', name))),
        ]),
      ),
    })
  }
  const candidate = { id, packages: records }
  fs.writeFileSync(manifestPath, JSON.stringify(candidate, null, 2) + '\n')
  fs.rmSync(path.join(output, 'staging'), { recursive: true })
  return { ...candidate, directory: output }
}

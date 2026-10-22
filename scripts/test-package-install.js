import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { preparePublishPackages } from './prepare-publish-packages.js'
import { PUBLISHED_DEPENDENCY_SECTIONS, PUBLISH_PACKAGES } from './publish-version-utils.js'

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  })

  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout)
    if (result.stderr) process.stderr.write(result.stderr)
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`)
  }

  return result.stdout
}

function copyPublishPackages(rootDir, stagingRoot) {
  for (const [, relativePath] of PUBLISH_PACKAGES) {
    const relativeDirectory = path.dirname(relativePath)
    fs.cpSync(path.join(rootDir, relativeDirectory), path.join(stagingRoot, relativeDirectory), {
      recursive: true,
      filter(source) {
        return path.basename(source) !== 'node_modules'
      },
    })
  }
}

function packPublishPackages(stagingRoot, tarballDirectory) {
  const tarballs = new Map()

  for (const [name, relativePath] of PUBLISH_PACKAGES) {
    const packageDirectory = path.dirname(path.join(stagingRoot, relativePath))
    const output = run(
      'npm',
      ['pack', packageDirectory, '--pack-destination', tarballDirectory, '--json', '--ignore-scripts'],
      { cwd: stagingRoot },
    )
    const [{ filename }] = JSON.parse(output)
    tarballs.set(name, path.join(tarballDirectory, filename))
  }

  return tarballs
}

function assertInstalledManifests(consumerDirectory) {
  for (const [name] of PUBLISH_PACKAGES) {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(consumerDirectory, 'node_modules', name, 'package.json'), 'utf8'),
    )

    for (const section of PUBLISHED_DEPENDENCY_SECTIONS) {
      for (const [dependency, spec] of Object.entries(manifest[section] ?? {})) {
        if (typeof spec === 'string' && spec.startsWith('workspace:')) {
          throw new Error(`${name} ${section}.${dependency} still uses ${spec} after installation`)
        }
      }
    }
  }
}

function installWith(packageManager, tarballs, temporaryRoot) {
  const consumerDirectory = path.join(temporaryRoot, `${packageManager}-consumer`)
  const dependencies = Object.fromEntries([...tarballs].map(([name, tarball]) => [name, `file:${tarball}`]))
  const packageJson = {
    name: `${packageManager}-package-install-smoke-test`,
    private: true,
    dependencies,
  }

  fs.mkdirSync(consumerDirectory)
  fs.writeFileSync(path.join(consumerDirectory, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`)
  if (packageManager === 'pnpm') {
    const overrides = Object.entries(dependencies)
      .map(([name, spec]) => `  ${JSON.stringify(name)}: ${JSON.stringify(spec)}`)
      .join('\n')
    fs.writeFileSync(path.join(consumerDirectory, 'pnpm-workspace.yaml'), `overrides:\n${overrides}\n`)
  }

  const args =
    packageManager === 'npm'
      ? ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false']
      : ['install', '--ignore-scripts', '--no-frozen-lockfile', '--strict-peer-dependencies']

  run(packageManager, args, { cwd: consumerDirectory })
  assertInstalledManifests(consumerDirectory)
  console.log(`${packageManager} installed all publish tarballs successfully`)
}

function testPackageInstall({ rootDir = process.cwd() } = {}) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tiny-robot-package-install-'))

  try {
    const stagingRoot = path.join(temporaryRoot, 'staging')
    const tarballDirectory = path.join(temporaryRoot, 'tarballs')
    fs.mkdirSync(stagingRoot)
    fs.mkdirSync(tarballDirectory)
    copyPublishPackages(rootDir, stagingRoot)
    preparePublishPackages({ rootDir: stagingRoot })
    const tarballs = packPublishPackages(stagingRoot, tarballDirectory)
    installWith('npm', tarballs, temporaryRoot)
    installWith('pnpm', tarballs, temporaryRoot)
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true })
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    testPackageInstall()
  } catch (error) {
    console.error('Error: ' + (error instanceof Error ? error.message : String(error)))
    process.exitCode = 1
  }
}

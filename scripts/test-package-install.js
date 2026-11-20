import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import semver from 'semver'

import { preparePublishPackages } from './prepare-publish-packages.js'
import { PUBLISHED_DEPENDENCY_SECTIONS, PUBLISH_PACKAGES, readPublishPackages } from './publish-version-utils.js'

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
    const [{ filename, files }] = JSON.parse(output)
    if (name === '@opentiny/tiny-robot-cli' && !files.some(({ path }) => path === 'templates/basic/_gitignore')) {
      throw new Error(`${name} tarball must contain templates/basic/_gitignore`)
    }
    tarballs.set(name, path.join(tarballDirectory, filename))
  }

  return tarballs
}

export function collectPeerDependencies(packages, publishedPackageNames) {
  const peerRanges = new Map()

  for (const { packageJson } of packages) {
    for (const [name, range] of Object.entries(packageJson.peerDependencies ?? {})) {
      if (
        publishedPackageNames.has(name) ||
        packageJson.peerDependenciesMeta?.[name]?.optional === true ||
        typeof range !== 'string'
      ) {
        continue
      }

      const ranges = peerRanges.get(name) ?? new Set()
      ranges.add(range)
      peerRanges.set(name, ranges)
    }
  }

  return Object.fromEntries([...peerRanges].map(([name, ranges]) => [name, intersectPeerRanges(name, [...ranges])]))
}

function intersectPeerRanges(name, ranges) {
  if (ranges.length === 1) return ranges[0]

  // Each `||` branch is an alternative, so intersect branches as a Cartesian product.
  const alternatives = ranges.map((range) => new semver.Range(range).set)
  const combinations = alternatives.reduce(
    (current, next) => current.flatMap((left) => next.map((right) => [...left, right])),
    [[]],
  )
  const intersections = new Set()

  for (const combination of combinations) {
    const comparators = combination.flat()
    let range = comparators
      .map((comparator) => comparator.value)
      .filter(Boolean)
      .join(' ')

    const prereleaseTuples = combination.map((set) => new Set(set.flatMap(getPrereleaseTuple)))
    const allPrereleaseTuples = new Set(prereleaseTuples.flatMap((tuples) => [...tuples]))
    const commonPrereleaseTuples = new Set(
      [...(prereleaseTuples[0] ?? [])].filter((tuple) => prereleaseTuples.every((tuples) => tuples.has(tuple))),
    )

    for (const tuple of allPrereleaseTuples) {
      if (commonPrereleaseTuples.has(tuple)) continue
      range = intersectRanges(range, `<${tuple}-0 || >=${tuple}`)
      if (!range) break
    }

    if (!range) continue
    const minimum = semver.minVersion(range)
    if (minimum) intersections.add(range)
  }

  if (intersections.size === 0) {
    throw new Error(`Peer dependency ${name} has incompatible ranges: ${ranges.join(', ')}`)
  }

  return [...intersections].join(' || ')
}

function getPrereleaseTuple(comparator) {
  const version = comparator.semver
  return version?.prerelease.length ? [`${version.major}.${version.minor}.${version.patch}`] : []
}

function intersectRanges(leftRange, rightRange) {
  const leftSets = new semver.Range(leftRange).set
  const rightSets = new semver.Range(rightRange).set
  const intersections = []

  for (const left of leftSets) {
    for (const right of rightSets) {
      const range = [...left, ...right]
        .map((comparator) => comparator.value)
        .filter(Boolean)
        .join(' ')
      if (semver.minVersion(range)) intersections.push(new semver.Range(range).range)
    }
  }

  return intersections.join(' || ')
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

function installWith(packageManager, tarballs, peerDependencies, temporaryRoot) {
  const consumerDirectory = path.join(temporaryRoot, `${packageManager}-consumer`)
  const tarballDependencies = Object.fromEntries([...tarballs].map(([name, tarball]) => [name, `file:${tarball}`]))
  const dependencies = { ...tarballDependencies, ...peerDependencies }
  const packageJson = {
    name: `${packageManager}-package-install-smoke-test`,
    private: true,
    dependencies,
  }

  fs.mkdirSync(consumerDirectory)
  fs.writeFileSync(path.join(consumerDirectory, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`)
  if (packageManager === 'pnpm') {
    const overrides = Object.entries(tarballDependencies)
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
    const peers = collectPeerDependencies(readPublishPackages(stagingRoot), new Set(tarballs.keys()))
    installWith('npm', tarballs, peers, temporaryRoot)
    installWith('pnpm', tarballs, peers, temporaryRoot)
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

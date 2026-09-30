import { confirm, select } from '@inquirer/prompts'
import { Argument } from 'commander'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import semver from 'semver'

import { createRuntimeDependencies, resolveRuntimeVersion } from '../runtime-version.js'
import {
  findProjectRoot,
  findSubPackageRoot,
  findWorkspacePackages,
  findWorkspaceRoot,
  getTemplateDir,
  invariant,
  listPackages,
  logSkip,
  logSuccess,
  mergeEnvContent,
} from '../utils.js'

const CHAT_ADD_FEATURE_DIR = 'src/tiny-robot-chat'
async function resolveTargetPackage(cwd, nonInteractive) {
  const workspaceRoot = findWorkspaceRoot(cwd)

  if (workspaceRoot) {
    const workspacePatterns = findWorkspacePackages(workspaceRoot)
    const packageDirs = listPackages(workspaceRoot, workspacePatterns)
    const subPackageRoot = findSubPackageRoot(cwd, workspaceRoot)

    if (subPackageRoot) {
      if (packageDirs.includes(subPackageRoot)) return subPackageRoot
      throw new Error(
        'The current package is not included by the workspace configuration. Run this command from an included package or update the workspace configuration.',
      )
    }

    const normalizedCwd = path.resolve(cwd)
    const normalizedWorkspaceRoot = path.resolve(workspaceRoot)
    const rootPackageJson = path.join(workspaceRoot, 'package.json')

    if (
      normalizedCwd === normalizedWorkspaceRoot &&
      workspacePatterns === undefined &&
      packageDirs.length === 1 &&
      packageDirs[0] === path.resolve(workspaceRoot) &&
      fs.existsSync(rootPackageJson)
    )
      return workspaceRoot

    if (normalizedCwd !== normalizedWorkspaceRoot) {
      throw new Error(
        'No package.json found in the current package path. Run add from the workspace root or a package directory.',
      )
    }

    if (packageDirs.length === 0) {
      const detail =
        workspacePatterns === undefined
          ? 'The workspace has no packages field and no package matched pnpm default workspace locations.'
          : 'No packages matched the patterns in pnpm-workspace.yaml.'
      throw new Error(`${detail} Run this command from an included package or update the workspace configuration.`)
    }

    if (packageDirs.length === 1) return packageDirs[0]

    if (nonInteractive) {
      throw new Error(
        `Multiple workspace packages found. Run add from the target package directory when using --yes or --dry-run. Candidates: ${packageDirs
          .map((dir) => path.relative(workspaceRoot, dir).replaceAll('\\', '/') || '.')
          .join(', ')}`,
      )
    }

    return select({
      message: 'Multi-package workspace detected, select a target package:',
      choices: packageDirs.map((dir) => ({
        name: path.relative(workspaceRoot, dir).replaceAll('\\', '/') || '(workspace root)',
        value: dir,
      })),
    })
  }

  const projectRoot = findProjectRoot(cwd)
  if (projectRoot) return projectRoot
  throw new Error('no package.json found.')
}

function getTemplateFile(...segments) {
  return path.join(getTemplateDir('chat'), ...segments)
}

function readPackageJson(pkgPath) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  invariant(pkg && typeof pkg === 'object' && !Array.isArray(pkg), 'package.json must contain a JSON object.')
  return pkg
}

function findDependency(pkg, name) {
  const matches = []
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    if (pkg[section] && Object.prototype.hasOwnProperty.call(pkg[section], name)) {
      matches.push({ section, version: pkg[section][name] })
    }
  }
  return matches
}

function insertDependencyOrdered(dependencies, name, version) {
  const next = {}
  let inserted = false
  for (const [key, value] of Object.entries(dependencies)) {
    if (!inserted && name < key) {
      next[name] = version
      inserted = true
    }
    next[key] = value
  }
  if (!inserted) next[name] = version
  return next
}

function hasStableBranchAtOrAbove(range, targetVersion) {
  if (semver.prerelease(targetVersion) !== null) return false

  return new semver.Range(range).set.some((comparators) => {
    const minimum = semver.minVersion(comparators.map((comparator) => comparator.value).join(' '))
    return minimum !== null && semver.gte(minimum, targetVersion)
  })
}

function ensureDependency(pkg, name, targetSpecifier) {
  const targetMinimum = semver.minVersion(targetSpecifier)
  invariant(targetMinimum, `${name} has an invalid target version specifier (${targetSpecifier})`)
  const targetVersion = targetMinimum.version

  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    const value = pkg[section]
    if (value !== undefined && (value === null || typeof value !== 'object' || Array.isArray(value))) {
      return { type: 'conflict', reason: `${section} must be a JSON object` }
    }
  }

  const existing = findDependency(pkg, name)
  if (existing.length > 1) {
    return { type: 'conflict', reason: `${name} is declared in multiple dependency sections` }
  }

  if (existing.length === 0) {
    if (
      pkg.dependencies !== undefined &&
      (pkg.dependencies === null || typeof pkg.dependencies !== 'object' || Array.isArray(pkg.dependencies))
    ) {
      return { type: 'conflict', reason: 'dependencies must be a JSON object' }
    }
    pkg.dependencies ??= {}
    pkg.dependencies = insertDependencyOrdered(pkg.dependencies, name, targetSpecifier)
    return { type: 'added', to: targetSpecifier, section: 'dependencies' }
  }

  const dependency = existing[0]
  if (typeof dependency.version === 'string' && dependency.version.startsWith('workspace:')) {
    return { type: 'skipped', section: dependency.section, version: dependency.version }
  }

  if (typeof dependency.version !== 'string' || !semver.validRange(dependency.version)) {
    return {
      type: 'conflict',
      reason: `${name} has an unsupported version specifier (${String(dependency.version)})`,
    }
  }

  const satisfies = semver.satisfies(targetVersion, dependency.version)

  if (satisfies) return { type: 'skipped', section: dependency.section, version: dependency.version }

  if (hasStableBranchAtOrAbove(dependency.version, targetVersion)) {
    return { type: 'skipped', section: dependency.section, version: dependency.version }
  }

  if (dependency.section !== 'dependencies') {
    return {
      type: 'conflict',
      reason: `${name}@${dependency.version} in ${dependency.section} does not satisfy ${targetSpecifier}`,
    }
  }

  pkg.dependencies[name] = targetSpecifier
  return {
    type: 'updated',
    section: dependency.section,
    from: dependency.version,
    to: targetSpecifier,
  }
}

function printDependencyResult(result, name) {
  if (result.type === 'added') {
    logSuccess(`Added ${name}@${result.to}`)
  } else if (result.type === 'updated') {
    logSuccess(`Updated ${name} from ${result.from} to ${result.to}`)
  } else if (result.type === 'conflict') {
    logSkip(`${name} requires manual dependency resolution (${result.reason})`)
  } else {
    logSkip(`${name} already satisfies required version (${result.version})`)
  }
}

function listFiles(sourceDir, relativeDir = '') {
  const files = []
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name)
    const sourcePath = path.join(sourceDir, entry.name)
    if (entry.isDirectory()) files.push(...listFiles(sourcePath, relativePath))
    else files.push({ source: sourcePath, relativePath })
  }
  return files
}

function getChatFeatureFiles(targetDir) {
  const sourceRoot = getTemplateFile('src')
  const featureFiles = listFiles(sourceRoot)
    .filter(({ relativePath }) => relativePath !== 'main.ts' && relativePath !== 'index.css')
    .map(({ source, relativePath }) => ({ source, target: path.join(targetDir, CHAT_ADD_FEATURE_DIR, relativePath) }))

  featureFiles.push({
    source: getTemplateFile('src', 'index.css'),
    target: path.join(targetDir, CHAT_ADD_FEATURE_DIR, 'index.css'),
  })

  return featureFiles
}

function inspectFeatureFiles(files) {
  return files.map((file) => {
    if (!fs.existsSync(file.target)) return { ...file, type: 'create' }
    if (!fs.statSync(file.target).isFile()) return { ...file, type: 'conflict', reason: 'target is not a file' }
    const same = fs.readFileSync(file.source).equals(fs.readFileSync(file.target))
    return { ...file, type: same ? 'skipped' : 'conflict' }
  })
}

function formatRelative(file, targetDir) {
  return path.relative(targetDir, file).replaceAll('\\', '/')
}

function getEnvPlan(targetDir) {
  const templateFile = getTemplateFile('.env.example')
  const targetFile = path.join(targetDir, '.env.example')

  if (!fs.existsSync(templateFile)) return { type: 'unavailable' }
  if (!fs.existsSync(targetFile)) return { type: 'create', targetFile, content: fs.readFileSync(templateFile) }
  invariant(fs.statSync(targetFile).isFile(), '.env.example exists and is not a file.')

  const result = mergeEnvContent(fs.readFileSync(templateFile, 'utf-8'), fs.readFileSync(targetFile, 'utf-8'))
  return { ...result, targetFile }
}

function formatPlanStatus(type) {
  if (type === 'create') return '+'
  if (type === 'merge' || type === 'merged') return '~'
  if (type === 'unavailable' || type === 'conflict') return '!'
  return '○'
}

function printManualMcpSetup() {
  console.log('  ! Manual: add the Model Context MCP proxy to vite.config.* under server.proxy')
}

function fileContent(content) {
  return Buffer.isBuffer(content) ? content : Buffer.from(content)
}

function addFileChange(changes, target, content, message) {
  if (fs.existsSync(target)) invariant(fs.statSync(target).isFile(), `${target} exists and is not a file.`)

  const next = fileContent(content)
  if (fs.existsSync(target) && fs.readFileSync(target).equals(next)) return false

  changes.push({ target, content, message })
  return true
}

function applyChanges(changes) {
  const snapshots = changes.map(({ target }) => ({
    target,
    existed: fs.existsSync(target),
    content: fs.existsSync(target) ? fs.readFileSync(target) : null,
  }))
  const createdDirectories = new Set()

  try {
    for (const change of changes) {
      let directory = path.dirname(change.target)
      const missingDirectories = []
      while (!fs.existsSync(directory)) {
        missingDirectories.push(directory)
        directory = path.dirname(directory)
      }
      fs.mkdirSync(path.dirname(change.target), { recursive: true })
      for (const missingDirectory of missingDirectories) createdDirectories.add(missingDirectory)
      fs.writeFileSync(change.target, change.content)
    }
  } catch (error) {
    for (const snapshot of snapshots.reverse()) {
      if (snapshot.existed) fs.writeFileSync(snapshot.target, snapshot.content)
      else if (fs.existsSync(snapshot.target)) fs.rmSync(snapshot.target, { force: true })
    }
    for (const directory of [...createdDirectories].sort((left, right) => right.length - left.length)) {
      if (fs.existsSync(directory) && fs.readdirSync(directory).length === 0) fs.rmdirSync(directory)
    }

    throw new Error(
      `Failed to apply changes; all changes were rolled back: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

function prepareChanges(targetDir, context) {
  const { featureInspection, pkgPath, pkg, allowConflicts, dependencies } = context
  const changes = []
  const results = { featureInspection, env: null, dependencies: [], dependencyChanged: false }
  const conflicts = featureInspection.filter((file) => file.type === 'conflict')

  if (conflicts.length > 0 && !allowConflicts) {
    throw new Error(
      `file conflicts detected:\n${conflicts.map((file) => `  - ${formatRelative(file.target, targetDir)}`).join('\n')}\nResolve the conflicts and run add chat again.`,
    )
  }

  for (const file of featureInspection) {
    if (file.type === 'create')
      addFileChange(
        changes,
        file.target,
        fs.readFileSync(file.source),
        `Created ${formatRelative(file.target, targetDir)}`,
      )
  }

  results.env = getEnvPlan(targetDir)
  if (results.env.type === 'create')
    addFileChange(changes, results.env.targetFile, results.env.content, 'Created .env.example')
  if (results.env.type === 'merged')
    addFileChange(changes, results.env.targetFile, results.env.content, `Added ${results.env.added} env variables`)

  for (const [name, version] of Object.entries(dependencies)) {
    const result = ensureDependency(pkg, name, version)
    if (result.type === 'conflict' && !allowConflicts) throw new Error(`${name}: ${result.reason}`)
    results.dependencies.push({ name, result })
    results.dependencyChanged ||= result.type !== 'skipped'
  }

  if (results.dependencyChanged)
    addFileChange(changes, pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'Updated package.json')

  return { changes, results }
}

function printChangePlan(targetDir, results) {
  console.log('\nChange Plan\n')
  for (const file of results.featureInspection) {
    console.log(`  ${formatPlanStatus(file.type)} ${formatRelative(file.target, targetDir)}`)
  }
  console.log(
    `  ${formatPlanStatus(results.env?.type ?? 'unavailable')} .env.example (${results.env?.type ?? 'unavailable'})`,
  )
  for (const { name, result } of results.dependencies) {
    const status = result.type === 'added' || result.type === 'updated' ? '~' : result.type === 'conflict' ? '!' : '○'
    console.log(`  ${status} package.json (${result.type}: ${name})`)
  }
  console.log('  ○ src/main.ts / src/main.js (unchanged)')
  console.log('  ○ src/App.vue (unchanged)')
  console.log('  ○ vite.config.* (unchanged)')
  printManualMcpSetup()
}

function printChangeResults(targetDir, results) {
  for (const file of results.featureInspection) {
    if (file.type === 'create') logSuccess(`Created ${formatRelative(file.target, targetDir)}`)
    else if (file.type === 'skipped') logSkip(`${formatRelative(file.target, targetDir)} already exists`)
  }

  if (results.env?.type === 'create') logSuccess('Created .env.example')
  else if (results.env?.type === 'merged') logSuccess(`Added ${results.env.added} env variables`)
  else if (results.env?.type === 'unavailable') logSkip('.env.example template is unavailable; no environment variables were added')
  else logSkip('.env.example already contains required variables')

  for (const { name, result } of results.dependencies) printDependencyResult(result, name)
  if (!results.dependencyChanged) logSkip('package.json already contains required dependencies')
}

async function addFeature(targetDir, type, options) {
  invariant(type === 'chat', `unsupported feature: ${type}`)
  const featureFiles = getChatFeatureFiles(targetDir)
  const pkgPath = path.join(targetDir, 'package.json')
  invariant(fs.existsSync(pkgPath), 'package.json not found.')
  invariant(fs.statSync(pkgPath).isFile(), 'package.json is not a file.')
  const pkg = readPackageJson(pkgPath)
  const featureInspection = inspectFeatureFiles(featureFiles)
  const prepared = prepareChanges(targetDir, {
    featureInspection,
    pkgPath,
    pkg,
    allowConflicts: options.dryRun,
    dependencies: options.dependencies,
  })

  if (options.dryRun) {
    printChangePlan(targetDir, prepared.results)
    return
  }

  if (prepared.changes.length === 0) {
    logSkip('No changes were necessary.')
    return
  }

  if (!options.yes && !options.nonInteractive) {
    printChangePlan(targetDir, prepared.results)
    const accepted = await confirm({ message: `Apply these changes to ${targetDir}?`, default: true })
    if (!accepted) {
      logSkip('Operation cancelled.')
      return
    }
  }

  console.log('\nChange Results\n')
  applyChanges(prepared.changes)
  printChangeResults(targetDir, prepared.results)
  console.log(`\nSuccessfully added "${type}" feature to ${targetDir}`)
  printNextSteps({ dependencyChanged: prepared.results.dependencyChanged })
}

function printNextSteps({ dependencyChanged }) {
  const steps = []
  steps.push(
    "Import '@opentiny/tiny-robot/dist/style.css', '@opentiny/tiny-robot-chat/dist/style.css', and './tiny-robot-chat/index.css' in your application entry file.",
  )
  steps.push(
    [
      'Render <TinyRobotChat /> near your main application component.',
      '',
      "Example ('src/App.vue'):",
      '',
      '  <script setup lang="ts">',
      "  import TinyRobotChat from './tiny-robot-chat/TinyRobotChat.vue'",
      '  </script>',
      '',
      '  <template>',
      '    <YourAppComponent />',
      '    <TinyRobotChat />',
      '  </template>',
    ].join('\n'),
  )
  steps.push('Copy .env.example to .env.local and configure your AI provider API keys.')
  steps.push('Add the Model Context MCP proxy to vite.config.* under server.proxy, then restart Vite.')
  if (dependencyChanged) steps.push('Install or update project dependencies: pnpm install')
  if (steps.length > 0) {
    console.log('\nNext Steps\n')
    for (const [index, step] of steps.entries()) console.log(`${index + 1}. ${step}\n`)
  }
}

export function registerAddCommand(program) {
  program
    .command('add')
    .description('Add a feature to the project')
    .addArgument(new Argument('<type>', 'type of feature to add').choices(['chat']))
    .option('--yes', 'apply the complete chat feature without prompts')
    .option('--dry-run', 'print the change plan without modifying files')
    .option('--runtime-version <version>', 'override the TinyRobot runtime version')
    .action(async (type, options) => {
      try {
        const runtime = resolveRuntimeVersion(options.runtimeVersion)
        const nonInteractive = Boolean(options.yes || options.dryRun || !process.stdout.isTTY)
        const targetDir = await resolveTargetPackage(process.cwd(), nonInteractive)
        await addFeature(targetDir, type, {
          ...options,
          dependencies: createRuntimeDependencies(runtime.specifier),
          nonInteractive,
        })
      } catch (error) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
          console.error('\nOperation cancelled.')
          process.exit(1)
        }
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
        process.exit(1)
      }
    })
}

export { ensureDependency, getChatFeatureFiles, printChangeResults, resolveTargetPackage }

import { checkbox, select } from '@inquirer/prompts'
import { compileTemplate, parse } from '@vue/compiler-sfc'
import { Argument } from 'commander'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import semver from 'semver'

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

const TARGET_VERSION = '0.5.2-alpha.10'
const CHAT_ADD_FEATURE_DIR = 'src/tiny-robot-chat'
const DEPENDENCIES = {
  '@opentiny/tiny-robot': TARGET_VERSION,
  '@opentiny/tiny-robot-chat': TARGET_VERSION,
  '@opentiny/tiny-robot-kit': TARGET_VERSION,
  '@opentiny/tiny-robot-svgs': TARGET_VERSION,
  '@vueuse/core': '13.9.0',
}
const PACKAGE_STYLE_IMPORTS = [
  "import '@opentiny/tiny-robot/dist/style.css'",
  "import '@opentiny/tiny-robot-chat/dist/style.css'",
]

function logUnavailable(label) {
  logSkip(`${label} could not be applied`)
}

function logSkippedSelection(label) {
  logSkip(`${label} change was not selected`)
}

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

function findMainEntry(targetDir) {
  for (const file of ['src/main.ts', 'src/main.js']) {
    const fullPath = path.join(targetDir, file)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) return fullPath
  }
  return null
}

function importedModule(line) {
  const match = /^\s*import(?:\s+[\s\S]*?\sfrom\s+)?\s*['"]([^'"]+)['"]\s*;?\s*$/.exec(line)
  return match?.[1] ?? null
}

function insertImport(content, importStatement) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n'
  const lines = content.replaceAll('\r\n', '\n').split('\n')
  const moduleName = importedModule(importStatement)
  if (moduleName && lines.some((line) => importedModule(line) === moduleName)) return content

  let lastImportIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\s/.test(lines[i])) {
      lastImportIndex = i
      continue
    }
    if (lastImportIndex !== -1) break
  }

  if (lastImportIndex === -1) lines.unshift(importStatement)
  else lines.splice(lastImportIndex + 1, 0, importStatement)
  return lines.join(eol)
}

function ensureStyleImportsContent(before, featureStyleImport) {
  let after = before
  for (const styleImport of [...PACKAGE_STYLE_IMPORTS, featureStyleImport]) {
    after = insertImport(after, styleImport)
  }
  return { type: after === before ? 'skipped' : 'inserted', content: after }
}

function ensureStyleImports(mainFile, featureStyleImport) {
  const before = fs.readFileSync(mainFile, 'utf-8')
  const result = ensureStyleImportsContent(before, featureStyleImport)
  if (result.type === 'inserted') fs.writeFileSync(mainFile, result.content)
  return { type: result.type }
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

function ensureDependency(pkg, name, targetVersion) {
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
    pkg.dependencies = insertDependencyOrdered(pkg.dependencies, name, targetVersion)
    return { type: 'added', to: targetVersion, section: 'dependencies' }
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

  const satisfies = semver.satisfies(targetVersion, dependency.version, { includePrerelease: true })

  if (satisfies) return { type: 'skipped', section: dependency.section, version: dependency.version }

  const minimum = typeof dependency.version === 'string' ? semver.minVersion(dependency.version) : null
  if (
    typeof dependency.version === 'string' &&
    ((semver.valid(dependency.version) && semver.gte(dependency.version, targetVersion)) ||
      (minimum && semver.gte(minimum, targetVersion)))
  ) {
    return { type: 'skipped', section: dependency.section, version: dependency.version }
  }

  if (dependency.section !== 'dependencies') {
    return {
      type: 'conflict',
      reason: `${name}@${dependency.version} in ${dependency.section} does not satisfy ${targetVersion}`,
    }
  }

  pkg.dependencies[name] = targetVersion
  return {
    type: 'updated',
    section: dependency.section,
    from: dependency.version,
    to: targetVersion,
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

function parseMountTemplate(source, filename) {
  const parsed = parse(source, { filename })
  if (parsed.errors.length > 0 || !parsed.descriptor.template) {
    return { type: 'manual', reason: 'App.vue template could not be parsed safely' }
  }

  const compiled = compileTemplate({
    source: parsed.descriptor.template.content,
    filename,
    id: 'tiny-robot-cli-mount',
  })
  if (compiled.errors.length > 0 || !compiled.ast) {
    return { type: 'manual', reason: 'App.vue template could not be parsed safely' }
  }

  return { type: 'parsed', block: parsed.descriptor.template, components: compiled.ast.components ?? [] }
}

function findTemplateClose(block) {
  return block.loc.end.offset
}

function planMount(targetDir) {
  const appFile = path.join(targetDir, 'src/App.vue')
  if (!fs.existsSync(appFile)) return { type: 'manual', reason: 'src/App.vue was not found' }
  if (!fs.statSync(appFile).isFile()) return { type: 'manual', reason: 'src/App.vue is not a file' }
  const before = fs.readFileSync(appFile, 'utf-8')

  const templatePlan = parseMountTemplate(before, appFile)
  if (templatePlan.type === 'manual') return templatePlan
  if (templatePlan.components.includes('TinyRobotChat')) return { type: 'skipped', content: before }

  const importStatement = "import TinyRobotChat from './tiny-robot-chat/TinyRobotChat.vue'"
  let after = before
  const setupMatch = /<script\s+setup(?:\s[^>]*)?>([\s\S]*?)<\/script>/i.exec(before)
  if (setupMatch) {
    const setupContent = setupMatch[1]
    const defaultImport = /^\s*import\s+TinyRobotChat\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/m.exec(setupContent)
    const featureImport =
      /^\s*import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]\.\/tiny-robot-chat\/TinyRobotChat\.vue['"]\s*;?\s*$/m.exec(
        setupContent,
      )
    const namedImport = /^\s*import\s*\{[^}]*\bTinyRobotChat\b[^}]*\}\s*from\s+['"][^'"]+['"]\s*;?\s*$/m.test(
      setupContent,
    )
    const localBinding = /^\s*(?:const|let|var|function|class)\s+TinyRobotChat\b/m.test(setupContent)

    if (
      namedImport ||
      localBinding ||
      (defaultImport && defaultImport[1] !== './tiny-robot-chat/TinyRobotChat.vue') ||
      (featureImport && featureImport[1] !== 'TinyRobotChat')
    ) {
      return { type: 'manual', reason: 'App.vue already declares TinyRobotChat with a different binding' }
    }

    if (!defaultImport) {
      const insertionIndex = setupMatch.index + setupMatch[0].indexOf('>') + 1
      after = `${before.slice(0, insertionIndex)}\n${importStatement}${before.slice(insertionIndex)}`
    }
  } else if (/<script(?:\s[^>]*)?>/.test(before)) {
    return { type: 'manual', reason: 'App.vue has a non-setup script block' }
  } else {
    after = `<script setup lang="ts">\n${importStatement}\n</script>\n\n${before}`
  }

  const updatedTemplate = parseMountTemplate(after, appFile)
  if (updatedTemplate.type === 'manual') return updatedTemplate
  const templateClose = findTemplateClose(updatedTemplate.block)
  if (templateClose === -1) return { type: 'manual', reason: 'App.vue template closing tag was not found' }
  const beforeClose = after.slice(0, templateClose).trimEnd()
  const lineIndent = /^\s*/.exec(beforeClose.slice(beforeClose.lastIndexOf('\n') + 1))?.[0] ?? ''
  const indent = lineIndent || '  '
  after = `${beforeClose}\n${indent}<TinyRobotChat />\n${after.slice(templateClose)}`
  return { type: 'merge', content: after }
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

function getChatFeatureChoices(targetDir, options) {
  const mainEntry = findMainEntry(targetDir)
  return [
    { label: 'Chat feature files', enabled: true },
    { label: 'main entry style imports', enabled: Boolean(mainEntry) },
    { label: '.env.example', enabled: true },
    { label: 'package.json', enabled: true },
    ...(options.mount ? [{ label: 'App.vue mount', enabled: fs.existsSync(path.join(targetDir, 'src/App.vue')) }] : []),
  ].map((item) => ({ ...item, mainEntry }))
}

async function selectFileChanges(targetDir, options) {
  const files = getChatFeatureChoices(targetDir, options)
  if (options.yes || options.dryRun || options.nonInteractive)
    return files.filter((file) => file.enabled).map((file) => file.label)
  return checkbox({
    message: 'Select which file changes to apply (all selected by default):',
    choices: files.map((file) => ({
      name: file.enabled ? file.label : `${file.label} (not available)`,
      value: file.label,
      checked: file.enabled,
      disabled: !file.enabled,
    })),
  })
}

function isSelected(selectedFiles, label) {
  return selectedFiles.includes(label)
}

function getDependencyPlan(pkg) {
  const preview = JSON.parse(JSON.stringify(pkg))

  return Object.entries(DEPENDENCIES).map(([name, version]) => ({
    name,
    result: ensureDependency(preview, name, version),
  }))
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
  if (type === 'merge') return '~'
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

function validateSelection(selectedFiles, pkg, featureInspection, mountPlan, allowManualMount) {
  const featureFilesSelected = isSelected(selectedFiles, 'Chat feature files')
  const featureFilesMissing = featureInspection.some((file) => file.type === 'create')

  if (!featureFilesSelected && featureFilesMissing && isSelected(selectedFiles, 'main entry style imports')) {
    throw new Error('Select Chat feature files before adding the local feature style import.')
  }

  if (!featureFilesSelected && featureFilesMissing && isSelected(selectedFiles, 'App.vue mount')) {
    throw new Error('Select Chat feature files before mounting TinyRobotChat in App.vue.')
  }

  if (isSelected(selectedFiles, 'App.vue mount') && mountPlan?.type === 'manual' && !allowManualMount) {
    throw new Error(`cannot safely mount TinyRobotChat: ${mountPlan.reason}`)
  }

  if (isSelected(selectedFiles, 'package.json')) return

  const dependencyChanges = getDependencyPlan(pkg).filter(({ result }) => result.type !== 'skipped')
  if (dependencyChanges.length > 0 && (featureFilesSelected || isSelected(selectedFiles, 'main entry style imports'))) {
    throw new Error(
      'Select package.json when adding the chat feature or its style imports so required dependencies can be checked.',
    )
  }
}

function prepareChanges(targetDir, selectedFiles, context) {
  const { featureInspection, mainFile, mountPlan, pkgPath, pkg, allowConflicts } = context
  const changes = []
  const results = { featureInspection, style: null, env: null, dependencies: [], mount: null, dependencyChanged: false }

  if (isSelected(selectedFiles, 'Chat feature files')) {
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
  }

  if (isSelected(selectedFiles, 'main entry style imports')) {
    if (!mainFile) results.style = { type: 'unavailable' }
    else {
      const styleResult = ensureStyleImportsContent(
        fs.readFileSync(mainFile, 'utf-8'),
        "import './tiny-robot-chat/index.css'",
      )
      results.style = styleResult
      if (styleResult.type === 'inserted')
        addFileChange(changes, mainFile, styleResult.content, 'Inserted TinyRobot and Chat feature style imports')
    }
  }

  if (isSelected(selectedFiles, '.env.example')) {
    results.env = getEnvPlan(targetDir)
    if (results.env.type === 'create')
      addFileChange(changes, results.env.targetFile, results.env.content, 'Created .env.example')
    if (results.env.type === 'merged')
      addFileChange(changes, results.env.targetFile, results.env.content, `Added ${results.env.added} env variables`)
  }

  if (isSelected(selectedFiles, 'package.json')) {
    for (const [name, version] of Object.entries(DEPENDENCIES)) {
      const result = ensureDependency(pkg, name, version)
      if (result.type === 'conflict' && !allowConflicts) throw new Error(`${name}: ${result.reason}`)
      results.dependencies.push({ name, result })
      results.dependencyChanged ||= result.type !== 'skipped'
    }
    if (results.dependencyChanged)
      addFileChange(changes, pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'Updated package.json')
  }

  if (isSelected(selectedFiles, 'App.vue mount')) {
    results.mount = mountPlan
    if (mountPlan.type === 'merge')
      addFileChange(
        changes,
        path.join(targetDir, 'src/App.vue'),
        mountPlan.content,
        'Mounted TinyRobotChat in src/App.vue',
      )
  }

  return { changes, results }
}

function printChangeResults(targetDir, selectedFiles, results) {
  if (isSelected(selectedFiles, 'Chat feature files')) {
    for (const file of results.featureInspection) {
      if (file.type === 'create') logSuccess(`Created ${formatRelative(file.target, targetDir)}`)
      else if (file.type === 'skipped') logSkip(`${formatRelative(file.target, targetDir)} already exists`)
    }
  } else logSkippedSelection('Chat feature files')

  if (isSelected(selectedFiles, 'main entry style imports')) {
    if (results.style?.type === 'unavailable') logUnavailable('main entry style imports (main.ts/js not found)')
    else if (results.style?.type === 'inserted') logSuccess('Inserted TinyRobot and Chat feature style imports')
    else logSkip('TinyRobot and Chat feature style imports already exist')
  } else logSkippedSelection('main entry style imports')

  if (isSelected(selectedFiles, '.env.example')) {
    if (results.env?.type === 'unavailable') logUnavailable('.env.example (template .env.example not found)')
    else if (results.env?.type === 'create') logSuccess('Created .env.example')
    else if (results.env?.type === 'merged') logSuccess(`Added ${results.env.added} env variables`)
    else logSkip('.env.example already contains required variables')
  } else logSkippedSelection('.env.example')

  if (isSelected(selectedFiles, 'package.json')) {
    for (const { name, result } of results.dependencies) printDependencyResult(result, name)
    if (!results.dependencyChanged) logSkip('package.json already contains required dependencies')
  } else logSkippedSelection('package.json')

  if (isSelected(selectedFiles, 'App.vue mount')) {
    if (results.mount?.type === 'merge') logSuccess('Mounted TinyRobotChat in src/App.vue')
    else logSkip('App.vue already mounts TinyRobotChat')
  }
}

async function addFeature(targetDir, type, options) {
  invariant(type === 'chat', `unsupported feature: ${type}`)
  const mountRequested = options.mount !== false
  const featureFiles = getChatFeatureFiles(targetDir)
  const mainFile = findMainEntry(targetDir)
  const mountPlan = mountRequested ? planMount(targetDir) : null
  const pkgPath = path.join(targetDir, 'package.json')
  invariant(fs.existsSync(pkgPath), 'package.json not found.')
  invariant(fs.statSync(pkgPath).isFile(), 'package.json is not a file.')
  const pkg = readPackageJson(pkgPath)
  const featureInspection = inspectFeatureFiles(featureFiles)
  const selectedFiles = await selectFileChanges(targetDir, {
    ...options,
    mount: mountRequested,
    nonInteractive: options.nonInteractive,
  })

  validateSelection(selectedFiles, pkg, featureInspection, mountPlan, options.dryRun)
  const prepared = prepareChanges(targetDir, selectedFiles, {
    featureInspection,
    mainFile,
    mountPlan,
    pkgPath,
    pkg,
    allowConflicts: options.dryRun,
  })

  if (options.dryRun) {
    console.log('\nChange Plan\n')
    for (const file of featureInspection)
      console.log(
        `  ${file.type === 'create' ? '+' : file.type === 'conflict' ? '!' : '○'} ${formatRelative(file.target, targetDir)}`,
      )
    console.log(
      `  ${mainFile ? formatPlanStatus(prepared.results.style?.type) : '!'} ${mainFile ? formatRelative(mainFile, targetDir) : 'src/main.ts or src/main.js'} (style imports)`,
    )
    console.log(
      `  ${formatPlanStatus(prepared.results.env?.type ?? 'unavailable')} .env.example (${prepared.results.env?.type ?? 'not selected'})`,
    )
    const dependencyPlan =
      prepared.results.dependencies.length > 0 ? prepared.results.dependencies : getDependencyPlan(pkg)
    for (const { name, result } of dependencyPlan) {
      const status = result.type === 'added' || result.type === 'updated' ? '~' : result.type === 'conflict' ? '!' : '○'
      console.log(`  ${status} package.json (${result.type}: ${name})`)
    }
    if (mountPlan)
      console.log(
        `  ${mountPlan.type === 'merge' ? '~' : mountPlan.type === 'manual' ? '!' : '○'} src/App.vue (mount: ${mountPlan.type})`,
      )
    printManualMcpSetup()
    return
  }

  if (selectedFiles.length === 0) {
    logSkip('No changes selected.')
    return
  }
  console.log('\nChange Results\n')
  applyChanges(prepared.changes)
  printChangeResults(targetDir, selectedFiles, prepared.results)
  if (prepared.changes.length > 0) console.log(`\nSuccessfully added "${type}" feature to ${targetDir}`)
  else logSkip('No changes were necessary.')
  printNextSteps({
    mainFile,
    dependencyChanged: prepared.results.dependencyChanged,
    mounted: isSelected(selectedFiles, 'App.vue mount') && mountPlan?.type !== 'manual',
    selectedFiles,
    featureFilesSelected: isSelected(selectedFiles, 'Chat feature files'),
  })
}

function printNextSteps({ mainFile, dependencyChanged, mounted, selectedFiles, featureFilesSelected }) {
  const steps = []
  if (featureFilesSelected && !mainFile)
    steps.push("Import the package styles and './tiny-robot-chat/index.css' in your application entry file.")
  if (featureFilesSelected && !mounted) {
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
  }
  if (isSelected(selectedFiles, '.env.example'))
    steps.push('Copy .env.example to .env.local and configure your AI provider API keys.')
  if (featureFilesSelected)
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
    .option('--yes', 'apply all safe changes without prompts')
    .option('--dry-run', 'print the change plan without modifying files')
    .option('--mount', 'safely mount TinyRobotChat in src/App.vue (default)')
    .option('--no-mount', 'keep App.vue unchanged and print the mount snippet')
    .action(async (type, options) => {
      try {
        const nonInteractive = Boolean(options.yes || options.dryRun || !process.stdout.isTTY)
        const targetDir = await resolveTargetPackage(process.cwd(), nonInteractive)
        await addFeature(targetDir, type, { ...options, nonInteractive })
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

export { DEPENDENCIES, ensureDependency, ensureStyleImports, getChatFeatureFiles, planMount, resolveTargetPackage }

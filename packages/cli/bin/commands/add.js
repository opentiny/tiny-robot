import { checkbox, select } from '@inquirer/prompts'
import { Argument } from 'commander'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import {
  copyFile,
  findProjectRoot,
  findSubPackageRoot,
  findWorkspacePackages,
  findWorkspaceRoot,
  getTemplateDir,
  invariant,
  listPackages,
  logSkip,
  logSuccess,
  mergeEnvFile,
} from '../utils.js'

const TARGET_VERSION = '0.5.2-alpha.10'
const CHAT_ADD_FEATURE_DIR = 'src/tiny-robot-chat'
const DEPENDENCIES = {
  '@opentiny/tiny-robot': TARGET_VERSION,
  '@opentiny/tiny-robot-chat': TARGET_VERSION,
  '@opentiny/tiny-robot-kit': TARGET_VERSION,
  '@opentiny/tiny-robot-svgs': TARGET_VERSION,
  '@vueuse/core': '13.1.0',
}
const PACKAGE_STYLE_IMPORTS = [
  "import '@opentiny/tiny-robot/dist/style.css'",
  "import '@opentiny/tiny-robot-chat/dist/style.css'",
]
const MCP_PROXY_ENTRY = `'/modelcontextprotocol-mcp': {
  target: 'https://modelcontextprotocol.io/mcp',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\\/modelcontextprotocol-mcp/, ''),
},`

function logUnavailable(label) {
  logSkip(`${label} could not be applied`)
}

function logSkippedSelection(label) {
  logSkip(`${label} change was not selected`)
}

async function resolveTargetPackage(cwd, nonInteractive) {
  const workspaceRoot = findWorkspaceRoot(cwd)

  if (workspaceRoot) {
    const subPackageRoot = findSubPackageRoot(cwd, workspaceRoot)

    if (subPackageRoot) return subPackageRoot

    const workspacePatterns = findWorkspacePackages(workspaceRoot)
    const packageDirs = listPackages(workspaceRoot, workspacePatterns)
    invariant(packageDirs.length > 0, 'no packages found in workspace.')

    if (nonInteractive) {
      invariant(
        packageDirs.length === 1,
        'multiple packages found; run add from the target package directory when using --yes or --dry-run.',
      )
      return packageDirs[0]
    }

    return select({
      message: 'Multi-package workspace detected, select a target package:',
      choices: packageDirs.map((dir) => ({ name: path.basename(dir), value: dir })),
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
  return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
}

function writePackageJson(pkgPath, pkg) {
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
}

function findMainEntry(targetDir) {
  for (const file of ['src/main.ts', 'src/main.js']) {
    const fullPath = path.join(targetDir, file)
    if (fs.existsSync(fullPath)) return fullPath
  }
  return null
}

function insertImport(content, importStatement) {
  const lines = content.split('\n')
  if (lines.some((line) => line.trim() === importStatement)) return content

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
  return lines.join('\n')
}

function ensureStyleImports(mainFile, featureStyleImport) {
  const before = fs.readFileSync(mainFile, 'utf-8')
  let after = before
  for (const styleImport of [...PACKAGE_STYLE_IMPORTS, featureStyleImport]) {
    after = insertImport(after, styleImport)
  }
  if (after !== before) fs.writeFileSync(mainFile, after)
  return { type: after === before ? 'skipped' : 'inserted' }
}

function findDependency(pkg, name) {
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    if (pkg[section]?.[name]) return { section, version: pkg[section][name] }
  }
  return null
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
  const existing = findDependency(pkg, name)
  if (!existing) {
    pkg.dependencies ??= {}
    pkg.dependencies = insertDependencyOrdered(pkg.dependencies, name, targetVersion)
    return { type: 'added', to: targetVersion, section: 'dependencies' }
  }

  if (existing.version === targetVersion || existing.version.startsWith('workspace:')) {
    return { type: 'skipped', section: existing.section, version: existing.version }
  }

  pkg[existing.section][name] = targetVersion
  return {
    type: 'updated',
    section: existing.section,
    from: existing.version,
    to: targetVersion,
  }
}

function printDependencyResult(result, name) {
  if (result.type === 'added') {
    logSuccess(`Added ${name}@${result.to}`)
  } else if (result.type === 'updated') {
    logSuccess(`Updated ${name} from ${result.from} to ${result.to}`)
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

function getViteConfigFile(targetDir) {
  for (const name of ['vite.config.ts', 'vite.config.js', 'vite.config.mts', 'vite.config.mjs']) {
    const file = path.join(targetDir, name)
    if (fs.existsSync(file)) return file
  }
  return path.join(targetDir, 'vite.config.ts')
}

function findMatchingBrace(content, openIndex) {
  let depth = 0
  let quote = null
  let escaped = false
  for (let i = openIndex; i < content.length; i++) {
    const char = content[i]
    if (quote) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) quote = null
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === '{') depth += 1
    if (char === '}' && --depth === 0) return i
  }
  return -1
}

function getObjectRange(content, propertyName, start = 0) {
  const match = new RegExp(`\\b${propertyName}\\s*:\\s*\\{`).exec(content.slice(start))
  if (!match) return null
  const openIndex = start + match.index + match[0].lastIndexOf('{')
  const closeIndex = findMatchingBrace(content, openIndex)
  return closeIndex === -1 ? null : { openIndex, closeIndex }
}

function proxyEntry(indent) {
  return MCP_PROXY_ENTRY.trim().replaceAll('\n', `\n${indent}`)
}

function proxyBlock(indent) {
  return `${indent}proxy: {\n${indent}  ${proxyEntry(`${indent}  `)}\n${indent}},`
}

function insertObjectProperty(content, closeIndex, property) {
  const beforeClose = content.slice(0, closeIndex)
  const trimmed = beforeClose.trimEnd()
  const separator = trimmed && !trimmed.endsWith('{') && !trimmed.endsWith(',') ? ',' : ''
  return `${content.slice(0, trimmed.length)}${separator}\n${property}${content.slice(closeIndex)}`
}

function createViteConfig() {
  return `import { defineConfig } from 'vite'\nimport vue from '@vitejs/plugin-vue'\n\nexport default defineConfig({\n  plugins: [vue()],\n  server: {\n${proxyBlock('    ')}\n  },\n})\n`
}

function planViteProxy(configFile) {
  if (!fs.existsSync(configFile)) return { type: 'create', content: createViteConfig() }
  const before = fs.readFileSync(configFile, 'utf-8')
  if (before.includes('/modelcontextprotocol-mcp')) return { type: 'skipped', content: before }
  if (!/defineConfig\s*\(/.test(before)) return { type: 'manual', content: before }

  const rootOpenIndex = before.indexOf('{', before.indexOf('defineConfig'))
  const rootCloseIndex = rootOpenIndex === -1 ? -1 : findMatchingBrace(before, rootOpenIndex)
  if (rootOpenIndex === -1 || rootCloseIndex === -1) return { type: 'manual', content: before }

  const serverRange = getObjectRange(before, 'server', rootOpenIndex)
  let after = before
  if (!serverRange || serverRange.openIndex > rootCloseIndex) {
    const insertion = `  server: {\n${proxyBlock('    ')}\n  },`
    after = insertObjectProperty(before, rootCloseIndex, insertion)
    return { type: 'merge', content: after }
  }

  const serverContent = before.slice(serverRange.openIndex + 1, serverRange.closeIndex)
  const proxyRange = getObjectRange(serverContent, 'proxy')
  if (!proxyRange) {
    if (/\bproxy\s*:/.test(serverContent)) return { type: 'manual', content: before }

    const insertion = proxyBlock('    ')
    after = insertObjectProperty(before, serverRange.closeIndex, insertion)
    return { type: 'merge', content: after }
  }

  const proxyOpen = serverRange.openIndex + 1 + proxyRange.openIndex
  const proxyClose = serverRange.openIndex + 1 + proxyRange.closeIndex
  const proxyValue = before.slice(proxyOpen + 1, proxyClose)
  const proxyPrefix = before.slice(0, proxyClose)
  const trailingWhitespace = proxyPrefix.match(/\s*$/)?.[0] ?? ''
  const insertionPoint = proxyClose - trailingWhitespace.length
  const separator = proxyValue.trim() ? (proxyValue.trim().endsWith(',') ? '\n' : ',\n') : '\n'
  const insertion = `${separator}      ${proxyEntry('      ')}${trailingWhitespace}`
  after = `${before.slice(0, insertionPoint)}${insertion}${before.slice(proxyClose)}`
  return { type: 'merge', content: after }
}

function planMount(targetDir) {
  const appFile = path.join(targetDir, 'src/App.vue')
  if (!fs.existsSync(appFile)) return { type: 'manual', reason: 'src/App.vue was not found' }
  const before = fs.readFileSync(appFile, 'utf-8')
  if (/<TinyRobotChat(?:\s|\/?>)/.test(before)) return { type: 'skipped', content: before }

  if (before.lastIndexOf('</template>') === -1)
    return { type: 'manual', reason: 'App.vue does not contain a template block' }
  const importStatement = "import TinyRobotChat from './tiny-robot-chat/TinyRobotChat.vue'"
  let after = before
  const setupMatch = /<script\s+setup(?:\s[^>]*)?>/.exec(before)
  if (setupMatch) {
    if (!before.includes(importStatement)) {
      const insertionIndex = setupMatch.index + setupMatch[0].length
      after = `${before.slice(0, insertionIndex)}\n${importStatement}${before.slice(insertionIndex)}`
    }
  } else if (/<script(?:\s[^>]*)?>/.test(before)) {
    return { type: 'manual', reason: 'App.vue has a non-setup script block' }
  } else {
    after = `<script setup lang="ts">\n${importStatement}\n</script>\n\n${before}`
  }
  const templateClose = after.lastIndexOf('</template>')
  after = `${after.slice(0, templateClose)}  <TinyRobotChat />\n${after.slice(templateClose)}`
  return { type: 'merge', content: after }
}

function inspectFeatureFiles(files) {
  return files.map((file) => {
    if (!fs.existsSync(file.target)) return { ...file, type: 'create' }
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
    { label: 'Vite MCP proxy', enabled: true },
    { label: '.env', enabled: true },
    { label: 'package.json', enabled: true },
    ...(options.mount ? [{ label: 'App.vue mount', enabled: fs.existsSync(path.join(targetDir, 'src/App.vue')) }] : []),
  ].map((item) => ({ ...item, mainEntry }))
}

async function selectFileChanges(targetDir, options) {
  const files = getChatFeatureChoices(targetDir, options)
  if (options.yes || options.dryRun) return files.filter((file) => file.enabled).map((file) => file.label)
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

function copyFeatureFiles(files, targetDir) {
  for (const file of inspectFeatureFiles(files)) {
    if (file.type === 'conflict')
      throw new Error(`file conflict: ${formatRelative(file.target, targetDir)} already exists with different content`)
    if (file.type === 'create') {
      copyFile(file.source, file.target)
      logSuccess(`Created ${formatRelative(file.target, targetDir)}`)
    } else logSkip(`${formatRelative(file.target, targetDir)} already exists`)
  }
}

function applyMount(targetDir, mountPlan) {
  if (mountPlan.type === 'manual') {
    logUnavailable(`App.vue mount (${mountPlan.reason})`)
    return
  }
  if (mountPlan.type === 'skipped') {
    logSkip('App.vue already mounts TinyRobotChat')
    return
  }
  fs.writeFileSync(path.join(targetDir, 'src/App.vue'), mountPlan.content)
  logSuccess('Mounted TinyRobotChat in src/App.vue')
}

async function addFeature(targetDir, type, options) {
  invariant(type === 'chat', `unsupported feature: ${type}`)
  const mountRequested = options.mount !== false
  const featureFiles = getChatFeatureFiles(targetDir)
  const mainFile = findMainEntry(targetDir)
  const viteConfig = getViteConfigFile(targetDir)
  const vitePlan = planViteProxy(viteConfig)
  const mountPlan = mountRequested ? planMount(targetDir) : null
  const selectedFiles = await selectFileChanges(targetDir, { ...options, mount: mountRequested })

  if (options.dryRun) {
    console.log('\nChange Plan\n')
    for (const file of inspectFeatureFiles(featureFiles))
      console.log(
        `  ${file.type === 'create' ? '+' : file.type === 'conflict' ? '!' : '○'} ${formatRelative(file.target, targetDir)}`,
      )
    console.log(
      `  ${vitePlan.type === 'create' ? '+' : vitePlan.type === 'manual' ? '!' : vitePlan.type === 'skipped' ? '○' : '~'} ${formatRelative(viteConfig, targetDir)} (${vitePlan.type})`,
    )
    console.log(
      `  ${mainFile ? '~' : '!'} ${mainFile ? formatRelative(mainFile, targetDir) : 'src/main.ts or src/main.js'} (style imports)`,
    )
    if (mountPlan)
      console.log(
        `  ${mountPlan.type === 'merge' ? '~' : mountPlan.type === 'manual' ? '!' : '○'} src/App.vue (mount: ${mountPlan.type})`,
      )
    return
  }

  if (selectedFiles.length === 0) {
    logSkip('No changes selected.')
    return
  }
  if (isSelected(selectedFiles, 'Chat feature files')) {
    const conflicts = inspectFeatureFiles(featureFiles).filter((file) => file.type === 'conflict')
    if (conflicts.length > 0)
      throw new Error(
        `file conflicts detected:\n${conflicts.map((file) => `  - ${formatRelative(file.target, targetDir)}`).join('\n')}\nResolve the conflicts and run add chat again.`,
      )
  }
  if (isSelected(selectedFiles, 'Vite MCP proxy') && vitePlan.type === 'manual') {
    throw new Error(
      `cannot safely merge MCP proxy into ${formatRelative(viteConfig, targetDir)}; add the proxy manually:\n\n${MCP_PROXY_ENTRY}`,
    )
  }
  if (isSelected(selectedFiles, 'App.vue mount') && mountPlan?.type === 'manual')
    throw new Error(`cannot safely mount TinyRobotChat: ${mountPlan.reason}`)

  console.log('\nChange Results\n')
  if (isSelected(selectedFiles, 'Chat feature files')) copyFeatureFiles(featureFiles, targetDir)
  else logSkippedSelection('Chat feature files')

  if (isSelected(selectedFiles, 'main entry style imports')) {
    if (!mainFile) logUnavailable('main entry style imports (main.ts/js not found)')
    else {
      const result = ensureStyleImports(mainFile, "import './tiny-robot-chat/index.css'")
      result.type === 'inserted'
        ? logSuccess('Inserted TinyRobot and Chat feature style imports')
        : logSkip('TinyRobot and Chat feature style imports already exist')
    }
  } else logSkippedSelection('main entry style imports')

  if (isSelected(selectedFiles, 'Vite MCP proxy')) {
    if (vitePlan.type === 'create' || vitePlan.type === 'merge') {
      fs.writeFileSync(viteConfig, vitePlan.content)
      logSuccess(
        `${vitePlan.type === 'create' ? 'Created' : 'Merged'} ${formatRelative(viteConfig, targetDir)} with MCP proxy`,
      )
    } else logSkip('MCP proxy already exists')
  } else logSkippedSelection('Vite MCP proxy')

  if (isSelected(selectedFiles, '.env')) {
    const envTemplate = getTemplateFile('.env.example')
    if (!fs.existsSync(envTemplate)) logUnavailable('.env (template .env.example not found)')
    else {
      const envResult = mergeEnvFile(envTemplate, path.join(targetDir, '.env'))
      envResult.type === 'created'
        ? logSuccess('Created .env')
        : envResult.type === 'merged'
          ? logSuccess(`Added ${envResult.added} env variables`)
          : logSkip('.env already contains required variables')
    }
  } else logSkippedSelection('.env')

  const pkgPath = path.join(targetDir, 'package.json')
  invariant(fs.existsSync(pkgPath), 'package.json not found.')
  const pkg = readPackageJson(pkgPath)
  let dependencyChanged = false
  if (isSelected(selectedFiles, 'package.json')) {
    for (const [name, version] of Object.entries(DEPENDENCIES)) {
      const result = ensureDependency(pkg, name, version)
      dependencyChanged ||= result.type !== 'skipped'
      printDependencyResult(result, name)
    }
    if (dependencyChanged) writePackageJson(pkgPath, pkg)
  } else logSkippedSelection('package.json')

  if (isSelected(selectedFiles, 'App.vue mount')) applyMount(targetDir, mountPlan)
  console.log(`\nSuccessfully added "${type}" feature to ${targetDir}`)
  printNextSteps({ targetDir, mainFile, dependencyChanged, mounted: mountRequested && mountPlan?.type !== 'manual' })
}

function printNextSteps({ targetDir, mainFile, dependencyChanged, mounted }) {
  const steps = []
  if (!mainFile)
    steps.push("Import the package styles and './tiny-robot-chat/index.css' in your application entry file.")
  if (!mounted) {
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
  steps.push(`Configure your AI provider API keys in ${path.join(targetDir, '.env')}`)
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
        const nonInteractive = Boolean(options.yes || options.dryRun)
        const targetDir = await resolveTargetPackage(process.cwd(), nonInteractive)
        await addFeature(targetDir, type, options)
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

export { DEPENDENCIES, ensureDependency, ensureStyleImports, getChatFeatureFiles, planMount, planViteProxy }

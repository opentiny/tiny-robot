import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pc from 'picocolors'
import yaml from 'yaml'

const TEMPLATE_PLACEHOLDER = '__PROJECT_NAME__'
const RUNTIME_VERSION_PLACEHOLDER = '__TINY_ROBOT_VERSION__'

export const BUILTIN_TEMPLATES = ['basic']
export const DEFAULT_TEMPLATE = 'basic'
export const DEFAULT_PROJECT_NAME = 'tiny-robot-app'

const WORKSPACE_FILES = ['pnpm-workspace.yaml', 'pnpm-workspace.yml']

const IGNORE_COPY_FILES = ['node_modules', '.git', 'dist', '.DS_Store', '.vite']

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const templatesRoot = path.resolve(__dirname, '../templates')

function createStatusLabel(icon, label, color) {
  return `${color(icon)} ${color(label)}`
}

export function logSuccess(message) {
  console.log(`${createStatusLabel('✔', 'SUCCESS', pc.green)} ${message}`)
}

export function logSkip(message) {
  console.log(`${createStatusLabel('○', 'SKIPPED', pc.dim)} ${message}`)
}

export function logError(message) {
  console.log(`${createStatusLabel('✖', 'FAILED', pc.red)} ${message}`)
}

export function invariant(condition, message) {
  if (!condition) throw new Error(message)
}

export function exists(file) {
  return fs.existsSync(file)
}

function isPackageDir(dir) {
  return exists(path.join(dir, 'package.json'))
}

function findUp(startDir, matcher) {
  let dir = path.resolve(startDir)

  for (;;) {
    if (matcher(dir)) {
      return dir
    }

    const parent = path.dirname(dir)

    if (parent === dir) {
      return null
    }

    dir = parent
  }
}

export function getAvailableTemplates() {
  if (!exists(templatesRoot)) {
    return []
  }

  return fs
    .readdirSync(templatesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && BUILTIN_TEMPLATES.includes(entry.name))
    .map((entry) => entry.name)
}

export function getTemplateDir(templateName) {
  return path.join(templatesRoot, templateName)
}

export function validateProjectName(name) {
  return /^[a-z0-9-]+$/.test(name)
}

export function copyTemplate(sourceDir, targetDir) {
  copyDirectory(sourceDir, targetDir)
}

export function copyDirectory(sourceDir, targetDir) {
  fs.cpSync(sourceDir, targetDir, {
    recursive: true,
    filter: (source) => {
      return !IGNORE_COPY_FILES.includes(path.basename(source))
    },
  })
}

function renameSpecialFiles(targetDir) {
  const files = [['_gitignore', '.gitignore']]

  for (const [fromName, toName] of files) {
    const from = path.join(targetDir, fromName)
    const to = path.join(targetDir, toName)

    if (exists(from)) {
      fs.renameSync(from, to)
    }
  }
}

function replaceTemplateVariables(targetDir, variables) {
  const replaceFiles = ['package.json', 'README.md', 'index.html']

  for (const relativePath of replaceFiles) {
    const file = path.join(targetDir, relativePath)

    if (!exists(file)) {
      continue
    }

    let content = fs.readFileSync(file, 'utf-8')

    for (const [key, value] of Object.entries(variables)) {
      content = content.replaceAll(key, value)
    }

    fs.writeFileSync(file, content, 'utf-8')
  }
}

export function scaffoldProject(templateDir, targetDir, projectName, runtimeVersion) {
  copyTemplate(templateDir, targetDir)

  renameSpecialFiles(targetDir)

  replaceTemplateVariables(targetDir, {
    [TEMPLATE_PLACEHOLDER]: projectName,
    [RUNTIME_VERSION_PLACEHOLDER]: runtimeVersion,
  })
}

function resolveWorkspaceFile(workspaceRoot) {
  for (const name of WORKSPACE_FILES) {
    const file = path.join(workspaceRoot, name)

    if (exists(file)) {
      return file
    }
  }

  return null
}

export function findWorkspaceRoot(cwd) {
  return findUp(cwd, (dir) => {
    return WORKSPACE_FILES.some((name) => {
      return exists(path.join(dir, name))
    })
  })
}

export function findProjectRoot(cwd) {
  return findUp(cwd, (dir) => {
    return isPackageDir(dir)
  })
}

export function findSubPackageRoot(cwd, workspaceRoot) {
  let dir = path.resolve(cwd)
  const root = path.resolve(workspaceRoot)

  for (;;) {
    if (dir === root) return null
    if (isPackageDir(dir)) return dir

    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

export function findWorkspacePackages(workspaceRoot) {
  const workspaceFile = resolveWorkspaceFile(workspaceRoot)

  if (!workspaceFile) {
    return undefined
  }

  try {
    const content = fs.readFileSync(workspaceFile, 'utf8')

    const config = yaml.parse(content)

    if (config === null || typeof config !== 'object' || Array.isArray(config)) {
      throw new Error('workspace configuration must be a YAML mapping')
    }

    if (!Object.prototype.hasOwnProperty.call(config, 'packages')) {
      return undefined
    }

    if (!Array.isArray(config.packages)) {
      throw new Error('packages must be an array')
    }

    if (config.packages.some((pattern) => typeof pattern !== 'string' || pattern.trim().length === 0)) {
      throw new Error('packages entries must be non-empty strings')
    }

    return config.packages.map((pattern) => pattern.trim())
  } catch (error) {
    const detail = error instanceof Error ? `: ${error.message}` : ''
    throw new Error(`Failed to read ${path.basename(workspaceFile)}${detail}`)
  }
}

const WORKSPACE_SCAN_IGNORES = new Set(['.git', 'node_modules'])

function normalizeWorkspacePattern(pattern) {
  let normalized = pattern.replaceAll('\\', '/').trim()
  if (normalized.startsWith('./')) normalized = normalized.slice(2)
  return normalized.replace(/\/$/, '')
}

function globSource(pattern) {
  let source = ''

  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index]

    if (char === '*') {
      if (pattern[index + 1] === '*') {
        while (pattern[index + 1] === '*') index += 1
        if (pattern[index + 1] === '/') {
          source += '(?:.*/)?'
          index += 1
        } else {
          source += '.*'
        }
      } else {
        source += '[^/]*'
      }
      continue
    }

    if (char === '?') {
      source += '[^/]'
      continue
    }

    if (char === '{') {
      const close = pattern.indexOf('}', index + 1)
      if (close !== -1) {
        const alternatives = pattern
          .slice(index + 1, close)
          .split(',')
          .map((item) => globSource(item))
        source += `(?:${alternatives.join('|')})`
        index = close
        continue
      }
    }

    if (char === '[') {
      const close = pattern.indexOf(']', index + 1)
      if (close !== -1) {
        source += pattern.slice(index, close + 1)
        index = close
        continue
      }
    }

    source += char.replace(/[\\.^$+()|]/g, '\\$&')
  }

  return source
}

function matchesWorkspacePattern(relativePath, pattern) {
  const normalized = normalizeWorkspacePattern(pattern)
  if (normalized === '.') return relativePath === ''
  return new RegExp(`^${globSource(normalized)}$`).test(relativePath)
}

function collectPackageDirs(workspaceRoot) {
  const packageDirs = []

  const visit = (dir) => {
    if (isPackageDir(dir)) packageDirs.push(dir)

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || WORKSPACE_SCAN_IGNORES.has(entry.name)) continue
      visit(path.join(dir, entry.name))
    }
  }

  visit(workspaceRoot)
  return packageDirs
}

export function listPackages(workspaceRoot, patterns = undefined) {
  const configuredPatterns = patterns ?? ['**']
  const includePatterns = configuredPatterns.filter((pattern) => !pattern.startsWith('!'))
  const excludePatterns = configuredPatterns
    .filter((pattern) => pattern.startsWith('!'))
    .map((pattern) => pattern.slice(1))

  if (includePatterns.length === 0) return []

  const root = path.resolve(workspaceRoot)
  const packageDirs = collectPackageDirs(root)
  const matched = packageDirs.filter((dir) => {
    const relativePath = path.relative(root, dir).replaceAll('\\', '/')
    return (
      includePatterns.some((pattern) => matchesWorkspacePattern(relativePath, pattern)) &&
      !excludePatterns.some((pattern) => matchesWorkspacePattern(relativePath, pattern))
    )
  })

  return [...new Set(matched)].sort((left, right) => {
    const leftRelative = path.relative(root, left)
    const rightRelative = path.relative(root, right)
    return leftRelative.localeCompare(rightRelative)
  })
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), {
    recursive: true,
  })
}

export function copyFile(from, to) {
  ensureDir(to)

  fs.copyFileSync(from, to)
}

function parseEnv(content) {
  const map = new Map()

  for (const line of content.split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const index = trimmed.indexOf('=')

    if (index === -1) {
      continue
    }

    const key = trimmed.slice(0, index).trim()

    map.set(key, trimmed)
  }

  return map
}

export function mergeEnvFile(templateFile, targetFile) {
  if (!fs.existsSync(targetFile)) {
    copyFile(templateFile, targetFile)

    return {
      type: 'created',
    }
  }

  const templateContent = fs.readFileSync(templateFile, 'utf-8')

  const targetContent = fs.readFileSync(targetFile, 'utf-8')

  const result = mergeEnvContent(templateContent, targetContent)

  if (result.type === 'merged') {
    fs.writeFileSync(targetFile, result.content)
  }

  return {
    type: result.type,
    ...(result.added === undefined ? {} : { added: result.added }),
  }
}

export function mergeEnvContent(templateContent, targetContent) {
  const templateEnv = parseEnv(templateContent)

  const targetEnv = parseEnv(targetContent)

  const appendLines = []

  for (const [key, line] of templateEnv) {
    if (!targetEnv.has(key)) {
      appendLines.push(line)
    }
  }

  if (appendLines.length === 0) {
    return {
      type: 'skipped',
    }
  }

  const targetTrimmed = targetContent.replace(/\s*$/, '')

  const nextContent = targetTrimmed ? `${targetTrimmed}\n${appendLines.join('\n')}\n` : `${appendLines.join('\n')}\n`

  return {
    type: 'merged',
    added: appendLines.length,
    content: nextContent,
  }
}

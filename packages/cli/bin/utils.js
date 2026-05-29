import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pc from 'picocolors'

const TEMPLATE_PLACEHOLDER = '__PROJECT_NAME__'

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
  if (!condition) {
    console.error(`Error: ${message}`)
    process.exit(1)
  }
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
  const replaceFiles = ['package.json', 'README.md']

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

export function scaffoldProject(templateDir, targetDir, projectName) {
  copyTemplate(templateDir, targetDir)

  renameSpecialFiles(targetDir)

  replaceTemplateVariables(targetDir, {
    [TEMPLATE_PLACEHOLDER]: projectName,
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
  return findUp(cwd, (dir) => {
    if (dir === workspaceRoot) {
      return false
    }

    return isPackageDir(dir)
  })
}

export function findWorkspacePackages(workspaceRoot) {
  const workspaceFile = resolveWorkspaceFile(workspaceRoot)

  if (!workspaceFile) {
    return []
  }

  const content = fs.readFileSync(workspaceFile, 'utf-8')

  const packages = []

  let inPackages = false

  for (const line of content.split('\n')) {
    const trimmed = line.trim()

    if (trimmed === 'packages:') {
      inPackages = true
      continue
    }

    if (!inPackages) {
      continue
    }

    const match = trimmed.match(/^-\s+(.+)$/)

    if (match) {
      const pattern = match[1]

      if (!pattern.startsWith('!')) {
        packages.push(pattern)
      }

      continue
    }

    if (trimmed && !trimmed.startsWith('#')) {
      break
    }
  }

  return packages
}

function normalizeWorkspacePattern(pattern) {
  return pattern.replace(/\*\*?/g, '').replace(/\/$/, '')
}

export function listPackages(workspaceRoot, patterns) {
  const packageDirs = []

  const addPackage = (dir) => {
    if (isPackageDir(dir)) {
      packageDirs.push(dir)
    }
  }

  for (const pattern of patterns) {
    const base = normalizeWorkspacePattern(pattern)

    const fullPath = path.join(workspaceRoot, base)

    if (!exists(fullPath)) {
      continue
    }

    if (pattern.includes('*')) {
      const entries = fs.readdirSync(fullPath, {
        withFileTypes: true,
      })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          addPackage(path.join(fullPath, entry.name))
        }
      }
    } else {
      addPackage(fullPath)
    }
  }

  return packageDirs
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

  const nextContent = [targetContent.trimEnd(), '', ...appendLines, ''].join('\n')

  fs.writeFileSync(targetFile, nextContent)

  return {
    type: 'merged',
    added: appendLines.length,
  }
}

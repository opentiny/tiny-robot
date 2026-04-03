#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { input, select } from '@inquirer/prompts'
import { Command } from 'commander'

const TEMPLATE_PLACEHOLDER = '__PROJECT_NAME__'
const DEFAULT_TEMPLATE = 'basic'
const DEFAULT_PROJECT_NAME = 'tiny-robot-app'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const templatesRoot = path.resolve(__dirname, '../templates')

function getAvailableTemplates() {
  if (!fs.existsSync(templatesRoot)) {
    return []
  }

  return fs
    .readdirSync(templatesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

function validateProjectName(name) {
  // Keep project naming rules strict for npm package compatibility.
  const npmSafePattern = /^[a-z0-9-]+$/
  return npmSafePattern.test(name)
}

function getTemplateDir(templateName) {
  return path.join(templatesRoot, templateName)
}

async function resolveProjectName(initialProjectName, skipPrompts) {
  if (initialProjectName) {
    return initialProjectName
  }

  if (skipPrompts) {
    return DEFAULT_PROJECT_NAME
  }

  return input({
    message: 'Project name:',
    default: DEFAULT_PROJECT_NAME,
    validate: (value) => {
      if (!value) {
        return 'Project name is required.'
      }
      if (!validateProjectName(value)) {
        return 'Project name can only contain lowercase letters, numbers, and dashes.'
      }
      const targetDir = path.resolve(process.cwd(), value)
      if (fs.existsSync(targetDir)) {
        return `Target directory already exists: ${targetDir}`
      }
      return true
    },
  })
}

async function resolveTemplateName(initialTemplateName, availableTemplates, skipPrompts) {
  if (initialTemplateName) {
    return initialTemplateName
  }

  if (skipPrompts) {
    return availableTemplates.includes(DEFAULT_TEMPLATE) ? DEFAULT_TEMPLATE : availableTemplates[0]
  }

  return select({
    message: 'Template:',
    default: availableTemplates.includes(DEFAULT_TEMPLATE) ? DEFAULT_TEMPLATE : availableTemplates[0],
    choices: availableTemplates.map((templateName) => ({
      name: templateName,
      value: templateName,
    })),
  })
}

function copyTemplate(sourceDir, targetDir) {
  fs.cpSync(sourceDir, targetDir, {
    recursive: true,
    filter: (source) => {
      const name = path.basename(source)
      // Ignore local build artifacts to keep generated projects clean.
      return !['node_modules', '.git', 'dist', '.DS_Store', '.vite'].includes(name)
    },
  })
}

function renameSpecialFiles(targetDir) {
  const from = path.join(targetDir, '_gitignore')
  const to = path.join(targetDir, '.gitignore')

  if (fs.existsSync(from)) {
    fs.renameSync(from, to)
  }
}

function replaceProjectName(targetDir, projectName) {
  const filesToReplace = ['package.json', 'README.md']

  for (const relativeFile of filesToReplace) {
    const absoluteFile = path.join(targetDir, relativeFile)

    if (!fs.existsSync(absoluteFile)) {
      continue
    }

    const content = fs.readFileSync(absoluteFile, 'utf-8')
    const nextContent = content.replaceAll(TEMPLATE_PLACEHOLDER, projectName)
    fs.writeFileSync(absoluteFile, nextContent, 'utf-8')
  }
}

function run() {
  const availableTemplates = getAvailableTemplates()
  if (availableTemplates.length === 0) {
    console.error('Error: no templates found.')
    process.exit(1)
  }

  const program = new Command()
  program
    .name('create-tiny-robot')
    .description('CLI to scaffold TinyRobot product projects')
    .argument('[project-name]', 'project directory name')
    .option('-t, --template <name>', 'template name')
    .showHelpAfterError()
    .parse(process.argv)

  const initialProjectName = program.args[0] ?? ''
  const initialTemplateName = program.opts().template ?? ''
  const skipPrompts = !process.stdout.isTTY

  Promise.resolve()
    .then(async () => {
      const projectName = await resolveProjectName(initialProjectName, skipPrompts)
      const templateName = await resolveTemplateName(initialTemplateName, availableTemplates, skipPrompts)

      if (!validateProjectName(projectName)) {
        console.error('Error: project name can only contain lowercase letters, numbers, and dashes.')
        process.exit(1)
      }

      const templateDir = getTemplateDir(templateName)
      const targetDir = path.resolve(process.cwd(), projectName)

      if (!fs.existsSync(templateDir)) {
        console.error(`Error: template "${templateName}" does not exist. Available: ${availableTemplates.join(', ')}`)
        process.exit(1)
      }

      if (fs.existsSync(targetDir)) {
        console.error(`Error: target directory already exists: ${targetDir}`)
        process.exit(1)
      }

      copyTemplate(templateDir, targetDir)
      renameSpecialFiles(targetDir)
      replaceProjectName(targetDir, projectName)

      console.log('\nProject created successfully!')
      console.log(`\nNext steps:`)
      console.log(`  cd ${projectName}`)
      console.log('  pnpm install')
      console.log('  pnpm dev\n')
    })
    .catch((error) => {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    })
}

run()

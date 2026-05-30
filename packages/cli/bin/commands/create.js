import { input, select } from '@inquirer/prompts'
import path from 'node:path'
import process from 'node:process'

import {
  DEFAULT_PROJECT_NAME,
  DEFAULT_TEMPLATE,
  exists,
  getAvailableTemplates,
  getTemplateDir,
  invariant,
  scaffoldProject,
  validateProjectName,
} from '../utils.js'

async function promptOrFallback(skipPrompt, fallbackValue, promptFactory) {
  if (skipPrompt) {
    return fallbackValue
  }

  return promptFactory()
}

async function resolveProjectName(initialValue, skipPrompt) {
  if (initialValue) {
    return initialValue
  }

  return promptOrFallback(skipPrompt, DEFAULT_PROJECT_NAME, () => {
    return input({
      message: 'Project name:',
      default: DEFAULT_PROJECT_NAME,
      validate(value) {
        if (!value) {
          return 'Project name is required.'
        }

        if (!validateProjectName(value)) {
          return 'Project name can only contain lowercase letters, numbers, and dashes.'
        }

        const targetDir = path.resolve(process.cwd(), value)

        if (exists(targetDir)) {
          return `Target directory already exists: ${targetDir}`
        }

        return true
      },
    })
  })
}

async function resolveTemplateName(initialValue, templates, skipPrompt) {
  if (initialValue) {
    return initialValue
  }

  const fallback = templates.includes(DEFAULT_TEMPLATE) ? DEFAULT_TEMPLATE : templates[0]

  return promptOrFallback(skipPrompt, fallback, () => {
    return select({
      message: 'Template:',
      default: fallback,
      choices: templates.map((templateName) => ({
        name: templateName,
        value: templateName,
      })),
    })
  })
}

async function resolveCreateOptions(initialProjectName, initialTemplateName, skipPrompt) {
  const availableTemplates = getAvailableTemplates()

  invariant(availableTemplates.length > 0, 'no templates found.')

  const projectName = await resolveProjectName(initialProjectName, skipPrompt)

  const templateName = await resolveTemplateName(initialTemplateName, availableTemplates, skipPrompt)

  return {
    projectName,
    templateName,
    availableTemplates,
  }
}

function validateCreateOptions(options) {
  const { projectName, templateName, availableTemplates } = options

  invariant(validateProjectName(projectName), 'project name can only contain lowercase letters, numbers, and dashes.')

  invariant(
    availableTemplates.includes(templateName),
    `template "${templateName}" does not exist. Available: ${availableTemplates.join(', ')}`,
  )

  const templateDir = getTemplateDir(templateName)

  invariant(exists(templateDir), `template directory missing: ${templateDir}`)

  const targetDir = path.resolve(process.cwd(), projectName)

  invariant(!exists(targetDir), `target directory already exists: ${targetDir}`)

  return {
    templateDir,
    targetDir,
  }
}

function printCreateSuccess(projectName) {
  console.log('\nProject created successfully!')
  console.log('\nNext steps:')
  console.log(`  cd ${projectName}`)
  console.log('  pnpm install')
  console.log('  pnpm dev')
  console.log()
}

async function createProject(initialProjectName, initialTemplateName, skipPrompt) {
  const options = await resolveCreateOptions(initialProjectName, initialTemplateName, skipPrompt)

  const { templateDir, targetDir } = validateCreateOptions(options)

  scaffoldProject(templateDir, targetDir, options.projectName)

  printCreateSuccess(options.projectName)
}

export function registerCreateCommand(program) {
  program
    .command('create [project-name]')
    .description('Create a TinyRobot project from template')
    .option('-t, --template <name>', 'template name')
    .action((projectName, options) => {
      const skipPrompt = !process.stdout.isTTY

      createProject(projectName ?? '', options.template ?? '', skipPrompt).catch((error) => {
        if (error instanceof Error && error.name === 'ExitPromptError') {
          console.error('\nOperation cancelled.')
          process.exit(1)
        }

        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
        process.exit(1)
      })
    })
}

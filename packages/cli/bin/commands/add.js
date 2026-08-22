import { confirm, select } from '@inquirer/prompts'
import { Argument } from 'commander'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import semver from 'semver'

import {
  copyFile,
  copyDirectory,
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
const VUEUSE_VERSION = '13.9.0'
const DEPENDENCIES = {
  '@opentiny/tiny-robot': TARGET_VERSION,
  '@opentiny/tiny-robot-chat': TARGET_VERSION,
  '@opentiny/tiny-robot-kit': TARGET_VERSION,
  '@opentiny/tiny-robot-svgs': TARGET_VERSION,
  '@vueuse/core': VUEUSE_VERSION,
}

async function resolveTargetPackage(cwd) {
  const workspaceRoot = findWorkspaceRoot(cwd)

  if (workspaceRoot) {
    const subPackageRoot = findSubPackageRoot(cwd, workspaceRoot)

    if (subPackageRoot) {
      return subPackageRoot
    }

    const workspacePatterns = findWorkspacePackages(workspaceRoot)
    const packageDirs = listPackages(workspaceRoot, workspacePatterns)

    invariant(packageDirs.length > 0, 'no packages found in workspace.')

    return select({
      message: 'Multi-package workspace detected, select a target package:',
      choices: packageDirs.map((dir) => ({
        name: path.basename(dir),
        value: dir,
      })),
    })
  }

  const projectRoot = findProjectRoot(cwd)

  if (projectRoot) {
    return projectRoot
  }

  console.error('Error: no package.json found.')
  process.exit(1)
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

  if (!inserted) {
    next[name] = version
  }

  return next
}

function ensureDependency(pkg, name, targetVersion) {
  pkg.dependencies ??= {}

  const currentVersion = pkg.dependencies[name]

  if (!currentVersion) {
    pkg.dependencies = insertDependencyOrdered(pkg.dependencies, name, targetVersion)

    return {
      type: 'added',
      to: targetVersion,
    }
  }

  if (
    currentVersion.startsWith('workspace:') ||
    semver.satisfies(targetVersion, currentVersion, { includePrerelease: true })
  ) {
    return {
      type: 'skipped',
    }
  }

  return {
    type: 'conflict',
    from: currentVersion,
    to: targetVersion,
  }
}

function printDependencyResult(result, name) {
  switch (result.type) {
    case 'added':
      logSuccess(`Added ${name}@${result.to}`)
      break

    case 'skipped':
      logSkip(`${name} already satisfies required version`)
      break
  }
}

function getGeneratedFiles(targetDir) {
  const templateSource = getTemplateFile('src')
  const supportTarget = path.join(targetDir, 'src/tiny-robot-chat')

  return [
    {
      label: 'TinyRobotChat.vue',
      source: path.join(templateSource, 'TinyRobotChat.vue'),
      target: path.join(targetDir, 'src/TinyRobotChat.vue'),
      type: 'file',
    },
    {
      label: 'Chat UI components',
      source: path.join(templateSource, 'tiny-robot-chat/components'),
      target: path.join(supportTarget, 'components'),
      type: 'directory',
    },
    {
      label: 'Chat composables',
      source: path.join(templateSource, 'tiny-robot-chat/composables'),
      target: path.join(supportTarget, 'composables'),
      type: 'directory',
    },
    {
      label: 'Chat configuration',
      source: path.join(templateSource, 'tiny-robot-chat/config'),
      target: path.join(supportTarget, 'config'),
      type: 'directory',
    },
  ]
}

function findCopyConflicts(source, target) {
  if (!fs.existsSync(target)) {
    return []
  }

  const sourceStat = fs.statSync(source)
  const targetStat = fs.statSync(target)

  if (!sourceStat.isDirectory()) {
    return [target]
  }

  if (!targetStat.isDirectory()) {
    return [target]
  }

  return fs.readdirSync(source, { withFileTypes: true }).flatMap((entry) => {
    return findCopyConflicts(path.join(source, entry.name), path.join(target, entry.name))
  })
}

export function applyChatFeature(targetDir) {
  const pkgPath = path.join(targetDir, 'package.json')

  invariant(fs.existsSync(pkgPath), 'package.json not found.')

  const generatedFiles = getGeneratedFiles(targetDir)
  const conflicts = generatedFiles.flatMap((file) => findCopyConflicts(file.source, file.target))

  if (conflicts.length > 0) {
    const conflictPaths = conflicts.map((file) => path.relative(targetDir, file)).join(', ')

    throw new Error(`Chat feature files already exist: ${conflictPaths}`)
  }

  const pkg = readPackageJson(pkgPath)
  const dependencyResults = []

  for (const [name, version] of Object.entries(DEPENDENCIES)) {
    dependencyResults.push({ name, result: ensureDependency(pkg, name, version) })
  }

  const dependencyConflicts = dependencyResults.filter(({ result }) => result.type === 'conflict')

  if (dependencyConflicts.length > 0) {
    const conflictDetails = dependencyConflicts
      .map(({ name, result }) => `${name}: found ${result.from}, required ${result.to}`)
      .join('; ')

    throw new Error(`Dependency version conflict: ${conflictDetails}`)
  }

  for (const file of generatedFiles) {
    if (file.type === 'file') {
      copyFile(file.source, file.target)
    } else {
      copyDirectory(file.source, file.target)
    }
  }

  const envResult = mergeEnvFile(getTemplateFile('.env.example'), path.join(targetDir, '.env.example'))

  if (dependencyResults.some(({ result }) => result.type !== 'skipped')) {
    writePackageJson(pkgPath, pkg)
  }

  return {
    generatedFiles,
    envResult,
    dependencyResults,
  }
}

async function addFeature(targetDir, type) {
  invariant(type === 'chat', `unsupported feature: ${type}`)

  const shouldApply = await confirm({
    message: `Add the complete TinyRobot chat feature to ${targetDir}?`,
    default: true,
  })

  if (!shouldApply) {
    logSkip('No changes applied.')
    return
  }

  const result = applyChatFeature(targetDir)

  console.log('\nChange Results\n')

  for (const file of result.generatedFiles) {
    logSuccess(`Copied ${file.label}`)
  }

  switch (result.envResult.type) {
    case 'created':
      logSuccess('Created .env.example')
      break

    case 'merged':
      logSuccess(`Added ${result.envResult.added} variables to .env.example`)
      break

    case 'skipped':
      logSkip('.env.example already contains required variables')
      break
  }

  for (const { name, result: dependencyResult } of result.dependencyResults) {
    printDependencyResult(dependencyResult, name)
  }

  console.log(`\nSuccessfully added "${type}" feature to ${targetDir}`)

  printNextSteps({
    envChanged: result.envResult.type !== 'skipped',
    dependencyChanged: result.dependencyResults.some(({ result: dependencyResult }) => {
      return dependencyResult.type !== 'skipped'
    }),
  })
}

function printNextSteps({ envChanged, dependencyChanged }) {
  const steps = [
    [
      'Render <TinyRobotChat /> near your main application component.',
      '',
      "Example ('src/App.vue'):",
      '',
      '  <script setup>',
      "  import TinyRobotChat from './TinyRobotChat.vue'",
      '  </script>',
      '',
      '  <template>',
      '    <YourAppComponent />',
      '    <TinyRobotChat />',
      '  </template>',
    ].join('\n'),
  ]

  if (envChanged) {
    steps.push(
      [
        'Copy the required variables from .env.example to your private environment file and configure a provider key.',
        '',
        'Example:',
        '',
        '  VITE_DEEPSEEK_API_KEY=your_api_key',
      ].join('\n'),
    )
  }

  if (dependencyChanged) {
    steps.push(['Install or update project dependencies.', '', 'Example:', '', '  pnpm install'].join('\n'))
  }

  console.log('\nNext Steps\n')

  for (const [index, step] of steps.entries()) {
    console.log(`${index + 1}. ${step}\n`)
  }
}

export function registerAddCommand(program) {
  program
    .command('add')
    .description('Add a feature to the project')
    .addArgument(new Argument('<type>', 'type of feature to add').choices(['chat']))
    .action(async (type) => {
      try {
        const targetDir = await resolveTargetPackage(process.cwd())

        await addFeature(targetDir, type)
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

import { checkbox, select } from '@inquirer/prompts'
import { Argument } from 'commander'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import semver from 'semver'

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

const DEP_NAME = '@opentiny/tiny-robot'
const TARGET_VERSION = '0.5.1-alpha.1'
const STYLE_IMPORT = "import '@opentiny/tiny-robot/dist/style.css'"

function logUnavailable(label) {
  logSkip(`${label} could not be applied`)
}

function logSkippedSelection(label) {
  logSkip(`${label} change was not selected`)
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

function findMainEntry(targetDir) {
  for (const file of ['src/main.ts', 'src/main.js']) {
    const fullPath = path.join(targetDir, file)

    if (fs.existsSync(fullPath)) {
      return fullPath
    }
  }

  return null
}

function ensureStyleImport(mainFile) {
  const content = fs.readFileSync(mainFile, 'utf-8')

  if (content.includes(STYLE_IMPORT)) {
    return {
      type: 'skipped',
    }
  }

  const lines = content.split('\n')

  let lastImportIndex = -1

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\s/.test(lines[i])) {
      lastImportIndex = i
      continue
    }

    if (lastImportIndex !== -1) {
      break
    }
  }

  if (lastImportIndex === -1) {
    lines.unshift(STYLE_IMPORT)
  } else {
    lines.splice(lastImportIndex + 1, 0, STYLE_IMPORT)
  }

  fs.writeFileSync(mainFile, lines.join('\n'))

  return {
    type: 'inserted',
  }
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

  // 1. 不存在 => 新增（使用 ordered insert）
  if (!currentVersion) {
    pkg.dependencies = insertDependencyOrdered(pkg.dependencies, name, targetVersion)

    return {
      type: 'added',
      to: targetVersion,
    }
  }

  // 2. 已存在 => 只更新版本，不调整顺序
  const current = semver.valid(currentVersion)

  if (current !== targetVersion) {
    pkg.dependencies[name] = targetVersion

    return {
      type: 'updated',
      from: currentVersion,
      to: targetVersion,
    }
  }

  // 3. 完全一致 => 跳过
  return {
    type: 'skipped',
  }
}

function printDependencyResult(result, name) {
  switch (result.type) {
    case 'added':
      logSuccess(`Added ${name}@${TARGET_VERSION}`)
      break

    case 'updated':
      logSuccess(`Updated ${name} from ${result.from} to ${result.to}`)
      break

    case 'skipped':
      logSkip(`${name} already satisfies required version`)
      break
  }
}

function getChatFeatureFiles(targetDir) {
  const mainEntry = findMainEntry(targetDir)

  return [
    {
      label: 'TinyRobotChat.vue',
      target: path.join(targetDir, 'src/TinyRobotChat.vue'),
      template: getTemplateFile('src', 'TinyRobotChat.vue'),
      action(fileExists) {
        return fileExists ? 'overwrite' : 'create'
      },
    },
    {
      label: 'main entry style import',
      target: mainEntry,
      action() {
        return 'modify'
      },
    },
    {
      label: '.env',
      target: path.join(targetDir, '.env'),
      template: getTemplateFile('.env.example'),
      action(fileExists) {
        return fileExists ? 'modify' : 'create'
      },
    },

    {
      label: 'package.json',
      target: path.join(targetDir, 'package.json'),
      action() {
        return 'modify'
      },
    },
  ]
}

async function selectFileChanges(files) {
  return checkbox({
    message: 'Select which file changes to apply (all selected by default):',
    choices: files.map((file) => {
      const exists = file.target ? fs.existsSync(file.target) : false

      const disabled = !file.target

      const descriptions = {
        'TinyRobotChat.vue': 'integrate TinyRobot chat component',
        'main entry style import': 'import TinyRobot styles',
        '.env': 'add environment variables',
        'package.json': 'add TinyRobot dependencies',
      }

      const description = descriptions[file.label]

      return {
        name: disabled
          ? `${file.action(false)} ${file.label} — ${description} (main.ts/js not found)`
          : `${file.action(exists)} ${file.label} — ${description}`,

        value: file.label,

        checked: !disabled,

        disabled,
      }
    }),
  })
}

function isSelected(selectedFiles, label) {
  return selectedFiles.includes(label)
}

async function addFeature(targetDir, type) {
  invariant(type === 'chat', `unsupported feature: ${type}`)

  const files = getChatFeatureFiles(targetDir)

  const selectedFiles = await selectFileChanges(files)

  if (selectedFiles.length === 0) {
    logSkip('No changes selected.')
    return
  }

  const componentFile = files.find((f) => {
    return f.label === 'TinyRobotChat.vue'
  })

  const envFile = files.find((f) => {
    return f.label === '.env'
  })

  invariant(componentFile, 'TinyRobotChat.vue config missing.')

  invariant(envFile, '.env config missing.')

  console.log('\nChange Results\n')

  let needsManualStyleImport = false
  let envChanged = false
  let dependencyChanged = false

  if (isSelected(selectedFiles, 'TinyRobotChat.vue')) {
    copyFile(componentFile.template, componentFile.target)
    logSuccess(`Copied ${componentFile.label}`)
  } else {
    logSkippedSelection(componentFile.label)
  }

  const mainFile = files.find((f) => {
    return f.label === 'main entry style import'
  })

  if (!mainFile?.target) {
    needsManualStyleImport = true

    logUnavailable('main entry style import (main.ts/js not found)')
  } else {
    if (isSelected(selectedFiles, mainFile.label)) {
      const result = ensureStyleImport(mainFile.target)

      switch (result.type) {
        case 'inserted':
          logSuccess('Inserted TinyRobot style import')
          break

        case 'skipped':
          logSkip('TinyRobot style import already exists')
          break
      }
    } else {
      needsManualStyleImport = true

      logSkippedSelection(mainFile.label)
    }
  }

  if (isSelected(selectedFiles, '.env')) {
    const envResult = mergeEnvFile(envFile.template, envFile.target)

    switch (envResult.type) {
      case 'created':
        envChanged = true

        logSuccess('Created .env')
        break

      case 'merged':
        envChanged = true

        logSuccess(`Added ${envResult.added} env variables`)
        break

      case 'skipped':
        logSkip('.env already contains required variables')
        break
    }
  } else {
    logSkippedSelection('.env')
  }

  const pkgPath = path.join(targetDir, 'package.json')

  invariant(fs.existsSync(pkgPath), 'package.json not found.')

  const pkg = readPackageJson(pkgPath)

  if (isSelected(selectedFiles, 'package.json')) {
    const result = ensureDependency(pkg, DEP_NAME, TARGET_VERSION)

    if (result.type !== 'skipped') {
      dependencyChanged = true
    }

    writePackageJson(pkgPath, pkg)

    printDependencyResult(result, DEP_NAME)
  } else {
    logSkippedSelection('package.json')
  }

  console.log(`\nSuccessfully added "${type}" feature to ${targetDir}`)

  printNextSteps({
    needsManualStyleImport,
    envChanged,
    dependencyChanged,
  })
}

function printNextSteps({ needsManualStyleImport, envChanged, dependencyChanged }) {
  const steps = []

  if (needsManualStyleImport) {
    steps.push(
      ['Import TinyRobot styles in your application entry file.', '', 'Example:', '', `  ${STYLE_IMPORT}`].join('\n'),
    )
  }

  steps.push(
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
  )

  if (envChanged) {
    steps.push(
      [
        'Configure your AI provider API key in the .env file.',
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

  if (steps.length === 0) {
    return
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

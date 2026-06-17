#!/usr/bin/env node

import process from 'node:process'
import { Command } from 'commander'

import { registerCreateCommand } from './commands/create.js'
import { registerAddCommand } from './commands/add.js'

function run() {
  const program = new Command()

  program.name('tiny-robot-cli').description('CLI to scaffold TinyRobot product projects').showHelpAfterError()

  registerCreateCommand(program)

  registerAddCommand(program)

  if (process.argv.length <= 2) {
    program.outputHelp()
    return
  }

  program.parse(process.argv)
}

run()

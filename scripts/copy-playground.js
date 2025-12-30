import { cpSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

// Get command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('Usage: node copy-playground.js <source> <dest>')
  console.error('Example: node copy-playground.js packages/playground/dist docs/dist/playground')
  process.exit(1)
}

// Source and destination paths from arguments
// resolve() automatically handles both absolute and relative paths
const source = resolve(args[0])
const dest = resolve(args[1])

try {
  // Check if source exists
  if (!existsSync(source)) {
    console.error(`Error: Source directory not found: ${source}`)
    process.exit(1)
  }

  // Ensure parent directory exists
  const destParent = dirname(dest)
  if (!existsSync(destParent)) {
    console.error(`Error: Destination parent directory not found: ${destParent}`)
    process.exit(1)
  }

  // Copy directory recursively
  console.log('Copying playground dist to docs/dist/playground...')
  cpSync(source, dest, { recursive: true, force: true })
  console.log('✓ Successfully copied playground to docs/dist/playground')
} catch (error) {
  console.error('Error copying playground:', error.message)
  process.exit(1)
}

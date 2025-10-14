import { cpSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Get the project root directory
const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

// Source and destination paths
const source = join(projectRoot, 'packages/playground/dist')
const dest = join(projectRoot, 'docs/dist/playground')

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

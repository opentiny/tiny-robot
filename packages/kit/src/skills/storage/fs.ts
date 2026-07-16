import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { stringify as stringifyYaml } from 'yaml'
import { loadSkillWithDetails } from '../loader/node'
import type { SkillLoadOptions } from '../loader/node'
import {
  getRecord,
  getString,
  isTextSkillFilePath,
  normalizeSkillPath,
  parseMarkdownFrontmatter,
} from '../loader/utils'
import type { SkillDefinition, SkillResourceDescriptor } from '../types'
import { createImportSkill } from './importSkill'
import type { SkillStorage, SkillSummary } from './types'

/** 一个标准 skill 目录集合的文件系统 storage。 */
export interface FsSkillStorageOptions {
  root: string
  /** 只读 storage 不允许 add/import 写入，也不允许 delete。 */
  readonly?: boolean
}

const entryFile = 'SKILL.md'
const importSkill = createImportSkill<SkillLoadOptions>(loadSkillWithDetails)

export class FsSkillStorage implements SkillStorage<SkillLoadOptions> {
  readonly root: string
  readonly readonly: boolean

  constructor(options: FsSkillStorageOptions) {
    this.root = options.root
    this.readonly = options.readonly ?? false
  }

  async add(skill: SkillDefinition) {
    this.assertWritable()

    const directory = this.getSkillDirectory(skill.name)
    const { parentDirectory, tempDirectory, backupDirectory } = createReplacementPaths(directory)
    let hasBackup = false
    let installed = false

    await mkdir(parentDirectory, {
      recursive: true,
    })
    await mkdir(tempDirectory, {
      recursive: true,
    })

    try {
      await this.writeSkillDirectory(tempDirectory, skill)
      hasBackup = await this.backupExistingDirectory(directory, backupDirectory)
      await rename(tempDirectory, directory)
      installed = true

      const storedSkill = await this.getStoredSkill(skill.name)
      if (hasBackup) {
        await removeDirectory(backupDirectory)
        hasBackup = false
      }

      return storedSkill
    } catch (error) {
      try {
        if (installed) {
          await this.rollbackInstalledDirectory(directory, backupDirectory, hasBackup)
        } else if (hasBackup) {
          await this.restoreBackupDirectory(directory, backupDirectory)
        }
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          `Failed to store skill "${skill.name}" and restore backup "${backupDirectory}".`,
        )
      }

      throw error
    } finally {
      await removeDirectory(tempDirectory)
    }
  }

  async get(name: string) {
    const directory = this.getSkillDirectory(name)

    try {
      return await this.readSkillDirectory(directory)
    } catch (error) {
      if (isFileNotFoundError(error)) {
        return undefined
      }

      throw error
    }
  }

  async has(name: string) {
    const entryPath = join(this.getSkillDirectory(name), entryFile)

    try {
      return (await stat(entryPath)).isFile()
    } catch (error) {
      if (isFileNotFoundError(error)) {
        return false
      }

      throw error
    }
  }

  async delete(name: string) {
    this.assertWritable()

    const directory = this.getSkillDirectory(name)
    const exists = await this.has(name)

    if (!exists) {
      return false
    }

    await rm(directory, {
      recursive: true,
      force: true,
    })
    return true
  }

  async list() {
    const entries = await readdir(this.root, {
      withFileTypes: true,
    }).catch((error: unknown) => {
      if (isFileNotFoundError(error)) {
        return []
      }

      throw error
    })
    const summaries = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(async (entry): Promise<SkillSummary | undefined> => {
          const directory = this.getSkillDirectory(entry.name)
          const skill = await this.readSkillEntry(directory).catch((error: unknown) => {
            if (isFileNotFoundError(error)) {
              return undefined
            }

            throw error
          })

          if (!skill) {
            return undefined
          }

          const resourceCount = (await this.readResourceFiles(directory)).length

          return {
            name: skill.name,
            description: skill.description,
            resourceCount,
            metadata: skill.metadata,
          }
        }),
    )

    return summaries
      .filter((summary): summary is SkillSummary => Boolean(summary))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  import(options: SkillLoadOptions) {
    this.assertWritable()
    const task = importSkill(options)

    return Object.assign(
      task.then(async (result) => {
        const skill = await this.add(result.skill)
        return {
          ...result,
          name: skill.name,
          skill,
        }
      }),
      { cancel: task.cancel },
    )
  }

  private async readSkillDirectory(directory: string): Promise<SkillDefinition> {
    const skill = await this.readSkillEntry(directory)
    const resources = await this.readResourceDescriptors(directory)

    return {
      ...skill,
      resources: resources.length ? resources : undefined,
    }
  }

  private async readSkillEntry(directory: string) {
    const entryPath = join(directory, entryFile)
    const entryContent = await readFile(entryPath, 'utf8')
    const { frontmatter, body } = parseMarkdownFrontmatter(entryContent)
    const instructions = body.trim()

    if (!instructions) {
      throw new Error(`Skill entry file "${entryFile}" must contain instructions.`)
    }

    return {
      name: getString(frontmatter.name) || directory.split(/[\\/]/).at(-1) || '',
      description: getString(frontmatter.description) || '',
      instructions,
      metadata: {
        ...getRecord(frontmatter.metadata),
        ...(getString(frontmatter.homepage) ? { homepage: getString(frontmatter.homepage) } : {}),
      },
    }
  }

  private async readResourceDescriptors(directory: string) {
    const resources: SkillResourceDescriptor[] = []

    for (const { fullPath, path } of await this.readResourceFiles(directory)) {
      const fileStat = await stat(fullPath)
      const kind = isTextSkillFilePath(path) ? 'text' : 'binary'
      const base = {
        path,
        kind,
        resourceId: path,
        size: fileStat.size,
        lastModified: fileStat.mtimeMs,
      }

      resources.push(
        kind === 'text'
          ? {
              ...base,
              kind,
              readText: async () => readFile(fullPath, 'utf8'),
              readBinary: async () => new Uint8Array(await readFile(fullPath)),
            }
          : {
              ...base,
              kind,
              readBinary: async () => new Uint8Array(await readFile(fullPath)),
              readText: async () => new TextDecoder().decode(await readFile(fullPath)),
            },
      )
    }

    return resources
  }

  private async readResourceFiles(directory: string) {
    const files: Array<{ fullPath: string; path: string }> = []

    const walk = async (currentDirectory: string) => {
      const entries = await readdir(currentDirectory, {
        withFileTypes: true,
      })

      for (const entry of entries) {
        if (entry.name.startsWith('.')) {
          continue
        }

        const fullPath = join(currentDirectory, entry.name)

        if (entry.isDirectory()) {
          await walk(fullPath)
          continue
        }

        if (!entry.isFile()) {
          continue
        }

        const path = normalizeSkillPath(relative(directory, fullPath))
        if (!path || path === entryFile) {
          continue
        }

        files.push({ fullPath, path })
      }
    }

    await walk(directory)
    return files.sort((a, b) => a.path.localeCompare(b.path))
  }

  private async writeResource(directory: string, resource: SkillResourceDescriptor) {
    const path = normalizeSkillPath(resource.path)

    if (!path || path.toLowerCase() === entryFile.toLowerCase() || hasWindowsDrivePrefix(path)) {
      throw new Error(`Invalid skill resource path: ${resource.path}`)
    }

    const root = resolve(directory)
    const fullPath = resolve(root, path)
    const relativePath = relative(root, fullPath)

    if (!relativePath || relativePath === '..' || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
      throw new Error(`Invalid skill resource path: ${resource.path}`)
    }

    await mkdir(dirname(fullPath), {
      recursive: true,
    })

    if (resource.kind === 'text') {
      await writeFile(fullPath, await getResourceText(resource), 'utf8')
      return
    }

    await writeFile(fullPath, await getResourceBinary(resource))
  }

  private async writeSkillDirectory(directory: string, skill: SkillDefinition) {
    await writeFile(join(directory, entryFile), serializeSkillEntry(skill), 'utf8')

    for (const resource of skill.resources ?? []) {
      await this.writeResource(directory, resource)
    }
  }

  private async backupExistingDirectory(directory: string, backupDirectory: string) {
    try {
      await rename(directory, backupDirectory)
      return true
    } catch (error) {
      if (isFileNotFoundError(error)) {
        return false
      }

      throw error
    }
  }

  private async rollbackInstalledDirectory(directory: string, backupDirectory: string, hasBackup: boolean) {
    if (hasBackup) {
      await this.restoreBackupDirectory(directory, backupDirectory)
      return
    }

    await removeDirectory(directory)
  }

  private async restoreBackupDirectory(directory: string, backupDirectory: string) {
    await removeDirectory(directory)
    await rename(backupDirectory, directory)
  }

  private async getStoredSkill(name: string) {
    const storedSkill = await this.get(name)

    if (!storedSkill) {
      throw new Error(`Failed to store skill "${name}".`)
    }

    return storedSkill
  }

  private getSkillDirectory(name: string) {
    const directoryName = normalizeSkillPath(name)

    if (
      !directoryName ||
      directoryName !== name ||
      directoryName.startsWith('.') ||
      directoryName.includes('/') ||
      hasWindowsDrivePrefix(directoryName)
    ) {
      throw new Error(`Invalid skill name for file storage: ${name}`)
    }

    return join(this.root, directoryName)
  }

  private assertWritable() {
    if (this.readonly) {
      throw new Error('File system skill storage is readonly.')
    }
  }
}

export function createFsSkillStorage(options: FsSkillStorageOptions) {
  return new FsSkillStorage(options)
}

function createReplacementPaths(directory: string) {
  const parentDirectory = dirname(directory)
  const directoryName = basename(directory)

  return {
    parentDirectory,
    tempDirectory: join(parentDirectory, `.${directoryName}.tmp-${randomUUID()}`),
    backupDirectory: join(parentDirectory, `.${directoryName}.bak-${randomUUID()}`),
  }
}

async function removeDirectory(directory: string) {
  await rm(directory, {
    recursive: true,
    force: true,
  }).catch(() => undefined)
}

function serializeSkillEntry(skill: SkillDefinition) {
  const metadata = { ...skill.metadata }
  const homepage = typeof metadata.homepage === 'string' ? metadata.homepage : undefined
  delete metadata.homepage
  const frontmatter: Record<string, unknown> = {
    name: skill.name,
    description: skill.description,
  }

  if (homepage) {
    frontmatter.homepage = homepage
  }

  if (Object.keys(metadata).length > 0) {
    frontmatter.metadata = metadata
  }

  return `---\n${stringifyYaml(frontmatter).trimEnd()}\n---\n\n${skill.instructions.trim()}\n`
}

async function getResourceText(resource: SkillResourceDescriptor) {
  if (resource.text !== undefined) {
    return resource.text
  }

  if (resource.readText) {
    return resource.readText()
  }

  if (resource.binary) {
    return new TextDecoder().decode(resource.binary)
  }

  if (resource.readBinary) {
    return new TextDecoder().decode(await resource.readBinary())
  }

  throw new Error(`Skill resource "${resource.path}" has no text content.`)
}

async function getResourceBinary(resource: SkillResourceDescriptor) {
  if (resource.binary) {
    return resource.binary
  }

  if (resource.readBinary) {
    return resource.readBinary()
  }

  if (resource.text !== undefined) {
    return new TextEncoder().encode(resource.text)
  }

  if (resource.readText) {
    return new TextEncoder().encode(await resource.readText())
  }

  throw new Error(`Skill resource "${resource.path}" has no binary content.`)
}

function isFileNotFoundError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
}

function hasWindowsDrivePrefix(path: string) {
  return /^[A-Za-z]:/.test(path)
}

import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
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
import type { SkillStorage } from './types'

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
    await rm(directory, {
      recursive: true,
      force: true,
    })
    await mkdir(directory, {
      recursive: true,
    })
    await writeFile(join(directory, entryFile), serializeSkillEntry(skill), 'utf8')

    for (const resource of skill.resources ?? []) {
      await this.writeResource(directory, resource)
    }

    const storedSkill = await this.get(skill.name)
    if (!storedSkill) {
      throw new Error(`Failed to store skill "${skill.name}".`)
    }

    return storedSkill
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
    return Boolean(await this.get(name))
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
        .map(async (entry) => this.get(entry.name)),
    )

    return summaries
      .filter((skill): skill is SkillDefinition => Boolean(skill))
      .map((skill) => ({
        name: skill.name,
        description: skill.description,
        resourceCount: skill.resources?.length ?? 0,
        metadata: skill.metadata,
      }))
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
    const entryPath = join(directory, entryFile)
    const entryContent = await readFile(entryPath, 'utf8')
    const { frontmatter, body } = parseMarkdownFrontmatter(entryContent)
    const instructions = body.trim()

    if (!instructions) {
      throw new Error(`Skill entry file "${entryFile}" must contain instructions.`)
    }

    const resources = await this.readResourceDescriptors(directory)

    return {
      name: getString(frontmatter.name) || directory.split(/[\\/]/).at(-1) || '',
      description: getString(frontmatter.description) || '',
      instructions,
      resources: resources.length ? resources : undefined,
      metadata: {
        ...getRecord(frontmatter.metadata),
        ...(getString(frontmatter.homepage) ? { homepage: getString(frontmatter.homepage) } : {}),
      },
    }
  }

  private async readResourceDescriptors(directory: string) {
    const resources: SkillResourceDescriptor[] = []

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
    }

    await walk(directory)
    return resources.sort((a, b) => a.path.localeCompare(b.path))
  }

  private async writeResource(directory: string, resource: SkillResourceDescriptor) {
    const path = normalizeSkillPath(resource.path)

    if (!path || path === entryFile) {
      return
    }

    const fullPath = join(directory, path)
    await mkdir(dirname(fullPath), {
      recursive: true,
    })

    if (resource.kind === 'text') {
      await writeFile(fullPath, await getResourceText(resource), 'utf8')
      return
    }

    await writeFile(fullPath, await getResourceBinary(resource))
  }

  private getSkillDirectory(name: string) {
    const directoryName = normalizeSkillPath(name)

    if (!directoryName || directoryName.includes('/')) {
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

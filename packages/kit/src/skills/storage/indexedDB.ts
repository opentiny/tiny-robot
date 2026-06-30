import { openDB, type DBSchema, type IDBPDatabase, type IDBPTransaction } from 'idb'
import { loadSkillWithDetails } from '../loader'
import type { SkillLoadOptions } from '../loader'
import type { SkillDefinition, SkillResourceDescriptor } from '../types'
import { createImportSkill } from './importSkill'
import type { SkillImportJob, SkillImporter, SkillStorage, SkillSummary } from './types'

const defaultVersion = 1
const defaultSkillStoreName = 'skills'
const defaultResourceStoreName = 'resources'

export interface IndexedDBSkillStorageOptions {
  /**
   * IndexedDB database name. Tests should pass a unique name to avoid cross-test state.
   */
  databaseName: string
}

interface IndexedDBSkillStorageSkillRecord {
  name: string
  description: string
  instructions: string
  metadata?: Record<string, unknown>
  resources?: IndexedDBSkillStorageResourceMetadata[]
}

interface IndexedDBSkillStorageResourceMetadata {
  path: string
  kind: SkillResourceDescriptor['kind']
  resourceId: string
  mimeType?: string
  size?: number
  lastModified?: number
  metadata?: Record<string, unknown>
}

interface IndexedDBSkillStorageResourceRecord {
  skillName: string
  resourceId: string
  kind: SkillResourceDescriptor['kind']
  text?: string
  binary?: Uint8Array
}

interface IndexedDBSkillStorageSchema extends DBSchema {
  skills: {
    key: string
    value: IndexedDBSkillStorageSkillRecord
  }
  resources: {
    key: [string, string]
    value: IndexedDBSkillStorageResourceRecord
    indexes: {
      skillName: string
    }
  }
}

type IndexedDBSkillStorageTransaction = IDBPTransaction<
  IndexedDBSkillStorageSchema,
  ['skills', 'resources'],
  'readwrite'
>

type SkillImportOptions = SkillLoadOptions
const importSkill = createImportSkill<SkillImportOptions>(loadSkillWithDetails)

export class IndexedDBSkillStorage<TImportOptions = SkillImportOptions> implements SkillStorage<TImportOptions> {
  readonly databaseName: string
  readonly skillStoreName = defaultSkillStoreName
  readonly resourceStoreName = defaultResourceStoreName
  private dbPromise?: Promise<IDBPDatabase<IndexedDBSkillStorageSchema>>

  constructor(
    options: IndexedDBSkillStorageOptions,
    private readonly importer: SkillImporter<TImportOptions> = importSkill as SkillImporter<TImportOptions>,
  ) {
    this.databaseName = options.databaseName
  }

  private getDB() {
    this.dbPromise ??= openDB<IndexedDBSkillStorageSchema>(this.databaseName, defaultVersion, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(this.skillStoreName)) {
          db.createObjectStore(defaultSkillStoreName, {
            keyPath: 'name',
          })
        }

        if (!db.objectStoreNames.contains(this.resourceStoreName)) {
          const resourceStore = db.createObjectStore(defaultResourceStoreName, {
            keyPath: ['skillName', 'resourceId'],
          })
          resourceStore.createIndex('skillName', 'skillName')
        }
      },
    })

    return this.dbPromise
  }

  async add(skill: SkillDefinition) {
    const resourceRecords = await Promise.all(
      (skill.resources ?? []).map((resource) => toResourceRecord(skill.name, resource)),
    )
    const db = await this.getDB()
    const tx = db.transaction([defaultSkillStoreName, defaultResourceStoreName], 'readwrite')
    const skillStore = tx.objectStore(defaultSkillStoreName)
    const resourceStore = tx.objectStore(defaultResourceStoreName)

    await this.deleteResourceRecords(tx, skill.name)
    await skillStore.put(toSkillRecord(skill))

    for (const resourceRecord of resourceRecords) {
      await resourceStore.put(resourceRecord)
    }

    await tx.done
    return this.getStoredSkill(skill.name)
  }

  async get(name: string) {
    const db = await this.getDB()
    const record = await db.get(defaultSkillStoreName, name)

    return record ? this.toSkillDefinition(record) : undefined
  }

  async has(name: string) {
    const db = await this.getDB()
    return (await db.count(defaultSkillStoreName, name)) > 0
  }

  async delete(name: string) {
    const db = await this.getDB()
    const tx = db.transaction([defaultSkillStoreName, defaultResourceStoreName], 'readwrite')
    const skillStore = tx.objectStore(defaultSkillStoreName)
    const existed = (await skillStore.count(name)) > 0

    await skillStore.delete(name)
    await this.deleteResourceRecords(tx, name)
    await tx.done

    return existed
  }

  async list(): Promise<SkillSummary[]> {
    const db = await this.getDB()
    const records = await db.getAll(defaultSkillStoreName)

    return records
      .map((record) => ({
        name: record.name,
        description: record.description,
        resourceCount: record.resources?.length ?? 0,
        metadata: record.metadata,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  import(options: TImportOptions): SkillImportJob {
    const task = this.importer(options)

    return Object.assign(
      task.then(async (result) => {
        await this.add(result.skill)
        return result
      }),
      { cancel: task.cancel },
    )
  }

  private async getStoredSkill(name: string) {
    const skill = await this.get(name)

    if (!skill) {
      throw new Error(`Failed to store skill "${name}".`)
    }

    return skill
  }

  private toSkillDefinition(record: IndexedDBSkillStorageSkillRecord): SkillDefinition {
    return {
      name: record.name,
      description: record.description,
      instructions: record.instructions,
      metadata: record.metadata ? { ...record.metadata } : undefined,
      resources: record.resources?.map((resource) => this.toSkillResource(record.name, resource)),
    }
  }

  private toSkillResource(skillName: string, resource: IndexedDBSkillStorageResourceMetadata): SkillResourceDescriptor {
    const base = {
      path: resource.path,
      resourceId: resource.resourceId,
      mimeType: resource.mimeType,
      size: resource.size,
      lastModified: resource.lastModified,
      metadata: resource.metadata ? { ...resource.metadata } : undefined,
    }

    if (resource.kind === 'text') {
      return {
        ...base,
        kind: resource.kind,
        readText: async () => this.readResourceText(skillName, resource.resourceId),
        readBinary: async () => this.readResourceBinary(skillName, resource.resourceId),
      }
    }

    return {
      ...base,
      kind: resource.kind,
      readBinary: async () => this.readResourceBinary(skillName, resource.resourceId),
      readText: async () => this.readResourceText(skillName, resource.resourceId),
    }
  }

  private async readResourceText(skillName: string, resourceId: string) {
    const resource = await this.getResourceRecord(skillName, resourceId)

    if (typeof resource.text === 'string') {
      return resource.text
    }

    if (resource.binary) {
      return new TextDecoder().decode(resource.binary)
    }

    throw new Error(`Skill resource "${resourceId}" has no text content.`)
  }

  private async readResourceBinary(skillName: string, resourceId: string) {
    const resource = await this.getResourceRecord(skillName, resourceId)

    if (resource.binary) {
      return new Uint8Array(resource.binary)
    }

    if (typeof resource.text === 'string') {
      return new TextEncoder().encode(resource.text)
    }

    throw new Error(`Skill resource "${resourceId}" has no binary content.`)
  }

  private async getResourceRecord(skillName: string, resourceId: string) {
    const db = await this.getDB()
    const resource = await db.get(defaultResourceStoreName, [skillName, resourceId])

    if (!resource) {
      throw new Error(`Skill resource "${resourceId}" was not found.`)
    }

    return resource
  }

  private async deleteResourceRecords(tx: IndexedDBSkillStorageTransaction, skillName: string) {
    const resourceStore = tx.objectStore(defaultResourceStoreName)
    const resourceKeys = await resourceStore.index('skillName').getAllKeys(skillName)

    await Promise.all(resourceKeys.map((key) => resourceStore.delete(key)))
  }
}

export function createIndexedDBSkillStorage(options: IndexedDBSkillStorageOptions) {
  return new IndexedDBSkillStorage(options)
}

function toSkillRecord(skill: SkillDefinition): IndexedDBSkillStorageSkillRecord {
  return {
    name: skill.name,
    description: skill.description,
    instructions: skill.instructions,
    metadata: skill.metadata ? { ...skill.metadata } : undefined,
    resources: skill.resources?.map((resource) => ({
      path: resource.path,
      kind: resource.kind,
      resourceId: resource.resourceId,
      mimeType: resource.mimeType,
      size: resource.size,
      lastModified: resource.lastModified,
      metadata: resource.metadata ? { ...resource.metadata } : undefined,
    })),
  }
}

async function toResourceRecord(
  skillName: string,
  resource: SkillResourceDescriptor,
): Promise<IndexedDBSkillStorageResourceRecord> {
  if (resource.kind === 'text') {
    const text = resource.text ?? (await readTextContent(resource))

    if (typeof text !== 'string') {
      throw new Error(`Skill resource "${resource.resourceId}" has no text content to store.`)
    }

    return {
      skillName,
      resourceId: resource.resourceId,
      kind: resource.kind,
      text,
    }
  }

  const binary = resource.binary ?? (await readBinaryContent(resource))

  if (!binary) {
    throw new Error(`Skill resource "${resource.resourceId}" has no binary content to store.`)
  }

  return {
    skillName,
    resourceId: resource.resourceId,
    kind: resource.kind,
    binary: new Uint8Array(binary),
  }
}

async function readTextContent(resource: SkillResourceDescriptor) {
  if (resource.readText) {
    return resource.readText()
  }

  if (resource.binary) {
    return new TextDecoder().decode(resource.binary)
  }

  return undefined
}

async function readBinaryContent(resource: SkillResourceDescriptor) {
  if (resource.readBinary) {
    return resource.readBinary()
  }

  if (resource.text) {
    return new TextEncoder().encode(resource.text)
  }

  return undefined
}

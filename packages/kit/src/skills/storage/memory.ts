import type { SkillDefinition, SkillResourceDescriptor } from '../types'
import type { SkillImporter, SkillStorage, SkillSummary } from './types'

const toSummary = (skill: SkillDefinition): SkillSummary => ({
  name: skill.name,
  description: skill.description,
  resourceCount: skill.resources?.length ?? 0,
  metadata: skill.metadata,
})

const cloneSkill = (skill: SkillDefinition): SkillDefinition => ({
  name: skill.name,
  description: skill.description,
  instructions: skill.instructions,
  metadata: skill.metadata ? { ...skill.metadata } : undefined,
  resources: skill.resources?.map(cloneResource),
})

const cloneResource = (resource: SkillResourceDescriptor): SkillResourceDescriptor => {
  const base = {
    path: resource.path,
    resourceId: resource.resourceId,
    mimeType: resource.mimeType,
    size: resource.size,
    lastModified: resource.lastModified,
    metadata: resource.metadata ? { ...resource.metadata } : undefined,
  }

  if (resource.kind === 'text') {
    const content = {
      binary: resource.binary ? new Uint8Array(resource.binary) : undefined,
      readBinary: resource.readBinary,
    }

    return resource.text !== undefined
      ? {
          ...base,
          ...content,
          kind: resource.kind,
          text: resource.text,
          readText: resource.readText,
        }
      : {
          ...base,
          ...content,
          kind: resource.kind,
          readText: resource.readText!,
        }
  }

  const content = {
    text: resource.text,
    readText: resource.readText,
  }

  return resource.binary
    ? {
        ...base,
        ...content,
        kind: resource.kind,
        binary: new Uint8Array(resource.binary),
        readBinary: resource.readBinary,
      }
    : {
        ...base,
        ...content,
        kind: resource.kind,
        readBinary: resource.readBinary!,
      }
}

export class MemorySkillStorage<TImportOptions> implements SkillStorage<TImportOptions> {
  private skills = new Map<string, SkillDefinition>()

  constructor(private readonly importer: SkillImporter<TImportOptions>) {}

  async add(skill: SkillDefinition) {
    const saved = cloneSkill(skill)
    this.skills.set(skill.name, saved)
    return cloneSkill(saved)
  }

  async get(name: string) {
    const skill = this.skills.get(name)
    return skill ? cloneSkill(skill) : undefined
  }

  async has(name: string) {
    return this.skills.has(name)
  }

  async delete(name: string) {
    return this.skills.delete(name)
  }

  async list() {
    return Array.from(this.skills.values())
      .map(toSummary)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  import(options: TImportOptions) {
    const task = this.importer(options)

    return Object.assign(
      task.then(async (result) => {
        await this.add(result.skill)
        return result
      }),
      { cancel: task.cancel },
    )
  }
}

export function createMemorySkillStorage<TImportOptions>(importer: SkillImporter<TImportOptions>) {
  return new MemorySkillStorage(importer)
}

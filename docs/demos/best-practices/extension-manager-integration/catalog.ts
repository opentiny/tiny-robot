import type { McpExtensionFormValue, McpExtensionTool, SkillDefinition } from '@opentiny/tiny-robot'

export type ExtensionSource = 'builtin' | 'remote' | 'manual'
type BaseDefinition = { source: ExtensionSource; id: string; version: number; installed?: boolean }
export type ExtensionDefinition =
  | (BaseDefinition & { kind: 'mcp'; data: { value: McpExtensionFormValue; tools: McpExtensionTool[] } })
  | (BaseDefinition & { kind: 'skill'; data: SkillDefinition })
export type ResolvedExtension = ExtensionDefinition & {
  installed: boolean
  enabled: boolean
  toolOverrides: Record<string, boolean>
  toolDefault: 'enabled' | 'disabled'
  availableUpdate?: ExtensionDefinition
}

// Skill 的业务身份是 name；MCP 用来源与来源内稳定 ID，同名 MCP 可共存。
export const extensionKey = (item: ExtensionDefinition) =>
  item.kind === 'skill' ? `skill:${item.data.name}` : `mcp:${JSON.stringify([item.source, item.id])}`

export const skillVersion = (skill: SkillDefinition) => {
  const version = skill.metadata?.extensionVersion
  return typeof version === 'number' && Number.isSafeInteger(version) && version >= 0 ? version : 0
}

export const normalizeRemoteCatalog = (definitions: ExtensionDefinition[]): ExtensionDefinition[] =>
  definitions.map((definition) => ({ ...definition, source: 'remote' }))

const stableValue = (value: unknown): unknown => {
  if (value instanceof Uint8Array) return [...value]
  if (Array.isArray(value)) return value.map(stableValue)
  if (typeof value !== 'object' || value === null) return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, nested]) => nested !== undefined && typeof nested !== 'function')
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, stableValue(nested)]),
  )
}

const stableJson = (value: unknown) => JSON.stringify(stableValue(value))

const mcpContent = (definition: Extract<ExtensionDefinition, { kind: 'mcp' }>) => {
  const { value, tools } = definition.data
  return {
    name: value.name.trim(),
    description: value.description?.trim() ?? '',
    type: value.type,
    url: value.url.trim(),
    headers: Object.fromEntries(
      Object.entries(value.headers ?? {}).map(([name, headerValue]) => [name.trim(), String(headerValue)]),
    ),
    thumbnail: value.thumbnail?.trim() || null,
    tools,
  }
}

const skillContent = async (skill: SkillDefinition) => {
  const businessMetadata = { ...skill.metadata }
  delete businessMetadata.extensionVersion
  delete businessMetadata.extensionSource
  delete businessMetadata.extensionId
  const metadata = Object.keys(businessMetadata).length ? businessMetadata : undefined
  const resources = skill.resources
    ? await Promise.all(
        skill.resources.map(async (resource) => {
          const base = {
            path: resource.path,
            kind: resource.kind,
            resourceId: resource.resourceId,
            mimeType: resource.mimeType,
            size: resource.size,
            lastModified: resource.lastModified,
            metadata: resource.metadata,
          }
          if (resource.kind === 'text') {
            const text = resource.text ?? (await resource.readText?.())
            if (text === undefined) throw new Error(`Skill resource "${resource.resourceId}" has no text content`)
            return { ...base, text }
          }

          const binary = resource.binary ?? (await resource.readBinary?.())
          if (!binary) throw new Error(`Skill resource "${resource.resourceId}" has no binary content`)
          return { ...base, binary: new Uint8Array(binary) }
        }),
      )
    : undefined

  return {
    name: skill.name,
    description: skill.description,
    instructions: skill.instructions,
    resources,
    metadata,
  }
}

export const sameExtensionContent = async (left: ExtensionDefinition, right: ExtensionDefinition) => {
  if (left.kind !== right.kind) return false
  if (left.kind === 'mcp' && right.kind === 'mcp') return stableJson(mcpContent(left)) === stableJson(mcpContent(right))
  if (left.kind === 'skill' && right.kind === 'skill') {
    return stableJson(await skillContent(left.data)) === stableJson(await skillContent(right.data))
  }
  return false
}

export const withSkillSnapshot = (definition: Extract<ExtensionDefinition, { kind: 'skill' }>): SkillDefinition => ({
  ...definition.data,
  metadata: {
    ...definition.data.metadata,
    extensionVersion: definition.version,
    extensionSource: definition.source,
    extensionId: definition.id,
  },
})

export const fromStoredSkill = (skill: SkillDefinition): ExtensionDefinition => ({
  kind: 'skill',
  source: (skill.metadata?.extensionSource as ExtensionSource | undefined) ?? 'manual',
  id: String(skill.metadata?.extensionId ?? skill.name),
  version: skillVersion(skill),
  data: skill,
})

// SkillStorage 以 name 为键；应用层在写入前补上与 MCP storage 一致的版本保护。
export const resolveSkillSave = async (
  installed: SkillDefinition | undefined,
  definition: Extract<ExtensionDefinition, { kind: 'skill' }>,
): Promise<SkillDefinition | undefined> => {
  const snapshot = withSkillSnapshot(definition)
  if (!installed) return snapshot

  const installedVersion = skillVersion(installed)
  if (installedVersion > definition.version) {
    throw new Error(
      `${definition.data.name} cannot replace installed version ${installedVersion} with version ${definition.version}`,
    )
  }
  if (installedVersion < definition.version) return snapshot
  if (!(await sameExtensionContent(fromStoredSkill(installed), definition))) {
    throw new Error(`${definition.data.name} version conflict at version ${definition.version}`)
  }

  return undefined
}

// 同名 Skill 只有一个目录条目；较高版本覆盖，版本相同但定义冲突时报错。
export const canonicalCatalog = async (definitions: ExtensionDefinition[]) => {
  const byKey = new Map<string, ExtensionDefinition>()
  for (const definition of definitions) {
    const key = extensionKey(definition)
    const previous = byKey.get(key)
    if (!previous) byKey.set(key, definition)
    else if (definition.version > previous.version)
      byKey.set(key, { ...definition, installed: Boolean(previous.installed || definition.installed) })
    else if (definition.version === previous.version && !(await sameExtensionContent(definition, previous))) {
      throw new Error(`${key} 同版本定义冲突`)
    } else if (definition.installed && !previous.installed) byKey.set(key, { ...previous, installed: true })
  }
  return [...byKey.values()]
}

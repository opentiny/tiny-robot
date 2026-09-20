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
}

// Skill 的业务身份是 name；MCP 用来源与来源内稳定 ID，同名 MCP 可共存。
export const extensionKey = (item: ExtensionDefinition) =>
  item.kind === 'skill' ? `skill:${item.data.name}` : `mcp:${JSON.stringify([item.source, item.id])}`

export const skillVersion = (skill: SkillDefinition) => {
  const version = skill.metadata?.extensionVersion
  return typeof version === 'number' && Number.isSafeInteger(version) && version >= 0 ? version : 0
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

// 同名 Skill 只有一个目录条目；较高版本覆盖，版本相同但定义冲突时报错。
export const canonicalCatalog = (definitions: ExtensionDefinition[]) => {
  const byKey = new Map<string, ExtensionDefinition>()
  for (const definition of definitions) {
    const key = extensionKey(definition)
    const previous = byKey.get(key)
    if (!previous) byKey.set(key, definition)
    else if (definition.version > previous.version)
      byKey.set(key, { ...definition, installed: Boolean(previous.installed || definition.installed) })
    else if (
      definition.version === previous.version &&
      JSON.stringify(definition.data) !== JSON.stringify(previous.data)
    ) {
      throw new Error(`${key} 同版本定义冲突`)
    } else if (definition.installed && !previous.installed) byKey.set(key, { ...previous, installed: true })
  }
  return [...byKey.values()]
}

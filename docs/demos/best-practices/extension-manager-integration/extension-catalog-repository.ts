import { createMemoryMcpExtensionStorage, type McpExtensionIdentity } from '@opentiny/tiny-robot'
import { createMemorySkillStorage } from '@opentiny/tiny-robot-kit'
import {
  canonicalCatalog,
  extensionKey,
  fromStoredSkill,
  skillVersion,
  withSkillSnapshot,
  type ExtensionDefinition,
  type ResolvedExtension,
} from './catalog'
import { createMemorySkillOptionsStorage } from './skill-options-storage'

const parseMcpBusiness = (value: unknown) => {
  if (typeof value !== 'object' || value === null || !('enabled' in value) || typeof value.enabled !== 'boolean') {
    throw new Error('MCP enabled 配置无效')
  }
  return { enabled: value.enabled }
}

const mcpIdentity = (item: { source: string; id: string }): McpExtensionIdentity => ({
  source: item.source,
  id: item.id,
})

const extensionName = (item: ExtensionDefinition) => (item.kind === 'mcp' ? item.data.value.name : item.data.name)

// 应用在此替换存储实现；目录定义、已安装快照及启用偏好都由这一层协调。
export const createExtensionCatalogRepository = () => {
  const mcpStorage = createMemoryMcpExtensionStorage({ parseBusinessOptions: parseMcpBusiness })
  const skillStorage = createMemorySkillStorage()
  const skillOptions = createMemorySkillOptionsStorage()

  const persistEnabled = async (item: ExtensionDefinition, enabled: boolean) => {
    if (item.kind === 'mcp') {
      const identity = mcpIdentity(item)
      const current = await mcpStorage.getOptions(identity)
      await mcpStorage.setOptions(identity, {
        toolPolicy: current?.toolPolicy ?? { default: 'enabled', overrides: {} },
        business: { enabled },
      })
    } else await skillOptions.set(item.data.name, { enabled })
  }

  // 同名扩展只启用一个；切换目标前先保存其他已安装条目的禁用偏好。
  const disableNamedPeers = async (target: ExtensionDefinition, items: ResolvedExtension[]) => {
    for (const peer of items) {
      if (
        peer.kind === target.kind &&
        peer.installed &&
        peer.enabled &&
        extensionKey(peer) !== extensionKey(target) &&
        extensionName(peer) === extensionName(target)
      ) {
        await persistEnabled(peer, false)
      }
    }
  }

  const save = async (definition: ExtensionDefinition, items: ResolvedExtension[]) => {
    if (definition.kind === 'mcp') {
      const { value, tools } = definition.data
      await mcpStorage.upsertData({ ...mcpIdentity(definition), version: definition.version, ...value, tools })
      if ((await mcpStorage.getOptions(mcpIdentity(definition)))?.business?.enabled ?? true) {
        await disableNamedPeers(definition, items)
      }
    } else {
      await skillStorage.add(withSkillSnapshot(definition))
      if ((await skillOptions.get(definition.data.name))?.enabled ?? true) await disableNamedPeers(definition, items)
    }
  }

  const list = async (builtins: ExtensionDefinition[], remote: ExtensionDefinition[]) => {
    const errors: string[] = []
    const catalog = canonicalCatalog([...builtins, ...remote])
    const storedMcp = await mcpStorage.listData()
    const storedSkill = await Promise.all((await skillStorage.list()).map((summary) => skillStorage.get(summary.name)))
    const mcpByKey = new Map(storedMcp.map((record) => [JSON.stringify([record.source, record.id]), record]))
    const skillByName = new Map(storedSkill.filter((skill) => skill !== undefined).map((skill) => [skill.name, skill]))
    const items: ResolvedExtension[] = []
    const seen = new Set<string>()

    for (const definition of catalog) {
      const key = extensionKey(definition)
      seen.add(key)
      if (definition.kind === 'mcp') {
        const identity = mcpIdentity(definition)
        let stored = mcpByKey.get(JSON.stringify([identity.source, identity.id]))
        if (stored && definition.version > stored.version) {
          try {
            const { value, tools } = definition.data
            stored = await mcpStorage.upsertData({ ...identity, version: definition.version, ...value, tools })
          } catch (error) {
            errors.push(`${definition.id} 更新失败：${String(error)}`)
          }
        }
        const options = await mcpStorage.getOptions(identity)
        const current: ExtensionDefinition = stored
          ? {
              kind: 'mcp',
              source: definition.source,
              id: definition.id,
              version: stored.version,
              data: { value: stored, tools: stored.tools },
            }
          : definition
        items.push({
          ...current,
          installed: Boolean(stored || (definition.source === 'builtin' && definition.installed)),
          enabled: options?.business?.enabled ?? true,
          toolOverrides: options?.toolPolicy.overrides ?? {},
          toolDefault: options?.toolPolicy.default ?? 'enabled',
        })
      } else {
        let stored = skillByName.get(definition.data.name)
        if (stored && definition.version > skillVersion(stored)) {
          try {
            stored = await skillStorage.add(withSkillSnapshot(definition))
          } catch (error) {
            errors.push(`${definition.data.name} 更新失败：${String(error)}`)
          }
        }
        const options = await skillOptions.get(definition.data.name)
        const current = stored ? fromStoredSkill(stored) : definition
        items.push({
          ...current,
          installed: Boolean(stored || (definition.source === 'builtin' && definition.installed)),
          enabled: options?.enabled ?? true,
          toolOverrides: {},
          toolDefault: 'enabled',
        })
      }
    }

    for (const stored of storedMcp) {
      const definition: ExtensionDefinition = {
        kind: 'mcp',
        source: stored.source as ExtensionDefinition['source'],
        id: stored.id,
        version: stored.version,
        data: { value: stored, tools: stored.tools },
      }
      if (seen.has(extensionKey(definition))) continue
      const options = await mcpStorage.getOptions(stored)
      items.push({
        ...definition,
        installed: true,
        enabled: options?.business?.enabled ?? true,
        toolOverrides: options?.toolPolicy.overrides ?? {},
        toolDefault: options?.toolPolicy.default ?? 'enabled',
      })
    }
    for (const stored of storedSkill) {
      if (!stored) continue
      const definition = fromStoredSkill(stored)
      if (seen.has(extensionKey(definition))) continue
      const options = await skillOptions.get(stored.name)
      items.push({
        ...definition,
        installed: true,
        enabled: options?.enabled ?? true,
        toolOverrides: {},
        toolDefault: 'enabled',
      })
    }
    return { items, errors }
  }

  const setEnabled = async (item: ResolvedExtension, enabled: boolean, items: ResolvedExtension[]) => {
    if (enabled) await disableNamedPeers(item, items)
    await persistEnabled(item, enabled)
  }

  const setToolEnabled = (item: Extract<ResolvedExtension, { kind: 'mcp' }>, toolId: string, enabled: boolean) =>
    mcpStorage.setToolEnabled(mcpIdentity(item), toolId, enabled)

  const remove = async (item: ResolvedExtension) => {
    if (item.kind === 'mcp') await mcpStorage.deleteData(mcpIdentity(item))
    else await skillStorage.delete(item.data.name)
  }

  return { list, save, setEnabled, setToolEnabled, remove }
}

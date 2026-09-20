import { computed, ref, shallowRef } from 'vue'
import {
  createMemoryMcpExtensionStorage,
  type ExtensionManagerActionEvent,
  type ExtensionManagerTab,
  type McpExtensionIdentity,
} from '@opentiny/tiny-robot'
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
import { fetchRemoteExtensions, getBuiltInExtensions, prepareExtensionInstall } from './mock-api'
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

export const useExtensionCatalog = () => {
  const builtins = getBuiltInExtensions()
  // 生产应用可把 MCP 工厂换成 createMcpExtensionStorage({ adapter })，Skill 换成 kit 的持久实现。
  let mcpStorage = createMemoryMcpExtensionStorage({ parseBusinessOptions: parseMcpBusiness })
  let skillStorage = createMemorySkillStorage()
  let skillOptions = createMemorySkillOptionsStorage()
  const remoteCatalog = shallowRef<ExtensionDefinition[]>()
  const catalogError = ref('')
  const loading = ref(true)
  const saving = ref(false)
  const installProgress = ref<Record<string, number>>({})
  const items = shallowRef<ResolvedExtension[]>([])
  const activeTab = ref<string | undefined>('mcp')
  const message = ref('正在加载扩展目录…')
  let loadSequence = 0

  const sourceLabel = { builtin: '内置', remote: '远程', manual: '手动添加' }
  const tabs = computed<ExtensionManagerTab[]>(() =>
    (['mcp', 'skill'] as const).map((kind) => ({
      id: kind,
      label: kind === 'mcp' ? 'MCP' : 'Skills',
      items: items.value
        .filter((item) => item.kind === kind)
        .map((item) => ({
          id: extensionKey(item),
          name: item.kind === 'mcp' ? item.data.value.name : item.data.name,
          description: item.kind === 'mcp' ? item.data.value.description : item.data.description,
          installed: item.installed,
          progress: installProgress.value[extensionKey(item)],
          tags: [sourceLabel[item.source]],
          actions: item.installed
            ? [
                {
                  id: 'enabled',
                  type: 'switch' as const,
                  label: '启用',
                  checked: item.enabled,
                  disabled: saving.value,
                },
                ...(item.source === 'builtin' &&
                item.installed === true &&
                builtins.some((builtin) => extensionKey(builtin) === extensionKey(item) && builtin.installed === true)
                  ? []
                  : [{ id: 'uninstall', type: 'button' as const, label: '卸载', disabled: saving.value }]),
              ]
            : [{ id: 'install', type: 'button' as const, label: '安装', disabled: saving.value }],
        })),
    })),
  )

  const extensionName = (item: ExtensionDefinition) => (item.kind === 'mcp' ? item.data.value.name : item.data.name)

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
  const disableNamedPeers = async (target: ExtensionDefinition) => {
    for (const peer of items.value) {
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

  const saveDefinition = async (definition: ExtensionDefinition) => {
    if (definition.kind === 'mcp') {
      const { value, tools } = definition.data
      await mcpStorage.upsertData({ ...mcpIdentity(definition), version: definition.version, ...value, tools })
      if ((await mcpStorage.getOptions(mcpIdentity(definition)))?.business?.enabled ?? true) {
        await disableNamedPeers(definition)
      }
    } else {
      await skillStorage.add(withSkillSnapshot(definition))
      if ((await skillOptions.get(definition.data.name))?.enabled ?? true) await disableNamedPeers(definition)
    }
    await refreshItems()
  }

  const refreshItems = async () => {
    const errors: string[] = []
    const catalog = canonicalCatalog([...builtins, ...(remoteCatalog.value ?? [])])
    const storedMcp = await mcpStorage.listData()
    const storedSkill = await Promise.all((await skillStorage.list()).map((summary) => skillStorage.get(summary.name)))
    const mcpByKey = new Map(storedMcp.map((record) => [JSON.stringify([record.source, record.id]), record]))
    const skillByName = new Map(storedSkill.filter((skill) => skill !== undefined).map((skill) => [skill.name, skill]))
    const resolved: ResolvedExtension[] = []
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
        resolved.push({
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
        resolved.push({
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
      resolved.push({
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
      resolved.push({
        ...definition,
        installed: true,
        enabled: options?.enabled ?? true,
        toolOverrides: {},
        toolDefault: 'enabled',
      })
    }
    items.value = resolved
    if (errors.length) message.value = errors.join('；')
    return errors.length
  }

  const loadCatalog = async () => {
    const sequence = ++loadSequence
    loading.value = true
    try {
      remoteCatalog.value = await fetchRemoteExtensions()
      if (sequence !== loadSequence) return
      catalogError.value = ''
    } catch (error) {
      if (sequence !== loadSequence) return
      remoteCatalog.value = undefined
      catalogError.value = String(error)
    }
    try {
      const errors = await refreshItems()
      if (sequence !== loadSequence) return
      if (catalogError.value) message.value = '远程目录加载失败，已安装项仍从存储快照显示。'
      else if (!errors) message.value = '扩展目录已加载。'
    } catch (error) {
      if (sequence === loadSequence) message.value = `读取存储失败：${String(error)}`
    } finally {
      if (sequence === loadSequence) loading.value = false
    }
  }

  const setEnabled = async (item: ResolvedExtension, enabled: boolean) => {
    if (enabled) await disableNamedPeers(item)
    await persistEnabled(item, enabled)
    await refreshItems()
  }

  const setToolEnabled = async (
    item: Extract<ResolvedExtension, { kind: 'mcp' }>,
    toolId: string,
    enabled: boolean,
  ) => {
    await mcpStorage.setToolEnabled(mcpIdentity(item), toolId, enabled)
    await refreshItems()
  }

  const handleAction = async ({ itemId, action }: ExtensionManagerActionEvent) => {
    const item = items.value.find((candidate) => extensionKey(candidate) === itemId)
    if (!item || saving.value) return
    saving.value = true
    try {
      if (action.id === 'install') {
        installProgress.value = { ...installProgress.value, [itemId]: 0 }
        message.value = `正在安装 ${item.kind === 'mcp' ? item.data.value.name : item.data.name}…`
        await prepareExtensionInstall((progress) => {
          installProgress.value = { ...installProgress.value, [itemId]: progress }
        })
        // MCP 联通性校验等额外逻辑可在这里、保存定义之前 await validateMcpConnection(item.data.value)。
        await saveDefinition(item)
        message.value = '扩展已安装。'
      } else if (action.id === 'enabled' && typeof action.checked === 'boolean') {
        await setEnabled(item, action.checked)
        message.value = action.checked ? '扩展已启用。' : '扩展已禁用。'
      } else if (action.id === 'uninstall') {
        const builtin = builtins.find((definition) => extensionKey(definition) === itemId)
        if (builtin?.installed) return
        if (item.kind === 'mcp') await mcpStorage.deleteData(mcpIdentity(item))
        else await skillStorage.delete(item.data.name)
        await refreshItems()
        message.value = '扩展已卸载；再次安装会恢复上次配置。'
      }
    } catch (error) {
      message.value = `操作失败：${String(error)}`
    } finally {
      const { [itemId]: _complete, ...remaining } = installProgress.value
      installProgress.value = remaining
      saving.value = false
    }
  }

  const resetCatalog = () => {
    ++loadSequence
    mcpStorage = createMemoryMcpExtensionStorage({ parseBusinessOptions: parseMcpBusiness })
    skillStorage = createMemorySkillStorage()
    skillOptions = createMemorySkillOptionsStorage()
    remoteCatalog.value = undefined
    installProgress.value = {}
    activeTab.value = 'mcp'
    items.value = []
    message.value = '正在恢复初始数据…'
    void loadCatalog()
  }

  return {
    items,
    activeTab,
    message,
    tabs,
    catalogError,
    loading,
    saving,
    loadCatalog,
    saveDefinition,
    setToolEnabled,
    handleAction,
    resetCatalog,
  }
}

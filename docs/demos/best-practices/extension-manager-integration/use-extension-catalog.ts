import { computed, ref, shallowRef } from 'vue'
import { type ExtensionManagerActionEvent, type ExtensionManagerTab } from '@opentiny/tiny-robot'
import { extensionKey, type ExtensionDefinition, type ResolvedExtension } from './catalog'
import { createExtensionCatalogRepository } from './extension-catalog-repository'
import { fetchRemoteExtensions, getBuiltInExtensions, prepareExtensionInstall } from './mock-api'

export const useExtensionCatalog = () => {
  const builtins = getBuiltInExtensions()
  let repository = createExtensionCatalogRepository()
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

  const refreshItems = async () => {
    const { items: resolved, errors } = await repository.list(builtins, remoteCatalog.value ?? [])
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

  const saveDefinition = async (definition: ExtensionDefinition) => {
    await repository.save(definition, items.value)
    await refreshItems()
  }

  const setToolEnabled = async (
    item: Extract<ResolvedExtension, { kind: 'mcp' }>,
    toolId: string,
    enabled: boolean,
  ) => {
    await repository.setToolEnabled(item, toolId, enabled)
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
        await repository.setEnabled(item, action.checked, items.value)
        await refreshItems()
        message.value = action.checked ? '扩展已启用。' : '扩展已禁用。'
      } else if (action.id === 'uninstall') {
        const builtin = builtins.find((definition) => extensionKey(definition) === itemId)
        if (builtin?.installed) return
        await repository.remove(item)
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
    repository = createExtensionCatalogRepository()
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

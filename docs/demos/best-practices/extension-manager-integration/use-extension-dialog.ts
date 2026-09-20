import { computed, nextTick, ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import type {
  ExtensionManagerNameClickEvent,
  McpExtensionFormValue,
  McpExtensionToolToggleEvent,
  SkillDefinition,
} from '@opentiny/tiny-robot'
import { extensionKey, type ExtensionDefinition, type ResolvedExtension } from './catalog'

type DialogContext = {
  items: ShallowRef<ResolvedExtension[]>
  activeTab: Ref<string | undefined>
  message: Ref<string>
  saveDefinition: (definition: ExtensionDefinition) => Promise<void>
  setToolEnabled: (item: Extract<ResolvedExtension, { kind: 'mcp' }>, toolId: string, enabled: boolean) => Promise<void>
}

type Panel = 'mcp-add' | 'skill-local-add' | 'skill-github-add' | 'mcp-detail' | 'skill-detail' | null

const emptyMcpForm = (): McpExtensionFormValue => ({ name: '', type: 'streamableHttp', url: '' })

export const useExtensionDialog = ({ items, activeTab, message, saveDefinition, setToolEnabled }: DialogContext) => {
  const dialogError = ref('')
  const panel = ref<Panel>(null)
  const selectedKey = ref('')
  const dialogRef = ref<HTMLDialogElement | null>(null)
  const dialogTitle = ref<HTMLElement | null>(null)
  const mcpFormValue = shallowRef<McpExtensionFormValue>(emptyMcpForm())
  const formKey = ref(0)
  let lastTrigger: HTMLElement | null = null
  let nextManualId = 1

  const selected = computed(() => items.value.find((item) => extensionKey(item) === selectedKey.value))
  const selectedMcp = computed(() => (selected.value?.kind === 'mcp' ? selected.value : undefined))
  const selectedSkill = computed(() => (selected.value?.kind === 'skill' ? selected.value : undefined))
  const selectedTools = computed(
    () =>
      selectedMcp.value?.data.tools.map((tool) => ({
        ...tool,
        enabled:
          selectedMcp.value?.toolOverrides[tool.id] ??
          (selectedMcp.value?.toolDefault === 'disabled' ? false : tool.enabled),
      })) ?? [],
  )

  // 标题、打开、关闭与焦点恢复由应用持有，详情组件只负责渲染内容。
  const openDialog = async (nextPanel: Exclude<Panel, null>, key = '', trigger?: Event | HTMLElement) => {
    if (trigger) {
      const target = trigger instanceof HTMLElement ? trigger : trigger.target
      lastTrigger = target instanceof Element ? (target.closest('button, [role="button"]') as HTMLElement | null) : null
      lastTrigger ??= document.activeElement instanceof HTMLElement ? document.activeElement : null
    }
    panel.value = nextPanel
    selectedKey.value = key
    dialogError.value = ''
    if (nextPanel === 'mcp-add') mcpFormValue.value = emptyMcpForm()
    if (nextPanel === 'mcp-add' || nextPanel === 'skill-local-add' || nextPanel === 'skill-github-add')
      formKey.value += 1
    await nextTick()
    if (!dialogRef.value?.open) dialogRef.value?.showModal()
    dialogTitle.value?.focus()
  }

  const closeDialog = () => dialogRef.value?.close()
  const handleBackdropClick = (event: MouseEvent) => {
    const dialog = dialogRef.value
    if (!dialog || event.target !== dialog) return

    const { left, right, top, bottom } = dialog.getBoundingClientRect()
    if (event.clientX < left || event.clientX >= right || event.clientY < top || event.clientY >= bottom) {
      closeDialog()
    }
  }
  const onDialogClose = () => {
    panel.value = null
    selectedKey.value = ''
    dialogError.value = ''
    const trigger = lastTrigger
    lastTrigger = null
    void nextTick(() => trigger?.focus())
  }

  const handleNameClick = ({ itemId, event }: ExtensionManagerNameClickEvent) => {
    const item = items.value.find((candidate) => extensionKey(candidate) === itemId)
    if (item) void openDialog(item.kind === 'mcp' ? 'mcp-detail' : 'skill-detail', itemId, event)
  }

  // 表单 submit 只是校验后的数据；应用保存成功后才切换到详情。
  const handleMcpSubmit = async (value: McpExtensionFormValue) => {
    const id = `mcp-${nextManualId}`
    const definition: ExtensionDefinition = {
      kind: 'mcp',
      source: 'manual',
      id,
      version: 1,
      data: { value: { ...value }, tools: [{ id: 'query', name: '查询资料', enabled: true }] },
    }
    try {
      await saveDefinition(definition)
      nextManualId += 1
      activeTab.value = 'mcp'
      message.value = `${value.name} 已保存。`
      await openDialog('mcp-detail', extensionKey(definition))
    } catch (error) {
      dialogError.value = `保存失败：${String(error)}`
    }
  }

  // Skill 解析成功不等于安装；保存定义后才加入已安装列表。
  const handleSkillSubmit = async (definitionValue: SkillDefinition) => {
    const id = `skill-${nextManualId}`
    const definition: ExtensionDefinition = {
      kind: 'skill',
      source: 'manual',
      id,
      version: 1,
      data: definitionValue,
    }
    try {
      await saveDefinition(definition)
      nextManualId += 1
      activeTab.value = 'skill'
      message.value = `${definitionValue.name} 已保存。`
      await openDialog('skill-detail', extensionKey(definition))
    } catch (error) {
      dialogError.value = `保存失败：${String(error)}`
    }
  }

  // 详情组件只发出开关意图；工具偏好也由应用写入仓库。
  const handleToolToggle = async ({ toolId, enabled }: McpExtensionToolToggleEvent) => {
    const item = selectedMcp.value
    if (!item) return
    try {
      await setToolEnabled(item, toolId, enabled)
      dialogError.value = ''
      message.value = `工具已${enabled ? '启用' : '禁用'}。`
    } catch (error) {
      dialogError.value = `保存失败：${String(error)}`
    }
  }

  const resetDialog = () => {
    if (dialogRef.value?.open) closeDialog()
    nextManualId = 1
  }

  return {
    panel,
    dialogError,
    dialogRef,
    dialogTitle,
    formKey,
    mcpFormValue,
    selectedMcp,
    selectedSkill,
    selectedTools,
    openDialog,
    closeDialog,
    handleBackdropClick,
    onDialogClose,
    handleNameClick,
    handleMcpSubmit,
    handleSkillSubmit,
    handleToolToggle,
    resetDialog,
  }
}

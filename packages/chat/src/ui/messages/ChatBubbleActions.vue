<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { resolveChatTokenUsage } from '../../runtime/usage'
import type {
  ChatActionCondition,
  ChatBubbleActionContext,
  ChatBubbleActionsOptions,
  ChatBubbleActionItem,
} from '../../types'

const props = defineProps<{ context: ChatBubbleActionContext; options: ChatBubbleActionsOptions; role: string }>()
const emit = defineEmits<{
  edit: [text: string, complete: (accepted: boolean) => void]
  regenerate: []
  error: [payload: { actionId: string; messageId?: string; error: unknown }]
}>()
const slots = defineSlots<{
  action?: (scope: {
    item: ChatBubbleActionItem
    context: ChatBubbleActionContext
    disabled: boolean
    setOpen: (open: boolean) => void
  }) => unknown
}>()

const editing = ref(false)
const draft = ref('')
const usageOpen = ref(false)
const busyIds = ref(new Set<string>())
const slotOpenIds = ref(new Set<string>())
const editPending = ref(false)
const defaultItems: readonly ChatBubbleActionItem[] = props.role === 'user' ? ['copy', 'edit'] : ['copy', 'regenerate']
const displayMode = computed(() =>
  typeof props.options.display === 'function'
    ? props.options.display(props.context)
    : (props.options.display ?? 'hover'),
)
const items = computed<readonly ChatBubbleActionItem[]>(() => {
  const configured = props.options[props.role as 'user' | 'assistant']
  const resolved = typeof configured === 'function' ? configured(defaultItems, props.context) : configured
  return resolved === false ? [] : (resolved ?? defaultItems)
})

function actionId(item: ChatBubbleActionItem): string {
  return typeof item === 'string' ? item : item.id
}

const usage = computed(() => {
  const hasAction = items.value.some((item) => actionId(item) === 'usage')
  if (!hasAction) return undefined
  try {
    const configured = props.options.usage?.resolve
    return resolveChatTokenUsage(configured ? configured(props.context) : props.context.message.metadata?.usage)
  } catch {
    return undefined
  }
})

watch(
  () => props.context.messageKey,
  () => {
    editing.value = false
    usageOpen.value = false
    slotOpenIds.value = new Set()
  },
)

function condition(value: ChatActionCondition | undefined) {
  return typeof value === 'function' ? value(props.context) : value !== false
}

function visible(item: ChatBubbleActionItem) {
  const id = actionId(item)
  if (id === 'edit' && !props.context.capabilities.canEdit) return false
  if (id === 'regenerate' && !props.context.capabilities.canRegenerate) return false
  if (id === 'usage' && !usage.value) return false
  return typeof item === 'string' || condition(item.visible)
}

function textToCopy() {
  const override = props.options.copy?.getText?.(props.context)
  if (override !== undefined) return override
  const content = props.context.message.content
  if (typeof content === 'string') return content
  return Array.isArray(content)
    ? content
        .filter((part) => part.type === 'text' && typeof part.text === 'string')
        .map((part) => part.text as string)
        .join('\n')
    : ''
}

function disabled(item: ChatBubbleActionItem) {
  if (typeof item === 'object' && item.disabled !== undefined && condition(item.disabled)) return true
  return actionId(item) === 'copy' && !textToCopy().trim()
}

async function activate(item: ChatBubbleActionItem) {
  const id = actionId(item)
  if (!visible(item) || disabled(item) || busyIds.value.has(id)) return
  if (id === 'edit') {
    if (typeof props.context.message.content !== 'string') return
    draft.value = props.context.message.content
    editing.value = true
    return
  }
  if (id === 'regenerate') return emit('regenerate')
  if (id === 'usage') {
    if (props.options.usage?.trigger !== 'hover') usageOpen.value = !usageOpen.value
    return
  }
  if (id === 'copy') {
    try {
      await navigator.clipboard.writeText(textToCopy())
    } catch (error) {
      emit('error', { actionId: id, messageId: props.context.messageId, error })
    }
    return
  }
  if (typeof item === 'object' && item.type === 'custom') {
    busyIds.value = new Set(busyIds.value).add(id)
    try {
      await item.onClick(props.context)
    } catch (error) {
      emit('error', { actionId: id, messageId: props.context.messageId, error })
    } finally {
      const next = new Set(busyIds.value)
      next.delete(id)
      busyIds.value = next
    }
  }
}

function setSlotOpen(id: string, open: boolean) {
  const next = new Set(slotOpenIds.value)
  if (open) next.add(id)
  else next.delete(id)
  slotOpenIds.value = next
}

function submitEdit() {
  if (editPending.value) return
  editPending.value = true
  emit('edit', draft.value, (accepted) => {
    editPending.value = false
    if (accepted) editing.value = false
  })
}
</script>

<template>
  <div
    v-if="items.some(visible) && condition(options.visible)"
    class="tr-chat-bubble-actions"
    :class="{
      'is-latest': context.isLatest,
      'is-open': usageOpen || editing || slotOpenIds.size > 0,
      'is-always': displayMode === 'always',
    }"
    @mouseenter="options.usage?.trigger === 'hover' && (usageOpen = true)"
    @mouseleave="options.usage?.trigger === 'hover' && (usageOpen = false)"
  >
    <template v-for="item in items" :key="actionId(item)">
      <button
        v-if="visible(item) && (typeof item === 'string' || item.type !== 'slot')"
        type="button"
        :aria-label="typeof item === 'object' && 'label' in item ? item.label : actionId(item)"
        :disabled="disabled(item) || busyIds.has(actionId(item))"
        @click="activate(item)"
      >
        {{
          typeof item === 'object' && 'label' in item && item.label
            ? item.label
            : ({
                copy: '复制',
                edit: '编辑',
                regenerate: context.turnState === 'error' || context.turnState === 'aborted' ? '重试' : '重新生成',
                usage: '用量',
              }[actionId(item)] ?? actionId(item))
        }}
      </button>
      <template v-else-if="visible(item) && typeof item === 'object' && item.type === 'slot'">
        <component
          :is="slots.action"
          :item="item"
          :context="context"
          :disabled="disabled(item) || busyIds.has(actionId(item))"
          :set-open="(open: boolean) => setSlotOpen(actionId(item), open)"
        />
      </template>
    </template>
    <div v-if="usageOpen && usage" class="tr-chat-bubble-actions__usage" role="dialog" aria-label="本次模型请求用量">
      <strong>本次模型请求用量</strong>
      <span
        >输入 Token <b>{{ usage.prompt_tokens ?? '—' }}</b></span
      >
      <span
        >输出 Token <b>{{ usage.completion_tokens ?? '—' }}</b></span
      >
      <span
        >总计 Token <b>{{ usage.total_tokens ?? '—' }}</b></span
      >
    </div>
    <form v-if="editing" class="tr-chat-bubble-actions__editor" @submit.prevent="submitEdit">
      <textarea v-model="draft" aria-label="编辑消息" />
      <button type="submit" :disabled="editPending">{{ editPending ? '提交中…' : '提交' }}</button>
      <button type="button" :disabled="editPending" @click="editing = false">取消</button>
    </form>
  </div>
</template>

<style scoped>
.tr-chat-bubble-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 28px;
  position: relative;
}
.tr-chat-bubble-actions button {
  border: 0;
  background: transparent;
  color: var(--tr-text-color-secondary);
  cursor: pointer;
  padding: 4px 7px;
  font: inherit;
}
.tr-chat-bubble-actions button:hover {
  background: var(--tr-container-bg-hover);
}
.tr-chat-bubble-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.tr-chat-bubble-actions__usage,
.tr-chat-bubble-actions__editor {
  position: absolute;
  z-index: 3;
  top: 100%;
  left: 0;
  display: grid;
  gap: 8px;
  min-width: 220px;
  padding: 12px;
  border: 1px solid var(--tr-border-color-default);
  background: var(--tr-container-bg-default);
  box-shadow: 0 4px 14px #0002;
}
.tr-chat-bubble-actions__usage span {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
.tr-chat-bubble-actions__editor textarea {
  min-width: 260px;
  min-height: 80px;
  resize: vertical;
}
</style>

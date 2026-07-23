<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrBubbleList, TrBubbleProvider, TrPrompts, TrWelcome } from '@opentiny/tiny-robot'
import { useChatContext } from '../composables/useChatContext'
import type { LayoutScrollTarget, PromptProps } from '@opentiny/tiny-robot'
import type { ChatMessageItem, ChatPromptsUi } from '../types'

type BubbleDisplayMessage = {
  role?: ChatMessageItem['role']
  content?: ChatMessageItem['content']
  reasoning_content?: ChatMessageItem['reasoning_content']
  tool_calls?: ChatMessageItem['tool_calls']
  tool_call_id?: ChatMessageItem['tool_call_id']
  name?: ChatMessageItem['name']
  id?: ChatMessageItem['id']
  loading?: ChatMessageItem['loading']
  state?: ChatMessageItem['state']
  parts?: ChatMessageItem['parts']
  metadata?: ChatMessageItem['metadata']
  raw: ChatMessageItem
}

const props = defineProps<{
  isEmpty?: boolean
}>()

const { composer, runtime, ui } = useChatContext()
const toBubbleDisplayMessage = (message: ChatMessageItem): BubbleDisplayMessage => ({
  role: message.role,
  content: message.content,
  reasoning_content: message.reasoning_content,
  tool_calls: message.tool_calls,
  tool_call_id: message.tool_call_id,
  name: message.name,
  id: message.id,
  loading: message.loading,
  state: message.state,
  parts: message.parts,
  metadata: message.metadata,
  raw: message,
})

const messages = computed<BubbleDisplayMessage[]>(() => runtime.value.messages.items.value.map(toBubbleDisplayMessage))
const isEmpty = computed(() => props.isEmpty ?? messages.value.length === 0)
const bubbleListRef = ref<LayoutScrollTarget>(null)
const scrollTarget = computed(() => {
  const element = bubbleListRef.value instanceof HTMLElement ? bubbleListRef.value : bubbleListRef.value?.$el
  return element instanceof HTMLElement ? element : null
})

const welcomeProps = computed(() => ui.value.welcome)
const promptsUi = computed<ChatPromptsUi>(() => ui.value.prompts ?? {})
const promptListProps = computed(() => ({
  ...(() => {
    const { onItemClick: _onItemClick, ...props } = promptsUi.value

    return props
  })(),
  items: promptsUi.value.items ?? [],
}))
const hasPrompts = computed(() => promptListProps.value.items.length > 0)
const bubbleProviderProps = computed(() => ui.value.bubbleProvider)
const bubbleListProps = computed(() => ui.value.bubbleList)

function handlePromptClick(event: MouseEvent, item: PromptProps) {
  if (item.disabled) {
    return
  }

  composer.setInputValue(item.label)
  promptsUi.value.onItemClick?.(event, item)
}

defineExpose({
  scrollTarget,
})
</script>

<template>
  <div class="tr-chat-messages">
    <template v-if="isEmpty">
      <TrWelcome v-if="welcomeProps" v-bind="welcomeProps">
        <template v-if="$slots['welcome-footer']" #footer>
          <slot name="welcome-footer" />
        </template>
      </TrWelcome>
      <TrPrompts v-if="hasPrompts" v-bind="promptListProps" @item-click="handlePromptClick">
        <template v-if="$slots['prompts-footer']" #footer>
          <slot name="prompts-footer" />
        </template>
      </TrPrompts>
    </template>

    <TrBubbleProvider v-else v-bind="bubbleProviderProps">
      <TrBubbleList
        ref="bubbleListRef"
        v-bind="bubbleListProps"
        class="tr-chat-messages__bubble-list"
        :messages="messages"
      >
        <template v-if="$slots.prefix" #prefix="slotProps">
          <slot name="prefix" v-bind="slotProps" />
        </template>
        <template v-if="$slots.suffix" #suffix="slotProps">
          <slot name="suffix" v-bind="slotProps" />
        </template>
        <template v-if="$slots.after" #after="slotProps">
          <slot name="after" v-bind="slotProps" />
        </template>
        <template v-if="$slots['content-footer']" #content-footer="slotProps">
          <slot name="content-footer" v-bind="slotProps" />
        </template>
      </TrBubbleList>
    </TrBubbleProvider>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-messages {
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.tr-chat-messages__bubble-list {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tr-chat-messages__bubble-list::-webkit-scrollbar {
  display: none;
}
</style>

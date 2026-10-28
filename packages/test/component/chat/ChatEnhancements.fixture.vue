<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import TrChat from '../../../chat/src/Chat.vue'
import TrChatUI from '../../../chat/src/ChatUI.vue'
import type { ChatInputActions, ChatRuntime, ChatUIOptions } from '../../../chat/src/types'

const props = withDefaults(
  defineProps<{
    entry?: 'ui' | 'runtime'
    path?: 'custom' | 'center' | 'footer'
    mode?: 'single' | 'multiple'
    controlledEmpty?: boolean
    disabled?: boolean
    systemOnly?: boolean
    hideSender?: boolean
    showScrollToBottom?: boolean
  }>(),
  { entry: 'ui', path: 'footer', mode: 'single', controlledEmpty: undefined, showScrollToBottom: true },
)
const chat = shallowRef<ChatInputActions | null>(null)
const present = shallowRef(false)
const visible = shallowRef(true)
const label = shallowRef('Auto')
const focusResult = shallowRef<boolean | null>(null)
const input = shallowRef('')
const sends = shallowRef(0)
const senderDragTarget = shallowRef('')
const senderDragOverPrevented = shallowRef(false)
const senderDropFiles = shallowRef('')
const senderPasteCount = shallowRef(0)
const extensionCreates = shallowRef(0)
const extensionDestroys = shallowRef(0)
const editor = shallowRef<{ view: { composing: boolean } } | null>(null)
const composing = shallowRef(false)
const extensions = [
  TrSender.Suggestion.extend({
    onCreate(event) {
      this.parent?.(event)
      editor.value = this.editor
      extensionCreates.value++
    },
    onDestroy(event) {
      this.parent?.(event)
      extensionDestroys.value++
    },
  }),
]
const runtime: ChatRuntime = {
  conversations: shallowRef([]),
  activeConversation: shallowRef(null),
  composer: { disabled: computed(() => props.disabled ?? false) },
  actions: {
    send: async () => {
      sends.value++
      return true
    },
    clearActiveConversation() {},
    createConversation() {},
    switchConversation() {},
    renameConversation() {},
    deleteConversation() {},
  },
}
const ui = computed<ChatUIOptions>(() => ({
  layout: {
    leftAside: false,
    rightAside: false,
    showScrollToBottom: props.showScrollToBottom,
    composer: { welcome: props.path === 'center' ? 'center' : 'footer' },
  },
  sender: props.hideSender ? false : { mode: props.mode, toolbar: [], extensions },
  bubble: { bubbleList: { roleConfigs: { assistant: { placement: 'start' } } } },
}))
const entryProps = computed(() =>
  props.entry === 'runtime'
    ? { runtime }
    : {
        data: {
          sender: { disabled: props.disabled },
          bubble: { messages: props.systemOnly ? [{ role: 'system', content: 'System prompt' }] : [] },
        },
        inputValue: input.value,
      },
)

async function focusInput() {
  focusResult.value = (await chat.value?.focusInput()) ?? false
}
</script>

<template>
  <div class="enhancements-fixture">
    <button data-testid="add" @click="present = !present">Toggle slot</button>
    <button data-testid="visible" @click="visible = !visible">Toggle content</button>
    <button data-testid="update" @click="label = 'Updated'">Update</button>
    <button data-testid="fill" @click="chat?.setInputValue('host prompt')">Fill</button>
    <button data-testid="clear" @click="chat?.clearInput()">Clear</button>
    <button data-testid="focus" @click="focusInput">Focus</button>
    <button data-testid="composition" @click="composing = editor?.view.composing ?? false">Read composition</button>
    <output data-testid="focus-result">{{ focusResult }}</output>
    <output data-testid="sends">{{ sends }}</output>
    <output data-testid="sender-drag-target">{{ senderDragTarget }}</output>
    <output data-testid="sender-drag-over-prevented">{{ senderDragOverPrevented }}</output>
    <output data-testid="sender-drop-files">{{ senderDropFiles }}</output>
    <output data-testid="sender-paste-count">{{ senderPasteCount }}</output>
    <output data-testid="extension-creates">{{ extensionCreates }}</output>
    <output data-testid="extension-destroys">{{ extensionDestroys }}</output>
    <output data-testid="composing">{{ composing }}</output>
    <component
      :is="entry === 'runtime' ? TrChat : TrChatUI"
      ref="chat"
      v-bind="entryProps"
      :ui="ui"
      :is-empty="controlledEmpty"
      @update:input-value="input = $event"
      @sender-drag-enter="senderDragTarget = $event.target.className"
      @sender-drag-over="($event.event.preventDefault(), (senderDragOverPrevented = $event.event.defaultPrevented))"
      @sender-drop="
        senderDropFiles = Array.from($event.event.dataTransfer?.files ?? [])
          .map((file) => file.name)
          .join(',')
      "
      @sender-paste="senderPasteCount++"
    >
      <template #layout-header="{ isEmpty }"
        ><output data-testid="empty">{{ isEmpty }}</output></template
      >
      <template v-if="path === 'custom'" #layout-empty-state="{ renderComposer }">
        <section data-testid="custom-welcome"><component :is="renderComposer" /></section>
      </template>
      <template #composer-before><span data-testid="attachment">Attachment</span></template>
      <template v-if="present" #sender-header
        ><span v-if="visible" data-testid="tag">{{ label }}</span></template
      >
      <template v-if="present" #sender-footer="{ insert, disabled }">
        <span data-testid="footer-tag">{{ label }}</span>
        <button data-testid="footer-insert" :disabled="disabled" @mousedown.prevent @click="insert('footer input')">
          Insert
        </button>
      </template>
      <template v-if="present" #sender-footer-right="{ disabled }">
        <span data-testid="right-tag">{{ label }}</span>
        <button data-testid="footer-scope-state" :disabled="disabled">Footer state</button>
      </template>
    </component>
  </div>
</template>

<style scoped>
.enhancements-fixture {
  height: 600px;
  --tr-layout-height: 520px;
  --tr-chat-ui-header-padding: 3px 5px 7px;
  --tr-chat-ui-main-padding: 9px;
  --tr-chat-ui-footer-padding: 11px 13px 15px;
  --tr-chat-ui-content-max-width: 700px;
}
</style>

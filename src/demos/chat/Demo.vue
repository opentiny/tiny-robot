<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { TrAttachments, UploadButton, type Attachment } from '@opentiny/tiny-robot'
import {
  TrChat,
  useChatRuntime,
  type ChatMessageContent,
  type ChatUIOptions,
  type SenderDragPayload,
} from '@opentiny/tiny-robot-chat'
import { createDemoStorage } from '../../fixtures/data'

const imageTypes = ['image/png', 'image/jpeg']
const props = withDefaults(defineProps<{ source?: 'mock' | 'live' }>(), { source: 'mock' })
const attachments = ref<Attachment[]>([])
const reading = ref(false)
const error = ref('')
const runtime = useChatRuntime({
  modelProviders: [
    {
      type: 'openai',
      apiUrl: new URL(
        props.source === 'live' ? '/api/bailian/chat/completions' : '/api/demo/chat/completions',
        location.origin,
      ).href,
      models: [{ id: 'qwen3-vl-plus', label: props.source === 'live' ? '百炼视觉模型' : '本地模拟模型' }],
    },
  ],
  composer: { submitDisabled: reading },
  conversation: {
    storage: createDemoStorage(),
    onLoad: () => {
      void runtime.actions.switchConversation('release')
    },
    useMessageOptions: {
      requestMessageFields: ['role', 'content'],
      plugins: [
        {
          name: 'demo-image-attachment',
          onTurnStart({ currentTurn }) {
            const userMessage = currentTurn[0]
            if (userMessage?.role !== 'user') return
            const content = userMessage.content
            if (typeof content !== 'string') return
            const payloads = userMessage.externalPayloads as
              { source: string; payload: Attachment[] }[] | undefined
            const image = payloads?.find(({ source }) => source === 'attachments')?.payload[0]?.url
            if (!image) return
            const message: { content: ChatMessageContent } = userMessage
            message.content = [
              { type: 'text', text: content || '请描述这张图片。' },
              { type: 'image_url', image_url: { url: image } },
            ]
            delete userMessage.externalPayloads
            if (attachments.value[0]?.url === image) attachments.value = []
          },
        },
      ],
    },
  },
})
const ui: ChatUIOptions = {
  layout: { leftAside: { defaultOpen: true, width: 196 }, contentMaxWidth: 720 },
  labels: { composerPlaceholder: '输入消息，或拖入图片…' },
}
let readRevision = 0

watch(
  () => runtime.activeConversation.value?.id,
  () => {
    readRevision++
    attachments.value = []
    reading.value = false
    error.value = ''
  },
)

function attach(files: ArrayLike<File> | null | undefined) {
  const file = files?.[0]
  if (!file) return
  const revision = ++readRevision
  reading.value = false
  error.value = ''
  if (!imageTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
    error.value = '请选择 2 MB 以内的 PNG 或 JPEG 图片。'
    return
  }
  reading.value = true
  const reader = new FileReader()
  reader.onloadend = () => {
    if (revision !== readRevision) return
    reading.value = false
    if (typeof reader.result !== 'string') {
      error.value = '图片读取失败，请重新选择。'
      return
    }
    attachments.value = [
      { id: String(revision), name: file.name, url: reader.result, fileType: 'image', status: 'success' },
    ]
  }
  reader.readAsDataURL(file)
}

function allowDrop({ event }: SenderDragPayload) {
  if (event.dataTransfer?.types.includes('Files')) event.preventDefault()
}

function handleDrop({ event }: SenderDragPayload) {
  if (!event.dataTransfer?.files.length) return
  event.preventDefault()
  attach(event.dataTransfer.files)
}

function handlePaste(event: ClipboardEvent) {
  if (!event.clipboardData?.files.length) return
  event.preventDefault()
  attach(event.clipboardData.files)
}

onUnmounted(() => {
  readRevision++
  void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
})
</script>

<template>
  <section class="chat-scene live-chat-scene">
    <TrChat
      :runtime="runtime"
      :ui="ui"
      @sender-drag-over="allowDrop"
      @sender-drop="handleDrop"
      @sender-paste="handlePaste"
      @runtime-action-error="error = String($event.error)"
    >
      <template #sender-header>
        <p v-if="error" class="error-message" role="alert">{{ error }}</p>
        <TrAttachments v-if="attachments.length" v-model:items="attachments" variant="card" />
      </template>
      <template #sender-footer-right>
        <UploadButton
          accept="image/png,image/jpeg"
          tooltip="添加图片"
          aria-label="添加图片"
          @select="attach"
        />
      </template>
    </TrChat>
  </section>
</template>

<style scoped>
.live-chat-scene {
  --tr-bubble-image-max-width: 240px;
  --tr-bubble-image-max-height: 150px;
}
</style>

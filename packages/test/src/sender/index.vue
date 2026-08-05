<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { Sender, TrAttachments } from '@opentiny/tiny-robot'
import type {
  Attachment,
  MentionItem,
  SenderSubmitMeta,
  SenderSuggestionItem,
  StructuredData,
  TemplateItem,
} from '@opentiny/tiny-robot'

declare global {
  interface Window {
    __senderTestApi?: {
      moveCursorBeforeTemplate: (index: number) => boolean
      pressDeleteBeforeTemplate: (index: number) => boolean
      setSenderAttachmentStatus: (status: NonNullable<Attachment['status']>) => void
    }
  }
}

const senderRef = ref()
const content = ref('')
const result = ref('')
const submitDetail = ref('')

const isMultipleMode = ref(false)
const clearable = ref(false)
const loading = ref(false)
const disabled = ref(false)
const showWordLimit = ref(true)
const isSmallSize = ref(false)
const hasExternalContent = ref(false)
const submitType = ref<'enter' | 'ctrlEnter' | 'shiftEnter'>('enter')
const maxLength = ref(100)
const placeholder = ref('请输入内容...')

const enableMention = ref(false)
const enableTemplate = ref(false)
const enableSuggestion = ref(false)
const templateData = ref<TemplateItem[]>([])
const attachmentsSourceMounted = ref(false)
const senderAttachmentItems = ref<Attachment[]>([
  {
    id: 'sender-attachment',
    name: 'sender-note.txt',
    url: 'https://example.com/files/sender-note.txt',
    status: 'success',
  },
])

const mode = computed(() => (isMultipleMode.value ? 'multiple' : 'single'))
const size = computed(() => (isSmallSize.value ? 'small' : 'normal'))

const componentKey = computed(() => {
  return `${enableMention.value}-${enableTemplate.value}-${enableSuggestion.value}`
})

const handleModeChange = () => {
  result.value = `模式切换为: ${mode.value}`
}

const handleSizeChange = () => {
  result.value = `尺寸切换为: ${size.value}`
}

const handleSubmit = (...args: [string, StructuredData?, SenderSubmitMeta?]) => {
  const [value, structuredData, meta] = args
  result.value = `提交内容: ${value}`
  submitDetail.value = JSON.stringify({
    argsLength: args.length,
    textContent: value,
    structuredData: structuredData ?? null,
    meta: meta ?? null,
  })
}

const handleCancel = () => {
  result.value = '取消操作'
}

const handleClear = () => {
  result.value = '内容已清空'
}

const handleCustomAction = () => {
  result.value = '自定义按钮被点击'
}

const handleClearSenderAttachmentItems = () => {
  senderAttachmentItems.value = []
}

const setSenderAttachmentStatus = (status: NonNullable<Attachment['status']>) => {
  senderAttachmentItems.value = senderAttachmentItems.value.map((item) => ({
    ...item,
    status,
  }))
}

const handleSetContent = () => {
  senderRef.value?.setContent('<p>测试内容</p>')
  result.value = '已设置内容'
}

const handleGetContent = () => {
  const current = senderRef.value?.getContent() ?? ''
  result.value = `当前内容: ${current}`
}

const handleFocus = () => {
  senderRef.value?.focus()
  result.value = '调用 focus 方法'
}

const handleBlur = () => {
  senderRef.value?.blur()
  result.value = '调用 blur 方法'
}

const handleClearMethod = () => {
  senderRef.value?.clear()
  result.value = '调用 clear 方法'
}

const handleSubmitMethod = () => {
  senderRef.value?.submit()
  result.value = '调用 submit 方法'
}

const setTemplateSimple = () => {
  templateData.value = [
    { type: 'text', content: '我是' },
    { type: 'block', content: '张三' },
    { type: 'text', content: '，来自' },
  ]
  result.value = '已设置简单模板'
}

const setTemplateEmpty = () => {
  templateData.value = [
    { type: 'text', content: '我是' },
    { type: 'block', content: '' },
    { type: 'text', content: '，来自' },
  ]
  result.value = '已设置空模板块'
}

const setTemplateMultiple = () => {
  templateData.value = [
    { type: 'block', content: '姓名' },
    { type: 'block', content: '年龄' },
    { type: 'block', content: '城市' },
  ]
  result.value = '已设置多个模板块'
}

const clearTemplate = () => {
  templateData.value = []
  result.value = '已清空模板'
}

const mentions = ref<MentionItem[]>([
  {
    label: '小小画家',
    value: '你是一个专业的绘画助手，擅长创作各种风格的艺术作品。',
  },
  {
    label: '代码助手',
    value: '你是一个专业的编码助手，精通多种编程语言和框架。',
  },
  {
    label: '文案大师',
    value: '你是一个专业的文案助手，能够创作吸引人的营销文案。',
  },
  {
    label: '数据分析',
    value: '你是一个专业的数据分析师，擅长从数据中提取有价值的信息。',
  },
])

const suggestions = ref<SenderSuggestionItem[]>([
  { content: 'Java' },
  { content: 'JavaScript' },
  { content: 'TypeScript' },
  { content: 'Python' },
  { content: 'C++' },
  { content: 'Golang' },
])

const extensions = computed(() => {
  const exts = []
  if (enableMention.value) {
    exts.push(Sender.mention(mentions))
  }
  if (enableTemplate.value) {
    exts.push(Sender.template(templateData))
  }
  if (enableSuggestion.value) {
    exts.push(Sender.suggestion(suggestions))
  }
  return exts
})

const moveCursorBeforeTemplate = (index: number) => {
  const exposedEditor = senderRef.value?.editor
  const editor = exposedEditor?.value ?? exposedEditor
  if (!editor) return false

  let currentIndex = 0
  let templatePosition: number | null = null

  editor.state.doc.descendants((node: { type: { name: string } }, pos: number) => {
    if (node.type.name === 'templateBlock') {
      if (currentIndex === index) {
        templatePosition = pos
        return false
      }
      currentIndex += 1
    }
    return true
  })

  if (templatePosition === null) return false

  editor.commands.setTextSelection(templatePosition)
  editor.commands.focus(templatePosition)

  return editor.state.selection.$from.nodeAfter?.type?.name === 'templateBlock'
}

const pressDeleteBeforeTemplate = (index: number) => {
  const exposedEditor = senderRef.value?.editor
  const editor = exposedEditor?.value ?? exposedEditor
  if (!editor || !moveCursorBeforeTemplate(index)) return false

  const deleteEvent = new KeyboardEvent('keydown', {
    key: 'Delete',
    bubbles: true,
    cancelable: true,
  })

  return editor.view.dom.dispatchEvent(deleteEvent) === false
}

onMounted(() => {
  window.__senderTestApi = {
    moveCursorBeforeTemplate,
    pressDeleteBeforeTemplate,
    setSenderAttachmentStatus,
  }
})

onBeforeUnmount(() => {
  delete window.__senderTestApi
})
</script>

<template>
  <div class="sender-demo">
    <h2>Sender 组件测试</h2>

    <div class="control-panel">
      <fieldset class="control-group">
        <legend>基础属性</legend>
        <div class="control-row">
          <div class="control-item">
            <label>mode:</label>
            <tiny-switch
              data-testid="toggle-mode-btn"
              v-model="isMultipleMode"
              @change="handleModeChange"
            ></tiny-switch>
            <span data-testid="mode-display">{{ mode }}</span>
          </div>
          <div class="control-item">
            <label>clearable:</label>
            <tiny-switch data-testid="toggle-clearable-btn" v-model="clearable"></tiny-switch>
          </div>
          <div class="control-item">
            <label>loading:</label>
            <tiny-switch data-testid="toggle-loading-btn" v-model="loading"></tiny-switch>
          </div>
          <div class="control-item">
            <label>disabled:</label>
            <tiny-switch data-testid="toggle-disabled-btn" v-model="disabled"></tiny-switch>
          </div>
          <div class="control-item">
            <label>showWordLimit:</label>
            <tiny-switch data-testid="toggle-word-limit-btn" v-model="showWordLimit"></tiny-switch>
          </div>
          <div class="control-item">
            <label>size:</label>
            <tiny-switch data-testid="toggle-size-btn" v-model="isSmallSize" @change="handleSizeChange"></tiny-switch>
            <span>{{ size }}</span>
          </div>
          <div class="control-item">
            <label>hasExternalContent:</label>
            <tiny-switch data-testid="toggle-external-content-btn" v-model="hasExternalContent"></tiny-switch>
          </div>
          <div class="control-item">
            <label>attachmentsSource:</label>
            <tiny-switch data-testid="toggle-attachments-source-btn" v-model="attachmentsSourceMounted"></tiny-switch>
          </div>
          <div class="control-item">
            <label>attachmentsItems:</label>
            <button data-testid="clear-attachments-source-items-btn" @click="handleClearSenderAttachmentItems">
              clear
            </button>
          </div>
          <div class="control-item">
            <label>submitType:</label>
            <select data-testid="submit-type-select" v-model="submitType">
              <option value="enter">enter</option>
              <option value="ctrlEnter">ctrlEnter</option>
              <option value="shiftEnter">shiftEnter</option>
            </select>
          </div>
          <div class="control-item">
            <label>maxLength:</label>
            <input data-testid="max-length-input" type="number" v-model.number="maxLength" />
          </div>
          <div class="control-item">
            <label>placeholder:</label>
            <input data-testid="placeholder-input" type="text" v-model="placeholder" />
          </div>
        </div>
      </fieldset>

      <fieldset class="control-group">
        <legend>扩展开关</legend>
        <div class="control-row">
          <div class="control-item">
            <label>mention:</label>
            <tiny-switch data-testid="toggle-mention-btn" v-model="enableMention"></tiny-switch>
          </div>
          <div class="control-item">
            <label>template:</label>
            <tiny-switch data-testid="toggle-template-btn" v-model="enableTemplate"></tiny-switch>
          </div>
          <div class="control-item">
            <label>suggestion:</label>
            <tiny-switch data-testid="toggle-suggestion-btn" v-model="enableSuggestion"></tiny-switch>
          </div>
        </div>
      </fieldset>

      <fieldset class="control-group">
        <legend>方法调用</legend>
        <div class="button-row">
          <button data-testid="set-content-btn" @click="handleSetContent">设置内容</button>
          <button data-testid="get-content-btn" @click="handleGetContent">获取内容</button>
          <button data-testid="focus-btn" @click="handleFocus">聚焦</button>
          <button data-testid="blur-btn" @click="handleBlur">失焦</button>
          <button data-testid="clear-btn" @click="handleClearMethod">清空</button>
          <button data-testid="submit-btn" @click="handleSubmitMethod">提交</button>
        </div>
      </fieldset>

      <fieldset class="control-group">
        <legend>模板数据</legend>
        <div class="button-row">
          <button data-testid="set-template-simple-btn" @click="setTemplateSimple">简单模板</button>
          <button data-testid="set-template-empty-btn" @click="setTemplateEmpty">空模板块</button>
          <button data-testid="set-template-multiple-btn" @click="setTemplateMultiple">多模板块</button>
          <button data-testid="clear-template-btn" @click="clearTemplate">清空模板</button>
        </div>
      </fieldset>

      <p v-show="result" class="result-display" data-testid="result-display">
        {{ result }}
      </p>
      <p v-show="submitDetail" class="result-display" data-testid="submit-detail-display">
        {{ submitDetail }}
      </p>
    </div>

    <Sender
      :key="componentKey"
      ref="senderRef"
      v-model="content"
      data-testid="test-sender"
      :mode="mode"
      :size="size"
      :clearable="clearable"
      :loading="loading"
      :disabled="disabled"
      :extensions="extensions"
      :max-length="maxLength"
      :show-word-limit="showWordLimit"
      :placeholder="placeholder"
      :submit-type="submitType"
      :has-external-content="hasExternalContent"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @clear="handleClear"
    >
      <template v-if="attachmentsSourceMounted" #header>
        <TrAttachments v-model:items="senderAttachmentItems" variant="card" />
      </template>

      <template #footer>
        <button data-testid="custom-footer-btn" @click="handleCustomAction">自定义按钮</button>
      </template>
    </Sender>
  </div>
</template>

<style scoped>
.sender-demo {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.control-panel {
  display: grid;
  gap: 12px;
}

.control-group {
  margin: 0;
  padding: 8px;
}

.control-row,
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-item input,
.control-item select {
  min-width: 120px;
}

.button-row button {
  padding: 4px 8px;
}

.result-display {
  margin: 0;
  word-break: break-all;
}
</style>

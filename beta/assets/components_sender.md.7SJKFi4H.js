const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/size.Bh2XCm5h.js","assets/chunks/theme.DWoXJ9L5.js","assets/chunks/framework.CSCYUGUn.js","assets/chunks/methods-demo.BulkedFC.js","assets/chunks/input-prefix-placeholder.DDcltUk3.js","assets/chunks/custom-slots.DmK00opH.js","assets/chunks/submit-type.KGiJNbWj.js","assets/chunks/attachments-in-sender.9aTzC183.js","assets/chunks/actions-enhanced.35XToydk.js","assets/chunks/mockSpeechHandler.Dbvoj8lY.js","assets/chunks/actions-config-basic.CcVvkhyM.js","assets/chunks/voice-custom-ui.DhV-xb0d.js","assets/chunks/voice-custom.D4PrRcY9.js","assets/chunks/voice-input.DvOvK4O5.js","assets/chunks/suggestion-highlight.DMa7CMDY.js","assets/chunks/suggestion-filter.BBVY0FXO.js","assets/chunks/suggestion-basic.WuvozgrG.js","assets/chunks/mention.Dd8ZeyM8.js","assets/chunks/template-editor.sUHaDxpf.js","assets/chunks/word-limit.CrhSJZl2.js","assets/chunks/loading-state.DBDSzn75.js","assets/chunks/mode-switch.C3Y1q3cS.js","assets/chunks/basic.BxZH_Mk1.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as l,aZ as X,aL as M,v as V,H as k,bL as c,bB as p,J as e,bk as n,bJ as o,G as h,w as a,I as u,b7 as E,aU as z}from"./chunks/framework.CSCYUGUn.js";import{L as m,N as C}from"./chunks/index.Dr3IFbIi.js";const L=`<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'

const message = 'Hello TinyRobot'
<\/script>

<template>
  <div style="display: flex; gap: 24px; flex-wrap: wrap">
    <!-- 正常尺寸 -->
    <div style="flex: 1; min-width: 300px">
      <h4 style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500">
        正常尺寸（<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px">size="normal"</code>）
      </h4>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <tr-sender :default-value="message" size="normal" mode="single" placeholder="正常单行模式..." />
        <tr-sender
          :default-value="message"
          size="normal"
          mode="multiple"
          placeholder="正常多行模式..."
          :showWordLimit="true"
          :maxLength="200"
        />
      </div>
    </div>

    <!-- 紧凑尺寸 -->
    <div style="flex: 1; min-width: 300px">
      <h4 style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500">
        紧凑尺寸（<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px">size="small"</code>）
      </h4>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <tr-sender :default-value="message" size="small" mode="single" placeholder="紧凑单行模式..." />
        <tr-sender
          :default-value="message"
          size="small"
          mode="multiple"
          placeholder="紧凑多行模式..."
          :showWordLimit="true"
          :maxLength="100"
        />
      </div>
    </div>
  </div>
</template>
`,G=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const chatInputRef = ref()
const content = ref('')
const result = ref('')

const handleFocus = () => {
  chatInputRef.value?.focus()
  result.value = '已聚焦'
}

const handleBlur = () => {
  chatInputRef.value?.blur()
  result.value = '已失焦'
}

const handleSetContent = () => {
  chatInputRef.value?.setContent('这是通过方法设置的内容')
  result.value = '已设置内容'
}

const handleGetContent = () => {
  const content = chatInputRef.value?.getContent()
  result.value = \`当前内容: \${content}\`
}

const handleClear = () => {
  chatInputRef.value?.clear()
  result.value = '已清空'
}

const handleSubmit = () => {
  chatInputRef.value?.submit()
}

const onSubmit = (value: string) => {
  result.value = \`已提交: \${value}\`
}
<\/script>

<template>
  <div class="demo-container">
    <div class="controls">
      <button @click="handleFocus">聚焦</button>
      <button @click="handleBlur">失焦</button>
      <button @click="handleSetContent">设置内容</button>
      <button @click="handleGetContent">获取内容</button>
      <button @click="handleClear">清空</button>
      <button @click="handleSubmit">提交</button>
    </div>
    <tr-sender
      ref="chatInputRef"
      v-model="content"
      placeholder="通过上方按钮控制输入框..."
      mode="multiple"
      clearable
      @submit="onSubmit"
    />
    <div v-if="result" class="result">{{ result }}</div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:hover {
  border-color: #1476ff;
  color: #1476ff;
}

.result {
  margin-top: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
}
</style>
`,U=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const showInputPrefix = shallowRef(true)
const longPlaceholder =
  '这是一段用于观察多行模式换行效果的超长占位文本，输入区域宽度不足时会自动折行，同时可以切换首行前置插槽观察缩进变化。'.repeat(
    2,
  )
<\/script>

<template>
  <div class="demo-container">
    <button class="toggle-button" type="button" @click="showInputPrefix = !showInputPrefix">
      {{ showInputPrefix ? '移除首行前置插槽' : '添加首行前置插槽' }}
    </button>

    <tr-sender mode="multiple" :placeholder="longPlaceholder">
      <template v-if="showInputPrefix" #input-prefix>
        <span class="input-prefix-label">需求</span>
      </template>
    </tr-sender>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.toggle-button {
  margin-bottom: 12px;
  padding: 5px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
}

.toggle-button:hover {
  border-color: #1476ff;
  color: #1476ff;
}

.input-prefix-label {
  color: #1476ff;
  font-weight: 600;
}
</style>
`,Y=`<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { TrSender, UploadButton } from '@opentiny/tiny-robot'
import { IconSearch, IconThink, IconAi } from '@opentiny/tiny-robot-svgs'

const content = ref('')
const message = ref('')
let messageTimer: ReturnType<typeof setTimeout> | undefined

const showMessage = (value: string) => {
  if (messageTimer) clearTimeout(messageTimer)
  message.value = value
  messageTimer = setTimeout(() => {
    message.value = ''
    messageTimer = undefined
  }, 3000)
}

const handleSubmit = (value: string) => {
  showMessage(\`已提交: \${value}\`)
}

const handleDeepThink = () => {
  showMessage('启动深度思考模式...')
}

const handleSearch = () => {
  showMessage('打开网络搜索...')
}

onBeforeUnmount(() => {
  if (messageTimer) clearTimeout(messageTimer)
})
<\/script>

<template>
  <div class="demo-container">
    <tr-sender
      v-model="content"
      placeholder="输入内容，可以使用深度思考..."
      mode="multiple"
      clearable
      @submit="handleSubmit"
    >
      <template #header>
        <div style="display: flex; justify-content: center">
          <span style="font-weight: 800">Hello,Tiny Robot!</span>
        </div>
      </template>
      <template #footer>
        <button class="deep-think-btn" @click="handleDeepThink">
          <IconThink />
          深度思考
        </button>
        <button class="search-btn" @click="handleSearch">
          <IconSearch />
          网络搜索
        </button>
      </template>

      <template #prefix>
        <IconAi :style="{ fontSize: '26px' }" />
      </template>
      <template #input-prefix>
        <span class="input-prefix-label">需求</span>
      </template>
      <template #footer-right>
        <UploadButton tooltip="文件上传" tooltip-placement="top" />
      </template>
    </tr-sender>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.deep-think-btn,
.search-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 26px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.deep-think-btn:hover,
.search-btn:hover {
  background: #f5f5f5;
  border-color: #1476ff;
  color: #1476ff;
}

.input-prefix-label {
  color: #1476ff;
  font-weight: 600;
}

.message {
  margin-top: 15px;
  padding: 10px;
  background: #e7f3ff;
  border-radius: 6px;
  color: #1476ff;
}
</style>
`,H=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, type SubmitTrigger } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')
const submitType = ref<SubmitTrigger>('enter')

const handleSubmit = (value: string) => {
  submittedContent.value = value
}
<\/script>

<template>
  <div class="demo-container">
    <div class="options-panel">
      <label>提交方式：</label>
      <div class="radio-group">
        <label> <input type="radio" value="enter" v-model="submitType" /> Enter </label>
        <label> <input type="radio" value="ctrlEnter" v-model="submitType" /> Ctrl + Enter </label>
        <label> <input type="radio" value="shiftEnter" v-model="submitType" /> Shift + Enter </label>
      </div>
    </div>

    <tr-sender v-model="content" :submitType="submitType" placeholder="请输入内容..." @submit="handleSubmit" />

    <div v-if="submittedContent" class="result">
      <strong>已提交: </strong>
      <span>{{ submittedContent }}</span>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.options-panel {
  margin-bottom: 20px;
  padding: 15px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.radio-group {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.radio-group label {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.radio-group input {
  margin-right: 8px;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: #e9e9e9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result strong {
  color: #333;
}

.result span {
  color: #555;
  word-break: break-all;
}
</style>
`,N=`<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { TrAttachments, TrSender, UploadButton } from '@opentiny/tiny-robot'
import type { Attachment, SenderSubmitExtra } from '@opentiny/tiny-robot'

const content = ref('')
const message = ref('')
const attachments = ref<Attachment[]>([])
let nextAttachmentId = 0

const createAttachment = (file: File, index: number): Attachment => {
  const isImage = file.type.startsWith('image/')

  return {
    id: \`\${file.name}-\${file.lastModified}-\${nextAttachmentId++}-\${index}\`,
    name: file.name,
    rawFile: file,
    size: file.size,
    status: 'success',
    url: isImage ? URL.createObjectURL(file) : undefined,
  }
}

const revokeObjectUrl = (attachment: Attachment) => {
  if (attachment.url?.startsWith('blob:')) {
    URL.revokeObjectURL(attachment.url)
  }
}

const isAttachmentExternalPayload = (payload: unknown): payload is Attachment[] => {
  return Array.isArray(payload)
}

const clearAttachments = () => {
  attachments.value.forEach(revokeObjectUrl)
  attachments.value = []
}

const handleFiles = (files: File[]) => {
  attachments.value = [...attachments.value, ...files.map(createAttachment)]
}

const handleSubmit = (text: string, _structuredData?: unknown, extra?: SenderSubmitExtra) => {
  const attachmentNames =
    extra?.externalPayloads.reduce<string[]>((names, externalPayload) => {
      if (externalPayload.source !== 'attachments' || !isAttachmentExternalPayload(externalPayload.payload)) {
        return names
      }

      externalPayload.payload.forEach((attachment) => {
        names.push(attachment.name || attachment.rawFile?.name || '未命名文件')
      })

      return names
    }, []) ?? []

  message.value = attachmentNames.length
    ? \`已提交: \${text || '(无文本)'}，附件: \${attachmentNames.join('、')}\`
    : \`已提交: \${text}\`

  content.value = ''
  clearAttachments()
}

onBeforeUnmount(clearAttachments)
<\/script>

<template>
  <div class="demo-container">
    <tr-sender
      v-model="content"
      placeholder="输入内容，或直接上传附件后发送..."
      mode="multiple"
      clearable
      @submit="handleSubmit"
    >
      <template v-if="attachments.length" #header>
        <tr-attachments
          v-model:items="attachments"
          class="sender-attachments"
          variant="card"
          wrap
          @remove="revokeObjectUrl"
        />
      </template>

      <template #footer-right>
        <UploadButton accept="*" :multiple="true" tooltip="上传附件" tooltip-placement="top" @select="handleFiles" />
      </template>
    </tr-sender>

    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.demo-container {
  display: grid;
  gap: 12px;
  padding: 20px;
}

.sender-attachments {
  width: 100%;
}

.message {
  padding: 10px;
  border-radius: 6px;
  background: #e7f3ff;
  color: #1476ff;
}
</style>
`,Q=`<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { TrSender, UploadButton, VoiceButton } from '@opentiny/tiny-robot'
import { MockSpeechHandler } from './mockSpeechHandler'

const content = ref('')
const message = ref('')
const speechConfig = { customHandler: new MockSpeechHandler() }
let messageTimer: ReturnType<typeof setTimeout> | undefined

const showMessage = (value: string) => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }

  message.value = value
  messageTimer = setTimeout(() => {
    message.value = ''
    messageTimer = undefined
  }, 3000)
}

const handleSubmit = (text: string) => {
  showMessage(\`已提交: \${text}\`)
  content.value = ''
}

const handleFiles = (files: File[]) => {
  showMessage(\`已选择 \${files.length} 个文件\`)
}

const handleVoiceFinal = (text: string) => {
  content.value += text + ' '
}

onBeforeUnmount(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
})
<\/script>

<template>
  <div class="demo-container">
    <tr-sender
      v-model="content"
      placeholder="输入内容，或使用语音/上传文件..."
      mode="multiple"
      clearable
      @submit="handleSubmit"
    >
      <template #footer-right>
        <!-- 上传按钮 -->
        <UploadButton
          accept="image/*"
          :multiple="true"
          tooltip="上传图片"
          tooltip-placement="top"
          @select="handleFiles"
        />

        <!-- 语音按钮 -->
        <VoiceButton
          :speech-config="speechConfig"
          :auto-insert="false"
          tooltip="模拟语音输入"
          tooltip-placement="top"
          @speech-final="handleVoiceFinal"
        />
      </template>
    </tr-sender>

    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.message {
  margin-top: 15px;
  padding: 10px;
  background: #e7f3ff;
  border-radius: 6px;
  color: #1476ff;
}
</style>
`,j=`<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')

// 表单验证：至少 5 个字符
const isValid = computed(() => content.value.length >= 5)

// 按钮配置
const defaultActions = computed(() => ({
  submit: {
    disabled: !isValid.value,
    tooltip: isValid.value ? '发送消息' : '请输入至少 5 个字符',
  },
  clear: {
    tooltip: '清空内容',
  },
}))

const handleSubmit = (text: string) => {
  submittedContent.value = text
  content.value = ''
}
<\/script>

<template>
  <div class="demo-container">
    <p class="tip">输入至少 5 个字符后，提交按钮才会启用（{{ content.length }}/5）</p>

    <tr-sender
      v-model="content"
      :default-actions="defaultActions"
      placeholder="请输入至少 5 个字符..."
      clearable
      @submit="handleSubmit"
    />
    <p v-if="submittedContent" class="result" aria-live="polite">已提交：{{ submittedContent }}</p>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.tip {
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.result {
  margin: 12px 0 0;
  color: #606266;
}
</style>
`,O=`<script setup lang="ts">
import { ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { TrSender, VoiceButton } from '@opentiny/tiny-robot'
import PressToTalkOverlay from './PressToTalkOverlay.vue'

const TrSenderRef = ref<InstanceType<typeof TrSender>>()
const voiceButtonRef = ref<InstanceType<typeof VoiceButton>>()
const inputText = ref('')
const showMobileVoiceUI = ref(false)
const isMobile = ref(false)
const isCanceling = ref(false)
const startY = ref(0)
const cancelThreshold = 30

// 按下开始录音
const handleTouchStart = (e: TouchEvent | MouseEvent) => {
  const clientY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  startY.value = clientY
  showMobileVoiceUI.value = true
  isCanceling.value = false
  voiceButtonRef.value?.start()
}

// 移动检测是否取消
const handleTouchMove = (e: TouchEvent | MouseEvent) => {
  if (!showMobileVoiceUI.value) return

  const currentY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  const slideDistance = startY.value - currentY
  isCanceling.value = slideDistance > cancelThreshold
}

// 松开结束录音
const handleTouchEnd = () => {
  if (!showMobileVoiceUI.value) return

  if (isCanceling.value) {
    // 取消录音（清空识别内容）
    inputText.value = ''
  } else {
    // 正常结束，如果有识别内容则提交
    if (inputText.value.trim()) {
      TrSenderRef.value?.submit()
    }
  }

  voiceButtonRef.value?.stop()
  showMobileVoiceUI.value = false
  isCanceling.value = false
}
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <!-- 语音录制 UI -->
    <div>
      <h4>{{ isMobile ? '移动端' : 'PC 端' }} 语音录制</h4>
      <div
        class="chat-input-container"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="handleTouchEnd"
        @mousemove.prevent="handleTouchMove"
        @mouseup.prevent="handleTouchEnd"
      >
        <tr-sender v-show="!showMobileVoiceUI" ref="TrSenderRef" v-model="inputText" mode="single" class="chat-input">
          <!-- PC 端：使用 VoiceButton -->
          <template v-if="!isMobile" #actions-inline>
            <VoiceButton ref="voiceButtonRef" />
          </template>

          <!-- 移动端：使用自定义"按住说话"区域替换编辑器 -->
          <template v-else #content>
            <div
              class="press-to-talk-area"
              @touchstart.prevent="handleTouchStart"
              @mousedown.prevent="handleTouchStart"
            >
              按住说话
            </div>
          </template>
        </tr-sender>

        <!-- 录音浮层：显示录音动画和提示 -->
        <PressToTalkOverlay
          v-model:visible="showMobileVoiceUI"
          :isCanceling="isCanceling"
          :cancelThreshold="cancelThreshold"
        />
      </div>
    </div>
    <div>
      <span style="margin-right: 20px">是否是移动端</span>
      <tiny-switch v-model="isMobile"></tiny-switch>
    </div>
  </div>
</template>

<style scoped>
.chat-input-container {
  position: relative;
  min-height: 180px;
}

.chat-input {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 移动端"按住说话"区域 - 替换整个编辑器内容区域 */
.press-to-talk-area {
  width: 100%;
  min-height: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  transition: all 0.2s;
}
</style>
`,J=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, VoiceButton } from '@opentiny/tiny-robot'
import { MockSpeechHandler } from './speechHandlers'

// 组件状态
const inputText = ref('')
const speechStatus = ref('')
const interimResult = ref('')
const submittedContent = ref('')

// 语音配置 - 使用模拟处理器
const speechConfig = {
  customHandler: new MockSpeechHandler(),
  interimResults: true,
}

// 事件处理
const handleSpeechStart = () => {
  speechStatus.value = '🎤 正在录音...'
  interimResult.value = ''
}

const handleSpeechInterim = (transcript: string) => {
  interimResult.value = transcript
}

const handleSpeechFinal = () => {
  speechStatus.value = '✅ 识别完成'
  interimResult.value = ''
}

const handleSpeechEnd = () => {
  speechStatus.value = ''
  interimResult.value = ''
}

const handleSpeechError = (error: Error) => {
  speechStatus.value = \`❌ \${error.message}\`
  interimResult.value = ''
}

const handleSubmit = (text: string) => {
  submittedContent.value = text
}
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <!-- 状态显示 -->
    <div
      v-if="speechStatus"
      style="padding: 12px; background: #e8f4fd; border-radius: 6px; border-left: 4px solid #1890ff"
    >
      <div style="font-weight: 500; color: #1890ff">{{ speechStatus }}</div>
      <div v-if="interimResult" style="margin-top: 8px; color: #666; font-style: italic">
        实时识别: {{ interimResult }}
      </div>
    </div>

    <!-- 输入组件 -->
    <div>
      <h4 style="margin: 24px 0">模拟语音识别演示</h4>
      <tr-sender v-model="inputText" mode="single" placeholder="点击麦克风按钮开始语音输入..." @submit="handleSubmit">
        <template #actions-inline>
          <VoiceButton
            :speech-config="speechConfig"
            @speech-start="handleSpeechStart"
            @speech-interim="handleSpeechInterim"
            @speech-final="handleSpeechFinal"
            @speech-end="handleSpeechEnd"
            @speech-error="handleSpeechError"
          />
        </template>
      </tr-sender>
    </div>

    <p v-if="submittedContent" style="margin: 0; color: #666" aria-live="polite">已提交：{{ submittedContent }}</p>

    <!-- 使用说明 -->
    <div style="padding: 16px; background: #fffbe6; border-radius: 8px; border-left: 4px solid #faad14">
      <h4 style="margin: 0 0 8px 0; color: #fa8c16">使用说明</h4>
      <ul style="margin: 0; padding-left: 20px; color: #666">
        <li>此示例使用模拟语音识别，无需真实 API 配置</li>
        <li>点击麦克风按钮后会模拟语音识别过程，展示中间结果和最终结果</li>
        <li>如需接入真实的语音识别服务（阿里云等），请参考 <code>speechHandlers.ts</code> 中的实现示例</li>
        <li>支持自定义语音处理器，实现任意第三方语音识别服务的集成</li>
      </ul>
    </div>
  </div>
</template>
`,$=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, VoiceButton } from '@opentiny/tiny-robot'
import { MockSpeechHandler } from './mockSpeechHandler'

const inputMode = ref<'auto' | 'manual'>('auto')
const recognizedText = ref('尚未识别')
const speechConfig = { customHandler: new MockSpeechHandler() }

const handleSpeechFinal = (transcript: string) => {
  recognizedText.value = transcript
}
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">模式：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="auto" v-model="inputMode" style="cursor: pointer" />
        <span>自动写入</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="manual" v-model="inputMode" style="cursor: pointer" />
        <span>仅接收事件</span>
      </label>
    </div>
    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      {{ inputMode === 'auto' ? '最终识别结果会插入编辑器' : '关闭 auto-insert 后，应用只通过事件接收结果' }}
    </div>
    <tr-sender mode="multiple" placeholder="点击麦克风，等待本地 Mock 返回识别结果...">
      <template #footer-right>
        <VoiceButton
          :speech-config="speechConfig"
          :auto-insert="inputMode === 'auto'"
          @speech-final="handleSpeechFinal"
        />
      </template>
    </tr-sender>
    <p style="margin: 0; color: #666" aria-live="polite">最近一次识别结果：{{ recognizedText }}</p>
  </div>
</template>
`,K=`<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { SenderSuggestionItem, SuggestionTextPart } from '@opentiny/tiny-robot'

const input = ref('')
const highlightMode = ref<'auto' | 'precise' | 'custom'>('auto')
const selectedItem = ref('')

// 模式说明
const modeDescription = computed(() => {
  switch (highlightMode.value) {
    case 'auto':
      return '自动高亮与输入内容匹配的部分'
    case 'precise':
      return '通过 highlights 数组精确指定需要高亮的文本片段'
    case 'custom':
      return '通过 highlights 函数完全控制高亮逻辑，实现复杂的高亮规则'
    default:
      return ''
  }
})

// 自动匹配模式的建议项
const autoSuggestions: SenderSuggestionItem[] = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'CDN-权限管理配置' },
  { content: 'CDN-缓存刷新问题' },
]

// 精确指定模式的建议项
const preciseSuggestions: SenderSuggestionItem[] = [
  {
    content: 'ECS-云服务器卡顿问题',
    highlights: ['ECS', '云服务器'],
  },
  {
    content: 'ECS-备份弹性云服务器',
    highlights: ['ECS', '弹性云服务器'],
  },
  {
    content: 'CDN-权限管理配置',
    highlights: ['CDN', '权限管理'],
  },
  {
    content: 'CDN-缓存刷新问题',
    highlights: ['CDN', '缓存刷新'],
  },
]

// 自定义函数模式的建议项
const customSuggestions: SenderSuggestionItem[] = [
  {
    content: 'ECS-云服务器卡顿问题',
    highlights: (text: string, _query: string): SuggestionTextPart[] => {
      // 高亮产品名称（ECS）
      const parts = text.split('-')
      return [
        { text: parts[0], isMatch: true },
        { text: '-', isMatch: false },
        { text: parts[1], isMatch: false },
      ]
    },
  },
  {
    content: 'ECS-备份弹性云服务器',
    highlights: (text: string, _query: string): SuggestionTextPart[] => {
      const parts = text.split('-')
      return [
        { text: parts[0], isMatch: true },
        { text: '-', isMatch: false },
        { text: parts[1], isMatch: false },
      ]
    },
  },
  {
    content: 'CDN-权限管理配置',
    highlights: (text: string, _query: string): SuggestionTextPart[] => {
      // 高亮产品名称（CDN）
      const parts = text.split('-')
      return [
        { text: parts[0], isMatch: true },
        { text: '-', isMatch: false },
        { text: parts[1], isMatch: false },
      ]
    },
  },
  {
    content: 'CDN-缓存刷新问题',
    highlights: (text: string, _query: string): SuggestionTextPart[] => {
      const parts = text.split('-')
      return [
        { text: parts[0], isMatch: true },
        { text: '-', isMatch: false },
        { text: parts[1], isMatch: false },
      ]
    },
  },
]

// 当前使用的建议项
const currentSuggestions = computed(() => {
  switch (highlightMode.value) {
    case 'auto':
      return autoSuggestions
    case 'precise':
      return preciseSuggestions
    case 'custom':
      return customSuggestions
    default:
      return autoSuggestions
  }
})

// 配置 Suggestion 扩展
// 高亮模式说明：
// - 区别在于 item.highlights 的配置：
//   * 自动匹配：不设置 highlights，根据用户输入自动高亮
//   * 精确指定：highlights 为数组，指定要高亮的文本片段
//   * 自定义函数：highlights 为函数，完全控制高亮逻辑
const extensions = [
  TrSender.Suggestion.configure({
    items: currentSuggestions,
    onSelect: (item) => {
      selectedItem.value = item.content
    },
  }),
]
<\/script>

<template>
  <div class="demo-highlight">
    <div class="mode-selector">
      <label>
        <input type="radio" v-model="highlightMode" value="auto" />
        自动匹配
      </label>
      <label>
        <input type="radio" v-model="highlightMode" value="precise" />
        精确指定
      </label>
      <label>
        <input type="radio" v-model="highlightMode" value="custom" />
        自定义函数
      </label>
    </div>

    <p class="mode-description">{{ modeDescription }}</p>

    <tr-sender v-model="input" :extensions="extensions" placeholder="输入 ECS 或 CDN 查看不同高亮效果..." />
    <div v-if="selectedItem" class="demo-result"><strong>选中的建议：</strong> {{ selectedItem }}</div>
  </div>
</template>

<style scoped>
.demo-highlight {
  padding: 20px;
}

.mode-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.mode-selector label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.mode-selector input[type='radio'] {
  cursor: pointer;
}

.mode-description {
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
  color: #666;
  font-size: 14px;
  border-radius: 2px;
}

.demo-result {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}
</style>
`,tt=`<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { SenderSuggestionItem } from '@opentiny/tiny-robot'

const input = ref('')
const selectedItem = ref('')
const submittedContent = ref('')
const filterMode = ref<'default' | 'prefix' | 'category'>('default')

// 模式说明
const modeDescription = computed(() => {
  switch (filterMode.value) {
    case 'default':
      return '包含匹配：建议中包含输入内容即可'
    case 'prefix':
      return '前缀匹配：只匹配以输入内容开头的建议'
    case 'category':
      return '分类匹配：只匹配分类标签（ECS、CDN、OSS）'
    default:
      return ''
  }
})

// 建议列表
const suggestions: SenderSuggestionItem[] = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'ECS-实例无法启动' },
  { content: 'CDN-权限管理配置' },
  { content: 'CDN-缓存刷新问题' },
  { content: 'OSS-存储桶访问控制' },
]

// 配置 Suggestion 扩展，使用自定义过滤函数
const extensions = computed(() => [
  TrSender.Suggestion.configure({
    items: suggestions,
    // 自定义过滤逻辑
    filterFn: (items: SenderSuggestionItem[], query: string) => {
      if (!query) return items

      const lowerQuery = query.toLowerCase()

      switch (filterMode.value) {
        case 'prefix':
          // 前缀匹配
          return items.filter((item) => item.content.toLowerCase().startsWith(lowerQuery))

        case 'category':
          // 分类匹配（只匹配 - 前面的部分）
          return items.filter((item) => {
            const category = item.content.split('-')[0].toLowerCase()
            return category.includes(lowerQuery)
          })

        default:
          // 默认模糊匹配
          return items.filter((item) => item.content.toLowerCase().includes(lowerQuery))
      }
    },
    onSelect: (item) => {
      selectedItem.value = item.content
    },
  }),
])

const handleSubmit = (text: string) => {
  submittedContent.value = text
}
<\/script>

<template>
  <div class="demo-filter">
    <div class="filter-selector">
      <label>
        <input type="radio" v-model="filterMode" value="default" />
        包含匹配
      </label>
      <label>
        <input type="radio" v-model="filterMode" value="prefix" />
        前缀匹配
      </label>
      <label>
        <input type="radio" v-model="filterMode" value="category" />
        分类匹配
      </label>
    </div>

    <p class="mode-description">{{ modeDescription }}</p>

    <tr-sender
      v-model="input"
      :extensions="extensions"
      placeholder="输入 ECS 或 CDN 查看建议..."
      @submit="handleSubmit"
    />

    <div v-if="selectedItem" class="demo-result"><strong>选中的建议：</strong> {{ selectedItem }}</div>
    <div v-if="submittedContent" class="demo-result"><strong>提交内容：</strong> {{ submittedContent }}</div>
  </div>
</template>

<style scoped>
.demo-filter {
  padding: 20px;
}

.filter-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.filter-selector label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.filter-selector input[type='radio'] {
  cursor: pointer;
}

.mode-description {
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
  color: #666;
  font-size: 14px;
  border-radius: 2px;
}

.demo-result {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}
</style>
`,et=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { SenderSuggestionItem } from '@opentiny/tiny-robot'

const input = ref('')
const selectedItem = ref('')
const submittedContent = ref('')

// 建议列表
const suggestions: SenderSuggestionItem[] = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'ECS-实例无法启动' },
  { content: 'CDN-权限管理配置' },
  { content: 'CDN-缓存刷新问题' },
  { content: 'OSS-存储桶访问控制' },
]

// 配置 Suggestion 扩展
const extensions = [
  TrSender.suggestion(suggestions, {
    onSelect: (item) => {
      selectedItem.value = item.content
    },
  }),
]

const handleSubmit = (text: string) => {
  submittedContent.value = text
}
<\/script>

<template>
  <div class="demo-suggestion">
    <p class="demo-description">输入任意内容查看建议，支持键盘导航和自动补全</p>
    <tr-sender
      v-model="input"
      :extensions="extensions"
      placeholder="输入 ECS 或 CDN 查看建议..."
      @submit="handleSubmit"
    />

    <div v-if="selectedItem" class="demo-result"><strong>选中的建议：</strong> {{ selectedItem }}</div>
    <div v-if="submittedContent" class="demo-result"><strong>提交内容：</strong> {{ submittedContent }}</div>
  </div>
</template>

<style scoped>
.demo-suggestion {
  padding: 20px;
}

.demo-description {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.demo-result {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}
</style>
`,nt=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { MentionItem, StructuredData } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')
const submittedData = ref<StructuredData>()

const items: MentionItem[] = [
  {
    label: '小小画家',
    value: '你是一个专业的绘画助手，擅长帮助用户进行艺术创作和绘画指导。',
  },
  {
    label: '代码助手',
    value: '你是一个专业的编程助手，精通多种编程语言，能够帮助用户解决编程问题。',
  },
  {
    label: '文案大师',
    value: '你是一个专业的文案撰写专家，擅长创作各类营销文案和创意内容。',
  },
  {
    label: '数据分析师',
    value: '你是一个专业的数据分析师，擅长数据处理、统计分析和可视化。',
  },
  {
    label: '翻译专家',
    value: '你是一个专业的翻译专家，精通多国语言，能够提供准确流畅的翻译服务。',
  },
]

const extensions = [TrSender.mention(items)]

const handleSubmit = (text: string, data?: StructuredData) => {
  submittedContent.value = text
  submittedData.value = data
}
<\/script>

<template>
  <div class="mention-demo">
    <div class="demo-tip">
      <p>💡 输入 <code>@</code> 触发提及选择，支持键盘导航（↑↓）和 Enter/Tab 选择</p>
    </div>

    <tr-sender
      v-model="content"
      :extensions="extensions"
      placeholder="输入 @ 选择助手..."
      mode="multiple"
      :max-length="500"
      show-word-limit
      clearable
      @submit="handleSubmit"
    />

    <div v-if="submittedContent" class="result">
      <div class="result-title">提交的内容（纯文本）：</div>
      <div class="result-content">{{ submittedContent }}</div>
      <div class="result-title">结构化数据：</div>
      <pre class="result-content">{{ JSON.stringify(submittedData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.mention-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-tip {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f0f7ff;
  border-left: 4px solid #1476ff;
  border-radius: 4px;
}

.demo-tip p {
  margin: 0;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

.demo-tip code {
  padding: 2px 6px;
  background: rgba(20, 118, 255, 0.1);
  color: #1476ff;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.result {
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.result-content {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
`,dt=`<script setup lang="ts">
import { ref } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { StructuredData, TemplateItem } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')
const submittedData = ref<StructuredData>()

const templateData = ref<TemplateItem[]>([])

// 通过 items 传入响应式数据
const extensions = [TrSender.template(templateData)]

const setTemplate1 = () => {
  templateData.value = [
    { type: 'text', content: '你好，我是' },
    { type: 'block', content: '张三' },
    { type: 'text', content: '，来自' },
    { type: 'block', content: '北京' },
    { type: 'text', content: '，很高兴认识你！' },
  ]
}

const setTemplate2 = () => {
  templateData.value = [
    { type: 'text', content: '请帮我写一份关于' },
    { type: 'block', content: '人工智能' },
    { type: 'text', content: '的' },
    { type: 'block', content: '技术报告' },
    { type: 'text', content: '，字数要求' },
    { type: 'block', content: '3000字' },
    { type: 'text', content: '。' },
  ]
}

const setTemplate3 = () => {
  templateData.value = [
    { type: 'text', content: 'Write an essay about ' },
    {
      type: 'select',
      placeholder: 'Select a topic',
      options: [
        { label: 'Campus Life', value: 'campus life' },
        { label: 'Travel Experience', value: 'travel experience' },
        { label: 'Reading Habits', value: 'reading habits' },
        { label: 'Technology', value: 'technology' },
      ],
      content: '',
    },
    { type: 'text', content: '. The requirement is ' },
    { type: 'block', content: '800' },
    { type: 'text', content: ' words.' },
  ]
}

const setTemplate4 = () => {
  templateData.value = [{ type: 'text', content: '这是一个晴朗的好天气。' }]
}

const handleSubmit = (text: string, data?: StructuredData) => {
  submittedContent.value = text
  submittedData.value = data
}
<\/script>

<template>
  <div class="template-demo">
    <div class="template-buttons">
      <tiny-button size="small" @click="setTemplate1"> 模板1：自我介绍 </tiny-button>
      <tiny-button size="small" @click="setTemplate2"> 模板2：写报告 </tiny-button>
      <tiny-button size="small" @click="setTemplate3"> 模板3：英文作文（带选择器） </tiny-button>
      <tiny-button size="small" @click="setTemplate4"> 模板4：文字模板 </tiny-button>
    </div>

    <tr-sender
      mode="multiple"
      v-model="content"
      :extensions="extensions"
      placeholder="点击上方按钮插入模板，或直接输入..."
      :max-length="500"
      show-word-limit
      clearable
      @submit="handleSubmit"
    />

    <div v-if="submittedContent" class="result" aria-live="polite">
      <div class="result-title">提交的内容（纯文本）：</div>
      <div class="result-content">{{ submittedContent }}</div>
      <div class="result-title">结构化数据：</div>
      <pre class="result-content">{{ JSON.stringify(submittedData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.template-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.result {
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.result-content {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
`,st=`<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>

<template>
  <div class="demo-container">
    <tr-sender
      default-value="测试超出字数限制，当前已经超过了字数限制。"
      placeholder="最多输入 20 个字符..."
      :max-length="20"
      show-word-limit
      mode="multiple"
    />
  </div>
</template>
`,ot=`<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { Switch as TinySwitch } from '@opentiny/vue'

const content = ref('')
const loading = ref(false)
const isDisabled = ref(false)
const status = ref('等待提交')
let loadingTimer: ReturnType<typeof setTimeout> | undefined

const clearLoadingTimer = () => {
  if (loadingTimer) clearTimeout(loadingTimer)
  loadingTimer = undefined
}

const handleSubmit = (value: string) => {
  clearLoadingTimer()
  loading.value = true
  status.value = \`正在处理：\${value}\`

  // 模拟 3 秒后完成
  loadingTimer = setTimeout(() => {
    loading.value = false
    content.value = ''
    status.value = \`处理完成：\${value}\`
    loadingTimer = undefined
  }, 3000)
}

const handleCancel = () => {
  clearLoadingTimer()
  loading.value = false
  status.value = '已取消处理'
}

onBeforeUnmount(clearLoadingTimer)
<\/script>

<template>
  <div class="demo-container">
    <div class="controls">
      <div class="control-item">
        <label>Loading:</label>
        <tiny-switch v-model="loading"></tiny-switch>
      </div>
      <div class="control-item">
        <label>Disabled:</label>
        <tiny-switch v-model="isDisabled"></tiny-switch>
      </div>
    </div>
    <tr-sender
      v-model="content"
      placeholder="输入内容后提交，模拟加载状态..."
      :loading="loading"
      :disabled="isDisabled"
      stop-text="停止生成"
      clearable
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
    <p class="loading-tip" :class="{ loading }" aria-live="polite">{{ status }}</p>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-tip {
  margin-top: 10px;
  color: #1476ff;
  font-size: 14px;
}

.loading-tip.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
`,at=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const content = ref('')
const mode = ref<'single' | 'multiple'>('single')
const submittedContent = ref('')

const handleSubmit = (value: string) => {
  submittedContent.value = value
  content.value = ''
}
<\/script>

<template>
  <div class="demo-container">
    <div class="mode-selector">
      <button :class="['mode-btn', { active: mode === 'single' }]" @click="mode = 'single'">单行模式</button>
      <button :class="['mode-btn', { active: mode === 'multiple' }]" @click="mode = 'multiple'">多行模式</button>
    </div>
    <tr-sender
      v-model="content"
      :mode="mode"
      placeholder="尝试切换模式..."
      clearable
      show-word-limit
      :max-length="200"
      @submit="handleSubmit"
    />
    <p v-if="submittedContent" class="result" aria-live="polite">已提交：{{ submittedContent }}</p>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.mode-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.mode-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: #1476ff;
  color: #1476ff;
}

.mode-btn.active {
  background: #1476ff;
  border-color: #1476ff;
  color: white;
}

.result {
  margin: 12px 0 0;
  color: #606266;
}
</style>
`,it=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')

const handleSubmit = (value: string) => {
  submittedContent.value = value
  content.value = ''
}
<\/script>

<template>
  <div class="demo-container">
    <tr-sender v-model="content" placeholder="输入消息后按 Enter 发送" @submit="handleSubmit" />
    <p v-if="submittedContent" class="result" aria-live="polite">已提交：{{ submittedContent }}</p>
  </div>
</template>

<style scoped>
.demo-container {
  display: grid;
  gap: 12px;
  padding: 20px;
}

.result {
  margin: 0;
  color: #606266;
}
</style>
`,ht=JSON.parse('{"title":"Sender 消息输入框","description":"","frontmatter":{"outline":[1,4]},"headers":[],"relativePath":"components/sender.md","filePath":"components/sender.md"}'),rt={name:"components/sender.md"},ut=Object.assign(rt,{setup(lt){const g=E();r(async()=>{g.value=(await l(async()=>{const{default:s}=await import("./chunks/size.Bh2XCm5h.js");return{default:s}},__vite__mapDeps([0,1,2]))).default});const b=E();r(async()=>{b.value=(await l(async()=>{const{default:s}=await import("./chunks/methods-demo.BulkedFC.js");return{default:s}},__vite__mapDeps([3,1,2]))).default});const y=E();r(async()=>{y.value=(await l(async()=>{const{default:s}=await import("./chunks/input-prefix-placeholder.DDcltUk3.js");return{default:s}},__vite__mapDeps([4,1,2]))).default});const A=E();r(async()=>{A.value=(await l(async()=>{const{default:s}=await import("./chunks/custom-slots.DmK00opH.js");return{default:s}},__vite__mapDeps([5,1,2]))).default});const f=E();r(async()=>{f.value=(await l(async()=>{const{default:s}=await import("./chunks/submit-type.KGiJNbWj.js");return{default:s}},__vite__mapDeps([6,2,1]))).default});const v=E();r(async()=>{v.value=(await l(async()=>{const{default:s}=await import("./chunks/attachments-in-sender.9aTzC183.js");return{default:s}},__vite__mapDeps([7,1,2]))).default});const B=E();r(async()=>{B.value=(await l(async()=>{const{default:s}=await import("./chunks/actions-enhanced.35XToydk.js");return{default:s}},__vite__mapDeps([8,1,2,9]))).default});const D=E();r(async()=>{D.value=(await l(async()=>{const{default:s}=await import("./chunks/actions-config-basic.CcVvkhyM.js");return{default:s}},__vite__mapDeps([10,1,2]))).default});const F=E();r(async()=>{F.value=(await l(async()=>{const{default:s}=await import("./chunks/voice-custom-ui.DhV-xb0d.js");return{default:s}},__vite__mapDeps([11,2,1]))).default});const x=E();r(async()=>{x.value=(await l(async()=>{const{default:s}=await import("./chunks/voice-custom.D4PrRcY9.js");return{default:s}},__vite__mapDeps([12,1,2]))).default});const S=E();r(async()=>{S.value=(await l(async()=>{const{default:s}=await import("./chunks/voice-input.DvOvK4O5.js");return{default:s}},__vite__mapDeps([13,2,1,9]))).default});const T=E();r(async()=>{T.value=(await l(async()=>{const{default:s}=await import("./chunks/suggestion-highlight.DMa7CMDY.js");return{default:s}},__vite__mapDeps([14,2,1]))).default});const w=E();r(async()=>{w.value=(await l(async()=>{const{default:s}=await import("./chunks/suggestion-filter.BBVY0FXO.js");return{default:s}},__vite__mapDeps([15,2,1]))).default});const _=E();r(async()=>{_.value=(await l(async()=>{const{default:s}=await import("./chunks/suggestion-basic.WuvozgrG.js");return{default:s}},__vite__mapDeps([16,1,2]))).default});const Z=E();r(async()=>{Z.value=(await l(async()=>{const{default:s}=await import("./chunks/mention.Dd8ZeyM8.js");return{default:s}},__vite__mapDeps([17,1,2]))).default});const W=E();r(async()=>{W.value=(await l(async()=>{const{default:s}=await import("./chunks/template-editor.sUHaDxpf.js");return{default:s}},__vite__mapDeps([18,1,2]))).default});const I=E();r(async()=>{I.value=(await l(async()=>{const{default:s}=await import("./chunks/word-limit.CrhSJZl2.js");return{default:s}},__vite__mapDeps([19,1,2]))).default});const P=E();r(async()=>{P.value=(await l(async()=>{const{default:s}=await import("./chunks/loading-state.DBDSzn75.js");return{default:s}},__vite__mapDeps([20,1,2]))).default});const R=E();r(async()=>{R.value=(await l(async()=>{const{default:s}=await import("./chunks/mode-switch.C3Y1q3cS.js");return{default:s}},__vite__mapDeps([21,1,2]))).default});const d=z(!0),q=E();return r(async()=>{q.value=(await l(async()=>{const{default:s}=await import("./chunks/basic.BxZH_Mk1.js");return{default:s}},__vite__mapDeps([22,1,2]))).default}),(s,t)=>{const i=X("ClientOnly");return M(),V("div",null,[t[20]||(t[20]=k('<h1 id="sender-消息输入框" tabindex="-1">Sender 消息输入框 <a class="header-anchor" href="#sender-消息输入框" aria-label="Permalink to &quot;Sender 消息输入框&quot;">​</a></h1><h2 id="概览" tabindex="-1">概览 <a class="header-anchor" href="#概览" aria-label="Permalink to &quot;概览&quot;">​</a></h2><p>Sender 是面向聊天场景的可组合输入组件，负责文本编辑、提交和取消交互，并可通过扩展、插槽和独立操作按钮接入联想、提及、模板、语音与附件能力。</p><h3 id="适用场景" tabindex="-1">适用场景 <a class="header-anchor" href="#适用场景" aria-label="Permalink to &quot;适用场景&quot;">​</a></h3><ul><li>聊天或 AI 应用需要可控的文本输入与提交入口</li><li>输入区需要组合模板、提及、联想、语音或附件能力</li><li>应用需要接收结构化输入或额外提交内容，并自行管理发送流程</li></ul><p>Sender 不负责消息列表、文件上传请求或 AI 响应状态本身。应用需要处理 <code>submit</code>、<code>cancel</code> 等事件，并把外部状态通过 Props 同步回来。</p><h2 id="用法示例" tabindex="-1">用法示例 <a class="header-anchor" href="#用法示例" aria-label="Permalink to &quot;用法示例&quot;">​</a></h2><p>绑定输入内容并监听 <code>submit</code>。示例会在页面中展示已提交文本，并由父组件清空受控值。</p>',8)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"基础消息提交",description:"绑定输入内容，提交后在页面中显示结果并清空输入框。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{d.value=!1}),vueCode:n(it)},h({_:2},[q.value?{name:"vue",fn:o(()=>[e(n(q))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[21]||(t[21]=k('<h3 id="输入与状态" tabindex="-1">输入与状态 <a class="header-anchor" href="#输入与状态" aria-label="Permalink to &quot;输入与状态&quot;">​</a></h3><h4 id="输入模式" tabindex="-1">输入模式 <a class="header-anchor" href="#输入模式" aria-label="Permalink to &quot;输入模式&quot;">​</a></h4><p>Sender 支持单行和多行两种输入模式，通过 <code>mode</code> 属性控制。</p><div class="tip custom-block"><p class="custom-block-title">单行模式自动切换</p><p>在单行模式下，当输入内容超出宽度时，会自动切换为多行模式。</p><p>当 <code>submitType=&quot;enter&quot;</code> 时，按 <code>Ctrl+Enter</code> 或 <code>Shift+Enter</code> 也会自动切换为多行模式并换行。</p></div>',4)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"输入模式",description:"支持单行和多行模式，单行模式可自动切换为多行。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{d.value=!1}),vueCode:n(at)},h({_:2},[R.value?{name:"vue",fn:o(()=>[e(n(R))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[22]||(t[22]=a("h4",{id:"加载、禁用与取消",tabindex:"-1"},[u("加载、禁用与取消 "),a("a",{class:"header-anchor",href:"#加载、禁用与取消","aria-label":'Permalink to "加载、禁用与取消"'},"​")],-1)),t[23]||(t[23]=a("p",null,[u("通过 "),a("code",null,"loading"),u(" 和 "),a("code",null,"disabled"),u(" 属性控制组件状态。加载状态下可点击停止按钮触发 "),a("code",null,"cancel"),u(" 事件；应用需要终止外部任务，并把新的 "),a("code",null,"loading"),u(" 状态同步回组件。")],-1)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"加载、禁用与取消",description:"展示加载与禁用状态，并模拟提交完成和取消处理。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{d.value=!1}),vueCode:n(ot)},h({_:2},[P.value?{name:"vue",fn:o(()=>[e(n(P))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[24]||(t[24]=a("h4",{id:"字数限制",tabindex:"-1"},[u("字数限制 "),a("a",{class:"header-anchor",href:"#字数限制","aria-label":'Permalink to "字数限制"'},"​")],-1)),t[25]||(t[25]=a("p",null,[u("通过 "),a("code",null,"maxLength"),u(" 和 "),a("code",null,"showWordLimit"),u(" 属性实现字数限制和统计。")],-1)),t[26]||(t[26]=a("div",{class:"warning custom-block"},[a("p",{class:"custom-block-title"},"超出限制行为"),a("p",null,"超出字数限制时，不会自动截断内容，但会以红色标示真实字数，且无法提交。")],-1)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"字数限制",description:"限制输入字符数并显示字数统计。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{d.value=!1}),vueCode:n(st)},h({_:2},[I.value?{name:"vue",fn:o(()=>[e(n(I))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[27]||(t[27]=k(`<h3 id="扩展输入能力" tabindex="-1">扩展输入能力 <a class="header-anchor" href="#扩展输入能力" aria-label="Permalink to &quot;扩展输入能力&quot;">​</a></h3><p>Sender 采用可插拔的扩展架构，通过 <code>extensions</code> prop 灵活添加功能。所有扩展都支持响应式数据自动同步。</p><h4 id="扩展配置" tabindex="-1">扩展配置 <a class="header-anchor" href="#扩展配置" aria-label="Permalink to &quot;扩展配置&quot;">​</a></h4><p>提供两种集成方式：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { TrSender } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 便捷函数（推荐）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mentions, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;@&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(suggestions) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 不过滤</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(suggestions, { filterFn: customFilter }) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自定义过滤</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(templates)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(templates, { appendTo: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.chat-window&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 标准配置（用于复杂场景）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.Mention.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ items: mentions, char: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;@&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, allowSpaces: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.Suggestion.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ items: suggestions, filterFn: customFilter })</span></span></code></pre></div><h4 id="模板编辑" tabindex="-1">模板编辑 <a class="header-anchor" href="#模板编辑" aria-label="Permalink to &quot;模板编辑&quot;">​</a></h4><p>使用 <code>Template</code> 扩展实现模板填充功能，支持动态设置模板内容，光标自动聚焦到第一个可编辑字段。</p><div class="tip custom-block"><p class="custom-block-title">响应式数据</p><p>通过 <code>items</code> 配置项传入响应式 ref，模板数据变化时会自动更新编辑器内容。</p></div>`,8)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"模板填充",description:"支持动态模板切换，自动聚焦可编辑字段。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{d.value=!1}),vueCode:n(dt)},h({_:2},[W.value?{name:"vue",fn:o(()=>[e(n(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[28]||(t[28]=k('<p><strong>配置详见</strong>：<a href="#template-配置">Template 配置</a></p><h4 id="提及功能" tabindex="-1">提及功能 <a class="header-anchor" href="#提及功能" aria-label="Permalink to &quot;提及功能&quot;">​</a></h4><p>使用 <code>Mention</code> 扩展实现 @提及功能，输入触发字符（默认 <code>@</code>）触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。</p><div class="tip custom-block"><p class="custom-block-title">自定义触发字符</p><p>支持自定义触发字符，例如使用 <code>#</code> 代替 <code>@</code>。配置 <code>char: &#39;#&#39;</code> 后，输入 <code>#</code> 即可触发提及列表，选中后显示为 <code>#标签名</code> 的格式。</p></div><div class="tip custom-block"><p class="custom-block-title">删除提及</p><p>按 <code>Backspace</code> 删除提及项时会保留触发字符（如 <code>@</code> 或 <code>#</code>），可继续选择其他项。</p></div>',5)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"提及功能",description:"输入 @ 触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{d.value=!1}),vueCode:n(nt)},h({_:2},[Z.value?{name:"vue",fn:o(()=>[e(n(Z))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[29]||(t[29]=k('<p><strong>配置详见</strong>：<a href="#mention-配置">Mention 配置</a></p><p><strong>结构化数据</strong>：<a href="#结构化数据">submit 事件 - 结构化数据说明</a></p><h4 id="智能联想" tabindex="-1">智能联想 <a class="header-anchor" href="#智能联想" aria-label="Permalink to &quot;智能联想&quot;">​</a></h4><p>使用 <code>Suggestion</code> 扩展实现智能联想功能，支持键盘导航（↑↓ 选择，Enter 确认）和自动补全提示。</p><div class="tip custom-block"><p class="custom-block-title">自动补全提示</p><p>选中建议项时，输入框会以灰色文本显示剩余部分，并显示 &quot;TAB&quot; 提示，按 Tab 键快速应用补全。</p></div><p><strong>基础用法</strong></p><p>不传 <code>filterFn</code> 时，直接显示所有建议项，不做任何过滤。</p>',7)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"基础用法",description:"直接显示所有建议项，不过滤。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{d.value=!1}),vueCode:n(et)},h({_:2},[_.value?{name:"vue",fn:o(()=>[e(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[30]||(t[30]=a("p",null,[a("strong",null,"自定义过滤")],-1)),t[31]||(t[31]=a("p",null,[u("通过 "),a("code",null,"filterFn"),u(" 自定义过滤逻辑，实现模糊匹配、前缀匹配等。")],-1)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"自定义过滤",description:"使用 filterFn 实现自定义过滤逻辑。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{d.value=!1}),vueCode:n(tt)},h({_:2},[w.value?{name:"vue",fn:o(()=>[e(n(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[32]||(t[32]=k("<p><strong>高亮模式</strong></p><p>支持三种高亮模式，满足不同的使用场景：</p><ol><li><strong>自动匹配</strong>：不设置 <code>highlights</code>，自动高亮与输入内容匹配的部分</li><li><strong>精确指定</strong>：通过 <code>highlights</code> 数组精确指定需要高亮的文本片段</li><li><strong>自定义函数</strong>：通过 <code>highlights</code> 函数完全控制高亮逻辑，实现复杂的高亮规则</li></ol>",3)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"高亮模式",description:"动态切换三种高亮模式，对比不同的高亮效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[8]||(t[8]=()=>{d.value=!1}),vueCode:n(K)},h({_:2},[T.value?{name:"vue",fn:o(()=>[e(n(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[33]||(t[33]=k('<p><strong>配置详见</strong>：<a href="#suggestion-配置">Suggestion 配置</a></p><h3 id="语音输入与服务集成" tabindex="-1">语音输入与服务集成 <a class="header-anchor" href="#语音输入与服务集成" aria-label="Permalink to &quot;语音输入与服务集成&quot;">​</a></h3><p>通过 <code>VoiceButton</code> 组件实现语音输入功能，支持浏览器内置语音识别和第三方语音识别服务。</p><div class="tip custom-block"><p class="custom-block-title">组件化设计</p><p>语音输入功能通过独立的 <code>VoiceButton</code> 组件实现，可按需添加到 <code>footer</code> 插槽中，无需额外配置。</p></div><h4 id="基础语音交互" tabindex="-1">基础语音交互 <a class="header-anchor" href="#基础语音交互" aria-label="Permalink to &quot;基础语音交互&quot;">​</a></h4><p><code>auto-insert</code> 默认为 <code>true</code>，会把最终识别结果插入编辑器；关闭后，应用可以只通过 <code>speech-final</code> 接收结果并自行决定后续处理。</p>',6)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"基础语音输入",description:"使用本地 Mock 处理器对比自动写入编辑器和仅接收识别事件。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22voice-input.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2Fvoice-input.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrSender%2C%20VoiceButton%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20MockSpeechHandler%20%7D%20from%20'.%2FmockSpeechHandler'%5Cn%5Cnconst%20inputMode%20%3D%20ref%3C'auto'%20%7C%20'manual'%3E('auto')%5Cnconst%20recognizedText%20%3D%20ref('%E5%B0%9A%E6%9C%AA%E8%AF%86%E5%88%AB')%5Cnconst%20speechConfig%20%3D%20%7B%20customHandler%3A%20new%20MockSpeechHandler()%20%7D%5Cn%5Cnconst%20handleSpeechFinal%20%3D%20(transcript%3A%20string)%20%3D%3E%20%7B%5Cn%20%20recognizedText.value%20%3D%20transcript%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2016px%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20align-items%3A%20center%3B%20gap%3A%2012px%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%20style%3D%5C%22font-weight%3A%20500%5C%22%3E%E6%A8%A1%E5%BC%8F%EF%BC%9A%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Clabel%20style%3D%5C%22display%3A%20flex%3B%20align-items%3A%20center%3B%20gap%3A%204px%3B%20cursor%3A%20pointer%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20type%3D%5C%22radio%5C%22%20value%3D%5C%22auto%5C%22%20v-model%3D%5C%22inputMode%5C%22%20style%3D%5C%22cursor%3A%20pointer%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%E8%87%AA%E5%8A%A8%E5%86%99%E5%85%A5%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3Clabel%20style%3D%5C%22display%3A%20flex%3B%20align-items%3A%20center%3B%20gap%3A%204px%3B%20cursor%3A%20pointer%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20type%3D%5C%22radio%5C%22%20value%3D%5C%22manual%5C%22%20v-model%3D%5C%22inputMode%5C%22%20style%3D%5C%22cursor%3A%20pointer%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%E4%BB%85%E6%8E%A5%E6%94%B6%E4%BA%8B%E4%BB%B6%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%20style%3D%5C%22padding%3A%208px%2012px%3B%20background%3A%20%23f5f7fa%3B%20border-radius%3A%204px%3B%20font-size%3A%2013px%3B%20color%3A%20%23666%5C%22%3E%5Cn%20%20%20%20%20%20%7B%7B%20inputMode%20%3D%3D%3D%20'auto'%20%3F%20'%E6%9C%80%E7%BB%88%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%E4%BC%9A%E6%8F%92%E5%85%A5%E7%BC%96%E8%BE%91%E5%99%A8'%20%3A%20'%E5%85%B3%E9%97%AD%20auto-insert%20%E5%90%8E%EF%BC%8C%E5%BA%94%E7%94%A8%E5%8F%AA%E9%80%9A%E8%BF%87%E4%BA%8B%E4%BB%B6%E6%8E%A5%E6%94%B6%E7%BB%93%E6%9E%9C'%20%7D%7D%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Ctr-sender%20mode%3D%5C%22multiple%5C%22%20placeholder%3D%5C%22%E7%82%B9%E5%87%BB%E9%BA%A6%E5%85%8B%E9%A3%8E%EF%BC%8C%E7%AD%89%E5%BE%85%E6%9C%AC%E5%9C%B0%20Mock%20%E8%BF%94%E5%9B%9E%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C...%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23footer-right%3E%5Cn%20%20%20%20%20%20%20%20%3CVoiceButton%5Cn%20%20%20%20%20%20%20%20%20%20%3Aspeech-config%3D%5C%22speechConfig%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aauto-insert%3D%5C%22inputMode%20%3D%3D%3D%20'auto'%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40speech-final%3D%5C%22handleSpeechFinal%5C%22%5Cn%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2Ftr-sender%3E%5Cn%20%20%20%20%3Cp%20style%3D%5C%22margin%3A%200%3B%20color%3A%20%23666%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%E6%9C%80%E8%BF%91%E4%B8%80%E6%AC%A1%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%EF%BC%9A%7B%7B%20recognizedText%20%7D%7D%3C%2Fp%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%22%7D%2C%22mockSpeechHandler.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FmockSpeechHandler.ts%22%2C%22code%22%3A%22import%20type%20%7B%20SpeechCallbacks%2C%20SpeechHandler%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnexport%20class%20MockSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20timer%3F%3A%20ReturnType%3Ctypeof%20setInterval%3E%5Cn%5Cn%20%20start(callbacks%3A%20SpeechCallbacks)%3A%20void%20%7B%5Cn%20%20%20%20this.stop()%5Cn%20%20%20%20callbacks.onStart()%5Cn%5Cn%20%20%20%20let%20step%20%3D%200%5Cn%20%20%20%20const%20interimResults%20%3D%20%5B'%E6%AD%A3%E5%9C%A8'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3%E5%86%85%E5%AE%B9'%5D%5Cn%5Cn%20%20%20%20this.timer%20%3D%20setInterval(()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20interimResult%20%3D%20interimResults%5Bstep%5D%5Cn%20%20%20%20%20%20if%20(interimResult)%20%7B%5Cn%20%20%20%20%20%20%20%20callbacks.onInterim(interimResult)%5Cn%20%20%20%20%20%20%20%20step%20%2B%3D%201%5Cn%20%20%20%20%20%20%20%20return%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20callbacks.onFinal('%E8%BF%99%E6%98%AF%E4%B8%80%E4%B8%AA%E6%A8%A1%E6%8B%9F%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C')%5Cn%20%20%20%20%20%20callbacks.onEnd()%5Cn%20%20%20%20%20%20this.stop()%5Cn%20%20%20%20%7D%2C%20500)%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.timer)%20%7B%5Cn%20%20%20%20%20%20clearInterval(this.timer)%5Cn%20%20%20%20%20%20this.timer%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[9]||(t[9]=()=>{d.value=!1}),vueCode:n($)},h({_:2},[S.value?{name:"vue",fn:o(()=>[e(n(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[34]||(t[34]=a("p",null,[u("浏览器内置处理器是 "),a("code",null,"VoiceButton"),u(" 在未传 "),a("code",null,"customHandler"),u(" 时的默认实现。它会请求麦克风权限，且可用性取决于浏览器；正式产品应处理不支持、拒绝授权和识别失败等情况。")],-1)),t[35]||(t[35]=a("h4",{id:"第三方语音服务",tabindex:"-1"},[u("第三方语音服务 "),a("a",{class:"header-anchor",href:"#第三方语音服务","aria-label":'Permalink to "第三方语音服务"'},"​")],-1)),t[36]||(t[36]=a("p",null,"支持集成第三方语音识别服务（如阿里云、百度、Azure 等）。这是高级集成示例，需要应用提供服务端代理、鉴权信息和浏览器录音权限，不属于基础使用的运行前提。",-1)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"自定义语音识别",description:"先用本地 Mock handler 验证接入流程，再参考 speechHandlers.ts 接入受保护的服务端代理。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22voice-custom.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2Fvoice-custom.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrSender%2C%20VoiceButton%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20MockSpeechHandler%20%7D%20from%20'.%2FspeechHandlers'%5Cn%5Cn%2F%2F%20%E7%BB%84%E4%BB%B6%E7%8A%B6%E6%80%81%5Cnconst%20inputText%20%3D%20ref('')%5Cnconst%20speechStatus%20%3D%20ref('')%5Cnconst%20interimResult%20%3D%20ref('')%5Cnconst%20submittedContent%20%3D%20ref('')%5Cn%5Cn%2F%2F%20%E8%AF%AD%E9%9F%B3%E9%85%8D%E7%BD%AE%20-%20%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%E5%A4%84%E7%90%86%E5%99%A8%5Cnconst%20speechConfig%20%3D%20%7B%5Cn%20%20customHandler%3A%20new%20MockSpeechHandler()%2C%5Cn%20%20interimResults%3A%20true%2C%5Cn%7D%5Cn%5Cn%2F%2F%20%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%5Cnconst%20handleSpeechStart%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20'%F0%9F%8E%A4%20%E6%AD%A3%E5%9C%A8%E5%BD%95%E9%9F%B3...'%5Cn%20%20interimResult.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSpeechInterim%20%3D%20(transcript%3A%20string)%20%3D%3E%20%7B%5Cn%20%20interimResult.value%20%3D%20transcript%5Cn%7D%5Cn%5Cnconst%20handleSpeechFinal%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20'%E2%9C%85%20%E8%AF%86%E5%88%AB%E5%AE%8C%E6%88%90'%5Cn%20%20interimResult.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSpeechEnd%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20''%5Cn%20%20interimResult.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSpeechError%20%3D%20(error%3A%20Error)%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20%60%E2%9D%8C%20%24%7Berror.message%7D%60%5Cn%20%20interimResult.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSubmit%20%3D%20(text%3A%20string)%20%3D%3E%20%7B%5Cn%20%20submittedContent.value%20%3D%20text%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2020px%5C%22%3E%5Cn%20%20%20%20%3C!--%20%E7%8A%B6%E6%80%81%E6%98%BE%E7%A4%BA%20--%3E%5Cn%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20v-if%3D%5C%22speechStatus%5C%22%5Cn%20%20%20%20%20%20style%3D%5C%22padding%3A%2012px%3B%20background%3A%20%23e8f4fd%3B%20border-radius%3A%206px%3B%20border-left%3A%204px%20solid%20%231890ff%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22font-weight%3A%20500%3B%20color%3A%20%231890ff%5C%22%3E%7B%7B%20speechStatus%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3Cdiv%20v-if%3D%5C%22interimResult%5C%22%20style%3D%5C%22margin-top%3A%208px%3B%20color%3A%20%23666%3B%20font-style%3A%20italic%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E5%AE%9E%E6%97%B6%E8%AF%86%E5%88%AB%3A%20%7B%7B%20interimResult%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E8%BE%93%E5%85%A5%E7%BB%84%E4%BB%B6%20--%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%2024px%200%5C%22%3E%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%BC%94%E7%A4%BA%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Ctr-sender%20v-model%3D%5C%22inputText%5C%22%20mode%3D%5C%22single%5C%22%20placeholder%3D%5C%22%E7%82%B9%E5%87%BB%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%8C%89%E9%92%AE%E5%BC%80%E5%A7%8B%E8%AF%AD%E9%9F%B3%E8%BE%93%E5%85%A5...%5C%22%20%40submit%3D%5C%22handleSubmit%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ctemplate%20%23actions-inline%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3CVoiceButton%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Aspeech-config%3D%5C%22speechConfig%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40speech-start%3D%5C%22handleSpeechStart%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40speech-interim%3D%5C%22handleSpeechInterim%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40speech-final%3D%5C%22handleSpeechFinal%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40speech-end%3D%5C%22handleSpeechEnd%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40speech-error%3D%5C%22handleSpeechError%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%3C%2Ftr-sender%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cp%20v-if%3D%5C%22submittedContent%5C%22%20style%3D%5C%22margin%3A%200%3B%20color%3A%20%23666%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%E5%B7%B2%E6%8F%90%E4%BA%A4%EF%BC%9A%7B%7B%20submittedContent%20%7D%7D%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%20--%3E%5Cn%20%20%20%20%3Cdiv%20style%3D%5C%22padding%3A%2016px%3B%20background%3A%20%23fffbe6%3B%20border-radius%3A%208px%3B%20border-left%3A%204px%20solid%20%23faad14%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%200%200%208px%200%3B%20color%3A%20%23fa8c16%5C%22%3E%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cul%20style%3D%5C%22margin%3A%200%3B%20padding-left%3A%2020px%3B%20color%3A%20%23666%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E6%AD%A4%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%EF%BC%8C%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%20%E9%85%8D%E7%BD%AE%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E7%82%B9%E5%87%BB%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%8C%89%E9%92%AE%E5%90%8E%E4%BC%9A%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E8%BF%87%E7%A8%8B%EF%BC%8C%E5%B1%95%E7%A4%BA%E4%B8%AD%E9%97%B4%E7%BB%93%E6%9E%9C%E5%92%8C%E6%9C%80%E7%BB%88%E7%BB%93%E6%9E%9C%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E5%A6%82%E9%9C%80%E6%8E%A5%E5%85%A5%E7%9C%9F%E5%AE%9E%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%9C%8D%E5%8A%A1%EF%BC%88%E9%98%BF%E9%87%8C%E4%BA%91%E7%AD%89%EF%BC%89%EF%BC%8C%E8%AF%B7%E5%8F%82%E8%80%83%20%3Ccode%3EspeechHandlers.ts%3C%2Fcode%3E%20%E4%B8%AD%E7%9A%84%E5%AE%9E%E7%8E%B0%E7%A4%BA%E4%BE%8B%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E6%94%AF%E6%8C%81%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%AD%E9%9F%B3%E5%A4%84%E7%90%86%E5%99%A8%EF%BC%8C%E5%AE%9E%E7%8E%B0%E4%BB%BB%E6%84%8F%E7%AC%AC%E4%B8%89%E6%96%B9%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%9C%8D%E5%8A%A1%E7%9A%84%E9%9B%86%E6%88%90%3C%2Fli%3E%5Cn%20%20%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%22%7D%2C%22speechHandlers.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FspeechHandlers.ts%22%2C%22code%22%3A%22import%20Recorder%20from%20'recorder-core'%5Cnimport%20'recorder-core%2Fsrc%2Fengine%2Fpcm'%5Cnimport%20type%20%7B%20SpeechHandler%2C%20SpeechCallbacks%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cn%2F**%5Cn%20*%20recorder-core%20%E7%9A%84%E9%85%8D%E7%BD%AE%E9%80%89%E9%A1%B9%5Cn%20*%2F%5Cninterface%20RecorderOptions%20%7B%5Cn%20%20type%3A%20'wav'%20%7C%20'mp3'%20%7C%20'pcm'%20%7C%20string%20%2F%2F%20%E6%9C%9F%E6%9C%9B%E7%9A%84%E8%BE%93%E5%87%BA%E6%A0%BC%E5%BC%8F%5Cn%20%20sampleRate%3A%2016000%20%7C%208000%20%7C%20number%20%2F%2F%20%E9%87%87%E6%A0%B7%E7%8E%87%5Cn%20%20bitRate%3A%2016%20%7C%208%20%7C%20number%20%2F%2F%20%E6%AF%94%E7%89%B9%E7%8E%87%5Cn%20%20onProcess%3F%3A%20(buffers%3A%20Float32Array%5B%5D%2C%20powerLevel%3A%20number%2C%20duration%3A%20number%2C%20sampleRate%3A%20number)%20%3D%3E%20void%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20recorder-core%20%E5%AE%9E%E4%BE%8B%E7%9A%84%E6%8E%A5%E5%8F%A3%5Cn%20*%2F%5Cninterface%20IRecorder%20%7B%5Cn%20%20open(success%3A%20()%20%3D%3E%20void%2C%20fail%3A%20(msg%3A%20string%2C%20isUserNotAllow%3A%20boolean)%20%3D%3E%20void)%3A%20void%5Cn%20%20start()%3A%20void%5Cn%20%20stop(success%3A%20(blob%3A%20Blob%2C%20duration%3A%20number)%20%3D%3E%20void%2C%20fail%3A%20(msg%3A%20string)%20%3D%3E%20void)%3A%20void%5Cn%20%20close()%3A%20void%5Cn%20%20support()%3A%20boolean%5Cn%7D%5Cn%5Cninterface%20RecorderStatic%20%7B%5Cn%20%20(options%3A%20RecorderOptions)%3A%20IRecorder%5Cn%7D%5Cn%5Cnconst%20TypedRecorder%20%3D%20Recorder%20as%20RecorderStatic%5Cn%5Cn%2F**%5Cn%20*%20%E7%AE%80%E5%8D%95%E7%9A%84%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E7%94%A8%E4%BA%8E%E6%B5%8B%E8%AF%95%E5%92%8C%E6%BC%94%E7%A4%BA%5Cn%20*%2F%5Cnexport%20class%20MockSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20timer%3F%3A%20ReturnType%3Ctypeof%20setInterval%3E%5Cn%5Cn%20%20start(callbacks%3A%20SpeechCallbacks)%3A%20void%20%7B%5Cn%20%20%20%20%2F%2F%20%E7%AB%8B%E5%8D%B3%E8%A7%A6%E5%8F%91%E5%BC%80%E5%A7%8B%5Cn%20%20%20%20callbacks.onStart()%5Cn%5Cn%20%20%20%20%2F%2F%20%E6%A8%A1%E6%8B%9F%E8%AF%86%E5%88%AB%E8%BF%87%E7%A8%8B%5Cn%20%20%20%20let%20step%20%3D%200%5Cn%20%20%20%20const%20steps%20%3D%20%5B'%E6%AD%A3%E5%9C%A8'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3%E5%86%85%E5%AE%B9'%5D%5Cn%5Cn%20%20%20%20this.timer%20%3D%20setInterval(()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(step%20%3C%20steps.length)%20%7B%5Cn%20%20%20%20%20%20%20%20callbacks.onInterim(steps%5Bstep%5D)%5Cn%20%20%20%20%20%20%20%20step%2B%2B%5Cn%20%20%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E5%AE%8C%E6%88%90%E8%AF%86%E5%88%AB%5Cn%20%20%20%20%20%20%20%20const%20finalResult%20%3D%20'%E8%BF%99%E6%98%AF%E4%B8%80%E4%B8%AA%E6%A8%A1%E6%8B%9F%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C'%5Cn%20%20%20%20%20%20%20%20callbacks.onFinal(finalResult)%5Cn%5Cn%20%20%20%20%20%20%20%20callbacks.onEnd()%5Cn%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E6%B8%85%E7%90%86%E5%AE%9A%E6%97%B6%E5%99%A8%E8%B5%84%E6%BA%90%5Cn%20%20%20%20%20%20%20%20this.stop()%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%20500)%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.timer)%20%7B%5Cn%20%20%20%20%20%20clearInterval(this.timer)%5Cn%20%20%20%20%20%20this.timer%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%20%2F%2F%20%E6%A8%A1%E6%8B%9F%E5%A4%84%E7%90%86%E5%99%A8%E6%80%BB%E6%98%AF%E6%94%AF%E6%8C%81%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E4%B8%80%E5%8F%A5%E8%AF%9D%E8%AF%86%E5%88%AB%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E4%BD%BF%E7%94%A8%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%20REST%20API%5Cn%20*%5Cn%20*%20%E9%9C%80%E8%A6%81%E5%A1%AB%E5%85%A5%E8%87%AA%E5%B7%B1%E7%9A%84%20appKey%20%E5%92%8C%20token%5Cn%20*%2F%5Cnexport%20class%20AliyunSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20recorder%3F%3A%20IRecorder%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%20%20private%20appKey%3A%20string%20%3D%20'your_app_key'%5Cn%20%20private%20token%3A%20string%20%3D%20'your_token'%5Cn%5Cn%20%20private%20closeRecorder()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.recorder)%20%7B%5Cn%20%20%20%20%20%20this.recorder.close()%5Cn%20%20%20%20%20%20this.recorder%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20async%20processWithAliyunAPI(audioBlob%3A%20Blob)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.callbacks)%20return%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E5%AE%9E%E9%99%85%E8%AF%B7%E6%B1%82%E4%B8%AD%EF%BC%8C%E9%9C%80%E8%A6%81%E9%85%8D%E7%BD%AE%E4%BB%A3%E7%90%86%E8%BD%AC%E5%8F%91%E5%88%B0%EF%BC%9A%20https%3A%2F%2Fnls-gateway-cn-shanghai.aliyuncs.com%5Cn%20%20%20%20%20%20const%20baseUrl%20%3D%20'%2Fapi%2Faliyun%2Fasr'%5Cn%5Cn%20%20%20%20%20%20const%20params%20%3D%20new%20URLSearchParams(%7B%5Cn%20%20%20%20%20%20%20%20appkey%3A%20this.appKey%2C%5Cn%20%20%20%20%20%20%20%20format%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20sample_rate%3A%20'16000'%2C%5Cn%20%20%20%20%20%20%20%20enable_punctuation_prediction%3A%20'true'%2C%5Cn%20%20%20%20%20%20%20%20enable_inverse_text_normalization%3A%20'true'%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BbaseUrl%7D%3F%24%7Bparams.toString()%7D%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20'Content-Type'%3A%20'application%2Foctet-stream'%2C%5Cn%20%20%20%20%20%20%20%20%20%20'X-NLS-Token'%3A%20this.token%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20audioBlob%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20errorBody%20%3D%20await%20response.text()%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%E9%94%99%E8%AF%AF!%20%E7%8A%B6%E6%80%81%E7%A0%81%3A%20%24%7Bresponse.status%7D%2C%20%E5%93%8D%E5%BA%94%3A%20%24%7BerrorBody%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20result%20%3D%20await%20response.json()%5Cn%5Cn%20%20%20%20%20%20if%20(result.status%20%3D%3D%3D%2020000000%20%26%26%20result.result)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20transcript%20%3D%20result.result%5Cn%20%20%20%20%20%20%20%20this.callbacks.onFinal(transcript)%5Cn%20%20%20%20%20%20%20%20this.callbacks.onEnd(transcript)%5Cn%20%20%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(result.message%20%7C%7C%20%60%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5%EF%BC%8C%E7%8A%B6%E6%80%81%E7%A0%81%3A%20%24%7Bresult.status%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20this.callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20start(callbacks%3A%20SpeechCallbacks)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20this.recorder%20%3D%20TypedRecorder(%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20sampleRate%3A%2016000%2C%5Cn%20%20%20%20%20%20%20%20bitRate%3A%2016%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20this.recorder.open(%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20this.recorder%3F.start()%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onStart()%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20(msg%3A%20string%2C%20isUserNotAllow%3A%20boolean)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20const%20errorMsg%20%3D%20isUserNotAllow%20%3F%20%60%E7%94%A8%E6%88%B7%E6%8B%92%E7%BB%9D%E4%BA%86%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%9D%83%E9%99%90%3A%20%24%7Bmsg%7D%60%20%3A%20%60%E6%97%A0%E6%B3%95%E6%89%93%E5%BC%80%E9%BA%A6%E5%85%8B%E9%A3%8E%3A%20%24%7Bmsg%7D%60%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onError(new%20Error(errorMsg))%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E6%9C%8D%E5%8A%A1%E5%90%AF%E5%8A%A8%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20stop()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.recorder)%20%7B%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.recorder.stop(%5Cn%20%20%20%20%20%20(blob%3A%20Blob)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20this.processWithAliyunAPI(blob)%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20(msg%3A%20string)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error(%60%E5%BD%95%E9%9F%B3%E5%A4%B1%E8%B4%A5%3A%20%24%7Bmsg%7D%60))%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E4%BD%BF%E7%94%A8%20WebSocket%20%E8%BF%9B%E8%A1%8C%E6%B5%81%E5%BC%8F%E8%AF%86%E5%88%AB%5Cn%20*%5Cn%20*%20%E9%9C%80%E8%A6%81%E5%A1%AB%E5%85%A5%E8%87%AA%E5%B7%B1%E7%9A%84%20appKey%20%E5%92%8C%20token%5Cn%20*%2F%5Cnexport%20class%20AliyunRealtimeSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20ws%3F%3A%20WebSocket%5Cn%20%20private%20audioContext%3F%3A%20AudioContext%5Cn%20%20private%20scriptProcessor%3F%3A%20ScriptProcessorNode%5Cn%20%20private%20audioStream%3F%3A%20MediaStream%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%20%20private%20appKey%3A%20string%20%3D%20'your_app_key'%5Cn%20%20private%20token%3A%20string%20%3D%20'your_token'%5Cn%5Cn%20%20private%20generateUUID()%3A%20string%20%7B%5Cn%20%20%20%20%2F%2F%20%E4%BD%BF%E7%94%A8%20crypto.randomUUID()%20%E7%94%9F%E6%88%90%E6%A0%87%E5%87%86%20UUID%EF%BC%8C%E7%84%B6%E5%90%8E%E7%A7%BB%E9%99%A4%E8%BF%9E%E5%AD%97%E7%AC%A6%E5%BE%97%E5%88%B032%E4%BD%8D%E5%AD%97%E7%AC%A6%E4%B8%B2%5Cn%20%20%20%20return%20crypto.randomUUID().replace(%2F-%2Fg%2C%20'')%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%5Cn%20%20async%20start(callbacks%3A%20SpeechCallbacks)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.isSupported())%20%7B%5Cn%20%20%20%20%20%20callbacks.onError(new%20Error('%E5%BD%93%E5%89%8D%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%8D%E6%94%AF%E6%8C%81%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%89%80%E9%9C%80%E7%9A%84%E5%8A%9F%E8%83%BD'))%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%20%20%20%20this.setupWebSocket()%5Cn%20%20%7D%5Cn%5Cn%20%20private%20setupWebSocket()%3A%20void%20%7B%5Cn%20%20%20%20const%20scheme%20%3D%20window.location.protocol%20%3D%3D%3D%20'https%3A'%20%3F%20'wss'%20%3A%20'ws'%5Cn%20%20%20%20%2F%2F%20%E5%AE%9E%E9%99%85%E8%AF%B7%E6%B1%82%E4%B8%AD%EF%BC%8C%E9%9C%80%E8%A6%81%E9%85%8D%E7%BD%AE%E4%BB%A3%E7%90%86%E8%BD%AC%E5%8F%91%E5%88%B0%EF%BC%9A%20wss%3A%2F%2Fnls-gateway-cn-shanghai.aliyuncs.com%5Cn%20%20%20%20const%20socketUrl%20%3D%20%60%24%7Bscheme%7D%3A%2F%2F%24%7Bwindow.location.host%7D%2Fapi%2Faliyun%2Fws%3Ftoken%3D%24%7Bthis.token%7D%60%5Cn%5Cn%20%20%20%20this.ws%20%3D%20new%20WebSocket(socketUrl)%5Cn%5Cn%20%20%20%20this.ws.onopen%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E8%BF%9E%E6%8E%A5%E6%88%90%E5%8A%9F%E5%90%8E%EF%BC%8C%E5%8F%91%E9%80%81%E5%BC%80%E5%A7%8B%E8%AF%86%E5%88%AB%E6%8C%87%E4%BB%A4%5Cn%20%20%20%20%20%20const%20startMessage%20%3D%20%7B%5Cn%20%20%20%20%20%20%20%20header%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20appkey%3A%20this.appKey%2C%5Cn%20%20%20%20%20%20%20%20%20%20namespace%3A%20'SpeechTranscriber'%2C%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'StartTranscription'%2C%5Cn%20%20%20%20%20%20%20%20%20%20task_id%3A%20this.generateUUID()%2C%5Cn%20%20%20%20%20%20%20%20%20%20message_id%3A%20this.generateUUID()%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20payload%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20format%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20%20%20sample_rate%3A%2016000%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_intermediate_result%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_punctuation_prediction%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_inverse_text_normalization%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20this.ws%3F.send(JSON.stringify(startMessage))%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onmessage%20%3D%20(event)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20message%20%3D%20JSON.parse(event.data)%5Cn%5Cn%20%20%20%20%20%20switch%20(message.header.name)%20%7B%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionStarted'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E6%9C%8D%E5%8A%A1%E7%AB%AF%E5%87%86%E5%A4%87%E5%B0%B1%E7%BB%AA%EF%BC%8C%E5%BC%80%E5%A7%8B%E6%8D%95%E6%8D%89%E5%92%8C%E5%8F%91%E9%80%81%E9%9F%B3%E9%A2%91%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onStart()%5Cn%20%20%20%20%20%20%20%20%20%20this.startAudioProcessing()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionResultChanged'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E4%B8%AD%E9%97%B4%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%5Cn%20%20%20%20%20%20%20%20%20%20if%20(message.payload.result)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onInterim(message.payload.result)%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'SentenceEnd'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E5%8F%A5%E5%AD%90%E7%BB%93%E6%9D%9F%EF%BC%8C%E6%9C%80%E7%BB%88%E7%BB%93%E6%9E%9C%5Cn%20%20%20%20%20%20%20%20%20%20if%20(message.payload.result)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onFinal(message.payload.result)%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionCompleted'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E8%AF%86%E5%88%AB%E5%AE%8C%E6%88%90%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onEnd()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TaskFailed'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E4%BB%BB%E5%8A%A1%E5%A4%B1%E8%B4%A5%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error(%60%E4%BB%BB%E5%8A%A1%E5%A4%B1%E8%B4%A5%3A%20%24%7Bmessage.payload.status_text%20%7C%7C%20'%E6%9C%AA%E7%9F%A5%E9%94%99%E8%AF%AF'%7D%60))%5Cn%20%20%20%20%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onerror%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error('WebSocket%20%E8%BF%9E%E6%8E%A5%E5%8F%91%E7%94%9F%E9%94%99%E8%AF%AF'))%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onclose%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20async%20startAudioProcessing()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E8%8E%B7%E5%8F%96%E9%9F%B3%E9%A2%91%E6%B5%81%5Cn%20%20%20%20%20%20this.audioStream%20%3D%20await%20navigator.mediaDevices.getUserMedia(%7B%20audio%3A%20true%20%7D)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87%5Cn%20%20%20%20%20%20const%20AudioContextClass%20%3D%5Cn%20%20%20%20%20%20%20%20window.AudioContext%20%7C%7C%5Cn%20%20%20%20%20%20%20%20(window%20as%20typeof%20window%20%26%20%7B%20webkitAudioContext%3F%3A%20typeof%20AudioContext%20%7D).webkitAudioContext%5Cn%20%20%20%20%20%20if%20(!AudioContextClass)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error('AudioContext%20not%20supported')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20this.audioContext%20%3D%20new%20AudioContextClass(%7B%20sampleRate%3A%2016000%20%7D)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E8%84%9A%E6%9C%AC%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20%20%20%20%20%20this.scriptProcessor%20%3D%20this.audioContext.createScriptProcessor(2048%2C%201%2C%201)%5Cn%5Cn%20%20%20%20%20%20this.scriptProcessor.onaudioprocess%20%3D%20(event)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20const%20inputData%20%3D%20event.inputBuffer.getChannelData(0)%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E8%BD%AC%E6%8D%A2%E4%B8%BA16-bit%20PCM%E6%A0%BC%E5%BC%8F%5Cn%20%20%20%20%20%20%20%20const%20pcmData%20%3D%20new%20Int16Array(inputData.length)%5Cn%20%20%20%20%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20inputData.length%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20pcmData%5Bi%5D%20%3D%20Math.max(-1%2C%20Math.min(1%2C%20inputData%5Bi%5D))%20*%200x7fff%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20if%20(this.ws%3F.readyState%20%3D%3D%3D%20WebSocket.OPEN)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20this.ws.send(pcmData.buffer)%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20source%20%3D%20this.audioContext.createMediaStreamSource(this.audioStream)%5Cn%20%20%20%20%20%20source.connect(this.scriptProcessor)%5Cn%20%20%20%20%20%20this.scriptProcessor.connect(this.audioContext.destination)%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20this.callbacks%3F.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E6%97%A0%E6%B3%95%E5%90%AF%E5%8A%A8%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%88%96%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86'))%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20%2F%2F%20%E5%81%9C%E6%AD%A2%E9%9F%B3%E9%A2%91%E6%B5%81%5Cn%20%20%20%20if%20(this.audioStream)%20%7B%5Cn%20%20%20%20%20%20this.audioStream.getTracks().forEach((track)%20%3D%3E%20track.stop())%5Cn%20%20%20%20%20%20this.audioStream%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E6%96%AD%E5%BC%80%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20%20%20%20if%20(this.scriptProcessor)%20%7B%5Cn%20%20%20%20%20%20this.scriptProcessor.disconnect()%5Cn%20%20%20%20%20%20this.scriptProcessor%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%85%B3%E9%97%AD%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87%5Cn%20%20%20%20if%20(this.audioContext)%20%7B%5Cn%20%20%20%20%20%20this.audioContext.close()%5Cn%20%20%20%20%20%20this.audioContext%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%85%B3%E9%97%AD%20WebSocket%20%E8%BF%9E%E6%8E%A5%5Cn%20%20%20%20if%20(this.ws%20%26%26%20this.ws.readyState%20%3D%3D%3D%20WebSocket.OPEN)%20%7B%5Cn%20%20%20%20%20%20this.ws.close()%5Cn%20%20%20%20%7D%5Cn%20%20%20%20this.ws%20%3D%20undefined%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[10]||(t[10]=()=>{d.value=!1}),vueCode:n(J)},h({_:2},[x.value?{name:"vue",fn:o(()=>[e(n(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[37]||(t[37]=a("div",{class:"warning custom-block"},[a("p",{class:"custom-block-title"},"参考实现不是可直接部署的服务"),a("p",null,[a("code",null,"speechHandlers.ts"),u(" 展示阿里云一句话识别和实时识别所需的录音、API 调用与流式处理结构。示例中的代理地址和鉴权信息都是占位配置，应用必须在服务端保护凭据并实现对应代理。")])],-1)),t[38]||(t[38]=a("h4",{id:"自定义录音-ui",tabindex:"-1"},[u("自定义录音 UI "),a("a",{class:"header-anchor",href:"#自定义录音-ui","aria-label":'Permalink to "自定义录音 UI"'},"​")],-1)),t[39]||(t[39]=a("p",null,"支持完全自定义语音录制界面，适用于移动端按住说话等场景。",-1)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"移动端按住说话",description:"自定义录音 UI，展示移动端按住说话的交互模式。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[11]||(t[11]=()=>{d.value=!1}),vueCode:n(O)},h({_:2},[F.value?{name:"vue",fn:o(()=>[e(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[40]||(t[40]=k('<p><strong>配置详见</strong>：<a href="#voicebutton">VoiceButton 属性</a></p><h3 id="操作按钮与外部内容" tabindex="-1">操作按钮与外部内容 <a class="header-anchor" href="#操作按钮与外部内容" aria-label="Permalink to &quot;操作按钮与外部内容&quot;">​</a></h3><h4 id="默认按钮配置" tabindex="-1">默认按钮配置 <a class="header-anchor" href="#默认按钮配置" aria-label="Permalink to &quot;默认按钮配置&quot;">​</a></h4><p>通过 <code>defaultActions</code> 属性统一配置默认按钮（Clear、Submit）的状态和提示。</p>',4)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"默认按钮配置",description:"通过 defaultActions 统一配置默认按钮的状态和提示。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[12]||(t[12]=()=>{d.value=!1}),vueCode:n(j)},h({_:2},[D.value?{name:"vue",fn:o(()=>[e(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[41]||(t[41]=a("h4",{id:"增强按钮",tabindex:"-1"},[u("增强按钮 "),a("a",{class:"header-anchor",href:"#增强按钮","aria-label":'Permalink to "增强按钮"'},"​")],-1)),t[42]||(t[42]=a("p",null,"通过插槽添加增强按钮（Upload、Voice 等），每个按钮都有独立的配置。",-1)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"增强按钮",description:"通过插槽添加 Upload、Voice 等增强按钮；语音按钮使用本地 Mock，上传内容随消息提交见下方示例。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22actions-enhanced.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2Factions-enhanced.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20onBeforeUnmount%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrSender%2C%20UploadButton%2C%20VoiceButton%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20MockSpeechHandler%20%7D%20from%20'.%2FmockSpeechHandler'%5Cn%5Cnconst%20content%20%3D%20ref('')%5Cnconst%20message%20%3D%20ref('')%5Cnconst%20speechConfig%20%3D%20%7B%20customHandler%3A%20new%20MockSpeechHandler()%20%7D%5Cnlet%20messageTimer%3A%20ReturnType%3Ctypeof%20setTimeout%3E%20%7C%20undefined%5Cn%5Cnconst%20showMessage%20%3D%20(value%3A%20string)%20%3D%3E%20%7B%5Cn%20%20if%20(messageTimer)%20%7B%5Cn%20%20%20%20clearTimeout(messageTimer)%5Cn%20%20%7D%5Cn%5Cn%20%20message.value%20%3D%20value%5Cn%20%20messageTimer%20%3D%20setTimeout(()%20%3D%3E%20%7B%5Cn%20%20%20%20message.value%20%3D%20''%5Cn%20%20%20%20messageTimer%20%3D%20undefined%5Cn%20%20%7D%2C%203000)%5Cn%7D%5Cn%5Cnconst%20handleSubmit%20%3D%20(text%3A%20string)%20%3D%3E%20%7B%5Cn%20%20showMessage(%60%E5%B7%B2%E6%8F%90%E4%BA%A4%3A%20%24%7Btext%7D%60)%5Cn%20%20content.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleFiles%20%3D%20(files%3A%20File%5B%5D)%20%3D%3E%20%7B%5Cn%20%20showMessage(%60%E5%B7%B2%E9%80%89%E6%8B%A9%20%24%7Bfiles.length%7D%20%E4%B8%AA%E6%96%87%E4%BB%B6%60)%5Cn%7D%5Cn%5Cnconst%20handleVoiceFinal%20%3D%20(text%3A%20string)%20%3D%3E%20%7B%5Cn%20%20content.value%20%2B%3D%20text%20%2B%20'%20'%5Cn%7D%5Cn%5CnonBeforeUnmount(()%20%3D%3E%20%7B%5Cn%20%20if%20(messageTimer)%20%7B%5Cn%20%20%20%20clearTimeout(messageTimer)%5Cn%20%20%7D%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22demo-container%5C%22%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22content%5C%22%5Cn%20%20%20%20%20%20placeholder%3D%5C%22%E8%BE%93%E5%85%A5%E5%86%85%E5%AE%B9%EF%BC%8C%E6%88%96%E4%BD%BF%E7%94%A8%E8%AF%AD%E9%9F%B3%2F%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6...%5C%22%5Cn%20%20%20%20%20%20mode%3D%5C%22multiple%5C%22%5Cn%20%20%20%20%20%20clearable%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23footer-right%3E%5Cn%20%20%20%20%20%20%20%20%3C!--%20%E4%B8%8A%E4%BC%A0%E6%8C%89%E9%92%AE%20--%3E%5Cn%20%20%20%20%20%20%20%20%3CUploadButton%5Cn%20%20%20%20%20%20%20%20%20%20accept%3D%5C%22image%2F*%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Amultiple%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20tooltip%3D%5C%22%E4%B8%8A%E4%BC%A0%E5%9B%BE%E7%89%87%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20tooltip-placement%3D%5C%22top%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40select%3D%5C%22handleFiles%5C%22%5Cn%20%20%20%20%20%20%20%20%2F%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3C!--%20%E8%AF%AD%E9%9F%B3%E6%8C%89%E9%92%AE%20--%3E%5Cn%20%20%20%20%20%20%20%20%3CVoiceButton%5Cn%20%20%20%20%20%20%20%20%20%20%3Aspeech-config%3D%5C%22speechConfig%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aauto-insert%3D%5C%22false%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20tooltip%3D%5C%22%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%BE%93%E5%85%A5%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20tooltip-placement%3D%5C%22top%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40speech-final%3D%5C%22handleVoiceFinal%5C%22%5Cn%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20v-if%3D%5C%22message%5C%22%20class%3D%5C%22message%5C%22%3E%7B%7B%20message%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.demo-container%20%7B%5Cn%20%20padding%3A%2020px%3B%5Cn%7D%5Cn%5Cn.message%20%7B%5Cn%20%20margin-top%3A%2015px%3B%5Cn%20%20padding%3A%2010px%3B%5Cn%20%20background%3A%20%23e7f3ff%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20%231476ff%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22mockSpeechHandler.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FmockSpeechHandler.ts%22%2C%22code%22%3A%22import%20type%20%7B%20SpeechCallbacks%2C%20SpeechHandler%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnexport%20class%20MockSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20timer%3F%3A%20ReturnType%3Ctypeof%20setInterval%3E%5Cn%5Cn%20%20start(callbacks%3A%20SpeechCallbacks)%3A%20void%20%7B%5Cn%20%20%20%20this.stop()%5Cn%20%20%20%20callbacks.onStart()%5Cn%5Cn%20%20%20%20let%20step%20%3D%200%5Cn%20%20%20%20const%20interimResults%20%3D%20%5B'%E6%AD%A3%E5%9C%A8'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3%E5%86%85%E5%AE%B9'%5D%5Cn%5Cn%20%20%20%20this.timer%20%3D%20setInterval(()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20interimResult%20%3D%20interimResults%5Bstep%5D%5Cn%20%20%20%20%20%20if%20(interimResult)%20%7B%5Cn%20%20%20%20%20%20%20%20callbacks.onInterim(interimResult)%5Cn%20%20%20%20%20%20%20%20step%20%2B%3D%201%5Cn%20%20%20%20%20%20%20%20return%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20callbacks.onFinal('%E8%BF%99%E6%98%AF%E4%B8%80%E4%B8%AA%E6%A8%A1%E6%8B%9F%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C')%5Cn%20%20%20%20%20%20callbacks.onEnd()%5Cn%20%20%20%20%20%20this.stop()%5Cn%20%20%20%20%7D%2C%20500)%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.timer)%20%7B%5Cn%20%20%20%20%20%20clearInterval(this.timer)%5Cn%20%20%20%20%20%20this.timer%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[13]||(t[13]=()=>{d.value=!1}),vueCode:n(Q)},h({_:2},[B.value?{name:"vue",fn:o(()=>[e(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[43]||(t[43]=k('<p><strong>配置详见</strong>：<a href="#uploadbutton">UploadButton 属性</a>、<a href="#voicebutton">VoiceButton 属性</a></p><h4 id="上传内容" tabindex="-1">上传内容 <a class="header-anchor" href="#上传内容" aria-label="Permalink to &quot;上传内容&quot;">​</a></h4><p>附件、图片等内容通常由上传按钮或独立列表维护，不会写入 Sender 的编辑器文本。把 <code>TrAttachments</code> 放在 <code>TrSender</code> 内时会自动注册提交数据；提交时可从 <code>extra.externalPayloads</code> 中读取 <code>source=&quot;attachments&quot;</code> 的 payload，其值为原样透传的 <code>Attachment[]</code>，具体过滤或上传失败提示由应用处理。自定义外部内容组件也可以通过 <code>useSenderContentRegistration</code> 注册数据。</p><div class="warning custom-block"><p class="custom-block-title">兼容说明</p><p><code>hasExternalContent</code> 仍可用于控制外部内容场景的可提交状态，但不会生成 <code>externalPayloads</code>。</p></div>',4)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"输入框内附件列表",description:"使用 Attachments 在 Sender 内展示和管理附件，并随消息一起提交。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[14]||(t[14]=()=>{d.value=!1}),vueCode:n(N)},h({_:2},[v.value?{name:"vue",fn:o(()=>[e(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[44]||(t[44]=k('<h3 id="交互与状态管理" tabindex="-1">交互与状态管理 <a class="header-anchor" href="#交互与状态管理" aria-label="Permalink to &quot;交互与状态管理&quot;">​</a></h3><h4 id="提交方式" tabindex="-1">提交方式 <a class="header-anchor" href="#提交方式" aria-label="Permalink to &quot;提交方式&quot;">​</a></h4><p>通过 <code>submitType</code> 属性控制提交快捷键，支持 <code>enter</code>、<code>ctrlEnter</code>、<code>shiftEnter</code> 三种方式。</p>',3)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"提交方式",description:"支持三种提交快捷键，适应不同使用场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[15]||(t[15]=()=>{d.value=!1}),vueCode:n(H)},h({_:2},[f.value?{name:"vue",fn:o(()=>[e(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[45]||(t[45]=k('<h4 id="快捷键参考" tabindex="-1">快捷键参考 <a class="header-anchor" href="#快捷键参考" aria-label="Permalink to &quot;快捷键参考&quot;">​</a></h4><table tabindex="0"><thead><tr><th>快捷键</th><th>功能</th><th>适用条件</th></tr></thead><tbody><tr><td>Enter</td><td>提交内容 / 换行</td><td>submitType=&quot;enter&quot;</td></tr><tr><td>Ctrl+Enter</td><td>提交内容 / 换行</td><td>submitType=&quot;ctrlEnter&quot; / submitType=&quot;enter&quot;</td></tr><tr><td>Shift+Enter</td><td>提交内容 / 换行</td><td>submitType=&quot;shiftEnter&quot; / submitType=&quot;enter&quot;</td></tr><tr><td>Tab</td><td>应用自动补全文本</td><td>联想开启且存在自动补全文本时</td></tr><tr><td>Esc</td><td>关闭联想</td><td>联想开启时</td></tr><tr><td>↑ / ↓</td><td>导航联想项</td><td>联想开启时</td></tr></tbody></table><div class="info custom-block"><p class="custom-block-title">换行与提交行为说明</p><ul><li><strong><code>submitType=&quot;enter&quot;</code></strong> 时：按 <code>Enter</code> 提交，按 <code>Ctrl+Enter</code> 或 <code>Shift+Enter</code> 换行</li><li><strong><code>submitType=&quot;ctrlEnter&quot;</code></strong> 时：按 <code>Ctrl+Enter</code> 提交，按 <code>Enter</code> 换行</li><li><strong><code>submitType=&quot;shiftEnter&quot;</code></strong> 时：按 <code>Shift+Enter</code> 提交，按 <code>Enter</code> 换行</li></ul><p>在单行模式下使用换行快捷键时，会自动切换为多行模式。</p></div><div class="tip custom-block"><p class="custom-block-title">自定义选中按键</p><p>通过 <code>activeSuggestionKeys</code> 可自定义选中联想项的按键，默认只有 <code>Enter</code>。<code>Tab</code> 专门用于应用灰色提示中的自动补全文本，不受 <code>activeSuggestionKeys</code> 控制。</p></div><h4 id="自定义插槽" tabindex="-1">自定义插槽 <a class="header-anchor" href="#自定义插槽" aria-label="Permalink to &quot;自定义插槽&quot;">​</a></h4><p>Sender 提供了多个插槽位置，方便扩展功能：</p><ul><li><strong><code>header</code></strong> - 顶部区域，可添加标题、提示信息等</li><li><strong><code>prefix</code></strong> - 输入框前缀区域，可添加图标、标签等（位于输入框内部）</li><li><strong><code>input-prefix</code></strong> - 多行模式首行前置区域，支持自定义交互内容</li><li><strong><code>footer</code></strong> - 底部左侧区域，可添加功能按钮</li><li><strong><code>footer-right</code></strong> - 底部右侧区域，可添加操作按钮</li></ul><div class="info custom-block"><p class="custom-block-title">当前插槽作用域</p><p>当前版本只有 <code>content</code> 插槽提供 <code>editor</code>。<code>actions-inline</code>、<code>footer</code> 和 <code>footer-right</code> 只负责放置内容，不提供作用域参数；需要操作输入内容时，请通过 Sender 实例公开的方法接入。</p></div>',8)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"自定义插槽",description:"在插槽区域添加自定义按钮，如深度思考、网络搜索等功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[16]||(t[16]=()=>{d.value=!1}),vueCode:n(Y)},h({_:2},[A.value?{name:"vue",fn:o(()=>[e(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"首行前置插槽与超长占位文本",description:"展示多行模式下超长占位文本的换行，以及首行前置插槽的动态添加和移除。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[17]||(t[17]=()=>{d.value=!1}),vueCode:n(U)},h({_:2},[y.value?{name:"vue",fn:o(()=>[e(n(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[46]||(t[46]=a("h4",{id:"方法调用",tabindex:"-1"},[u("方法调用 "),a("a",{class:"header-anchor",href:"#方法调用","aria-label":'Permalink to "方法调用"'},"​")],-1)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"方法调用",description:"通过 ref 调用组件方法，如聚焦、设置内容等。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[18]||(t[18]=()=>{d.value=!1}),vueCode:n(G)},h({_:2},[b.value?{name:"vue",fn:o(()=>[e(n(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[47]||(t[47]=k('<h3 id="组合、主题与尺寸" tabindex="-1">组合、主题与尺寸 <a class="header-anchor" href="#组合、主题与尺寸" aria-label="Permalink to &quot;组合、主题与尺寸&quot;">​</a></h3><h4 id="主题继承" tabindex="-1">主题继承 <a class="header-anchor" href="#主题继承" aria-label="Permalink to &quot;主题继承&quot;">​</a></h4><div class="tip custom-block"><p class="custom-block-title">主题继承</p><p>主题会根据父级 <code>ThemeProvider</code> 的配置自动继承，无需重复设置。</p></div><h4 id="组件尺寸" tabindex="-1">组件尺寸 <a class="header-anchor" href="#组件尺寸" aria-label="Permalink to &quot;组件尺寸&quot;">​</a></h4><p>通过 <code>size</code> 属性控制组件尺寸，支持 <code>normal</code>（默认）和 <code>small</code>（紧凑）两种尺寸。</p>',5)),c(e(n(m),null,null,512),[[p,d.value]]),e(i,null,{default:o(()=>[e(n(C),{title:"组件尺寸",description:"支持正常和紧凑两种尺寸，适应不同的使用场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[19]||(t[19]=()=>{d.value=!1}),vueCode:n(L)},h({_:2},[g.value?{name:"vue",fn:o(()=>[e(n(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[48]||(t[48]=k(`<hr><h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="公开导出" tabindex="-1">公开导出 <a class="header-anchor" href="#公开导出" aria-label="Permalink to &quot;公开导出&quot;">​</a></h3><table tabindex="0"><thead><tr><th>导出</th><th>用途与约束</th></tr></thead><tbody><tr><td><code>TrSender</code> / <code>Sender</code></td><td>消息输入主组件；静态提供 <code>Template</code>、<code>Mention</code>、<code>Suggestion</code> 及对应便捷工厂</td></tr><tr><td><code>TrActionButton</code> / <code>ActionButton</code></td><td>可独立使用的基础图标按钮</td></tr><tr><td><code>TrUploadButton</code> / <code>UploadButton</code></td><td>文件选择按钮；必须放在 Sender 组件树内以读取禁用状态</td></tr><tr><td><code>TrVoiceButton</code> / <code>VoiceButton</code></td><td>语音输入按钮；必须放在 Sender 组件树内以访问编辑器和禁用状态</td></tr><tr><td><code>TrSubmitButton</code> / <code>SubmitButton</code></td><td>默认提交 / 停止按钮；依赖 Sender Context</td></tr><tr><td><code>TrClearButton</code> / <code>ClearButton</code></td><td>默认清空按钮；依赖 Sender Context</td></tr><tr><td><code>TrWordCounter</code> / <code>WordCounter</code></td><td>字数统计；依赖 Sender Context</td></tr><tr><td><code>TrDefaultActionButtons</code> / <code>DefaultActionButtons</code></td><td>组合默认清空与提交按钮；依赖 Sender Context</td></tr><tr><td><code>SENDER_CONTEXT_KEY</code></td><td>Sender 依赖注入键；主要供高级集成与定制子组件使用</td></tr></tbody></table><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><h4 id="sender" tabindex="-1">Sender <a class="header-anchor" href="#sender" aria-label="Permalink to &quot;Sender&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>model-value</code></td><td>受控输入内容；父组件收到 <code>update:model-value</code> 后需要更新绑定值</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>default-value</code></td><td>非受控初始内容，只在初始化时读取；同时提供 <code>model-value</code> 时以受控值为准</td><td><code>string</code></td><td><code>&#39;&#39;</code></td><td>否</td></tr><tr><td><code>placeholder</code></td><td>编辑器为空时显示的占位文本</td><td><code>string</code></td><td><code>&#39;请输入内容...&#39;</code></td><td>否</td></tr><tr><td><code>mode</code></td><td>输入布局；单行内容溢出或插入换行时可自动切换为多行</td><td><code>InputMode</code></td><td><code>&#39;single&#39;</code></td><td>否</td></tr><tr><td><code>size</code></td><td>Sender 及其默认操作按钮的尺寸</td><td><code>&#39;normal&#39; | &#39;small&#39;</code></td><td><code>&#39;normal&#39;</code></td><td>否</td></tr><tr><td><code>disabled</code></td><td>禁用编辑和默认操作按钮</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>loading</code></td><td>显示停止操作；此时提交按钮触发 <code>cancel</code> 而不是 <code>submit</code></td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>autofocus</code></td><td>编辑器创建后自动聚焦</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>enterkeyhint</code></td><td>设置移动端虚拟键盘的回车键提示</td><td><code>EnterKeyHint</code></td><td><code>&#39;send&#39;</code></td><td>否</td></tr><tr><td><code>auto-size</code></td><td>多行模式的自动高度范围；传 <code>true</code> 时使用 1～5 行</td><td><code>AutoSize</code></td><td><code>{ minRows: 1, maxRows: 5 }</code></td><td>否</td></tr><tr><td><code>clearable</code></td><td>有编辑器文本时显示清空按钮</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>has-external-content</code>（已弃用）</td><td>兼容性地把空文本视为可提交；1.0 仍保留该属性但不推荐新代码使用；不会生成 <code>externalPayloads</code>，请改用 <code>useSenderContentRegistration</code></td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>max-length</code></td><td>最大字素数；超出后保留输入但禁止提交</td><td><code>number</code></td><td><code>Infinity</code></td><td>否</td></tr><tr><td><code>show-word-limit</code></td><td>提供 <code>max-length</code> 时显示字数统计</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>submit-type</code></td><td>设置 Enter 组合键的提交方式</td><td><code>SubmitTrigger</code></td><td><code>&#39;enter&#39;</code></td><td>否</td></tr><tr><td><code>stop-text</code></td><td><code>loading</code> 状态下停止操作旁的文字；省略或传空字符串时只显示图标</td><td><code>string</code></td><td><code>&#39;&#39;</code>（仅图标）</td><td>否</td></tr><tr><td><code>default-actions</code></td><td>配置默认提交和清空按钮的禁用状态与 Tooltip；提交按钮禁用会参与 <code>canSubmit</code> 计算</td><td><code>DefaultActions</code></td><td>—</td><td>否</td></tr><tr><td><code>extensions</code></td><td>Tiptap 扩展列表，例如 Template、Mention 和 Suggestion</td><td><code>Extension[]</code></td><td><code>[]</code></td><td>否</td></tr></tbody></table><div class="tip custom-block"><p class="custom-block-title">扩展系统</p><p>使用 <code>extensions</code> 属性配置功能扩展，提供灵活的配置和完整的类型支持。</p></div><h4 id="template-配置" tabindex="-1">Template 配置 <a class="header-anchor" href="#template-配置" aria-label="Permalink to &quot;Template 配置&quot;">​</a></h4><p>模板填充功能扩展，支持动态设置模板内容。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 便捷函数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(templates)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(templates, { appendTo: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.chat-window&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 标准配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.Template.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ items: templates, appendTo: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.chat-window&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span></code></pre></div><table tabindex="0"><thead><tr><th>配置项</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>items</code></td><td>模板数据列表；传入 <code>Ref</code> 时会响应后续变化</td><td><code>TemplateItem[]</code> | <code>Ref&lt;TemplateItem[]&gt;</code></td><td>—</td><td>否</td></tr><tr><td><code>HTMLAttributes</code></td><td>合并到模板块节点的 HTML 属性</td><td><code>Record&lt;string, unknown&gt;</code></td><td>—</td><td>否</td></tr><tr><td><code>appendTo</code></td><td>Template Select 下拉菜单的挂载目标</td><td><code>string</code> | <code>HTMLElement</code></td><td><code>document.body</code></td><td>否</td></tr></tbody></table><h4 id="mention-配置" tabindex="-1">Mention 配置 <a class="header-anchor" href="#mention-配置" aria-label="Permalink to &quot;Mention 配置&quot;">​</a></h4><p>@提及功能扩展，支持快速引用预设的助手或对象，支持自定义触发字符。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 便捷函数（使用默认 &#39;@&#39; 触发）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mentions)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 便捷函数（自定义触发字符）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mentions, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用 &#39;#&#39; 触发</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 标准配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.Mention.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ items: mentions, char: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;@&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, allowSpaces: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span></code></pre></div><table tabindex="0"><thead><tr><th>配置项</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>items</code></td><td>提及项列表；传入 <code>Ref</code> 时会响应后续变化</td><td><code>MentionItem[]</code> | <code>Ref&lt;MentionItem[]&gt;</code></td><td><code>[]</code></td><td>否</td></tr><tr><td><code>char</code></td><td>触发字符，例如 <code>&#39;@&#39;</code>、<code>&#39;#&#39;</code> 或 <code>&#39;!&#39;</code></td><td><code>string</code></td><td><code>&#39;@&#39;</code></td><td>否</td></tr><tr><td><code>allowSpaces</code></td><td>是否允许触发字符后的查询文本包含空格</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>HTMLAttributes</code></td><td>合并到 Mention 节点的 HTML 属性</td><td><code>Record&lt;string, unknown&gt;</code></td><td>—</td><td>否</td></tr></tbody></table><h4 id="suggestion-配置" tabindex="-1">Suggestion 配置 <a class="header-anchor" href="#suggestion-配置" aria-label="Permalink to &quot;Suggestion 配置&quot;">​</a></h4><p>智能联想功能扩展，支持自动过滤、自定义过滤和多种高亮方式。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 便捷函数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(suggestions) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 不过滤，显示所有项</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(suggestions, { filterFn: customFilter }) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自定义过滤</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 标准配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TrSender.Suggestion.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  items: suggestions,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  filterFn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">items</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">query</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> items.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> item.content.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">includes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(query)),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  showAutoComplete: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><table tabindex="0"><thead><tr><th>配置项</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>items</code></td><td>建议项列表；传入 <code>Ref</code> 时会响应后续变化</td><td><code>SenderSuggestionItem[]</code> | <code>Ref&lt;SenderSuggestionItem[]&gt;</code></td><td><code>[]</code></td><td>否</td></tr><tr><td><code>filterFn</code></td><td>过滤建议；不提供时直接显示全部条目</td><td><code>(items: SenderSuggestionItem[], query: string) =&gt; SenderSuggestionItem[]</code></td><td>—</td><td>否</td></tr><tr><td><code>showAutoComplete</code></td><td>是否展示当前建议项的自动补全文本与 Tab 提示</td><td><code>boolean</code></td><td><code>true</code></td><td>否</td></tr><tr><td><code>activeSuggestionKeys</code></td><td>确认当前建议项的按键；Tab 的自动补全行为不受此配置控制</td><td><code>string[]</code></td><td><code>[&#39;Enter&#39;]</code></td><td>否</td></tr><tr><td><code>popupWidth</code></td><td>建议弹层宽度；数字按像素处理，也可使用百分比或 CSS 长度</td><td><code>number</code> | <code>string</code></td><td><code>400</code></td><td>否</td></tr><tr><td><code>onSelect</code></td><td>选中回调；返回 <code>false</code> 时阻止默认回填</td><td><code>(item: SenderSuggestionItem) =&gt; void | false</code></td><td>—</td><td>否</td></tr></tbody></table><div class="tip custom-block"><p class="custom-block-title">popupWidth 格式</p><p>支持数字（如 <code>500</code>）、百分比（如 <code>&#39;100%&#39;</code>）、CSS 单位（如 <code>&#39;20rem&#39;</code>）</p></div><p><strong>高亮方式</strong>：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{ </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;ECS-云服务器&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自动匹配</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{ </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;RDS-数据库&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">highlights</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;RDS&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;数据库&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] }  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 精确指定</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{ </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;OSS-存储&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">highlights</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">query</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] }  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自定义函数</span></span></code></pre></div><p><strong>onSelect 回调</strong>：</p><p>选中建议项时触发，返回 <code>false</code> 可阻止默认回填行为：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 默认行为：自动回填</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onSelect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Selected:&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, item)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 不返回 false，内容会自动回填到编辑器</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 阻止默认回填并自定义</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onSelect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  editor.commands.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`前缀-\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">item</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">content</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}-后缀\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 阻止默认回填</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 条件性阻止</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onSelect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (item.data?.needsValidation) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    validateAndFill</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(item)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 否则使用默认回填</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="tip custom-block"><p class="custom-block-title">回调参数</p><p><code>item</code> 包含完整的 <code>SenderSuggestionItem</code> 信息（<code>content</code>、<code>label</code>、<code>data</code>、<code>highlights</code>），可用于应用逻辑处理。</p></div><h4 id="uploadbutton" tabindex="-1">UploadButton <a class="header-anchor" href="#uploadbutton" aria-label="Permalink to &quot;UploadButton&quot;">​</a></h4><p>文件上传按钮组件，支持文件类型过滤、大小限制和数量限制。</p><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>disabled</code></td><td>禁用文件选择；同时会与 Sender 的禁用状态合并</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>accept</code></td><td>传给文件选择器的 MIME 类型或扩展名过滤条件</td><td><code>string</code></td><td><code>&#39;*&#39;</code></td><td>否</td></tr><tr><td><code>multiple</code></td><td>是否允许一次选择多个文件</td><td><code>boolean</code></td><td><code>true</code></td><td>否</td></tr><tr><td><code>reset</code></td><td>选择后是否重置原生文件输入，使同一文件可以再次选择</td><td><code>boolean</code></td><td><code>true</code></td><td>否</td></tr><tr><td><code>max-size</code></td><td>单个文件的大小上限，单位 MB；超限时触发 <code>error</code></td><td><code>number</code></td><td>—</td><td>否</td></tr><tr><td><code>max-count</code></td><td>单次选择的文件数量上限；超限时触发 <code>error</code></td><td><code>number</code></td><td>—</td><td>否</td></tr><tr><td><code>tooltip</code></td><td>按钮的 Tooltip 内容</td><td><code>TooltipContent</code></td><td>—</td><td>否</td></tr><tr><td><code>tooltip-placement</code></td><td>Tooltip 位置</td><td><code>TooltipPlacement</code></td><td><code>&#39;top&#39;</code></td><td>否</td></tr><tr><td><code>icon</code></td><td>未提供图标插槽时使用的图标组件</td><td><code>Component</code></td><td><code>IconImageUpload</code></td><td>否</td></tr><tr><td><code>size</code></td><td>按钮尺寸；数字按像素处理，也可使用 CSS 长度</td><td><code>number | string</code></td><td><code>32px</code>（CSS 默认）</td><td>否</td></tr></tbody></table><h4 id="actionbutton" tabindex="-1">ActionButton <a class="header-anchor" href="#actionbutton" aria-label="Permalink to &quot;ActionButton&quot;">​</a></h4><p>Sender Actions 的基础图标按钮，也可以独立用于自定义操作区。</p><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>icon</code></td><td>未提供 <code>icon</code> 插槽时渲染的图标</td><td><code>VNode | Component</code></td><td>—</td><td>是</td></tr><tr><td><code>disabled</code></td><td>禁用原生按钮</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>active</code></td><td>显示激活样式</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>tooltip</code></td><td>Tooltip 内容</td><td><code>TooltipContent</code></td><td>—</td><td>否</td></tr><tr><td><code>tooltip-placement</code></td><td>Tooltip 位置</td><td><code>TooltipPlacement</code></td><td><code>&#39;top&#39;</code></td><td>否</td></tr><tr><td><code>size</code></td><td><code>small</code>、<code>normal</code>、像素数字或其他 CSS 长度</td><td><code>string | number</code></td><td><code>32px</code>（CSS 默认）</td><td>否</td></tr></tbody></table><h4 id="voicebutton" tabindex="-1">VoiceButton <a class="header-anchor" href="#voicebutton" aria-label="Permalink to &quot;VoiceButton&quot;">​</a></h4><p>语音输入按钮组件，支持浏览器内置语音识别和第三方语音识别服务。</p><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>icon</code></td><td>未录音时的图标</td><td><code>VNode | Component</code></td><td><code>IconVoice</code></td><td>否</td></tr><tr><td><code>recording-icon</code></td><td>录音中的图标</td><td><code>VNode | Component</code></td><td><code>IconRecordingWave</code></td><td>否</td></tr><tr><td><code>disabled</code></td><td>禁用录音按钮；同时会与 Sender 的禁用状态合并</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>size</code></td><td>按钮尺寸</td><td><code>&#39;small&#39; | &#39;normal&#39;</code></td><td><code>normal</code>（32px）</td><td>否</td></tr><tr><td><code>tooltip</code></td><td>按钮的 Tooltip 内容</td><td><code>TooltipContent</code></td><td>—</td><td>否</td></tr><tr><td><code>tooltip-placement</code></td><td>Tooltip 位置</td><td><code>TooltipPlacement</code></td><td><code>&#39;top&#39;</code></td><td>否</td></tr><tr><td><code>speech-config</code></td><td>浏览器或自定义语音处理器配置</td><td><code>SpeechConfig</code></td><td>—</td><td>否</td></tr><tr><td><code>auto-insert</code></td><td>收到最终识别结果时是否插入编辑器</td><td><code>boolean</code></td><td><code>true</code></td><td>否</td></tr><tr><td><code>on-button-click</code></td><td>点击拦截器；调用 <code>preventDefault()</code> 后由应用接管录音开始/停止</td><td><code>(isRecording: boolean, preventDefault: () =&gt; void) =&gt; void | Promise&lt;void&gt;</code></td><td>—</td><td>否</td></tr></tbody></table><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><h4 id="sender-slots" tabindex="-1">Sender Slots <a class="header-anchor" href="#sender-slots" aria-label="Permalink to &quot;Sender Slots&quot;">​</a></h4><table tabindex="0"><thead><tr><th>插槽名</th><th>用途</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>header</code></td><td>在输入区域上方添加内容</td><td>—</td></tr><tr><td><code>prefix</code></td><td>在编辑器左侧添加内容</td><td>—</td></tr><tr><td>input-prefix</td><td>多行模式首行前置插槽</td><td>-</td></tr><tr><td><code>content</code></td><td>完全替换默认编辑器内容</td><td><code>{ editor: unknown }</code></td></tr><tr><td><code>actions-inline</code></td><td>在单行模式的默认操作按钮前添加内容</td><td>—</td></tr><tr><td><code>footer</code></td><td>在多行模式底部左侧添加内容</td><td>—</td></tr><tr><td><code>footer-right</code></td><td>在多行模式底部默认操作按钮前添加内容</td><td>—</td></tr></tbody></table><h4 id="actionbutton-slots" tabindex="-1">ActionButton Slots <a class="header-anchor" href="#actionbutton-slots" aria-label="Permalink to &quot;ActionButton Slots&quot;">​</a></h4><table tabindex="0"><thead><tr><th>插槽名</th><th>用途</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>icon</code></td><td>替换 <code>icon</code> 属性提供的图标</td><td>—</td></tr></tbody></table><h4 id="voicebutton-slots" tabindex="-1">VoiceButton Slots <a class="header-anchor" href="#voicebutton-slots" aria-label="Permalink to &quot;VoiceButton Slots&quot;">​</a></h4><table tabindex="0"><thead><tr><th>插槽名</th><th>用途</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>icon</code></td><td>替换按钮图标；未提供时使用 <code>icon</code> / <code>recording-icon</code></td><td><code>{ isRecording: boolean }</code></td></tr><tr><td><code>recording-overlay</code></td><td>在按钮外渲染自定义录音界面</td><td><code>{ isRecording: boolean; stop: () =&gt; void }</code></td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><h4 id="sender-events" tabindex="-1">Sender Events <a class="header-anchor" href="#sender-events" aria-label="Permalink to &quot;Sender Events&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>触发时机</th><th>回调参数</th></tr></thead><tbody><tr><td><code>update:model-value</code></td><td>编辑器文本变化时触发；受控模式下父组件需要据此更新 <code>model-value</code></td><td><code>(value: string) =&gt; void</code></td></tr><tr><td><code>input</code></td><td>编辑器文本变化时同步通知</td><td><code>(value: string) =&gt; void</code></td></tr><tr><td><code>submit</code></td><td>用户使用当前提交快捷键或调用 <code>submit()</code>，且内容可提交时触发；组件不会自动清空内容</td><td><code>(text: string, data?: StructuredData, extra?: SenderSubmitExtra) =&gt; void</code></td></tr><tr><td><code>clear</code></td><td>用户点击清空按钮或调用 <code>clear()</code>，并且编辑器内容已被清空后触发</td><td><code>() =&gt; void</code></td></tr><tr><td><code>focus</code></td><td>编辑器获得焦点时触发</td><td><code>(event: FocusEvent) =&gt; void</code></td></tr><tr><td><code>blur</code></td><td>编辑器失去焦点时触发</td><td><code>(event: FocusEvent) =&gt; void</code></td></tr><tr><td><code>cancel</code></td><td><code>loading</code> 状态下点击停止操作或调用 <code>cancel()</code> 时触发；应用负责终止外部异步任务并更新 <code>loading</code></td><td><code>() =&gt; void</code></td></tr></tbody></table><div class="tip custom-block"><p class="custom-block-title">submit 事件参数说明</p><ul><li><strong>text</strong>：纯文本内容，适用于简单场景（如直接发送给 AI）</li><li><strong>data</strong>：结构化数据数组，仅在使用 Template 或 Mention 扩展时返回，包含文本和特殊节点的完整信息</li><li><strong>extra</strong>：仅当存在外部 payload 时返回，当前包含 <code>externalPayloads</code></li></ul><p>根据提交数据的复杂度选择使用：</p><ul><li>简单场景：只使用 <code>text</code> 参数</li><li>复杂场景：使用 <code>data</code> 参数提取特殊节点信息或自定义拼接格式</li><li>附件等外部内容：使用 <code>extra.externalPayloads</code> 读取。Sender 只透传外部内容的 <code>source</code> 和 <code>payload</code>，不内置解析特定来源，也不按状态过滤</li></ul><p>详见：<a href="#结构化数据">结构化数据</a></p></div><h4 id="uploadbutton-events" tabindex="-1">UploadButton Events <a class="header-anchor" href="#uploadbutton-events" aria-label="Permalink to &quot;UploadButton Events&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>触发时机</th><th>回调参数</th></tr></thead><tbody><tr><td><code>select</code></td><td>通过数量和大小校验后完成文件选择</td><td><code>(files: File[]) =&gt; void</code></td></tr><tr><td><code>error</code></td><td>文件数量超限或存在超过大小上限的文件时</td><td><code>(error: Error, files?: File[]) =&gt; void</code></td></tr></tbody></table><h4 id="voicebutton-events" tabindex="-1">VoiceButton Events <a class="header-anchor" href="#voicebutton-events" aria-label="Permalink to &quot;VoiceButton Events&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>触发时机</th><th>回调参数</th></tr></thead><tbody><tr><td><code>speech-start</code></td><td>语音处理器开始识别时</td><td><code>() =&gt; void</code></td></tr><tr><td><code>speech-interim</code></td><td>语音处理器返回中间识别结果时</td><td><code>(transcript: string) =&gt; void</code></td></tr><tr><td><code>speech-final</code></td><td>语音处理器返回最终结果时</td><td><code>(transcript: string) =&gt; void</code></td></tr><tr><td><code>speech-end</code></td><td>语音处理器结束时</td><td><code>(transcript?: string) =&gt; void</code></td></tr><tr><td><code>speech-error</code></td><td>语音处理器报告错误时</td><td><code>(error: Error) =&gt; void</code></td></tr></tbody></table><h3 id="methods-expose" tabindex="-1">Methods / Expose <a class="header-anchor" href="#methods-expose" aria-label="Permalink to &quot;Methods / Expose&quot;">​</a></h3><h4 id="sender-methods-expose" tabindex="-1">Sender Methods / Expose <a class="header-anchor" href="#sender-methods-expose" aria-label="Permalink to &quot;Sender Methods / Expose&quot;">​</a></h4><table tabindex="0"><thead><tr><th>公开成员</th><th>说明</th><th>签名</th></tr></thead><tbody><tr><td><code>focus</code></td><td>将焦点移入编辑器</td><td><code>() =&gt; void</code></td></tr><tr><td><code>blur</code></td><td>使编辑器失去焦点</td><td><code>() =&gt; void</code></td></tr><tr><td><code>clear</code></td><td>清空编辑器内容并触发 <code>clear</code></td><td><code>() =&gt; void</code></td></tr><tr><td><code>submit</code></td><td>内容满足提交条件时触发 <code>submit</code>；不会自动清空内容</td><td><code>() =&gt; void</code></td></tr><tr><td><code>setContent</code></td><td>通过 Tiptap 替换编辑器全部内容；字符串可包含纯文本或 HTML</td><td><code>(content: string) =&gt; void</code></td></tr><tr><td><code>getContent</code></td><td>读取编辑器的纯文本内容</td><td><code>() =&gt; string</code></td></tr><tr><td><code>cancel</code></td><td>触发 <code>cancel</code>；应用仍需终止外部任务并同步 <code>loading</code></td><td><code>() =&gt; void</code></td></tr><tr><td><code>editor</code></td><td>当前 Tiptap 编辑器引用；挂载完成前可能为 <code>undefined</code></td><td><code>Ref&lt;Editor | undefined&gt;</code></td></tr></tbody></table><h4 id="uploadbutton-methods" tabindex="-1">UploadButton Methods <a class="header-anchor" href="#uploadbutton-methods" aria-label="Permalink to &quot;UploadButton Methods&quot;">​</a></h4><table tabindex="0"><thead><tr><th>公开成员</th><th>说明</th><th>签名</th></tr></thead><tbody><tr><td><code>open</code></td><td>打开文件选择器</td><td><code>() =&gt; Promise&lt;void&gt;</code></td></tr></tbody></table><h4 id="voicebutton-methods" tabindex="-1">VoiceButton Methods <a class="header-anchor" href="#voicebutton-methods" aria-label="Permalink to &quot;VoiceButton Methods&quot;">​</a></h4><table tabindex="0"><thead><tr><th>公开成员</th><th>说明</th><th>签名或类型</th></tr></thead><tbody><tr><td><code>start</code></td><td>请求语音处理器开始识别</td><td><code>() =&gt; void</code></td></tr><tr><td><code>stop</code></td><td>停止识别并释放处理器</td><td><code>() =&gt; void</code></td></tr><tr><td><code>speechState</code></td><td>当前录音、支持性与错误状态</td><td><code>SpeechState</code></td></tr></tbody></table><h3 id="composables" tabindex="-1">Composables <a class="header-anchor" href="#composables" aria-label="Permalink to &quot;Composables&quot;">​</a></h3><table tabindex="0"><thead><tr><th>函数</th><th>用途</th><th>签名与行为</th></tr></thead><tbody><tr><td><code>useSenderContext</code></td><td>在 Sender 内部的自定义子组件中读取编辑器、状态和操作</td><td><code>() =&gt; SenderContext</code>；必须在 <code>TrSender</code> 组件树内调用，否则抛出错误</td></tr><tr><td><code>useSenderContentRegistration</code></td><td>为 Sender 注册附件等不写入编辑器的外部提交内容</td><td><code>() =&gt; SenderContentRegister | undefined</code>；不在 <code>TrSender</code> 内时返回 <code>undefined</code></td></tr></tbody></table><p><code>useSenderContentRegistration()</code> 返回的注册函数接收稳定的 <code>source</code> 和普通值、Ref 或 Getter 形式的 <code>payload</code>，并返回注销函数。Sender 会持续读取响应式 payload；提交时复制当前注册项，作为 <code>extra.externalPayloads</code> 传给 <code>submit</code>。注册组件卸载时必须调用注销函数；<code>TrAttachments</code> 已在内部完成注册与清理。</p><h3 id="结构化数据" tabindex="-1">结构化提交数据 <a class="header-anchor" href="#结构化数据" aria-label="Permalink to &quot;结构化提交数据 {#结构化数据}&quot;">​</a></h3><p>当使用 <code>Template</code> 或 <code>Mention</code> 扩展时，<code>submit</code> 事件的第二个参数 <code>data</code> 返回结构化数据数组。</p><p><strong>使用建议</strong>：</p><ul><li>简单场景：使用 <code>text</code> 参数（纯文本）</li><li>复杂场景：使用 <code>data</code> 参数提取特殊节点或自定义格式</li></ul><h4 id="mention-扩展" tabindex="-1">Mention 扩展 <a class="header-anchor" href="#mention-扩展" aria-label="Permalink to &quot;Mention 扩展&quot;">​</a></h4><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> handleSubmit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> StructuredData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // text: &quot;帮我分析 @张三 的周报&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // data: [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  //   { type: &#39;text&#39;, content: &#39;帮我分析 &#39; },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  //   { type: &#39;mention&#39;, content: &#39;张三&#39;, value: &#39;用户ID&#39; },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  //   { type: &#39;text&#39;, content: &#39; 的周报&#39; }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // ]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 提取提及项</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> mentions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> data?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> item.type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;mention&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> []</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 自定义格式（如 Slack 风格）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> customText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> data?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (item.type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;mention&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ?</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`&lt;@\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">item</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">value</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}&gt;\`</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> :</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> item.content)).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">join</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="template-扩展" tabindex="-1">Template 扩展 <a class="header-anchor" href="#template-扩展" aria-label="Permalink to &quot;Template 扩展&quot;">​</a></h4><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> handleSubmit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> StructuredData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // text: &quot;帮我分析 张三 的周报&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // data: [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  //   { type: &#39;text&#39;, content: &#39;帮我分析 &#39; },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  //   { type: &#39;block&#39;, content: &#39;张三&#39; },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  //   { type: &#39;text&#39;, content: &#39; 的周报&#39; }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // ]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 提取模板块</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> blocks</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> data?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> item.type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;block&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> []</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 自定义格式（如 Mustache 风格）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> customText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> data?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (item.type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;block&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ?</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`{{\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">item</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">content</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}}}\`</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> :</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> item.content)).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">join</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>类型定义</strong>：详见 <a href="#types">Types - StructuredData</a></p><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><p>以下类型均从 <code>@opentiny/tiny-robot</code> 导出。索引按用途和支持级别分组：推荐公共类型可直接用于应用集成；高级类型服务于公开组合式函数。</p><h4 id="推荐公共类型" tabindex="-1">推荐公共类型 <a class="header-anchor" href="#推荐公共类型" aria-label="Permalink to &quot;推荐公共类型&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型名</th><th>类别</th><th>类型或签名</th><th>说明</th></tr></thead><tbody><tr><td><code>SenderProps</code></td><td>组件 Props</td><td><code>interface</code></td><td>Sender 属性</td></tr><tr><td><code>SenderEmits</code></td><td>组件 Events</td><td><code>interface</code></td><td>Sender 事件</td></tr><tr><td><code>SenderSlots</code></td><td>组件 Slots</td><td><code>interface</code></td><td>Sender 插槽</td></tr><tr><td><code>SenderExternalPayload</code></td><td>提交数据</td><td><code>interface</code></td><td>单个外部提交内容</td></tr><tr><td><code>SenderSubmitExtra</code></td><td>提交数据</td><td><code>interface</code></td><td><code>submit</code> 的额外提交数据</td></tr><tr><td><code>InputMode</code></td><td>Prop 类型</td><td><code>&#39;single&#39; | &#39;multiple&#39;</code></td><td>输入布局模式</td></tr><tr><td><code>SubmitTrigger</code></td><td>Prop 类型</td><td><code>&#39;enter&#39; | &#39;ctrlEnter&#39; | &#39;shiftEnter&#39;</code></td><td>提交快捷键模式</td></tr><tr><td><code>EnterKeyHint</code></td><td>Prop 类型</td><td>HTML <code>enterkeyhint</code> 联合类型</td><td>移动端虚拟键盘提示</td></tr><tr><td><code>AutoSize</code></td><td>Prop 类型</td><td><code>boolean | { minRows: number; maxRows: number }</code></td><td>多行编辑器高度范围</td></tr><tr><td><code>DefaultActions</code></td><td>配置对象</td><td><code>interface</code></td><td>默认提交和清空按钮配置</td></tr><tr><td><code>StructuredData</code></td><td>结构化数据</td><td><code>TemplateItem[] | MentionStructuredItem[]</code></td><td>Template 或 Mention 的结构化提交数据</td></tr><tr><td><code>SelectOption</code></td><td>Template 数据</td><td><code>interface</code></td><td>Template 选择项</td></tr><tr><td><code>TemplateItem</code></td><td>Template 数据</td><td><code>type</code></td><td>文本、可编辑块或选择器模板项</td></tr><tr><td><code>MentionItem</code></td><td>Mention 数据</td><td><code>interface</code></td><td>Mention 输入项</td></tr><tr><td><code>SenderSuggestionItem</code></td><td>Suggestion 数据</td><td><code>interface</code></td><td>Suggestion 输入项</td></tr><tr><td><code>SuggestionOptions</code></td><td>扩展配置</td><td><code>interface</code></td><td>Suggestion 扩展配置</td></tr><tr><td><code>SuggestionState</code></td><td>扩展状态</td><td><code>interface</code></td><td>Suggestion 插件状态</td></tr><tr><td><code>SuggestionTextPart</code></td><td>高亮数据</td><td><code>interface</code></td><td>建议文本的高亮片段</td></tr><tr><td><code>HighlightFunction</code></td><td>扩展回调</td><td><code>(suggestionText: string, inputText: string) =&gt; SuggestionTextPart[]</code></td><td>自定义建议高亮函数</td></tr><tr><td><code>ActionButtonProps</code></td><td>组件 Props</td><td><code>interface</code></td><td>Sender Action 基础按钮属性</td></tr><tr><td><code>UploadButtonProps</code></td><td>组件 Props</td><td><code>interface</code></td><td>上传按钮属性</td></tr><tr><td><code>UploadButtonEmits</code></td><td>组件 Events</td><td><code>interface</code></td><td>上传按钮事件</td></tr><tr><td><code>VoiceButtonProps</code></td><td>组件 Props</td><td><code>interface</code></td><td>语音按钮属性</td></tr><tr><td><code>VoiceButtonEmits</code></td><td>组件 Events</td><td><code>interface</code></td><td>语音按钮事件</td></tr><tr><td><code>TooltipContent</code></td><td>Prop 类型</td><td><code>string | (() =&gt; string | VNode)</code></td><td>Sender Action 的 Tooltip 内容</td></tr><tr><td><code>TooltipPlacement</code></td><td>Prop 类型</td><td><code>type</code></td><td>Tooltip 方位联合类型</td></tr><tr><td><code>SpeechCallbacks</code></td><td>语音回调</td><td><code>interface</code></td><td>语音处理过程回调</td></tr><tr><td><code>SpeechHandler</code></td><td>服务接口</td><td><code>interface</code></td><td>可替换的语音处理器</td></tr><tr><td><code>SpeechConfig</code></td><td>配置对象</td><td><code>interface</code></td><td>语音识别配置</td></tr><tr><td><code>SpeechState</code></td><td>状态对象</td><td><code>interface</code></td><td>语音识别状态</td></tr></tbody></table><h4 id="高级组合式-api-类型" tabindex="-1">高级组合式 API 类型 <a class="header-anchor" href="#高级组合式-api-类型" aria-label="Permalink to &quot;高级组合式 API 类型&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型名</th><th>对应入口</th><th>类型或签名</th><th>说明</th></tr></thead><tbody><tr><td><code>SenderContext</code> / <code>UseSenderContextReturn</code></td><td><code>useSenderContext</code></td><td><code>interface</code> / <code>SenderContext</code></td><td>Sender 上下文及其返回类型别名</td></tr><tr><td><code>SenderContentRegister</code></td><td><code>useSenderContentRegistration</code></td><td><code>(source: string, payload: MaybeRefOrGetter&lt;unknown&gt;) =&gt; () =&gt; void</code></td><td>注册外部内容并返回注销函数</td></tr></tbody></table><h4 id="常用字段" tabindex="-1">常用字段 <a class="header-anchor" href="#常用字段" aria-label="Permalink to &quot;常用字段&quot;">​</a></h4><p><code>SenderSuggestionItem</code>：</p><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>必填</th></tr></thead><tbody><tr><td><code>content</code></td><td>用于匹配和默认回填的建议内容</td><td><code>string</code></td><td>是</td></tr><tr><td><code>label</code></td><td>可选元数据；当前列表展示和默认回填仍使用 <code>content</code></td><td><code>string</code></td><td>否</td></tr><tr><td><code>highlights</code></td><td>精确片段或自定义高亮函数</td><td><code>string[] | HighlightFunction</code></td><td>否</td></tr><tr><td><code>data</code></td><td>应用附加数据</td><td><code>Record&lt;string, unknown&gt;</code></td><td>否</td></tr></tbody></table><p><code>MentionItem</code>：</p><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>必填</th></tr></thead><tbody><tr><td><code>id</code></td><td>提及项标识；未提供时由组件生成</td><td><code>string</code></td><td>否</td></tr><tr><td><code>label</code></td><td>列表和编辑器中显示的名称</td><td><code>string</code></td><td>是</td></tr><tr><td><code>value</code></td><td>提交到结构化数据中的关联值</td><td><code>string</code></td><td>是</td></tr><tr><td><code>icon</code></td><td>列表中显示的图标地址</td><td><code>string</code></td><td>否</td></tr></tbody></table><p><code>SelectOption</code>：</p><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>必填</th></tr></thead><tbody><tr><td><code>label</code></td><td>显示文本</td><td><code>string</code></td><td>是</td></tr><tr><td><code>value</code></td><td>选择后的值</td><td><code>string</code></td><td>是</td></tr><tr><td><code>data</code></td><td>应用附加字符串</td><td><code>string</code></td><td>否</td></tr></tbody></table><p><code>SenderSubmitExtra</code> 只在存在已注册外部内容时传给 <code>submit</code>：</p><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>必填</th></tr></thead><tbody><tr><td><code>externalPayloads</code></td><td>当前外部内容的快照</td><td><code>SenderExternalPayload[]</code></td><td>是</td></tr></tbody></table><p><code>SenderExternalPayload</code>：</p><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>必填</th></tr></thead><tbody><tr><td><code>source</code></td><td>注册来源的稳定标识</td><td><code>string</code></td><td>是</td></tr><tr><td><code>payload</code></td><td>由对应来源定义的原始数据</td><td><code>unknown</code></td><td>是</td></tr></tbody></table><p><code>DefaultActions</code>：</p><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>必填</th></tr></thead><tbody><tr><td><code>submit.disabled</code></td><td>禁用默认提交按钮，并参与 Sender 的 <code>canSubmit</code> 计算</td><td><code>boolean</code></td><td>否</td></tr><tr><td><code>submit.tooltip</code></td><td>提交按钮 Tooltip</td><td><code>TooltipContent</code></td><td>否</td></tr><tr><td><code>submit.tooltipPlacement</code></td><td>提交按钮 Tooltip 位置</td><td><code>TooltipPlacement</code></td><td>否</td></tr><tr><td><code>clear.disabled</code></td><td>禁用默认清空按钮</td><td><code>boolean</code></td><td>否</td></tr><tr><td><code>clear.tooltip</code></td><td>清空按钮 Tooltip</td><td><code>TooltipContent</code></td><td>否</td></tr><tr><td><code>clear.tooltipPlacement</code></td><td>清空按钮 Tooltip 位置</td><td><code>TooltipPlacement</code></td><td>否</td></tr></tbody></table><p><code>SpeechConfig</code>：</p><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>customHandler</code></td><td>替换浏览器内置识别器；处理器负责支持性检查、启动、停止和资源清理</td><td><code>SpeechHandler</code></td><td>浏览器 Web Speech 处理器</td></tr><tr><td><code>lang</code></td><td>浏览器内置识别器使用的语言</td><td><code>string</code></td><td><code>navigator.language</code></td></tr><tr><td><code>continuous</code></td><td>浏览器内置识别器是否持续识别</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td><code>interimResults</code></td><td>浏览器内置识别器是否返回中间结果</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td><code>autoReplace</code></td><td>公开类型中的兼容字段；当前 <code>VoiceButton</code> 和内置处理器不会读取该值</td><td><code>boolean</code></td><td>—</td></tr><tr><td><code>onVoiceButtonClick</code></td><td>公开类型中的兼容字段；当前点击拦截应使用 <code>VoiceButton</code> 的 <code>on-button-click</code> Prop</td><td><code>(isRecording: boolean, preventDefault: () =&gt; void) =&gt; void | Promise&lt;void&gt;</code></td><td>—</td></tr></tbody></table><p><code>SpeechHandler</code> 的完整接口如下。<code>start</code> 应通过回调报告识别过程；<code>stop</code> 必须停止录音、网络连接和计时器等外部资源。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechHandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  start</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">callbacks</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechCallbacks</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  stop</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  isSupported</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><code>SenderContext</code> 是 <code>useSenderContext()</code> 的完整返回类型。常用字段按职责分组如下；所有状态字段都是响应式 <code>Ref</code>。</p><table tabindex="0"><thead><tr><th>分组</th><th>字段</th></tr></thead><tbody><tr><td>编辑器</td><td><code>editor</code>、<code>editorRef</code></td></tr><tr><td>输入与布局状态</td><td><code>mode</code>、<code>isAutoSwitching</code>、<code>disabled</code>、<code>loading</code>、<code>size</code></td></tr><tr><td>提交派生状态</td><td><code>hasContent</code>、<code>hasEditorContent</code>、<code>canSubmit</code>、<code>isOverLimit</code>、<code>characterCount</code></td></tr><tr><td>配置状态</td><td><code>maxLength</code>、<code>showWordLimit</code>、<code>clearable</code>、<code>defaultActions</code>、<code>submitType</code>、<code>stopText</code></td></tr><tr><td>动作</td><td><code>submit</code>、<code>clear</code>、<code>cancel</code>、<code>focus</code>、<code>blur</code>、<code>setContent</code>、<code>getContent</code></td></tr></tbody></table><p>Context 动作与同名 Expose 方法具有相同行为；它们会修改编辑器内部状态或触发对应事件，但不会替应用结束外部请求，也不会在提交后自动清空受控值。</p><h3 id="css-variables" tabindex="-1">CSS Variables <a class="header-anchor" href="#css-variables" aria-label="Permalink to &quot;CSS Variables&quot;">​</a></h3><p>以下变量由公共主题样式声明。颜色标为“主题值”时，会随 <code>ThemeProvider</code> 的明暗主题切换；其余值可在 Sender 的样式作用域中覆盖。Tooltip 弹层通常挂载到全局层级，因此 <code>--tr-sender-tooltip-gap</code> 应设置在 <code>:root</code> 或全局主题作用域。</p><p><strong>容器、文本与状态</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-sender-bg-color</code></td><td>Sender 背景色</td><td><code>var(--tr-container-bg-default)</code></td></tr><tr><td><code>--tr-sender-bg-color-disabled</code></td><td>禁用时的背景色</td><td>主题值</td></tr><tr><td><code>--tr-sender-text-color</code></td><td>编辑器文字颜色</td><td><code>var(--tr-text-primary)</code></td></tr><tr><td><code>--tr-sender-text-color-disabled</code></td><td>禁用时的文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-placeholder-color</code></td><td>占位文字颜色</td><td><code>var(--tr-text-tertiary)</code></td></tr><tr><td><code>--tr-sender-placeholder-color-disabled</code></td><td>禁用时的占位文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-box-shadow</code></td><td>Sender 阴影</td><td>主题值</td></tr><tr><td><code>--tr-sender-header-border-bottom</code></td><td>Header 分隔线</td><td>主题值</td></tr><tr><td><code>--tr-sender-button-hover-bg</code></td><td>操作按钮悬停背景</td><td><code>var(--tr-container-bg-hover)</code></td></tr><tr><td><code>--tr-sender-button-active-bg</code></td><td>操作按钮激活背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-word-limit-color</code></td><td>字数统计文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-word-limit-error-color</code></td><td>超出字数限制时的颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-transition-duration</code></td><td>容器状态过渡时长</td><td><code>0.2s</code></td></tr></tbody></table><p><strong>尺寸与布局</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-sender-font-size</code></td><td>编辑器字号</td><td><code>16px</code></td></tr><tr><td><code>--tr-sender-line-height</code></td><td>编辑器行高</td><td><code>26px</code></td></tr><tr><td><code>--tr-sender-border-radius</code></td><td>Sender 圆角</td><td><code>26px</code></td></tr><tr><td><code>--tr-sender-padding</code></td><td>单行模式主区域内边距</td><td><code>15px 20px</code></td></tr><tr><td><code>--tr-sender-gap</code></td><td>同一区域内的元素间距</td><td><code>8px</code></td></tr><tr><td><code>--tr-sender-footer-gap</code></td><td>Footer 左右区域间距</td><td><code>12px</code></td></tr><tr><td><code>--tr-sender-header-padding</code></td><td>Header 内边距</td><td><code>12px 20px</code></td></tr><tr><td><code>--tr-sender-header-divider-inset</code></td><td>Header 分隔线左右缩进</td><td><code>20px</code></td></tr><tr><td><code>--tr-sender-multi-main-padding</code></td><td>多行模式主输入区内边距</td><td><code>16px 20px 12px</code></td></tr><tr><td><code>--tr-sender-footer-padding</code></td><td>Footer 内边距</td><td><code>0 10px 10px</code></td></tr><tr><td><code>--tr-sender-prefix-padding-right</code></td><td>Prefix 右内边距</td><td><code>4px</code></td></tr><tr><td><code>--tr-sender-actions-padding-right</code></td><td>单行操作区右内边距</td><td><code>10px</code></td></tr><tr><td><code>--tr-sender-button-size</code></td><td>普通操作按钮尺寸</td><td><code>32px</code></td></tr><tr><td><code>--tr-sender-button-size-submit</code></td><td>提交按钮尺寸</td><td><code>36px</code></td></tr><tr><td><code>--tr-sender-action-button-size</code></td><td>ActionButton 在 Sender 内的尺寸</td><td><code>var(--tr-sender-button-size, 32px)</code></td></tr><tr><td><code>--tr-sender-action-button-padding</code></td><td>ActionButton 内边距</td><td><code>4px</code></td></tr><tr><td><code>--tr-sender-action-gap</code></td><td>相邻普通操作按钮间距</td><td><code>4px</code></td></tr><tr><td><code>--tr-sender-action-submit-gap</code></td><td>普通操作区与提交按钮间距</td><td><code>12px</code></td></tr><tr><td><code>--tr-sender-tooltip-gap</code></td><td>Tooltip 与触发按钮的间距</td><td><code>8px</code></td></tr></tbody></table><p>当 <code>size=&quot;small&quot;</code> 时，组件把下列基础变量映射到对应的 <code>-small</code> 变量。未列出 <code>-small</code> 版本的颜色和布局变量继续继承普通值。</p><table tabindex="0"><thead><tr><th>变量名</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-sender-font-size-small</code></td><td><code>14px</code></td></tr><tr><td><code>--tr-sender-line-height-small</code></td><td><code>24px</code></td></tr><tr><td><code>--tr-sender-border-radius-small</code></td><td><code>24px</code></td></tr><tr><td><code>--tr-sender-padding-small</code></td><td><code>12px 16px</code></td></tr><tr><td><code>--tr-sender-footer-gap-small</code></td><td><code>8px</code></td></tr><tr><td><code>--tr-sender-header-padding-small</code></td><td><code>12px 16px</code></td></tr><tr><td><code>--tr-sender-multi-main-padding-small</code></td><td><code>14px 16px 10px</code></td></tr><tr><td><code>--tr-sender-footer-padding-small</code></td><td><code>0 10px 10px</code></td></tr><tr><td><code>--tr-sender-button-size-small</code></td><td><code>28px</code></td></tr><tr><td><code>--tr-sender-button-size-submit-small</code></td><td><code>32px</code></td></tr><tr><td><code>--tr-sender-prefix-padding-right-small</code></td><td><code>4px</code></td></tr><tr><td><code>--tr-sender-actions-padding-right-small</code></td><td><code>8px</code></td></tr></tbody></table><p><strong>Suggestion</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-suggestion-bg-color</code></td><td>建议弹层背景</td><td>主题值</td></tr><tr><td><code>--tr-suggestion-box-shadow-color</code></td><td>建议弹层阴影颜色</td><td>主题值</td></tr><tr><td><code>--tr-suggestion-text-color</code></td><td>建议文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-suggestion-hover-bg-color</code></td><td>建议项悬停背景</td><td>主题值</td></tr><tr><td><code>--tr-suggestion-scrollbar-thumb-color</code></td><td>滚动条滑块颜色</td><td>主题值</td></tr><tr><td><code>--tr-suggestion-scrollbar-thumb-hover-color</code></td><td>滚动条滑块悬停颜色</td><td>主题值</td></tr><tr><td><code>--tr-suggestion-item-font-size</code></td><td>建议项字号</td><td><code>14px</code></td></tr><tr><td><code>--tr-suggestion-item-icon-size</code></td><td>建议项图标尺寸</td><td><code>16px</code></td></tr><tr><td><code>--tr-suggestion-autocomplete-color</code></td><td>自动补全文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-suggestion-tab-hint-border</code></td><td>Tab 提示边框</td><td>主题值</td></tr><tr><td><code>--tr-suggestion-tab-hint-color</code></td><td>Tab 提示文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-suggestion-tab-hint-bg</code></td><td>Tab 提示背景</td><td>主题值</td></tr></tbody></table><p><strong>Mention</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-sender-mention-color</code></td><td>Mention 节点文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-bg</code></td><td>Mention 节点背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-hover-bg</code></td><td>Mention 节点悬停背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-list-bg</code></td><td>Mention 列表背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-list-shadow</code></td><td>Mention 列表阴影</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-text-primary</code></td><td>Mention 列表主要文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-text-secondary</code></td><td>Mention 列表次要文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-text-tertiary</code></td><td>Mention 列表辅助文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-item-hover-bg</code></td><td>Mention 条目悬停背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-item-selected-bg</code></td><td>Mention 条目选中背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-scrollbar-thumb</code></td><td>Mention 滚动条滑块颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-scrollbar-thumb-hover</code></td><td>Mention 滚动条滑块悬停颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-mention-trigger-bg</code></td><td>触发字符背景</td><td>主题值</td></tr></tbody></table><p><strong>Template</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-sender-template-color</code></td><td>可编辑模板块文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-bg</code></td><td>可编辑模板块背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-border-radius</code></td><td>可编辑模板块圆角</td><td><code>6px</code></td></tr><tr><td><code>--tr-sender-template-padding</code></td><td>可编辑模板块内边距</td><td><code>2px 4px</code></td></tr><tr><td><code>--tr-sender-template-margin</code></td><td>可编辑模板块外边距</td><td><code>0 4px</code></td></tr><tr><td><code>--tr-sender-template-min-width</code></td><td>可编辑模板块最小宽度</td><td><code>32px</code></td></tr><tr><td><code>--tr-sender-template-select-color</code></td><td>模板选择器文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-placeholder-color</code></td><td>模板选择器占位文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-bg</code></td><td>模板选择器背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-bg-hover</code></td><td>模板选择器悬停背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-bg-active</code></td><td>模板选择器激活背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-dropdown-bg</code></td><td>模板下拉菜单背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-dropdown-shadow</code></td><td>模板下拉菜单阴影</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-text-primary</code></td><td>模板下拉菜单主要文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-text-secondary</code></td><td>模板下拉菜单次要文字颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-option-hover-bg</code></td><td>模板选项悬停背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-option-selected-bg</code></td><td>模板选项选中背景</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-scrollbar-thumb</code></td><td>模板下拉菜单滚动条颜色</td><td>主题值</td></tr><tr><td><code>--tr-sender-template-select-scrollbar-thumb-hover</code></td><td>模板下拉菜单滚动条悬停颜色</td><td>主题值</td></tr></tbody></table><h2 id="迁移与弃用" tabindex="-1">迁移与弃用 <a class="header-anchor" href="#迁移与弃用" aria-label="Permalink to &quot;迁移与弃用&quot;">​</a></h2><h3 id="升级路径" tabindex="-1">升级路径 <a class="header-anchor" href="#升级路径" aria-label="Permalink to &quot;升级路径&quot;">​</a></h3><ul><li><strong>快速迁移</strong>：使用 <code>SenderCompat</code> 保持大部分 v0.3.x API 兼容，再处理少量破坏性变更。请查看 <a href="./sender-compat.html">SenderCompat 快速迁移指南</a>。</li><li><strong>完全升级</strong>：直接采用当前 Sender API，按照 <a href="./sender-compat.html#完整迁移方案">完整迁移方案</a> 调整扩展、按钮、事件与主题接入。</li></ul><h3 id="_1-0-保留的弃用-api" tabindex="-1">1.0 保留的弃用 API <a class="header-anchor" href="#_1-0-保留的弃用-api" aria-label="Permalink to &quot;1.0 保留的弃用 API&quot;">​</a></h3><p><code>has-external-content</code> 在 1.0 中仍保留兼容，但不推荐新代码继续使用。它只能让空文本进入可提交状态，不会生成 <code>externalPayloads</code>；请改用 <code>useSenderContentRegistration</code>，或将 <code>TrAttachments</code> 放在 <code>TrSender</code> 内自动注册附件内容。</p><h3 id="已移除的-api" tabindex="-1">v0.4 已移除的 API <a class="header-anchor" href="#已移除的-api" aria-label="Permalink to &quot;v0.4 已移除的 API {#已移除的-api}&quot;">​</a></h3><p>以下列表集中记录 v0.4 已移除的入口及替代方案。</p><h4 id="props-1" tabindex="-1">Props <a class="header-anchor" href="#props-1" aria-label="Permalink to &quot;Props&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>原说明</th><th>替代方案</th></tr></thead><tbody><tr><td>allowSpeech</td><td>是否开启语音输入</td><td><a href="./sender-compat.html#语音输入迁移">使用 VoiceButton 组件</a></td></tr><tr><td>speech</td><td>语音识别配置</td><td><a href="./sender-compat.html#语音输入迁移">使用 VoiceButton.speechConfig</a></td></tr><tr><td>allowFiles</td><td>是否允许文件上传</td><td><a href="./sender-compat.html#文件上传迁移">使用 UploadButton 组件</a></td></tr><tr><td>buttonGroup</td><td>按钮组配置</td><td><a href="./sender-compat.html#按钮配置迁移">使用 defaultActions 和插槽</a></td></tr><tr><td>theme</td><td>主题样式</td><td><a href="./sender-compat.html#主题迁移">使用 ThemeProvider 包裹</a></td></tr><tr><td>suggestions</td><td>输入建议列表</td><td><a href="./sender-compat.html#联想迁移">使用 Suggestion 扩展</a></td></tr><tr><td>suggestionPopupWidth</td><td>建议弹窗宽度</td><td><a href="./sender-compat.html#联想迁移">使用 Suggestion 扩展配置</a></td></tr><tr><td>activeSuggestionKeys</td><td>激活建议项的按键</td><td><a href="./sender-compat.html#联想迁移">使用 Suggestion 扩展配置</a></td></tr><tr><td>templateData</td><td>模板数据</td><td><a href="./sender-compat.html#模板迁移">使用 Template 扩展</a></td></tr></tbody></table><h4 id="slots-1" tabindex="-1">Slots <a class="header-anchor" href="#slots-1" aria-label="Permalink to &quot;Slots&quot;">​</a></h4><table tabindex="0"><thead><tr><th>插槽名称</th><th>替代方案</th></tr></thead><tbody><tr><td>actions</td><td>改用 <code>actions-inline</code></td></tr><tr><td>footer-left</td><td>改用 <code>footer</code></td></tr><tr><td>decorativeContent</td><td>改用 <code>disabled</code> + <code>content</code></td></tr></tbody></table><h4 id="events-1" tabindex="-1">Events <a class="header-anchor" href="#events-1" aria-label="Permalink to &quot;Events&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>替代方案</th></tr></thead><tbody><tr><td>change</td><td>使用 <code>blur</code> 事件</td></tr><tr><td>files-selected</td><td>使用 <code>UploadButton</code> 的 <code>select</code> 事件</td></tr><tr><td>speech-start</td><td>使用 <code>VoiceButton</code> 的 <code>speech-start</code> 事件</td></tr><tr><td>speech-end</td><td>使用 <code>VoiceButton</code> 的 <code>speech-end</code> 事件</td></tr><tr><td>speech-interim</td><td>使用 <code>VoiceButton</code> 的 <code>speech-interim</code> 事件</td></tr><tr><td>speech-error</td><td>使用 <code>VoiceButton</code> 的 <code>speech-error</code> 事件</td></tr><tr><td>suggestion-select</td><td>使用 <code>Suggestion</code> 扩展的 <code>onSelect</code> 回调</td></tr></tbody></table><h4 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h4><table tabindex="0"><thead><tr><th>方法名</th><th>替代方案</th></tr></thead><tbody><tr><td>startSpeech</td><td>使用 <code>VoiceButton.start()</code></td></tr><tr><td>stopSpeech</td><td>使用 <code>VoiceButton.stop()</code></td></tr><tr><td>activateTemplateFirstField</td><td>自动处理，无需调用</td></tr></tbody></table>`,125))])}}});export{ht as __pageData,ut as default};

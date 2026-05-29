const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/size.aMt5rjRc.js","assets/chunks/theme.BDSlIIn-.js","assets/chunks/framework.6DE2p-7l.js","assets/chunks/methods-demo.fpivG3Qd.js","assets/chunks/custom-slots.BrpsIpfR.js","assets/chunks/submit-type.D1BMv_L3.js","assets/chunks/cancel-event.DWxkxIm6.js","assets/chunks/actions-enhanced.DL4FGpQ7.js","assets/chunks/actions-config-basic.B5CbtP-U.js","assets/chunks/voice-custom-ui.RLSJJk8g.js","assets/chunks/voice-custom.CTDHKvVq.js","assets/chunks/voice-input.CvaxU7fy.js","assets/chunks/suggestion-highlight.iIf-qRTw.js","assets/chunks/suggestion-filter.AtE-97Wo.js","assets/chunks/suggestion-basic.CkCDxHv7.js","assets/chunks/mention.BLn6BhRB.js","assets/chunks/template-editor.BrDDHLDN.js","assets/chunks/word-limit.B1hNfASy.js","assets/chunks/loading-state.D9oxg96j.js","assets/chunks/mode-switch.Crf7Mm8v.js"])))=>i.map(i=>d[i]);
import{aV as o,_ as p,bg as X,b1 as V,G as P,O as m,cn as r,cb as h,Q as s,bH as n,cl as a,N as c,y as l,P as k,bq as u,bb as z}from"./chunks/framework.6DE2p-7l.js";import{L as g,N as y}from"./chunks/index.DWSLKOW8.js";const R=`<script setup lang="ts">
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
`,L=`<script setup lang="ts">
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
`,G=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, UploadButton } from '@opentiny/tiny-robot'
import { IconSearch, IconThink, IconAi } from '@opentiny/tiny-robot-svgs'

const content = ref('')
const message = ref('')

const handleSubmit = (value: string) => {
  message.value = \`已提交: \${value}\`
  setTimeout(() => (message.value = ''), 3000)
}

const handleDeepThink = () => {
  message.value = '启动深度思考模式...'
  setTimeout(() => (message.value = ''), 3000)
}

const handleEmoji = () => {
  message.value = '打开网络搜索...'
  setTimeout(() => (message.value = ''), 3000)
}
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
        <button class="search-btn" @click="handleEmoji">
          <IconSearch />
          网络搜索
        </button>
      </template>

      <template #prefix>
        <IconAi :style="{ fontSize: '26px' }" />
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
.emoji-btn:hover {
  background: #f5f5f5;
  border-color: #1476ff;
  color: #1476ff;
}

.message {
  margin-top: 15px;
  padding: 10px;
  background: #e7f3ff;
  border-radius: 6px;
  color: #1476ff;
}
</style>
`,M=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, type SubmitTrigger } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')
const submitType = ref<SubmitTrigger>('enter')

const handleSubmit = (value: string) => {
  submittedContent.value = value
  console.log('提交内容:', value)
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
`,Y=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const content = ref('')
const loading = ref(false)
const message = ref('')

const handleSubmit = (text: string) => {
  loading.value = true
  message.value = '正在处理...'

  // 模拟 AI 响应
  setTimeout(() => {
    loading.value = false
    message.value = \`AI 回复: 收到您的消息 "\${text}"\`
    content.value = ''
  }, 3000)
}

const handleCancel = () => {
  loading.value = false
  message.value = '❌ 已取消响应'
  setTimeout(() => (message.value = ''), 2000)
}
<\/script>

<template>
  <div class="demo-container">
    <tr-sender
      v-model="content"
      :loading="loading"
      placeholder="输入内容后提交，观察 loading 状态..."
      stop-text="停止响应"
      clearable
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

    <div v-if="message" :class="['message', { error: message.includes('取消') }]">
      {{ message }}
    </div>
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

.message.error {
  background: #fef0f0;
  color: #f56c6c;
}
</style>
`,N=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, UploadButton, VoiceButton } from '@opentiny/tiny-robot'

const content = ref('')
const message = ref('')

const handleSubmit = (text: string) => {
  message.value = \`已提交: \${text}\`
  content.value = ''
  setTimeout(() => (message.value = ''), 3000)
}

const handleFiles = (files: File[]) => {
  message.value = \`选择了 \${files.length} 个文件: \${files.map((f) => f.name).join(', ')}\`
  setTimeout(() => (message.value = ''), 3000)
}

const handleVoiceFinal = (text: string) => {
  content.value += text + ' '
}
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
        <VoiceButton tooltip="语音输入" tooltip-placement="top" @speech-final="handleVoiceFinal" />
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
`,Q=`<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const content = ref('')

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
  alert(\`已提交: \${text}\`)
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
</style>
`,j=`<script setup lang="ts">
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
  speechStatus.value = ''
  interimResult.value = ''
  console.error('语音识别错误:', error)
}

const handleSubmit = (text: string) => {
  console.log('提交内容:', text)
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
`,U=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, VoiceButton } from '@opentiny/tiny-robot'

const voiceMode = ref<'mixed' | 'continuous'>('mixed')
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">模式：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="mixed" v-model="voiceMode" style="cursor: pointer" />
        <span>混合输入</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="continuous" v-model="voiceMode" style="cursor: pointer" />
        <span>连续识别</span>
      </label>
    </div>
    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      {{ voiceMode === 'mixed' ? '语音识别结果追加到输入框，可继续编辑' : '持续识别语音并自动替换内容' }}
    </div>
    <tr-sender
      :key="voiceMode"
      mode="multiple"
      :placeholder="voiceMode === 'mixed' ? '点击麦克风说话，识别结果会追加到此处...' : '点击麦克风开始连续识别...'"
    >
      <template #footer-right>
        <VoiceButton
          :speech-config="
            voiceMode === 'mixed'
              ? { autoReplace: false, interimResults: true }
              : { autoReplace: true, continuous: true }
          "
        />
      </template>
    </tr-sender>
  </div>
</template>
`,O=`<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { SenderSuggestionItem, SuggestionTextPart, StructuredData } from '@opentiny/tiny-robot'

const input = ref('')
const highlightMode = ref<'auto' | 'precise' | 'custom'>('auto')

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
      console.log('选中建议:', item.content)
    },
  }),
]

const handleSubmit = (text: string, data?: StructuredData) => {
  console.log('📝 提交内容：', text)
  console.log('📋 结构化数据：', data)
  console.log('🎨 当前高亮模式：', highlightMode.value)
}
<\/script>

<template>
  <div class="demo-highlight">
    <h3>高亮模式对比</h3>

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

    <tr-sender
      v-model="input"
      :extensions="extensions"
      placeholder="输入 ECS 或 CDN 查看不同高亮效果..."
      @submit="handleSubmit"
    />
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
</style>
`,H=`<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { SenderSuggestionItem, StructuredData } from '@opentiny/tiny-robot'

const input = ref('')
const selectedItem = ref('')
const filterMode = ref<'default' | 'prefix' | 'category'>('default')

// 模式说明
const modeDescription = computed(() => {
  switch (filterMode.value) {
    case 'default':
      return '默认过滤：模糊匹配，包含输入内容即可'
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
      console.log('选中建议:', item.content)
    },
  }),
])

const handleSubmit = (text: string, data?: StructuredData) => {
  console.log('📝 提交内容：', text)
  console.log('📋 结构化数据：', data)
}
<\/script>

<template>
  <div class="demo-filter">
    <div class="filter-selector">
      <label>
        <input type="radio" v-model="filterMode" value="default" />
        默认过滤
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
`,$=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { SenderSuggestionItem } from '@opentiny/tiny-robot'

const input = ref('')
const selectedItem = ref('')

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
      console.log(item)
    },
  }),
]

const handleSubmit = (text: string) => {
  console.log('📝 提交内容：', text)
}
<\/script>

<template>
  <div class="demo-suggestion">
    <h3>基础用法</h3>
    <p class="demo-description">输入任意内容查看建议，支持键盘导航和自动补全</p>
    <tr-sender
      v-model="input"
      :extensions="extensions"
      placeholder="输入 ECS 或 CDN 查看建议..."
      @submit="handleSubmit"
    />

    <div v-if="selectedItem" class="demo-result"><strong>选中的建议：</strong> {{ selectedItem }}</div>
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
`,K=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { MentionItem, StructuredData } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')

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

  console.log('📝 提交内容（纯文本）：', text)
  console.log('📋 结构化数据：', data)
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
`,tt=`<script setup lang="ts">
import { ref } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { TemplateItem, StructuredData } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')

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

  console.log('📝 提交内容（纯文本）：', text)
  console.log('📋 结构化数据：', data)
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

    <div v-if="submittedContent && content" class="result">
      <div class="result-title">提交的内容（纯文本）：</div>
      <div class="result-content">{{ submittedContent }}</div>
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
`,nt=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { Switch as TinySwitch } from '@opentiny/vue'

const content = ref('')
const loading = ref(false)
const isDisabled = ref(false)

const handleSubmit = (value: string) => {
  console.log('提交内容:', value)
  loading.value = true

  // 模拟 3 秒后完成
  setTimeout(() => {
    loading.value = false
    content.value = ''
  }, 3000)
}

const handleCancel = () => {
  console.log('取消生成')
  loading.value = false
}
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
    <p v-if="loading" class="loading-tip">正在生成回复...</p>
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
`,et=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const content = ref('')
const mode = ref<'single' | 'multiple'>('single')

const handleSubmit = (value: string) => {
  console.log('提交内容:', value)
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
</style>
`,ot=JSON.parse('{"title":"Sender 消息输入框","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/sender.md","filePath":"components/sender.md"}'),it={name:"components/sender.md"},pt=Object.assign(it,{setup(at){const E=u();o(async()=>{E.value=(await p(async()=>{const{default:i}=await import("./chunks/size.aMt5rjRc.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const b=u();o(async()=>{b.value=(await p(async()=>{const{default:i}=await import("./chunks/methods-demo.fpivG3Qd.js");return{default:i}},__vite__mapDeps([3,1,2]))).default});const v=u();o(async()=>{v.value=(await p(async()=>{const{default:i}=await import("./chunks/custom-slots.BrpsIpfR.js");return{default:i}},__vite__mapDeps([4,1,2]))).default});const f=u();o(async()=>{f.value=(await p(async()=>{const{default:i}=await import("./chunks/submit-type.D1BMv_L3.js");return{default:i}},__vite__mapDeps([5,2,1]))).default});const F=u();o(async()=>{F.value=(await p(async()=>{const{default:i}=await import("./chunks/cancel-event.DWxkxIm6.js");return{default:i}},__vite__mapDeps([6,1,2]))).default});const A=u();o(async()=>{A.value=(await p(async()=>{const{default:i}=await import("./chunks/actions-enhanced.DL4FGpQ7.js");return{default:i}},__vite__mapDeps([7,1,2]))).default});const D=u();o(async()=>{D.value=(await p(async()=>{const{default:i}=await import("./chunks/actions-config-basic.B5CbtP-U.js");return{default:i}},__vite__mapDeps([8,1,2]))).default});const C=u();o(async()=>{C.value=(await p(async()=>{const{default:i}=await import("./chunks/voice-custom-ui.RLSJJk8g.js");return{default:i}},__vite__mapDeps([9,2,1]))).default});const x=u();o(async()=>{x.value=(await p(async()=>{const{default:i}=await import("./chunks/voice-custom.CTDHKvVq.js");return{default:i}},__vite__mapDeps([10,1,2]))).default});const B=u();o(async()=>{B.value=(await p(async()=>{const{default:i}=await import("./chunks/voice-input.CvaxU7fy.js");return{default:i}},__vite__mapDeps([11,2,1]))).default});const T=u();o(async()=>{T.value=(await p(async()=>{const{default:i}=await import("./chunks/suggestion-highlight.iIf-qRTw.js");return{default:i}},__vite__mapDeps([12,2,1]))).default});const S=u();o(async()=>{S.value=(await p(async()=>{const{default:i}=await import("./chunks/suggestion-filter.AtE-97Wo.js");return{default:i}},__vite__mapDeps([13,2,1]))).default});const _=u();o(async()=>{_.value=(await p(async()=>{const{default:i}=await import("./chunks/suggestion-basic.CkCDxHv7.js");return{default:i}},__vite__mapDeps([14,1,2]))).default});const Z=u();o(async()=>{Z.value=(await p(async()=>{const{default:i}=await import("./chunks/mention.BLn6BhRB.js");return{default:i}},__vite__mapDeps([15,1,2]))).default});const w=u();o(async()=>{w.value=(await p(async()=>{const{default:i}=await import("./chunks/template-editor.BrDDHLDN.js");return{default:i}},__vite__mapDeps([16,1,2]))).default});const W=u();o(async()=>{W.value=(await p(async()=>{const{default:i}=await import("./chunks/word-limit.B1hNfASy.js");return{default:i}},__vite__mapDeps([17,1,2]))).default});const I=u();o(async()=>{I.value=(await p(async()=>{const{default:i}=await import("./chunks/loading-state.D9oxg96j.js");return{default:i}},__vite__mapDeps([18,1,2]))).default});const e=z(!0),q=u();return o(async()=>{q.value=(await p(async()=>{const{default:i}=await import("./chunks/mode-switch.Crf7Mm8v.js");return{default:i}},__vite__mapDeps([19,1,2]))).default}),(i,t)=>{const d=X("ClientOnly");return V(),P("div",null,[t[18]||(t[18]=m("",8)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"输入模式",description:"支持单行和多行模式，单行模式可自动切换为多行。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{e.value=!1}),vueCode:n(et)},c({_:2},[q.value?{name:"vue",fn:a(()=>[s(n(q))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[19]||(t[19]=l("h3",{id:"状态控制",tabindex:"-1"},[k("状态控制 "),l("a",{class:"header-anchor",href:"#状态控制","aria-label":'Permalink to "状态控制"'},"​")],-1)),t[20]||(t[20]=l("p",null,[k("通过 "),l("code",null,"loading"),k(" 和 "),l("code",null,"disabled"),k(" 属性控制组件状态。加载状态下可点击图标取消操作。")],-1)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"加载与禁用状态",description:"展示加载和禁用两种状态的表现。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{e.value=!1}),vueCode:n(nt)},c({_:2},[I.value?{name:"vue",fn:a(()=>[s(n(I))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[21]||(t[21]=m("",4)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"字数限制",description:"限制输入字符数并显示字数统计。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{e.value=!1}),vueCode:n(st)},c({_:2},[W.value?{name:"vue",fn:a(()=>[s(n(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[22]||(t[22]=m("",8)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"模板填充",description:"支持动态模板切换，自动聚焦可编辑字段。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{e.value=!1}),vueCode:n(tt)},c({_:2},[w.value?{name:"vue",fn:a(()=>[s(n(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[23]||(t[23]=m("",5)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"提及功能",description:"输入 @ 触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{e.value=!1}),vueCode:n(K)},c({_:2},[Z.value?{name:"vue",fn:a(()=>[s(n(Z))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[24]||(t[24]=m("",6)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"基础用法",description:"直接显示所有建议项，不过滤。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{e.value=!1}),vueCode:n($)},c({_:2},[_.value?{name:"vue",fn:a(()=>[s(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[25]||(t[25]=l("h4",{id:"自定义过滤",tabindex:"-1"},[k("自定义过滤 "),l("a",{class:"header-anchor",href:"#自定义过滤","aria-label":'Permalink to "自定义过滤"'},"​")],-1)),t[26]||(t[26]=l("p",null,[k("通过 "),l("code",null,"filterFn"),k(" 自定义过滤逻辑，实现模糊匹配、前缀匹配等。")],-1)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"自定义过滤",description:"使用 filterFn 实现自定义过滤逻辑。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{e.value=!1}),vueCode:n(H)},c({_:2},[S.value?{name:"vue",fn:a(()=>[s(n(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[27]||(t[27]=m("",3)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"高亮模式",description:"动态切换三种高亮模式，对比不同的高亮效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{e.value=!1}),vueCode:n(O)},c({_:2},[T.value?{name:"vue",fn:a(()=>[s(n(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[28]||(t[28]=m("",6)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"基础语音输入",description:"使用浏览器内置语音识别，支持混合输入和连续识别。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[8]||(t[8]=()=>{e.value=!1}),vueCode:n(U)},c({_:2},[B.value?{name:"vue",fn:a(()=>[s(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[29]||(t[29]=l("h4",{id:"自定义语音服务",tabindex:"-1"},[k("自定义语音服务 "),l("a",{class:"header-anchor",href:"#自定义语音服务","aria-label":'Permalink to "自定义语音服务"'},"​")],-1)),t[30]||(t[30]=l("p",null,"支持集成第三方语音识别服务（如阿里云、百度、Azure 等）。",-1)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"自定义语音识别",description:"集成第三方语音识别服务，参考 speechHandlers.ts 查看完整实现。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[9]||(t[9]=()=>{e.value=!1}),vueCode:n(J)},c({_:2},[x.value?{name:"vue",fn:a(()=>[s(n(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[31]||(t[31]=l("div",{class:"tip custom-block"},[l("p",{class:"custom-block-title"},"参考实现"),l("p",null,[l("code",null,"speechHandlers.ts"),k(" 提供了阿里云一句话识别和实时识别的完整示例，包括录音处理、API 调用、流式识别等。")])],-1)),t[32]||(t[32]=l("h4",{id:"自定义录音-ui",tabindex:"-1"},[k("自定义录音 UI "),l("a",{class:"header-anchor",href:"#自定义录音-ui","aria-label":'Permalink to "自定义录音 UI"'},"​")],-1)),t[33]||(t[33]=l("p",null,"支持完全自定义语音录制界面，适用于移动端按住说话等场景。",-1)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"移动端按住说话",description:"自定义录音 UI，展示移动端按住说话的交互模式。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[10]||(t[10]=()=>{e.value=!1}),vueCode:n(j)},c({_:2},[C.value?{name:"vue",fn:a(()=>[s(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[34]||(t[34]=m("",4)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"默认按钮配置",description:"通过 defaultActions 统一配置默认按钮的状态和提示。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[11]||(t[11]=()=>{e.value=!1}),vueCode:n(Q)},c({_:2},[D.value?{name:"vue",fn:a(()=>[s(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[35]||(t[35]=l("h4",{id:"增强按钮",tabindex:"-1"},[k("增强按钮 "),l("a",{class:"header-anchor",href:"#增强按钮","aria-label":'Permalink to "增强按钮"'},"​")],-1)),t[36]||(t[36]=l("p",null,"通过插槽添加增强按钮（Upload、Voice 等），每个按钮都有独立的配置。",-1)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"增强按钮",description:"通过插槽添加 Upload、Voice 等增强按钮。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[12]||(t[12]=()=>{e.value=!1}),vueCode:n(N)},c({_:2},[A.value?{name:"vue",fn:a(()=>[s(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[37]||(t[37]=m("",4)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"取消操作",description:"loading 状态下点击停止按钮触发 cancel 事件。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[13]||(t[13]=()=>{e.value=!1}),vueCode:n(Y)},c({_:2},[F.value?{name:"vue",fn:a(()=>[s(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[38]||(t[38]=l("h3",{id:"提交方式",tabindex:"-1"},[k("提交方式 "),l("a",{class:"header-anchor",href:"#提交方式","aria-label":'Permalink to "提交方式"'},"​")],-1)),t[39]||(t[39]=l("p",null,[k("通过 "),l("code",null,"submitType"),k(" 属性控制提交快捷键，支持 "),l("code",null,"enter"),k("、"),l("code",null,"ctrlEnter"),k("、"),l("code",null,"shiftEnter"),k(" 三种方式。")],-1)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"提交方式",description:"支持三种提交快捷键，适应不同使用场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[14]||(t[14]=()=>{e.value=!1}),vueCode:n(M)},c({_:2},[f.value?{name:"vue",fn:a(()=>[s(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[40]||(t[40]=m("",8)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"自定义插槽",description:"在插槽区域添加自定义按钮，如深度思考、网络搜索等功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[15]||(t[15]=()=>{e.value=!1}),vueCode:n(G)},c({_:2},[v.value?{name:"vue",fn:a(()=>[s(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[41]||(t[41]=l("h3",{id:"方法调用",tabindex:"-1"},[k("方法调用 "),l("a",{class:"header-anchor",href:"#方法调用","aria-label":'Permalink to "方法调用"'},"​")],-1)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"方法调用",description:"通过 ref 调用组件方法，如聚焦、设置内容等。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[16]||(t[16]=()=>{e.value=!1}),vueCode:n(L)},c({_:2},[b.value?{name:"vue",fn:a(()=>[s(n(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[42]||(t[42]=m("",5)),r(s(n(g),null,null,512),[[h,e.value]]),s(d,null,{default:a(()=>[s(n(y),{title:"组件尺寸",description:"支持正常和紧凑两种尺寸，适应不同的使用场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[17]||(t[17]=()=>{e.value=!1}),vueCode:n(R)},c({_:2},[E.value?{name:"vue",fn:a(()=>[s(n(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[43]||(t[43]=m("",83))])}}});export{ot as __pageData,pt as default};

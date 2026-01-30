const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/CompactMode.o1zJsOKb.js","assets/chunks/theme.BBpjuR9V.js","assets/chunks/framework.CjHX91lP.js","assets/chunks/DecorativeContent.D9bLt2oR.js","assets/chunks/All.CXn1Wi3R.js","assets/chunks/DeepThink.G2uu6AUZ.js","assets/chunks/ShortcutSubmit.BW1wCphD.js","assets/chunks/Suggestions.BqseqoNf.js","assets/chunks/Template.C5Mv8geI.js","assets/chunks/FileUpload.CrGnyTGT.js","assets/chunks/CustomRecordingUI.DsZPYCip.js","assets/chunks/CustomSpeech.DvKPxdi8.js","assets/chunks/voiceInput.CrW3sCnY.js","assets/chunks/Clearable.DM_N1Tnn.js","assets/chunks/AutoSize.DqUCGqvE.js","assets/chunks/WordLimit.CrEInDgu.js","assets/chunks/States.DqU-g7EE.js","assets/chunks/Mode.CMxIlrkz.js"])))=>i.map(i=>d[i]);
import{aD as d,bQ as p,aZ as I,aL as R,v as X,H as A,bL as h,bB as c,J as n,bk as t,bJ as l,G as E,w as s,I as r,b7 as C,aU as P}from"./chunks/framework.CjHX91lP.js";import{L as u,N as k}from"./chunks/index.D6odQFcp.js";const M=`<template>
  <div style="display: flex; gap: 24px; flex-wrap: wrap">
    <div style="flex: 1; min-width: 300px">
      <h4 style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500">默认样式（宽松模式）</h4>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <tr-sender mode="single" placeholder="默认单行模式..." />
        <tr-sender mode="multiple" placeholder="默认多行模式..." :showWordLimit="true" :maxLength="200" />
      </div>
    </div>

    <div style="flex: 1; min-width: 300px">
      <h4 style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500">
        紧凑模式（添加
        <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px">tr-sender-compact</code> 类）
      </h4>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <tr-sender class="tr-sender-compact" mode="single" placeholder="紧凑单行模式..." />
        <tr-sender
          class="tr-sender-compact"
          mode="multiple"
          placeholder="紧凑多行模式..."
          :showWordLimit="true"
          :maxLength="100"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>
`,V=`<template>
  <div class="demo-container">
    <h3>服务状态提示</h3>
    <div class="demo-section">
      <div class="demo-section">
        <h4>使用示例</h4>
        <p>使用 decorativeContent 插槽添加装饰性内容，会自动禁用输入和发送功能：</p>
        <tr-sender :allow-speech="false">
          <template #decorativeContent>
            缴费服务正在进行中，<a href="https://example.com" target="_blank">点击前往</a>
          </template>
        </tr-sender>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

h4 {
  margin-bottom: 8px;
}
</style>
`,L=`<template>
  <tr-sender
    v-model="inputMessage"
    mode="multiple"
    submitType="ctrlEnter"
    :maxLength="2000"
    :showWordLimit="true"
    :autoSize="true"
    :clearable="true"
    :allowSpeech="true"
    :loading="isSubmitting"
    placeholder="请输入您的消息..."
    @submit="handleSubmit"
    @speech-end="handleSpeechEnd"
  >
    <template #header>
      <div class="conversation-title">自定义插槽</div>
    </template>

    <template #prefix>
      <icon-ai class="user-avatar" />
    </template>

    <template #footer-left>
      <tiny-tooltip :disabled="isActive" content="适用于复杂问题解析" placement="top" theme="dark">
        <div :class="['button-wrapper', isActive ? 'active' : '']" @click="toggleActive">
          <div class="button">
            <IconThink class="icon-think" />
            <span class="text">深度思考</span>
          </div>
        </div>
      </tiny-tooltip>
    </template>

    <template #footer-right>
      <IconSearch class="icon-search" />
    </template>
  </tr-sender>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { IconAi, IconThink, IconSearch } from '@opentiny/tiny-robot-svgs'
import { TinyTooltip } from '@opentiny/vue'

const isActive = ref(false)

const inputMessage = ref('')
const isSubmitting = ref(false)

const toggleActive = () => {
  isActive.value = !isActive.value
}

const handleSubmit = async (message) => {
  isSubmitting.value = true
  try {
    inputMessage.value = '' // 清空输入
    console.log('发送成功:', message)
  } catch (error) {
    console.error('发送失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleSpeechEnd = (transcript) => {
  console.log('语音识别结果:', transcript)
}
<\/script>

<style scoped>
.conversation-title {
  font-weight: bold;
  padding: 8px 0;
  text-align: center;
}

.user-avatar {
  font-size: 28px;
  object-fit: cover;
}

.custom-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
}

.icon-search {
  color: #595959;
  font-size: 20px;
  cursor: pointer;
}

.text {
  width: 56px;
  height: 22px;
  line-height: 22px;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
}

.icon-think {
  width: 16px;
  height: 16px;
  color: #595959;
}

.button-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 32px;
  border: 1px solid rgb(194, 194, 194);
  border-radius: 999px;
  cursor: pointer;
  box-sizing: border-box;
}
.button-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.button-wrapper.active {
  border: 1px solid rgb(20, 118, 255);
  background: rgba(20, 118, 255, 0.08);
  color: rgb(20, 118, 255);

  .icon-think {
    color: rgb(20, 118, 255);
  }
}

.button-wrapper.active:hover {
  background: rgba(20, 118, 255, 0.12);
}

:deep(.tiny-tooltip.tiny-tooltip__popper) {
  border-radius: 4px;
  padding: 4px 8px;
  background: rgb(89, 89, 89);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.16);
}
</style>
`,G=`<template>
  <tr-sender mode="multiple" :showWordLimit="true" :maxLength="1000">
    <template #footer-left>
      <tiny-tooltip :disabled="isActive" content="适用于复杂问题解析" placement="top" theme="dark">
        <div :class="['button-wrapper', isActive ? 'active' : '']" @click="toggleActive">
          <div class="button">
            <IconThink class="icon-think" />
            <span class="text">深度思考</span>
          </div>
        </div>
      </tiny-tooltip>
    </template>
  </tr-sender>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { IconThink } from '@opentiny/tiny-robot-svgs'
import { TinyTooltip } from '@opentiny/vue'

const isActive = ref(false)

const toggleActive = () => {
  isActive.value = !isActive.value
}
<\/script>

<style scoped>
.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.text {
  width: 56px;
  height: 22px;
  line-height: 22px;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
}

.icon-think {
  width: 16px;
  height: 16px;
  color: #595959;
}

.button-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 32px;
  border: 1px solid rgb(194, 194, 194);
  border-radius: 999px;
  cursor: pointer;
  box-sizing: border-box;
}

.button-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.button-wrapper.active {
  border: 1px solid rgb(20, 118, 255);
  background: rgba(20, 118, 255, 0.08);
  color: rgb(20, 118, 255);

  .icon-think {
    color: rgb(20, 118, 255);
  }
}

.button-wrapper.active:hover {
  background: rgba(20, 118, 255, 0.12);
}

:deep(.tiny-tooltip.tiny-tooltip__popper) {
  border-radius: 4px;
  padding: 4px 8px;
  background: rgb(89, 89, 89);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.16);
}
</style>
`,q=`<template>
  <div class="shortcut-submit-demo">
    <div class="submit-type-selector">
      <label>选择提交方式：</label>
      <div class="radio-group">
        <label class="radio-item">
          <input type="radio" value="enter" v-model="submitType" />
          <span>Enter 提交</span>
        </label>
        <label class="radio-item">
          <input type="radio" value="ctrlEnter" v-model="submitType" />
          <span>Ctrl+Enter 提交</span>
        </label>
        <label class="radio-item">
          <input type="radio" value="shiftEnter" v-model="submitType" />
          <span>Shift+Enter 提交</span>
        </label>
      </div>
    </div>

    <tr-sender
      v-model="defaultValue"
      :submitType="submitType"
      mode="multiple"
      :placeholder="placeholderText"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const defaultValue = ref('')
const submitType = ref<'enter' | 'ctrlEnter' | 'shiftEnter'>('ctrlEnter')

const placeholderText = computed(() => {
  const placeholderMap = {
    enter: '按 Enter 提交',
    ctrlEnter: '按 Ctrl+Enter 提交，Enter 换行',
    shiftEnter: '按 Shift+Enter 提交，Enter 换行',
  }
  return placeholderMap[submitType.value]
})

const handleSubmit = (value: string) => {
  console.log('提交内容:', value)
  console.log('提交方式:', submitType.value)
  defaultValue.value = ''
}
<\/script>

<style scoped>
.shortcut-submit-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submit-type-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.submit-type-selector label {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.radio-group {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--vp-c-text-2);
  transition: color 0.2s;
}

.radio-item:hover {
  color: var(--vp-c-text-1);
}

.radio-item input[type='radio'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--vp-c-brand-1);
}

.radio-item span {
  user-select: none;
}
</style>
`,z=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">高亮模式：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="auto" v-model="highlightMode" style="cursor: pointer" />
        <span>自动匹配</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="precise" v-model="highlightMode" style="cursor: pointer" />
        <span>精确指定</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="custom" v-model="highlightMode" style="cursor: pointer" />
        <span>自定义函数</span>
      </label>
    </div>
    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      {{
        highlightMode === 'auto'
          ? '自动高亮匹配的输入内容'
          : highlightMode === 'precise'
            ? '通过 highlights 数组精确指定高亮片段'
            : '通过 highlights 函数自定义高亮逻辑'
      }}
    </div>
    <tr-sender
      :key="highlightMode"
      mode="single"
      :suggestions="currentSuggestions"
      :placeholder="
        highlightMode === 'auto'
          ? '输入 ECS 或 CDN 查看自动高亮...'
          : highlightMode === 'precise'
            ? '输入 ECS 或 CDN 查看精确高亮...'
            : '输入 ECS 或 CDN 查看自定义高亮...'
      "
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender, type SuggestionTextPart } from '@opentiny/tiny-robot'

const highlightMode = ref<'auto' | 'precise' | 'custom'>('auto')

// 自动匹配模式：传入对象数组，自动高亮匹配的输入内容
const autoSuggestions = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'CDN-权限管理' },
  { content: 'CDN常见问题场景以及解决方法有哪些？' },
]

// 精确指定模式：通过 highlights 数组指定高亮片段
const preciseSuggestions = [
  { content: 'ECS-云服务器卡顿问题', highlights: ['云服务器', '卡顿'] },
  { content: 'ECS-备份弹性云服务器', highlights: ['弹性', '云服务器'] },
  { content: 'CDN-权限管理', highlights: ['权限'] },
  { content: 'CDN常见问题场景以及解决方法有哪些？', highlights: ['问题', '解决方法'] },
]

// 自定义函数模式：通过 highlights 函数完全控制高亮逻辑
const customSuggestions = [
  {
    content: 'ECS-云服务器卡顿问题',
    highlights: (text: string) => {
      const parts: SuggestionTextPart[] = []
      const keyword = '云'
      let lastIndex = 0
      let index = text.indexOf(keyword)

      while (index !== -1) {
        if (index > lastIndex) {
          parts.push({ text: text.substring(lastIndex, index), isMatch: false })
        }
        parts.push({ text: keyword, isMatch: true })
        lastIndex = index + keyword.length
        index = text.indexOf(keyword, lastIndex)
      }

      if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex), isMatch: false })
      }

      return parts
    },
  },
  { content: 'ECS-备份弹性云服务器', highlights: () => [{ text: 'ECS-备份弹性云服务器', isMatch: true }] },
  { content: 'CDN-权限管理', highlights: () => [{ text: 'CDN-权限管理', isMatch: false }] },
  {
    content: 'CDN常见问题场景以及解决方法有哪些？',
    highlights: () => [
      { text: 'CDN', isMatch: true },
      { text: '常见', isMatch: false },
      { text: '问题', isMatch: true },
      { text: '场景以及', isMatch: false },
      { text: '解决方法', isMatch: true },
      { text: '有哪些？', isMatch: false },
    ],
  },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const currentSuggestions = computed<any>(() => {
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
<\/script>
`,U=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-sender v-model:template-data="templateData" mode="multiple" clearable @submit="handleSubmit" ref="senderRef" />

    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      💡 点击蓝色字段可编辑，光标自动聚焦到第一个可编辑字段
    </div>

    <div style="display: flex; gap: 8px; flex-wrap: wrap">
      <button
        v-for="(item, index) in templates"
        :key="index"
        @click="selectTemplate(item, index)"
        :style="{
          padding: '6px 12px',
          background: activeIndex === index ? '#1890ff' : '#f0f0f0',
          color: activeIndex === index ? 'white' : '#333',
          border: '1px solid ' + (activeIndex === index ? '#1890ff' : '#ddd'),
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
        }"
      >
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender, type UserItem } from '@opentiny/tiny-robot'
import { ref, onMounted } from 'vue'

const senderRef = ref<InstanceType<typeof TrSender> | null>(null)
const templateData = ref<UserItem[]>([])
const activeIndex = ref(0)

// 预定义模板
const templates: Array<{ name: string; data: UserItem[] }> = [
  {
    name: '模板1',
    data: [
      { type: 'text', content: '你好' },
      { type: 'template', content: '张三' },
      { type: 'text', content: '，欢迎使用' },
      { type: 'template', content: 'TinyRobot' },
      { type: 'text', content: '！' },
    ],
  },
  {
    name: '模板2',
    data: [
      { type: 'text', content: '你好' },
      { type: 'template', content: '张三先生' },
      { type: 'text', content: '，关于' },
      { type: 'template', content: '' },
      { type: 'text', content: '的进展，请查看' },
      { type: 'template', content: '' },
      { type: 'text', content: '。' },
    ],
  },
  {
    name: '模板3',
    data: [{ type: 'text', content: 'ECS 服务器的最新版本' }],
  },
]

// 选择模板
const selectTemplate = (template: (typeof templates)[0], index: number) => {
  activeIndex.value = index
  templateData.value = template.data
  senderRef.value?.activateTemplateFirstField()
}

// 提交处理
const handleSubmit = (text: string) => {
  console.log('提交内容:', text)
}

onMounted(() => {
  selectTemplate(templates[0], 0)
})
<\/script>
`,Y=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
      <span style="font-weight: 500">Tooltip 位置：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="top" v-model="tooltipPlacement" style="cursor: pointer" />
        <span>top</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="bottom" v-model="tooltipPlacement" style="cursor: pointer" />
        <span>bottom</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="left" v-model="tooltipPlacement" style="cursor: pointer" />
        <span>left</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="right" v-model="tooltipPlacement" style="cursor: pointer" />
        <span>right</span>
      </label>
    </div>
    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      通过
      <code style="background: #e8e8e8; padding: 2px 6px; border-radius: 3px">buttonGroup.file.tooltipPlacement</code>
      配置 tooltip 位置，支持 top、top-start、top-end、bottom、bottom-start、bottom-end、left、right 等方向
    </div>
    <tr-sender
      :key="tooltipPlacement"
      mode="multiple"
      :allow-files="true"
      :button-group="buttonGroup"
      @files-selected="handleFilesSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

type TooltipPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'
const tooltipPlacement = ref<TooltipPlacement>('top')

const renderTooltip = () => {
  return h('div', { style: { fontSize: '12px', maxWidth: '200px' } }, [
    h('div', null, '• 支持图片格式 JPG、PNG'),
    h('div', null, '• 单个文件不超过 10MB'),
  ])
}

const buttonGroup = computed(() => ({
  file: {
    tooltips: renderTooltip,
    tooltipPlacement: tooltipPlacement.value,
    disabled: false,
    accept: 'image/jpeg, image/png',
  },
}))

const handleFilesSelected = (files: File[]) => {
  console.log('选择的文件:', files)
}
<\/script>
`,j=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <!-- 语音录制 UI -->
    <div>
      <h4>{{ isMobile ? '移动端' : 'PC 端' }} 语音录制</h4>
      <div
        class="sender-container"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="handleTouchEnd"
        @mousemove.prevent="handleTouchMove"
        @mouseup.prevent="handleTouchEnd"
      >
        <!-- 输入框：使用 content 插槽自定义按住说话入口 -->
        <tr-sender
          v-show="!showMobileVoiceUI"
          ref="senderRef"
          v-model="inputText"
          mode="single"
          class="sender"
          :allowSpeech="true"
          :speech="speechConfig"
        >
          <template v-if="isMobile" #content>
            <div
              class="press-to-talk-trigger"
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

<script setup lang="ts">
import { ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { TrSender } from '@opentiny/tiny-robot'
import PressToTalkOverlay from './PressToTalkOverlay.vue'

const senderRef = ref<InstanceType<typeof TrSender>>()
const inputText = ref('')
const showMobileVoiceUI = ref(false)
const isMobile = ref(false)
const isCanceling = ref(false)
const startY = ref(0)
const cancelThreshold = 30

// 语音配置
const speechConfig = {
  onVoiceButtonClick: async (isRecording: boolean, preventDefault: () => void) => {
    // PC 端：使用默认的点击切换录音逻辑
    if (!isMobile.value) {
      return // 不调用 preventDefault，继续执行默认逻辑
    }

    // Mobile 端：使用自定义的按住说话逻辑
    preventDefault() // 阻止默认逻辑

    if (!isRecording) {
      // 点击语音按钮时，显示按住说话 UI
      showMobileVoiceUI.value = true
    } else {
      // 如果正在录音，停止录音
      senderRef.value?.stopSpeech()
      showMobileVoiceUI.value = false
    }
  },
}

// 按下开始录音
const handleTouchStart = (e: TouchEvent | MouseEvent) => {
  const clientY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  startY.value = clientY
  showMobileVoiceUI.value = true
  isCanceling.value = false
  senderRef.value?.startSpeech()
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
    // 取消录音（可以在这里清空输入框或其他处理）
    inputText.value = ''
  }

  senderRef.value?.stopSpeech()
  senderRef.value?.submit()
  showMobileVoiceUI.value = false
  isCanceling.value = false
}
<\/script>

<style scoped>
.sender-container {
  position: relative;
  min-height: 180px;
}

.sender {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}

.press-to-talk-trigger {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  font-size: 16px;
  color: #333;
}
</style>
`,Q=`<template>
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
      <tr-sender
        v-model="inputText"
        mode="single"
        :allowSpeech="true"
        :speech="speechConfig"
        placeholder="点击麦克风按钮开始语音输入..."
        @speech-start="handleSpeechStart"
        @speech-interim="handleSpeechInterim"
        @speech-final="handleSpeechFinal"
        @speech-end="handleSpeechEnd"
        @speech-error="handleSpeechError"
        @submit="handleSubmit"
      />
    </div>

    <!-- 结果展示 -->
    <div v-if="results.length > 0" style="padding: 16px; background: #f9f9f9; border-radius: 8px">
      <h4 style="margin: 0 0 12px 0">识别历史</h4>
      <div style="max-height: 200px; overflow-y: auto">
        <div
          v-for="(result, index) in results"
          :key="index"
          style="
            padding: 8px;
            margin-bottom: 8px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #52c41a;
          "
        >
          <div style="font-size: 12px; color: #999; margin-bottom: 4px">{{ result.timestamp }}</div>
          <div>{{ result.text }}</div>
        </div>
      </div>
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

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { MockSpeechHandler } from './speechHandlers'

// 组件状态
const inputText = ref('')
const speechStatus = ref('')
const interimResult = ref('')
const results = ref<Array<{ text: string; timestamp: string }>>([])

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

const handleSpeechFinal = (transcript: string) => {
  speechStatus.value = '✅ 识别完成'
  interimResult.value = ''

  // 记录识别结果
  results.value.unshift({
    text: transcript,
    timestamp: new Date().toLocaleTimeString(),
  })

  // 限制历史记录数量
  if (results.value.length > 10) {
    results.value = results.value.slice(0, 10)
  }
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
`,J=`<template>
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
      :allowSpeech="true"
      :speech="
        voiceMode === 'mixed' ? { autoReplace: false, interimResults: true } : { autoReplace: true, continuous: true }
      "
      :placeholder="voiceMode === 'mixed' ? '点击麦克风说话，识别结果会追加到此处...' : '点击麦克风开始连续识别...'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const voiceMode = ref<'mixed' | 'continuous'>('mixed')
<\/script>
`,N=`<template>
  <tr-sender clearable />
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>
`,O=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">配置：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="true" v-model="config" style="cursor: pointer" />
        <span>自动调整</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="custom" v-model="config" style="cursor: pointer" />
        <span>限制行数 (2-4行)</span>
      </label>
    </div>
    <tr-sender
      :key="config"
      mode="multiple"
      :autoSize="config === 'true' ? true : { minRows: 2, maxRows: 4 }"
      :placeholder="config === 'true' ? '高度随内容自动调整' : '最小2行，最大4行，输入多行文本查看效果'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const config = ref<'true' | 'custom'>('true')
<\/script>
`,H=`<template>
  <tr-sender
    mode="multiple"
    :showWordLimit="true"
    :maxLength="20"
    defaultValue="测试超出字数限制，当前已经超过了字数限制。"
  />
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>
`,K=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div>
      <h4 style="margin: 0 0 8px 0">加载状态</h4>
      <tr-sender :loading="true" stopText="停止回答" placeholder="加载中，点击图标可取消..." />
    </div>
    <div>
      <h4 style="margin: 0 0 8px 0">禁用状态</h4>
      <tr-sender :disabled="true" placeholder="输入框已禁用..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>
`,$=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">模式：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="single" v-model="mode" style="cursor: pointer" />
        <span>单行</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="multiple" v-model="mode" style="cursor: pointer" />
        <span>多行</span>
      </label>
    </div>
    <tr-sender
      :key="mode"
      :mode="mode"
      :placeholder="mode === 'single' ? '单行模式，超出宽度或按 Shift+Enter 自动切换为多行' : '多行模式'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const mode = ref<'single' | 'multiple'>('single')
<\/script>
`,i2=JSON.parse('{"title":"Sender 消息输入框","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/sender.md","filePath":"components/sender.md"}'),e2={name:"components/sender.md"},a2=Object.assign(e2,{setup(n2){const g=C();d(async()=>{g.value=(await p(async()=>{const{default:a}=await import("./chunks/CompactMode.o1zJsOKb.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const B=C();d(async()=>{B.value=(await p(async()=>{const{default:a}=await import("./chunks/DecorativeContent.D9bLt2oR.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const y=C();d(async()=>{y.value=(await p(async()=>{const{default:a}=await import("./chunks/All.CXn1Wi3R.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const m=C();d(async()=>{m.value=(await p(async()=>{const{default:a}=await import("./chunks/DeepThink.G2uu6AUZ.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const F=C();d(async()=>{F.value=(await p(async()=>{const{default:a}=await import("./chunks/ShortcutSubmit.BW1wCphD.js");return{default:a}},__vite__mapDeps([6,2,1]))).default});const v=C();d(async()=>{v.value=(await p(async()=>{const{default:a}=await import("./chunks/Suggestions.BqseqoNf.js");return{default:a}},__vite__mapDeps([7,2,1]))).default});const D=C();d(async()=>{D.value=(await p(async()=>{const{default:a}=await import("./chunks/Template.C5Mv8geI.js");return{default:a}},__vite__mapDeps([8,1,2]))).default});const f=C();d(async()=>{f.value=(await p(async()=>{const{default:a}=await import("./chunks/FileUpload.CrGnyTGT.js");return{default:a}},__vite__mapDeps([9,2,1]))).default});const b=C();d(async()=>{b.value=(await p(async()=>{const{default:a}=await import("./chunks/CustomRecordingUI.DsZPYCip.js");return{default:a}},__vite__mapDeps([10,2,1]))).default});const x=C();d(async()=>{x.value=(await p(async()=>{const{default:a}=await import("./chunks/CustomSpeech.DvKPxdi8.js");return{default:a}},__vite__mapDeps([11,1,2]))).default});const T=C();d(async()=>{T.value=(await p(async()=>{const{default:a}=await import("./chunks/voiceInput.CrW3sCnY.js");return{default:a}},__vite__mapDeps([12,2,1]))).default});const w=C();d(async()=>{w.value=(await p(async()=>{const{default:a}=await import("./chunks/Clearable.DM_N1Tnn.js");return{default:a}},__vite__mapDeps([13,1,2]))).default});const S=C();d(async()=>{S.value=(await p(async()=>{const{default:a}=await import("./chunks/AutoSize.DqUCGqvE.js");return{default:a}},__vite__mapDeps([14,2,1]))).default});const _=C();d(async()=>{_.value=(await p(async()=>{const{default:a}=await import("./chunks/WordLimit.CrEInDgu.js");return{default:a}},__vite__mapDeps([15,1,2]))).default});const Z=C();d(async()=>{Z.value=(await p(async()=>{const{default:a}=await import("./chunks/States.DqU-g7EE.js");return{default:a}},__vite__mapDeps([16,1,2]))).default});const i=P(!0),W=C();return d(async()=>{W.value=(await p(async()=>{const{default:a}=await import("./chunks/Mode.CMxIlrkz.js");return{default:a}},__vite__mapDeps([17,2,1]))).default}),(a,e)=>{const o=I("ClientOnly");return R(),X("div",null,[e[16]||(e[16]=A('<h1 id="sender-消息输入框" tabindex="-1">Sender 消息输入框 <a class="header-anchor" href="#sender-消息输入框" aria-label="Permalink to &quot;Sender 消息输入框&quot;">​</a></h1><p>Sender 是一个功能丰富的输入组件，支持文本输入、语音识别、文件上传、模板填充等多种输入方式。适用于聊天界面、评论输入、表单填写等场景。</p><ul><li><a href="#代码示例">代码示例</a> - 模式切换、状态控制、内容管理</li><li><a href="#输入增强">输入增强</a> - 语音输入、文件上传、模板填充、智能联想</li><li><a href="#交互定制">交互定制</a> - 快捷键、自定义按钮、插槽布局</li><li><a href="#样式配置">样式配置</a> - 紧凑模式</li></ul><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="输入模式" tabindex="-1">输入模式 <a class="header-anchor" href="#输入模式" aria-label="Permalink to &quot;输入模式&quot;">​</a></h3><p>Sender 支持单行和多行两种输入模式，通过 <code>mode</code> 属性控制。</p><div class="tip custom-block"><p class="custom-block-title">单行模式自动切换</p><p>在单行模式下，当输入内容超出宽度时，会自动切换为多行模式。</p><p>当 <code>submitType=&quot;enter&quot;</code> 时，按 <code>Ctrl+Enter</code> 或 <code>Shift+Enter</code> 也会自动切换为多行模式并换行。</p></div>',7)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"输入模式",description:"支持单行和多行模式，单行模式可自动切换为多行。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{i.value=!1}),vueCode:t($)},E({_:2},[W.value?{name:"vue",fn:l(()=>[n(t(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[17]||(e[17]=s("h3",{id:"状态控制",tabindex:"-1"},[r("状态控制 "),s("a",{class:"header-anchor",href:"#状态控制","aria-label":'Permalink to "状态控制"'},"​")],-1)),e[18]||(e[18]=s("p",null,[r("通过 "),s("code",null,"loading"),r(" 和 "),s("code",null,"disabled"),r(" 属性控制组件状态。加载状态下可点击图标取消操作。")],-1)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"加载与禁用状态",description:"展示加载和禁用两种状态的表现。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{i.value=!1}),vueCode:t(K)},E({_:2},[Z.value?{name:"vue",fn:l(()=>[n(t(Z))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[19]||(e[19]=A('<h3 id="内容管理" tabindex="-1">内容管理 <a class="header-anchor" href="#内容管理" aria-label="Permalink to &quot;内容管理&quot;">​</a></h3><h4 id="字数限制" tabindex="-1">字数限制 <a class="header-anchor" href="#字数限制" aria-label="Permalink to &quot;字数限制&quot;">​</a></h4><p>通过 <code>maxLength</code> 和 <code>showWordLimit</code> 属性实现字数限制和统计。</p><div class="warning custom-block"><p class="custom-block-title">超出限制行为</p><p>超出字数限制时，不会自动截断内容，但会以红色标示真实字数，且无法提交。</p></div>',4)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"字数限制",description:"限制输入字符数并显示字数统计。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{i.value=!1}),vueCode:t(H)},E({_:2},[_.value?{name:"vue",fn:l(()=>[n(t(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[20]||(e[20]=s("h4",{id:"高度自适应",tabindex:"-1"},[r("高度自适应 "),s("a",{class:"header-anchor",href:"#高度自适应","aria-label":'Permalink to "高度自适应"'},"​")],-1)),e[21]||(e[21]=s("p",null,[r("通过 "),s("code",null,"autoSize"),r(" 属性设置输入框根据内容自动调整高度（仅多行模式有效）。")],-1)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"自动调整高度",description:"输入框高度随内容自动调整，可配置最小/最大行数。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{i.value=!1}),vueCode:t(O)},E({_:2},[S.value?{name:"vue",fn:l(()=>[n(t(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[22]||(e[22]=s("h4",{id:"快速清空",tabindex:"-1"},[r("快速清空 "),s("a",{class:"header-anchor",href:"#快速清空","aria-label":'Permalink to "快速清空"'},"​")],-1)),e[23]||(e[23]=s("p",null,[r("通过 "),s("code",null,"clearable"),r(" 属性添加清空按钮，有内容时自动显示。")],-1)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"清空内容",description:"添加清空按钮，快速清除输入内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{i.value=!1}),vueCode:t(N)},E({_:2},[w.value?{name:"vue",fn:l(()=>[n(t(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[24]||(e[24]=A('<h2 id="输入增强" tabindex="-1">输入增强 <a class="header-anchor" href="#输入增强" aria-label="Permalink to &quot;输入增强&quot;">​</a></h2><h3 id="语音输入" tabindex="-1">语音输入 <a class="header-anchor" href="#语音输入" aria-label="Permalink to &quot;语音输入&quot;">​</a></h3><h4 id="基础语音识别" tabindex="-1">基础语音识别 <a class="header-anchor" href="#基础语音识别" aria-label="Permalink to &quot;基础语音识别&quot;">​</a></h4><p>启用 <code>allowSpeech</code> 支持浏览器内置的语音识别功能。</p>',4)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"基础语音输入",description:"使用浏览器内置语音识别，支持混合输入和连续识别。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[5]||(e[5]=()=>{i.value=!1}),vueCode:t(J)},E({_:2},[T.value?{name:"vue",fn:l(()=>[n(t(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[25]||(e[25]=s("h4",{id:"自定义语音服务",tabindex:"-1"},[r("自定义语音服务 "),s("a",{class:"header-anchor",href:"#自定义语音服务","aria-label":'Permalink to "自定义语音服务"'},"​")],-1)),e[26]||(e[26]=s("p",null,"支持集成第三方语音识别服务（如阿里云、百度、Azure 等）。",-1)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"自定义语音识别",description:"集成第三方语音识别服务，参考 speechHandlers.ts 查看完整实现。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22CustomSpeech.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FCustomSpeech.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2020px%5C%22%3E%5Cn%20%20%20%20%3C!--%20%E7%8A%B6%E6%80%81%E6%98%BE%E7%A4%BA%20--%3E%5Cn%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20v-if%3D%5C%22speechStatus%5C%22%5Cn%20%20%20%20%20%20style%3D%5C%22padding%3A%2012px%3B%20background%3A%20%23e8f4fd%3B%20border-radius%3A%206px%3B%20border-left%3A%204px%20solid%20%231890ff%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22font-weight%3A%20500%3B%20color%3A%20%231890ff%5C%22%3E%7B%7B%20speechStatus%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3Cdiv%20v-if%3D%5C%22interimResult%5C%22%20style%3D%5C%22margin-top%3A%208px%3B%20color%3A%20%23666%3B%20font-style%3A%20italic%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E5%AE%9E%E6%97%B6%E8%AF%86%E5%88%AB%3A%20%7B%7B%20interimResult%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E8%BE%93%E5%85%A5%E7%BB%84%E4%BB%B6%20--%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%2024px%200%5C%22%3E%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%BC%94%E7%A4%BA%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20v-model%3D%5C%22inputText%5C%22%5Cn%20%20%20%20%20%20%20%20mode%3D%5C%22single%5C%22%5Cn%20%20%20%20%20%20%20%20%3AallowSpeech%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aspeech%3D%5C%22speechConfig%5C%22%5Cn%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E7%82%B9%E5%87%BB%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%8C%89%E9%92%AE%E5%BC%80%E5%A7%8B%E8%AF%AD%E9%9F%B3%E8%BE%93%E5%85%A5...%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-start%3D%5C%22handleSpeechStart%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-interim%3D%5C%22handleSpeechInterim%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-final%3D%5C%22handleSpeechFinal%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-end%3D%5C%22handleSpeechEnd%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-error%3D%5C%22handleSpeechError%5C%22%5Cn%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E7%BB%93%E6%9E%9C%E5%B1%95%E7%A4%BA%20--%3E%5Cn%20%20%20%20%3Cdiv%20v-if%3D%5C%22results.length%20%3E%200%5C%22%20style%3D%5C%22padding%3A%2016px%3B%20background%3A%20%23f9f9f9%3B%20border-radius%3A%208px%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%200%200%2012px%200%5C%22%3E%E8%AF%86%E5%88%AB%E5%8E%86%E5%8F%B2%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22max-height%3A%20200px%3B%20overflow-y%3A%20auto%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22(result%2C%20index)%20in%20results%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22index%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20style%3D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%208px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20margin-bottom%3A%208px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20white%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%204px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border-left%3A%203px%20solid%20%2352c41a%3B%5Cn%20%20%20%20%20%20%20%20%20%20%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22font-size%3A%2012px%3B%20color%3A%20%23999%3B%20margin-bottom%3A%204px%5C%22%3E%7B%7B%20result.timestamp%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%3E%7B%7B%20result.text%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%20--%3E%5Cn%20%20%20%20%3Cdiv%20style%3D%5C%22padding%3A%2016px%3B%20background%3A%20%23fffbe6%3B%20border-radius%3A%208px%3B%20border-left%3A%204px%20solid%20%23faad14%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%200%200%208px%200%3B%20color%3A%20%23fa8c16%5C%22%3E%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cul%20style%3D%5C%22margin%3A%200%3B%20padding-left%3A%2020px%3B%20color%3A%20%23666%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E6%AD%A4%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%EF%BC%8C%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%20%E9%85%8D%E7%BD%AE%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E7%82%B9%E5%87%BB%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%8C%89%E9%92%AE%E5%90%8E%E4%BC%9A%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E8%BF%87%E7%A8%8B%EF%BC%8C%E5%B1%95%E7%A4%BA%E4%B8%AD%E9%97%B4%E7%BB%93%E6%9E%9C%E5%92%8C%E6%9C%80%E7%BB%88%E7%BB%93%E6%9E%9C%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E5%A6%82%E9%9C%80%E6%8E%A5%E5%85%A5%E7%9C%9F%E5%AE%9E%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%9C%8D%E5%8A%A1%EF%BC%88%E9%98%BF%E9%87%8C%E4%BA%91%E7%AD%89%EF%BC%89%EF%BC%8C%E8%AF%B7%E5%8F%82%E8%80%83%20%3Ccode%3EspeechHandlers.ts%3C%2Fcode%3E%20%E4%B8%AD%E7%9A%84%E5%AE%9E%E7%8E%B0%E7%A4%BA%E4%BE%8B%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E6%94%AF%E6%8C%81%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%AD%E9%9F%B3%E5%A4%84%E7%90%86%E5%99%A8%EF%BC%8C%E5%AE%9E%E7%8E%B0%E4%BB%BB%E6%84%8F%E7%AC%AC%E4%B8%89%E6%96%B9%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%9C%8D%E5%8A%A1%E7%9A%84%E9%9B%86%E6%88%90%3C%2Fli%3E%5Cn%20%20%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20MockSpeechHandler%20%7D%20from%20'.%2FspeechHandlers'%5Cn%5Cn%2F%2F%20%E7%BB%84%E4%BB%B6%E7%8A%B6%E6%80%81%5Cnconst%20inputText%20%3D%20ref('')%5Cnconst%20speechStatus%20%3D%20ref('')%5Cnconst%20interimResult%20%3D%20ref('')%5Cnconst%20results%20%3D%20ref%3CArray%3C%7B%20text%3A%20string%3B%20timestamp%3A%20string%20%7D%3E%3E(%5B%5D)%5Cn%5Cn%2F%2F%20%E8%AF%AD%E9%9F%B3%E9%85%8D%E7%BD%AE%20-%20%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%E5%A4%84%E7%90%86%E5%99%A8%5Cnconst%20speechConfig%20%3D%20%7B%5Cn%20%20customHandler%3A%20new%20MockSpeechHandler()%2C%5Cn%20%20interimResults%3A%20true%2C%5Cn%7D%5Cn%5Cn%2F%2F%20%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%5Cnconst%20handleSpeechStart%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20'%F0%9F%8E%A4%20%E6%AD%A3%E5%9C%A8%E5%BD%95%E9%9F%B3...'%5Cn%20%20interimResult.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSpeechInterim%20%3D%20(transcript%3A%20string)%20%3D%3E%20%7B%5Cn%20%20interimResult.value%20%3D%20transcript%5Cn%7D%5Cn%5Cnconst%20handleSpeechFinal%20%3D%20(transcript%3A%20string)%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20'%E2%9C%85%20%E8%AF%86%E5%88%AB%E5%AE%8C%E6%88%90'%5Cn%20%20interimResult.value%20%3D%20''%5Cn%5Cn%20%20%2F%2F%20%E8%AE%B0%E5%BD%95%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%5Cn%20%20results.value.unshift(%7B%5Cn%20%20%20%20text%3A%20transcript%2C%5Cn%20%20%20%20timestamp%3A%20new%20Date().toLocaleTimeString()%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20%2F%2F%20%E9%99%90%E5%88%B6%E5%8E%86%E5%8F%B2%E8%AE%B0%E5%BD%95%E6%95%B0%E9%87%8F%5Cn%20%20if%20(results.value.length%20%3E%2010)%20%7B%5Cn%20%20%20%20results.value%20%3D%20results.value.slice(0%2C%2010)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20handleSpeechEnd%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20''%5Cn%20%20interimResult.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSpeechError%20%3D%20(error%3A%20Error)%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20''%5Cn%20%20interimResult.value%20%3D%20''%5Cn%20%20console.error('%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E9%94%99%E8%AF%AF%3A'%2C%20error)%5Cn%7D%5Cn%5Cnconst%20handleSubmit%20%3D%20(text%3A%20string)%20%3D%3E%20%7B%5Cn%20%20console.log('%E6%8F%90%E4%BA%A4%E5%86%85%E5%AE%B9%3A'%2C%20text)%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22speechHandlers.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FspeechHandlers.ts%22%2C%22code%22%3A%22import%20Recorder%20from%20'recorder-core'%5Cnimport%20'recorder-core%2Fsrc%2Fengine%2Fpcm'%5Cnimport%20type%20%7B%20SpeechHandler%2C%20SpeechCallbacks%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cn%2F**%5Cn%20*%20recorder-core%20%E7%9A%84%E9%85%8D%E7%BD%AE%E9%80%89%E9%A1%B9%5Cn%20*%2F%5Cninterface%20RecorderOptions%20%7B%5Cn%20%20type%3A%20'wav'%20%7C%20'mp3'%20%7C%20'pcm'%20%7C%20string%20%2F%2F%20%E6%9C%9F%E6%9C%9B%E7%9A%84%E8%BE%93%E5%87%BA%E6%A0%BC%E5%BC%8F%5Cn%20%20sampleRate%3A%2016000%20%7C%208000%20%7C%20number%20%2F%2F%20%E9%87%87%E6%A0%B7%E7%8E%87%5Cn%20%20bitRate%3A%2016%20%7C%208%20%7C%20number%20%2F%2F%20%E6%AF%94%E7%89%B9%E7%8E%87%5Cn%20%20onProcess%3F%3A%20(buffers%3A%20Float32Array%5B%5D%2C%20powerLevel%3A%20number%2C%20duration%3A%20number%2C%20sampleRate%3A%20number)%20%3D%3E%20void%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20recorder-core%20%E5%AE%9E%E4%BE%8B%E7%9A%84%E6%8E%A5%E5%8F%A3%5Cn%20*%2F%5Cninterface%20IRecorder%20%7B%5Cn%20%20open(success%3A%20()%20%3D%3E%20void%2C%20fail%3A%20(msg%3A%20string%2C%20isUserNotAllow%3A%20boolean)%20%3D%3E%20void)%3A%20void%5Cn%20%20start()%3A%20void%5Cn%20%20stop(success%3A%20(blob%3A%20Blob%2C%20duration%3A%20number)%20%3D%3E%20void%2C%20fail%3A%20(msg%3A%20string)%20%3D%3E%20void)%3A%20void%5Cn%20%20close()%3A%20void%5Cn%20%20support()%3A%20boolean%5Cn%7D%5Cn%5Cninterface%20RecorderStatic%20%7B%5Cn%20%20(options%3A%20RecorderOptions)%3A%20IRecorder%5Cn%7D%5Cn%5Cnconst%20TypedRecorder%20%3D%20Recorder%20as%20RecorderStatic%5Cn%5Cn%2F**%5Cn%20*%20%E7%AE%80%E5%8D%95%E7%9A%84%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E7%94%A8%E4%BA%8E%E6%B5%8B%E8%AF%95%E5%92%8C%E6%BC%94%E7%A4%BA%5Cn%20*%2F%5Cnexport%20class%20MockSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20timer%3F%3A%20ReturnType%3Ctypeof%20setInterval%3E%5Cn%5Cn%20%20start(callbacks%3A%20SpeechCallbacks)%3A%20void%20%7B%5Cn%20%20%20%20%2F%2F%20%E7%AB%8B%E5%8D%B3%E8%A7%A6%E5%8F%91%E5%BC%80%E5%A7%8B%5Cn%20%20%20%20callbacks.onStart()%5Cn%5Cn%20%20%20%20%2F%2F%20%E6%A8%A1%E6%8B%9F%E8%AF%86%E5%88%AB%E8%BF%87%E7%A8%8B%5Cn%20%20%20%20let%20step%20%3D%200%5Cn%20%20%20%20const%20steps%20%3D%20%5B'%E6%AD%A3%E5%9C%A8'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3%E5%86%85%E5%AE%B9'%5D%5Cn%5Cn%20%20%20%20this.timer%20%3D%20setInterval(()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(step%20%3C%20steps.length)%20%7B%5Cn%20%20%20%20%20%20%20%20callbacks.onInterim(steps%5Bstep%5D)%5Cn%20%20%20%20%20%20%20%20step%2B%2B%5Cn%20%20%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E5%AE%8C%E6%88%90%E8%AF%86%E5%88%AB%5Cn%20%20%20%20%20%20%20%20const%20finalResult%20%3D%20'%E8%BF%99%E6%98%AF%E4%B8%80%E4%B8%AA%E6%A8%A1%E6%8B%9F%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C'%5Cn%20%20%20%20%20%20%20%20callbacks.onFinal(finalResult)%5Cn%5Cn%20%20%20%20%20%20%20%20callbacks.onEnd()%5Cn%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E6%B8%85%E7%90%86%E5%AE%9A%E6%97%B6%E5%99%A8%E8%B5%84%E6%BA%90%5Cn%20%20%20%20%20%20%20%20this.stop()%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%20500)%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.timer)%20%7B%5Cn%20%20%20%20%20%20clearInterval(this.timer)%5Cn%20%20%20%20%20%20this.timer%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%20%2F%2F%20%E6%A8%A1%E6%8B%9F%E5%A4%84%E7%90%86%E5%99%A8%E6%80%BB%E6%98%AF%E6%94%AF%E6%8C%81%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E4%B8%80%E5%8F%A5%E8%AF%9D%E8%AF%86%E5%88%AB%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E4%BD%BF%E7%94%A8%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%20REST%20API%5Cn%20*%5Cn%20*%20%E9%9C%80%E8%A6%81%E5%A1%AB%E5%85%A5%E8%87%AA%E5%B7%B1%E7%9A%84%20appKey%20%E5%92%8C%20token%5Cn%20*%2F%5Cnexport%20class%20AliyunSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20recorder%3F%3A%20IRecorder%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%20%20private%20appKey%3A%20string%20%3D%20'your_app_key'%5Cn%20%20private%20token%3A%20string%20%3D%20'your_token'%5Cn%5Cn%20%20private%20closeRecorder()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.recorder)%20%7B%5Cn%20%20%20%20%20%20this.recorder.close()%5Cn%20%20%20%20%20%20this.recorder%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20async%20processWithAliyunAPI(audioBlob%3A%20Blob)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.callbacks)%20return%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E5%AE%9E%E9%99%85%E8%AF%B7%E6%B1%82%E4%B8%AD%EF%BC%8C%E9%9C%80%E8%A6%81%E9%85%8D%E7%BD%AE%E4%BB%A3%E7%90%86%E8%BD%AC%E5%8F%91%E5%88%B0%EF%BC%9A%20https%3A%2F%2Fnls-gateway-cn-shanghai.aliyuncs.com%5Cn%20%20%20%20%20%20const%20baseUrl%20%3D%20'%2Fapi%2Faliyun%2Fasr'%5Cn%5Cn%20%20%20%20%20%20const%20params%20%3D%20new%20URLSearchParams(%7B%5Cn%20%20%20%20%20%20%20%20appkey%3A%20this.appKey%2C%5Cn%20%20%20%20%20%20%20%20format%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20sample_rate%3A%20'16000'%2C%5Cn%20%20%20%20%20%20%20%20enable_punctuation_prediction%3A%20'true'%2C%5Cn%20%20%20%20%20%20%20%20enable_inverse_text_normalization%3A%20'true'%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BbaseUrl%7D%3F%24%7Bparams.toString()%7D%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20'Content-Type'%3A%20'application%2Foctet-stream'%2C%5Cn%20%20%20%20%20%20%20%20%20%20'X-NLS-Token'%3A%20this.token%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20audioBlob%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20errorBody%20%3D%20await%20response.text()%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%E9%94%99%E8%AF%AF!%20%E7%8A%B6%E6%80%81%E7%A0%81%3A%20%24%7Bresponse.status%7D%2C%20%E5%93%8D%E5%BA%94%3A%20%24%7BerrorBody%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20result%20%3D%20await%20response.json()%5Cn%5Cn%20%20%20%20%20%20if%20(result.status%20%3D%3D%3D%2020000000%20%26%26%20result.result)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20transcript%20%3D%20result.result%5Cn%20%20%20%20%20%20%20%20this.callbacks.onFinal(transcript)%5Cn%20%20%20%20%20%20%20%20this.callbacks.onEnd(transcript)%5Cn%20%20%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(result.message%20%7C%7C%20%60%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5%EF%BC%8C%E7%8A%B6%E6%80%81%E7%A0%81%3A%20%24%7Bresult.status%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20this.callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20start(callbacks%3A%20SpeechCallbacks)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20this.recorder%20%3D%20TypedRecorder(%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20sampleRate%3A%2016000%2C%5Cn%20%20%20%20%20%20%20%20bitRate%3A%2016%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20this.recorder.open(%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20this.recorder%3F.start()%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onStart()%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20(msg%3A%20string%2C%20isUserNotAllow%3A%20boolean)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20const%20errorMsg%20%3D%20isUserNotAllow%20%3F%20%60%E7%94%A8%E6%88%B7%E6%8B%92%E7%BB%9D%E4%BA%86%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%9D%83%E9%99%90%3A%20%24%7Bmsg%7D%60%20%3A%20%60%E6%97%A0%E6%B3%95%E6%89%93%E5%BC%80%E9%BA%A6%E5%85%8B%E9%A3%8E%3A%20%24%7Bmsg%7D%60%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onError(new%20Error(errorMsg))%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E6%9C%8D%E5%8A%A1%E5%90%AF%E5%8A%A8%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20stop()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.recorder)%20%7B%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.recorder.stop(%5Cn%20%20%20%20%20%20(blob%3A%20Blob%2C%20duration%3A%20number)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20console.log(%60%E5%BD%95%E9%9F%B3%E6%88%90%E5%8A%9F%EF%BC%8C%E6%A0%BC%E5%BC%8F%3A%20%24%7Bblob.type%7D%EF%BC%8C%E6%97%B6%E9%95%BF%3A%20%24%7Bduration%7Dms%60%2C%20blob)%5Cn%20%20%20%20%20%20%20%20this.processWithAliyunAPI(blob)%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20(msg%3A%20string)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error(%60%E5%BD%95%E9%9F%B3%E5%A4%B1%E8%B4%A5%3A%20%24%7Bmsg%7D%60))%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E4%BD%BF%E7%94%A8%20WebSocket%20%E8%BF%9B%E8%A1%8C%E6%B5%81%E5%BC%8F%E8%AF%86%E5%88%AB%5Cn%20*%5Cn%20*%20%E9%9C%80%E8%A6%81%E5%A1%AB%E5%85%A5%E8%87%AA%E5%B7%B1%E7%9A%84%20appKey%20%E5%92%8C%20token%5Cn%20*%2F%5Cnexport%20class%20AliyunRealtimeSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20ws%3F%3A%20WebSocket%5Cn%20%20private%20audioContext%3F%3A%20AudioContext%5Cn%20%20private%20scriptProcessor%3F%3A%20ScriptProcessorNode%5Cn%20%20private%20audioStream%3F%3A%20MediaStream%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%20%20private%20appKey%3A%20string%20%3D%20'your_app_key'%5Cn%20%20private%20token%3A%20string%20%3D%20'your_token'%5Cn%5Cn%20%20private%20generateUUID()%3A%20string%20%7B%5Cn%20%20%20%20%2F%2F%20%E4%BD%BF%E7%94%A8%20crypto.randomUUID()%20%E7%94%9F%E6%88%90%E6%A0%87%E5%87%86%20UUID%EF%BC%8C%E7%84%B6%E5%90%8E%E7%A7%BB%E9%99%A4%E8%BF%9E%E5%AD%97%E7%AC%A6%E5%BE%97%E5%88%B032%E4%BD%8D%E5%AD%97%E7%AC%A6%E4%B8%B2%5Cn%20%20%20%20return%20crypto.randomUUID().replace(%2F-%2Fg%2C%20'')%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%5Cn%20%20async%20start(callbacks%3A%20SpeechCallbacks)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.isSupported())%20%7B%5Cn%20%20%20%20%20%20callbacks.onError(new%20Error('%E5%BD%93%E5%89%8D%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%8D%E6%94%AF%E6%8C%81%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%89%80%E9%9C%80%E7%9A%84%E5%8A%9F%E8%83%BD'))%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%20%20%20%20this.setupWebSocket()%5Cn%20%20%7D%5Cn%5Cn%20%20private%20setupWebSocket()%3A%20void%20%7B%5Cn%20%20%20%20const%20scheme%20%3D%20window.location.protocol%20%3D%3D%3D%20'https%3A'%20%3F%20'wss'%20%3A%20'ws'%5Cn%20%20%20%20%2F%2F%20%E5%AE%9E%E9%99%85%E8%AF%B7%E6%B1%82%E4%B8%AD%EF%BC%8C%E9%9C%80%E8%A6%81%E9%85%8D%E7%BD%AE%E4%BB%A3%E7%90%86%E8%BD%AC%E5%8F%91%E5%88%B0%EF%BC%9A%20wss%3A%2F%2Fnls-gateway-cn-shanghai.aliyuncs.com%5Cn%20%20%20%20const%20socketUrl%20%3D%20%60%24%7Bscheme%7D%3A%2F%2F%24%7Bwindow.location.host%7D%2Fapi%2Faliyun%2Fws%3Ftoken%3D%24%7Bthis.token%7D%60%5Cn%5Cn%20%20%20%20this.ws%20%3D%20new%20WebSocket(socketUrl)%5Cn%5Cn%20%20%20%20this.ws.onopen%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E8%BF%9E%E6%8E%A5%E6%88%90%E5%8A%9F%E5%90%8E%EF%BC%8C%E5%8F%91%E9%80%81%E5%BC%80%E5%A7%8B%E8%AF%86%E5%88%AB%E6%8C%87%E4%BB%A4%5Cn%20%20%20%20%20%20const%20startMessage%20%3D%20%7B%5Cn%20%20%20%20%20%20%20%20header%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20appkey%3A%20this.appKey%2C%5Cn%20%20%20%20%20%20%20%20%20%20namespace%3A%20'SpeechTranscriber'%2C%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'StartTranscription'%2C%5Cn%20%20%20%20%20%20%20%20%20%20task_id%3A%20this.generateUUID()%2C%5Cn%20%20%20%20%20%20%20%20%20%20message_id%3A%20this.generateUUID()%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20payload%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20format%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20%20%20sample_rate%3A%2016000%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_intermediate_result%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_punctuation_prediction%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_inverse_text_normalization%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20this.ws%3F.send(JSON.stringify(startMessage))%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onmessage%20%3D%20(event)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20message%20%3D%20JSON.parse(event.data)%5Cn%5Cn%20%20%20%20%20%20switch%20(message.header.name)%20%7B%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionStarted'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E6%9C%8D%E5%8A%A1%E7%AB%AF%E5%87%86%E5%A4%87%E5%B0%B1%E7%BB%AA%EF%BC%8C%E5%BC%80%E5%A7%8B%E6%8D%95%E6%8D%89%E5%92%8C%E5%8F%91%E9%80%81%E9%9F%B3%E9%A2%91%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onStart()%5Cn%20%20%20%20%20%20%20%20%20%20this.startAudioProcessing()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionResultChanged'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E4%B8%AD%E9%97%B4%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%5Cn%20%20%20%20%20%20%20%20%20%20if%20(message.payload.result)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onInterim(message.payload.result)%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'SentenceEnd'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E5%8F%A5%E5%AD%90%E7%BB%93%E6%9D%9F%EF%BC%8C%E6%9C%80%E7%BB%88%E7%BB%93%E6%9E%9C%5Cn%20%20%20%20%20%20%20%20%20%20if%20(message.payload.result)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onFinal(message.payload.result)%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionCompleted'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E8%AF%86%E5%88%AB%E5%AE%8C%E6%88%90%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onEnd()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TaskFailed'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E4%BB%BB%E5%8A%A1%E5%A4%B1%E8%B4%A5%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error(%60%E4%BB%BB%E5%8A%A1%E5%A4%B1%E8%B4%A5%3A%20%24%7Bmessage.payload.status_text%20%7C%7C%20'%E6%9C%AA%E7%9F%A5%E9%94%99%E8%AF%AF'%7D%60))%5Cn%20%20%20%20%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onerror%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error('WebSocket%20%E8%BF%9E%E6%8E%A5%E5%8F%91%E7%94%9F%E9%94%99%E8%AF%AF'))%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onclose%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20async%20startAudioProcessing()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E8%8E%B7%E5%8F%96%E9%9F%B3%E9%A2%91%E6%B5%81%5Cn%20%20%20%20%20%20this.audioStream%20%3D%20await%20navigator.mediaDevices.getUserMedia(%7B%20audio%3A%20true%20%7D)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87%5Cn%20%20%20%20%20%20const%20AudioContextClass%20%3D%5Cn%20%20%20%20%20%20%20%20window.AudioContext%20%7C%7C%5Cn%20%20%20%20%20%20%20%20(window%20as%20typeof%20window%20%26%20%7B%20webkitAudioContext%3F%3A%20typeof%20AudioContext%20%7D).webkitAudioContext%5Cn%20%20%20%20%20%20if%20(!AudioContextClass)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error('AudioContext%20not%20supported')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20this.audioContext%20%3D%20new%20AudioContextClass(%7B%20sampleRate%3A%2016000%20%7D)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E8%84%9A%E6%9C%AC%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20%20%20%20%20%20this.scriptProcessor%20%3D%20this.audioContext.createScriptProcessor(2048%2C%201%2C%201)%5Cn%5Cn%20%20%20%20%20%20this.scriptProcessor.onaudioprocess%20%3D%20(event)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20const%20inputData%20%3D%20event.inputBuffer.getChannelData(0)%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E8%BD%AC%E6%8D%A2%E4%B8%BA16-bit%20PCM%E6%A0%BC%E5%BC%8F%5Cn%20%20%20%20%20%20%20%20const%20pcmData%20%3D%20new%20Int16Array(inputData.length)%5Cn%20%20%20%20%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20inputData.length%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20pcmData%5Bi%5D%20%3D%20Math.max(-1%2C%20Math.min(1%2C%20inputData%5Bi%5D))%20*%200x7fff%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20if%20(this.ws%3F.readyState%20%3D%3D%3D%20WebSocket.OPEN)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20this.ws.send(pcmData.buffer)%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20source%20%3D%20this.audioContext.createMediaStreamSource(this.audioStream)%5Cn%20%20%20%20%20%20source.connect(this.scriptProcessor)%5Cn%20%20%20%20%20%20this.scriptProcessor.connect(this.audioContext.destination)%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20this.callbacks%3F.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E6%97%A0%E6%B3%95%E5%90%AF%E5%8A%A8%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%88%96%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86'))%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20%2F%2F%20%E5%81%9C%E6%AD%A2%E9%9F%B3%E9%A2%91%E6%B5%81%5Cn%20%20%20%20if%20(this.audioStream)%20%7B%5Cn%20%20%20%20%20%20this.audioStream.getTracks().forEach((track)%20%3D%3E%20track.stop())%5Cn%20%20%20%20%20%20this.audioStream%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E6%96%AD%E5%BC%80%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20%20%20%20if%20(this.scriptProcessor)%20%7B%5Cn%20%20%20%20%20%20this.scriptProcessor.disconnect()%5Cn%20%20%20%20%20%20this.scriptProcessor%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%85%B3%E9%97%AD%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87%5Cn%20%20%20%20if%20(this.audioContext)%20%7B%5Cn%20%20%20%20%20%20this.audioContext.close()%5Cn%20%20%20%20%20%20this.audioContext%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%85%B3%E9%97%AD%20WebSocket%20%E8%BF%9E%E6%8E%A5%5Cn%20%20%20%20if%20(this.ws%20%26%26%20this.ws.readyState%20%3D%3D%3D%20WebSocket.OPEN)%20%7B%5Cn%20%20%20%20%20%20this.ws.close()%5Cn%20%20%20%20%7D%5Cn%20%20%20%20this.ws%20%3D%20undefined%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[6]||(e[6]=()=>{i.value=!1}),vueCode:t(Q)},E({_:2},[x.value?{name:"vue",fn:l(()=>[n(t(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[27]||(e[27]=s("div",{class:"tip custom-block"},[s("p",{class:"custom-block-title"},"参考实现"),s("p",null,[s("code",null,"speechHandlers.ts"),r(" 提供了阿里云一句话识别和实时识别的完整示例，包括录音处理、API 调用、流式识别等。")])],-1)),e[28]||(e[28]=s("h4",{id:"自定义录音-ui",tabindex:"-1"},[r("自定义录音 UI "),s("a",{class:"header-anchor",href:"#自定义录音-ui","aria-label":'Permalink to "自定义录音 UI"'},"​")],-1)),e[29]||(e[29]=s("p",null,"支持完全自定义语音录制界面，适用于移动端按住说话等场景。",-1)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"移动端按住说话",description:"自定义录音 UI，展示移动端按住说话的交互模式。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22CustomRecordingUI.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FCustomRecordingUI.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2020px%5C%22%3E%5Cn%20%20%20%20%3C!--%20%E8%AF%AD%E9%9F%B3%E5%BD%95%E5%88%B6%20UI%20--%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Ch4%3E%7B%7B%20isMobile%20%3F%20'%E7%A7%BB%E5%8A%A8%E7%AB%AF'%20%3A%20'PC%20%E7%AB%AF'%20%7D%7D%20%E8%AF%AD%E9%9F%B3%E5%BD%95%E5%88%B6%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22sender-container%5C%22%5Cn%20%20%20%20%20%20%20%20%40touchmove.prevent%3D%5C%22handleTouchMove%5C%22%5Cn%20%20%20%20%20%20%20%20%40touchend.prevent%3D%5C%22handleTouchEnd%5C%22%5Cn%20%20%20%20%20%20%20%20%40mousemove.prevent%3D%5C%22handleTouchMove%5C%22%5Cn%20%20%20%20%20%20%20%20%40mouseup.prevent%3D%5C%22handleTouchEnd%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%3C!--%20%E8%BE%93%E5%85%A5%E6%A1%86%EF%BC%9A%E4%BD%BF%E7%94%A8%20content%20%E6%8F%92%E6%A7%BD%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%E5%85%A5%E5%8F%A3%20--%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20%20%20v-show%3D%5C%22!showMobileVoiceUI%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20ref%3D%5C%22senderRef%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20v-model%3D%5C%22inputText%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20mode%3D%5C%22single%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20class%3D%5C%22sender%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AallowSpeech%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aspeech%3D%5C%22speechConfig%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20v-if%3D%5C%22isMobile%5C%22%20%23content%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22press-to-talk-trigger%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40touchstart.prevent%3D%5C%22handleTouchStart%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40mousedown.prevent%3D%5C%22handleTouchStart%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3C!--%20%E5%BD%95%E9%9F%B3%E6%B5%AE%E5%B1%82%EF%BC%9A%E6%98%BE%E7%A4%BA%E5%BD%95%E9%9F%B3%E5%8A%A8%E7%94%BB%E5%92%8C%E6%8F%90%E7%A4%BA%20--%3E%5Cn%20%20%20%20%20%20%20%20%3CPressToTalkOverlay%5Cn%20%20%20%20%20%20%20%20%20%20v-model%3Avisible%3D%5C%22showMobileVoiceUI%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AisCanceling%3D%5C%22isCanceling%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AcancelThreshold%3D%5C%22cancelThreshold%5C%22%5Cn%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Cspan%20style%3D%5C%22margin-right%3A%2020px%5C%22%3E%E6%98%AF%E5%90%A6%E6%98%AF%E7%A7%BB%E5%8A%A8%E7%AB%AF%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-switch%20v-model%3D%5C%22isMobile%5C%22%3E%3C%2Ftiny-switch%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TinySwitch%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20PressToTalkOverlay%20from%20'.%2FPressToTalkOverlay.vue'%5Cn%5Cnconst%20senderRef%20%3D%20ref%3CInstanceType%3Ctypeof%20TrSender%3E%3E()%5Cnconst%20inputText%20%3D%20ref('')%5Cnconst%20showMobileVoiceUI%20%3D%20ref(false)%5Cnconst%20isMobile%20%3D%20ref(false)%5Cnconst%20isCanceling%20%3D%20ref(false)%5Cnconst%20startY%20%3D%20ref(0)%5Cnconst%20cancelThreshold%20%3D%2030%5Cn%5Cn%2F%2F%20%E8%AF%AD%E9%9F%B3%E9%85%8D%E7%BD%AE%5Cnconst%20speechConfig%20%3D%20%7B%5Cn%20%20onVoiceButtonClick%3A%20async%20(isRecording%3A%20boolean%2C%20preventDefault%3A%20()%20%3D%3E%20void)%20%3D%3E%20%7B%5Cn%20%20%20%20%2F%2F%20PC%20%E7%AB%AF%EF%BC%9A%E4%BD%BF%E7%94%A8%E9%BB%98%E8%AE%A4%E7%9A%84%E7%82%B9%E5%87%BB%E5%88%87%E6%8D%A2%E5%BD%95%E9%9F%B3%E9%80%BB%E8%BE%91%5Cn%20%20%20%20if%20(!isMobile.value)%20%7B%5Cn%20%20%20%20%20%20return%20%2F%2F%20%E4%B8%8D%E8%B0%83%E7%94%A8%20preventDefault%EF%BC%8C%E7%BB%A7%E7%BB%AD%E6%89%A7%E8%A1%8C%E9%BB%98%E8%AE%A4%E9%80%BB%E8%BE%91%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20Mobile%20%E7%AB%AF%EF%BC%9A%E4%BD%BF%E7%94%A8%E8%87%AA%E5%AE%9A%E4%B9%89%E7%9A%84%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%E9%80%BB%E8%BE%91%5Cn%20%20%20%20preventDefault()%20%2F%2F%20%E9%98%BB%E6%AD%A2%E9%BB%98%E8%AE%A4%E9%80%BB%E8%BE%91%5Cn%5Cn%20%20%20%20if%20(!isRecording)%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E7%82%B9%E5%87%BB%E8%AF%AD%E9%9F%B3%E6%8C%89%E9%92%AE%E6%97%B6%EF%BC%8C%E6%98%BE%E7%A4%BA%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%20UI%5Cn%20%20%20%20%20%20showMobileVoiceUI.value%20%3D%20true%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E5%A6%82%E6%9E%9C%E6%AD%A3%E5%9C%A8%E5%BD%95%E9%9F%B3%EF%BC%8C%E5%81%9C%E6%AD%A2%E5%BD%95%E9%9F%B3%5Cn%20%20%20%20%20%20senderRef.value%3F.stopSpeech()%5Cn%20%20%20%20%20%20showMobileVoiceUI.value%20%3D%20false%5Cn%20%20%20%20%7D%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cn%2F%2F%20%E6%8C%89%E4%B8%8B%E5%BC%80%E5%A7%8B%E5%BD%95%E9%9F%B3%5Cnconst%20handleTouchStart%20%3D%20(e%3A%20TouchEvent%20%7C%20MouseEvent)%20%3D%3E%20%7B%5Cn%20%20const%20clientY%20%3D%20e%20instanceof%20TouchEvent%20%3F%20e.touches%5B0%5D.clientY%20%3A%20e.clientY%5Cn%20%20startY.value%20%3D%20clientY%5Cn%20%20showMobileVoiceUI.value%20%3D%20true%5Cn%20%20isCanceling.value%20%3D%20false%5Cn%20%20senderRef.value%3F.startSpeech()%5Cn%7D%5Cn%5Cn%2F%2F%20%E7%A7%BB%E5%8A%A8%E6%A3%80%E6%B5%8B%E6%98%AF%E5%90%A6%E5%8F%96%E6%B6%88%5Cnconst%20handleTouchMove%20%3D%20(e%3A%20TouchEvent%20%7C%20MouseEvent)%20%3D%3E%20%7B%5Cn%20%20if%20(!showMobileVoiceUI.value)%20return%5Cn%5Cn%20%20const%20currentY%20%3D%20e%20instanceof%20TouchEvent%20%3F%20e.touches%5B0%5D.clientY%20%3A%20e.clientY%5Cn%20%20const%20slideDistance%20%3D%20startY.value%20-%20currentY%5Cn%20%20isCanceling.value%20%3D%20slideDistance%20%3E%20cancelThreshold%5Cn%7D%5Cn%5Cn%2F%2F%20%E6%9D%BE%E5%BC%80%E7%BB%93%E6%9D%9F%E5%BD%95%E9%9F%B3%5Cnconst%20handleTouchEnd%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20if%20(!showMobileVoiceUI.value)%20return%5Cn%5Cn%20%20if%20(isCanceling.value)%20%7B%5Cn%20%20%20%20%2F%2F%20%E5%8F%96%E6%B6%88%E5%BD%95%E9%9F%B3%EF%BC%88%E5%8F%AF%E4%BB%A5%E5%9C%A8%E8%BF%99%E9%87%8C%E6%B8%85%E7%A9%BA%E8%BE%93%E5%85%A5%E6%A1%86%E6%88%96%E5%85%B6%E4%BB%96%E5%A4%84%E7%90%86%EF%BC%89%5Cn%20%20%20%20inputText.value%20%3D%20''%5Cn%20%20%7D%5Cn%5Cn%20%20senderRef.value%3F.stopSpeech()%5Cn%20%20senderRef.value%3F.submit()%5Cn%20%20showMobileVoiceUI.value%20%3D%20false%5Cn%20%20isCanceling.value%20%3D%20false%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.sender-container%20%7B%5Cn%20%20position%3A%20relative%3B%5Cn%20%20min-height%3A%20180px%3B%5Cn%7D%5Cn%5Cn.sender%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20left%3A%200%3B%5Cn%20%20right%3A%200%3B%5Cn%20%20bottom%3A%200%3B%5Cn%7D%5Cn%5Cn.press-to-talk-trigger%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20user-select%3A%20none%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font-size%3A%2016px%3B%5Cn%20%20color%3A%20%23333%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22PressToTalkOverlay.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FPressToTalkOverlay.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20v-if%3D%5C%22visible%5C%22%20class%3D%5C%22mobile-voice-overlay%5C%22%3E%5Cn%20%20%20%20%3C!--%20%E5%BD%95%E9%9F%B3%E5%8A%A8%E7%94%BB%E5%8C%BA%E5%9F%9F%20--%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22recording-wave%20active%5C%22%3E%5Cn%20%20%20%20%20%20%3Cslot%20name%3D%5C%22recording-icon%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cimg%20src%3D%5C%22..%2F..%2F..%2Fpackages%2Fcomponents%2Fsrc%2Fassets%2Fwave.webp%5C%22%20alt%3D%5C%22Recording%20Wave%5C%22%20class%3D%5C%22wave-image%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Fslot%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E6%8F%90%E7%A4%BA%E6%96%87%E6%9C%AC%20--%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22voice-hint%5C%22%20%3Aclass%3D%5C%22%7B%20cancel%3A%20isCanceling%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%7B%7B%20hintText%20%7D%7D%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E6%8C%89%E9%92%AE%20--%3E%5Cn%20%20%20%20%3Cbutton%20class%3D%5C%22voice-btn%20recording%5C%22%20%3Aclass%3D%5C%22%7B%20cancel%3A%20isCanceling%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%3Cslot%20name%3D%5C%22button-text%5C%22%3E%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%3C%2Fslot%3E%5Cn%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cn%5Cninterface%20Props%20%7B%5Cn%20%20visible%3F%3A%20boolean%5Cn%20%20isCanceling%3F%3A%20boolean%5Cn%20%20cancelThreshold%3F%3A%20number%5Cn%20%20recordingText%3F%3A%20string%5Cn%20%20cancelText%3F%3A%20string%5Cn%20%20normalText%3F%3A%20string%5Cn%7D%5Cn%5Cnconst%20props%20%3D%20withDefaults(defineProps%3CProps%3E()%2C%20%7B%5Cn%20%20visible%3A%20false%2C%5Cn%20%20isCanceling%3A%20false%2C%5Cn%20%20cancelThreshold%3A%2030%2C%5Cn%20%20recordingText%3A%20'%E6%9D%BE%E5%BC%80%E5%8F%91%E9%80%81%EF%BC%8C%E4%B8%8A%E6%BB%91%E5%8F%96%E6%B6%88'%2C%5Cn%20%20cancelText%3A%20'%E6%9D%BE%E5%BC%80%E5%8F%96%E6%B6%88'%2C%5Cn%20%20normalText%3A%20'%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D'%2C%5Cn%7D)%5Cn%5Cnconst%20hintText%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20if%20(!props.visible)%20return%20props.normalText%5Cn%20%20if%20(props.isCanceling)%20return%20props.cancelText%5Cn%20%20return%20props.recordingText%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.mobile-voice-overlay%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20left%3A%200%3B%5Cn%20%20right%3A%200%3B%5Cn%20%20bottom%3A%200%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%2026px%3B%5Cn%20%20z-index%3A%201%3B%5Cn%7D%5Cn%5Cn.recording-wave%20%7B%5Cn%20%20display%3A%20none%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20width%3A%20280px%3B%5Cn%7D%5Cn%5Cn.recording-wave.active%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%7D%5Cn%5Cn.voice-hint%20%7B%5Cn%20%20font-size%3A%2015px%3B%5Cn%20%20color%3A%20%23666%3B%5Cn%20%20height%3A%2024px%3B%5Cn%20%20text-align%3A%20center%3B%5Cn%20%20transition%3A%20all%200.3s%20ease%3B%5Cn%20%20font-weight%3A%20400%3B%5Cn%20%20white-space%3A%20nowrap%3B%5Cn%7D%5Cn%5Cn.voice-hint.cancel%20%7B%5Cn%20%20color%3A%20%23ff4d4f%3B%5Cn%20%20font-weight%3A%20500%3B%5Cn%7D%5Cn%5Cn.voice-btn%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%2052px%3B%5Cn%20%20background-color%3A%20%231476ff%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20border%3A%20none%3B%5Cn%20%20color%3A%20white%3B%5Cn%20%20font-size%3A%2017px%3B%5Cn%20%20font-weight%3A%20500%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20transition%3A%20all%200.3s%20ease%3B%5Cn%20%20box-shadow%3A%200%206px%2020px%20rgba(20%2C%20118%2C%20255%2C%200.25)%3B%5Cn%20%20user-select%3A%20none%3B%5Cn%20%20pointer-events%3A%20none%3B%5Cn%7D%5Cn%5Cn.voice-btn.cancel%20%7B%5Cn%20%20background-color%3A%20%23f76360%3B%5Cn%20%20box-shadow%3A%200%206px%2020px%20rgba(247%2C%2099%2C%2096%2C%200.25)%3B%5Cn%7D%5Cn%5Cn.wave-image%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20object-fit%3A%20contain%3B%5Cn%20%20animation%3A%20pulse%201.5s%20ease-in-out%20infinite%3B%5Cn%20%20filter%3A%20drop-shadow(0%202px%208px%20rgba(20%2C%20118%2C%20255%2C%200.3))%3B%5Cn%7D%5Cn%5Cn%40keyframes%20pulse%20%7B%5Cn%20%200%25%2C%5Cn%20%20100%25%20%7B%5Cn%20%20%20%20opacity%3A%200.7%3B%5Cn%20%20%20%20transform%3A%20scale(0.95)%3B%5Cn%20%20%7D%5Cn%20%2050%25%20%7B%5Cn%20%20%20%20opacity%3A%201%3B%5Cn%20%20%20%20transform%3A%20scale(1.05)%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[7]||(e[7]=()=>{i.value=!1}),vueCode:t(j)},E({_:2},[b.value?{name:"vue",fn:l(()=>[n(t(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[30]||(e[30]=s("h3",{id:"文件上传",tabindex:"-1"},[r("文件上传 "),s("a",{class:"header-anchor",href:"#文件上传","aria-label":'Permalink to "文件上传"'},"​")],-1)),e[31]||(e[31]=s("p",null,[r("通过 "),s("code",null,"allowFiles"),r(" 启用文件上传，结合 "),s("code",null,"buttonGroup"),r(" 可动态控制按钮状态和提示。")],-1)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"文件上传",description:"支持文件上传，可动态控制按钮状态和 tooltip 位置。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[8]||(e[8]=()=>{i.value=!1}),vueCode:t(Y)},E({_:2},[f.value?{name:"vue",fn:l(()=>[n(t(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[32]||(e[32]=s("h3",{id:"模板填充",tabindex:"-1"},[r("模板填充 "),s("a",{class:"header-anchor",href:"#模板填充","aria-label":'Permalink to "模板填充"'},"​")],-1)),e[33]||(e[33]=s("p",null,[r("通过 "),s("code",null,"v-model:templateData"),r(" 实现模板的动态设置，光标自动聚焦到第一个可编辑字段。")],-1)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"模板填充",description:"支持动态模板切换，自动聚焦可编辑字段。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[9]||(e[9]=()=>{i.value=!1}),vueCode:t(U)},E({_:2},[D.value?{name:"vue",fn:l(()=>[n(t(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[34]||(e[34]=s("h3",{id:"智能联想",tabindex:"-1"},[r("智能联想 "),s("a",{class:"header-anchor",href:"#智能联想","aria-label":'Permalink to "智能联想"'},"​")],-1)),e[35]||(e[35]=s("p",null,"根据用户输入显示匹配的建议项，支持键盘导航（↑↓ 选择，Enter/Tab 确认）和多种高亮模式。",-1)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"智能联想",description:"动态切换三种高亮模式，对比不同的高亮效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[10]||(e[10]=()=>{i.value=!1}),vueCode:t(z)},E({_:2},[v.value?{name:"vue",fn:l(()=>[n(t(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[36]||(e[36]=A(`<div class="tip custom-block"><p class="custom-block-title">高亮模式</p><ul><li><strong>自动匹配</strong>：传入对象数组，自动高亮与输入内容匹配的部分</li><li><strong>精确指定</strong>：通过 <code>highlights</code> 数组精确指定需要高亮的文本片段</li><li><strong>自定义函数</strong>：通过 <code>highlights</code> 函数完全控制高亮逻辑，实现复杂的高亮规则</li></ul></div><div class="warning custom-block"><p class="custom-block-title">过滤逻辑</p><p>组件<strong>不会自动过滤</strong>联想项，只负责高亮渲染匹配的部分。如需根据输入内容筛选建议项，请在传入 <code>suggestions</code> 之前自行过滤数组。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ref, computed } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> inputText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> allSuggestions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { content: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;ECS-云服务器卡顿问题&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { content: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;CDN-权限管理&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 根据输入内容过滤建议项</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> filteredSuggestions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> computed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">inputText.value) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> allSuggestions</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> allSuggestions.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    item.content.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toLowerCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">includes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(inputText.value.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toLowerCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  )</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> v-model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">inputText</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">filteredSuggestions</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div></div><div class="info custom-block"><p class="custom-block-title">激活按键配置</p><p>默认使用 <code>Enter</code> 和 <code>Tab</code> 键选中联想项，可通过 <code>activeSuggestionKeys</code> 属性自定义激活按键。详见 <a href="#快捷键参考">快捷键参考</a>。</p></div><h2 id="交互定制" tabindex="-1">交互定制 <a class="header-anchor" href="#交互定制" aria-label="Permalink to &quot;交互定制&quot;">​</a></h2><h3 id="提交方式" tabindex="-1">提交方式 <a class="header-anchor" href="#提交方式" aria-label="Permalink to &quot;提交方式&quot;">​</a></h3><p>通过 <code>submitType</code> 属性控制提交快捷键，支持 <code>enter</code>、<code>ctrlEnter</code>、<code>shiftEnter</code> 三种方式。</p>`,6)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"提交方式",description:"支持三种提交快捷键，适应不同使用场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[11]||(e[11]=()=>{i.value=!1}),vueCode:t(q)},E({_:2},[F.value?{name:"vue",fn:l(()=>[n(t(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[37]||(e[37]=A('<div class="info custom-block"><p class="custom-block-title">提交与换行说明</p><ul><li><strong>submitType=&quot;enter&quot;</strong>：按 <code>Enter</code> 提交，按 <code>Ctrl+Enter</code> 或 <code>Shift+Enter</code> 换行</li><li><strong>submitType=&quot;ctrlEnter&quot;</strong>：按 <code>Ctrl+Enter</code> 提交，按 <code>Enter</code> 换行</li><li><strong>submitType=&quot;shiftEnter&quot;</strong>：按 <code>Shift+Enter</code> 提交，按 <code>Enter</code> 换行</li></ul><p>在单行模式下使用换行快捷键时，会自动切换为多行模式。</p></div><h3 id="快捷键参考" tabindex="-1">快捷键参考 <a class="header-anchor" href="#快捷键参考" aria-label="Permalink to &quot;快捷键参考&quot;">​</a></h3><table tabindex="0"><thead><tr><th>快捷键</th><th>功能</th><th>适用条件</th></tr></thead><tbody><tr><td>Enter</td><td>提交内容 / 选中联想项</td><td>submitType=&quot;enter&quot; / 联想开启时</td></tr><tr><td>Ctrl+Enter</td><td>提交内容 / 换行</td><td>submitType=&quot;ctrlEnter&quot; / submitType=&quot;enter&quot;</td></tr><tr><td>Shift+Enter</td><td>提交内容 / 换行</td><td>submitType=&quot;shiftEnter&quot; / submitType=&quot;enter&quot;</td></tr><tr><td>Tab</td><td>选中联想项</td><td>联想开启时</td></tr><tr><td>Esc</td><td>取消语音/关闭联想</td><td>对应功能激活时</td></tr><tr><td>↑ / ↓</td><td>导航联想项</td><td>联想开启时</td></tr></tbody></table><div class="tip custom-block"><p class="custom-block-title">换行快捷键说明</p><p><strong>当 <code>submitType=&quot;enter&quot;</code> 时</strong>，支持以下换行方式：</p><ul><li><strong>Ctrl+Enter</strong>：插入换行符（单行模式会自动切换为多行模式）</li><li><strong>Shift+Enter</strong>：插入换行符（单行模式会自动切换为多行模式）</li></ul><p><strong>当 <code>submitType=&quot;ctrlEnter&quot;</code> 或 <code>submitType=&quot;shiftEnter&quot;</code> 时</strong>，单独按 <code>Enter</code> 键即可换行。</p></div><div class="warning custom-block"><p class="custom-block-title">自定义选中按键</p><p>通过 <code>activeSuggestionKeys</code> 可自定义选中联想项的按键，但请勿使用纯修饰键（Ctrl/Shift/Alt/Meta），避免劫持常用快捷键。</p></div><h3 id="自定义按钮" tabindex="-1">自定义按钮 <a class="header-anchor" href="#自定义按钮" aria-label="Permalink to &quot;自定义按钮&quot;">​</a></h3><p>通过 <code>footer-left</code> 和 <code>footer-right</code> 插槽在底部区域添加自定义按钮。</p>',7)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"自定义按钮",description:"在底部区域添加自定义按钮，保留原有功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[12]||(e[12]=()=>{i.value=!1}),vueCode:t(G)},E({_:2},[m.value?{name:"vue",fn:l(()=>[n(t(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[38]||(e[38]=s("h3",{id:"插槽布局",tabindex:"-1"},[r("插槽布局 "),s("a",{class:"header-anchor",href:"#插槽布局","aria-label":'Permalink to "插槽布局"'},"​")],-1)),e[39]||(e[39]=s("p",null,"综合展示各种插槽的使用方式：",-1)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"插槽综合示例",description:"展示 header、prefix、actions、footer 等插槽的使用。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[13]||(e[13]=()=>{i.value=!1}),vueCode:t(L)},E({_:2},[y.value?{name:"vue",fn:l(()=>[n(t(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[40]||(e[40]=s("h3",{id:"装饰性内容",tabindex:"-1"},[r("装饰性内容 "),s("a",{class:"header-anchor",href:"#装饰性内容","aria-label":'Permalink to "装饰性内容"'},"​")],-1)),e[41]||(e[41]=s("p",null,"在输入框内显示提示信息，适用于服务状态提示、功能引导等场景。",-1)),e[42]||(e[42]=s("div",{class:"tip custom-block"},[s("p",{class:"custom-block-title"},"自动禁用"),s("p",null,[r("使用 "),s("code",null,"decorativeContent"),r(" 插槽时，输入框会自动禁用，仅展示插槽内容。")])],-1)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"装饰性内容",description:"在输入框内显示提示信息和可点击链接。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[14]||(e[14]=()=>{i.value=!1}),vueCode:t(V)},E({_:2},[B.value?{name:"vue",fn:l(()=>[n(t(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[43]||(e[43]=s("h2",{id:"样式配置",tabindex:"-1"},[r("样式配置 "),s("a",{class:"header-anchor",href:"#样式配置","aria-label":'Permalink to "样式配置"'},"​")],-1)),e[44]||(e[44]=s("h3",{id:"紧凑模式",tabindex:"-1"},[r("紧凑模式 "),s("a",{class:"header-anchor",href:"#紧凑模式","aria-label":'Permalink to "紧凑模式"'},"​")],-1)),e[45]||(e[45]=s("p",null,[r("通过添加 "),s("code",null,"tr-sender-compact"),r(" CSS 类启用紧凑模式，适用于空间受限的场景。")],-1)),h(n(t(u),null,null,512),[[c,i.value]]),n(o,null,{default:l(()=>[n(t(k),{title:"紧凑模式",description:"更小的字体、间距和图标，适合空间受限的场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[15]||(e[15]=()=>{i.value=!1}),vueCode:t(M)},E({_:2},[g.value?{name:"vue",fn:l(()=>[n(t(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[46]||(e[46]=A(`<hr><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td>autofocus</td><td>自动获取焦点</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>autoSize</td><td>自动调整高度</td><td><code>boolean | { minRows: number, maxRows: number }</code></td><td><code>false</code></td></tr><tr><td>allowSpeech</td><td>是否开启语音输入</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>allowFiles</td><td>是否允许文件上传</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td>clearable</td><td>是否可清空</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>disabled</td><td>是否禁用</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>modelValue</td><td>绑定值(v-model)</td><td><code>string</code></td><td><code>&#39;&#39;</code></td></tr><tr><td>defaultValue</td><td>默认值(非响应式)</td><td><code>string</code></td><td><code>&#39;&#39;</code></td></tr><tr><td>loading</td><td>是否加载中</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>mode</td><td>输入框类型</td><td><code>&#39;single&#39; | &#39;multiple&#39;</code></td><td><code>&#39;single&#39;</code></td></tr><tr><td>maxLength</td><td>最大输入长度</td><td><code>number</code></td><td><code>Infinity</code></td></tr><tr><td>buttonGroup</td><td>按钮组配置</td><td><code>ButtonGroupConfig</code></td><td><code>{}</code></td></tr><tr><td>placeholder</td><td>输入框占位文本</td><td><code>string</code></td><td><code>&#39;请输入内容...&#39;</code></td></tr><tr><td>speech</td><td>语音识别配置</td><td><code>&#39;boolean&#39; | &#39;SpeechConfig&#39;</code></td><td>无</td></tr><tr><td>showWordLimit</td><td>是否显示字数统计</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>stopText</td><td>停止按钮文字</td><td><code>string</code></td><td><code>仅显示图标</code></td></tr><tr><td>submitType</td><td>提交方式</td><td><code>&#39;enter&#39; | &#39;ctrl+enter&#39; | &#39;shift+enter&#39;</code></td><td><code>&#39;enter&#39;</code></td></tr><tr><td>theme</td><td>主题样式</td><td><code>&#39;light&#39; | &#39;dark&#39;</code></td><td><code>&#39;light&#39;</code></td></tr><tr><td>suggestions</td><td>输入建议列表</td><td><code>(string | SuggestionItem)[]</code></td><td><code>[]</code></td></tr><tr><td>suggestionPopupWidth</td><td>输入建议弹窗宽度</td><td><code>&#39;number&#39; | &#39;string&#39;</code></td><td><code>400px</code></td></tr><tr><td>activeSuggestionKeys</td><td>激活建议项的按键</td><td><code>string[]</code></td><td><code>[&#39;Enter&#39;, &#39;Tab&#39;]</code></td></tr><tr><td>templateData</td><td>模板数据，用于初始化或 v-model 更新</td><td><code>UserItem[]</code></td><td><code>[]</code></td></tr></tbody></table><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><table tabindex="0"><thead><tr><th>插槽名称</th><th>描述</th><th>默认内容</th></tr></thead><tbody><tr><td><code>header</code></td><td>头部插槽，位于输入框上方</td><td>无</td></tr><tr><td><code>prefix</code></td><td>前缀插槽，位于输入框左侧</td><td>无</td></tr><tr><td><code>actions</code></td><td>后缀插槽，位于输入框右侧</td><td>单行模式下的操作按钮</td></tr><tr><td><code>content</code></td><td>内容插槽</td><td>输入内容区域</td></tr><tr><td><code>footer-left</code></td><td>底部左侧插槽，保留字数限制</td><td>字数限制</td></tr><tr><td><code>footer-right</code></td><td>底部右侧插槽，保留操作按钮</td><td>多行模式下的操作按钮</td></tr><tr><td><code>footer</code></td><td>底部完全自定义插槽(向后兼容)</td><td>无 (会覆盖其他底部元素)</td></tr><tr><td><code>decorativeContent</code></td><td>装饰性内容插槽，启用后禁止输入</td><td>无</td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td>update:modelValue</td><td>输入值变化时触发(v-model)</td><td><code>(value: string)</code></td></tr><tr><td>blur</td><td>输入框失去焦点时触发</td><td><code>(event: FocusEvent)</code></td></tr><tr><td>change</td><td>输入值改变且失焦时触发</td><td><code>(value: string)</code></td></tr><tr><td>focus</td><td>输入框获得焦点时触发</td><td><code>(event: FocusEvent)</code></td></tr><tr><td>input</td><td>输入值改变时触发</td><td><code>(value: string)</code></td></tr><tr><td>submit</td><td>提交内容时触发</td><td><code>(value: string)</code></td></tr><tr><td>clear</td><td>清空内容时触发</td><td><code>()</code></td></tr><tr><td>cancel</td><td>取消发送（加载状态）时触发</td><td><code>()</code></td></tr><tr><td>speech-start</td><td>语音识别开始时触发</td><td><code>()</code></td></tr><tr><td>speech-end</td><td>语音识别结束时触发</td><td><code>(transcript: string)</code></td></tr><tr><td>speech-interim</td><td>语音识别中间结果时触发</td><td><code>(transcript: string)</code></td></tr><tr><td>speech-error</td><td>语音识别错误时触发</td><td><code>(error: Error)</code></td></tr><tr><td>suggestion-select</td><td>选择输入建议时触发</td><td><code>(value: string)</code></td></tr></tbody></table><h2 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h2><table tabindex="0"><thead><tr><th>方法名</th><th>说明</th><th>参数</th><th>返回值</th></tr></thead><tbody><tr><td>focus</td><td>使输入框获取焦点</td><td>-</td><td><code>void</code></td></tr><tr><td>blur</td><td>使输入框失去焦点</td><td>-</td><td><code>void</code></td></tr><tr><td>clear</td><td>清空输入内容</td><td>-</td><td><code>void</code></td></tr><tr><td>submit</td><td>手动触发提交事件</td><td>-</td><td><code>void</code></td></tr><tr><td>startSpeech</td><td>开始语音识别</td><td>-</td><td><code>Promise&lt;void&gt;</code></td></tr><tr><td>stopSpeech</td><td>停止语音识别</td><td>-</td><td><code>void</code></td></tr><tr><td>activateTemplateFirstField</td><td>激活模板的第一个输入字段</td><td>-</td><td><code>void</code></td></tr></tbody></table><h2 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h2><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 语音回调函数集合</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechCallbacks</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onStart</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onInterim</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">transcript</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onFinal</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">transcript</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onEnd</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">transcript</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onError</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">error</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自定义语音处理器接口</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechHandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  start</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">callbacks</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechCallbacks</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  stop</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  isSupported</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  customHandler</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechHandler</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 自定义语音处理器</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  lang</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 识别语言，默认浏览器语言</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  continuous</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否持续识别</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  interimResults</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否返回中间结果</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  autoReplace</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否自动替换当前输入内容</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onVoiceButtonClick</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">isRecording</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">preventDefault</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 录音按钮点击拦截器</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ControlState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tooltips</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Function</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 工具提示</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否禁用</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tooltipPlacement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;top&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;top-start&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;top-end&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;bottom&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;bottom-start&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;bottom-end&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;left&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;left-start&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;left-end&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;right&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;right-start&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;right-end&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // tooltip 弹窗位置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fileUploadConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  accept</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 接受的文件类型</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  multiple</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否支持多选文件</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reset</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否重置文件选择</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VoiceButtonConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 自定义语音图标（未录音状态）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ButtonGroupConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  file</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ControlState</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fileUploadConfig</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 文件上传按钮</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  submit</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ControlState</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 提交按钮</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  voice</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VoiceButtonConfig</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 语音按钮</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 高亮文本片段类型</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionTextPart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文本片段</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  isMatch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 是否高亮</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 高亮函数类型</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HighlightFunction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">suggestionText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">inputText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionTextPart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 建议项类型</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 建议项文本内容</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  highlights</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HighlightFunction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 高亮方式</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,13))])}}});export{i2 as __pageData,a2 as default};

const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/CompactMode.BZlkPeND.js","assets/chunks/theme.CL4NAtuH.js","assets/chunks/framework.CSeOnaMy.js","assets/chunks/All.BdLeUgIA.js","assets/chunks/Suggestions.CEiUvrWU.js","assets/chunks/Template.BB4Wt303.js","assets/chunks/FileUpload.Dbbgh5bq.js","assets/chunks/DecorativeContent.KYeY1XaS.js","assets/chunks/CustomRecordingUI.CuXFrBeJ.js","assets/chunks/CustomSpeech.D60CUfNY.js","assets/chunks/voiceInput.D1gK81ix.js","assets/chunks/DeepThink.ClH7phPN.js","assets/chunks/Clearable.CeX9h5PA.js","assets/chunks/AutoSize.C_j9Xqc8.js","assets/chunks/Mode.BTl6k9V9.js"])))=>i.map(i=>d[i]);
import{D as d,v as p,V as h,p as Z,C as I,c as W,o as R,a2 as o,af as c,G as e,j as l,ag as E,k as t,w as a,ai as k,a as C}from"./chunks/framework.CSeOnaMy.js";import{L as u,N as g}from"./chunks/index.BlMrQgh7.js";const q=`<template>
  <div class="demo-container">
    <h3>紧凑模式配置演示</h3>
    <p>通过添加 <code>tr-sender-compact</code> CSS类可以启用紧凑样式，适用于空间受限的场景。</p>

    <div class="mode-section">
      <h4>默认样式（宽松模式）</h4>
      <p>适用于独立页面或全屏对话场景，具有较大的字体（16px）、宽松的内边距、大圆角（26px）和大发送图标（36px）。</p>

      <div class="example-group">
        <h5>单行模式</h5>
        <tr-sender mode="single" placeholder="默认单行模式..." style="margin-bottom: 10px" />

        <h5>多行模式</h5>
        <tr-sender mode="multiple" placeholder="默认多行模式..." :showWordLimit="true" :maxLength="200" />
      </div>
    </div>

    <div class="mode-section">
      <h4>紧凑模式</h4>
      <p>适用于侧边栏、抽屉或紧凑界面，具有较小的字体（14px）、紧凑的内边距、小圆角（24px）和小发送图标（32px）。</p>

      <div class="example-group compact-container">
        <h5>单行模式</h5>
        <tr-sender class="tr-sender-compact" mode="single" placeholder="紧凑单行模式..." style="margin-bottom: 10px" />

        <h5>多行模式</h5>
        <tr-sender
          class="tr-sender-compact"
          mode="multiple"
          placeholder="紧凑多行模式..."
          :showWordLimit="true"
          :maxLength="100"
        />
      </div>
    </div>

    <div class="comparison-section">
      <h4>样式对比</h4>
      <div class="comparison-grid">
        <div class="comparison-item">
          <h5>默认样式</h5>
          <tr-sender mode="single" placeholder="默认样式示例" />
        </div>
        <div class="comparison-item">
          <h5>紧凑样式</h5>
          <tr-sender class="tr-sender-compact" mode="single" placeholder="紧凑样式示例" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>

<style scoped>
.demo-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mode-section {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.example-group {
  margin-top: 12px;
}

.compact-container {
  max-width: 300px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
}

.custom-vars-section {
  border: 1px solid #1476ff;
  border-radius: 8px;
  padding: 16px;
  background: rgba(20, 118, 255, 0.02);
}

.custom-example {
  margin: 12px 0;
  max-width: 280px;
}

.comparison-section {
  border: 1px solid #52c41a;
  border-radius: 8px;
  padding: 16px;
  background: rgba(82, 196, 26, 0.02);
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 12px;
}

.comparison-item {
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: white;
}

.code-example {
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  color: #333;
  overflow-x: auto;
}

h3 {
  color: #333;
  margin-bottom: 8px;
}

h4 {
  color: #1476ff;
  margin-bottom: 8px;
}

h5 {
  color: #666;
  font-size: 14px;
  margin: 8px 0 4px 0;
}

p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

code {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
}
</style>
`,P=`<template>
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
`,V=`<template>
  <div class="demo-container">
    <h3>单行模式 (mode="single") - 默认</h3>
    <tr-sender
      mode="single"
      v-model="textSingle"
      :suggestions="sampleSuggestions"
      placeholder="尝试输入 'ECS', 'CDN' 等查看联想效果。"
    ></tr-sender>
    <p>当前输入: {{ textSingle }}</p>

    <h3>多行模式 (mode="multiple")</h3>
    <tr-sender
      v-model="textMultiple"
      :suggestions="sampleSuggestions"
      mode="multiple"
      placeholder="多行模式联想..."
    ></tr-sender>
    <p>当前输入: {{ textMultiple }}</p>

    <h3>自定义高亮方式</h3>
    <tr-sender
      v-model="textCustomHighlight"
      :suggestions="customHighlightSuggestions"
      mode="single"
      placeholder="输入'云'或'CDN'查看自定义高亮..."
    ></tr-sender>
    <p>当前输入: {{ textCustomHighlight }}</p>

    <h3>自定义激活按键</h3>
    <tr-sender
      v-model="textCustomKeys"
      :suggestions="sampleSuggestions"
      :activeSuggestionKeys="['Tab']"
      mode="single"
      placeholder="输入'ECS'后按 Tab 键选中联想项..."
    ></tr-sender>
    <p>当前输入: {{ textCustomKeys }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, type SuggestionTextPart } from '@opentiny/tiny-robot'

const textSingle = ref('')
const textMultiple = ref('')
const textCustomHighlight = ref('')
const textCustomKeys = ref('')

// 基础建议项
const sampleSuggestions = ref([
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-云服务器卡顿' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'ECS-搜索ECS' },
  { content: 'ECS-云服务器状态' },
  { content: 'ECS-免费云服务器' },
  { content: 'CDN-权限管理' },
  { content: 'CDN常见问题场景以及解决方法有哪些？' },
  { content: 'CDN-CDN是否支持全站加速？' },
  { content: 'CDN-添加CDN加速域名' },
])

// 自定义高亮建议项
const customHighlightSuggestions = ref([
  // 使用预定义高亮字符串数组
  {
    content: 'ECS-云服务器卡顿问题',
    highlights: ['云服务器', '卡顿'],
  },
  // 使用自定义高亮函数
  {
    content: 'ECS-备份弹性云服务器',
    highlights: (text: string) => {
      // 简单示例：高亮所有"云"字
      const parts: SuggestionTextPart[] = []
      let lastIndex = 0

      // 查找所有"云"字并高亮
      const keyword = '云'
      let index = text.indexOf(keyword)
      while (index !== -1) {
        // 添加前面的非匹配部分
        if (index > lastIndex) {
          parts.push({ text: text.substring(lastIndex, index), isMatch: false })
        }

        // 添加匹配部分
        parts.push({ text: keyword, isMatch: true })

        lastIndex = index + keyword.length
        index = text.indexOf(keyword, lastIndex)
      }

      // 添加最后剩余的部分
      if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex), isMatch: false })
      }

      return parts
    },
  },
  // 不指定高亮，使用默认高亮逻辑
  {
    content: 'CDN-权限管理与配置',
  },
  {
    content: 'CDN常见问题场景以及解决方法有哪些？',
    highlights: ['CDN', '问题', '解决方法'],
  },
])
<\/script>

<style scoped>
.demo-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h3 {
  margin-bottom: 5px;
}

p {
  margin-top: 5px;
  margin-bottom: 10px;
  font-size: 0.9em;
  color: #555;
}
</style>
`,X=`<template>
  <div class="app-container">
    <h4 style="margin-bottom: 20px">模板编辑器</h4>
    <tr-sender
      v-model="inputText"
      v-model:template-data="templateData"
      mode="multiple"
      clearable
      @submit="handleSubmit"
      ref="senderRef"
    />

    <div class="template-selector-container">
      <h4>请选择模板</h4>
      <p style="font-size: 12px; color: #666; margin: 5px 0">
        💡 提示：设置模板后，你可以尝试复制模板字段并粘贴到其他位置，样式会自动保持一致
      </p>
    </div>

    <div class="template-selector">
      <button
        v-for="(item, index) in templates"
        :key="index"
        @click="selectTemplate(item)"
        class="template-button"
        :class="{ active: activeTemplateName === item.name }"
      >
        {{ item.name }}
      </button>
    </div>

    <!-- 实时显示输入值用于测试 -->
    <div class="real-time-value" v-if="inputText">
      <h4>当前输入值 (用于测试复制粘贴功能):</h4>
      <div class="value-display">
        <code>{{ inputText }}</code>
      </div>
      <p style="font-size: 12px; color: #666; margin-top: 8px">
        复制粘贴后，这里的值应该会实时更新。如果没有更新，说明存在问题。
      </p>
    </div>

    <div class="test-info" v-if="activeTemplateName">
      <h4>当前模板: {{ activeTemplateName }}</h4>
      <pre>{{ JSON.stringify(templateData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender, type UserItem } from '@opentiny/tiny-robot'
import { ref, onMounted } from 'vue'

const inputText = ref('')
const senderRef = ref(null)
const templateData = ref<UserItem[]>([])
const activeTemplateName = ref('')

// 预定义模板
const templates = [
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
    data: [
      { type: 'text', content: '尊敬的' },
      { type: 'template', content: '李明先生' },
      { type: 'text', content: '，您的' },
      { type: 'template', content: '定制化软件开发项目' },
      { type: 'text', content: '已经' },
      { type: 'template', content: '进入开发阶段' },
      { type: 'text', content: '，预计将在' },
      { type: 'template', content: '三个工作日内' },
      { type: 'text', content: '完成。' },
    ],
  },
  {
    name: '模板4',
    data: [
      { type: 'template', content: '北京某某科技有限公司产品研发部技术总监' },
      { type: 'text', content: '向' },
      { type: 'template', content: '上海某某集团信息技术部系统架构师团队负责人' },
      { type: 'text', content: '发送关于' },
      { type: 'template', content: '关于新一代人工智能客服系统设计方案的深度讨论与合作意向洽谈' },
      { type: 'text', content: '的邮件。' },
    ],
  },
  {
    name: '模板5',
    data: [
      { type: 'template', content: 'AI' },
      { type: 'text', content: '和' },
      { type: 'template', content: '企业级人工智能解决方案技术研讨会暨产品发布会' },
      { type: 'text', content: '在' },
      { type: 'template', content: '明天' },
      { type: 'text', content: '进行' },
      { type: 'template', content: '深度技术交流' },
      { type: 'text', content: '。' },
    ],
  },
  {
    name: '模板6',
    data: [{ type: 'text', content: 'ECS 服务器的最新版本' }],
  },
]

// 选择模板
const selectTemplate = (template) => {
  activeTemplateName.value = template.name
  templateData.value = template.data
  senderRef.value?.activateTemplateFirstField()
}

// 提交处理
const handleSubmit = (text) => {
  console.log('提交模板填充内容:', text)
  alert(\`提交内容: \${text}\`)
}

onMounted(() => {
  selectTemplate(templates[0])
})
<\/script>

<style scoped>
.app-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.template-selector {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.template-button {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-button:hover {
  background: #e0e0e0;
}

.template-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.real-time-value {
  margin: 20px 0;
  padding: 15px;
  background: #e8f4f8;
  border-radius: 8px;
  border: 1px solid #b8daff;
}

.real-time-value h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 14px;
}

.value-display {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin: 8px 0;
  min-height: 20px;
}

.value-display code {
  background: transparent;
  padding: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #212529;
  word-break: break-all;
}

.test-info {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.test-info h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.test-info p {
  margin: 0 0 15px 0;
}

.test-info code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.test-info pre {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin: 0;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
}
</style>
`,G=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <!-- 默认位置 (top) -->
    <div>
      <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #666">默认 Tooltip 位置 (top)</h4>
      <tr-sender
        mode="multiple"
        :allow-files="true"
        :button-group="buttonGroup"
        @files-selected="handleFilesSelected"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const renderTooltip = () => {
  return h(
    'div',
    {
      style: {
        fontSize: '12px',
        maxWidth: '200px',
      },
    },
    [h('div', null, '• 支持最多上传3个图片（每个 10MB 以内）'), h('div', null, '• 支持图片格式JPG、PNG')],
  )
}

const buttonGroup = ref({
  file: {
    tooltips: renderTooltip,
    disabled: false,
    accept: 'image/jpeg, image/png',
  },
  submit: {
    tooltips: '',
    disabled: false,
  },
})

const handleFilesSelected = (files: File[]) => {
  console.log(files)
  // 文件数量大于3无法继续上传，禁用上传按钮并提示
  if (files.length > 3) {
    buttonGroup.value.file.disabled = true
    buttonGroup.value.submit.disabled = true
    buttonGroup.value.submit.tooltips = '请上传完再发送'
  } else {
    buttonGroup.value.file.disabled = false
    buttonGroup.value.submit.disabled = false
    buttonGroup.value.submit.tooltips = ''
  }
}

const handleSubmit = (message: string) => {
  console.log('submit', message)
}
<\/script>
`,L=`<template>
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
`,M=`<template>
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
`,z=`<template>
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
import { AliyunSpeechHandler } from './speechHandlers'

// 组件状态
const inputText = ref('')
const speechStatus = ref('')
const interimResult = ref('')
const results = ref<Array<{ text: string; timestamp: string }>>([])

// 语音配置 - 使用模拟处理器
const speechConfig = {
  customHandler: new AliyunSpeechHandler(),
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
`,U=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <h4>混合输入</h4>
    <tr-sender mode="multiple" :allowSpeech="true" :speech="{ autoReplace: false, interimResults: true }" />
    <h4>不间断语音输入</h4>
    <tr-sender mode="multiple" :allowSpeech="true" :speech="{ autoReplace: true, continuous: true }" />
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>
`,N=`<template>
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
`,Y=`<template>
  <tr-sender clearable />
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>
`,j=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <tr-sender mode="multiple" :autoSize="true" placeholder="autosize 为 true" />
    <tr-sender
      mode="multiple"
      :autoSize="{ minRows: 2, maxRows: 3 }"
      placeholder="autosize 为 {minRows: 2, maxRows: 3}"
    />
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>
`,Q=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <h4>单行模式</h4>
    <tr-sender />
    <h4>多行模式</h4>
    <tr-sender mode="multiple" />
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>
`,$=JSON.parse('{"title":"Sender 消息输入框组件","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/sender.md","filePath":"components/sender.md"}'),J={name:"components/sender.md"},n2=Object.assign(J,{setup(O){const B=d();p(async()=>{B.value=(await h(async()=>{const{default:i}=await import("./chunks/CompactMode.BZlkPeND.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const y=d();p(async()=>{y.value=(await h(async()=>{const{default:i}=await import("./chunks/All.BdLeUgIA.js");return{default:i}},__vite__mapDeps([3,1,2]))).default});const F=d();p(async()=>{F.value=(await h(async()=>{const{default:i}=await import("./chunks/Suggestions.CEiUvrWU.js");return{default:i}},__vite__mapDeps([4,1,2]))).default});const m=d();p(async()=>{m.value=(await h(async()=>{const{default:i}=await import("./chunks/Template.BB4Wt303.js");return{default:i}},__vite__mapDeps([5,1,2]))).default});const v=d();p(async()=>{v.value=(await h(async()=>{const{default:i}=await import("./chunks/FileUpload.Dbbgh5bq.js");return{default:i}},__vite__mapDeps([6,1,2]))).default});const D=d();p(async()=>{D.value=(await h(async()=>{const{default:i}=await import("./chunks/DecorativeContent.KYeY1XaS.js");return{default:i}},__vite__mapDeps([7,1,2]))).default});const b=d();p(async()=>{b.value=(await h(async()=>{const{default:i}=await import("./chunks/CustomRecordingUI.CuXFrBeJ.js");return{default:i}},__vite__mapDeps([8,2,1]))).default});const f=d();p(async()=>{f.value=(await h(async()=>{const{default:i}=await import("./chunks/CustomSpeech.D60CUfNY.js");return{default:i}},__vite__mapDeps([9,1,2]))).default});const x=d();p(async()=>{x.value=(await h(async()=>{const{default:i}=await import("./chunks/voiceInput.D1gK81ix.js");return{default:i}},__vite__mapDeps([10,1,2]))).default});const T=d();p(async()=>{T.value=(await h(async()=>{const{default:i}=await import("./chunks/DeepThink.ClH7phPN.js");return{default:i}},__vite__mapDeps([11,1,2]))).default});const S=d();p(async()=>{S.value=(await h(async()=>{const{default:i}=await import("./chunks/Clearable.CeX9h5PA.js");return{default:i}},__vite__mapDeps([12,1,2]))).default});const _=d();p(async()=>{_.value=(await h(async()=>{const{default:i}=await import("./chunks/AutoSize.C_j9Xqc8.js");return{default:i}},__vite__mapDeps([13,1,2]))).default});const s=Z(!0),w=d();return p(async()=>{w.value=(await h(async()=>{const{default:i}=await import("./chunks/Mode.BTl6k9V9.js");return{default:i}},__vite__mapDeps([14,1,2]))).default}),(i,n)=>{const r=I("ClientOnly"),A=I("tr-sender");return R(),W("div",null,[n[13]||(n[13]=o("",7)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"基础用法",description:"Sender 组件的基础用法，支持单行和多行模式。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[0]||(n[0]=()=>{s.value=!1}),vueCode:t(Q)},k({_:2},[w.value?{name:"vue",fn:a(()=>[e(t(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[14]||(n[14]=l("h3",{id:"状态控制",tabindex:"-1"},[C("状态控制 "),l("a",{class:"header-anchor",href:"#状态控制","aria-label":'Permalink to "状态控制"'},"​")],-1)),n[15]||(n[15]=l("h4",{id:"加载状态",tabindex:"-1"},[C("加载状态 "),l("a",{class:"header-anchor",href:"#加载状态","aria-label":'Permalink to "加载状态"'},"​")],-1)),n[16]||(n[16]=l("p",null,[C("通过设置"),l("code",null,"loading"),C("属性控制组件的加载状态，加载状态下输入框将显示加载动画并禁用输入。 在加载状态下，点击加载图标可以取消发送操作，这会触发 "),l("code",null,"cancel"),C(" 事件。")],-1)),e(A,{loading:!0,stopText:"停止回答"}),n[17]||(n[17]=o("",3)),e(A,{disabled:!0}),n[18]||(n[18]=o("",5)),e(A,{mode:"multiple",showWordLimit:!0,maxLength:20,defaultValue:"测试超出字数限制，当前已经超过了字数限制。"}),n[19]||(n[19]=o("",5)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"自动调整高度",description:"Sender 组件支持自动调整高度。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[1]||(n[1]=()=>{s.value=!1}),vueCode:t(j)},k({_:2},[_.value?{name:"vue",fn:a(()=>[e(t(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[20]||(n[20]=l("h4",{id:"可清空输入",tabindex:"-1"},[C("可清空输入 "),l("a",{class:"header-anchor",href:"#可清空输入","aria-label":'Permalink to "可清空输入"'},"​")],-1)),n[21]||(n[21]=l("p",null,[C("通过"),l("code",null,"clearable"),C("属性添加清空按钮，方便用户快速清除输入内容。")],-1)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"清空内容",description:"在用户输入内容后才显示，没有内容时自动隐藏",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[2]||(n[2]=()=>{s.value=!1}),vueCode:t(Y)},k({_:2},[S.value?{name:"vue",fn:a(()=>[e(t(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[22]||(n[22]=o("",4)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"自定义按钮",description:"Sender 组件支持在多行模式下灵活定制底部区域。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[3]||(n[3]=()=>{s.value=!1}),vueCode:t(N)},k({_:2},[T.value?{name:"vue",fn:a(()=>[e(t(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[23]||(n[23]=o("",4)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"语音输入",description:"可以使用 speech 属性进行配置",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[4]||(n[4]=()=>{s.value=!1}),vueCode:t(U)},k({_:2},[x.value?{name:"vue",fn:a(()=>[e(t(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[24]||(n[24]=l("h4",{id:"自定义语音输入",tabindex:"-1"},[C("自定义语音输入 "),l("a",{class:"header-anchor",href:"#自定义语音输入","aria-label":'Permalink to "自定义语音输入"'},"​")],-1)),n[25]||(n[25]=l("p",null,"Sender 组件支持自定义语音输入服务，可以集成百度、阿里云、Azure 等第三方语音识别服务。",-1)),n[26]||(n[26]=l("p",null,[l("strong",null,"基本案例")],-1)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"自定义语音识别",description:"模拟语音识别的完整示例，实际项目中可参考 speechHandlers.ts 接入真实的语音识别服务",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%22CustomSpeech.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FCustomSpeech.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2020px%5C%22%3E%5Cn%20%20%20%20%3C!--%20%E7%8A%B6%E6%80%81%E6%98%BE%E7%A4%BA%20--%3E%5Cn%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20v-if%3D%5C%22speechStatus%5C%22%5Cn%20%20%20%20%20%20style%3D%5C%22padding%3A%2012px%3B%20background%3A%20%23e8f4fd%3B%20border-radius%3A%206px%3B%20border-left%3A%204px%20solid%20%231890ff%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22font-weight%3A%20500%3B%20color%3A%20%231890ff%5C%22%3E%7B%7B%20speechStatus%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3Cdiv%20v-if%3D%5C%22interimResult%5C%22%20style%3D%5C%22margin-top%3A%208px%3B%20color%3A%20%23666%3B%20font-style%3A%20italic%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E5%AE%9E%E6%97%B6%E8%AF%86%E5%88%AB%3A%20%7B%7B%20interimResult%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E8%BE%93%E5%85%A5%E7%BB%84%E4%BB%B6%20--%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%2024px%200%5C%22%3E%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%BC%94%E7%A4%BA%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20v-model%3D%5C%22inputText%5C%22%5Cn%20%20%20%20%20%20%20%20mode%3D%5C%22single%5C%22%5Cn%20%20%20%20%20%20%20%20%3AallowSpeech%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aspeech%3D%5C%22speechConfig%5C%22%5Cn%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E7%82%B9%E5%87%BB%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%8C%89%E9%92%AE%E5%BC%80%E5%A7%8B%E8%AF%AD%E9%9F%B3%E8%BE%93%E5%85%A5...%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-start%3D%5C%22handleSpeechStart%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-interim%3D%5C%22handleSpeechInterim%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-final%3D%5C%22handleSpeechFinal%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-end%3D%5C%22handleSpeechEnd%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-error%3D%5C%22handleSpeechError%5C%22%5Cn%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E7%BB%93%E6%9E%9C%E5%B1%95%E7%A4%BA%20--%3E%5Cn%20%20%20%20%3Cdiv%20v-if%3D%5C%22results.length%20%3E%200%5C%22%20style%3D%5C%22padding%3A%2016px%3B%20background%3A%20%23f9f9f9%3B%20border-radius%3A%208px%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%200%200%2012px%200%5C%22%3E%E8%AF%86%E5%88%AB%E5%8E%86%E5%8F%B2%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22max-height%3A%20200px%3B%20overflow-y%3A%20auto%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22(result%2C%20index)%20in%20results%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22index%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20style%3D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%208px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20margin-bottom%3A%208px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20white%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%204px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border-left%3A%203px%20solid%20%2352c41a%3B%5Cn%20%20%20%20%20%20%20%20%20%20%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22font-size%3A%2012px%3B%20color%3A%20%23999%3B%20margin-bottom%3A%204px%5C%22%3E%7B%7B%20result.timestamp%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%3E%7B%7B%20result.text%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%20--%3E%5Cn%20%20%20%20%3Cdiv%20style%3D%5C%22padding%3A%2016px%3B%20background%3A%20%23fffbe6%3B%20border-radius%3A%208px%3B%20border-left%3A%204px%20solid%20%23faad14%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%200%200%208px%200%3B%20color%3A%20%23fa8c16%5C%22%3E%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cul%20style%3D%5C%22margin%3A%200%3B%20padding-left%3A%2020px%3B%20color%3A%20%23666%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E6%AD%A4%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%EF%BC%8C%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%20%E9%85%8D%E7%BD%AE%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E7%82%B9%E5%87%BB%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%8C%89%E9%92%AE%E5%90%8E%E4%BC%9A%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E8%BF%87%E7%A8%8B%EF%BC%8C%E5%B1%95%E7%A4%BA%E4%B8%AD%E9%97%B4%E7%BB%93%E6%9E%9C%E5%92%8C%E6%9C%80%E7%BB%88%E7%BB%93%E6%9E%9C%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E5%A6%82%E9%9C%80%E6%8E%A5%E5%85%A5%E7%9C%9F%E5%AE%9E%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%9C%8D%E5%8A%A1%EF%BC%88%E9%98%BF%E9%87%8C%E4%BA%91%E7%AD%89%EF%BC%89%EF%BC%8C%E8%AF%B7%E5%8F%82%E8%80%83%20%3Ccode%3EspeechHandlers.ts%3C%2Fcode%3E%20%E4%B8%AD%E7%9A%84%E5%AE%9E%E7%8E%B0%E7%A4%BA%E4%BE%8B%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E6%94%AF%E6%8C%81%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%AD%E9%9F%B3%E5%A4%84%E7%90%86%E5%99%A8%EF%BC%8C%E5%AE%9E%E7%8E%B0%E4%BB%BB%E6%84%8F%E7%AC%AC%E4%B8%89%E6%96%B9%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%9C%8D%E5%8A%A1%E7%9A%84%E9%9B%86%E6%88%90%3C%2Fli%3E%5Cn%20%20%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20AliyunSpeechHandler%20%7D%20from%20'.%2FspeechHandlers'%5Cn%5Cn%2F%2F%20%E7%BB%84%E4%BB%B6%E7%8A%B6%E6%80%81%5Cnconst%20inputText%20%3D%20ref('')%5Cnconst%20speechStatus%20%3D%20ref('')%5Cnconst%20interimResult%20%3D%20ref('')%5Cnconst%20results%20%3D%20ref%3CArray%3C%7B%20text%3A%20string%3B%20timestamp%3A%20string%20%7D%3E%3E(%5B%5D)%5Cn%5Cn%2F%2F%20%E8%AF%AD%E9%9F%B3%E9%85%8D%E7%BD%AE%20-%20%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%E5%A4%84%E7%90%86%E5%99%A8%5Cnconst%20speechConfig%20%3D%20%7B%5Cn%20%20customHandler%3A%20new%20AliyunSpeechHandler()%2C%5Cn%20%20interimResults%3A%20true%2C%5Cn%7D%5Cn%5Cn%2F%2F%20%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%5Cnconst%20handleSpeechStart%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20'%F0%9F%8E%A4%20%E6%AD%A3%E5%9C%A8%E5%BD%95%E9%9F%B3...'%5Cn%20%20interimResult.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSpeechInterim%20%3D%20(transcript%3A%20string)%20%3D%3E%20%7B%5Cn%20%20interimResult.value%20%3D%20transcript%5Cn%7D%5Cn%5Cnconst%20handleSpeechFinal%20%3D%20(transcript%3A%20string)%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20'%E2%9C%85%20%E8%AF%86%E5%88%AB%E5%AE%8C%E6%88%90'%5Cn%20%20interimResult.value%20%3D%20''%5Cn%5Cn%20%20%2F%2F%20%E8%AE%B0%E5%BD%95%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%5Cn%20%20results.value.unshift(%7B%5Cn%20%20%20%20text%3A%20transcript%2C%5Cn%20%20%20%20timestamp%3A%20new%20Date().toLocaleTimeString()%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20%2F%2F%20%E9%99%90%E5%88%B6%E5%8E%86%E5%8F%B2%E8%AE%B0%E5%BD%95%E6%95%B0%E9%87%8F%5Cn%20%20if%20(results.value.length%20%3E%2010)%20%7B%5Cn%20%20%20%20results.value%20%3D%20results.value.slice(0%2C%2010)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20handleSpeechEnd%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20''%5Cn%20%20interimResult.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSpeechError%20%3D%20(error%3A%20Error)%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20''%5Cn%20%20interimResult.value%20%3D%20''%5Cn%20%20console.error('%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E9%94%99%E8%AF%AF%3A'%2C%20error)%5Cn%7D%5Cn%5Cnconst%20handleSubmit%20%3D%20(text%3A%20string)%20%3D%3E%20%7B%5Cn%20%20console.log('%E6%8F%90%E4%BA%A4%E5%86%85%E5%AE%B9%3A'%2C%20text)%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22speechHandlers.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FspeechHandlers.ts%22%2C%22code%22%3A%22import%20Recorder%20from%20'recorder-core'%5Cnimport%20'recorder-core%2Fsrc%2Fengine%2Fwav'%5Cnimport%20type%20%7B%20SpeechHandler%2C%20SpeechCallbacks%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cn%2F**%5Cn%20*%20recorder-core%20%E7%9A%84%E9%85%8D%E7%BD%AE%E9%80%89%E9%A1%B9%5Cn%20*%2F%5Cninterface%20RecorderOptions%20%7B%5Cn%20%20type%3A%20'wav'%20%7C%20'mp3'%20%7C%20'pcm'%20%7C%20string%20%2F%2F%20%E6%9C%9F%E6%9C%9B%E7%9A%84%E8%BE%93%E5%87%BA%E6%A0%BC%E5%BC%8F%5Cn%20%20sampleRate%3A%2016000%20%7C%208000%20%7C%20number%20%2F%2F%20%E9%87%87%E6%A0%B7%E7%8E%87%5Cn%20%20bitRate%3A%2016%20%7C%208%20%7C%20number%20%2F%2F%20%E6%AF%94%E7%89%B9%E7%8E%87%5Cn%20%20onProcess%3F%3A%20(buffers%3A%20Float32Array%5B%5D%2C%20powerLevel%3A%20number%2C%20duration%3A%20number%2C%20sampleRate%3A%20number)%20%3D%3E%20void%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20recorder-core%20%E5%AE%9E%E4%BE%8B%E7%9A%84%E6%8E%A5%E5%8F%A3%5Cn%20*%2F%5Cninterface%20IRecorder%20%7B%5Cn%20%20open(success%3A%20()%20%3D%3E%20void%2C%20fail%3A%20(msg%3A%20string%2C%20isUserNotAllow%3A%20boolean)%20%3D%3E%20void)%3A%20void%5Cn%20%20start()%3A%20void%5Cn%20%20stop(success%3A%20(blob%3A%20Blob%2C%20duration%3A%20number)%20%3D%3E%20void%2C%20fail%3A%20(msg%3A%20string)%20%3D%3E%20void)%3A%20void%5Cn%20%20close()%3A%20void%5Cn%20%20support()%3A%20boolean%5Cn%7D%5Cn%5Cninterface%20RecorderStatic%20%7B%5Cn%20%20(options%3A%20RecorderOptions)%3A%20IRecorder%5Cn%7D%5Cn%5Cnconst%20TypedRecorder%20%3D%20Recorder%20as%20RecorderStatic%5Cn%5Cn%2F**%5Cn%20*%20%E7%AE%80%E5%8D%95%E7%9A%84%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E7%94%A8%E4%BA%8E%E6%B5%8B%E8%AF%95%E5%92%8C%E6%BC%94%E7%A4%BA%5Cn%20*%2F%5Cnexport%20class%20MockSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20timer%3F%3A%20ReturnType%3Ctypeof%20setInterval%3E%5Cn%5Cn%20%20start(callbacks%3A%20SpeechCallbacks)%3A%20void%20%7B%5Cn%20%20%20%20%2F%2F%20%E7%AB%8B%E5%8D%B3%E8%A7%A6%E5%8F%91%E5%BC%80%E5%A7%8B%5Cn%20%20%20%20callbacks.onStart()%5Cn%5Cn%20%20%20%20%2F%2F%20%E6%A8%A1%E6%8B%9F%E8%AF%86%E5%88%AB%E8%BF%87%E7%A8%8B%5Cn%20%20%20%20let%20step%20%3D%200%5Cn%20%20%20%20const%20steps%20%3D%20%5B'%E6%AD%A3%E5%9C%A8'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3%E5%86%85%E5%AE%B9'%5D%5Cn%5Cn%20%20%20%20this.timer%20%3D%20setInterval(()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(step%20%3C%20steps.length)%20%7B%5Cn%20%20%20%20%20%20%20%20callbacks.onInterim(steps%5Bstep%5D)%5Cn%20%20%20%20%20%20%20%20step%2B%2B%5Cn%20%20%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E5%AE%8C%E6%88%90%E8%AF%86%E5%88%AB%5Cn%20%20%20%20%20%20%20%20const%20finalResult%20%3D%20'%E8%BF%99%E6%98%AF%E4%B8%80%E4%B8%AA%E6%A8%A1%E6%8B%9F%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C'%5Cn%20%20%20%20%20%20%20%20callbacks.onFinal(finalResult)%5Cn%5Cn%20%20%20%20%20%20%20%20callbacks.onEnd()%5Cn%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E6%B8%85%E7%90%86%E5%AE%9A%E6%97%B6%E5%99%A8%E8%B5%84%E6%BA%90%5Cn%20%20%20%20%20%20%20%20this.stop()%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%20500)%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.timer)%20%7B%5Cn%20%20%20%20%20%20clearInterval(this.timer)%5Cn%20%20%20%20%20%20this.timer%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%20%2F%2F%20%E6%A8%A1%E6%8B%9F%E5%A4%84%E7%90%86%E5%99%A8%E6%80%BB%E6%98%AF%E6%94%AF%E6%8C%81%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E4%B8%80%E5%8F%A5%E8%AF%9D%E8%AF%86%E5%88%AB%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E4%BD%BF%E7%94%A8%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%20REST%20API%5Cn%20*%5Cn%20*%20%E9%9C%80%E8%A6%81%E5%A1%AB%E5%85%A5%E8%87%AA%E5%B7%B1%E7%9A%84%20appKey%20%E5%92%8C%20token%5Cn%20*%2F%5Cnexport%20class%20AliyunSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20recorder%3F%3A%20IRecorder%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%5Cn%20%20private%20closeRecorder()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.recorder)%20%7B%5Cn%20%20%20%20%20%20this.recorder.close()%5Cn%20%20%20%20%20%20this.recorder%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20async%20processWithAliyunAPI(audioBlob%3A%20Blob)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.callbacks)%20return%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20const%20baseUrl%20%3D%20'https%3A%2F%2Fagent.opentiny.design%2Fapi%2Fasr%2Frecognize'%5Cn%5Cn%20%20%20%20%20%20const%20formData%20%3D%20new%20FormData()%5Cn%20%20%20%20%20%20formData.append('audio'%2C%20audioBlob)%5Cn%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BbaseUrl%7D%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20formData%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20errorBody%20%3D%20await%20response.text()%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%E9%94%99%E8%AF%AF!%20%E7%8A%B6%E6%80%81%E7%A0%81%3A%20%24%7Bresponse.status%7D%2C%20%E5%93%8D%E5%BA%94%3A%20%24%7BerrorBody%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20result%20%3D%20await%20response.json()%5Cn%5Cn%20%20%20%20%20%20if%20(result.success%20%26%26%20result.data%3F.result)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20transcript%20%3D%20result.data.result%5Cn%20%20%20%20%20%20%20%20this.callbacks.onFinal(transcript)%5Cn%20%20%20%20%20%20%20%20this.callbacks.onEnd(transcript)%5Cn%20%20%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(result.message%20%7C%7C%20result.data%3F.message%20%7C%7C%20'%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20this.callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20start(callbacks%3A%20SpeechCallbacks)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20this.recorder%20%3D%20TypedRecorder(%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'wav'%2C%20%2F%2F%20%E4%BD%BF%E7%94%A8%20WAV%20%E6%A0%BC%E5%BC%8F%EF%BC%8C%E5%8C%85%E5%90%AB%E9%9F%B3%E9%A2%91%E5%A4%B4%E4%BF%A1%E6%81%AF%5Cn%20%20%20%20%20%20%20%20sampleRate%3A%2016000%2C%5Cn%20%20%20%20%20%20%20%20bitRate%3A%2016%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20this.recorder.open(%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20this.recorder%3F.start()%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onStart()%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20(msg%3A%20string%2C%20isUserNotAllow%3A%20boolean)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20const%20errorMsg%20%3D%20isUserNotAllow%20%3F%20%60%E7%94%A8%E6%88%B7%E6%8B%92%E7%BB%9D%E4%BA%86%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%9D%83%E9%99%90%3A%20%24%7Bmsg%7D%60%20%3A%20%60%E6%97%A0%E6%B3%95%E6%89%93%E5%BC%80%E9%BA%A6%E5%85%8B%E9%A3%8E%3A%20%24%7Bmsg%7D%60%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onError(new%20Error(errorMsg))%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E6%9C%8D%E5%8A%A1%E5%90%AF%E5%8A%A8%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20stop()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.recorder)%20%7B%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.recorder.stop(%5Cn%20%20%20%20%20%20(blob%3A%20Blob%2C%20duration%3A%20number)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20console.log(%60%E5%BD%95%E9%9F%B3%E6%88%90%E5%8A%9F%EF%BC%8C%E6%A0%BC%E5%BC%8F%3A%20%24%7Bblob.type%7D%EF%BC%8C%E6%97%B6%E9%95%BF%3A%20%24%7Bduration%7Dms%60%2C%20blob)%5Cn%20%20%20%20%20%20%20%20this.processWithAliyunAPI(blob)%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20(msg%3A%20string)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error(%60%E5%BD%95%E9%9F%B3%E5%A4%B1%E8%B4%A5%3A%20%24%7Bmsg%7D%60))%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E4%BD%BF%E7%94%A8%20WebSocket%20%E8%BF%9B%E8%A1%8C%E6%B5%81%E5%BC%8F%E8%AF%86%E5%88%AB%5Cn%20*%5Cn%20*%20%E9%9C%80%E8%A6%81%E5%A1%AB%E5%85%A5%E8%87%AA%E5%B7%B1%E7%9A%84%20appKey%20%E5%92%8C%20token%5Cn%20*%2F%5Cnexport%20class%20AliyunRealtimeSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20ws%3F%3A%20WebSocket%5Cn%20%20private%20audioContext%3F%3A%20AudioContext%5Cn%20%20private%20scriptProcessor%3F%3A%20ScriptProcessorNode%5Cn%20%20private%20audioStream%3F%3A%20MediaStream%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%20%20private%20appKey%3A%20string%20%3D%20'your_app_key'%5Cn%20%20private%20token%3A%20string%20%3D%20'your_token'%5Cn%5Cn%20%20private%20generateUUID()%3A%20string%20%7B%5Cn%20%20%20%20%2F%2F%20%E4%BD%BF%E7%94%A8%20crypto.randomUUID()%20%E7%94%9F%E6%88%90%E6%A0%87%E5%87%86%20UUID%EF%BC%8C%E7%84%B6%E5%90%8E%E7%A7%BB%E9%99%A4%E8%BF%9E%E5%AD%97%E7%AC%A6%E5%BE%97%E5%88%B032%E4%BD%8D%E5%AD%97%E7%AC%A6%E4%B8%B2%5Cn%20%20%20%20return%20crypto.randomUUID().replace(%2F-%2Fg%2C%20'')%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%5Cn%20%20async%20start(callbacks%3A%20SpeechCallbacks)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.isSupported())%20%7B%5Cn%20%20%20%20%20%20callbacks.onError(new%20Error('%E5%BD%93%E5%89%8D%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%8D%E6%94%AF%E6%8C%81%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%89%80%E9%9C%80%E7%9A%84%E5%8A%9F%E8%83%BD'))%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%20%20%20%20this.setupWebSocket()%5Cn%20%20%7D%5Cn%5Cn%20%20private%20setupWebSocket()%3A%20void%20%7B%5Cn%20%20%20%20const%20scheme%20%3D%20window.location.protocol%20%3D%3D%3D%20'https%3A'%20%3F%20'wss'%20%3A%20'ws'%5Cn%20%20%20%20const%20socketUrl%20%3D%20%60%24%7Bscheme%7D%3A%2F%2F%24%7Bwindow.location.host%7D%2Fapi%2Faliyun%2Fws%3Ftoken%3D%24%7Bthis.token%7D%60%5Cn%5Cn%20%20%20%20this.ws%20%3D%20new%20WebSocket(socketUrl)%5Cn%5Cn%20%20%20%20this.ws.onopen%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E8%BF%9E%E6%8E%A5%E6%88%90%E5%8A%9F%E5%90%8E%EF%BC%8C%E5%8F%91%E9%80%81%E5%BC%80%E5%A7%8B%E8%AF%86%E5%88%AB%E6%8C%87%E4%BB%A4%5Cn%20%20%20%20%20%20const%20startMessage%20%3D%20%7B%5Cn%20%20%20%20%20%20%20%20header%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20appkey%3A%20this.appKey%2C%5Cn%20%20%20%20%20%20%20%20%20%20namespace%3A%20'SpeechTranscriber'%2C%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'StartTranscription'%2C%5Cn%20%20%20%20%20%20%20%20%20%20task_id%3A%20this.generateUUID()%2C%5Cn%20%20%20%20%20%20%20%20%20%20message_id%3A%20this.generateUUID()%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20payload%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20format%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20%20%20sample_rate%3A%2016000%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_intermediate_result%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_punctuation_prediction%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_inverse_text_normalization%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20this.ws%3F.send(JSON.stringify(startMessage))%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onmessage%20%3D%20(event)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20message%20%3D%20JSON.parse(event.data)%5Cn%5Cn%20%20%20%20%20%20switch%20(message.header.name)%20%7B%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionStarted'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E6%9C%8D%E5%8A%A1%E7%AB%AF%E5%87%86%E5%A4%87%E5%B0%B1%E7%BB%AA%EF%BC%8C%E5%BC%80%E5%A7%8B%E6%8D%95%E6%8D%89%E5%92%8C%E5%8F%91%E9%80%81%E9%9F%B3%E9%A2%91%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onStart()%5Cn%20%20%20%20%20%20%20%20%20%20this.startAudioProcessing()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionResultChanged'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E4%B8%AD%E9%97%B4%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%5Cn%20%20%20%20%20%20%20%20%20%20if%20(message.payload.result)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onInterim(message.payload.result)%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'SentenceEnd'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E5%8F%A5%E5%AD%90%E7%BB%93%E6%9D%9F%EF%BC%8C%E6%9C%80%E7%BB%88%E7%BB%93%E6%9E%9C%5Cn%20%20%20%20%20%20%20%20%20%20if%20(message.payload.result)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onFinal(message.payload.result)%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionCompleted'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E8%AF%86%E5%88%AB%E5%AE%8C%E6%88%90%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onEnd()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TaskFailed'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E4%BB%BB%E5%8A%A1%E5%A4%B1%E8%B4%A5%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error(%60%E4%BB%BB%E5%8A%A1%E5%A4%B1%E8%B4%A5%3A%20%24%7Bmessage.payload.status_text%20%7C%7C%20'%E6%9C%AA%E7%9F%A5%E9%94%99%E8%AF%AF'%7D%60))%5Cn%20%20%20%20%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onerror%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error('WebSocket%20%E8%BF%9E%E6%8E%A5%E5%8F%91%E7%94%9F%E9%94%99%E8%AF%AF'))%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onclose%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20async%20startAudioProcessing()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E8%8E%B7%E5%8F%96%E9%9F%B3%E9%A2%91%E6%B5%81%5Cn%20%20%20%20%20%20this.audioStream%20%3D%20await%20navigator.mediaDevices.getUserMedia(%7B%20audio%3A%20true%20%7D)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87%5Cn%20%20%20%20%20%20const%20AudioContextClass%20%3D%5Cn%20%20%20%20%20%20%20%20window.AudioContext%20%7C%7C%5Cn%20%20%20%20%20%20%20%20(window%20as%20typeof%20window%20%26%20%7B%20webkitAudioContext%3F%3A%20typeof%20AudioContext%20%7D).webkitAudioContext%5Cn%20%20%20%20%20%20if%20(!AudioContextClass)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error('AudioContext%20not%20supported')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20this.audioContext%20%3D%20new%20AudioContextClass(%7B%20sampleRate%3A%2016000%20%7D)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E8%84%9A%E6%9C%AC%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20%20%20%20%20%20this.scriptProcessor%20%3D%20this.audioContext.createScriptProcessor(2048%2C%201%2C%201)%5Cn%5Cn%20%20%20%20%20%20this.scriptProcessor.onaudioprocess%20%3D%20(event)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20const%20inputData%20%3D%20event.inputBuffer.getChannelData(0)%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E8%BD%AC%E6%8D%A2%E4%B8%BA16-bit%20PCM%E6%A0%BC%E5%BC%8F%5Cn%20%20%20%20%20%20%20%20const%20pcmData%20%3D%20new%20Int16Array(inputData.length)%5Cn%20%20%20%20%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20inputData.length%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20pcmData%5Bi%5D%20%3D%20Math.max(-1%2C%20Math.min(1%2C%20inputData%5Bi%5D))%20*%200x7fff%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20if%20(this.ws%3F.readyState%20%3D%3D%3D%20WebSocket.OPEN)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20this.ws.send(pcmData.buffer)%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20source%20%3D%20this.audioContext.createMediaStreamSource(this.audioStream)%5Cn%20%20%20%20%20%20source.connect(this.scriptProcessor)%5Cn%20%20%20%20%20%20this.scriptProcessor.connect(this.audioContext.destination)%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20this.callbacks%3F.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E6%97%A0%E6%B3%95%E5%90%AF%E5%8A%A8%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%88%96%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86'))%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20%2F%2F%20%E5%81%9C%E6%AD%A2%E9%9F%B3%E9%A2%91%E6%B5%81%5Cn%20%20%20%20if%20(this.audioStream)%20%7B%5Cn%20%20%20%20%20%20this.audioStream.getTracks().forEach((track)%20%3D%3E%20track.stop())%5Cn%20%20%20%20%20%20this.audioStream%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E6%96%AD%E5%BC%80%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20%20%20%20if%20(this.scriptProcessor)%20%7B%5Cn%20%20%20%20%20%20this.scriptProcessor.disconnect()%5Cn%20%20%20%20%20%20this.scriptProcessor%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%85%B3%E9%97%AD%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87%5Cn%20%20%20%20if%20(this.audioContext)%20%7B%5Cn%20%20%20%20%20%20this.audioContext.close()%5Cn%20%20%20%20%20%20this.audioContext%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%85%B3%E9%97%AD%20WebSocket%20%E8%BF%9E%E6%8E%A5%5Cn%20%20%20%20if%20(this.ws%20%26%26%20this.ws.readyState%20%3D%3D%3D%20WebSocket.OPEN)%20%7B%5Cn%20%20%20%20%20%20this.ws.close()%5Cn%20%20%20%20%7D%5Cn%20%20%20%20this.ws%20%3D%20undefined%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[5]||(n[5]=()=>{s.value=!1}),vueCode:t(z)},k({_:2},[f.value?{name:"vue",fn:a(()=>[e(t(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[27]||(n[27]=o("",8)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"移动端按住说话",description:"展示移动端按住说话的基本 UI 结构和交互流程",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%22CustomRecordingUI.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FCustomRecordingUI.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2020px%5C%22%3E%5Cn%20%20%20%20%3C!--%20%E8%AF%AD%E9%9F%B3%E5%BD%95%E5%88%B6%20UI%20--%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Ch4%3E%7B%7B%20isMobile%20%3F%20'%E7%A7%BB%E5%8A%A8%E7%AB%AF'%20%3A%20'PC%20%E7%AB%AF'%20%7D%7D%20%E8%AF%AD%E9%9F%B3%E5%BD%95%E5%88%B6%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22sender-container%5C%22%5Cn%20%20%20%20%20%20%20%20%40touchmove.prevent%3D%5C%22handleTouchMove%5C%22%5Cn%20%20%20%20%20%20%20%20%40touchend.prevent%3D%5C%22handleTouchEnd%5C%22%5Cn%20%20%20%20%20%20%20%20%40mousemove.prevent%3D%5C%22handleTouchMove%5C%22%5Cn%20%20%20%20%20%20%20%20%40mouseup.prevent%3D%5C%22handleTouchEnd%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%3C!--%20%E8%BE%93%E5%85%A5%E6%A1%86%EF%BC%9A%E4%BD%BF%E7%94%A8%20content%20%E6%8F%92%E6%A7%BD%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%E5%85%A5%E5%8F%A3%20--%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20%20%20v-show%3D%5C%22!showMobileVoiceUI%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20ref%3D%5C%22senderRef%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20v-model%3D%5C%22inputText%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20mode%3D%5C%22single%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20class%3D%5C%22sender%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AallowSpeech%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aspeech%3D%5C%22speechConfig%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20v-if%3D%5C%22isMobile%5C%22%20%23content%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22press-to-talk-trigger%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40touchstart.prevent%3D%5C%22handleTouchStart%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40mousedown.prevent%3D%5C%22handleTouchStart%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3C!--%20%E5%BD%95%E9%9F%B3%E6%B5%AE%E5%B1%82%EF%BC%9A%E6%98%BE%E7%A4%BA%E5%BD%95%E9%9F%B3%E5%8A%A8%E7%94%BB%E5%92%8C%E6%8F%90%E7%A4%BA%20--%3E%5Cn%20%20%20%20%20%20%20%20%3CPressToTalkOverlay%5Cn%20%20%20%20%20%20%20%20%20%20v-model%3Avisible%3D%5C%22showMobileVoiceUI%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AisCanceling%3D%5C%22isCanceling%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AcancelThreshold%3D%5C%22cancelThreshold%5C%22%5Cn%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Cspan%20style%3D%5C%22margin-right%3A%2020px%5C%22%3E%E6%98%AF%E5%90%A6%E6%98%AF%E7%A7%BB%E5%8A%A8%E7%AB%AF%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-switch%20v-model%3D%5C%22isMobile%5C%22%3E%3C%2Ftiny-switch%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TinySwitch%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20PressToTalkOverlay%20from%20'.%2FPressToTalkOverlay.vue'%5Cn%5Cnconst%20senderRef%20%3D%20ref%3CInstanceType%3Ctypeof%20TrSender%3E%3E()%5Cnconst%20inputText%20%3D%20ref('')%5Cnconst%20showMobileVoiceUI%20%3D%20ref(false)%5Cnconst%20isMobile%20%3D%20ref(false)%5Cnconst%20isCanceling%20%3D%20ref(false)%5Cnconst%20startY%20%3D%20ref(0)%5Cnconst%20cancelThreshold%20%3D%2030%5Cn%5Cn%2F%2F%20%E8%AF%AD%E9%9F%B3%E9%85%8D%E7%BD%AE%5Cnconst%20speechConfig%20%3D%20%7B%5Cn%20%20onVoiceButtonClick%3A%20async%20(isRecording%3A%20boolean%2C%20preventDefault%3A%20()%20%3D%3E%20void)%20%3D%3E%20%7B%5Cn%20%20%20%20%2F%2F%20PC%20%E7%AB%AF%EF%BC%9A%E4%BD%BF%E7%94%A8%E9%BB%98%E8%AE%A4%E7%9A%84%E7%82%B9%E5%87%BB%E5%88%87%E6%8D%A2%E5%BD%95%E9%9F%B3%E9%80%BB%E8%BE%91%5Cn%20%20%20%20if%20(!isMobile.value)%20%7B%5Cn%20%20%20%20%20%20return%20%2F%2F%20%E4%B8%8D%E8%B0%83%E7%94%A8%20preventDefault%EF%BC%8C%E7%BB%A7%E7%BB%AD%E6%89%A7%E8%A1%8C%E9%BB%98%E8%AE%A4%E9%80%BB%E8%BE%91%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20Mobile%20%E7%AB%AF%EF%BC%9A%E4%BD%BF%E7%94%A8%E8%87%AA%E5%AE%9A%E4%B9%89%E7%9A%84%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%E9%80%BB%E8%BE%91%5Cn%20%20%20%20preventDefault()%20%2F%2F%20%E9%98%BB%E6%AD%A2%E9%BB%98%E8%AE%A4%E9%80%BB%E8%BE%91%5Cn%5Cn%20%20%20%20if%20(!isRecording)%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E7%82%B9%E5%87%BB%E8%AF%AD%E9%9F%B3%E6%8C%89%E9%92%AE%E6%97%B6%EF%BC%8C%E6%98%BE%E7%A4%BA%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%20UI%5Cn%20%20%20%20%20%20showMobileVoiceUI.value%20%3D%20true%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E5%A6%82%E6%9E%9C%E6%AD%A3%E5%9C%A8%E5%BD%95%E9%9F%B3%EF%BC%8C%E5%81%9C%E6%AD%A2%E5%BD%95%E9%9F%B3%5Cn%20%20%20%20%20%20senderRef.value%3F.stopSpeech()%5Cn%20%20%20%20%20%20showMobileVoiceUI.value%20%3D%20false%5Cn%20%20%20%20%7D%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cn%2F%2F%20%E6%8C%89%E4%B8%8B%E5%BC%80%E5%A7%8B%E5%BD%95%E9%9F%B3%5Cnconst%20handleTouchStart%20%3D%20(e%3A%20TouchEvent%20%7C%20MouseEvent)%20%3D%3E%20%7B%5Cn%20%20const%20clientY%20%3D%20e%20instanceof%20TouchEvent%20%3F%20e.touches%5B0%5D.clientY%20%3A%20e.clientY%5Cn%20%20startY.value%20%3D%20clientY%5Cn%20%20showMobileVoiceUI.value%20%3D%20true%5Cn%20%20isCanceling.value%20%3D%20false%5Cn%20%20senderRef.value%3F.startSpeech()%5Cn%7D%5Cn%5Cn%2F%2F%20%E7%A7%BB%E5%8A%A8%E6%A3%80%E6%B5%8B%E6%98%AF%E5%90%A6%E5%8F%96%E6%B6%88%5Cnconst%20handleTouchMove%20%3D%20(e%3A%20TouchEvent%20%7C%20MouseEvent)%20%3D%3E%20%7B%5Cn%20%20if%20(!showMobileVoiceUI.value)%20return%5Cn%5Cn%20%20const%20currentY%20%3D%20e%20instanceof%20TouchEvent%20%3F%20e.touches%5B0%5D.clientY%20%3A%20e.clientY%5Cn%20%20const%20slideDistance%20%3D%20startY.value%20-%20currentY%5Cn%20%20isCanceling.value%20%3D%20slideDistance%20%3E%20cancelThreshold%5Cn%7D%5Cn%5Cn%2F%2F%20%E6%9D%BE%E5%BC%80%E7%BB%93%E6%9D%9F%E5%BD%95%E9%9F%B3%5Cnconst%20handleTouchEnd%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20if%20(!showMobileVoiceUI.value)%20return%5Cn%5Cn%20%20if%20(isCanceling.value)%20%7B%5Cn%20%20%20%20%2F%2F%20%E5%8F%96%E6%B6%88%E5%BD%95%E9%9F%B3%EF%BC%88%E5%8F%AF%E4%BB%A5%E5%9C%A8%E8%BF%99%E9%87%8C%E6%B8%85%E7%A9%BA%E8%BE%93%E5%85%A5%E6%A1%86%E6%88%96%E5%85%B6%E4%BB%96%E5%A4%84%E7%90%86%EF%BC%89%5Cn%20%20%20%20inputText.value%20%3D%20''%5Cn%20%20%7D%5Cn%5Cn%20%20senderRef.value%3F.stopSpeech()%5Cn%20%20senderRef.value%3F.submit()%5Cn%20%20showMobileVoiceUI.value%20%3D%20false%5Cn%20%20isCanceling.value%20%3D%20false%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.sender-container%20%7B%5Cn%20%20position%3A%20relative%3B%5Cn%20%20min-height%3A%20180px%3B%5Cn%7D%5Cn%5Cn.sender%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20left%3A%200%3B%5Cn%20%20right%3A%200%3B%5Cn%20%20bottom%3A%200%3B%5Cn%7D%5Cn%5Cn.press-to-talk-trigger%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20user-select%3A%20none%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font-size%3A%2016px%3B%5Cn%20%20color%3A%20%23333%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22PressToTalkOverlay.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FPressToTalkOverlay.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20v-if%3D%5C%22visible%5C%22%20class%3D%5C%22mobile-voice-overlay%5C%22%3E%5Cn%20%20%20%20%3C!--%20%E5%BD%95%E9%9F%B3%E5%8A%A8%E7%94%BB%E5%8C%BA%E5%9F%9F%20--%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22recording-wave%20active%5C%22%3E%5Cn%20%20%20%20%20%20%3Cslot%20name%3D%5C%22recording-icon%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cimg%20src%3D%5C%22..%2F..%2F..%2Fpackages%2Fcomponents%2Fsrc%2Fassets%2Fwave.webp%5C%22%20alt%3D%5C%22Recording%20Wave%5C%22%20class%3D%5C%22wave-image%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Fslot%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E6%8F%90%E7%A4%BA%E6%96%87%E6%9C%AC%20--%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22voice-hint%5C%22%20%3Aclass%3D%5C%22%7B%20cancel%3A%20isCanceling%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%7B%7B%20hintText%20%7D%7D%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E6%8C%89%E9%92%AE%20--%3E%5Cn%20%20%20%20%3Cbutton%20class%3D%5C%22voice-btn%20recording%5C%22%20%3Aclass%3D%5C%22%7B%20cancel%3A%20isCanceling%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%3Cslot%20name%3D%5C%22button-text%5C%22%3E%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%3C%2Fslot%3E%5Cn%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cn%5Cninterface%20Props%20%7B%5Cn%20%20visible%3F%3A%20boolean%5Cn%20%20isCanceling%3F%3A%20boolean%5Cn%20%20cancelThreshold%3F%3A%20number%5Cn%20%20recordingText%3F%3A%20string%5Cn%20%20cancelText%3F%3A%20string%5Cn%20%20normalText%3F%3A%20string%5Cn%7D%5Cn%5Cnconst%20props%20%3D%20withDefaults(defineProps%3CProps%3E()%2C%20%7B%5Cn%20%20visible%3A%20false%2C%5Cn%20%20isCanceling%3A%20false%2C%5Cn%20%20cancelThreshold%3A%2030%2C%5Cn%20%20recordingText%3A%20'%E6%9D%BE%E5%BC%80%E5%8F%91%E9%80%81%EF%BC%8C%E4%B8%8A%E6%BB%91%E5%8F%96%E6%B6%88'%2C%5Cn%20%20cancelText%3A%20'%E6%9D%BE%E5%BC%80%E5%8F%96%E6%B6%88'%2C%5Cn%20%20normalText%3A%20'%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D'%2C%5Cn%7D)%5Cn%5Cnconst%20hintText%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20if%20(!props.visible)%20return%20props.normalText%5Cn%20%20if%20(props.isCanceling)%20return%20props.cancelText%5Cn%20%20return%20props.recordingText%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.mobile-voice-overlay%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20left%3A%200%3B%5Cn%20%20right%3A%200%3B%5Cn%20%20bottom%3A%200%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%2026px%3B%5Cn%20%20z-index%3A%201%3B%5Cn%7D%5Cn%5Cn.recording-wave%20%7B%5Cn%20%20display%3A%20none%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20width%3A%20280px%3B%5Cn%7D%5Cn%5Cn.recording-wave.active%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%7D%5Cn%5Cn.voice-hint%20%7B%5Cn%20%20font-size%3A%2015px%3B%5Cn%20%20color%3A%20%23666%3B%5Cn%20%20height%3A%2024px%3B%5Cn%20%20text-align%3A%20center%3B%5Cn%20%20transition%3A%20all%200.3s%20ease%3B%5Cn%20%20font-weight%3A%20400%3B%5Cn%20%20white-space%3A%20nowrap%3B%5Cn%7D%5Cn%5Cn.voice-hint.cancel%20%7B%5Cn%20%20color%3A%20%23ff4d4f%3B%5Cn%20%20font-weight%3A%20500%3B%5Cn%7D%5Cn%5Cn.voice-btn%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%2052px%3B%5Cn%20%20background-color%3A%20%231476ff%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20border%3A%20none%3B%5Cn%20%20color%3A%20white%3B%5Cn%20%20font-size%3A%2017px%3B%5Cn%20%20font-weight%3A%20500%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20transition%3A%20all%200.3s%20ease%3B%5Cn%20%20box-shadow%3A%200%206px%2020px%20rgba(20%2C%20118%2C%20255%2C%200.25)%3B%5Cn%20%20user-select%3A%20none%3B%5Cn%20%20pointer-events%3A%20none%3B%5Cn%7D%5Cn%5Cn.voice-btn.cancel%20%7B%5Cn%20%20background-color%3A%20%23f76360%3B%5Cn%20%20box-shadow%3A%200%206px%2020px%20rgba(247%2C%2099%2C%2096%2C%200.25)%3B%5Cn%7D%5Cn%5Cn.wave-image%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20object-fit%3A%20contain%3B%5Cn%20%20animation%3A%20pulse%201.5s%20ease-in-out%20infinite%3B%5Cn%20%20filter%3A%20drop-shadow(0%202px%208px%20rgba(20%2C%20118%2C%20255%2C%200.3))%3B%5Cn%7D%5Cn%5Cn%40keyframes%20pulse%20%7B%5Cn%20%200%25%2C%5Cn%20%20100%25%20%7B%5Cn%20%20%20%20opacity%3A%200.7%3B%5Cn%20%20%20%20transform%3A%20scale(0.95)%3B%5Cn%20%20%7D%5Cn%20%2050%25%20%7B%5Cn%20%20%20%20opacity%3A%201%3B%5Cn%20%20%20%20transform%3A%20scale(1.05)%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[6]||(n[6]=()=>{s.value=!1}),vueCode:t(M)},k({_:2},[b.value?{name:"vue",fn:a(()=>[e(t(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[28]||(n[28]=o("",4)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"装饰性内容示例",description:"在输入框内显示装饰性内容和可点击链接，可用于服务状态提示、功能引导等场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[7]||(n[7]=()=>{s.value=!1}),vueCode:t(L)},k({_:2},[D.value?{name:"vue",fn:a(()=>[e(t(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[29]||(n[29]=o("",8)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"文件上传",description:"Sender 组件支持文件上传功能，并可通过 buttonGroup 动态控制按钮状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[8]||(n[8]=()=>{s.value=!1}),vueCode:t(G)},k({_:2},[v.value?{name:"vue",fn:a(()=>[e(t(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[30]||(n[30]=l("h4",{id:"模版填充",tabindex:"-1"},[C("模版填充 "),l("a",{class:"header-anchor",href:"#模版填充","aria-label":'Permalink to "模版填充"'},"​")],-1)),n[31]||(n[31]=l("p",null,[C("通过 "),l("code",null,"templateData"),C(" prop 实现模板的动态设置与双向绑定。推荐使用 "),l("code",null,"v-model:templateData"),C(" 的语法糖。")],-1)),n[32]||(n[32]=l("p",null,"该功能加载后，光标会自动聚焦在第一个可编辑的模板字段上，方便用户直接开始编辑。",-1)),n[33]||(n[33]=l("p",null,[l("strong",null,"模板示例")],-1)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"模板填充示例",description:"Sender 组件支持模板填充，展示动态模板切换功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[9]||(n[9]=()=>{s.value=!1}),vueCode:t(X)},k({_:2},[m.value?{name:"vue",fn:a(()=>[e(t(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[34]||(n[34]=o("",10)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"输入联想示例",description:"展示 Sender 组件的输入联想功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[10]||(n[10]=()=>{s.value=!1}),vueCode:t(V)},k({_:2},[F.value?{name:"vue",fn:a(()=>[e(t(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[35]||(n[35]=o("",4)),e(A,{submitType:"ctrlEnter",mode:"multiple",placeholder:"按Ctrl+Enter提交"}),n[36]||(n[36]=o("",1)),e(A,{submitType:"shiftEnter",mode:"multiple",placeholder:"按Shift+Enter提交"}),n[37]||(n[37]=o("",10)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[11]||(n[11]=()=>{s.value=!1}),vueCode:t(P)},k({_:2},[y.value?{name:"vue",fn:a(()=>[e(t(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[38]||(n[38]=o("",6)),c(e(t(u),null,null,512),[[E,s.value]]),e(r,null,{default:a(()=>[e(t(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[12]||(n[12]=()=>{s.value=!1}),vueCode:t(q)},k({_:2},[B.value?{name:"vue",fn:a(()=>[e(t(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[39]||(n[39]=o("",15))])}}});export{$ as __pageData,n2 as default};

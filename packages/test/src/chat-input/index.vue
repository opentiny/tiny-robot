<script setup lang="ts">
import { ref, computed } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { TrSender as ChatInput } from '@opentiny/tiny-robot'
import type { MentionItem, TemplateItem, SenderSuggestionItem } from '@opentiny/tiny-robot'

const chatInputRef = ref()
const content = ref('')
const result = ref('')

// 基础属性
const isMultipleMode = ref(false)
const clearable = ref(false)
const loading = ref(false)
const disabled = ref(false)
const showWordLimit = ref(true)
const isSmallSize = ref(false)
const submitType = ref<'enter' | 'ctrlEnter' | 'shiftEnter'>('enter')
const maxLength = ref(100)
const placeholder = ref('请输入内容...')

// 插件开关 - 默认开启，方便测试
const enableMention = ref(false)
const enableTemplate = ref(false)
const enableSuggestion = ref(false)
const templateData = ref<TemplateItem[]>([])

// 计算属性
const mode = computed(() => (isMultipleMode.value ? 'multiple' : 'single'))
const size = computed(() => (isSmallSize.value ? 'small' : 'normal'))

// 组件 key，用于强制刷新组件以重新加载插件
const componentKey = computed(() => {
  return `${enableMention.value}-${enableTemplate.value}-${enableSuggestion.value}`
})

// 事件处理
const handleModeChange = () => {
  result.value = `模式切换为: ${mode.value}`
}

const handleSizeChange = () => {
  result.value = `尺寸切换为: ${size.value}`
}

const handleSubmit = (value: string) => {
  result.value = `提交内容: ${value}`
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

// 方法调用
const handleSetContent = () => {
  chatInputRef.value?.setContent('<p>测试内容</p>')
  result.value = '已设置内容'
}

const handleGetContent = () => {
  const content = chatInputRef.value?.getContent()
  result.value = `当前内容: ${content}`
}

const handleFocus = () => {
  chatInputRef.value?.focus()
  result.value = '调用 focus 方法'
}

const handleBlur = () => {
  chatInputRef.value?.blur()
  result.value = '调用 blur 方法'
}

const handleClearMethod = () => {
  chatInputRef.value?.clear()
  result.value = '调用 clear 方法'
}

const handleSubmitMethod = () => {
  chatInputRef.value?.submit()
  result.value = '调用 submit 方法'
}

// 模板数据测试方法
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

// 提及列表数据
const mentions = ref<MentionItem[]>([
  {
    label: '小小画家',
    value: '你是一个专业的绘画助手，擅长创作各种风格的艺术作品...',
  },
  {
    label: '代码助手',
    value: '你是一个专业的编程助手，精通多种编程语言和框架...',
  },
  {
    label: '文案大师',
    value: '你是一个专业的文案撰写专家，能够创作吸引人的营销文案...',
  },
  {
    label: '数据分析',
    value: '你是一个专业的数据分析师，擅长从数据中提取有价值的洞察...',
  },
])

// 建议列表数据
const suggestions = ref<SenderSuggestionItem[]>([
  { content: 'Java' },
  { content: 'JavaScript' },
  { content: 'TypeScript' },
  { content: 'Python' },
  { content: 'C++' },
  { content: 'Golang' },
])

// 根据开关动态配置插件
const extensions = computed(() => {
  const exts = []
  if (enableMention.value) {
    exts.push(ChatInput.mention(mentions))
  }
  if (enableTemplate.value) {
    exts.push(ChatInput.template(templateData))
  }
  if (enableSuggestion.value) {
    exts.push(ChatInput.suggestion(suggestions))
  }
  return exts
})
</script>

<template>
  <div class="chat-input-demo">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-section">
        <h3>基础属性</h3>
        <div class="props-grid">
          <div class="control-item">
            <label>mode：</label>
            <tiny-switch
              data-testid="toggle-mode-btn"
              v-model="isMultipleMode"
              @change="handleModeChange"
            ></tiny-switch>
            <span data-testid="mode-display">{{ mode }}</span>
          </div>
          <div class="control-item">
            <label>clearable：</label>
            <tiny-switch data-testid="toggle-clearable-btn" v-model="clearable"></tiny-switch>
          </div>
          <div class="control-item">
            <label>loading：</label>
            <tiny-switch data-testid="toggle-loading-btn" v-model="loading"></tiny-switch>
          </div>
          <div class="control-item">
            <label>disabled：</label>
            <tiny-switch data-testid="toggle-disabled-btn" v-model="disabled"></tiny-switch>
          </div>
          <div class="control-item">
            <label>showWordLimit：</label>
            <tiny-switch data-testid="toggle-word-limit-btn" v-model="showWordLimit"></tiny-switch>
          </div>
          <div class="control-item">
            <label>size：</label>
            <tiny-switch data-testid="toggle-size-btn" v-model="isSmallSize" @change="handleSizeChange"></tiny-switch>
            <span>{{ size }}</span>
          </div>
          <div class="control-item">
            <label>submitType：</label>
            <select data-testid="submit-type-select" v-model="submitType">
              <option value="enter">enter</option>
              <option value="ctrlEnter">ctrlEnter</option>
              <option value="shiftEnter">shiftEnter</option>
            </select>
          </div>
          <div class="control-item">
            <label>maxLength：</label>
            <input data-testid="max-length-input" type="number" v-model.number="maxLength" />
          </div>
          <div class="control-item">
            <label>placeholder：</label>
            <input data-testid="placeholder-input" type="text" v-model="placeholder" />
          </div>
        </div>
      </div>

      <div class="control-section flex-layout">
        <h3>插件开关</h3>
        <div class="control-item">
          <label>mention：</label>
          <tiny-switch data-testid="toggle-mention-btn" v-model="enableMention"></tiny-switch>
        </div>
        <div class="control-item">
          <label>template：</label>
          <tiny-switch data-testid="toggle-template-btn" v-model="enableTemplate"></tiny-switch>
        </div>
        <div class="control-item">
          <label>suggestion：</label>
          <tiny-switch data-testid="toggle-suggestion-btn" v-model="enableSuggestion"></tiny-switch>
        </div>
      </div>

      <div class="control-section">
        <h3>方法调用</h3>
        <div class="button-group">
          <button data-testid="set-content-btn" @click="handleSetContent">设置内容</button>
          <button data-testid="get-content-btn" @click="handleGetContent">获取内容</button>
          <button data-testid="focus-btn" @click="handleFocus">聚焦</button>
          <button data-testid="blur-btn" @click="handleBlur">失焦</button>
          <button data-testid="clear-btn" @click="handleClearMethod">清空</button>
          <button data-testid="submit-btn" @click="handleSubmitMethod">提交</button>
        </div>
      </div>

      <div class="control-section">
        <h3>模板数据</h3>
        <div class="button-group">
          <button data-testid="set-template-simple-btn" @click="setTemplateSimple">简单模板</button>
          <button data-testid="set-template-empty-btn" @click="setTemplateEmpty">空模板块</button>
          <button data-testid="set-template-multiple-btn" @click="setTemplateMultiple">多模板块</button>
          <button data-testid="clear-template-btn" @click="clearTemplate">清空模板</button>
        </div>
      </div>

      <!-- 结果显示 -->
      <div v-show="result" class="result-display" data-testid="result-display">
        {{ result }}
      </div>
    </div>

    <!-- 测试区域 -->
    <ChatInput
      :key="componentKey"
      ref="chatInputRef"
      v-model="content"
      data-testid="test-chat-input"
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
      @submit="handleSubmit"
      @cancel="handleCancel"
      @clear="handleClear"
    >
      <template #footer>
        <button data-testid="custom-footer-btn" @click="handleCustomAction">自定义按钮</button>
      </template>
    </ChatInput>
  </div>
</template>

<style scoped>
.chat-input-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  box-sizing: border-box;
  height: 100vh;
}

.control-panel {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  overflow-y: auto;
}

.flex-layout {
  display: flex;
  align-items: center;
  gap: 10px;
}
.control-section {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.control-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.control-section h3 {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.props-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px 12px;
}

.control-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 6px;
  min-height: 28px;
}

.control-item label {
  font-size: 12px;
  color: #666;
}

.control-item input,
.control-item select {
  padding: 3px 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 12px;
  background: white;
}

.control-item span {
  font-size: 11px;
  color: #999;
  min-width: 50px;
}

.button-group {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.button-group button {
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  background: white;
  cursor: pointer;
  font-size: 11px;
  white-space: nowrap;
}

.button-group button:hover {
  background: #f0f0f0;
}

.result-display {
  margin-top: 12px;
  padding: 8px;
  background: #e7f3ff;
  border-radius: 3px;
  font-size: 11px;
  word-break: break-all;
  max-height: 100px;
  overflow-y: auto;
}
</style>

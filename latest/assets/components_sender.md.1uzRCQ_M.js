const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/CompactMode.SgEdV3Cv.js","assets/chunks/index.D6XacYRe.js","assets/chunks/framework.kTfunus-.js","assets/chunks/index5.B63c_vYG.js","assets/chunks/index4.UhD4dyzc.js","assets/chunks/tiny-robot-svgs.BaAiG9Fu.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/All.BZX714tu.js","assets/chunks/tiny-robot-svgs.Ct4S-7ct.js","assets/chunks/index.D5z7hk73.js","assets/chunks/index.DKVCnifJ.js","assets/chunks/loading-shadow.lIjb6yma.js","assets/chunks/index.BwQVmJhW.js","assets/chunks/Suggestions.CR9CzKlO.js","assets/chunks/Template.B967UYe5.js","assets/chunks/DecorativeContent.Chv9dswO.js","assets/chunks/voiceInput.BZXwYPtO.js","assets/chunks/DeepThink.CcvDrSJQ.js","assets/chunks/AutoSize.D-v8CRqw.js","assets/chunks/Mode.B1t-q-tU.js"])))=>i.map(i=>d[i]);
import{p as r,v as c,V as h,C as F,c as S,o as D,ag as l,ah as u,G as e,j as d,ai as m,k as n,w as a,a as o}from"./chunks/framework.kTfunus-.js";import{O as k,E as b}from"./chunks/index.Bs5OpVoR.js";const q=`<template>
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

    <div class="custom-vars-section">
      <h4>自定义变量覆盖</h4>
      <p>你可以通过CSS变量来进一步自定义紧凑模式的样式：</p>

      <div class="custom-example">
        <tr-sender
          class="tr-sender-compact custom-compact-sender"
          mode="multiple"
          placeholder="自定义样式的紧凑模式..."
          :showWordLimit="true"
          :maxLength="50"
        />
      </div>

      <pre class="code-example"><code>/* 自定义紧凑模式的变量 */
.custom-compact-sender {
  /* 进一步减小字体和行高 */
  --tr-sender-compact-font-size: 12px;
  --tr-sender-compact-line-height: 18px;
  --tr-sender-compact-input-height: 18px;
  
  /* 调整圆角和图标尺寸 */
  --tr-sender-compact-input-radius: 16px;
  --tr-sender-compact-send-icon-size: 28px;
  
  /* 调整内边距配置 */
  --tr-sender-compact-single-content-padding: 6px 4px 6px 8px;
  --tr-sender-compact-multiple-content-padding: 8px 12px 0 12px;
}</code></pre>
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

/* 自定义样式示例 */
:deep(.custom-compact-sender) {
  --tr-sender-compact-font-size: 12px;
  --tr-sender-compact-line-height: 18px;
  --tr-sender-compact-single-content-padding: 6px 4px 6px 8px;
  --tr-sender-compact-input-radius: 16px;
  --tr-sender-compact-send-icon-size: 28px;
}
</style>
`,B=`<template>
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
        <tiny-button
          size="mini"
          plain
          circle
          :reset-time="0"
          style=""
          :class="['custom-button', isActive ? 'active' : '']"
          @click="toggleActive"
        >
          <div class="icon-container">
            <IconThink class="icon-think" />
            <span class="text">深度思考</span>
          </div>
        </tiny-button>
      </tiny-tooltip>
    </template>

    <template #footer-right>
      <tiny-button plain type="text">
        <IconRefresh class="icon-refresh" />
      </tiny-button>
    </template>
  </tr-sender>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { IconAi, IconThink, IconRefresh } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinyTooltip } from '@opentiny/vue'

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
  border-top: 1px solid #eee;
}

.icon-refresh {
  font-size: 20px;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.icon-think {
  font-size: 16px;
}

.text {
  width: 56px;
  height: 22px;
  line-height: 22px;
  font-size: 14px;
}

.custom-button {
  width: 100px;
  height: 32px;
}

:deep(.tiny-button) {
  background-color: rgb(255, 255, 255) !important;
}

:deep(.tiny-button.active) {
  border: 1px solid rgb(20, 118, 255) !important;
  background: rgba(20, 118, 255, 0.08) !important;
  color: rgb(20, 118, 255) !important;
}

:deep(.tiny-tooltip.tiny-tooltip__popper) {
  border-radius: 4px;
  padding: 4px 8px;
  background: rgb(89, 89, 89);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.16);
}
</style>
`,R=`<template>
  <div class="demo-container">
    <h3>单行模式 (mode="single") - 默认</h3>
    <p>尝试输入 "ECS", "CDN" 等查看联想效果。</p>
    <tr-sender
      v-model="textSingle"
      :suggestions="sampleSuggestions"
      mode="single"
      placeholder="单行模式联想..."
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const textSingle = ref('')
const textMultiple = ref('')

const sampleSuggestions = ref([
  'ECS-云服务器卡顿',
  'ECS-备份弹性云服务器',
  'ECS-搜索ECS',
  'ECS-云服务器状态',
  'ECS-免费云服务器',
  'CDN-权限管理',
  'CDN常见问题场景以及解决方法有哪些？',
  'CDN-CDN是否支持全站加速？',
  'CDN-添加CDN加速域名',
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
`,N=`<template>
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
`,w=`<template>
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
`,W=`<template>
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
`,z=`<template>
  <tr-sender mode="multiple" :showWordLimit="true" :maxLength="1000">
    <template #footer-left>
      <tiny-tooltip :disabled="isActive" content="适用于复杂问题解析" placement="top" theme="dark">
        <tiny-button
          size="mini"
          plain
          circle
          :reset-time="0"
          style=""
          :class="['custom-button', isActive ? 'active' : '']"
          @click="toggleActive"
        >
          <div class="icon-container">
            <IconThink class="icon-think" />
            <span class="text">深度思考</span>
          </div>
        </tiny-button>
      </tiny-tooltip>
    </template>
  </tr-sender>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { IconThink } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinyTooltip } from '@opentiny/vue'

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

.icon-think {
  font-size: 16px;
}

.text {
  width: 56px;
  height: 22px;
  line-height: 22px;
  font-size: 14px;
}

.custom-button {
  width: 100px;
  height: 32px;
}

:deep(.tiny-button) {
  background-color: rgb(255, 255, 255) !important;
}

:deep(.tiny-button:hover) {
  background-color: rgba(0, 0, 0, 0.04) !important;
  border: 1px solid rgb(194, 194, 194) !important;
}

:deep(.tiny-button.active) {
  border: 1px solid rgb(20, 118, 255) !important;
  background: rgba(20, 118, 255, 0.08) !important;
  color: rgb(20, 118, 255) !important;
}

:deep(.tiny-tooltip.tiny-tooltip__popper) {
  border-radius: 4px;
  padding: 4px 8px;
  background: rgb(89, 89, 89);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.16);
}
</style>
`,V=`<template>
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
`,L=`<template>
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
`,X=JSON.parse('{"title":"Sender 消息输入框组件","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/sender.md","filePath":"components/sender.md"}'),P={name:"components/sender.md"},M=Object.assign(P,{setup(U){const v=r();c(async()=>{v.value=(await h(async()=>{const{default:s}=await import("./chunks/CompactMode.SgEdV3Cv.js");return{default:s}},__vite__mapDeps([0,1,2,3,4,5,6,7]))).default});const y=r();c(async()=>{y.value=(await h(async()=>{const{default:s}=await import("./chunks/All.BZX714tu.js");return{default:s}},__vite__mapDeps([8,1,2,3,4,5,6,7,9,10,11,12,13]))).default});const f=r();c(async()=>{f.value=(await h(async()=>{const{default:s}=await import("./chunks/Suggestions.CR9CzKlO.js");return{default:s}},__vite__mapDeps([14,1,2,3,4,5,6,7]))).default});const x=r();c(async()=>{x.value=(await h(async()=>{const{default:s}=await import("./chunks/Template.B967UYe5.js");return{default:s}},__vite__mapDeps([15,1,2,3,4,5,6,7]))).default});const E=r();c(async()=>{E.value=(await h(async()=>{const{default:s}=await import("./chunks/DecorativeContent.Chv9dswO.js");return{default:s}},__vite__mapDeps([16,1,2,3,4,5,6,7]))).default});const _=r();c(async()=>{_.value=(await h(async()=>{const{default:s}=await import("./chunks/voiceInput.BZXwYPtO.js");return{default:s}},__vite__mapDeps([17,1,2,3,4,5,6,7]))).default});const C=r();c(async()=>{C.value=(await h(async()=>{const{default:s}=await import("./chunks/DeepThink.CcvDrSJQ.js");return{default:s}},__vite__mapDeps([18,1,2,3,4,5,6,7,9,10,11,12,13]))).default});const T=r();c(async()=>{T.value=(await h(async()=>{const{default:s}=await import("./chunks/AutoSize.D-v8CRqw.js");return{default:s}},__vite__mapDeps([19,1,2,3,4,5,6,7]))).default});const i=r(!0),A=r();return c(async()=>{A.value=(await h(async()=>{const{default:s}=await import("./chunks/Mode.B1t-q-tU.js");return{default:s}},__vite__mapDeps([20,1,2,3,4,5,6,7]))).default}),(s,t)=>{const p=F("ClientOnly"),g=F("tr-sender");return D(),S("div",null,[t[9]||(t[9]=l('<h1 id="sender-消息输入框组件" tabindex="-1">Sender 消息输入框组件 <a class="header-anchor" href="#sender-消息输入框组件" aria-label="Permalink to &quot;Sender 消息输入框组件&quot;">​</a></h1><p>Sender 是一个灵活的输入组件，支持多种输入方式和功能，包括文本输入、语音输入、模板填充等。具有丰富的功能和自定义选项。适用于聊天界面、评论输入、搜索框等多种场景。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基础用法" tabindex="-1">基础用法 <a class="header-anchor" href="#基础用法" aria-label="Permalink to &quot;基础用法&quot;">​</a></h3><blockquote><p>单行模式(<code>mode=&quot;single&quot;</code>), 适用于简单的输入场景，如搜索框、简短消息输入等。</p></blockquote><ul><li><p><strong>换行说明，在单行模式下</strong>：</p></li><li><p>1.输入文字超出单行宽度限制时，会自动切换至多行模式。</p></li><li><p>2.使用快捷键组合 <code>shift+enter</code> 可以直接切换至多行模式</p></li></ul><blockquote><p>多行模式(<code>mode=&quot;multiple&quot;</code>)适用于较长文本输入，如评论、聊天消息等。</p></blockquote>',7)),u(e(n(k),null,null,512),[[m,i.value]]),e(p,null,{default:a(()=>[e(n(b),{title:"基础用法",description:"Sender 组件的基础用法，支持单行和多行模式。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{i.value=!1}),vueCode:n(L)},{vue:a(()=>[e(n(A))]),_:1},8,["vueCode"])]),_:1}),t[10]||(t[10]=d("h3",{id:"状态控制",tabindex:"-1"},[o("状态控制 "),d("a",{class:"header-anchor",href:"#状态控制","aria-label":'Permalink to "状态控制"'},"​")],-1)),t[11]||(t[11]=d("h4",{id:"加载状态",tabindex:"-1"},[o("加载状态 "),d("a",{class:"header-anchor",href:"#加载状态","aria-label":'Permalink to "加载状态"'},"​")],-1)),t[12]||(t[12]=d("p",null,[o("通过设置"),d("code",null,"loading"),o("属性控制组件的加载状态，加载状态下输入框将显示加载动画并禁用输入。 在加载状态下，点击加载图标可以取消发送操作，这会触发 "),d("code",null,"cancel"),o(" 事件。")],-1)),e(g,{loading:!0,stopText:"停止回答"}),t[13]||(t[13]=l('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">loading</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> stopText</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;停止回答&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><h4 id="禁用状态" tabindex="-1">禁用状态 <a class="header-anchor" href="#禁用状态" aria-label="Permalink to &quot;禁用状态&quot;">​</a></h4><p>通过设置<code>disabled</code>属性禁用整个组件，禁用状态下无法输入内容或触发任何操作。</p>',3)),e(g,{disabled:!0}),t[14]||(t[14]=l('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">disabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><h3 id="内容控制" tabindex="-1">内容控制 <a class="header-anchor" href="#内容控制" aria-label="Permalink to &quot;内容控制&quot;">​</a></h3><h4 id="字数限制与统计" tabindex="-1">字数限制与统计 <a class="header-anchor" href="#字数限制与统计" aria-label="Permalink to &quot;字数限制与统计&quot;">​</a></h4><p>通过<code>maxLength</code>属性限制输入字符数，搭配<code>showWordLimit</code>显示字数统计。</p><blockquote><p><strong>注意</strong>：当输入内容超出字数限制时，系统不会自动截断，真实字数会以红色标示，且无法发送。</p></blockquote>',5)),e(g,{mode:"multiple",showWordLimit:!0,maxLength:20,defaultValue:"测试超出字数限制，当前已经超过了字数限制。"}),t[15]||(t[15]=l('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> mode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;multiple&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">showWordLimit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">maxLength</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> defaultValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;测试超出字数限制，当前已经超过了字数限制。&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span></code></pre></div><h4 id="自动调整高度" tabindex="-1">自动调整高度 <a class="header-anchor" href="#自动调整高度" aria-label="Permalink to &quot;自动调整高度&quot;">​</a></h4><p>通过<code>autoSize</code>属性可以设置输入框是否自动调整高度。当设置为<code>true</code>时，输入框会根据内容自动调整高度，适用于需要动态适应内容长度的场景。</p><p><strong>注意</strong>：只对 mode=&quot;multiple&quot; 有效。</p><blockquote><p>可传入对象，如{ minRows: 2, maxRows: 3 }。</p></blockquote>',5)),u(e(n(k),null,null,512),[[m,i.value]]),e(p,null,{default:a(()=>[e(n(b),{title:"自动调整高度",description:"Sender 组件支持自动调整高度。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[1]||(t[1]=()=>{i.value=!1}),vueCode:n(V)},{vue:a(()=>[e(n(T))]),_:1},8,["vueCode"])]),_:1}),t[16]||(t[16]=d("h4",{id:"可清空输入",tabindex:"-1"},[o("可清空输入 "),d("a",{class:"header-anchor",href:"#可清空输入","aria-label":'Permalink to "可清空输入"'},"​")],-1)),t[17]||(t[17]=d("p",null,[o("通过"),d("code",null,"clearable"),o("属性添加清空按钮，方便用户快速清除输入内容。")],-1)),e(g,{clearable:!0}),t[18]||(t[18]=l('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">clearable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><h3 id="高级功能" tabindex="-1">高级功能 <a class="header-anchor" href="#高级功能" aria-label="Permalink to &quot;高级功能&quot;">​</a></h3><h4 id="自定义按钮" tabindex="-1">自定义按钮 <a class="header-anchor" href="#自定义按钮" aria-label="Permalink to &quot;自定义按钮&quot;">​</a></h4><p>Sender 组件支持在多行模式下灵活定制底部区域。通过 <code>footer-left</code> 和 <code>footer-right</code> 插槽，您可以在保留现有功能的同时添加自定义内容。</p><ul><li><code>footer-left</code>: 在字数限制左侧添加自定义内容</li><li><code>footer-right</code>: 在操作按钮左侧添加自定义内容</li><li><code>footer</code>: 完全自定义底部区域（会覆盖默认内容，仅用于向后兼容）</li></ul>',5)),u(e(n(k),null,null,512),[[m,i.value]]),e(p,null,{default:a(()=>[e(n(b),{title:"自定义按钮",description:"Sender 组件支持在多行模式下灵活定制底部区域。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[2]||(t[2]=()=>{i.value=!1}),vueCode:n(z)},{vue:a(()=>[e(n(C))]),_:1},8,["vueCode"])]),_:1}),t[19]||(t[19]=l('<p>注意：<code>footer</code> 插槽与 <code>footer-left</code>/<code>footer-right</code> 插槽互斥，如果同时使用，将优先显示 <code>footer-left</code>/<code>footer-right</code> 插槽。</p><h4 id="语音输入" tabindex="-1">语音输入 <a class="header-anchor" href="#语音输入" aria-label="Permalink to &quot;语音输入&quot;">​</a></h4><p>启用<code>allowSpeech</code>支持语音输入功能，用户可以通过语音录入文本。</p><ul><li><p>混合模式：用户可以先用键盘输入部分内容，然后通过语音继续补充，自动停止录音。</p></li><li><p>连续语音输入：用户可以连续录入语音，系统会自动将语音转换为文本，点击按钮手动停止录音。</p></li></ul>',4)),u(e(n(k),null,null,512),[[m,i.value]]),e(p,null,{default:a(()=>[e(n(b),{title:"语音输入",description:"可以使用 speech 属性进行配置",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[3]||(t[3]=()=>{i.value=!1}),vueCode:n(W)},{vue:a(()=>[e(n(_))]),_:1},8,["vueCode"])]),_:1}),t[20]||(t[20]=l('<h4 id="消息提示" tabindex="-1">消息提示 <a class="header-anchor" href="#消息提示" aria-label="Permalink to &quot;消息提示&quot;">​</a></h4><p>此功能适用于需要在输入框内显示提示信息并引导用户操作的场景，如：</p><ul><li><strong>1. 服务状态提示</strong></li><li><strong>2. 快捷操作链接</strong></li><li><strong>3. 功能引导等</strong></li></ul><p>当使用 <code>decorativeContent</code> 插槽时，输入框会自动被禁用，仅展示插槽内容，无法输入文本或触发发送操作。</p>',4)),u(e(n(k),null,null,512),[[m,i.value]]),e(p,null,{default:a(()=>[e(n(b),{title:"装饰性内容示例",description:"在输入框内显示装饰性内容和可点击链接，可用于服务状态提示、功能引导等场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[4]||(t[4]=()=>{i.value=!1}),vueCode:n(w)},{vue:a(()=>[e(n(E))]),_:1},8,["vueCode"])]),_:1}),t[21]||(t[21]=d("h4",{id:"文件上传",tabindex:"-1"},[o("文件上传 "),d("a",{class:"header-anchor",href:"#文件上传","aria-label":'Permalink to "文件上传"'},"​")],-1)),t[22]||(t[22]=d("p",null,[o("支持附件上传功能，可通过"),d("code",null,"allowFiles"),o("控制。")],-1)),t[23]||(t[23]=d("blockquote",null,[d("p",null,"目前仅支持按钮显示，后续会添加附件上传相关功能。")],-1)),e(g,{allowFiles:!0}),t[24]||(t[24]=l('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">allowFiles</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><h4 id="模版填充" tabindex="-1">模版填充 <a class="header-anchor" href="#模版填充" aria-label="Permalink to &quot;模版填充&quot;">​</a></h4><p>通过 <code>templateData</code> prop 实现模板的动态设置与双向绑定。推荐使用 <code>v-model:templateData</code> 的语法糖。</p><p>该功能加载后，光标会自动聚焦在第一个可编辑的模板字段上，方便用户直接开始编辑。</p><p><strong>模板示例</strong></p>',5)),u(e(n(k),null,null,512),[[m,i.value]]),e(p,null,{default:a(()=>[e(n(b),{title:"模板填充示例",description:"Sender 组件支持模板填充，展示动态模板切换功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[5]||(t[5]=()=>{i.value=!1}),vueCode:n(N)},{vue:a(()=>[e(n(x))]),_:1},8,["vueCode"])]),_:1}),t[25]||(t[25]=l('<p><strong>备注</strong><code>templateData</code> prop 接收一个 <code>UserItem[]</code> 类型的数组。 <code>UserItem</code> 的结构为 <code>{ type: &#39;text&#39;, content: string }</code> 或 <code>{ type: &#39;template&#39;, content: string }</code>。 当 <code>type</code> 为 <code>&#39;template&#39;</code> 时，对应的 <code>content</code> 会渲染为一个可编辑的模板字段。</p><h4 id="输入联想" tabindex="-1">输入联想 <a class="header-anchor" href="#输入联想" aria-label="Permalink to &quot;输入联想&quot;">​</a></h4><p>Sender 组件支持输入联想功能，当用户输入时，可以根据提供的 <code>suggestions</code> 列表显示匹配的建议项。此功能有助于提高输入效率和准确性。</p><p><strong>核心特性:</strong></p><ul><li><p><strong>Tab 提示器</strong>: 仅在有联想数据且输入框有内容时显示，提示用户可按 Tab 选择。</p></li><li><p><strong>输入框补全</strong>: 用户输入部分正常显示，联想到的补全部分以半透明灰色文本展示。</p></li><li><p><strong>键盘交互</strong>:</p><ul><li><code>↑</code>/<code>↓</code>: 在联想弹窗中导航。</li><li><code>Tab</code>/<code>Enter</code>: 确认当前高亮的联想项。</li><li><code>Esc</code>: 关闭联想弹窗。</li></ul></li></ul><blockquote><p><strong>注意</strong>: 输入框内的补全文本特性在匹配到联想项的前置字符时显示，否则不显示。</p></blockquote>',6)),u(e(n(k),null,null,512),[[m,i.value]]),e(p,null,{default:a(()=>[e(n(b),{title:"输入联想示例",description:"展示 Sender 组件的输入联想功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[6]||(t[6]=()=>{i.value=!1}),vueCode:n(R)},{vue:a(()=>[e(n(f))]),_:1},8,["vueCode"])]),_:1}),t[26]||(t[26]=l('<h4 id="自定义提交方式" tabindex="-1">自定义提交方式 <a class="header-anchor" href="#自定义提交方式" aria-label="Permalink to &quot;自定义提交方式&quot;">​</a></h4><p>通过<code>submitType</code>属性控制提交方式，支持多种键盘快捷键组合。</p><ul><li>提交行为说明：</li><li><ul><li>当 submitType 为 enter 时：按 Enter 键提交</li></ul></li><li><ul><li>当 submitType 为 ctrlEnter 时：按 Ctrl+Enter 提交，单独按 Enter 换行</li></ul></li><li><ul><li>当 submitType 为 shiftEnter 时：按 Shift+Enter 提交，单独按 Enter 换行</li></ul></li></ul><p>这些快捷键适用于不同的使用习惯和操作系统，方便用户根据自己的喜好选择提交方式。</p>',4)),e(g,{submitType:"ctrlEnter",mode:"multiple",placeholder:"按Ctrl+Enter提交"}),t[27]||(t[27]=l('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> submitType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ctrlEnter&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> mode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;multiple&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> placeholder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;按Ctrl+Enter提交&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div>',1)),e(g,{submitType:"shiftEnter",mode:"multiple",placeholder:"按Shift+Enter提交"}),t[28]||(t[28]=l('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> submitType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;shiftEnter&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> mode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;multiple&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> placeholder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;按Shift+Enter提交&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>使用不同的提交方式可以适应不同的使用场景：</p><ul><li>聊天应用通常使用<code>enter</code>快速提交消息</li><li>多行文本编辑时，使用<code>ctrl+enter</code>或<code>shift+enter</code>可避免误提交</li><li>代码编辑器类应用通常使用<code>ctrl+enter</code>提交，保持编辑文本的结构</li></ul><h3 id="键盘快捷键支持" tabindex="-1">键盘快捷键支持 <a class="header-anchor" href="#键盘快捷键支持" aria-label="Permalink to &quot;键盘快捷键支持&quot;">​</a></h3><p>Sender 组件支持多种键盘快捷键操作，提高用户输入效率：</p><table tabindex="0"><thead><tr><th>快捷键</th><th>功能</th><th>适用条件</th></tr></thead><tbody><tr><td>Enter</td><td>提交内容 / 选中联想项</td><td>submitType=&quot;enter&quot;（默认） / 联想弹窗开启时</td></tr><tr><td>Ctrl+Enter</td><td>提交内容</td><td>submitType=&quot;ctrlEnter&quot;(多行)</td></tr><tr><td>Shift+Enter</td><td>提交内容</td><td>submitType=&quot;shiftEnter&quot;(多行)</td></tr><tr><td>Tab</td><td>选中联想项</td><td>联想弹窗开启并有联想数据时</td></tr><tr><td>Esc</td><td>取消语音/关闭联想/建议</td><td>对应功能激活时</td></tr><tr><td>↑ / ↓</td><td>导航联想项</td><td>联想弹窗开启时</td></tr></tbody></table><p>您可以在实际开发中根据应用场景和用户需求选择最适合的快捷键方式。</p><h3 id="布局与插槽" tabindex="-1">布局与插槽 <a class="header-anchor" href="#布局与插槽" aria-label="Permalink to &quot;布局与插槽&quot;">​</a></h3><p>以下是一个关于插槽的综合使用示例：</p>',9)),u(e(n(k),null,null,512),[[m,i.value]]),e(p,null,{default:a(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[7]||(t[7]=()=>{i.value=!1}),vueCode:n(B)},{vue:a(()=>[e(n(y))]),_:1},8,["vueCode"])]),_:1}),t[29]||(t[29]=l(`<h3 id="紧凑模式配置" tabindex="-1">紧凑模式配置 <a class="header-anchor" href="#紧凑模式配置" aria-label="Permalink to &quot;紧凑模式配置&quot;">​</a></h3><p>Sender 组件支持紧凑模式，适用于空间受限的场景。通过添加 <code>tr-sender-compact</code> CSS类可以启用紧凑样式。</p><p>紧凑模式的特点：</p><ul><li>较小的字体和输入框（14px vs 16px）</li><li>更紧凑的内边距和间距</li><li>更小的图标尺寸（32px vs 36px）</li><li>更小的圆角（24px vs 26px）</li></ul><p><strong>使用方式：</strong></p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&lt;!-- 默认样式（宽松模式） --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrSender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&lt;!-- 紧凑模式 --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrSender</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;tr-sender-compact&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div>`,6)),u(e(n(k),null,null,512),[[m,i.value]]),e(p,null,{default:a(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[8]||(t[8]=()=>{i.value=!1}),vueCode:n(q)},{vue:a(()=>[e(n(v))]),_:1},8,["vueCode"])]),_:1}),t[30]||(t[30]=l(`<h2 id="api-说明" tabindex="-1">API 说明 <a class="header-anchor" href="#api-说明" aria-label="Permalink to &quot;API 说明&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td>autofocus</td><td>自动获取焦点</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>autoSize</td><td>自动调整高度</td><td><code>boolean | { minRows: number, maxRows: number }</code></td><td><code>false</code></td></tr><tr><td>allowSpeech</td><td>是否开启语音输入</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>allowFiles</td><td>是否允许文件上传</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td>clearable</td><td>是否可清空</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>disabled</td><td>是否禁用</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>modelValue</td><td>绑定值(v-model)</td><td><code>string</code></td><td><code>&#39;&#39;</code></td></tr><tr><td>defaultValue</td><td>默认值(非响应式)</td><td><code>string</code></td><td><code>&#39;&#39;</code></td></tr><tr><td>loading</td><td>是否加载中</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>mode</td><td>输入框类型</td><td><code>&#39;single&#39; | &#39;multiple&#39;</code></td><td><code>&#39;single&#39;</code></td></tr><tr><td>maxLength</td><td>最大输入长度</td><td><code>number</code></td><td><code>Infinity</code></td></tr><tr><td>placeholder</td><td>输入框占位文本</td><td><code>string</code></td><td><code>&#39;请输入内容...&#39;</code></td></tr><tr><td>speech</td><td>语音识别配置</td><td><code>&#39;boolean&#39; | &#39;SpeechConfig&#39;</code></td><td>无</td></tr><tr><td>showWordLimit</td><td>是否显示字数统计</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>stopText</td><td>停止按钮文字</td><td><code>string</code></td><td><code>仅显示图标</code></td></tr><tr><td>submitType</td><td>提交方式</td><td><code>&#39;enter&#39; | &#39;ctrl+enter&#39; | &#39;shift+enter&#39;</code></td><td><code>&#39;enter&#39;</code></td></tr><tr><td>theme</td><td>主题样式</td><td><code>&#39;light&#39; | &#39;dark&#39;</code></td><td><code>&#39;light&#39;</code></td></tr><tr><td>suggestions</td><td>输入建议列表</td><td><code>string[]</code></td><td><code>[]</code></td></tr><tr><td>suggestionPopupWidth</td><td>输入建议弹窗宽度</td><td><code>&#39;number&#39; | &#39;string&#39;</code></td><td><code>400px</code></td></tr><tr><td>templateData</td><td>模板数据，用于初始化或 v-model 更新</td><td><code>UserItem[]</code></td><td><code>[]</code></td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td>update:modelValue</td><td>输入值变化时触发(v-model)</td><td><code>(value: string)</code></td></tr><tr><td>blur</td><td>输入框失去焦点时触发</td><td><code>(event: FocusEvent)</code></td></tr><tr><td>change</td><td>输入值改变且失焦时触发</td><td><code>(value: string)</code></td></tr><tr><td>focus</td><td>输入框获得焦点时触发</td><td><code>(event: FocusEvent)</code></td></tr><tr><td>input</td><td>输入值改变时触发</td><td><code>(value: string)</code></td></tr><tr><td>submit</td><td>提交内容时触发</td><td><code>(value: string)</code></td></tr><tr><td>clear</td><td>清空内容时触发</td><td><code>()</code></td></tr><tr><td>cancel</td><td>取消发送（加载状态）时触发</td><td><code>()</code></td></tr><tr><td>speech-start</td><td>语音识别开始时触发</td><td><code>()</code></td></tr><tr><td>speech-end</td><td>语音识别结束时触发</td><td><code>(transcript: string)</code></td></tr><tr><td>speech-interim</td><td>语音识别中间结果时触发</td><td><code>(transcript: string)</code></td></tr><tr><td>speech-error</td><td>语音识别错误时触发</td><td><code>(error: Error)</code></td></tr><tr><td>suggestion-select</td><td>选择输入建议时触发</td><td><code>(value: string)</code></td></tr></tbody></table><h3 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h3><table tabindex="0"><thead><tr><th>方法名</th><th>说明</th><th>参数</th><th>返回值</th></tr></thead><tbody><tr><td>focus</td><td>使输入框获取焦点</td><td>-</td><td><code>void</code></td></tr><tr><td>blur</td><td>使输入框失去焦点</td><td>-</td><td><code>void</code></td></tr><tr><td>clear</td><td>清空输入内容</td><td>-</td><td><code>void</code></td></tr><tr><td>submit</td><td>手动触发提交事件</td><td>-</td><td><code>void</code></td></tr><tr><td>startSpeech</td><td>开始语音识别</td><td>-</td><td><code>Promise&lt;void&gt;</code></td></tr><tr><td>stopSpeech</td><td>停止语音识别</td><td>-</td><td><code>void</code></td></tr><tr><td>activateTemplateFirstField</td><td>激活模板的第一个输入字段</td><td>-</td><td><code>void</code></td></tr></tbody></table><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><p>组件布局结构如下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>+----------------------+</span></span>
<span class="line"><span>|      header slot     |  &lt;!-- 位于内容区域上方 --&gt;</span></span>
<span class="line"><span>+----------------------+</span></span>
<span class="line"><span>| prefix |   content   | actions  &lt;!-- 横向排列 --&gt;</span></span>
<span class="line"><span>| slot   |    area     | slot</span></span>
<span class="line"><span>+----------------------+</span></span>
<span class="line"><span>|footer-left | footer-right|  &lt;!-- 底部左右两侧区域 --&gt;</span></span>
<span class="line"><span>+----------------------+</span></span></code></pre></div><table tabindex="0"><thead><tr><th>插槽名称</th><th>描述</th><th>CSS类名</th><th>默认内容</th></tr></thead><tbody><tr><td><code>header</code></td><td>头部插槽，位于输入框上方</td><td><code>.tiny-sender__header-slot</code></td><td>无</td></tr><tr><td><code>prefix</code></td><td>前缀插槽，位于输入框左侧</td><td><code>.tiny-sender__prefix-slot</code></td><td>无</td></tr><tr><td><code>actions</code></td><td>后缀插槽，位于输入框右侧</td><td><code>.tiny-sender__actions-slot</code></td><td>单行模式下的操作按钮</td></tr><tr><td><code>footer-left</code></td><td>底部左侧插槽，保留字数限制</td><td><code>.tiny-sender__footer-left</code></td><td>字数限制</td></tr><tr><td><code>footer-right</code></td><td>底部右侧插槽，保留操作按钮</td><td><code>.tiny-sender__footer-right</code></td><td>多行模式下的操作按钮</td></tr><tr><td><code>footer</code></td><td>底部完全自定义插槽(向后兼容)</td><td><code>.tiny-sender__footer-slot</code></td><td>无 (会覆盖其他底部元素)</td></tr><tr><td><code>decorativeContent</code></td><td>装饰性内容插槽，启用后禁止输入</td><td><code>.tiny-sender__decorative-content</code></td><td>无</td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  lang</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 识别语言，默认浏览器语言</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  continuous</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否持续识别</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  interimResults</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否返回中间结果</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  autoReplace</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否自动替换当前输入内容</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,13))])}}});export{X as __pageData,M as default};

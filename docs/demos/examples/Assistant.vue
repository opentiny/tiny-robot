<template>
  <tr-container v-model:fullscreen="fullscreen" v-model:show="show" class="tiny-container">
    <template #operations>
      <tr-icon-button :icon="IconNewSession" size="28" svgSize="20" @click="createConversation()" />
      <span style="display: inline-flex; line-height: 0; position: relative">
        <tr-icon-button :icon="IconHistory" size="28" svgSize="20" @click="showHistory = true" />
        <tr-history
          v-show="showHistory"
          class="tr-history-demo"
          tab-title="历史对话"
          :selected="currentMessageId"
          :search-bar="true"
          :data="historyData"
          @close="showHistory = false"
          @item-click="handleHistorySelect"
        ></tr-history>
      </span>
    </template>
    <div v-if="messages.length === 0">
      <tr-welcome title="盘古助手" description="您好，我是盘古助手，您专属的华为云专家" :icon="welcomeIcon">
        <template #footer>
          <div class="welcome-footer">
            <span>根据相关法律法规要求，您需要先 <a>登录</a>，若没有帐号，您可前往 <a>注册</a></span>
          </div>
        </template>
      </tr-welcome>
      <tr-prompts
        :items="promptItems"
        :wrap="true"
        item-class="prompt-item"
        class="tiny-prompts"
        @item-click="handlePromptItemClick"
      ></tr-prompts>
    </div>
    <tr-bubble-list v-else :items="messages" :roles="roles" auto-scroll></tr-bubble-list>

    <template #footer>
      <div class="chat-input">
        <tr-suggestion
          v-model:open="suggestionOpen"
          :items="suggestionItems"
          :categories="categories"
          @fill-template="handleFillTemplate"
          :maxVisibleItems="5"
        >
          <template #trigger="{ onKeyDown, onTrigger }">
            <tr-sender
              ref="senderRef"
              mode="single"
              v-model="inputMessage"
              :placeholder="GeneratingStatus.includes(messageState.status) ? '正在思考中...' : '请输入您的问题'"
              :clearable="true"
              :loading="GeneratingStatus.includes(messageState.status)"
              :showWordLimit="true"
              :maxLength="1000"
              :template="currentTemplate"
              @submit="handleSendMessage"
              @cancel="abortRequest"
              @keydown="handleMessageKeydown($event, onTrigger, onKeyDown)"
              @reset-template="clearTemplate"
            ></tr-sender>
          </template>
        </tr-suggestion>
      </div>
    </template>
  </tr-container>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <div>
      <label>show：</label>
      <tiny-switch v-model="show"></tiny-switch>
    </div>
    <div>
      <label>fullscreen：</label>
      <tiny-switch v-model="fullscreen"></tiny-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  type BubbleRoleConfig,
  type PromptProps,
  type SuggestionItem,
  type TriggerHandler,
  type Category,
  type HistoryGroup,
  TrBubbleList,
  TrContainer,
  TrHistory,
  TrIconButton,
  TrPrompts,
  TrSender,
  TrSuggestion,
  TrWelcome,
} from '@opentiny/tiny-robot'
import { AIClient, ChatMessage, GeneratingStatus, useConversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconHistory, IconNewSession, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { type CSSProperties, h, nextTick, onMounted, reactive, ref, toRaw, watch } from 'vue'

const client = new AIClient({
  provider: 'openai',
  // apiKey: 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: location.origin + import.meta.env.BASE_URL,
})

const fullscreen = ref(false)
const show = ref(true)

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })
const welcomeIcon = h(IconAi, { style: { fontSize: '48px' } })

const promptItems: PromptProps[] = [
  {
    label: '日常助理场景',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🧠'),
    badge: 'NEW',
  },
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是“Vue3 和 React 的区别”！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
  {
    label: '创意生成场景',
    description: '想写段文案、起个名字，还是来点灵感？',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '✨'),
  },
]

// 指令模板测试数据
const templateSuggestions: SuggestionItem[] = [
  {
    id: 'write',
    text: '帮我写作',
    value: '帮我写作',
    description: '智能写作助手',
    template: '帮我撰写 [文章类型] 字的 [主题], 语气类型是 [正式/轻松/专业], 具体内容是 [详细描述]',
  },
  {
    id: 'translate',
    text: '翻译',
    value: '翻译',
    description: '多语言翻译',
    template: '请将以下 [中文/英文/法语/德语/日语] 内容翻译成 [目标语言]: [需要翻译的内容]',
  },
  {
    id: 'summarize',
    text: '内容总结',
    value: '内容总结',
    description: '智能总结长文本',
    template: '请对以下内容进行 [简要/详细] 总结，约 [字数] 字: [需要总结的内容]',
  },
  {
    id: 'code-review',
    text: '代码审查',
    value: '代码审查',
    description: '代码质量审查',
    template:
      '请帮我审查以下 [JavaScript/TypeScript/Python/Java/C++/Go] 代码，关注 [性能/安全/可读性/最佳实践] 方面: [代码内容]',
  },
  {
    id: 'email-compose',
    text: '写邮件',
    value: '写邮件',
    description: '邮件草拟',
    template: '请帮我起草一封 [正式/非正式] 邮件，发送给 [收件人角色]，主题是 [邮件主题]，内容是关于 [邮件内容]',
  },
  {
    id: 'data-analysis',
    text: '数据分析',
    value: '数据分析',
    description: '数据分析与报告',
    template:
      '请分析以下 [销售/用户/流量/金融/健康] 数据，关注 [增长率/分布/趋势/异常/关联性] 指标，生成 [柱状图/折线图/饼图/散点图/热力图] 可视化: [数据内容]',
  },
  {
    id: 'product-design',
    text: '产品设计',
    value: '产品设计',
    description: '产品功能设计',
    template:
      '请设计一个 [移动应用/网站/小程序/桌面软件/智能硬件] 的 [功能名称] 功能，目标用户是 [用户群体]，核心价值是 [功能价值]',
  },
  {
    id: 'meeting-summary',
    text: '会议纪要',
    value: '会议纪要',
    description: '会议记录整理',
    template: '请帮我整理一份会议纪要，会议主题是 [会议主题]，参会人员有 [参会人员]，会议要点包括 [会议要点]',
  },
  {
    id: 'interview-questions',
    text: '面试问题',
    value: '面试问题',
    description: '生成面试问题',
    template: '请为 [岗位名称] 岗位，针对 [技能领域] 方向，设计 [3/5/10] 个 [简单/中等/困难] 面试问题',
  },
  {
    id: 'speech-draft',
    text: '演讲稿',
    value: '演讲稿',
    description: '演讲稿撰写',
    template:
      '请帮我撰写一篇 [开场/主题/致谢/颁奖/毕业] 演讲稿，主题是 [演讲主题]，时长约 [5/10/15/30] 分钟，受众是 [目标听众]',
  },
]

// 模板分类测试数据
const templateCategories: Category[] = [
  {
    id: 'common',
    label: '常用指令',
    items: templateSuggestions.slice(0, 3),
  },
  {
    id: 'work',
    label: '工作助手',
    items: templateSuggestions.slice(3, 6),
  },
  {
    id: 'content',
    label: '内容创作',
    items: templateSuggestions.slice(6),
  },
]

const { messageManager, createConversation } = useConversation({ client })

const randomId = () => Math.random().toString(36).substring(2, 15)

const currentMessageId = ref('')

const { messages, messageState, inputMessage, sendMessage, abortRequest } = messageManager

const handlePromptItemClick = (ev: unknown, item: { description?: string }) => {
  sendMessage(item.description)
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
    maxWidth: '80%',
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    maxWidth: '80%',
  },
}

const showHistory = ref(false)

const historyData = reactive<HistoryGroup<ChatMessage[]>[]>([])

watch(
  () => messages.value[messages.value.length - 1]?.content,
  () => {
    if (!messages.value.length) {
      return
    }

    if (messages.value.length === 1) {
      currentMessageId.value = randomId()
    }

    const allSessions = historyData.flatMap((item) => item.items)
    const currentSession = allSessions.find((item) => item.id === currentMessageId.value)

    const data = toRaw(messages.value)
    if (!currentSession) {
      const today = historyData.find((item) => item.group === '今天')
      if (today) {
        today.items.unshift({ title: messages.value[0].content, id: currentMessageId.value, data })
      } else {
        historyData.unshift({
          group: '今天',
          items: [{ title: messages.value[0].content, id: currentMessageId.value, data }],
        })
      }
    } else {
      currentSession.data = data
    }
  },
)

const handleHistorySelect = (item: { id: string; data: ChatMessage[] }) => {
  currentMessageId.value = item.id
  messages.value = item.data
  showHistory.value = false
}

// 指令列表
const suggestionItems = templateSuggestions
const categories = templateCategories

const senderRef = ref<InstanceType<typeof TrSender> | null>(null)
const currentTemplate = ref<string>('')
const suggestionOpen = ref(false)

// 设置指令
const handleFillTemplate = (templateText: string) => {
  setTimeout(() => {
    currentTemplate.value = templateText
    inputMessage.value = ''

    // 等待DOM更新后激活第一个字段
    setTimeout(() => {
      senderRef.value?.activateTemplateFirstField()
    }, 100)
  }, 300)
}

// 清除当前指令
const clearTemplate = () => {
  // 清空指令相关状态
  currentTemplate.value = ''

  // 确保重新聚焦到输入框
  nextTick(() => {
    senderRef.value?.focus()
  })
}

// 发送消息
const handleSendMessage = () => {
  sendMessage(inputMessage.value)

  clearTemplate()
}

const handleMessageKeydown = (
  event: KeyboardEvent,
  triggerFn: TriggerHandler,
  suggestionKeyDown: (event: KeyboardEvent) => void,
) => {
  // 如果指令面板已打开，交给 suggestion 组件处理键盘事件
  if (suggestionOpen.value) {
    suggestionKeyDown(event)
    return
  }

  // 如果按下斜杠键并且不在指令编辑模式，触发指令面板
  if (event.key === '/' && !currentTemplate.value) {
    triggerFn({
      text: '',
      position: 0,
    })
  }

  // ESC 键清除当前指令
  if (event.key === 'Escape' && currentTemplate.value) {
    event.preventDefault()
    clearTemplate()
  }
}

watch(
  () => inputMessage.value,
  (value) => {
    // 如果指令面板已打开，并且指令为空，关闭指令面板
    if (suggestionOpen.value && value === '') {
      suggestionOpen.value = false
    }
  },
)

// 页面加载完成后自动聚焦输入框
onMounted(() => {
  setTimeout(() => {
    senderRef.value?.focus()
  }, 500)
})
</script>

<style scoped lang="less">
.chat-input {
  margin-top: 8px;
  padding: 10px 15px;
}

.tiny-container {
  top: 64px;

  container-type: inline-size;

  :deep(.tr-welcome__title-wrapper) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.welcome-footer {
  margin-top: 12px;
  color: rgb(128, 128, 128);
  font-size: 12px;
  line-height: 20px;
}

.tiny-prompts {
  padding: 16px 24px;

  :deep(.prompt-item) {
    width: 100%;
    box-sizing: border-box;

    @container (width >=64rem) {
      width: calc(50% - 8px);
    }

    .tr-prompt__content-label {
      font-size: 14px;
      line-height: 24px;
    }
  }
}

.tr-history-demo {
  position: absolute;
  right: 100%;
  top: 100%;
  z-index: var(--tr-z-index-popover);
  width: 300px;
  height: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}
</style>

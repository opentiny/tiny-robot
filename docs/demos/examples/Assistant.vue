<template>
  <tr-container
    v-dropzone="{
      accept: 'image/jpeg, image/png',
      multiple: true,
      onDrop: handleFilesDropped,
      onError: handleFilesRejected,
      onDraggingChange: handleDraggingChange,
    }"
    v-model:fullscreen="fullscreen"
    v-model:show="show"
    class="tiny-container"
  >
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
    <div :class="{ 'max-container': fullscreen }" v-if="messages.length === 0">
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
    <tr-bubble-list
      :class="{ 'max-container': fullscreen }"
      v-else
      :items="messages"
      :roles="roles"
      auto-scroll
    ></tr-bubble-list>

    <template #footer>
      <div class="chat-input max-container">
        <div class="chat-input-pills">
          <tr-suggestion-popover
            style="--tr-suggestion-popover-width: 440px"
            :data="popoverData"
            @item-click="handlePopoverItemClick"
          >
            <template #trigger>
              <tr-suggestion-pill-button>
                <template #icon>
                  <IconSparkles style="font-size: 16px; color: #1476ff" />
                </template>
              </tr-suggestion-pill-button>
            </template>
          </tr-suggestion-popover>
          <tr-suggestion-pills class="pills">
            <tr-dropdown-menu
              v-for="(item, index) in pillItems"
              :items="item.menu.items"
              @item-click="item.menu.onItemClick"
              :key="index"
              trigger="click"
            >
              <template #trigger>
                <tr-suggestion-pill-button>{{ item.text }}</tr-suggestion-pill-button>
              </template>
            </tr-dropdown-menu>
          </tr-suggestion-pills>
        </div>
        <tr-sender
          ref="senderRef"
          mode="single"
          v-model="inputMessage"
          :class="{ 'tr-sender-compact': !fullscreen }"
          :placeholder="GeneratingStatus.includes(messageState.status) ? '正在思考中...' : '请输入您的问题'"
          :clearable="true"
          :loading="GeneratingStatus.includes(messageState.status)"
          :showWordLimit="true"
          :maxLength="1000"
          v-model:template-data="currentTemplate"
          @submit="handleSendMessage"
          @cancel="abortRequest"
          @reset-template="clearTemplate"
        ></tr-sender>
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

  <tr-drag-overlay
    :overlay-title="overlayTitle"
    :overlay-description="overlayDescription"
    :is-dragging="isDragging"
    :fullscreen="fullscreen"
    :drag-target="targetElement"
  />
</template>

<script setup lang="ts">
import type {
  BubbleRoleConfig,
  FileRejection,
  HistoryGroup,
  PromptProps,
  SuggestionGroup,
  SuggestionItem,
  UserItem,
} from '@opentiny/tiny-robot'
import {
  TrBubbleList,
  TrContainer,
  TrDragOverlay,
  TrDropdownMenu,
  TrHistory,
  TrIconButton,
  TrPrompts,
  TrSender,
  TrSuggestionPillButton,
  TrSuggestionPills,
  TrSuggestionPopover,
  TrWelcome,
  vDropzone,
} from '@opentiny/tiny-robot'
import { AIClient, ChatMessage, GeneratingStatus, useConversation } from '@opentiny/tiny-robot-kit'
import {
  IconAi,
  IconDislike,
  IconEdit,
  IconHistory,
  IconLike,
  IconNewSession,
  IconSparkles,
  IconUser,
} from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { type CSSProperties, h, markRaw, nextTick, onMounted, reactive, ref, toRaw, watch } from 'vue'

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
const templateSuggestions = [
  {
    id: 'write',
    text: '帮我写作',
    template: [
      { type: 'text', content: '帮我撰写' },
      { type: 'template', content: '文章类型' },
      { type: 'text', content: '字的' },
      { type: 'template', content: '主题' },
      { type: 'text', content: ', 语气类型是' },
      { type: 'template', content: '正式/轻松/专业' },
      { type: 'text', content: ', 具体内容是' },
      { type: 'template', content: '详细描述' },
    ],
  },
  {
    id: 'translate',
    text: '翻译',
    template: [
      { type: 'text', content: '请将以下' },
      { type: 'template', content: '中文/英文/法语/德语/日语' },
      { type: 'text', content: '内容翻译成' },
      { type: 'template', content: '目标语言' },
      { type: 'text', content: ':' },
      { type: 'template', content: '需要翻译的内容' },
    ],
  },
  {
    id: 'summarize',
    text: '内容总结',
    template: [
      { type: 'text', content: '请对以下内容进行' },
      { type: 'template', content: '简要/详细' },
      { type: 'text', content: '总结，约' },
      { type: 'template', content: '字数' },
      { type: 'text', content: '字:' },
      { type: 'template', content: '需要总结的内容' },
    ],
  },
  {
    id: 'code-review',
    text: '代码审查',
    template: [
      { type: 'text', content: '请帮我审查以下' },
      { type: 'template', content: 'JavaScript/TypeScript/Python/Java/C++/Go' },
      { type: 'text', content: '代码，关注' },
      { type: 'template', content: '性能/安全/可读性/最佳实践' },
      { type: 'text', content: '方面:' },
      { type: 'template', content: '代码内容' },
    ],
  },
  {
    id: 'email-compose',
    text: '写邮件',
    template: [
      { type: 'text', content: '请帮我起草一封' },
      { type: 'template', content: '正式/非正式' },
      { type: 'text', content: '邮件，发送给' },
      { type: 'template', content: '收件人角色' },
      { type: 'text', content: '，主题是' },
      { type: 'template', content: '邮件主题' },
      { type: 'text', content: '，内容是关于' },
      { type: 'template', content: '邮件内容' },
    ],
  },
  {
    id: 'data-analysis',
    text: '数据分析',
    template: [
      { type: 'text', content: '请分析以下' },
      { type: 'template', content: '销售/用户/流量/金融/健康' },
      { type: 'text', content: '数据，关注' },
      { type: 'template', content: '增长率/分布/趋势/异常/关联性' },
      { type: 'text', content: '指标，生成' },
      { type: 'template', content: '柱状图/折线图/饼图/散点图/热力图' },
      { type: 'text', content: '可视化:' },
      { type: 'template', content: '数据内容' },
    ],
  },
  {
    id: 'product-design',
    text: '产品设计',
    template: [
      { type: 'text', content: '请设计一个' },
      { type: 'template', content: '移动应用/网站/小程序/桌面软件/智能硬件' },
      { type: 'text', content: '的' },
      { type: 'template', content: '功能名称' },
      { type: 'text', content: '功能，目标用户是' },
      { type: 'template', content: '用户群体' },
      { type: 'text', content: '，核心价值是' },
      { type: 'template', content: '功能价值' },
    ],
  },
  {
    id: 'meeting-summary',
    text: '会议纪要',
    template: [
      { type: 'text', content: '请帮我整理一份会议纪要，会议主题是' },
      { type: 'template', content: '会议主题' },
      { type: 'text', content: '，参会人员有' },
      { type: 'template', content: '参会人员' },
      { type: 'text', content: '，会议要点包括' },
      { type: 'template', content: '会议要点' },
    ],
  },
  {
    id: 'interview-questions',
    text: '面试问题',
    template: [
      { type: 'text', content: '请为' },
      { type: 'template', content: '岗位名称' },
      { type: 'text', content: '岗位，针对' },
      { type: 'template', content: '技能领域' },
      { type: 'text', content: '方向，设计' },
      { type: 'template', content: '3/5/10' },
      { type: 'text', content: '个' },
      { type: 'template', content: '简单/中等/困难' },
      { type: 'text', content: '面试问题' },
    ],
  },
  {
    id: 'speech-draft',
    text: '演讲稿',
    template: [
      { type: 'text', content: '请帮我撰写一篇' },
      { type: 'template', content: '开场/主题/致谢/颁奖/毕业' },
      { type: 'text', content: '演讲稿，主题是' },
      { type: 'template', content: '演讲主题' },
      { type: 'text', content: '，时长约' },
      { type: 'template', content: '5/10/15/30' },
      { type: 'text', content: '分钟，受众是' },
      { type: 'template', content: '目标听众' },
    ],
  },
]

const dropdownMenuItems = ref([
  { id: '1', text: '去续费' },
  { id: '2', text: '去退订' },
  { id: '3', text: '查账单' },
  { id: '4', text: '导账单' },
  { id: '5', text: '对帐单' },
])

const popoverData = ref<SuggestionGroup[]>([
  {
    group: 'basic',
    label: '推荐',
    icon: IconLike,
    items: [
      { id: 'b1', text: '什么是弹性云服务器?' },
      { id: 'b2', text: '如何登录到Windows云服务器?' },
      { id: 'b3', text: '弹性公网IP为什么ping不通?' },
      { id: 'b4', text: '云服务器安全组如何配置?' },
      { id: 'b5', text: '如何查看云服务器密码?' },
      { id: 'b6', text: '什么是弹性云服务器?' },
      { id: 'b7', text: '如何登录到Windows云服务器?' },
      { id: 'b8', text: '弹性公网IP为什么ping不通?' },
      { id: 'b9', text: '云服务器安全组如何配置?' },
      { id: 'b0', text: '如何查看云服务器密码?' },
    ],
  },
  {
    group: 'purchase',
    label: '购买咨询',
    icon: IconDislike,
    items: [
      { id: 'p1', text: '如何购买弹性云服务器?' },
      { id: 'p2', text: '无法登录弹性云服务器怎么办?' },
      { id: 'p3', text: '云服务器价格怎么计算?' },
      { id: 'p4', text: '如何查看账单详情?' },
      { id: 'p5', text: '如何续费云服务器?' },
    ],
  },
  {
    group: 'usage',
    label: '使用咨询',
    icon: IconLike,
    items: [
      { id: 'u1', text: '云服务器使用限制与须知' },
      { id: 'u2', text: '使用RDP文件连接Windows实例' },
      { id: 'u3', text: '多用户登录（Windows2016）' },
      { id: 'u4', text: '如何重置云服务器密码?' },
      { id: 'u5', text: '云服务器如何安装软件?' },
    ],
  },
  { group: '4', label: '推荐', icon: IconLike, items: [] },
  { group: '5', label: '购买咨询', icon: IconLike, items: [] },
  { group: '6', label: '使用咨询', icon: IconLike, items: [] },
  { group: '7', label: '购买咨询', icon: IconLike, items: [] },
  { group: '8', label: '使用咨询', icon: IconLike, items: [] },
  { group: '9', label: '购买咨询', icon: IconLike, items: [] },
  { group: '10', label: '使用咨询', icon: IconLike, items: [] },
])

const handlePopoverItemClick = (item: SuggestionItem) => {
  sendMessage(item.text)
}

const pillItems = [
  {
    text: '费用成本',
    icon: markRaw(IconEdit),
    menu: {
      items: dropdownMenuItems.value,
      onItemClick: (item) => {
        sendMessage(item.text)
      },
    },
  },
  {
    text: '常用指令',
    icon: markRaw(IconEdit),
    menu: {
      items: templateSuggestions.slice(0, 3),
      onItemClick: (item) => {
        handleFillTemplate((item as unknown as { template: UserItem[] }).template)
      },
    },
  },
  {
    text: '工作助手',
    icon: markRaw(IconEdit),
    menu: {
      items: templateSuggestions.slice(3, 6),
      onItemClick: (item) => {
        handleFillTemplate((item as unknown as { template: UserItem[] }).template)
      },
    },
  },
  {
    text: '内容创作',
    icon: markRaw(IconEdit),
    menu: {
      items: templateSuggestions.slice(6),
      onItemClick: (item) => {
        handleFillTemplate((item as unknown as { template: UserItem[] }).template)
      },
    },
  },
]

const { messageManager, createConversation } = useConversation({
  client,
  events: {
    onReceiveData: (data, _messages, _preventDefault) => {
      // 执行 preventDefault 可以阻止默认写入消息列表的逻辑
      // preventDefault()
      console.log(data)
    },
  },
})

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
        today.items.unshift({ title: messages.value[0].content as string, id: currentMessageId.value, data })
      } else {
        historyData.unshift({
          group: '今天',
          items: [{ title: messages.value[0].content as string, id: currentMessageId.value, data }],
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

const senderRef = ref<InstanceType<typeof TrSender> | null>(null)
const currentTemplate = ref<UserItem[]>([])
const suggestionOpen = ref(false)

// 设置指令
const handleFillTemplate = (template: UserItem[]) => {
  currentTemplate.value = template
  inputMessage.value = ''

  nextTick(() => {
    senderRef.value?.activateTemplateFirstField()
  })
}

// 清除当前指令
const clearTemplate = () => {
  // 清空指令相关状态
  currentTemplate.value = []

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

watch(
  () => inputMessage.value,
  (value) => {
    // 如果指令面板已打开，并且指令为空，关闭指令面板
    if (suggestionOpen.value && value === '') {
      suggestionOpen.value = false
    }
  },
)

const overlayTitle = '将图片拖到此处完成上传'
const overlayDescription = ['总计最多上传3个图片（每个10MB以内）', '支持图片格式 JPG/JPEG/PNG']

const isDragging = ref(false)
const targetElement = ref<HTMLElement | null>(null)

const handleDraggingChange = (dragging: boolean, element: HTMLElement | null) => {
  isDragging.value = dragging
  targetElement.value = element
}

const handleFilesDropped = (files: File[]) => {
  console.log('上传的文件:', files)
}

const handleFilesRejected = (rejection: FileRejection) => {
  console.error('被拒绝的文件:', rejection)
}

// 页面加载完成后自动聚焦输入框
onMounted(() => {
  setTimeout(() => {
    senderRef.value?.focus()
  }, 500)
})
</script>

<style scoped lang="less">
@media (min-width: 1280px) {
  .max-container {
    width: 1280px;
    margin: 0 auto;
  }
}

.chat-input {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .chat-input-pills {
    display: flex;
    align-items: center;
    gap: 8px;

    .pills {
      flex: 1;
      :deep(.tr-suggestion-pills__container) {
        mask: linear-gradient(to right, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);
      }
    }
  }
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

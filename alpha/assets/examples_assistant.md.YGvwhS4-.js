const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Assistant.YHcbfUNP.js","assets/chunks/framework.CP_8zwxL.js","assets/chunks/theme.BF2rBBVC.js","assets/chunks/index.CJOyJALV.js"])))=>i.map(i=>d[i]);
import{r as a,s as B,A as l,_ as r,H as p,e as c,o as D,q as i,ah as m,J as t,g as d,ai as u,x as n,i as A,ak as g}from"./chunks/framework.CP_8zwxL.js";import{L as y,N as F}from"./chunks/index.glnvWzwV.js";const x=`<template>
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
    :style="containerStyles"
  >
    <template #operations>
      <tr-icon-button :icon="IconNewSession" size="28" svgSize="20" @click="createConversation()" />
      <span style="display: inline-flex; line-height: 0; position: relative">
        <tr-icon-button :icon="IconHistory" size="28" svgSize="20" @click="showHistory = true" />
        <div v-show="showHistory" class="tr-history-demo-container">
          <div><h3 style="margin: 0; padding: 0 12px">历史对话</h3></div>
          <tr-icon-button
            :icon="IconClose"
            size="28"
            svgSize="20"
            @click="showHistory = false"
            style="position: absolute; right: 14px; top: 14px"
          />
          <tr-history
            class="tr-history-demo"
            :selected="state.currentId ?? undefined"
            :search-bar="true"
            :data="state.conversations"
            @item-title-change="handleHistoryTitleChange"
            @item-click="handleHistorySelect"
            @item-action="handleHistoryAction"
          ></tr-history>
        </div>
      </span>
    </template>
    <div :class="{ 'max-container': fullscreen }" v-if="messages.length === 0">
      <tr-welcome title="TinyRobot" description="您好，我是TinyRobot，您专属的 AI 智能专家" :icon="welcomeIcon">
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
      <div class="chat-input" :class="{ 'max-container': fullscreen }">
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
  HistoryMenuItem,
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
import { AIClient, Conversation, GeneratingStatus, useConversation } from '@opentiny/tiny-robot-kit'
import {
  IconAi,
  IconClose,
  IconDislike,
  IconEdit,
  IconHistory,
  IconLike,
  IconNewSession,
  IconSparkles,
  IconUser,
} from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { type CSSProperties, h, markRaw, nextTick, onMounted, ref, watch } from 'vue'

const client = new AIClient({
  provider: 'openai',
  // apiKey: 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: window.parent?.location.origin || location.origin + import.meta.env.BASE_URL,
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

const { messageManager, state, createConversation, updateTitle, switchConversation, deleteConversation } =
  useConversation({
    client,
    events: {
      onReceiveData: (data, _messages, _preventDefault) => {
        // 执行 preventDefault 可以阻止默认写入消息列表的逻辑
        // preventDefault()
        console.log(data)
      },
      onLoaded: (conversations) => {
        console.log(conversations)
      },
    },
  })

const { messages, messageState, inputMessage, sendMessage: _sendMessage, abortRequest } = messageManager

const sendMessage = (...args: Parameters<typeof _sendMessage>) => {
  if (!state.currentId) {
    createConversation()
  }
  _sendMessage(...args)
}

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

const handleHistoryTitleChange = (newTitle: string, item: Conversation) => {
  updateTitle(item.id!, newTitle)
}

const handleHistorySelect = (item: Conversation) => {
  switchConversation(item.id)
  showHistory.value = false
}

const handleHistoryAction = (action: HistoryMenuItem, item: Conversation) => {
  if (action.id === 'delete') {
    deleteConversation(item.id)
  }
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

const containerStyles =
  window.self !== window.top
    ? {
        height: '100vh',
      }
    : {
        top: '112px',
        height: 'calc(100vh - 112px)',
      }
<\/script>

<style scoped>
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
  container-type: inline-size;

  :deep(.tr-welcome__title-wrapper) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.tiny-prompts {
  padding: 16px 24px;

  --tr-prompt-width: 100%;

  @container (width >=64rem) {
    --tr-prompt-width: calc(50% - 8px);
  }
}

.tr-history-demo-container {
  position: absolute;
  right: 100%;
  top: 100%;
  z-index: var(--tr-z-index-popover);
  width: 300px;
  height: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  background-color: var(--tr-container-bg-default);
  padding: 16px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .tr-history-demo {
    overflow-y: auto;
    flex: 1;

    --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
    --tr-history-item-selected-color: var(--tr-color-primary);
    --tr-history-item-space-y: 4px;
  }
}
</style>
`,w=JSON.parse('{"title":"综合示例","description":"","frontmatter":{},"headers":[],"relativePath":"examples/assistant.md","filePath":"examples/assistant.md"}'),v={name:"examples/assistant.md"},I=Object.assign(v,{setup(h){const E=a(!0),C=B();return l(async()=>{C.value=(await r(async()=>{const{default:o}=await import("./chunks/Assistant.YHcbfUNP.js");return{default:o}},__vite__mapDeps([0,1,2,3]))).default}),(o,e)=>{const s=p("ClientOnly");return D(),c("div",null,[e[1]||(e[1]=i("h1",{id:"综合示例",tabindex:"-1"},[d("综合示例 "),i("a",{class:"header-anchor",href:"#综合示例","aria-label":'Permalink to "综合示例"'},"​")],-1)),m(t(n(y),null,null,512),[[u,E.value]]),t(s,null,{default:A(()=>[t(n(F),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Assistant.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fexamples%2FAssistant.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-container%5Cn%20%20%20%20v-dropzone%3D%5C%22%7B%5Cn%20%20%20%20%20%20accept%3A%20'image%2Fjpeg%2C%20image%2Fpng'%2C%5Cn%20%20%20%20%20%20multiple%3A%20true%2C%5Cn%20%20%20%20%20%20onDrop%3A%20handleFilesDropped%2C%5Cn%20%20%20%20%20%20onError%3A%20handleFilesRejected%2C%5Cn%20%20%20%20%20%20onDraggingChange%3A%20handleDraggingChange%2C%5Cn%20%20%20%20%7D%5C%22%5Cn%20%20%20%20v-model%3Afullscreen%3D%5C%22fullscreen%5C%22%5Cn%20%20%20%20v-model%3Ashow%3D%5C%22show%5C%22%5Cn%20%20%20%20class%3D%5C%22tiny-container%5C%22%5Cn%20%20%20%20%3Astyle%3D%5C%22containerStyles%5C%22%5Cn%20%20%3E%5Cn%20%20%20%20%3Ctemplate%20%23operations%3E%5Cn%20%20%20%20%20%20%3Ctr-icon-button%20%3Aicon%3D%5C%22IconNewSession%5C%22%20size%3D%5C%2228%5C%22%20svgSize%3D%5C%2220%5C%22%20%40click%3D%5C%22createConversation()%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3Cspan%20style%3D%5C%22display%3A%20inline-flex%3B%20line-height%3A%200%3B%20position%3A%20relative%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-icon-button%20%3Aicon%3D%5C%22IconHistory%5C%22%20size%3D%5C%2228%5C%22%20svgSize%3D%5C%2220%5C%22%20%40click%3D%5C%22showHistory%20%3D%20true%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20v-show%3D%5C%22showHistory%5C%22%20class%3D%5C%22tr-history-demo-container%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%3E%3Ch3%20style%3D%5C%22margin%3A%200%3B%20padding%3A%200%2012px%5C%22%3E%E5%8E%86%E5%8F%B2%E5%AF%B9%E8%AF%9D%3C%2Fh3%3E%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-icon-button%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Aicon%3D%5C%22IconClose%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20size%3D%5C%2228%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20svgSize%3D%5C%2220%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22showHistory%20%3D%20false%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20style%3D%5C%22position%3A%20absolute%3B%20right%3A%2014px%3B%20top%3A%2014px%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-history%5Cn%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22tr-history-demo%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Aselected%3D%5C%22state.currentId%20%3F%3F%20undefined%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Asearch-bar%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Adata%3D%5C%22state.conversations%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-title-change%3D%5C%22handleHistoryTitleChange%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-click%3D%5C%22handleHistorySelect%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-action%3D%5C%22handleHistoryAction%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3E%3C%2Ftr-history%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fspan%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3Cdiv%20%3Aclass%3D%5C%22%7B%20'max-container'%3A%20fullscreen%20%7D%5C%22%20v-if%3D%5C%22messages.length%20%3D%3D%3D%200%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-welcome%20title%3D%5C%22TinyRobot%5C%22%20description%3D%5C%22%E6%82%A8%E5%A5%BD%EF%BC%8C%E6%88%91%E6%98%AFTinyRobot%EF%BC%8C%E6%82%A8%E4%B8%93%E5%B1%9E%E7%9A%84%20AI%20%E6%99%BA%E8%83%BD%E4%B8%93%E5%AE%B6%5C%22%20%3Aicon%3D%5C%22welcomeIcon%5C%22%3E%5Cn%20%20%20%20%20%20%3C%2Ftr-welcome%3E%5Cn%20%20%20%20%20%20%3Ctr-prompts%5Cn%20%20%20%20%20%20%20%20%3Aitems%3D%5C%22promptItems%5C%22%5Cn%20%20%20%20%20%20%20%20%3Awrap%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20item-class%3D%5C%22prompt-item%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22tiny-prompts%5C%22%5Cn%20%20%20%20%20%20%20%20%40item-click%3D%5C%22handlePromptItemClick%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftr-prompts%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%5Cn%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'max-container'%3A%20fullscreen%20%7D%5C%22%5Cn%20%20%20%20%20%20v-else%5Cn%20%20%20%20%20%20%3Aitems%3D%5C%22messages%5C%22%5Cn%20%20%20%20%20%20%3Aroles%3D%5C%22roles%5C%22%5Cn%20%20%20%20%20%20auto-scroll%5Cn%20%20%20%20%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3Ctemplate%20%23footer%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22chat-input%5C%22%20%3Aclass%3D%5C%22%7B%20'max-container'%3A%20fullscreen%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22chat-input-pills%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-popover%5Cn%20%20%20%20%20%20%20%20%20%20%20%20style%3D%5C%22--tr-suggestion-popover-width%3A%20440px%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Adata%3D%5C%22popoverData%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-click%3D%5C%22handlePopoverItemClick%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20%23trigger%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-pill-button%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20%23icon%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CIconSparkles%20style%3D%5C%22font-size%3A%2016px%3B%20color%3A%20%231476ff%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-suggestion-pill-button%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-suggestion-popover%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-pills%20class%3D%5C%22pills%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-dropdown-menu%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22(item%2C%20index)%20in%20pillItems%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aitems%3D%5C%22item.menu.items%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40item-click%3D%5C%22item.menu.onItemClick%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22index%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20trigger%3D%5C%22click%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20%23trigger%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-pill-button%3E%7B%7B%20item.text%20%7D%7D%3C%2Ftr-suggestion-pill-button%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-dropdown-menu%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-suggestion-pills%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20%20%20ref%3D%5C%22senderRef%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20mode%3D%5C%22single%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'tr-sender-compact'%3A%20!fullscreen%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aplaceholder%3D%5C%22GeneratingStatus.includes(messageState.status)%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aloading%3D%5C%22GeneratingStatus.includes(messageState.status)%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AshowWordLimit%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AmaxLength%3D%5C%221000%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20v-model%3Atemplate-data%3D%5C%22currentTemplate%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSendMessage%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40reset-template%3D%5C%22clearTemplate%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2Ftr-container%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%208px%5C%22%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Clabel%3Eshow%EF%BC%9A%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3Ctiny-switch%20v-model%3D%5C%22show%5C%22%3E%3C%2Ftiny-switch%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Clabel%3Efullscreen%EF%BC%9A%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3Ctiny-switch%20v-model%3D%5C%22fullscreen%5C%22%3E%3C%2Ftiny-switch%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%3Ctr-drag-overlay%5Cn%20%20%20%20%3Aoverlay-title%3D%5C%22overlayTitle%5C%22%5Cn%20%20%20%20%3Aoverlay-description%3D%5C%22overlayDescription%5C%22%5Cn%20%20%20%20%3Ais-dragging%3D%5C%22isDragging%5C%22%5Cn%20%20%20%20%3Afullscreen%3D%5C%22fullscreen%5C%22%5Cn%20%20%20%20%3Adrag-target%3D%5C%22targetElement%5C%22%5Cn%20%20%2F%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20type%20%7B%5Cn%20%20BubbleRoleConfig%2C%5Cn%20%20FileRejection%2C%5Cn%20%20HistoryMenuItem%2C%5Cn%20%20PromptProps%2C%5Cn%20%20SuggestionGroup%2C%5Cn%20%20SuggestionItem%2C%5Cn%20%20UserItem%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%5Cn%20%20TrBubbleList%2C%5Cn%20%20TrContainer%2C%5Cn%20%20TrDragOverlay%2C%5Cn%20%20TrDropdownMenu%2C%5Cn%20%20TrHistory%2C%5Cn%20%20TrIconButton%2C%5Cn%20%20TrPrompts%2C%5Cn%20%20TrSender%2C%5Cn%20%20TrSuggestionPillButton%2C%5Cn%20%20TrSuggestionPills%2C%5Cn%20%20TrSuggestionPopover%2C%5Cn%20%20TrWelcome%2C%5Cn%20%20vDropzone%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20AIClient%2C%20Conversation%2C%20GeneratingStatus%2C%20useConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%5Cn%20%20IconAi%2C%5Cn%20%20IconClose%2C%5Cn%20%20IconDislike%2C%5Cn%20%20IconEdit%2C%5Cn%20%20IconHistory%2C%5Cn%20%20IconLike%2C%5Cn%20%20IconNewSession%2C%5Cn%20%20IconSparkles%2C%5Cn%20%20IconUser%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySwitch%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20type%20CSSProperties%2C%20h%2C%20markRaw%2C%20nextTick%2C%20onMounted%2C%20ref%2C%20watch%20%7D%20from%20'vue'%5Cn%5Cnconst%20client%20%3D%20new%20AIClient(%7B%5Cn%20%20provider%3A%20'openai'%2C%5Cn%20%20%2F%2F%20apiKey%3A%20'your-api-key'%2C%5Cn%20%20defaultModel%3A%20'gpt-3.5-turbo'%2C%5Cn%20%20apiUrl%3A%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20'%2Ftiny-robot%2Falpha%2F'%2C%5Cn%7D)%5Cn%5Cnconst%20fullscreen%20%3D%20ref(false)%5Cnconst%20show%20%3D%20ref(true)%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20welcomeIcon%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'48px'%20%7D%20%7D)%5Cn%5Cnconst%20promptItems%3A%20PromptProps%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E6%97%A5%E5%B8%B8%E5%8A%A9%E7%90%86%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F'%2C%5Cn%20%20%20%20icon%3A%20h('span'%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'18px'%20%7D%20as%20CSSProperties%20%7D%2C%20'%F0%9F%A7%A0')%2C%5Cn%20%20%20%20badge%3A%20'NEW'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E5%AD%A6%E4%B9%A0%2F%E7%9F%A5%E8%AF%86%E5%9E%8B%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E6%9C%89%E4%BB%80%E4%B9%88%E6%83%B3%E4%BA%86%E8%A7%A3%E7%9A%84%E5%90%97%EF%BC%9F%E5%8F%AF%E4%BB%A5%E6%98%AF%E2%80%9CVue3%20%E5%92%8C%20React%20%E7%9A%84%E5%8C%BA%E5%88%AB%E2%80%9D%EF%BC%81'%2C%5Cn%20%20%20%20icon%3A%20h('span'%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'18px'%20%7D%20as%20CSSProperties%20%7D%2C%20'%F0%9F%A4%94')%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E5%88%9B%E6%84%8F%E7%94%9F%E6%88%90%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F'%2C%5Cn%20%20%20%20icon%3A%20h('span'%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'18px'%20%7D%20as%20CSSProperties%20%7D%2C%20'%E2%9C%A8')%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20%E6%8C%87%E4%BB%A4%E6%A8%A1%E6%9D%BF%E6%B5%8B%E8%AF%95%E6%95%B0%E6%8D%AE%5Cnconst%20templateSuggestions%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'write'%2C%5Cn%20%20%20%20text%3A%20'%E5%B8%AE%E6%88%91%E5%86%99%E4%BD%9C'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%B8%AE%E6%88%91%E6%92%B0%E5%86%99'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%96%87%E7%AB%A0%E7%B1%BB%E5%9E%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%AD%97%E7%9A%84'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%2C%20%E8%AF%AD%E6%B0%94%E7%B1%BB%E5%9E%8B%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%AD%A3%E5%BC%8F%2F%E8%BD%BB%E6%9D%BE%2F%E4%B8%93%E4%B8%9A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%2C%20%E5%85%B7%E4%BD%93%E5%86%85%E5%AE%B9%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E8%AF%A6%E7%BB%86%E6%8F%8F%E8%BF%B0'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'translate'%2C%5Cn%20%20%20%20text%3A%20'%E7%BF%BB%E8%AF%91'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B0%86%E4%BB%A5%E4%B8%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%B8%AD%E6%96%87%2F%E8%8B%B1%E6%96%87%2F%E6%B3%95%E8%AF%AD%2F%E5%BE%B7%E8%AF%AD%2F%E6%97%A5%E8%AF%AD'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%86%85%E5%AE%B9%E7%BF%BB%E8%AF%91%E6%88%90'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%9B%AE%E6%A0%87%E8%AF%AD%E8%A8%80'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%9C%80%E8%A6%81%E7%BF%BB%E8%AF%91%E7%9A%84%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'summarize'%2C%5Cn%20%20%20%20text%3A%20'%E5%86%85%E5%AE%B9%E6%80%BB%E7%BB%93'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%AF%B9%E4%BB%A5%E4%B8%8B%E5%86%85%E5%AE%B9%E8%BF%9B%E8%A1%8C'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%AE%80%E8%A6%81%2F%E8%AF%A6%E7%BB%86'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%80%BB%E7%BB%93%EF%BC%8C%E7%BA%A6'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%AD%97%E6%95%B0'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%AD%97%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%9C%80%E8%A6%81%E6%80%BB%E7%BB%93%E7%9A%84%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'code-review'%2C%5Cn%20%20%20%20text%3A%20'%E4%BB%A3%E7%A0%81%E5%AE%A1%E6%9F%A5'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E5%AE%A1%E6%9F%A5%E4%BB%A5%E4%B8%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'JavaScript%2FTypeScript%2FPython%2FJava%2FC%2B%2B%2FGo'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E4%BB%A3%E7%A0%81%EF%BC%8C%E5%85%B3%E6%B3%A8'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%80%A7%E8%83%BD%2F%E5%AE%89%E5%85%A8%2F%E5%8F%AF%E8%AF%BB%E6%80%A7%2F%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%96%B9%E9%9D%A2%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%BB%A3%E7%A0%81%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'email-compose'%2C%5Cn%20%20%20%20text%3A%20'%E5%86%99%E9%82%AE%E4%BB%B6'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%AD%A3%E5%BC%8F%2F%E9%9D%9E%E6%AD%A3%E5%BC%8F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E9%82%AE%E4%BB%B6%EF%BC%8C%E5%8F%91%E9%80%81%E7%BB%99'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%94%B6%E4%BB%B6%E4%BA%BA%E8%A7%92%E8%89%B2'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E4%B8%BB%E9%A2%98%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%82%AE%E4%BB%B6%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E5%86%85%E5%AE%B9%E6%98%AF%E5%85%B3%E4%BA%8E'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%82%AE%E4%BB%B6%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'data-analysis'%2C%5Cn%20%20%20%20text%3A%20'%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%88%86%E6%9E%90%E4%BB%A5%E4%B8%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%94%80%E5%94%AE%2F%E7%94%A8%E6%88%B7%2F%E6%B5%81%E9%87%8F%2F%E9%87%91%E8%9E%8D%2F%E5%81%A5%E5%BA%B7'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%95%B0%E6%8D%AE%EF%BC%8C%E5%85%B3%E6%B3%A8'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%A2%9E%E9%95%BF%E7%8E%87%2F%E5%88%86%E5%B8%83%2F%E8%B6%8B%E5%8A%BF%2F%E5%BC%82%E5%B8%B8%2F%E5%85%B3%E8%81%94%E6%80%A7'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%8C%87%E6%A0%87%EF%BC%8C%E7%94%9F%E6%88%90'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%9F%B1%E7%8A%B6%E5%9B%BE%2F%E6%8A%98%E7%BA%BF%E5%9B%BE%2F%E9%A5%BC%E5%9B%BE%2F%E6%95%A3%E7%82%B9%E5%9B%BE%2F%E7%83%AD%E5%8A%9B%E5%9B%BE'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%8F%AF%E8%A7%86%E5%8C%96%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%95%B0%E6%8D%AE%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'product-design'%2C%5Cn%20%20%20%20text%3A%20'%E4%BA%A7%E5%93%81%E8%AE%BE%E8%AE%A1'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E8%AE%BE%E8%AE%A1%E4%B8%80%E4%B8%AA'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%A7%BB%E5%8A%A8%E5%BA%94%E7%94%A8%2F%E7%BD%91%E7%AB%99%2F%E5%B0%8F%E7%A8%8B%E5%BA%8F%2F%E6%A1%8C%E9%9D%A2%E8%BD%AF%E4%BB%B6%2F%E6%99%BA%E8%83%BD%E7%A1%AC%E4%BB%B6'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E7%9A%84'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%8A%9F%E8%83%BD%E5%90%8D%E7%A7%B0'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%8A%9F%E8%83%BD%EF%BC%8C%E7%9B%AE%E6%A0%87%E7%94%A8%E6%88%B7%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%94%A8%E6%88%B7%E7%BE%A4%E4%BD%93'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E6%A0%B8%E5%BF%83%E4%BB%B7%E5%80%BC%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%8A%9F%E8%83%BD%E4%BB%B7%E5%80%BC'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'meeting-summary'%2C%5Cn%20%20%20%20text%3A%20'%E4%BC%9A%E8%AE%AE%E7%BA%AA%E8%A6%81'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E6%95%B4%E7%90%86%E4%B8%80%E4%BB%BD%E4%BC%9A%E8%AE%AE%E7%BA%AA%E8%A6%81%EF%BC%8C%E4%BC%9A%E8%AE%AE%E4%B8%BB%E9%A2%98%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%BC%9A%E8%AE%AE%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E5%8F%82%E4%BC%9A%E4%BA%BA%E5%91%98%E6%9C%89'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%8F%82%E4%BC%9A%E4%BA%BA%E5%91%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E4%BC%9A%E8%AE%AE%E8%A6%81%E7%82%B9%E5%8C%85%E6%8B%AC'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%BC%9A%E8%AE%AE%E8%A6%81%E7%82%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'interview-questions'%2C%5Cn%20%20%20%20text%3A%20'%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E4%B8%BA'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%B2%97%E4%BD%8D%E5%90%8D%E7%A7%B0'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%B2%97%E4%BD%8D%EF%BC%8C%E9%92%88%E5%AF%B9'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%8A%80%E8%83%BD%E9%A2%86%E5%9F%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%96%B9%E5%90%91%EF%BC%8C%E8%AE%BE%E8%AE%A1'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'3%2F5%2F10'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E4%B8%AA'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%AE%80%E5%8D%95%2F%E4%B8%AD%E7%AD%89%2F%E5%9B%B0%E9%9A%BE'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'speech-draft'%2C%5Cn%20%20%20%20text%3A%20'%E6%BC%94%E8%AE%B2%E7%A8%BF'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E6%92%B0%E5%86%99%E4%B8%80%E7%AF%87'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%BC%80%E5%9C%BA%2F%E4%B8%BB%E9%A2%98%2F%E8%87%B4%E8%B0%A2%2F%E9%A2%81%E5%A5%96%2F%E6%AF%95%E4%B8%9A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%BC%94%E8%AE%B2%E7%A8%BF%EF%BC%8C%E4%B8%BB%E9%A2%98%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%BC%94%E8%AE%B2%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E6%97%B6%E9%95%BF%E7%BA%A6'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'5%2F10%2F15%2F30'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%88%86%E9%92%9F%EF%BC%8C%E5%8F%97%E4%BC%97%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%9B%AE%E6%A0%87%E5%90%AC%E4%BC%97'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20dropdownMenuItems%20%3D%20ref(%5B%5Cn%20%20%7B%20id%3A%20'1'%2C%20text%3A%20'%E5%8E%BB%E7%BB%AD%E8%B4%B9'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'2'%2C%20text%3A%20'%E5%8E%BB%E9%80%80%E8%AE%A2'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'3'%2C%20text%3A%20'%E6%9F%A5%E8%B4%A6%E5%8D%95'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'4'%2C%20text%3A%20'%E5%AF%BC%E8%B4%A6%E5%8D%95'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'5'%2C%20text%3A%20'%E5%AF%B9%E5%B8%90%E5%8D%95'%20%7D%2C%5Cn%5D)%5Cn%5Cnconst%20popoverData%20%3D%20ref%3CSuggestionGroup%5B%5D%3E(%5B%5Cn%20%20%7B%5Cn%20%20%20%20group%3A%20'basic'%2C%5Cn%20%20%20%20label%3A%20'%E6%8E%A8%E8%8D%90'%2C%5Cn%20%20%20%20icon%3A%20IconLike%2C%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b1'%2C%20text%3A%20'%E4%BB%80%E4%B9%88%E6%98%AF%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b2'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E7%99%BB%E5%BD%95%E5%88%B0Windows%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b3'%2C%20text%3A%20'%E5%BC%B9%E6%80%A7%E5%85%AC%E7%BD%91IP%E4%B8%BA%E4%BB%80%E4%B9%88ping%E4%B8%8D%E9%80%9A%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b4'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AE%89%E5%85%A8%E7%BB%84%E5%A6%82%E4%BD%95%E9%85%8D%E7%BD%AE%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b5'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E6%9F%A5%E7%9C%8B%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AF%86%E7%A0%81%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b6'%2C%20text%3A%20'%E4%BB%80%E4%B9%88%E6%98%AF%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b7'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E7%99%BB%E5%BD%95%E5%88%B0Windows%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b8'%2C%20text%3A%20'%E5%BC%B9%E6%80%A7%E5%85%AC%E7%BD%91IP%E4%B8%BA%E4%BB%80%E4%B9%88ping%E4%B8%8D%E9%80%9A%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b9'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AE%89%E5%85%A8%E7%BB%84%E5%A6%82%E4%BD%95%E9%85%8D%E7%BD%AE%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b0'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E6%9F%A5%E7%9C%8B%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AF%86%E7%A0%81%3F'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20group%3A%20'purchase'%2C%5Cn%20%20%20%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%5Cn%20%20%20%20icon%3A%20IconDislike%2C%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p1'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E8%B4%AD%E4%B9%B0%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p2'%2C%20text%3A%20'%E6%97%A0%E6%B3%95%E7%99%BB%E5%BD%95%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%80%8E%E4%B9%88%E5%8A%9E%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p3'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%BB%B7%E6%A0%BC%E6%80%8E%E4%B9%88%E8%AE%A1%E7%AE%97%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p4'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E6%9F%A5%E7%9C%8B%E8%B4%A6%E5%8D%95%E8%AF%A6%E6%83%85%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p5'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E7%BB%AD%E8%B4%B9%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20group%3A%20'usage'%2C%5Cn%20%20%20%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%5Cn%20%20%20%20icon%3A%20IconLike%2C%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u1'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%BD%BF%E7%94%A8%E9%99%90%E5%88%B6%E4%B8%8E%E9%A1%BB%E7%9F%A5'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u2'%2C%20text%3A%20'%E4%BD%BF%E7%94%A8RDP%E6%96%87%E4%BB%B6%E8%BF%9E%E6%8E%A5Windows%E5%AE%9E%E4%BE%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u3'%2C%20text%3A%20'%E5%A4%9A%E7%94%A8%E6%88%B7%E7%99%BB%E5%BD%95%EF%BC%88Windows2016%EF%BC%89'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u4'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E9%87%8D%E7%BD%AE%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AF%86%E7%A0%81%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u5'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%A6%82%E4%BD%95%E5%AE%89%E8%A3%85%E8%BD%AF%E4%BB%B6%3F'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%20group%3A%20'4'%2C%20label%3A%20'%E6%8E%A8%E8%8D%90'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'5'%2C%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'6'%2C%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'7'%2C%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'8'%2C%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'9'%2C%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'10'%2C%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%5D)%5Cn%5Cnconst%20handlePopoverItemClick%20%3D%20(item%3A%20SuggestionItem)%20%3D%3E%20%7B%5Cn%20%20sendMessage(item.text)%5Cn%7D%5Cn%5Cnconst%20pillItems%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20text%3A%20'%E8%B4%B9%E7%94%A8%E6%88%90%E6%9C%AC'%2C%5Cn%20%20%20%20icon%3A%20markRaw(IconEdit)%2C%5Cn%20%20%20%20menu%3A%20%7B%5Cn%20%20%20%20%20%20items%3A%20dropdownMenuItems.value%2C%5Cn%20%20%20%20%20%20onItemClick%3A%20(item)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20sendMessage(item.text)%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20text%3A%20'%E5%B8%B8%E7%94%A8%E6%8C%87%E4%BB%A4'%2C%5Cn%20%20%20%20icon%3A%20markRaw(IconEdit)%2C%5Cn%20%20%20%20menu%3A%20%7B%5Cn%20%20%20%20%20%20items%3A%20templateSuggestions.slice(0%2C%203)%2C%5Cn%20%20%20%20%20%20onItemClick%3A%20(item)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20handleFillTemplate((item%20as%20unknown%20as%20%7B%20template%3A%20UserItem%5B%5D%20%7D).template)%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20text%3A%20'%E5%B7%A5%E4%BD%9C%E5%8A%A9%E6%89%8B'%2C%5Cn%20%20%20%20icon%3A%20markRaw(IconEdit)%2C%5Cn%20%20%20%20menu%3A%20%7B%5Cn%20%20%20%20%20%20items%3A%20templateSuggestions.slice(3%2C%206)%2C%5Cn%20%20%20%20%20%20onItemClick%3A%20(item)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20handleFillTemplate((item%20as%20unknown%20as%20%7B%20template%3A%20UserItem%5B%5D%20%7D).template)%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20text%3A%20'%E5%86%85%E5%AE%B9%E5%88%9B%E4%BD%9C'%2C%5Cn%20%20%20%20icon%3A%20markRaw(IconEdit)%2C%5Cn%20%20%20%20menu%3A%20%7B%5Cn%20%20%20%20%20%20items%3A%20templateSuggestions.slice(6)%2C%5Cn%20%20%20%20%20%20onItemClick%3A%20(item)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20handleFillTemplate((item%20as%20unknown%20as%20%7B%20template%3A%20UserItem%5B%5D%20%7D).template)%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20%7B%20messageManager%2C%20state%2C%20createConversation%2C%20updateTitle%2C%20switchConversation%2C%20deleteConversation%20%7D%20%3D%5Cn%20%20useConversation(%7B%5Cn%20%20%20%20client%2C%5Cn%20%20%20%20events%3A%20%7B%5Cn%20%20%20%20%20%20onReceiveData%3A%20(data%2C%20_messages%2C%20_preventDefault)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E6%89%A7%E8%A1%8C%20preventDefault%20%E5%8F%AF%E4%BB%A5%E9%98%BB%E6%AD%A2%E9%BB%98%E8%AE%A4%E5%86%99%E5%85%A5%E6%B6%88%E6%81%AF%E5%88%97%E8%A1%A8%E7%9A%84%E9%80%BB%E8%BE%91%5Cn%20%20%20%20%20%20%20%20%2F%2F%20preventDefault()%5Cn%20%20%20%20%20%20%20%20console.log(data)%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20onLoaded%3A%20(conversations)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20console.log(conversations)%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20messageState%2C%20inputMessage%2C%20sendMessage%3A%20_sendMessage%2C%20abortRequest%20%7D%20%3D%20messageManager%5Cn%5Cnconst%20sendMessage%20%3D%20(...args%3A%20Parameters%3Ctypeof%20_sendMessage%3E)%20%3D%3E%20%7B%5Cn%20%20if%20(!state.currentId)%20%7B%5Cn%20%20%20%20createConversation()%5Cn%20%20%7D%5Cn%20%20_sendMessage(...args)%5Cn%7D%5Cn%5Cnconst%20handlePromptItemClick%20%3D%20(ev%3A%20unknown%2C%20item%3A%20%7B%20description%3F%3A%20string%20%7D)%20%3D%3E%20%7B%5Cn%20%20sendMessage(item.description)%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20showHistory%20%3D%20ref(false)%5Cn%5Cnconst%20handleHistoryTitleChange%20%3D%20(newTitle%3A%20string%2C%20item%3A%20Conversation)%20%3D%3E%20%7B%5Cn%20%20updateTitle(item.id!%2C%20newTitle)%5Cn%7D%5Cn%5Cnconst%20handleHistorySelect%20%3D%20(item%3A%20Conversation)%20%3D%3E%20%7B%5Cn%20%20switchConversation(item.id)%5Cn%20%20showHistory.value%20%3D%20false%5Cn%7D%5Cn%5Cnconst%20handleHistoryAction%20%3D%20(action%3A%20HistoryMenuItem%2C%20item%3A%20Conversation)%20%3D%3E%20%7B%5Cn%20%20if%20(action.id%20%3D%3D%3D%20'delete')%20%7B%5Cn%20%20%20%20deleteConversation(item.id)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20senderRef%20%3D%20ref%3CInstanceType%3Ctypeof%20TrSender%3E%20%7C%20null%3E(null)%5Cnconst%20currentTemplate%20%3D%20ref%3CUserItem%5B%5D%3E(%5B%5D)%5Cnconst%20suggestionOpen%20%3D%20ref(false)%5Cn%5Cn%2F%2F%20%E8%AE%BE%E7%BD%AE%E6%8C%87%E4%BB%A4%5Cnconst%20handleFillTemplate%20%3D%20(template%3A%20UserItem%5B%5D)%20%3D%3E%20%7B%5Cn%20%20currentTemplate.value%20%3D%20template%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%5Cn%20%20nextTick(()%20%3D%3E%20%7B%5Cn%20%20%20%20senderRef.value%3F.activateTemplateFirstField()%5Cn%20%20%7D)%5Cn%7D%5Cn%5Cn%2F%2F%20%E6%B8%85%E9%99%A4%E5%BD%93%E5%89%8D%E6%8C%87%E4%BB%A4%5Cnconst%20clearTemplate%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%2F%2F%20%E6%B8%85%E7%A9%BA%E6%8C%87%E4%BB%A4%E7%9B%B8%E5%85%B3%E7%8A%B6%E6%80%81%5Cn%20%20currentTemplate.value%20%3D%20%5B%5D%5Cn%5Cn%20%20%2F%2F%20%E7%A1%AE%E4%BF%9D%E9%87%8D%E6%96%B0%E8%81%9A%E7%84%A6%E5%88%B0%E8%BE%93%E5%85%A5%E6%A1%86%5Cn%20%20nextTick(()%20%3D%3E%20%7B%5Cn%20%20%20%20senderRef.value%3F.focus()%5Cn%20%20%7D)%5Cn%7D%5Cn%5Cn%2F%2F%20%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%5Cnconst%20handleSendMessage%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20sendMessage(inputMessage.value)%5Cn%5Cn%20%20clearTemplate()%5Cn%7D%5Cn%5Cnwatch(%5Cn%20%20()%20%3D%3E%20inputMessage.value%2C%5Cn%20%20(value)%20%3D%3E%20%7B%5Cn%20%20%20%20%2F%2F%20%E5%A6%82%E6%9E%9C%E6%8C%87%E4%BB%A4%E9%9D%A2%E6%9D%BF%E5%B7%B2%E6%89%93%E5%BC%80%EF%BC%8C%E5%B9%B6%E4%B8%94%E6%8C%87%E4%BB%A4%E4%B8%BA%E7%A9%BA%EF%BC%8C%E5%85%B3%E9%97%AD%E6%8C%87%E4%BB%A4%E9%9D%A2%E6%9D%BF%5Cn%20%20%20%20if%20(suggestionOpen.value%20%26%26%20value%20%3D%3D%3D%20'')%20%7B%5Cn%20%20%20%20%20%20suggestionOpen.value%20%3D%20false%5Cn%20%20%20%20%7D%5Cn%20%20%7D%2C%5Cn)%5Cn%5Cnconst%20overlayTitle%20%3D%20'%E5%B0%86%E5%9B%BE%E7%89%87%E6%8B%96%E5%88%B0%E6%AD%A4%E5%A4%84%E5%AE%8C%E6%88%90%E4%B8%8A%E4%BC%A0'%5Cnconst%20overlayDescription%20%3D%20%5B'%E6%80%BB%E8%AE%A1%E6%9C%80%E5%A4%9A%E4%B8%8A%E4%BC%A03%E4%B8%AA%E5%9B%BE%E7%89%87%EF%BC%88%E6%AF%8F%E4%B8%AA10MB%E4%BB%A5%E5%86%85%EF%BC%89'%2C%20'%E6%94%AF%E6%8C%81%E5%9B%BE%E7%89%87%E6%A0%BC%E5%BC%8F%20JPG%2FJPEG%2FPNG'%5D%5Cn%5Cnconst%20isDragging%20%3D%20ref(false)%5Cnconst%20targetElement%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cn%5Cnconst%20handleDraggingChange%20%3D%20(dragging%3A%20boolean%2C%20element%3A%20HTMLElement%20%7C%20null)%20%3D%3E%20%7B%5Cn%20%20isDragging.value%20%3D%20dragging%5Cn%20%20targetElement.value%20%3D%20element%5Cn%7D%5Cn%5Cnconst%20handleFilesDropped%20%3D%20(files%3A%20File%5B%5D)%20%3D%3E%20%7B%5Cn%20%20console.log('%E4%B8%8A%E4%BC%A0%E7%9A%84%E6%96%87%E4%BB%B6%3A'%2C%20files)%5Cn%7D%5Cn%5Cnconst%20handleFilesRejected%20%3D%20(rejection%3A%20FileRejection)%20%3D%3E%20%7B%5Cn%20%20console.error('%E8%A2%AB%E6%8B%92%E7%BB%9D%E7%9A%84%E6%96%87%E4%BB%B6%3A'%2C%20rejection)%5Cn%7D%5Cn%5Cn%2F%2F%20%E9%A1%B5%E9%9D%A2%E5%8A%A0%E8%BD%BD%E5%AE%8C%E6%88%90%E5%90%8E%E8%87%AA%E5%8A%A8%E8%81%9A%E7%84%A6%E8%BE%93%E5%85%A5%E6%A1%86%5CnonMounted(()%20%3D%3E%20%7B%5Cn%20%20setTimeout(()%20%3D%3E%20%7B%5Cn%20%20%20%20senderRef.value%3F.focus()%5Cn%20%20%7D%2C%20500)%5Cn%7D)%5Cn%5Cnconst%20containerStyles%20%3D%5Cn%20%20window.self%20!%3D%3D%20window.top%5Cn%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20height%3A%20'100vh'%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%3A%20%7B%5Cn%20%20%20%20%20%20%20%20top%3A%20'112px'%2C%5Cn%20%20%20%20%20%20%20%20height%3A%20'calc(100vh%20-%20112px)'%2C%5Cn%20%20%20%20%20%20%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn%40media%20(min-width%3A%201280px)%20%7B%5Cn%20%20.max-container%20%7B%5Cn%20%20%20%20width%3A%201280px%3B%5Cn%20%20%20%20margin%3A%200%20auto%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn.chat-input%20%7B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%5Cn%20%20.chat-input-pills%20%7B%5Cn%20%20%20%20display%3A%20flex%3B%5Cn%20%20%20%20align-items%3A%20center%3B%5Cn%20%20%20%20gap%3A%208px%3B%5Cn%5Cn%20%20%20%20.pills%20%7B%5Cn%20%20%20%20%20%20flex%3A%201%3B%5Cn%20%20%20%20%20%20%3Adeep(.tr-suggestion-pills__container)%20%7B%5Cn%20%20%20%20%20%20%20%20mask%3A%20linear-gradient(to%20right%2C%20rgba(0%2C%200%2C%200%2C%201)%2080%25%2C%20rgba(0%2C%200%2C%200%2C%200)%20100%25)%3B%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn.tiny-container%20%7B%5Cn%20%20container-type%3A%20inline-size%3B%5Cn%5Cn%20%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20%20%20display%3A%20flex%3B%5Cn%20%20%20%20align-items%3A%20center%3B%5Cn%20%20%20%20justify-content%3A%20center%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn.tiny-prompts%20%7B%5Cn%20%20padding%3A%2016px%2024px%3B%5Cn%5Cn%20%20--tr-prompt-width%3A%20100%25%3B%5Cn%5Cn%20%20%40container%20(width%20%3E%3D64rem)%20%7B%5Cn%20%20%20%20--tr-prompt-width%3A%20calc(50%25%20-%208px)%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn.tr-history-demo-container%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20right%3A%20100%25%3B%5Cn%20%20top%3A%20100%25%3B%5Cn%20%20z-index%3A%20var(--tr-z-index-popover)%3B%5Cn%20%20width%3A%20300px%3B%5Cn%20%20height%3A%20600px%3B%5Cn%20%20box-shadow%3A%200%204px%2020px%20rgba(0%2C%200%2C%200%2C%200.04)%3B%5Cn%20%20background-color%3A%20var(--tr-container-bg-default)%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20border-radius%3A%2016px%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%5Cn%20%20.tr-history-demo%20%7B%5Cn%20%20%20%20overflow-y%3A%20auto%3B%5Cn%20%20%20%20flex%3A%201%3B%5Cn%5Cn%20%20%20%20--tr-history-item-selected-bg%3A%20var(--tr-history-item-hover-bg)%3B%5Cn%20%20%20%20--tr-history-item-selected-color%3A%20var(--tr-color-primary)%3B%5Cn%20%20%20%20--tr-history-item-space-y%3A%204px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{E.value=!1}),vueCode:n(x)},g({_:2},[C.value?{name:"vue",fn:A(()=>[t(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1})])}}});export{w as __pageData,I as default};

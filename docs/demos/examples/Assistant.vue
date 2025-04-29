<template>
  <tr-container v-model:fullscreen="fullscreen" v-model:show="show" class="tiny-container">
    <template #operations>
      <button class="icon-btn" @click="createConversation()">
        <icon-new-session />
      </button>
      <span style="display: inline-flex; line-height: 0; position: relative">
        <button class="icon-btn" @click="showHistory = true">
          <icon-history />
        </button>
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
    <template v-if="messages.length === 0">
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
    </template>
    <tr-bubble-list v-else :items="messages" :roles="roles"></tr-bubble-list>

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
              mode="multiple"
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
// import { TrContainer, TrWelcome, TrPrompts, TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import {
  type SuggestionItem,
  type BubbleRoleConfig,
  type PromptProps,
  type TriggerHandler,
  type TrSender,
} from '@opentiny/tiny-robot'
import { AIClient, ChatMessage, GeneratingStatus, useConversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconHistory, IconNewSession, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, nextTick, reactive, ref, toRaw, watch, type CSSProperties, onMounted } from 'vue'
import { templateSuggestions, templateCategories } from './templateData'

const client = new AIClient({
  provider: 'openai',
  // apiKey: 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: location.origin + '/cdocs/tiny-robot/',
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

watch(
  () => messages.value[messages.value.length - 1]?.content,
  () => {
    if (GeneratingStatus.includes(messageState.status)) {
      nextTick(() => {
        scrollToBottom()
      })
    }
  },
)

const showHistory = ref(false)

const historyData = reactive<
  {
    date: string
    items: {
      title: string
      id: string
      data: ChatMessage[]
    }[]
  }[]
>([])

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
      const today = historyData.find((item) => item.date === '今天')
      if (today) {
        today.items.unshift({ title: messages.value[0].content, id: currentMessageId.value, data })
      } else {
        historyData.unshift({
          date: '今天',
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

const chatContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }

  const containerBody = document.querySelector('div.tr-container__body')
  if (containerBody) {
    containerBody.scrollTo({
      top: containerBody.scrollHeight,
      behavior: 'smooth',
    })
  }
}

// 指令列表
const suggestionItems = templateSuggestions
const categories = templateCategories

const senderRef = ref<InstanceType<typeof TrSender> | null>(null)
const currentTemplate = ref<string>('')
const currentTemplateName = ref<string>('')
const suggestionOpen = ref(false)

// 设置指令
const handleFillTemplate = (templateText: string, item: SuggestionItem) => {
  setTimeout(() => {
    currentTemplate.value = templateText
    currentTemplateName.value = item?.text
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
  currentTemplateName.value = ''

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

  :deep(button.icon-btn) {
    background-color: rgba(0, 0, 0, 0);
  }

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

button.icon-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.3s;
  background-color: rgba(0, 0, 0, 0);

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.15);
  }

  svg {
    font-size: 20px;
  }
}

.tr-history-demo {
  position: absolute;
  right: 100%;
  top: 100%;
  z-index: 100;
  width: 300px;
  height: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}
</style>

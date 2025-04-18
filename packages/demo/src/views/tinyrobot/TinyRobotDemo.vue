<template>
  <tiny-container :show="true" v-model:fullscreen="fullscreen" class="tiny-container">
    <template #operations>
      <button class="icon-btn" @click="handleNewSession"><IconNewSession /></button>
    </template>
    <template v-if="messages.length === 0">
      <tiny-welcome title="盘古助手" description="您好，我是盘古助手，您专属的华为云专家" :icon="welcomeIcon">
        <template #footer>
          <div class="welcome-footer">
            <span>根据相关法律法规要求，您需要先 <a>登录</a>，若没有帐号，您可前往 <a>注册</a></span>
          </div>
        </template>
      </tiny-welcome>
      <tiny-prompts
        :items="promptItems"
        :wrap="true"
        item-class="prompt-item"
        class="tiny-prompts"
        @item-click="handlePomptItemClick"
      ></tiny-prompts>
    </template>
    <tiny-bubble-list v-else :items="bubbleItems" :roles="roles"></tiny-bubble-list>

    <template #footer>
      <TinySender
        class="chat-input"
        v-model="inputMessage"
        :placeholder="messageState.status === STATUS.PROCESSING ? '正在思考中...' : '请输入您的问题'"
        :clearable="true"
        :loading="GeneratingStatus.includes(messageState.status)"
        @submit="sendMessage"
        @cancel="abortRequest"
      ></TinySender>
    </template>
  </tiny-container>
  <div v-show="false" class="chat-container">
    <div class="chat-header">
      <h1>AI 助手</h1>
      <div class="stream-toggle">
        <span>流式响应</span>
        <tiny-switch v-model="useStream"></tiny-switch>
        <icon-full-screen class="full-screen-icon"></icon-full-screen>
      </div>
    </div>

    <!-- 需要替换为 TinyRobot Bubble组件-->
    <div class="chat-messages" ref="chatContainer">
      <tiny-bubble
        v-for="(message, index) in messages"
        :key="index"
        :placement="message.role === 'user' ? 'end' : 'start'"
        :avatar="message.role === 'user' ? userAvatar : aiAvatar"
        :content="message.content"
        :actions="
          message.role === 'user'
            ? []
            : [
                {
                  name: 'refresh',
                  show: () => index !== messages.length - 1 || !GeneratingStatus.includes(messageState.status),
                },
                {
                  name: 'copy',
                  show: () => index !== messages.length - 1 || !GeneratingStatus.includes(messageState.status),
                },
              ]
        "
        @refresh="onRefresh(index)"
      ></tiny-bubble>

      <tiny-bubble
        v-if="messageState.status === STATUS.PROCESSING"
        placement="start"
        :avatar="aiAvatar"
        :loading="true"
      ></tiny-bubble>
    </div>

    <!-- 需要替换为 TinyRobot InputBox组件-->
    <TinySender
      class="chat-input"
      v-model="inputMessage"
      :placeholder="messageState.status === STATUS.PROCESSING ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="GeneratingStatus.includes(messageState.status)"
      @submit="sendMessage"
      @cancel="abortRequest"
    ></TinySender>
  </div>
</template>

<script setup lang="ts">
import {
  Bubble as TinyBubble,
  BubbleList as TinyBubbleList,
  Container as TinyContainer,
  Prompts as TinyPrompts,
  Sender as TinySender,
  Welcome as TinyWelcome,
  type BubbleProps,
  type BubbleRoleConfig,
  type PromptProps,
} from '@opentiny/tiny-robot'
import { AIClient, GeneratingStatus, STATUS, useMessage } from '@opentiny/tiny-robot-ai-adapter'
import { IconAi, IconFullScreen, IconNewSession, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { computed, h, nextTick, ref, watch, type CSSProperties } from 'vue'

const client = new AIClient({
  provider: 'openai',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: 'http://localhost:3001/v1',
})

const fullscreen = ref(true)

const aiAvatar = h(IconAi, { style: { width: '32px', height: '32px' } })
const userAvatar = h(IconUser, { style: { width: '32px', height: '32px' } })
const welcomeIcon = h(IconAi, { style: { width: '64px', height: '64px' } })

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

const { messages, messageState, inputMessage, useStream, sendMessage, abortRequest, retryRequest } = useMessage({
  client,
  useStreamByDefault: true,
  initialMessages: [
    // {
    //   content: '你好！我是AI助手，有什么可以帮助你的吗？',
    //   role: 'assistant',
    // },
  ],
})

const onRefresh = (index: number) => {
  retryRequest(index)
}

const bubbleItems = computed(() => {
  const items = messages.value.map((item, index) => {
    return {
      id: index,
      ...item,
    } as BubbleProps
  })

  if (messageState.status === STATUS.PROCESSING) {
    return items.concat({
      role: 'assistant',
      loading: true,
    })
  }

  return items
})

const handlePomptItemClick = (ev: unknown, item: { description?: string }) => {
  console.log(ev)
  if (item.description) {
    inputMessage.value = item.description
  }
  sendMessage()
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
    actions: [
      {
        name: 'refresh',
        show: (bubbleProps) => {
          console.log(bubbleProps)
          return bubbleProps.id !== messages.value.length - 1 || !GeneratingStatus.includes(messageState.status)
        },
      },
      {
        name: 'copy',
        show: (bubbleProps) =>
          bubbleProps.id !== messages.value.length - 1 || !GeneratingStatus.includes(messageState.status),
      },
    ],
    maxWidth: '80%',
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    maxWidth: '80%',
  },
}

const handleNewSession = () => {
  messages.value = []
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
</script>

<style scoped lang="less">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 900px;
  margin: 0 auto;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  background-color: #6daec2;
  color: white;
  padding: 15px 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .stream-toggle {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    span {
      margin-right: 8px;
    }
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-input {
  display: flex;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

textarea {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 12px 16px;
  resize: none;
  height: 50px;
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #4a6cf7;
  }
}

button {
  margin-left: 10px;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0 20px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3a5ce5;
  }

  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
}

.abort-button {
  background-color: #e74c3c;

  &:hover {
    background-color: #c0392b;
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;

  span {
    height: 8px;
    width: 8px;
    margin: 0 2px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
.full-screen-icon {
  width: 20px;
  height: 20px;
}

.tiny-container {
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

    @container (width >= 64rem) {
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
    width: 20px;
    height: 20px;
  }
}
</style>

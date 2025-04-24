<template>
  <tr-container v-model:fullscreen="fullscreen" v-model:show="show" class="tiny-container">
    <template #operations>
      <button class="icon-btn" @click="handleNewSession">
        <icon-new-session />
      </button>
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
        @item-click="handlePomptItemClick"
      ></tr-prompts>
    </template>
    <tr-bubble-list v-else :items="messages" :roles="roles"></tr-bubble-list>

    <template #footer>
      <tr-sender
        class="chat-input"
        v-model="inputMessage"
        :placeholder="messageState.status === STATUS.PROCESSING ? '正在思考中...' : '请输入您的问题'"
        :clearable="true"
        :loading="GeneratingStatus.includes(messageState.status)"
        @submit="sendMessage"
        @cancel="abortRequest"
      ></tr-sender>
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
import { type BubbleRoleConfig, type PromptProps } from '@opentiny/tiny-robot'
import { AIClient, GeneratingStatus, STATUS, useMessage } from '@opentiny/tiny-robot-ai-adapter'
import { IconAi, IconNewSession, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, nextTick, ref, watch, type CSSProperties } from 'vue'

const client = new AIClient({
  provider: 'openai',
  // apiKey: 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: location.origin + '/cdocs/tiny-robot/',
})

const fullscreen = ref(false)
const show = ref(true)

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

const { messages, messageState, inputMessage, sendMessage, abortRequest } = useMessage({
  client,
  useStreamByDefault: true,
  initialMessages: [],
})

const handlePomptItemClick = (ev: unknown, item: { description?: string }) => {
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
.chat-input {
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
    width: 20px;
    height: 20px;
  }
}
</style>

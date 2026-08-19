<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'
import {
  IconAi,
  IconBrowser,
  IconHistory,
  IconInfo,
  IconNewSession,
  IconRefresh,
  IconWarning,
} from '@opentiny/tiny-robot-svgs'
import { computed, h, markRaw, shallowRef } from 'vue'
import { useChatCaseRuntime } from '../../shared/runtime/createChatRuntime'
import { workHelperModelProviders } from './config'

const cards = [
  { id: 'trouble', title: '故障处理', prompt: '弹性公网IP不通怎么办?', tone: 'warning', icon: markRaw(IconWarning) },
  { id: 'concept', title: '概念解释', prompt: '什么是Flexus云服务?', tone: 'green', icon: markRaw(IconInfo) },
  { id: 'usage', title: '使用咨询', prompt: '我有多少个资源?', tone: 'cyan', icon: markRaw(IconBrowser) },
  { id: 'purchase', title: '购买咨询', prompt: '如何购买弹性云服务器?', tone: 'blue', icon: markRaw(IconBrowser) },
  { id: 'account', title: '账号咨询', prompt: '如何修改华为云账号信息?', tone: 'cyan', icon: markRaw(IconInfo) },
  { id: 'service', title: '服务咨询', prompt: '有哪些热门服务?', tone: 'green', icon: markRaw(IconBrowser) },
  { id: 'security', title: '安全咨询', prompt: '如何保障云资源安全?', tone: 'warning', icon: markRaw(IconWarning) },
  { id: 'billing', title: '费用咨询', prompt: '如何查看云服务账单?', tone: 'blue', icon: markRaw(IconInfo) },
  { id: 'resource', title: '资源管理', prompt: '如何批量管理云资源?', tone: 'cyan', icon: markRaw(IconBrowser) },
  { id: 'network', title: '网络咨询', prompt: '如何配置云服务器网络?', tone: 'green', icon: markRaw(IconBrowser) },
  { id: 'permission', title: '权限咨询', prompt: '如何设置账号访问权限?', tone: 'blue', icon: markRaw(IconInfo) },
  { id: 'backup', title: '数据咨询', prompt: '如何备份云上的数据?', tone: 'warning', icon: markRaw(IconWarning) },
] as const

const promptBatchSize = 6
const batchIndex = shallowRef(0)
const isFullscreen = shallowRef(false)

const runtime = useChatCaseRuntime({
  storageKey: 'tiny-robot-work-helper-conversations',
  modelProviders: workHelperModelProviders,
  mcpServers: [],
})

const visibleCards = computed(() => {
  const start = batchIndex.value * promptBatchSize
  return cards.slice(start, start + promptBatchSize)
})

const chatUi = computed(() => ({
  brand: {
    name: '作业助手',
    logo: IconAi,
  },
  labels: {
    composerPlaceholder: '请输入您的问题，或告诉我您想完成什么，也可以通过@唤起专有技能',
    composerLoadingPlaceholder: '作业助手正在思考...',
    selectModel: '选择模型',
    thinkingFeature: '深度思考',
  },
  layout: {
    composer: {
      welcome: 'footer' as const,
    },
    contentMaxWidth: 860,
    panelPadding: 0,
    panelGap: 0,
    leftAside: {
      mode: 'drawer' as const,
      width: 300,
      collapsedWidth: 0,
      defaultOpen: false,
    },
    rightAside: false as const,
  },
  welcome: {
    title: '作业助手',
    description: '懂您所需，作业助手时刻相伴',
    align: 'center' as const,
    icon: h(IconAi, { size: 42 }) as never,
  },
  prompts: {
    wrap: true,
    itemClass: 'worker-helper-prompt',
    items: visibleCards.value.map((card) => ({
      id: card.id,
      label: card.title,
      description: card.prompt,
      size: 'small' as const,
      icon: h('span', { class: ['prompt-card-icon', `prompt-card-icon--${card.tone}`] }, [
        h(card.icon, { size: 18 }),
      ]) as never,
    })),
  },
  mcp: false as const,
  sender: {
    mode: 'multiple' as const,
    clearable: true,
    maxLength: 2000,
    showWordLimit: true,
  },
}))

function shuffleCards() {
  batchIndex.value = (batchIndex.value + 1) % Math.ceil(cards.length / promptBatchSize)
}

function handlePromptClick(payload: { item: { label: string; description?: string } }) {
  void runtime.actions.send({ text: payload.item.description ?? payload.item.label })
}
</script>

<template>
  <div class="work-helper" :class="{ 'work-helper--fullscreen': isFullscreen }">
    <TrChat class="work-helper__chat" :runtime="runtime" :ui="chatUi" @prompt-click="handlePromptClick">
      <template #layout-header="{ title, isEmpty, openLeftAside }">
        <div class="work-helper__topbar">
          <button class="topbar-button" type="button" title="历史会话" aria-label="历史会话" @click="openLeftAside">
            <IconHistory :size="20" />
          </button>
          <div class="topbar-actions">
            <button
              class="topbar-button"
              type="button"
              title="新会话"
              aria-label="新会话"
              @click="runtime.actions.createConversation()"
            >
              <IconNewSession :size="20" />
            </button>
          </div>
        </div>
        <div v-if="!isEmpty" class="work-helper__conversation-title">{{ title }}</div>
      </template>

      <template #prompts-footer>
        <div class="prompts-footer">
          <button class="shuffle-button" type="button" @click="shuffleCards">
            <IconRefresh :size="16" />
            换一批
          </button>
        </div>
      </template>

      <template #sender-footer-right>
        <span class="work-helper__disclaimer">内容由AI生成，仅供参考 <a href="#service-notice">服务声明</a></span>
      </template>
    </TrChat>
  </div>
</template>

<style scoped>
.work-helper {
  --work-helper-bg: #f7f7f9;
  min-height: 100vh;
  overflow: hidden;
  color: #1f1f23;
  background: var(--work-helper-bg);
}

.work-helper--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 20;
}

.work-helper :deep(.tr-chat-ui) {
  min-height: 100vh;
}

.work-helper :deep(.tr-chat-ui) {
  --tr-chat-ui-header-bg: #f7f7f9;
  --tr-chat-ui-main-bg: #f7f7f9;
  --tr-chat-ui-footer-bg: #f7f7f9;
  --tr-chat-ui-left-aside-bg: #ffffff;
}

.work-helper :deep(.chat-panel-content--header) {
  height: 52px;
  max-width: none;
  padding: 0;
}

.work-helper :deep(.chat-panel-content--main) {
  min-height: 0;
}

.work-helper :deep(.chat-panel-content--footer) {
  max-width: 860px;
  padding: 0 36px 26px;
}

.work-helper :deep(.tr-sender) {
  border-radius: 24px;
  box-shadow: 0 8px 22px rgba(40, 42, 51, 0.08);
}

.work-helper :deep(.tr-chat-model-selector__button),
.work-helper :deep(.tr-chat-model-features__button) {
  border-radius: 18px;
}

.work-helper :deep(.chat-welcome-content) {
  width: min(100%, 860px);
  margin: 0 auto;
  padding: 58px 36px 0;
  box-sizing: border-box;
}

.work-helper :deep(.tr-welcome) {
  padding: 0 0 44px;
}

.work-helper :deep(.tr-welcome__icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffffff, #e8f2ff);
  color: #2b9bf3;
  box-shadow: 0 3px 12px rgba(43, 155, 243, 0.18);
}

.work-helper :deep(.tr-welcome__title) {
  margin-top: 16px;
  font-size: 36px;
}

.work-helper :deep(.tr-welcome__description) {
  margin-top: 16px;
  font-size: 18px;
}

.work-helper :deep(.tr-prompts) {
  --tr-prompts-gap: 16px;
  --tr-prompt-width: calc((100% - 32px) / 3);
  width: 100%;
  margin: 0 auto;
}

.work-helper :deep(.tr-prompt) {
  box-sizing: border-box;
  min-height: 96px;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(40, 42, 51, 0.05);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.work-helper :deep(.worker-helper-prompt) {
  flex: 0 0 calc((100% - 32px) / 3);
  width: calc((100% - 32px) / 3);
  min-width: 0;
}

.work-helper :deep(.tr-prompt:hover) {
  border-color: #d9dce5;
  box-shadow: 0 12px 26px rgba(40, 42, 51, 0.1);
  transform: translateY(-2px);
}

.work-helper :deep(.tr-prompt__content-title) {
  font-size: 14px;
}

.work-helper :deep(.tr-prompt__content-description) {
  color: #66676c;
  font-size: 13px;
  line-height: 1.45;
}

.prompt-card-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  color: #fff;
}

.prompt-card-icon--warning {
  background: #ffb900;
}
.prompt-card-icon--green {
  background: #4eb800;
}
.prompt-card-icon--cyan {
  background: #11b6b8;
}
.prompt-card-icon--blue {
  background: #287cf0;
}

.work-helper__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 14px 0;
}

.topbar-actions {
  display: flex;
  gap: 8px;
}

.topbar-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #1f1f23;
  cursor: pointer;
}

.topbar-button:hover {
  background: rgba(0, 0, 0, 0.06);
}

.work-helper__conversation-title {
  position: absolute;
  top: 18px;
  left: 50%;
  color: #6e6f75;
  font-size: 13px;
  transform: translateX(-50%);
}

.shuffle-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: #68696f;
  font-size: 13px;
  cursor: pointer;
}

.prompts-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 16px;
}

.work-helper__disclaimer {
  position: absolute;
  top: calc(100% + 10px);
  right: 50%;
  width: max-content;
  color: #85868b;
  font-size: 12px;
  transform: translateX(50%);
}

.work-helper__disclaimer a {
  color: inherit;
  text-decoration: underline;
}

@media (max-width: 680px) {
  .work-helper :deep(.chat-panel-content--footer) {
    padding: 0 16px 24px;
  }

  .work-helper :deep(.chat-welcome-content) {
    padding: 42px 16px 0;
  }

  .work-helper :deep(.tr-welcome__title) {
    font-size: 30px;
  }

  .work-helper :deep(.tr-welcome__description) {
    font-size: 16px;
  }

  .work-helper :deep(.tr-prompts) {
    --tr-prompts-gap: 12px;
    --tr-prompt-width: calc((100% - 12px) / 2);
  }

  .work-helper :deep(.tr-prompt) {
    min-height: 112px;
    padding: 16px;
  }

  .work-helper :deep(.worker-helper-prompt) {
    flex-basis: calc((100% - 12px) / 2);
    width: calc((100% - 12px) / 2);
  }
}

@media (max-width: 430px) {
  .work-helper :deep(.tr-prompts) {
    --tr-prompt-width: 100%;
  }

  .work-helper :deep(.worker-helper-prompt) {
    flex-basis: 100%;
    width: 100%;
  }
}
</style>

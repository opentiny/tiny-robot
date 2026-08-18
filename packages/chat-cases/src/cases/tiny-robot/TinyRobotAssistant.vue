<script setup lang="ts">
import type { BubbleRoleConfig, PromptProps, SuggestionGroup, SuggestionItem, TemplateItem } from '@opentiny/tiny-robot'
import {
  TrDropdownMenu,
  TrSender,
  TrSuggestionPillButton,
  TrSuggestionPills,
  TrSuggestionPopover,
} from '@opentiny/tiny-robot'
import { TrChat, type ChatRuntime, type ChatStructuredData, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import { IconAi, IconEdit, IconSparkles, IconUser } from '@opentiny/tiny-robot-svgs'
import { computed, type CSSProperties, h, markRaw, nextTick, ref } from 'vue'
import {
  DROPDOWN_MENU_ITEMS,
  PILL_ITEMS_CONFIG,
  PROMPT_ITEMS_DATA,
  suggestionPopoverData,
  templateSuggestions,
  type UserItem,
} from './assistantConfig'

const props = defineProps<{
  runtime: ChatRuntime
}>()

const currentTemplate = ref<TemplateItem[]>([])
interface SenderActions {
  focus?: () => void
  editor?: {
    value?: {
      commands?: {
        focusFirstTemplate?: () => void
      }
    }
  }
}

const senderRef = ref<SenderActions | null>(null)
const templateExtensions = [TrSender.template(currentTemplate as never)]

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } }) as never
const userAvatar = h(IconUser, { style: { fontSize: '32px' } }) as never
const welcomeIcon = h(IconAi, { style: { fontSize: '48px' } }) as never

const promptItems: PromptProps[] = PROMPT_ITEMS_DATA.map((item) => ({
  ...item,
  icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, item.emoji) as never,
}))

const popoverData = ref<SuggestionGroup[]>(suggestionPopoverData)

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
  system: {
    hidden: true,
  },
}

const chatUi: ChatUIOptions = {
  header: false,
  history: false,
  welcome: {
    title: 'TinyRobot',
    description: '您好，我是TinyRobot，您专属的 AI 智能专家',
    icon: welcomeIcon,
  },
  prompts: {
    items: promptItems,
    wrap: true,
    itemClass: 'prompt-item',
  },
  bubble: {
    autoScroll: true,
    bubbleList: {
      roleConfigs: roles,
    },
  },
  layout: {
    heightMode: 'parent',
    emptyState: 'center',
    composer: {
      welcome: 'footer',
    },
    leftAside: false,
    contentMaxWidth: 1280,
    panelPadding: 0,
    panelGap: 0,
  },
  sender: {
    mode: 'single',
    clearable: true,
    showWordLimit: true,
    maxLength: 1000,
  },
}

async function sendMessage(text: string) {
  const value = text.trim()
  if (!value) return

  currentTemplate.value = []
  await props.runtime.actions.send({ text: value })
}

function handlePromptItemClick({ item }: { item: PromptProps }) {
  if (item.description) {
    void sendMessage(item.description)
  }
}

function handlePopoverItemClick(item: SuggestionItem) {
  void sendMessage(item.text)
}

function handleFillTemplate(template: UserItem[]) {
  currentTemplate.value = template.map((item) =>
    item.type === 'template' ? { type: 'block', content: item.content } : item,
  )

  nextTick(() => {
    senderRef.value?.editor?.value?.commands?.focusFirstTemplate?.()
  })
}

function clearTemplate() {
  currentTemplate.value = []

  nextTick(() => {
    senderRef.value?.focus?.()
  })
}

function handleSenderSubmit(
  submit: (payload: { text: string; structuredData?: ChatStructuredData }) => void,
  text: string,
  structuredData?: ChatStructuredData,
) {
  submit({ text, structuredData })
  clearTemplate()
}

function handleSenderClear(clear: () => void) {
  clear()
  clearTemplate()
}

const pillItems = computed(() =>
  PILL_ITEMS_CONFIG.map((config) => {
    const base = { text: config.text, icon: markRaw(IconEdit) }

    if (config.type === 'dropdown') {
      return {
        ...base,
        menu: {
          items: DROPDOWN_MENU_ITEMS,
          onItemClick: (item: unknown) => void sendMessage((item as { text: string }).text),
        },
      }
    }

    const [start, end] = config.range
    const items = end === undefined ? templateSuggestions.slice(start) : templateSuggestions.slice(start, end)

    return {
      ...base,
      menu: {
        items,
        onItemClick: (item: unknown) => handleFillTemplate((item as { template: UserItem[] }).template),
      },
    }
  }),
)
</script>

<template>
  <div class="tiny-robot-assistant">
    <TrChat
      class="tiny-robot-assistant__chat"
      :runtime="props.runtime"
      :ui="chatUi"
      @prompt-click="handlePromptItemClick"
    >
      <template #layout-footer="{ value, loading, disabled, submitDisabled, setInputValue, submit, cancel, clear }">
        <div class="tiny-robot-assistant__footer">
          <div class="tiny-robot-assistant__pills">
            <TrSuggestionPopover
              class="tiny-robot-assistant__popover"
              :data="popoverData"
              @item-click="handlePopoverItemClick"
            >
              <template #trigger>
                <TrSuggestionPillButton>
                  <template #icon>
                    <IconSparkles style="font-size: 16px; color: #1476ff" />
                  </template>
                </TrSuggestionPillButton>
              </template>
            </TrSuggestionPopover>
            <TrSuggestionPills class="tiny-robot-assistant__pills-list">
              <TrDropdownMenu
                v-for="(item, index) in pillItems"
                :key="index"
                :items="item.menu.items"
                trigger="click"
                @item-click="item.menu.onItemClick"
              >
                <template #trigger>
                  <TrSuggestionPillButton>{{ item.text }}</TrSuggestionPillButton>
                </template>
              </TrDropdownMenu>
            </TrSuggestionPills>
          </div>

          <TrSender
            ref="senderRef"
            mode="single"
            :model-value="value"
            :disabled="disabled"
            :loading="loading"
            :clearable="true"
            :show-word-limit="true"
            :max-length="1000"
            :placeholder="loading ? '正在思考中...' : '请输入您的问题'"
            :default-actions="{ submit: { disabled: submitDisabled } }"
            :extensions="templateExtensions"
            @update:model-value="setInputValue"
            @submit="(text, structuredData) => handleSenderSubmit(submit, text, structuredData)"
            @cancel="cancel"
            @clear="() => handleSenderClear(clear)"
          />
        </div>
      </template>
    </TrChat>
  </div>
</template>

<style scoped>
.tiny-robot-assistant {
  container-type: inline-size;
  display: flex;
  box-sizing: border-box;
  flex: 1 1 auto;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: 0;
}

.tiny-robot-assistant__chat {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
}

.tiny-robot-assistant :deep(.tr-welcome) {
  box-sizing: border-box;
  width: 100%;
  padding: 24px 24px 0;
}

.tiny-robot-assistant :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tiny-robot-assistant :deep(.tr-prompts) {
  box-sizing: border-box;
  width: 100%;
  padding: 16px 24px;
}

.tiny-robot-assistant :deep(.tr-prompts__list-container) {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.tiny-robot-assistant :deep(.tr-prompt) {
  box-sizing: border-box;
  width: auto;
  min-width: 0;
}

.tiny-robot-assistant__footer {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  flex-shrink: 0;
  gap: 8px;
  padding: 8px 12px;
}

.tiny-robot-assistant__pills {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.tiny-robot-assistant__popover {
  flex-shrink: 0;
  --tr-suggestion-popover-width: 440px;
}

.tiny-robot-assistant__pills-list {
  overflow: hidden;
  min-width: 0;
  flex: 1;
}

.tiny-robot-assistant__pills-list :deep(.tr-suggestion-pills__container) {
  min-width: 0;
  mask: linear-gradient(to right, rgb(0 0 0 / 100%) 80%, rgb(0 0 0 / 0%) 100%);
}

.tiny-robot-assistant__footer :deep(.tr-sender) {
  width: 100%;
  min-width: 0;
}

@container (min-width: 520px) {
  .tiny-robot-assistant :deep(.tr-prompts__list-container) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container (max-width: 519px) {
  .tiny-robot-assistant :deep(.tr-prompts) {
    padding: 12px;
  }

  .tiny-robot-assistant__footer {
    padding: 8px;
  }
}
</style>

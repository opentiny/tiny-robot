import type { LayoutFloatingOptions } from '@opentiny/tiny-robot'
import type { ChatSenderOptions, ChatUIOptions } from '@opentiny/tiny-robot-chat'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, type CSSProperties } from 'vue'
import { PROMPT_ITEMS_DATA } from './prompts'

export interface ChatUiConfigOptions {
  displayMode: 'floating' | 'side' | 'fullscreen'
  floatingOptions: Readonly<LayoutFloatingOptions>
  templateExtensions: NonNullable<ChatSenderOptions['extensions']>
}

const promptItems = PROMPT_ITEMS_DATA.map((item) => ({
  ...item,
  icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, item.emoji) as never,
}))

export function createChatUi(options: ChatUiConfigOptions): ChatUIOptions {
  return {
    history: false,
    welcome: {
      title: 'TinyRobot',
      description: '您好，我是TinyRobot，您专属的 AI 智能专家',
      icon: h(IconAi, { style: { fontSize: '48px' } }) as never,
    },
    prompts: { items: promptItems, wrap: true, itemClass: 'prompt-item' },
    bubble: {
      autoScroll: true,
      bubbleList: {
        roleConfigs: {
          assistant: { placement: 'start', avatar: h(IconAi, { style: { fontSize: '32px' } }) as never },
          user: { placement: 'end', avatar: h(IconUser, { style: { fontSize: '32px' } }) as never },
          system: { hidden: true },
        },
      },
    },
    layout: {
      heightMode: 'parent',
      leftAside: false,
      rightAside: false,
      surface: { mode: 'floating', floatingOptions: options.floatingOptions },
      emptyState: 'center',
      composer: { welcome: 'footer' },
      contentMaxWidth: 1280,
      panelPadding: 0,
      panelGap: 0,
    } as ChatUIOptions['layout'],
    sender: {
      mode: 'multiple',
      clearable: true,
      showWordLimit: true,
      maxLength: 2000,
      extensions: options.templateExtensions,
    },
  }
}

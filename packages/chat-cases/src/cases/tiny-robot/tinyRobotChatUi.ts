import type { BubbleRoleConfig, LayoutFloatingOptions, PromptProps } from '@opentiny/tiny-robot'
import type { ChatSenderOptions, ChatUIOptions } from '@opentiny/tiny-robot-chat'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, type CSSProperties } from 'vue'
import { PROMPT_ITEMS_DATA } from './assistantConfig'

export interface TinyRobotChatUiOptions {
  floatingOptions: Readonly<LayoutFloatingOptions>
  templateExtensions: NonNullable<ChatSenderOptions['extensions']>
}

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } }) as never
const userAvatar = h(IconUser, { style: { fontSize: '32px' } }) as never
const welcomeIcon = h(IconAi, { style: { fontSize: '48px' } }) as never

const promptItems: PromptProps[] = PROMPT_ITEMS_DATA.map((item) => ({
  ...item,
  icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, item.emoji) as never,
}))

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

export function createTinyRobotChatUi(options: TinyRobotChatUiOptions): ChatUIOptions {
  return {
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
      surface: {
        mode: 'floating',
        floatingOptions: options.floatingOptions,
      },
      emptyState: 'center',
      composer: {
        welcome: 'footer',
      },
      leftAside: false,
      rightAside: false,
      contentMaxWidth: 1280,
      panelPadding: 0,
      panelGap: 0,
    },
    sender: {
      mode: 'multiple',
      clearable: true,
      showWordLimit: true,
      maxLength: 1000,
      extensions: options.templateExtensions,
    },
  }
}

import type { LayoutFloatingOptions } from '@opentiny/tiny-robot'
import type { ChatSenderOptions, ChatUIOptions } from '@opentiny/tiny-robot-chat'
import type { TemplateItem } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, type CSSProperties } from 'vue'

export interface ChatUiConfigOptions {
  floatingOptions: Readonly<LayoutFloatingOptions>
  templateExtensions: NonNullable<ChatSenderOptions['extensions']>
}

export interface PromptItemData {
  label: string
  description: string
  emoji: string
  badge?: string
}

export const PROMPT_ITEMS_DATA: PromptItemData[] = [
  {
    label: '日常助理场景',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    emoji: '🧠',
    badge: 'NEW',
  },
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是"Vue3 和 React 的区别"！',
    emoji: '🤔',
  },
  {
    label: '创意生成场景',
    description: '想写段文案、起个名字，还是来点灵感？',
    emoji: '✨',
  },
  {
    label: '工作效率场景',
    description: '需要我帮你总结内容、拆解任务，还是整理一份行动清单？',
    emoji: '⚡',
  },
]

export const prompts = PROMPT_ITEMS_DATA

export interface TemplateSuggestionItem {
  id: string
  text: string
  template: TemplateItem[]
}

export const templateSuggestions: TemplateSuggestionItem[] = [
  {
    id: 'write',
    text: '帮我写作',
    template: [
      { id: 'write-prefix', type: 'text', content: '请帮我撰写一篇' },
      {
        id: 'write-kind',
        type: 'select',
        content: '',
        placeholder: '文章类型',
        options: [
          { label: '公告', value: '公告' },
          { label: '方案', value: '方案' },
          { label: '邮件', value: '邮件' },
        ],
      },
      { id: 'write-topic-prefix', type: 'text', content: '，主题是' },
      { id: 'write-topic', type: 'block', content: '主题' },
      { id: 'write-tone-prefix', type: 'text', content: '，语气是' },
      {
        id: 'write-tone',
        type: 'select',
        content: '',
        placeholder: '语气类型',
        options: [
          { label: '正式', value: '正式' },
          { label: '轻松', value: '轻松' },
          { label: '专业', value: '专业' },
        ],
      },
      { id: 'write-description-prefix', type: 'text', content: '，具体内容是' },
      { id: 'write-description', type: 'block', content: '详细描述' },
    ],
  },
  {
    id: 'translate',
    text: '翻译',
    template: [
      { id: 'translate-source-prefix', type: 'text', content: '请将以下' },
      {
        id: 'translate-source-language',
        type: 'select',
        content: '',
        placeholder: '源语言',
        options: [
          { label: '中文', value: '中文' },
          { label: '英文', value: '英文' },
          { label: '日语', value: '日语' },
        ],
      },
      { id: 'translate-content-prefix', type: 'text', content: '内容翻译成' },
      {
        id: 'translate-target-language',
        type: 'select',
        content: '',
        placeholder: '目标语言',
        options: [
          { label: '中文', value: '中文' },
          { label: '英文', value: '英文' },
          { label: '日语', value: '日语' },
        ],
      },
      { id: 'translate-content-suffix', type: 'text', content: '，内容是' },
      { id: 'translate-content', type: 'block', content: '需要翻译的内容' },
    ],
  },
  {
    id: 'code-review',
    text: '代码审查',
    template: [
      { id: 'code-review-prefix', type: 'text', content: '请帮我审查以下' },
      {
        id: 'code-review-language',
        type: 'select',
        content: '',
        placeholder: '代码语言',
        options: [
          { label: 'JavaScript', value: 'JavaScript' },
          { label: 'TypeScript', value: 'TypeScript' },
          { label: 'Python', value: 'Python' },
        ],
      },
      { id: 'code-review-focus-prefix', type: 'text', content: '代码，关注' },
      {
        id: 'code-review-focus',
        type: 'select',
        content: '',
        placeholder: '关注方向',
        options: [
          { label: '性能', value: '性能' },
          { label: '安全', value: '安全' },
          { label: '可读性', value: '可读性' },
        ],
      },
      { id: 'code-review-content-prefix', type: 'text', content: '方面，代码如下：' },
      { id: 'code-review-content', type: 'block', content: '代码内容' },
    ],
  },
  {
    id: 'email-compose',
    text: '写邮件',
    template: [
      { id: 'email-compose-prefix', type: 'text', content: '请帮我起草一封' },
      {
        id: 'email-compose-type',
        type: 'select',
        content: '',
        placeholder: '邮件类型',
        options: [
          { label: '正式', value: '正式' },
          { label: '非正式', value: '非正式' },
        ],
      },
      { id: 'email-compose-recipient-prefix', type: 'text', content: '邮件，发送给' },
      { id: 'email-compose-recipient', type: 'block', content: '收件人角色' },
      { id: 'email-compose-subject-prefix', type: 'text', content: '，主题是' },
      { id: 'email-compose-subject', type: 'block', content: '邮件主题' },
      { id: 'email-compose-content-prefix', type: 'text', content: '，内容是关于' },
      { id: 'email-compose-content', type: 'block', content: '邮件内容' },
    ],
  },
  {
    id: 'interview-questions',
    text: '面试问题',
    template: [
      { id: 'interview-questions-prefix', type: 'text', content: '请为' },
      { id: 'interview-questions-role', type: 'block', content: '岗位名称' },
      { id: 'interview-questions-skill-prefix', type: 'text', content: '岗位，针对' },
      { id: 'interview-questions-skill', type: 'block', content: '技能领域' },
      { id: 'interview-questions-count-prefix', type: 'text', content: '方向，设计' },
      {
        id: 'interview-questions-count',
        type: 'select',
        content: '',
        placeholder: '问题数量',
        options: [
          { label: '3', value: '3' },
          { label: '5', value: '5' },
          { label: '10', value: '10' },
        ],
      },
      { id: 'interview-questions-difficulty-prefix', type: 'text', content: '个难度为' },
      {
        id: 'interview-questions-difficulty',
        type: 'select',
        content: '',
        placeholder: '岗位难度',
        options: [
          { label: '简单', value: '简单' },
          { label: '中等', value: '中等' },
          { label: '困难', value: '困难' },
        ],
      },
      { id: 'interview-questions-suffix', type: 'text', content: '的面试问题' },
    ],
  },
]

export interface TemplateCategory {
  id: string
  title: string
  items: TemplateSuggestionItem[]
}

export const templateCategories: TemplateCategory[] = [
  { id: 'writing', title: '写作表达', items: [templateSuggestions[0]] },
  { id: 'language', title: '语言处理', items: [templateSuggestions[1]] },
  { id: 'engineering', title: '研发协作', items: [templateSuggestions[2]] },
  { id: 'communication', title: '工作沟通', items: [templateSuggestions[3]] },
  { id: 'growth', title: '人才发展', items: [templateSuggestions[4]] },
]

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
      rightAside: {
        mode: 'drawer',
        width: 400,
        defaultOpen: false,
      },
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

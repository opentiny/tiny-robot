import type {
  ChatBubbleContentRendererContext,
  ChatBubbleRenderers,
  ChatPromptClickPayload,
  ChatUIData,
  ChatUIOptions,
  LayoutFloatingState,
} from '@opentiny/tiny-robot-chat'
import { useChatRuntimeAdapter } from '@opentiny/tiny-robot-chat'
import type { MessageRequestBody, ResponseProvider } from '@opentiny/tiny-robot-kit'
import { effectScope, shallowRef, watch } from 'vue'
import { TrSender, type MentionItem, type TemplateItem } from '@opentiny/tiny-robot'
import { IconGenerativeUi } from '@opentiny/tiny-robot-svgs'
import type {
  ExtensionManagerActionEvent,
  ExtensionManagerNameClickEvent,
  ExtensionManagerTab,
  ExtensionManagerTabChangeEvent,
} from '@opentiny/tiny-robot'
import {
  createChatRuntime,
  type TrChatRenderers,
  type TrChatRuntimeSnapshot,
} from '@opentiny/tiny-robot-chat/experimental'
import { modelProviders } from '../../chat/shared/modelProviders'
import releasePreviewTemplate from '../../chat/release-preview.html?raw'
import { createDemoRuntimeOptions } from './createRuntime'
import { createMockConversationStorage } from './mockConversationStorage'
import { mockStreamingResponseProvider } from './modelProviders'
import { addButton, addControls, addLog, createStaticRuntime, mountChat, mountChatUI } from './mount'
import type { ExperimentalExampleModule } from './types'
import eventContract from '../event-contract'
import initializationTiming from '../initialization-timing'
import performanceStress from '../performance-stress'
import ssrSafeImport from '../ssr-safe-import'
import unifiedErrorContract from '../unified-error-contract'
import bundleBudget from '../bundle-budget'

function defineExample(
  id: string,
  summary: string,
  testedInteractions: readonly string[],
  mount: ExperimentalExampleModule['mount'],
): ExperimentalExampleModule {
  return { id, summary, testedInteractions, mount }
}

export const basic = defineExample(
  'basic',
  '使用模型服务配置和 owned Runtime 复刻原版最小聊天接入。',
  ['渲染', '模型选择', '输入', '发送'],
  async (host) => {
    const element = await mountChat(host, {
      runtimeOptions: createDemoRuntimeOptions({
        responseProvider: undefined,
        modelProviders: [
          {
            type: 'openai',
            apiUrl: new URL('/api', window.location.origin).toString(),
            models: [{ id: 'your-model-id', label: '应用助手' }],
          },
        ],
      }),
    })
    return () => element.remove()
  },
)

export const layoutPresets = defineExample(
  'layout-presets',
  '复刻默认、紧凑、专注及两种空会话输入区布局。',
  ['默认布局', '紧凑内容', '专注模式', '底部输入', '居中输入'],
  async (host) => {
    const controls = addControls(host)
    const description = document.createElement('span')
    description.className = 'layout-presets-demo__description'
    const data: ChatUIData = {
      conversation: {
        items: [
          { id: 'review', title: '变更评审' },
          { id: 'release', title: '发布检查' },
        ],
        activeId: 'review',
        title: '变更评审',
      },
      bubble: {
        messages: [
          { role: 'user', content: '这个改动最需要关注什么？' },
          { role: 'assistant', content: '先确认公开接口是否兼容，再检查错误恢复和窄屏布局。' },
        ],
      },
      sender: { submitDisabled: true },
    }
    const emptyData: ChatUIData = {
      conversation: { items: data.conversation?.items, activeId: null, title: '新对话' },
      bubble: { messages: [] },
      sender: { submitDisabled: true },
    }
    const presets = {
      default: {
        label: '默认布局',
        description: '保留完整页面区域，内容最大宽度为 980px。',
        data,
        ui: {} satisfies ChatUIOptions,
      },
      compact: {
        label: '紧凑内容',
        description: '内容最大宽度为 640px；左侧栏默认展开，展开宽度为 240px，收起宽度为 48px。',
        data,
        ui: {
          layout: {
            contentMaxWidth: 640,
            panelPadding: 20,
            panelGap: 8,
            leftAside: { width: 240, collapsedWidth: 48, defaultOpen: true },
          },
        } satisfies ChatUIOptions,
      },
      focus: {
        label: '专注模式',
        description: '隐藏页头与会话列表，只保留消息和输入区。',
        data,
        ui: {
          header: false,
          history: false,
          layout: { contentMaxWidth: 720, leftAside: false },
        } satisfies ChatUIOptions,
      },
      'welcome-footer': {
        label: '空会话：底部输入',
        description: '没有消息时，输入区位于页面底部。',
        data: emptyData,
        ui: { layout: { composer: { welcome: 'footer' } } } satisfies ChatUIOptions,
      },
      'welcome-center': {
        label: '空会话：居中输入',
        description: '没有消息时，输入区位于欢迎区中央；已有消息时仍位于页面底部。',
        data: emptyData,
        ui: { layout: { composer: { welcome: 'center' } } } satisfies ChatUIOptions,
      },
    } as const
    type PresetId = keyof typeof presets
    let activePreset: PresetId = 'default'
    let element: Awaited<ReturnType<typeof mountChatUI>> | undefined
    const buttons = new Map<PresetId, HTMLButtonElement>()
    const mountPreset = async (id: PresetId) => {
      activePreset = id
      description.textContent = presets[id].description
      for (const [buttonId, button] of buttons) button.setAttribute('aria-pressed', String(buttonId === id))
      element?.remove()
      element = await mountChatUI(host, { data: presets[id].data, ui: presets[id].ui, inputValue: '' })
    }
    for (const id of Object.keys(presets) as PresetId[]) {
      buttons.set(
        id,
        addButton(controls, presets[id].label, () => mountPreset(id)),
      )
    }
    controls.append(description)
    await mountPreset(activePreset)
    return () => element?.remove()
  },
)

export const welcomePrompts = defineExample(
  'welcome-prompts',
  '复刻原版欢迎信息、推荐问题、显示开关和返回新会话。',
  ['欢迎区开关', '推荐问题开关', '事件 detail', '模板输入', '返回新会话'],
  async (host) => {
    host.classList.add('tr-chat-experiment-host--welcome')
    const controls = addControls(host)
    let showWelcome = true
    let showPrompts = true
    const inputTemplate = shallowRef<TemplateItem[]>([])
    const extensions = [TrSender.template(inputTemplate)]
    const promptItems = [
      { id: 'code', label: '解释代码', description: '请解释这段代码的作用，并给出使用建议。' },
      { id: 'report', label: '撰写周报', description: '请帮我整理本周工作，生成一份简洁的周报。' },
      { id: 'plan', label: '制定学习计划', description: '请为 Vue 初学者制定一份两周学习计划。' },
    ]
    const createUI = (): ChatUIOptions => ({
      layout: { leftAside: false },
      welcome: showWelcome ? { title: '项目助手', description: '选择一个问题开始，或输入自己的问题。' } : false,
      prompts: showPrompts ? { wrap: true, items: promptItems } : false,
      sender: { extensions },
    })
    const addToggle = (labelText: string, onChange: (checked: boolean) => void) => {
      const label = document.createElement('label')
      label.className = 'tr-chat-experiment-label'
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = true
      checkbox.addEventListener('change', () => onChange(checkbox.checked))
      label.append(checkbox, labelText)
      controls.append(label)
    }
    addToggle('显示欢迎区', (checked) => {
      showWelcome = checked
      element.ui = createUI()
    })
    addToggle('显示推荐问题', (checked) => {
      showPrompts = checked
      element.ui = createUI()
    })
    addButton(controls, '返回新会话', async () => {
      await element.getRuntime()?.actions.abort?.()
      await element.getRuntime()?.actions.clearActiveConversation()
      inputTemplate.value = []
    })
    const tip = document.createElement('p')
    tip.className = 'tr-chat-experiment-status'
    tip.textContent = '点击推荐问题填入输入框，编辑后发送；返回新会话。'
    host.append(tip)
    const element = await mountChat(host, {
      ui: createUI(),
      configure(target) {
        target.addEventListener('prompt-click', (event) => {
          const { item } = (event as CustomEvent<ChatPromptClickPayload>).detail
          inputTemplate.value = [{ type: 'text', content: item.description || item.label }]
        })
      },
    })
    return () => element.remove()
  },
)

export const senderOptions = defineExample(
  'sender-options',
  '验证输入区配置、提及、模板、帮助 Light DOM slot 和自定义工具按钮。',
  ['Mention', 'Template', '帮助 Slot', '字数限制', '清空'],
  async (host) => {
    const mentions: MentionItem[] = [
      { label: '产品组', value: 'product' },
      { label: '研发组', value: 'engineering' },
      { label: '测试组', value: 'qa' },
    ]
    const currentTemplate = shallowRef<TemplateItem[]>([])
    const extensions = [TrSender.mention(mentions), TrSender.template(currentTemplate)]
    const fillReportTemplate = () => {
      currentTemplate.value = [
        { type: 'text', content: '请帮我写一份关于' },
        { type: 'block', content: '项目进展' },
        { type: 'text', content: '的报告，面向' },
        {
          type: 'select',
          content: '',
          placeholder: '选择读者',
          options: [
            { label: '项目成员', value: '项目成员' },
            { label: '项目负责人', value: '项目负责人' },
          ],
        },
        { type: 'text', content: '，重点说明' },
        { type: 'block', content: '已完成工作和下一步计划' },
        { type: 'text', content: '。' },
      ]
    }
    const fillCommonQuestion = () => {
      currentTemplate.value = [{ type: 'text', content: '请列出项目周报中需要包含的内容。' }]
    }
    const element = await mountChatUI(host, {
      ui: {
        layout: { leftAside: false },
        welcome: { title: '输入区配置', description: '输入 @ 选择对象，或使用下方按钮填入内容。' },
        sender: {
          placeholder: '输入 @ 选择对象，或点击“写报告”插入模板...',
          mode: 'multiple',
          maxLength: 300,
          showWordLimit: true,
          clearable: true,
          extensions,
          toolbar: (defaults) => [
            ...defaults,
            { type: 'custom', id: 'report', label: '写报告', onClick: fillReportTemplate },
            { type: 'custom', id: 'common-question', label: '常用问题', onClick: fillCommonQuestion },
          ],
          defaultActions: {
            submit: { tooltip: '发送给项目助手' },
            clear: { tooltip: '清空输入内容' },
          },
        },
      },
      configure(target) {
        const help = document.createElement('p')
        help.slot = 'sender-header'
        help.hidden = true
        help.textContent =
          '@ 用于插入对象名称，不会切换模型；模板中的文本块可以编辑，下拉字段可以选择。内容超过 300 字时无法提交。'
        const toggle = document.createElement('button')
        toggle.slot = 'sender-footer-right'
        toggle.type = 'button'
        toggle.textContent = '使用说明'
        toggle.setAttribute('aria-expanded', 'false')
        toggle.addEventListener('click', () => {
          help.hidden = !help.hidden
          toggle.setAttribute('aria-expanded', String(!help.hidden))
        })
        target.append(help, toggle)
      },
    })
    return () => element.remove()
  },
)

export const senderToolbar = defineExample(
  'sender-toolbar',
  '验证工具栏排序、可见性、禁用状态、自定义动作及窄输入区响应式行为。',
  ['内置排序', '自定义动作', 'visible', 'disabled', '窄输入区'],
  async (host) => {
    const controls = addControls(host)
    let searchVisible = true
    let searchDisabled = false
    let guiEnabled = false
    const createData = (): ChatUIData => ({
      conversation: { title: '工具栏配置' },
      bubble: { messages: [] },
      sender: { loading: false, disabled: false, submitDisabled: false },
      model: {
        options: [
          {
            id: 'qwen3.7-flash',
            label: 'Qwen3.7 Flash',
            capabilities: { thinking: true, search: true },
          },
        ],
        selectedId: 'qwen3.7-flash',
        features: { thinking: false, search: false },
      },
    })
    const createUI = (): ChatUIOptions => ({
      history: false,
      layout: { leftAside: false },
      welcome: { title: '工具栏配置', description: '调整按钮状态并观察输入区。' },
      sender: {
        toolbar: (defaults) => [
          ...defaults
            .filter((item) => item.id !== 'mcp')
            .sort((left, right) => (left.id === 'model' ? -1 : right.id === 'model' ? 1 : 0))
            .map((item) =>
              item.id === 'search' ? { ...item, visible: searchVisible, disabled: searchDisabled } : item,
            ),
          {
            type: 'custom',
            id: 'gui',
            label: '生成式 UI',
            icon: IconGenerativeUi,
            active: guiEnabled,
            onClick: () => {
              guiEnabled = !guiEnabled
              element.ui = createUI()
            },
          },
        ],
      },
    })
    const element = await mountChatUI(host, { data: createData(), ui: createUI() })
    addButton(controls, '禁用联网搜索', () => {
      searchDisabled = !searchDisabled
      element.ui = createUI()
    })
    addButton(controls, '隐藏联网搜索', () => {
      searchVisible = !searchVisible
      element.ui = createUI()
    })
    addButton(controls, '窄输入区', () => {
      host.style.maxWidth = host.style.maxWidth ? '' : '600px'
    })
    return () => element.remove()
  },
)

export const extensionTabs = defineExample(
  'extension-tabs',
  '在同一扩展面板中验证 MCP、Skills、DOM Renderer 和受控 overlay。',
  ['页签切换', '扩展操作', '名称详情', '页头 Renderer', 'Overlay Renderer'],
  async (host) => {
    const log = addLog(host)
    let overlayOpen = false
    let overlayTitle = ''
    let overlayDescription = ''
    let tabs: ExtensionManagerTab[] = [
      {
        id: 'skills',
        label: 'Skills',
        items: [
          {
            id: 'concise-answer',
            name: '简洁回答',
            description: '随应用内置，让回答保持简短并突出结论。',
            installed: true,
            nameClickable: true,
            actions: [{ id: 'toggle', type: 'switch', label: '启用简洁回答', checked: true }],
          },
          {
            id: 'release-notes',
            name: '发布说明',
            description: '根据变更记录生成发布说明。',
            installed: false,
            actions: [{ id: 'install', type: 'button', label: '安装' }],
          },
        ],
      },
    ]
    const createUI = (): ChatUIOptions => ({
      layout: { leftAside: false, rightAside: { width: 320 } },
      welcome: false,
      sender: false,
      extensions: { defaultActiveTab: 'skills', tabs, overlayOpen },
    })

    const element = await mountChatUI(host, {
      data: {
        conversation: { title: '扩展能力演示' },
        bubble: { messages: [{ role: 'assistant', content: 'MCP 与应用扩展共享同一个右侧面板。' }] },
        mcp: {
          servers: [
            {
              id: 'project-search',
              name: '项目检索',
              description: '检索项目代码和文档。',
              installed: true,
              enabled: true,
            },
          ],
          tools: {},
        },
      },
      ui: createUI(),
      configure(target) {
        target.defaultRightAsideOpen = true
        target.renderers = {
          'extension-header-actions': ({ activeTabId }) => {
            if (activeTabId !== 'skills') return null
            const button = document.createElement('button')
            button.type = 'button'
            button.className = 'extension-tabs-demo__add'
            button.textContent = '导入 Skill'
            button.addEventListener('click', () => {
              overlayTitle = '导入 Skill'
              overlayDescription = '这里可以放置 SkillImportForm，导入成功后更新 extensions.tabs。'
              overlayOpen = true
              target.ui = createUI()
            })
            return button
          },
          'extension-overlay': () => {
            const section = document.createElement('section')
            section.className = 'extension-tabs-demo__overlay'
            const title = document.createElement('h3')
            title.textContent = overlayTitle
            const description = document.createElement('p')
            description.textContent = overlayDescription
            const close = document.createElement('button')
            close.type = 'button'
            close.className = 'extension-tabs-demo__secondary-action'
            close.textContent = '返回扩展列表'
            close.addEventListener('click', () => {
              overlayOpen = false
              target.ui = createUI()
            })
            section.append(title, description, close)
            return section
          },
        }
        target.addEventListener('extension-action', (event) => {
          const detail = (event as CustomEvent<ExtensionManagerActionEvent>).detail
          tabs = tabs.map((tab) =>
            tab.id !== detail.tabId
              ? tab
              : {
                  ...tab,
                  items: tab.items.map((item) =>
                    item.id !== detail.itemId
                      ? item
                      : {
                          ...item,
                          actions: item.actions?.map((action) =>
                            action.id === detail.action.id && action.type === 'switch'
                              ? { ...action, checked: detail.action.checked ?? action.checked }
                              : action,
                          ),
                        },
                  ),
                },
          )
          target.ui = createUI()
          log(`extension-action: ${detail.itemId}/${detail.action.id}/${String(detail.action.checked)}`)
        })
        target.addEventListener('extension-name-click', (event) => {
          const detail = (event as CustomEvent<ExtensionManagerNameClickEvent>).detail
          const item = tabs
            .find((tab) => tab.id === detail.tabId)
            ?.items.find((candidate) => candidate.id === detail.itemId)
          overlayTitle = item?.name ?? detail.itemId
          overlayDescription = item?.description ?? '这里可以放置扩展详情组件。'
          overlayOpen = true
          target.ui = createUI()
        })
        target.addEventListener('extension-tab-change', (event) => {
          const detail = (event as CustomEvent<ExtensionManagerTabChangeEvent>).detail
          log(`extension-tab-change: ${detail.tabId}`)
        })
      },
    })
    return () => element.remove()
  },
)

export const bubbleOptions = defineExample(
  'bubble-options',
  '使用内置 Renderer ID、DOM Renderer 和 match 数组复刻原版 Bubble 行为。',
  ['Markdown Renderer', 'Tools Renderer', '自定义 DOM Renderer', 'match 替换'],
  async (host) => {
    host.classList.add('tr-chat-experiment-host--bubble-renderers')
    host.dataset.bubbleRendererAborts = '0'
    const controls = addControls(host)
    let replacing = false
    let aborts = 0

    const createStatusRenderer =
      (variant: 'primary' | 'replacement') =>
      (context: ChatBubbleContentRendererContext, lifecycle: { signal: AbortSignal }) => {
        const card = document.createElement('article')
        card.className = 'bubble-options-demo__status-card'
        card.dataset.bubbleStatusCard = variant

        if (variant === 'replacement') {
          card.textContent = `备用状态：${String(context.content.status)}`
          return card
        }

        const title = document.createElement('strong')
        title.textContent = String(context.content.title)
        const status = document.createElement('span')
        status.textContent = `状态：${String(context.content.status)}`
        const action = document.createElement('button')
        action.type = 'button'
        let confirmations = 0
        action.textContent = '确认状态'
        const confirm = () => {
          confirmations += 1
          action.textContent = `已确认 ${confirmations} 次`
        }
        action.addEventListener('click', confirm)
        lifecycle.signal.addEventListener(
          'abort',
          () => {
            action.removeEventListener('click', confirm)
            if (replacing) {
              aborts += 1
              host.dataset.bubbleRendererAborts = String(aborts)
            }
          },
          { once: true },
        )
        card.append(title, status, action)
        return card
      }

    const matches = (statusRenderer: ReturnType<typeof createStatusRenderer>): ChatBubbleRenderers => ({
      contentRendererMatches: [
        {
          find: (message) => Boolean(message.tool_calls?.length),
          renderer: 'tools',
          priority: -2,
        },
        {
          find: (message, content, contentIndex) =>
            message.role === 'assistant' &&
            content.type === 'text' &&
            contentIndex === 0 &&
            !message.tool_calls?.length,
          renderer: 'markdown',
          priority: -2,
        },
        {
          find: (_message, content) => content.type === 'status-card',
          renderer: statusRenderer,
          priority: 10,
        },
      ],
    })

    const data: ChatUIData = {
      conversation: {
        title: 'Bubble Renderer 匹配',
        items: [{ id: 'demo', title: 'Bubble Renderer 匹配' }],
        activeId: 'demo',
      },
      bubble: {
        messages: [
          {
            role: 'assistant',
            content: [
              { type: 'text', text: '## 内置 Markdown Renderer\n\n内容经过 **安全渲染**。' },
              { type: 'status-card', title: '发布状态', status: 'ready' },
            ],
          },
          { role: 'user', content: '普通文本保持默认渲染。' },
          {
            role: 'assistant',
            content: '工具调用由内置 Tools Renderer 展示。',
            tool_calls: [
              {
                id: 'release-tool-1',
                type: 'function',
                function: { name: 'lookup_release', arguments: '{"version":"1.0.0"}' },
              },
            ],
            state: {
              toolCall: {
                'release-tool-1': { status: 'success', open: false, description: '查询发布版本' },
              },
            },
          },
        ],
      },
    }

    const element = await mountChatUI(host, {
      data,
      ui: {
        layout: { leftAside: false },
        welcome: false,
        sender: false,
        bubble: {
          autoScroll: false,
          bubbleList: {
            contentRenderMode: 'split',
            roleConfigs: {
              user: { placement: 'end', shape: 'rounded' },
              assistant: { placement: 'start', shape: 'none' },
            },
          },
        },
      },
      configure(target) {
        target.bubbleRenderers = matches(createStatusRenderer('primary'))
      },
    })
    addButton(controls, '替换自定义 Renderer', () => {
      replacing = true
      element.bubbleRenderers = matches(createStatusRenderer('replacement'))
    })
    return () => {
      host.classList.remove('tr-chat-experiment-host--bubble-renderers')
      delete host.dataset.bubbleRendererAborts
      element.remove()
    }
  },
)

export const runtimeError = defineExample(
  'runtime-error',
  '复刻同一 Runtime 中的发送失败提示、错误事件和后续恢复。',
  ['失败消息', '错误事件', '同一 Runtime 恢复发送'],
  async (host) => {
    let responseIndex = 0
    const responseProvider: ResponseProvider = async (requestBody: MessageRequestBody) => {
      await new Promise((resolve) => window.setTimeout(resolve, 300))
      const text = String(requestBody.messages.filter((message) => message.role === 'user').at(-1)?.content ?? '')
      if (text.includes('失败')) {
        const error = new Error('模拟请求失败：模型服务暂时不可用。')
        Object.assign(error, { code: 'DEMO_UNAVAILABLE' })
        throw error
      }
      responseIndex += 1
      return {
        id: `web-component-runtime-error-${responseIndex}`,
        object: 'chat.completion',
        created: responseIndex,
        model: 'local-demo',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: `正常回复：${text || '成功消息'}` },
            delta: undefined,
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
      }
    }
    const hint = document.createElement('p')
    hint.className = 'tr-chat-experiment-status tr-chat-experiment-status--hint'
    hint.textContent = '发送包含“失败”的内容可查看错误提示，发送其他内容可查看正常回复。'
    const status = document.createElement('p')
    status.className = 'tr-chat-experiment-status'
    status.role = 'status'
    status.textContent = '尚未收到操作失败通知'
    host.append(hint, status)
    const element = await mountChat(host, {
      runtimeOptions: createDemoRuntimeOptions({ responseProvider }),
      ui: { layout: { leftAside: false, rightAside: false }, welcome: false, prompts: false },
      configure(target) {
        target.addEventListener('runtime-action-error', (event) => {
          const detail = (event as CustomEvent<{ action: string }>).detail
          status.textContent = detail.action === 'send' ? '已收到发送失败通知' : '已收到操作失败通知'
        })
      },
    })
    return () => element.remove()
  },
)

export const historyGroups = defineExample(
  'history-groups',
  '复刻分组历史、会话切换、重命名和删除入口。',
  ['置顶/昨天/30天内', '会话切换', '重命名', '删除入口'],
  async (host) => {
    host.classList.add('tr-chat-experiment-host--history')
    const groups = ['置顶', '昨天', '30天内'] as const
    const seeds = [
      { title: '初次问候与自我介绍', group: '置顶' },
      { title: 'square-pen 含义解释', group: '昨天' },
      { title: '浏览器 Agent 视觉操作优化', group: '30天内' },
      { title: 'VSCode 重启 TS 服务快捷键', group: '30天内' },
      { title: '如何制定英语学习计划', group: '30天内' },
    ]
    const tip = document.createElement('p')
    tip.className = 'tr-chat-experiment-status'
    tip.textContent = '展开会话列表后，可切换、重命名或删除会话。分组为预设示例，不包含自动日期归类或置顶操作。'
    host.append(tip)
    const storage = createMockConversationStorage(
      seeds.map(({ title, group }) => ({
        title,
        metadata: { group },
        messages: [
          { role: 'user', content: title },
          { role: 'assistant', content: `这是“${title}”的示例回答。切换左侧会话，可查看对应的消息。` },
        ],
      })),
    )
    const element = await mountChat(host, {
      runtimeOptions: createDemoRuntimeOptions({ storage, autoSaveThrottle: 0 }),
      ui: { layout: { leftAside: { width: 260, defaultOpen: true } }, history: { showRenameControls: true } },
    })
    const runtime = element.getRuntime()
    if (!runtime) throw new Error('Owned Runtime was not created')
    while (runtime.conversations.value.length < seeds.length)
      await new Promise((resolve) => window.setTimeout(resolve, 10))
    const updateHistory = () => {
      element.historyData = groups
        .map((group) => ({
          group,
          items: runtime.conversations.value.filter((item) => (item.metadata?.group ?? '30天内') === group),
        }))
        .filter(({ items }) => items.length > 0)
    }
    updateHistory()
    await runtime.actions.switchConversation(runtime.conversations.value[0].id)
    const timer = window.setInterval(updateHistory, 50)
    return () => {
      window.clearInterval(timer)
      element.remove()
    }
  },
)

export const slotsBasic = defineExample(
  'slots-basic',
  '使用 DOM renderer 复刻原版自定义页头、消息反馈和输入区提示。',
  ['自定义页头', '消息反馈', '输入区提示', 'renderer context'],
  async (host) => {
    host.classList.add('tr-chat-experiment-host--slot')
    const markedAnswers = new Set<string>()
    const answerKey = (messageIndexes: readonly number[]) =>
      `${element.getRuntime()?.activeConversation.value?.id ?? 'none'}:${messageIndexes.join(',')}`

    const renderers: TrChatRenderers = {
      'layout-header': (context, lifecycle) => {
        const header = document.createElement('div')
        header.className = 'tr-chat-experiment-slot-header'
        header.dataset.slotHeader = ''

        const asideToggle = document.createElement('button')
        asideToggle.className = 'chat-experiment-slot-button'
        asideToggle.type = 'button'
        asideToggle.ariaExpanded = String(context.isLeftAsideOpen)
        asideToggle.textContent = context.isLeftAsideOpen ? '收起会话列表' : '展开会话列表'

        const title = document.createElement('strong')
        title.className = 'tr-chat-experiment-slot-title'
        title.textContent = context.title

        const createConversation = document.createElement('button')
        createConversation.className = 'chat-experiment-slot-button'
        createConversation.type = 'button'
        createConversation.textContent = '新建会话'

        asideToggle.addEventListener('click', context.toggleLeftAside)
        createConversation.addEventListener('click', context.createConversation)
        lifecycle.signal.addEventListener(
          'abort',
          () => {
            asideToggle.removeEventListener('click', context.toggleLeftAside)
            createConversation.removeEventListener('click', context.createConversation)
          },
          { once: true },
        )

        header.append(asideToggle, title, createConversation)
        return header
      },
      'bubble-content-footer': (context, lifecycle) => {
        if (context.role !== 'assistant') return null

        const key = answerKey(context.messageIndexes)
        const feedback = document.createElement('button')
        feedback.className = 'chat-experiment-slot-button tr-chat-experiment-slot-feedback'
        feedback.dataset.slotFeedback = ''
        feedback.type = 'button'

        const updateFeedback = () => {
          const marked = markedAnswers.has(key)
          feedback.textContent = marked ? '已标记' : '有帮助'
          feedback.disabled = marked
        }
        const markAnswer = () => {
          markedAnswers.add(key)
          updateFeedback()
        }

        updateFeedback()
        feedback.addEventListener('click', markAnswer)
        lifecycle.signal.addEventListener('abort', () => feedback.removeEventListener('click', markAnswer), {
          once: true,
        })
        return feedback
      },
      'composer-after': () => {
        const tip = document.createElement('p')
        tip.className = 'tr-chat-experiment-slot-tip'
        tip.dataset.slotComposerAfter = ''
        tip.textContent = '内容由 AI 生成，请仔细甄别。'
        return tip
      },
    }

    const element = await mountChat(host, {
      runtimeOptions: createDemoRuntimeOptions({
        modelProviders,
        responseProvider: undefined,
        initialMessages: [
          { role: 'assistant', content: '这个示例通过插槽自定义页头、添加消息按钮，并在输入框下方显示提示。' },
        ],
      }),
      configure(target) {
        target.renderers = renderers
      },
    })
    await element.getRuntime()?.actions.createConversation({ title: '插槽定制' })

    return () => {
      host.classList.remove('tr-chat-experiment-host--slot')
      element.remove()
    }
  },
)

export const rightAsidePanel = defineExample(
  'right-aside-panel',
  '使用 DOM renderer 复刻发布方案预览、引用资料和双向面板切换。',
  ['默认预览', '消息动作', '引用资料', '面板切换', '关闭面板'],
  async (host) => {
    host.classList.add('tr-chat-experiment-host--right-aside')
    const sources = [
      {
        title: '需求文档',
        meta: 'PRD-2026-04',
        summary: '需求范围和验收口径已完成确认。',
      },
      {
        title: '接口说明',
        meta: 'API-RELEASE-07',
        summary: '接口契约稳定，联调结果满足发布前校验要求。',
      },
      {
        title: '回归报告',
        meta: 'QA-2026-04-17',
        summary: '核心流程和兼容性验证通过，暂无阻塞缺陷。',
      },
    ] as const
    let selectedSource = sources[0]
    const openPanel = (panelId: 'preview' | 'sources') => element.openRightAside(panelId)
    const renderers: TrChatRenderers = {
      'bubble-content-footer': (context, lifecycle) => {
        if (context.role !== 'assistant') return null
        const actions = document.createElement('div')
        actions.className = 'right-aside-demo__message-actions'
        const createButton = (label: string, panel: 'preview' | 'sources') => {
          const button = document.createElement('button')
          button.type = 'button'
          button.textContent = label
          const activate = () => openPanel(panel)
          button.addEventListener('click', activate)
          lifecycle.signal.addEventListener('abort', () => button.removeEventListener('click', activate), {
            once: true,
          })
          return button
        }
        actions.append(createButton('查看发布方案', 'preview'), createButton('查看引用资料', 'sources'))
        return actions
      },
      'layout-right-aside-panel': ({ panelId }, lifecycle) => {
        const panel = document.createElement('section')
        panel.className = 'right-aside-demo__panel'
        if (panelId === 'preview') {
          const frame = document.createElement('iframe')
          frame.title = '发布方案网页预览'
          frame.srcdoc = releasePreviewTemplate
            .replace('__SOURCE_TITLE__', selectedSource.title)
            .replace('__SOURCE_META__', selectedSource.meta)
            .replace('__SOURCE_SUMMARY__', selectedSource.summary)
          panel.append(frame)
          return panel
        }
        const intro = document.createElement('p')
        intro.textContent = '点击资料返回发布预览，并查看对应引用信息。'
        panel.append(intro)
        const list = document.createElement('div')
        list.className = 'right-aside-demo__source-list'
        for (const source of sources) {
          const button = document.createElement('button')
          button.type = 'button'
          button.setAttribute('aria-label', source.title)
          button.className = 'right-aside-demo__source-item'
          const title = document.createElement('span')
          title.className = 'right-aside-demo__source-title'
          title.textContent = source.title
          const meta = document.createElement('span')
          meta.className = 'right-aside-demo__source-meta'
          meta.textContent = source.meta
          button.append(title, meta)
          const activate = () => {
            selectedSource = source
            openPanel('preview')
          }
          button.addEventListener('click', activate)
          lifecycle.signal.addEventListener('abort', () => button.removeEventListener('click', activate), {
            once: true,
          })
          list.append(button)
        }
        panel.append(list)
        return panel
      },
    }
    const element = await mountChat(host, {
      runtimeOptions: createDemoRuntimeOptions({
        initialMessages: [{ role: 'assistant', content: '发布方案已整理完成。你可以打开右侧预览，或查看引用资料。' }],
      }),
      ui: {
        layout: {
          rightAside: {
            width: 344,
            resizable: true,
            minWidth: 300,
            maxWidth: 480,
            panels: [
              { id: 'preview', title: '发布方案预览' },
              { id: 'sources', title: '引用资料' },
            ],
          },
        },
      },
      configure(target) {
        target.rightAsideOpen = true
        target.activeRightAsidePanelId = 'preview'
        target.renderers = renderers
        target.addEventListener('right-aside-open-update', (event) => {
          target.rightAsideOpen = (event as CustomEvent<boolean>).detail
        })
        target.addEventListener('active-right-aside-panel-id-update', (event) => {
          target.activeRightAsidePanelId = (event as CustomEvent<string | undefined>).detail
        })
      },
    })
    await element.getRuntime()?.actions.createConversation({ title: '发布方案协作' })
    return () => element.remove()
  },
)

export const floatingLayout = defineExample(
  'floating-layout',
  '按需打开浮动 surface，并验证受控 floatingState 更新事件。',
  ['打开/关闭', '浮动布局', '拖动状态', '尺寸状态'],
  async (host) => {
    const controls = addControls(host)
    const log = addLog(host)
    const status = document.createElement('p')
    status.className = 'tr-chat-experiment-status chat-floating-demo__state'
    status.setAttribute('role', 'status')
    let floatingState: LayoutFloatingState = {
      placement: 'top-right',
      offsetX: 24,
      offsetY: 72,
      width: 520,
      height: 520,
    }
    let element: Awaited<ReturnType<typeof mountChatUI>> | undefined
    let requestId = 0
    const renderStatus = () => {
      status.textContent = `当前状态：${floatingState.placement} · x ${floatingState.offsetX}px · y ${floatingState.offsetY}px · ${floatingState.width} × ${floatingState.height}px`
    }
    renderStatus()
    host.insertBefore(status, log.parentElement === host ? log : null)

    const closeFloating = () => {
      requestId += 1
      element?.remove()
      element = undefined
      openButton.disabled = false
      closeButton.disabled = true
      log('浮动聊天已关闭')
    }

    const renderers: TrChatRenderers = {
      'layout-header': ({ title }, lifecycle) => {
        const header = document.createElement('div')
        header.className = 'chat-floating-demo__header'
        const heading = document.createElement('strong')
        heading.textContent = title
        const close = document.createElement('button')
        close.type = 'button'
        close.setAttribute('aria-label', '关闭浮动聊天')
        close.textContent = '关闭'
        close.addEventListener('click', closeFloating)
        lifecycle.signal.addEventListener('abort', () => close.removeEventListener('click', closeFloating), {
          once: true,
        })
        header.append(heading, close)
        return header
      },
    }

    const openButton = addButton(controls, '打开浮动聊天', async () => {
      const currentRequest = ++requestId
      openButton.disabled = true
      closeButton.disabled = false
      element?.remove()
      element = undefined
      const mounted = await mountChatUI(host, {
        data: {
          conversation: { activeId: 'floating', title: '浮动助手' },
          bubble: { messages: [{ role: 'assistant', content: '拖动顶部把手或窗口边缘，外部状态会同步更新。' }] },
          sender: { submitDisabled: true },
        },
        ui: {
          layout: {
            surface: {
              mode: 'floating',
              floatingOptions: {
                draggable: true,
                resizable: true,
                minWidth: 360,
                maxWidth: 760,
                minHeight: 420,
                maxHeight: 720,
              },
            },
            leftAside: false,
          },
        },
        configure(target) {
          target.floatingState = floatingState
          target.renderers = renderers
          target.addEventListener('floating-state-update', (event) => {
            floatingState = (event as CustomEvent<LayoutFloatingState>).detail
            target.floatingState = floatingState
            renderStatus()
            log('floating-state-update')
          })
        },
      })

      if (currentRequest !== requestId) {
        mounted.remove()
        return
      }

      element = mounted
      element.classList.add('chat-floating-window')
      log('浮动聊天已打开')
    })
    const closeButton = addButton(controls, '关闭浮动聊天', closeFloating)
    closeButton.disabled = true

    return () => {
      requestId += 1
      element?.remove()
    }
  },
)

export const responsiveLayout = defineExample(
  'responsive-layout',
  '复刻桌面 Dock 与移动端 Drawer 两种容器模式。',
  ['桌面 Dock', '移动端 Drawer', '宽度切换', '侧栏模式'],
  async (host) => {
    host.classList.add('tr-chat-experiment-host--responsive')
    const controls = addControls(host)
    const tip = document.createElement('p')
    tip.className = 'tr-chat-experiment-status'
    tip.textContent = '桌面布局支持调整侧栏宽度；抽屉布局覆盖内容且不支持调整宽度。'
    host.append(tip)
    const data: ChatUIData = {
      conversation: {
        items: [
          { id: 'mobile', title: '移动端适配' },
          { id: 'desktop', title: '桌面端布局' },
        ],
        activeId: 'mobile',
        title: '响应式布局',
      },
      bubble: {
        messages: [
          { role: 'user', content: '窄视口下会话列表如何展示？' },
          { role: 'assistant', content: '侧栏应使用抽屉覆盖内容，并通过页头按钮打开或关闭。' },
        ],
      },
      sender: { submitDisabled: true },
    }
    let mode: 'dock' | 'drawer' = 'dock'
    let element: Awaited<ReturnType<typeof mountChatUI>> | undefined
    const mountMode = async (nextMode: 'dock' | 'drawer') => {
      mode = nextMode
      host.style.maxWidth = mode === 'dock' ? '760px' : '390px'
      dockButton.ariaPressed = String(mode === 'dock')
      drawerButton.ariaPressed = String(mode === 'drawer')
      element?.remove()
      element = await mountChatUI(host, {
        data,
        ui: {
          layout: {
            contentMaxWidth: mode === 'drawer' ? 360 : 720,
            leftAside: {
              mode,
              defaultOpen: mode === 'dock',
              resizable: mode === 'dock',
              minWidth: 240,
              maxWidth: 420,
            },
            rightAside: false,
          },
        },
      })
    }
    const dockButton = addButton(controls, '桌面 Dock', () => mountMode('dock'))
    const drawerButton = addButton(controls, '移动端 Drawer', () => mountMode('drawer'))
    await mountMode('dock')
    return () => element?.remove()
  },
)

export const controlledUI = defineExample(
  'controlled-ui',
  '使用 DOM 属性和事件复刻受控输入、提交、取消与恢复。',
  ['inputValue', 'submit', 'cancel', '消息与 loading 回写'],
  async (host) => {
    const controls = addControls(host)
    const log = addLog(host)
    let inputValue = '受控输入值'
    let messages: NonNullable<ChatUIData['bubble']>['messages'] = []
    let sending = false
    let replyTimer: ReturnType<typeof setTimeout> | undefined

    const data = (): ChatUIData => ({
      conversation: { activeId: 'controlled-demo', title: '应用助手' },
      bubble: { messages },
      sender: { loading: sending },
    })

    const element = await mountChatUI(host, {
      inputValue,
      data: data(),
      ui: { layout: { leftAside: false, rightAside: false } },
      configure(target) {
        target.addEventListener('input-value-update', (event) => {
          inputValue = (event as CustomEvent<string>).detail
          target.inputValue = inputValue
          log(`input-value-update: ${inputValue}`)
        })
        target.addEventListener('submit', (event) => {
          const payload = (event as CustomEvent<{ text: string }>).detail
          if (!payload.text.trim() || sending) return

          sending = true
          messages = [...messages, { role: 'user', content: payload.text }]
          inputValue = ''
          target.inputValue = inputValue
          target.data = data()
          log(`submit: ${payload.text}`)
          replyTimer = setTimeout(() => {
            messages = [...messages, { role: 'assistant', content: `已收到：${payload.text}` }]
            sending = false
            replyTimer = undefined
            target.data = data()
            log('reply: 已完成')
          }, 1500)
        })
        target.addEventListener('cancel', () => {
          clearTimeout(replyTimer)
          replyTimer = undefined
          sending = false
          target.data = data()
          log('cancel: 已停止')
        })
      },
    })
    addButton(controls, '外部更新', () => (element.inputValue = '由宿主更新的值'))
    return () => {
      clearTimeout(replyTimer)
      element.remove()
    }
  },
)

export const runtimeActions = defineExample(
  'runtime-actions',
  '使用 owned Runtime 复刻发送、流式状态、停止与恢复。',
  ['ready', 'send', 'streaming', 'abort', '恢复'],
  async (host) => {
    const controls = addControls(host)
    const status = document.createElement('p')
    status.className = 'tr-chat-experiment-status'
    status.setAttribute('role', 'status')
    status.textContent = '正在初始化'
    host.append(status)
    let ready = false
    let pending = false
    let actionError = ''
    const runtimeOptions = createDemoRuntimeOptions({
      responseProvider: mockStreamingResponseProvider,
      autoSaveThrottle: 0,
      onLoad: () => {
        ready = true
      },
    })
    const element = await mountChat(host, {
      runtimeOptions,
      ui: { layout: { leftAside: false, rightAside: false }, welcome: false, prompts: false, model: false },
    })
    const sendButton = addButton(controls, '发送预设问题', async () => {
      if (!ready || pending || element.getRuntime()?.activeConversation.value?.requestState === 'processing') return
      pending = true
      actionError = ''
      try {
        await element.send({ text: '介绍一下这个项目' })
      } catch (error) {
        actionError = `发送失败：${error instanceof Error ? error.message : String(error)}`
      } finally {
        pending = false
      }
    })
    const stopButton = addButton(controls, '停止回答', async () => {
      actionError = ''
      try {
        await element.getRuntime()?.actions.abort?.()
        host.dataset.abortStatus = 'complete'
      } catch (error) {
        actionError = `停止失败：${error instanceof Error ? error.message : String(error)}`
      }
    })
    const updateStatus = () => {
      const requestState = element.getRuntime()?.activeConversation.value?.requestState
      const processing = requestState === 'processing'
      sendButton.disabled = !ready || pending || processing
      stopButton.disabled = !processing
      status.setAttribute('role', actionError ? 'alert' : 'status')
      status.textContent =
        actionError ||
        ({ processing: '正在生成', completed: '已完成', aborted: '已停止', error: '请求失败' }[requestState ?? ''] ??
          '等待发送')
    }
    const statusTimer = window.setInterval(updateStatus, 25)
    updateStatus()
    return () => {
      window.clearInterval(statusTimer)
      element.remove()
    }
  },
)

export const runtimeBeforeSend = defineExample(
  'runtime-before-send',
  '复刻真实 Sender 提交时的登录拦截、输入保留与继续发送。',
  ['真实输入', 'reject', '输入保留', 'continue', '模型回答'],
  async (host) => {
    const controls = addControls(host)
    let loggedIn = false
    const label = document.createElement('label')
    label.className = 'tr-chat-experiment-label'
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.addEventListener('change', () => (loggedIn = checkbox.checked))
    label.append(checkbox, ' 已登录（模拟）')
    controls.append(label)
    const status = document.createElement('p')
    status.className = 'tr-chat-experiment-status'
    status.setAttribute('role', 'status')
    status.textContent = '先输入问题并发送，再勾选“已登录”重试。'
    host.append(status)
    const runtimeOptions = createDemoRuntimeOptions({
      beforeSend() {
        if (!loggedIn) {
          status.textContent = '检查返回 reject：请先登录；输入保留，不追加消息。'
          return 'reject'
        }
        status.textContent = '检查返回 continue：允许发送。'
        return 'continue'
      },
    })
    const element = await mountChat(host, {
      runtimeOptions,
      ui: {
        layout: { leftAside: false, rightAside: false },
        welcome: false,
        prompts: false,
        model: false,
      },
      configure(target) {
        target.addEventListener('runtime-action-error', (event) => {
          const error = (event as CustomEvent<{ error: unknown }>).detail.error
          status.textContent = `操作失败：${error instanceof Error ? error.message : String(error)}`
        })
      },
    })
    return () => element.remove()
  },
)

export const runtimeComposer = defineExample(
  'runtime-composer',
  '复刻原版 Composer 状态、说明文案和 composer-before 预设输入。',
  ['正常', 'disabled', 'submitDisabled', 'composer-before Renderer', '预设输入'],
  async (host) => {
    const controls = addControls(host)
    const status = document.createElement('p')
    status.className = 'tr-chat-experiment-status'
    status.setAttribute('role', 'status')
    host.append(status)
    const runtimeLifecycle = createChatRuntime(createDemoRuntimeOptions())
    const baseRuntime = runtimeLifecycle.runtime
    const disabledRef = shallowRef(false)
    const submitDisabledRef = shallowRef(false)
    const runtime = {
      ...baseRuntime,
      composer: { ...baseRuntime.composer, disabled: disabledRef, submitDisabled: submitDisabledRef },
      actions: {
        ...baseRuntime.actions,
        send: (payload: Parameters<typeof baseRuntime.actions.send>[0]) => {
          if (disabledRef.value || submitDisabledRef.value) return Promise.resolve(false)
          return baseRuntime.actions.send(payload)
        },
      },
    }
    let setComposerInput: ((value: string) => void) | undefined
    let processing = false

    const presetButton = addButton(controls, '填入预设问题', () => setComposerInput?.('介绍一下这个项目'))
    const modeInputs: HTMLInputElement[] = []
    const setMode = (mode: 'normal' | 'disabled' | 'submit-disabled') => {
      disabledRef.value = mode === 'disabled'
      submitDisabledRef.value = mode === 'submit-disabled'
      updateStatus()
    }
    const addMode = (labelText: string, value: 'normal' | 'disabled' | 'submit-disabled', checked = false) => {
      const label = document.createElement('label')
      label.className = 'tr-chat-experiment-label'
      const input = document.createElement('input')
      input.type = 'radio'
      input.name = 'web-component-runtime-composer-mode'
      input.value = value
      input.checked = checked
      input.addEventListener('change', () => {
        if (input.checked) setMode(value)
      })
      modeInputs.push(input)
      label.append(input, ` ${labelText}`)
      controls.append(label)
    }
    addMode('正常', 'normal', true)
    addMode('禁用输入区', 'disabled')
    addMode('仅禁用提交', 'submit-disabled')

    function updateStatus() {
      const disabled = disabledRef.value
      const submitDisabled = submitDisabledRef.value
      const description = disabled
        ? '无法编辑或发送。'
        : submitDisabled
          ? '可以编辑和清空，但不能发送。'
          : processing
            ? '正在生成回答，可点击停止按钮取消。'
            : '可以编辑，内容非空时可发送。'
      status.textContent = `composer: { disabled: ${disabled}, submitDisabled: ${submitDisabled} } — ${description}`
      presetButton.disabled = disabled || processing
      for (const input of modeInputs) input.disabled = processing
    }

    const renderers: TrChatRenderers = {
      'composer-before': ({ disabled, loading, setInputValue }) => {
        setComposerInput = setInputValue
        presetButton.disabled = disabled || loading
        return document.createComment('composer-before controls are rendered above the chat')
      },
    }
    const element = await mountChat(host, {
      runtime,
      ui: {
        layout: { leftAside: false, rightAside: false },
        header: false,
        welcome: false,
        prompts: false,
        model: false,
      },
      configure(target) {
        target.renderers = renderers
      },
    })
    const handleStateChange = (event: Event) => {
      const snapshot = (event as CustomEvent<TrChatRuntimeSnapshot>).detail
      processing = snapshot.activeConversation?.requestState === 'processing'
      updateStatus()
    }
    element.addEventListener('runtime-state-change', handleStateChange)
    updateStatus()
    return () => {
      element.removeEventListener('runtime-state-change', handleStateChange)
      element.remove()
      void runtimeLifecycle.dispose()
    }
  },
)

export const runtimeConversations = defineExample(
  'runtime-conversations',
  '使用 owned Runtime 复刻历史加载、创建会话和双向切换。',
  ['历史加载', '创建会话', '列表更新', '激活切换'],
  async (host) => {
    const controls = addControls(host)
    const label = document.createElement('label')
    label.className = 'tr-chat-experiment-label'
    label.htmlFor = 'web-component-conversation-title'
    label.textContent = '会话标题'
    const input = document.createElement('input')
    input.id = 'web-component-conversation-title'
    input.className = 'tr-chat-experiment-input'
    input.value = '项目问答'
    label.append(input)
    controls.append(label)
    const storage = createMockConversationStorage([
      {
        title: '项目介绍',
        messages: [
          { role: 'user', content: '这个项目提供什么功能？' },
          { role: 'assistant', content: '这里展示项目问答。切换到“使用帮助”，可查看另一组历史消息。' },
        ],
      },
      {
        title: '使用帮助',
        messages: [
          { role: 'user', content: '如何管理历史会话？' },
          { role: 'assistant', content: '点击左侧会话名称切换，通过会话菜单重命名或删除。' },
        ],
      },
    ])
    const element = await mountChat(host, {
      runtimeOptions: createDemoRuntimeOptions({ storage, autoSaveThrottle: 0 }),
      ui: {
        layout: { leftAside: { width: 240, defaultOpen: true }, rightAside: false },
        history: { showRenameControls: true },
        welcome: false,
        prompts: false,
        model: false,
      },
    })
    const runtime = element.getRuntime()
    if (!runtime) throw new Error('Owned Runtime was not created')
    while (!runtime.conversations.value.length) await new Promise((resolve) => window.setTimeout(resolve, 10))
    await runtime.actions.switchConversation(runtime.conversations.value[0].id)

    const createButton = addButton(controls, '立即创建会话', async () => {
      await runtime.actions.createConversation({ title: input.value.trim() || '新对话' })
    })
    const stateTimer = window.setInterval(() => {
      const processing = runtime.activeConversation.value?.requestState === 'processing'
      input.disabled = processing
      createButton.disabled = processing
    }, 25)
    return () => {
      window.clearInterval(stateTimer)
      element.remove()
    }
  },
)

export const runtimeSend = defineExample(
  'runtime-send',
  '通过元素 send() 复刻默认与自定义 Runtime 的空文本语义。',
  ['默认 send 返回 false', '自定义 send 接收空文本', '自定义 send 返回 true'],
  async (host) => {
    host.classList.add('runtime-send-demo')
    const hiddenElements = document.createElement('div')
    hiddenElements.hidden = true
    host.append(hiddenElements)
    const defaultLifecycle = createChatRuntime(createDemoRuntimeOptions())
    const defaultElement = await mountChat(hiddenElements, { runtime: defaultLifecycle.runtime })
    let customResult = '尚未发送'
    const customRuntime = createStaticRuntime()
    customRuntime.actions.send = async ({ text }) => {
      customResult = `自定义 send 收到 text: ${JSON.stringify(text)}`
      return true
    }
    const customElement = await mountChat(hiddenElements, { runtime: customRuntime })

    const addSendCard = (title: string, onSend: () => Promise<string>) => {
      const item = document.createElement('section')
      item.className = 'runtime-send-demo__item'
      const heading = document.createElement('h3')
      heading.textContent = title
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'runtime-send-demo__button'
      button.textContent = '发送空文本'
      const result = document.createElement('p')
      result.setAttribute('aria-live', 'polite')
      result.textContent = '结果：尚未发送'
      button.addEventListener('click', async () => {
        result.textContent = `结果：${await onSend()}`
      })
      item.append(heading, button, result)
      host.insertBefore(item, hiddenElements)
    }
    addSendCard('默认发送', async () => String(await defaultElement.send({ text: '' })))
    addSendCard('自定义 send', async () => {
      const sent = await customElement.send({ text: '' })
      return `${customResult}，结果: ${sent}`
    })
    return () => {
      defaultElement.remove()
      customElement.remove()
      void defaultLifecycle.dispose()
    }
  },
)

export const runtimeAdapter = defineExample(
  'runtime-adapter',
  '将真实 Runtime Adapter 的响应式数据和动作绑定到 TrChatUI DOM 协议。',
  ['Adapter data', '受控输入', 'submit', '消息生命周期', '动作错误'],
  async (host) => {
    const status = document.createElement('p')
    status.className = 'tr-chat-experiment-status'
    status.setAttribute('aria-live', 'polite')
    status.textContent = '动作状态：正常'
    host.append(status)
    const responseProvider: ResponseProvider = async (requestBody: MessageRequestBody) => {
      const text = String(requestBody.messages.filter((message) => message.role === 'user').at(-1)?.content ?? '')
      return {
        id: 'runtime-adapter-web-component',
        object: 'chat.completion',
        created: 0,
        model: 'local-demo',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: `Runtime 已收到：${text}` },
            delta: undefined,
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
      }
    }
    const runtimeLifecycle = createChatRuntime(createDemoRuntimeOptions({ responseProvider, autoSaveThrottle: 0 }))
    const scope = effectScope()
    const adapter = scope.run(() =>
      useChatRuntimeAdapter({
        runtime: runtimeLifecycle.runtime,
        onActionError({ action }) {
          status.textContent = `动作失败：${action}`
        },
      }),
    )
    if (!adapter) throw new Error('Failed to create Runtime adapter')
    const element = await mountChatUI(host, {
      data: adapter.data.value,
      inputValue: adapter.inputValue.value,
      configure(target) {
        target.addEventListener('input-value-update', (event) => {
          adapter.setInputValue((event as CustomEvent<string>).detail)
        })
        target.addEventListener('submit', (event) => {
          void adapter.send((event as CustomEvent<{ text: string }>).detail)
        })
        target.addEventListener('cancel', () => void adapter.abort())
        target.addEventListener('clear', () => adapter.setInputValue(''))
        target.addEventListener('create-conversation', () => void adapter.clearActiveConversation())
        target.addEventListener('switch-conversation', (event) => {
          void adapter.switchConversation((event as CustomEvent<{ conversationId: string }>).detail.conversationId)
        })
        target.addEventListener('rename-conversation', (event) => {
          const { conversationId, title } = (event as CustomEvent<{ conversationId: string; title: string }>).detail
          void adapter.renameConversation(conversationId, title)
        })
        target.addEventListener('history-action', (event) => {
          const detail = (event as CustomEvent<{ action: { id: string }; conversation: { id: string } }>).detail
          if (detail.action.id === 'delete' && !event.defaultPrevented)
            void adapter.deleteConversation(detail.conversation.id)
        })
      },
    })
    scope.run(() => {
      watch(adapter.data, (data) => (element.data = data), { immediate: true })
      watch(adapter.inputValue, (inputValue) => (element.inputValue = inputValue), { immediate: true })
    })
    return () => {
      scope.stop()
      element.remove()
      void runtimeLifecycle.dispose()
    }
  },
)

export const runtimeSubscription = defineExample(
  'runtime-subscription',
  '通过 runtime-state-change 和 snapshot 同步外部状态，不读取 Vue ref 或轮询。',
  ['初始 snapshot', 'processing', 'abort', 'completed'],
  async (host) => {
    const controls = addControls(host)
    const log = addLog(host)
    const status = document.createElement('p')
    status.className = 'tr-chat-experiment-status'
    status.setAttribute('role', 'status')
    status.textContent = '等待 Runtime'
    host.append(status)
    const stateLabel = (state?: string) =>
      ({ processing: '生成中', completed: '已完成', aborted: '已停止', error: '失败' })[state ?? ''] ?? '空闲'
    const sendButton = addButton(controls, '发送预设问题', () => element.send({ text: '订阅状态验证' }))
    const stopButton = addButton(controls, '停止回答', () => element.getRuntime()?.actions.abort?.())
    const element = await mountChat(host, {
      runtimeOptions: createDemoRuntimeOptions({ responseProvider: mockStreamingResponseProvider }),
      ui: { layout: { leftAside: false, rightAside: false }, welcome: false, prompts: false, model: false },
      configure(target) {
        target.addEventListener('runtime-state-change', (event) => {
          const snapshot = (event as CustomEvent<TrChatRuntimeSnapshot>).detail
          const state = snapshot.activeConversation?.requestState
          status.textContent = `${stateLabel(state)} · ${snapshot.conversations.length} 个会话`
          sendButton.disabled = state === 'processing'
          stopButton.disabled = state !== 'processing'
          log(`runtime-state-change: ${state ?? 'empty'}`)
        })
      },
    })
    const snapshot = element.getRuntimeSnapshot()
    if (snapshot) {
      status.textContent = `${stateLabel(snapshot.activeConversation?.requestState)} · ${snapshot.conversations.length} 个会话`
    }
    stopButton.disabled = true
    return () => element.remove()
  },
)

export const complexProperties = defineExample(
  'complex-properties',
  '明确 data、ui、renderers 与 bubbleRenderers 采用整体重新赋值契约。',
  ['嵌套 mutation 不生效', '整体替换', 'Renderer 替换', '恢复'],
  async (host) => {
    const controls = addControls(host)
    const log = addLog(host)
    const initialData: ChatUIData = {
      conversation: { activeId: 'v1', title: '属性版本一' },
      bubble: { messages: [{ role: 'assistant', content: '属性版本一' }] },
      sender: { loading: false },
    }
    let currentData = initialData
    const initialUI: ChatUIOptions = { layout: { leftAside: false, rightAside: false }, welcome: false }
    const element = await mountChatUI(host, { data: currentData, ui: initialUI })

    addButton(controls, '嵌套修改', () => {
      ;(currentData.conversation as { title?: string }).title = '嵌套修改不应显示'
      log('嵌套修改未触发渲染（符合契约）')
    })
    addButton(controls, '整体替换', () => {
      currentData = {
        conversation: { activeId: 'v2', title: '属性版本二' },
        bubble: { messages: [{ role: 'assistant', content: [{ type: 'property-card', text: '结构化卡片 v2' }] }] },
        sender: { loading: false },
      }
      element.data = currentData
      element.ui = { layout: { leftAside: false, rightAside: false, contentMaxWidth: 680 }, welcome: false }
      element.renderers = {
        'layout-header': () => {
          const header = document.createElement('div')
          header.className = 'complex-properties-demo__header'
          const rendererLabel = document.createElement('strong')
          rendererLabel.textContent = 'DOM Header v2'
          const title = document.createElement('span')
          title.textContent = '属性版本二'
          header.append(rendererLabel, title)
          return header
        },
      }
      element.bubbleRenderers = {
        contentRendererMatches: [
          {
            find: (_message, content) => content.type === 'property-card',
            renderer: (context) => {
              const card = document.createElement('article')
              card.className = 'complex-properties-demo__card'
              card.textContent = String(context.content.text)
              return card
            },
          },
        ],
      }
      log('整体重新赋值已应用')
    })
    addButton(controls, '恢复初始', () => {
      currentData = {
        ...initialData,
        conversation: { ...initialData.conversation, title: '属性版本一' },
      }
      element.data = currentData
      element.ui = initialUI
      element.renderers = undefined
      element.bubbleRenderers = undefined
      log('已恢复初始 property')
    })
    return () => element.remove()
  },
)

export const runtimeOwnership = defineExample(
  'runtime-ownership',
  '验证 owned/injected Runtime 替换、释放、重连和 storage namespace。',
  ['owned dispose', 'injected survives', 'remove/reinsert', 'storage isolation'],
  async (host) => {
    const controls = addControls(host)
    const log = addLog(host)
    const status = document.createElement('p')
    status.className = 'tr-chat-experiment-status'
    status.setAttribute('role', 'status')
    host.append(status)
    let mode = 'owned-a'
    let ownedASignal: AbortSignal | undefined
    const completion = (content: string) => ({
      id: `ownership-${content}`,
      object: 'chat.completion' as const,
      created: 1,
      model: 'mock',
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          message: { role: 'assistant' as const, content },
          delta: undefined,
          logprobs: null,
          finish_reason: 'stop' as const,
        },
      ],
    })
    const ownedAOptions = createDemoRuntimeOptions({
      responseProvider: async (_request, signal) => {
        ownedASignal = signal
        await new Promise<void>((resolve) => signal.addEventListener('abort', () => resolve(), { once: true }))
        return completion('Owned Runtime A 已停止')
      },
    })
    const ownedBOptions = createDemoRuntimeOptions({
      responseProvider: async () => completion('Owned Runtime B 已收到'),
    })
    const injectedHandle = createChatRuntime(
      createDemoRuntimeOptions({
        responseProvider: async (request) =>
          completion(`Injected Runtime 已收到：${String(request.messages.at(-1)?.content ?? '')}`),
      }),
    )
    const element = await mountChat(host, {
      runtimeOptions: ownedAOptions,
      ui: { layout: { leftAside: false, rightAside: false }, welcome: false, prompts: false, model: false },
      configure(target) {
        target.addEventListener('runtime-state-change', (event) => {
          const state = (event as CustomEvent<TrChatRuntimeSnapshot>).detail.activeConversation?.requestState ?? 'idle'
          status.textContent = `${mode} · ${state}`
        })
      },
    })
    status.textContent = 'owned-a · idle'

    addButton(controls, '启动长请求', () => element.send({ text: '长请求' }))
    addButton(controls, '切换 owned-b', async () => {
      mode = 'owned-b'
      element.runtimeOptions = ownedBOptions
      while (!ownedASignal?.aborted) await new Promise((resolve) => window.setTimeout(resolve, 0))
      log(`owned-a disposed: ${ownedASignal.aborted}`)
    })
    addButton(controls, '注入 Runtime', () => {
      mode = 'injected'
      element.runtime = injectedHandle.runtime
      status.textContent = 'injected · idle'
    })
    addButton(controls, '发送到当前 Runtime', () => element.send({ text: '所有权验证' }))
    addButton(controls, '移除并恢复', async () => {
      element.remove()
      host.append(element)
      await new Promise((resolve) => window.setTimeout(resolve, 0))
      const survives = await injectedHandle.runtime.actions.send({ text: '重连验证' })
      log(`injected survives: ${survives}`)
    })
    addButton(controls, '验证多实例存储', async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const first = createChatRuntime({
        storageKey: `ownership-a-${suffix}`,
        responseProvider: async () => completion('A'),
      })
      const second = createChatRuntime({
        storageKey: `ownership-b-${suffix}`,
        responseProvider: async () => completion('B'),
      })
      await first.runtime.actions.send({ text: 'only-a' })
      const isolated = first.runtime.conversations.value.length === 1 && second.runtime.conversations.value.length === 0
      await Promise.all([first.dispose(), second.dispose()])
      log(`storage isolated: ${isolated}`)
    })
    return () => {
      element.remove()
      void injectedHandle.dispose()
    }
  },
)

export const examplesById = {
  basic,
  'layout-presets': layoutPresets,
  'welcome-prompts': welcomePrompts,
  'sender-options': senderOptions,
  'sender-toolbar': senderToolbar,
  'extension-tabs': extensionTabs,
  'bubble-options': bubbleOptions,
  'runtime-error': runtimeError,
  'history-groups': historyGroups,
  'slots-basic': slotsBasic,
  'right-aside-panel': rightAsidePanel,
  'floating-layout': floatingLayout,
  'responsive-layout': responsiveLayout,
  'controlled-ui': controlledUI,
  'runtime-actions': runtimeActions,
  'runtime-before-send': runtimeBeforeSend,
  'runtime-composer': runtimeComposer,
  'runtime-conversations': runtimeConversations,
  'runtime-send': runtimeSend,
  'runtime-adapter': runtimeAdapter,
  'runtime-subscription': runtimeSubscription,
  'complex-properties': complexProperties,
  'runtime-ownership': runtimeOwnership,
  'event-contract': eventContract,
  'initialization-timing': initializationTiming,
  'performance-stress': performanceStress,
  'ssr-safe-import': ssrSafeImport,
  'unified-error-contract': unifiedErrorContract,
  'bundle-budget': bundleBudget,
} satisfies Record<string, ExperimentalExampleModule>

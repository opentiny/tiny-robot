import type { ChatRuntime, ChatUIData, ChatUIOptions } from '@opentiny/tiny-robot-chat'
import type { TrChatRenderers } from '@opentiny/tiny-robot-chat/experimental'
import { createDemoRuntimeOptions } from './createRuntime'
import {
  addButton,
  addControls,
  addLog,
  createStaticRuntime,
  emptyData,
  messageData,
  mountChat,
  mountChatUI,
} from './mount'
import type { ExperimentalExampleModule } from './types'

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
  '使用 owned Runtime 完成最小聊天接入。',
  ['渲染', '输入', '发送'],
  async (host) => {
    const element = await mountChat(host, { ui: { layout: { leftAside: false } } })
    return () => element.remove()
  },
)

export const layoutPresets = defineExample(
  'layout-presets',
  '通过属性重赋值切换标准、紧凑和无侧栏布局。',
  ['属性更新', '左侧栏', '内容宽度'],
  async (host) => {
    const controls = addControls(host)
    const element = await mountChatUI(host)
    const presets: Record<string, ChatUIOptions> = {
      标准: { layout: { contentMaxWidth: 980, leftAside: { defaultOpen: true } } },
      紧凑: { layout: { contentMaxWidth: 620, leftAside: { width: 220, defaultOpen: true } } },
      无侧栏: { layout: { contentMaxWidth: 720, leftAside: false } },
    }
    for (const [label, ui] of Object.entries(presets)) addButton(controls, label, () => (element.ui = ui))
    element.ui = presets['标准']
    return () => element.remove()
  },
)

export const welcomePrompts = defineExample(
  'welcome-prompts',
  '欢迎信息、推荐问题和 prompt-click DOM 事件。',
  ['推荐问题', '事件 detail', '受控输入'],
  async (host) => {
    const log = addLog(host)
    const element = await mountChatUI(host, {
      inputValue: '',
      ui: {
        layout: { leftAside: false },
        welcome: { title: 'Web Component 助手', description: '请选择一个推荐问题。' },
        prompts: { wrap: true, items: [{ label: '验证事件' }, { label: '验证属性更新' }] },
      },
      configure(target) {
        target.addEventListener('prompt-click', (event) => {
          const detail = (event as CustomEvent<{ item: { label: string } }>).detail
          target.inputValue = detail.item.label
          log(`prompt-click: ${detail.item.label}`)
        })
        target.addEventListener('input-value-update', (event) => {
          target.inputValue = (event as CustomEvent<string>).detail
        })
      },
    })
    return () => element.remove()
  },
)

export const senderOptions = defineExample(
  'sender-options',
  '验证 defaultInputValue 与 Sender 常用配置。',
  ['默认输入', '字数限制', '清空'],
  async (host) => {
    const element = await mountChatUI(host, {
      defaultInputValue: '可编辑的默认问题',
      ui: {
        layout: { leftAside: false },
        welcome: false,
        sender: { maxLength: 80, showWordLimit: true, clearable: true },
      },
    })
    return () => element.remove()
  },
)

export const bubbleOptions = defineExample(
  'bubble-options',
  '复用 TrChatUI 的消息气泡渲染与事件路径。',
  ['消息渲染', '角色布局', '气泡事件'],
  async (host) => {
    const element = await mountChatUI(host, {
      data: messageData('气泡配置'),
      ui: { layout: { leftAside: false }, welcome: false, sender: false, bubble: { autoScroll: false } },
    })
    return () => element.remove()
  },
)

export const runtimeError = defineExample(
  'runtime-error',
  '区分 runtime-action-error 与 experimental-error，并可替换 Runtime 恢复。',
  ['错误事件', 'Runtime 替换', '恢复发送'],
  async (host) => {
    const controls = addControls(host)
    const log = addLog(host)
    const failing = createStaticRuntime({
      actions: {
        ...createStaticRuntime().actions,
        send: async () => {
          throw new Error('模拟 Runtime 失败')
        },
      },
    })
    const element = await mountChat(host, {
      runtime: failing,
      ui: { layout: { leftAside: false } },
      configure(target) {
        target.addEventListener('runtime-action-error', (event) => {
          log(`runtime-action-error: ${String((event as CustomEvent<{ error: Error }>).detail.error.message)}`)
        })
      },
    })
    addButton(controls, '触发失败', async () => void (await element.send({ text: '失败' })))
    addButton(controls, '恢复 Runtime', () => {
      element.runtime = createStaticRuntime()
      log('Runtime 已恢复')
    })
    return () => element.remove()
  },
)

export const historyGroups = defineExample(
  'history-groups',
  '展示业务传入的分组历史数据。',
  ['历史分组', '会话项', '侧栏'],
  async (host) => {
    const data: ChatUIData = {
      conversation: {
        title: '今天的会话',
        activeId: 'today-1',
        items: [{ id: 'today-1', title: '今天的会话' }],
        history: [
          { group: '今天', items: [{ id: 'today-1', title: '今天的会话' }] },
          { group: '更早', items: [{ id: 'old-1', title: '旧会话' }] },
        ],
      },
      bubble: { messages: [] },
    }
    const element = await mountChatUI(host, { data, ui: { layout: { leftAside: { defaultOpen: true } } } })
    return () => element.remove()
  },
)

export const slotsBasic = defineExample(
  'slots-basic',
  '静态内容使用命名 slot；带上下文内容使用 DOM renderer。',
  ['Light DOM slot', 'renderer context', 'AbortSignal'],
  async (host) => {
    const element = document.createElement('tr-chat-ui') as Awaited<ReturnType<typeof mountChatUI>>
    const notice = document.createElement('span')
    notice.slot = 'header-notice'
    notice.textContent = '原生 Light DOM notice slot'
    element.append(notice)
    const renderers: TrChatRenderers = {
      'layout-main': (context) => {
        const output = document.createElement('div')
        output.dataset.rendererOutput = ''
        output.textContent = `DOM renderer：${context.conversation.title}`
        return output
      },
    }
    element.renderers = renderers
    element.data = messageData('Slot 示例')
    element.ui = { layout: { leftAside: false }, sender: false }
    host.append(element)
    await customElements.whenDefined('tr-chat-ui')
    return () => element.remove()
  },
)

export const rightAsidePanel = defineExample(
  'right-aside-panel',
  '通过公开方法控制 renderer 驱动的右侧业务面板。',
  ['打开面板', '关闭面板', '激活面板'],
  async (host) => {
    const controls = addControls(host)
    const element = await mountChatUI(host, {
      data: messageData('右侧面板'),
      ui: { layout: { leftAside: false, rightAside: { panels: [{ id: 'details', title: '详情' }] } }, sender: false },
      configure(target) {
        target.renderers = { 'layout-right-aside-panel': ({ panelId }) => `当前面板：${panelId ?? '无'}` }
      },
    })
    addButton(controls, '打开详情', () => element.openRightAside('details'))
    addButton(controls, '关闭详情', () => element.closeRightAside())
    return () => element.remove()
  },
)

export const floatingLayout = defineExample(
  'floating-layout',
  '验证浮动 surface 与受控 floatingState 更新事件。',
  ['浮动布局', '拖动状态', '尺寸状态'],
  async (host) => {
    const log = addLog(host)
    const element = await mountChatUI(host, {
      data: messageData('浮动布局'),
      ui: { layout: { surface: { mode: 'floating' }, leftAside: false }, sender: false },
      configure(target) {
        target.floatingState = { x: 16, y: 16, width: 560, height: 360 }
        target.addEventListener('floating-state-update', (event) => {
          target.floatingState = (event as CustomEvent).detail
          log('floating-state-update')
        })
      },
    })
    return () => element.remove()
  },
)

export const responsiveLayout = defineExample(
  'responsive-layout',
  '调整宿主宽度，验证组件容器内的响应式侧栏行为。',
  ['窄容器', '宽容器', 'drawer 侧栏'],
  async (host) => {
    const controls = addControls(host)
    const element = await mountChatUI(host, {
      data: messageData('响应式布局'),
      ui: { layout: { leftAside: { mode: 'drawer', defaultOpen: true }, contentMaxWidth: 760 }, sender: false },
    })
    addButton(controls, '窄屏', () => (host.style.maxWidth = '520px'))
    addButton(controls, '宽屏', () => (host.style.maxWidth = '100%'))
    return () => element.remove()
  },
)

export const controlledUI = defineExample(
  'controlled-ui',
  '使用 DOM 属性和 *-update 事件实现双向受控状态。',
  ['inputValue', '右侧栏', '属性重赋值'],
  async (host) => {
    const controls = addControls(host)
    const log = addLog(host)
    const element = await mountChatUI(host, {
      inputValue: '受控输入值',
      data: emptyData('受控 UI'),
      ui: { layout: { leftAside: false }, welcome: false },
      configure(target) {
        target.addEventListener('input-value-update', (event) => {
          target.inputValue = (event as CustomEvent<string>).detail
          log(`input-value-update: ${target.inputValue}`)
        })
      },
    })
    addButton(controls, '外部更新', () => (element.inputValue = '由宿主更新的值'))
    return () => element.remove()
  },
)

export const runtimeActions = defineExample(
  'runtime-actions',
  '从宿主调用 send() 和 Runtime abort()。',
  ['外部发送', '取消', 'owned Runtime'],
  async (host) => {
    const controls = addControls(host)
    const log = addLog(host)
    const runtimeOptions = createDemoRuntimeOptions()
    const element = await mountChat(host, { runtimeOptions, ui: { layout: { leftAside: false } } })
    addButton(controls, '发送预设问题', async () => log(`send: ${await element.send({ text: '外部发送' })}`))
    addButton(controls, '停止请求', async () => {
      await element.getRuntime()?.actions.abort?.()
      log('abort 已调用')
    })
    return () => element.remove()
  },
)

export const runtimeBeforeSend = defineExample(
  'runtime-before-send',
  'beforeSend 根据宿主登录状态返回 reject 或 continue。',
  ['reject', 'continue', '输入保留'],
  async (host) => {
    const controls = addControls(host)
    const log = addLog(host)
    let loggedIn = false
    const label = document.createElement('label')
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.addEventListener('change', () => (loggedIn = checkbox.checked))
    label.append(checkbox, ' 已登录')
    controls.append(label)
    const runtimeOptions = createDemoRuntimeOptions({ beforeSend: () => (loggedIn ? 'continue' : 'reject') })
    const element = await mountChat(host, { runtimeOptions, ui: { layout: { leftAside: false } } })
    addButton(controls, '尝试发送', async () => log(`send: ${await element.send({ text: '登录检查' })}`))
    return () => element.remove()
  },
)

export const runtimeComposer = defineExample(
  'runtime-composer',
  '替换结构化 Runtime 属性以验证 composer 禁用状态。',
  ['disabled', 'submitDisabled', 'Runtime 替换'],
  async (host) => {
    const controls = addControls(host)
    const element = await mountChat(host, {
      runtime: composerRuntime(false, false),
      ui: { layout: { leftAside: false } },
    })
    addButton(controls, '禁用输入', () => (element.runtime = composerRuntime(true, false)))
    addButton(controls, '仅禁用提交', () => (element.runtime = composerRuntime(false, true)))
    addButton(controls, '恢复', () => (element.runtime = composerRuntime(false, false)))
    return () => element.remove()
  },
)

function composerRuntime(disabled: boolean, submitDisabled: boolean) {
  return createStaticRuntime({ composer: { disabled: { value: disabled }, submitDisabled: { value: submitDisabled } } })
}

export const runtimeConversations = defineExample(
  'runtime-conversations',
  '宿主 Runtime 提供会话列表并响应新建/切换操作。',
  ['会话列表', '新建', '切换'],
  async (host) => {
    const controls = addControls(host)
    const first = conversationRuntime('one', '会话一')
    const element = await mountChat(host, { runtime: first, ui: { layout: { leftAside: { defaultOpen: true } } } })
    addButton(controls, '切换会话二', () => (element.runtime = conversationRuntime('two', '会话二')))
    addButton(controls, '回到会话一', () => (element.runtime = first))
    return () => element.remove()
  },
)

function conversationRuntime(id: string, title: string): ChatRuntime {
  const conversation = {
    id,
    title,
    messages: [{ role: 'assistant', content: `当前：${title}` }],
    requestState: 'idle' as const,
  }
  return createStaticRuntime({ conversations: { value: [{ id, title }] }, activeConversation: { value: conversation } })
}

export const runtimeSend = defineExample(
  'runtime-send',
  '直接调用元素 send()，返回与 Runtime action 一致的布尔结果。',
  ['send 方法', '返回值', '消息追加'],
  async (host) => {
    const controls = addControls(host)
    const log = addLog(host)
    const element = await mountChat(host, { ui: { layout: { leftAside: false } } })
    addButton(controls, '调用 send()', async () => log(`send result: ${await element.send({ text: '直接调用 send' })}`))
    return () => element.remove()
  },
)

export const runtimeAdapter = defineExample(
  'runtime-adapter',
  '使用 TrChatUI DOM 数据协议接入业务自有状态。',
  ['data 属性', 'submit 事件', '业务状态回写'],
  async (host) => {
    const log = addLog(host)
    const element = await mountChatUI(host, {
      data: messageData('业务自有状态'),
      ui: { layout: { leftAside: false } },
      configure(target) {
        target.addEventListener('submit', (event) => {
          const text = (event as CustomEvent<{ text: string }>).detail.text
          target.data = {
            ...messageData('业务自有状态'),
            bubble: {
              messages: [
                { role: 'user', content: text },
                { role: 'assistant', content: '业务适配器响应' },
              ],
            },
          }
          log(`submit: ${text}`)
        })
      },
    })
    return () => element.remove()
  },
)

export const examplesById = {
  basic,
  'layout-presets': layoutPresets,
  'welcome-prompts': welcomePrompts,
  'sender-options': senderOptions,
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
} satisfies Record<string, ExperimentalExampleModule>

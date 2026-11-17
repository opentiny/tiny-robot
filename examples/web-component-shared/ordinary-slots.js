/** 提示词与界面配置共用；各宿主分别声明自己的 Slot 内容。 */
export const PROMPT_GROUPS = [
  [
    { label: '如何接入聊天组件？', description: '了解安装和基本配置' },
    { label: '支持哪些内容扩展？', description: '查看消息与输入区用法' },
  ],
  [
    { label: '如何使用普通 Slot？', description: '在指定位置添加宿主内容' },
    { label: '怎样管理会话？', description: '了解会话列表和切换' },
  ],
]
export const SLOT_UI = /** @type {const} */ ({
  layout: { leftAside: false, rightAside: false },
  welcome: { title: '你好，有什么可以帮你？', description: '了解组件能力、接入方法和常见用法。' },
  prompts: { items: PROMPT_GROUPS[0] },
  model: false,
  mcp: false,
  sender: { mode: 'multiple', placeholder: '输入你的问题' },
})

/** 三端使用相同消息；正文分别由宿主的 DOM、Angular 模板和 React JSX 声明。 */
export function bubbleMessages(title = '智能助手', revision = 0) {
  return [
    { id: 'question', role: 'user', content: '**默认 Markdown**' },
    {
      id: 'product',
      role: 'assistant',
      content: [
        { type: 'product-card', title, description: `支持知识问答与接入指导 · 更新 ${revision}` },
        { type: 'text', text: '原生内容继续显示' },
      ],
    },
    { id: 'quote', role: 'assistant', content: [{ type: 'business-quote', text: '消息正文由宿主框架渲染。' }] },
  ]
}
export const BUBBLE_UI = /** @type {const} */ ({
  header: false,
  layout: { leftAside: false, rightAside: false },
  model: false,
  mcp: false,
  sender: false,
  bubble: { bubbleList: { groupStrategy: 'divider', dividerRole: 'assistant' } },
})

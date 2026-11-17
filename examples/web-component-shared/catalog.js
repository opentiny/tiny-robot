/** @typedef {{id: string, group: string, title: string, path: string, description: string}} Demo */

/** @type {readonly Demo[]} */
export const DEMOS = [
  {
    id: 'props',
    group: '基础能力',
    title: '属性与事件',
    path: '/basic/props',
    description: '通过宿主修改字符串、对象和布尔属性，使用内置输入框完成本地聊天。',
  },
  {
    id: 'runtime',
    group: '基础能力',
    title: 'Runtime 接入',
    path: '/basic/runtime',
    description: '验证 Runtime 延后接入、首次就绪通知，以及卸载后重新创建组件。',
  },
  {
    id: 'floating',
    group: '基础能力',
    title: '浮窗状态',
    path: '/basic/floating',
    description: '设置浮窗的位置和尺寸，拖动顶部手柄，读取并回写状态事件。',
  },
  {
    id: 'methods',
    group: '基础能力',
    title: '公开方法',
    path: '/basic/methods',
    description: '等待元素就绪后调用输入、聚焦和发送方法，读取实际返回结果。',
  },
  {
    id: 'ordinary-slots',
    group: '内容扩展',
    title: '普通 Slot',
    path: '/content/ordinary-slots',
    description: '在欢迎区、提示词列表和输入区使用自定义内容与交互。',
  },
  {
    id: 'scoped-slots',
    group: '内容扩展',
    title: 'Scoped Slot',
    path: '/content/scoped-slots',
    description: '在宿主视图中读取会话、消息和输入区上下文，调用对应操作。',
  },
]

/** @param {string} hash @returns {Demo} */
export function resolveDemo(hash) {
  const path = hash.replace(/^#/, '')
  return DEMOS.find((demo) => demo.path === path) ?? DEMOS[0]
}

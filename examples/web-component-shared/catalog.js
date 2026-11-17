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
]

/** @param {string} hash @returns {Demo} */
export function resolveDemo(hash) {
  const path = hash.replace(/^#/, '')
  return DEMOS.find((demo) => demo.path === path) ?? DEMOS[0]
}

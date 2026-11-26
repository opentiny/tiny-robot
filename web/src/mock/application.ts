import type { MockMethod } from './dispatch'

interface ApplicationTag {
  type: string
  value: string
}

interface ApplicationItem {
  id: number
  name: string
  description: string
  tag: ApplicationTag[]
  classify: string
  icon: string
}

const applications: ApplicationItem[] = [
  {
    name: 'TinyVue 组件库',
    description: 'OpenTiny 企业级 UI 组件库，同时支持 Vue.js 2 与 Vue.js 3，以及 PC 与移动端。',
    tag: [{ type: 'success', value: '开发' }],
    classify: 'dev',
    icon: 'card-list-application-default.png',
  },
  {
    name: 'TinyEngine 低代码引擎',
    description: 'TinyEngine低代码引擎，AI时代的智能低代码基座。',
    tag: [{ type: 'success', value: '开发' }, { type: 'danger', value: '交互设计' }],
    classify: 'dev',
    icon: 'card-list-console-framework.png',
  },
  {
    name: 'TinyTheme 主题配置系统',
    description: 'OpenTiny 主题配置系统，支持在线定制组件主题与视觉风格。',
    tag: [{ type: 'danger', value: '交互设计' }, { type: 'warning', value: '视觉设计' }],
    classify: 'design',
    icon: 'card-list-application-default.png',
  },
  {
    name: 'OpenTiny Icons 图标库',
    description: 'OpenTiny Design Icons 图标库，为组件与业务页面提供统一图标资源。',
    tag: [{ type: 'warning', value: '视觉设计' }],
    classify: 'design',
    icon: 'card-list-application-default.png',
  },
  {
    name: 'TinyCLI 命令行工具',
    description: '灵活可扩展的 OpenTiny 前端命令行工具，提供工程化套件与插件。',
    tag: [{ type: 'success', value: '开发' }],
    classify: 'dev',
    icon: 'card-list-console-framework.png',
  },
  {
    name: 'TinyPro 中后台模板',
    description: '基于 TinyVue 的前后端分离后台管理系统，支持在线配置菜单、路由、国际化，开箱即用。',
    tag: [{ type: 'success', value: '开发' }, { type: 'warning', value: '上线' }],
    classify: 'dev',
    icon: 'card-list-console-framework.png',
  },
  {
    name: 'TinyEditor 富文本编辑器',
    description: '基于 Quill 2.0 的富文本编辑器，扩展丰富模块与格式，功能强大、开箱即用。',
    tag: [{ type: 'success', value: '开发' }],
    classify: 'dev',
    icon: 'card-list-console-framework.png',
  },
  {
    name: 'TinyRobot AI 对话组件库',
    description: 'AI 对话组件库，提供丰富的 AI 交互组件，助力快速构建企业级 AI 应用。',
    tag: [{ type: 'success', value: '开发' }],
    classify: 'dev',
    icon: 'card-list-furion.png',
  },
  {
    name: 'TinyVue Mobile 移动端组件',
    description: '基于 OpenTiny 设计规范的 Vue3 移动端组件库，支持 TypeScript、主题切换与国际化。',
    tag: [{ type: 'success', value: '开发' }],
    classify: 'dev',
    icon: 'card-list-application-default.png',
  },
  {
    name: 'TinyCharts 可视化图表库',
    description: '前端可视化图表库，提供 40 多个图表组件，支持主题定制、响应式和无障碍，兼容 ECharts API。',
    tag: [{ type: 'success', value: '开发' }, { type: 'warning', value: '视觉设计' }],
    classify: 'dev',
    icon: 'card-list-application-default.png',
  },
  {
    name: 'WebMCP SDK',
    description: '前端 AI 与浏览器自动化工具包，通过 WebMCP + WebSkills 构建 AI 原生应用。',
    tag: [{ type: 'success', value: '开发' }],
    classify: 'dev',
    icon: 'card-list-console-framework.png',
  },
  {
    name: 'GenUI SDK',
    description: '面向 Vue、Angular 的 Generative UI SDK，帮助快速生成交互界面。',
    tag: [{ type: 'success', value: '开发' }],
    classify: 'dev',
    icon: 'card-list-application-default.png',
  },
].map((item, index) => ({ ...item, id: index + 1 }))

function filterApplications(query: URLSearchParams) {
  const page = Math.max(1, Number(query.get('page') ?? 1) || 1)
  const limit = Math.max(1, Number(query.get('limit') ?? 10) || 10)
  const keywords = (query.get('keywords') ?? '').trim().toLowerCase()
  const classify = query.get('classify') ?? 'all'

  const filtered = applications.filter((item) => {
    if (classify !== 'all' && item.classify !== classify) {
      return false
    }
    if (!keywords) {
      return true
    }
    const tagText = item.tag.map(tag => tag.value).join(' ')
    return [item.name, item.description, tagText].some(field =>
      field.toLowerCase().includes(keywords),
    )
  })

  const start = (page - 1) * limit
  return {
    data: filtered.slice(start, start + limit),
    total: filtered.length,
  }
}

export default [
  {
    url: '/api/application',
    method: 'get',
    response: ({ query }) => filterApplications(query),
  },
] satisfies MockMethod[]

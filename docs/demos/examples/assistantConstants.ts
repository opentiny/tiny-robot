import type { SuggestionGroup, UserItem } from '@opentiny/tiny-robot'
import { IconDislike, IconLike } from '@opentiny/tiny-robot-svgs'

// --- Drag overlay ---
export const OVERLAY_TITLE = '将图片拖到此处完成上传'
export const OVERLAY_DESCRIPTION = ['总计最多上传3个图片（每个10MB以内）', '支持图片格式 JPG/JPEG/PNG']

// --- Dropdown menu ---
export const DROPDOWN_MENU_ITEMS = [
  { id: '1', text: '去续费' },
  { id: '2', text: '去退订' },
  { id: '3', text: '查账单' },
  { id: '4', text: '导账单' },
  { id: '5', text: '对帐单' },
]

// --- Prompt items ---
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
    label: 'MCP 工具调用',
    description: '搜索：北京天气（输入「搜索」「MCP」「工具」等关键词可触发模拟 MCP 工具调用）',
    emoji: '🔧',
  },
]

// --- Pill items config ---
export interface PillItemConfig {
  text: string
  type: 'dropdown'
}

export interface TemplatePillItemConfig {
  text: string
  type: 'template'
  range: [number, number?]
}

export type PillConfig = PillItemConfig | TemplatePillItemConfig

export const PILL_ITEMS_CONFIG: PillConfig[] = [
  { text: '费用成本', type: 'dropdown' },
  { text: '常用指令', type: 'template', range: [0, 3] },
  { text: '工作助手', type: 'template', range: [3, 6] },
  { text: '内容创作', type: 'template', range: [6] },
]

// --- Template suggestions ---
export interface TemplateSuggestionItem {
  id: string
  text: string
  template: UserItem[]
}

export const templateSuggestions: TemplateSuggestionItem[] = [
  {
    id: 'write',
    text: '帮我写作',
    template: [
      { type: 'text', content: '帮我撰写' },
      { type: 'template', content: '文章类型' },
      { type: 'text', content: '字的' },
      { type: 'template', content: '主题' },
      { type: 'text', content: ', 语气类型是' },
      { type: 'template', content: '正式/轻松/专业' },
      { type: 'text', content: ', 具体内容是' },
      { type: 'template', content: '详细描述' },
    ],
  },
  {
    id: 'translate',
    text: '翻译',
    template: [
      { type: 'text', content: '请将以下' },
      { type: 'template', content: '中文/英文/法语/德语/日语' },
      { type: 'text', content: '内容翻译成' },
      { type: 'template', content: '目标语言' },
      { type: 'text', content: ':' },
      { type: 'template', content: '需要翻译的内容' },
    ],
  },
  {
    id: 'summarize',
    text: '内容总结',
    template: [
      { type: 'text', content: '请对以下内容进行' },
      { type: 'template', content: '简要/详细' },
      { type: 'text', content: '总结，约' },
      { type: 'template', content: '字数' },
      { type: 'text', content: '字:' },
      { type: 'template', content: '需要总结的内容' },
    ],
  },
  {
    id: 'code-review',
    text: '代码审查',
    template: [
      { type: 'text', content: '请帮我审查以下' },
      { type: 'template', content: 'JavaScript/TypeScript/Python/Java/C++/Go' },
      { type: 'text', content: '代码，关注' },
      { type: 'template', content: '性能/安全/可读性/最佳实践' },
      { type: 'text', content: '方面:' },
      { type: 'template', content: '代码内容' },
    ],
  },
  {
    id: 'email-compose',
    text: '写邮件',
    template: [
      { type: 'text', content: '请帮我起草一封' },
      { type: 'template', content: '正式/非正式' },
      { type: 'text', content: '邮件，发送给' },
      { type: 'template', content: '收件人角色' },
      { type: 'text', content: '，主题是' },
      { type: 'template', content: '邮件主题' },
      { type: 'text', content: '，内容是关于' },
      { type: 'template', content: '邮件内容' },
    ],
  },
  {
    id: 'data-analysis',
    text: '数据分析',
    template: [
      { type: 'text', content: '请分析以下' },
      { type: 'template', content: '销售/用户/流量/金融/健康' },
      { type: 'text', content: '数据，关注' },
      { type: 'template', content: '增长率/分布/趋势/异常/关联性' },
      { type: 'text', content: '指标，生成' },
      { type: 'template', content: '柱状图/折线图/饼图/散点图/热力图' },
      { type: 'text', content: '可视化:' },
      { type: 'template', content: '数据内容' },
    ],
  },
  {
    id: 'product-design',
    text: '产品设计',
    template: [
      { type: 'text', content: '请设计一个' },
      { type: 'template', content: '移动应用/网站/小程序/桌面软件/智能硬件' },
      { type: 'text', content: '的' },
      { type: 'template', content: '功能名称' },
      { type: 'text', content: '功能，目标用户是' },
      { type: 'template', content: '用户群体' },
      { type: 'text', content: '，核心价值是' },
      { type: 'template', content: '功能价值' },
    ],
  },
  {
    id: 'meeting-summary',
    text: '会议纪要',
    template: [
      { type: 'text', content: '请帮我整理一份会议纪要，会议主题是' },
      { type: 'template', content: '会议主题' },
      { type: 'text', content: '，参会人员有' },
      { type: 'template', content: '参会人员' },
      { type: 'text', content: '，会议要点包括' },
      { type: 'template', content: '会议要点' },
    ],
  },
  {
    id: 'interview-questions',
    text: '面试问题',
    template: [
      { type: 'text', content: '请为' },
      { type: 'template', content: '岗位名称' },
      { type: 'text', content: '岗位，针对' },
      { type: 'template', content: '技能领域' },
      { type: 'text', content: '方向，设计' },
      { type: 'template', content: '3/5/10' },
      { type: 'text', content: '个' },
      { type: 'template', content: '简单/中等/困难' },
      { type: 'text', content: '面试问题' },
    ],
  },
  {
    id: 'speech-draft',
    text: '演讲稿',
    template: [
      { type: 'text', content: '请帮我撰写一篇' },
      { type: 'template', content: '开场/主题/致谢/颁奖/毕业' },
      { type: 'text', content: '演讲稿，主题是' },
      { type: 'template', content: '演讲主题' },
      { type: 'text', content: '，时长约' },
      { type: 'template', content: '5/10/15/30' },
      { type: 'text', content: '分钟，受众是' },
      { type: 'template', content: '目标听众' },
    ],
  },
]

// --- Suggestion popover ---
export const suggestionPopoverData: SuggestionGroup[] = [
  {
    group: 'basic',
    label: '推荐',
    icon: IconLike,
    items: [
      { id: 'b1', text: '什么是弹性云服务器?' },
      { id: 'b2', text: '如何登录到Windows云服务器?' },
      { id: 'b3', text: '弹性公网IP为什么ping不通?' },
      { id: 'b4', text: '云服务器安全组如何配置?' },
      { id: 'b5', text: '如何查看云服务器密码?' },
      { id: 'b6', text: '什么是弹性云服务器?' },
      { id: 'b7', text: '如何登录到Windows云服务器?' },
      { id: 'b8', text: '弹性公网IP为什么ping不通?' },
      { id: 'b9', text: '云服务器安全组如何配置?' },
      { id: 'b0', text: '如何查看云服务器密码?' },
    ],
  },
  {
    group: 'purchase',
    label: '购买咨询',
    icon: IconDislike,
    items: [
      { id: 'p1', text: '如何购买弹性云服务器?' },
      { id: 'p2', text: '无法登录弹性云服务器怎么办?' },
      { id: 'p3', text: '云服务器价格怎么计算?' },
      { id: 'p4', text: '如何查看账单详情?' },
      { id: 'p5', text: '如何续费云服务器?' },
    ],
  },
  {
    group: 'usage',
    label: '使用咨询',
    icon: IconLike,
    items: [
      { id: 'u1', text: '云服务器使用限制与须知' },
      { id: 'u2', text: '使用RDP文件连接Windows实例' },
      { id: 'u3', text: '多用户登录（Windows2016）' },
      { id: 'u4', text: '如何重置云服务器密码?' },
      { id: 'u5', text: '云服务器如何安装软件?' },
    ],
  },
  { group: '4', label: '推荐', icon: IconLike, items: [] },
  { group: '5', label: '购买咨询', icon: IconLike, items: [] },
  { group: '6', label: '使用咨询', icon: IconLike, items: [] },
  { group: '7', label: '购买咨询', icon: IconLike, items: [] },
  { group: '8', label: '使用咨询', icon: IconLike, items: [] },
  { group: '9', label: '购买咨询', icon: IconLike, items: [] },
  { group: '10', label: '使用咨询', icon: IconLike, items: [] },
]

// --- Container styles ---
export function getContainerStyles(): Record<string, string> {
  return window.self !== window.top ? { height: '100vh' } : { top: '112px', height: 'calc(100vh - 112px)' }
}

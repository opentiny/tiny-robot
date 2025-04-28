import type { SuggestionItem, Category } from '@opentiny/tiny-robot'

/**
 * 指令模板测试数据
 */
export const templateSuggestions: SuggestionItem[] = [
  {
    id: 'write',
    text: '帮我写作',
    value: '帮我写作',
    description: '智能写作助手',
    template: '帮我撰写 [文章类型] 字的 [主题], 语气类型是 [正式/轻松/专业], 具体内容是 [详细描述]',
  },
  {
    id: 'translate',
    text: '翻译',
    value: '翻译',
    description: '多语言翻译',
    template: '请将以下 [中文/英文/法语/德语/日语] 内容翻译成 [目标语言]: [需要翻译的内容]',
  },
  {
    id: 'summarize',
    text: '内容总结',
    value: '内容总结',
    description: '智能总结长文本',
    template: '请对以下内容进行 [简要/详细] 总结，约 [字数] 字: [需要总结的内容]',
  },
  {
    id: 'code-review',
    text: '代码审查',
    value: '代码审查',
    description: '代码质量审查',
    template:
      '请帮我审查以下 [JavaScript/TypeScript/Python/Java/C++/Go] 代码，关注 [性能/安全/可读性/最佳实践] 方面: [代码内容]',
  },
  {
    id: 'email-compose',
    text: '写邮件',
    value: '写邮件',
    description: '邮件草拟',
    template: '请帮我起草一封 [正式/非正式] 邮件，发送给 [收件人角色]，主题是 [邮件主题]，内容是关于 [邮件内容]',
  },
  {
    id: 'data-analysis',
    text: '数据分析',
    value: '数据分析',
    description: '数据分析与报告',
    template:
      '请分析以下 [销售/用户/流量/金融/健康] 数据，关注 [增长率/分布/趋势/异常/关联性] 指标，生成 [柱状图/折线图/饼图/散点图/热力图] 可视化: [数据内容]',
  },
  {
    id: 'product-design',
    text: '产品设计',
    value: '产品设计',
    description: '产品功能设计',
    template:
      '请设计一个 [移动应用/网站/小程序/桌面软件/智能硬件] 的 [功能名称] 功能，目标用户是 [用户群体]，核心价值是 [功能价值]',
  },
  {
    id: 'meeting-summary',
    text: '会议纪要',
    value: '会议纪要',
    description: '会议记录整理',
    template: '请帮我整理一份会议纪要，会议主题是 [会议主题]，参会人员有 [参会人员]，会议要点包括 [会议要点]',
  },
  {
    id: 'interview-questions',
    text: '面试问题',
    value: '面试问题',
    description: '生成面试问题',
    template: '请为 [岗位名称] 岗位，针对 [技能领域] 方向，设计 [3/5/10] 个 [简单/中等/困难] 面试问题',
  },
  {
    id: 'speech-draft',
    text: '演讲稿',
    value: '演讲稿',
    description: '演讲稿撰写',
    template:
      '请帮我撰写一篇 [开场/主题/致谢/颁奖/毕业] 演讲稿，主题是 [演讲主题]，时长约 [5/10/15/30] 分钟，受众是 [目标听众]',
  },
]

/**
 * 模板分类测试数据
 */
export const templateCategories: Category[] = [
  {
    id: 'common',
    label: '常用指令',
    items: templateSuggestions.slice(0, 3),
  },
  {
    id: 'work',
    label: '工作助手',
    items: templateSuggestions.slice(3, 6),
  },
  {
    id: 'content',
    label: '内容创作',
    items: templateSuggestions.slice(6),
  },
]

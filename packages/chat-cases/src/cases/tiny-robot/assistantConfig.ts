import type { SuggestionGroup, TemplateItem } from '@opentiny/tiny-robot'
import { IconDislike, IconLike } from '@opentiny/tiny-robot-svgs'

export const DROPDOWN_MENU_ITEMS = [
  { id: '1', text: '去续费' },
  { id: '2', text: '去退订' },
  { id: '3', text: '查账单' },
  { id: '4', text: '导账单' },
  { id: '5', text: '对帐单' },
]

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
          { label: '法语', value: '法语' },
          { label: '德语', value: '德语' },
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
          { label: '法语', value: '法语' },
          { label: '德语', value: '德语' },
          { label: '日语', value: '日语' },
        ],
      },
      { id: 'translate-content-suffix', type: 'text', content: '，内容是' },
      { id: 'translate-content', type: 'block', content: '需要翻译的内容' },
    ],
  },
  {
    id: 'summarize',
    text: '内容总结',
    template: [
      { id: 'summarize-prefix', type: 'text', content: '请对以下内容进行' },
      {
        id: 'summarize-method',
        type: 'select',
        content: '',
        placeholder: '总结方式',
        options: [
          { label: '简要', value: '简要' },
          { label: '详细', value: '详细' },
        ],
      },
      { id: 'summarize-length-prefix', type: 'text', content: '总结，约' },
      { id: 'summarize-length', type: 'block', content: '字数' },
      { id: 'summarize-content-prefix', type: 'text', content: '字，内容是' },
      { id: 'summarize-content', type: 'block', content: '需要总结的内容' },
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
          { label: 'Java', value: 'Java' },
          { label: 'C++', value: 'C++' },
          { label: 'Go', value: 'Go' },
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
          { label: '最佳实践', value: '最佳实践' },
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
    id: 'data-analysis',
    text: '数据分析',
    template: [
      { id: 'data-analysis-prefix', type: 'text', content: '请分析以下' },
      {
        id: 'data-analysis-type',
        type: 'select',
        content: '',
        placeholder: '数据类型',
        options: [
          { label: '销售', value: '销售' },
          { label: '用户', value: '用户' },
          { label: '流量', value: '流量' },
          { label: '金融', value: '金融' },
          { label: '健康', value: '健康' },
        ],
      },
      { id: 'data-analysis-focus-prefix', type: 'text', content: '数据，关注' },
      {
        id: 'data-analysis-focus',
        type: 'select',
        content: '',
        placeholder: '关注方向',
        options: [
          { label: '增长率', value: '增长率' },
          { label: '分布', value: '分布' },
          { label: '趋势', value: '趋势' },
          { label: '异常', value: '异常' },
          { label: '关联性', value: '关联性' },
        ],
      },
      { id: 'data-analysis-chart-prefix', type: 'text', content: '指标，生成' },
      {
        id: 'data-analysis-chart',
        type: 'select',
        content: '',
        placeholder: '图表类型',
        options: [
          { label: '柱状图', value: '柱状图' },
          { label: '折线图', value: '折线图' },
          { label: '饼图', value: '饼图' },
          { label: '散点图', value: '散点图' },
          { label: '热力图', value: '热力图' },
        ],
      },
      { id: 'data-analysis-content-prefix', type: 'text', content: '可视化，数据内容是' },
      { id: 'data-analysis-content', type: 'block', content: '数据内容' },
    ],
  },
  {
    id: 'product-design',
    text: '产品设计',
    template: [
      { id: 'product-design-prefix', type: 'text', content: '请设计一个' },
      {
        id: 'product-design-type',
        type: 'select',
        content: '',
        placeholder: '产品类型',
        options: [
          { label: '移动应用', value: '移动应用' },
          { label: '网站', value: '网站' },
          { label: '小程序', value: '小程序' },
          { label: '桌面软件', value: '桌面软件' },
          { label: '智能硬件', value: '智能硬件' },
        ],
      },
      { id: 'product-design-name-prefix', type: 'text', content: '的' },
      { id: 'product-design-name', type: 'block', content: '功能名称' },
      { id: 'product-design-user-prefix', type: 'text', content: '功能，目标用户是' },
      { id: 'product-design-user', type: 'block', content: '用户群体' },
      { id: 'product-design-value-prefix', type: 'text', content: '，核心价值是' },
      { id: 'product-design-value', type: 'block', content: '功能价值' },
    ],
  },
  {
    id: 'meeting-summary',
    text: '会议纪要',
    template: [
      { id: 'meeting-summary-prefix', type: 'text', content: '请帮我整理一份会议纪要，会议主题是' },
      { id: 'meeting-summary-topic', type: 'block', content: '会议主题' },
      { id: 'meeting-summary-attendees-prefix', type: 'text', content: '，参会人员有' },
      { id: 'meeting-summary-attendees', type: 'block', content: '参会人员' },
      { id: 'meeting-summary-points-prefix', type: 'text', content: '，会议要点包括' },
      { id: 'meeting-summary-points', type: 'block', content: '会议要点' },
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
  {
    id: 'speech-draft',
    text: '演讲稿',
    template: [
      { id: 'speech-draft-prefix', type: 'text', content: '请帮我撰写一篇' },
      {
        id: 'speech-draft-type',
        type: 'select',
        content: '',
        placeholder: '演讲类型',
        options: [
          { label: '开场', value: '开场' },
          { label: '主题', value: '主题' },
          { label: '致谢', value: '致谢' },
          { label: '颁奖', value: '颁奖' },
          { label: '毕业', value: '毕业' },
        ],
      },
      { id: 'speech-draft-topic-prefix', type: 'text', content: '演讲稿，主题是' },
      { id: 'speech-draft-topic', type: 'block', content: '演讲主题' },
      { id: 'speech-draft-duration-prefix', type: 'text', content: '，时长约' },
      {
        id: 'speech-draft-duration',
        type: 'select',
        content: '',
        placeholder: '演讲时长（分钟）',
        options: [
          { label: '5', value: '5' },
          { label: '10', value: '10' },
          { label: '15', value: '15' },
          { label: '30', value: '30' },
        ],
      },
      { id: 'speech-draft-audience-prefix', type: 'text', content: '分钟，受众是' },
      { id: 'speech-draft-audience', type: 'block', content: '目标听众' },
    ],
  },
]

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
]

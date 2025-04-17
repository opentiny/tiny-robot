export interface Category {
  id: string
  label: string
  icon?: string
  questions: Question[]
}

export interface Question {
  id: string
  text: string
  keywords?: string[]
}

export interface TrQuestionPanel {
  openModal: () => void
  closeModal: () => void
  toggleFloating: () => void
  setActiveCategory: (categoryId: string) => void
  refreshData: () => Promise<void>
}

export type ThemeType = 'light' | 'dark'

/**
 * Question组件属性定义
 */
export interface QuestionProps {
  /**
   * 问题分类列表
   * 包含多个分类，每个分类下有多个问题
   */
  categories: Category[]

  /**
   * 浮动显示的问题列表
   * 显示在组件底部的常见问题胶囊
   */
  commonQuestions: Question[]

  /**
   * 是否初始展开常见问题
   * @default false
   */
  initialExpanded?: boolean

  /**
   * 弹窗宽度
   * @default '640px'
   */
  modalWidth?: string

  /**
   * 主题类型
   * @default 'light'
   */
  theme?: ThemeType

  /**
   * 是否点击外部关闭弹窗
   * @default true
   */
  closeOnClickOutside?: boolean

  /**
   * 是否显示加载中状态
   * @default false
   */
  loading?: boolean
}

/**
 * Question组件事件定义
 */
export type QuestionEmits = {
  /**
   * 问题点击事件
   * @param question 被点击的问题对象
   */
  'question-click': [question: Question]

  /**
   * 分类选择事件
   * @param category 被选择的分类对象
   */
  'select-category': [category: Category]
}

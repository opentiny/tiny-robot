/**
 * 扩展名称常量
 *
 * 用于 TipTap 扩展定义中的 name 属性
 * 这些是注册到编辑器的扩展名称
 */
export const EXTENSION_NAMES = {
  /** Template 扩展（包含 TemplateBlock 和 TemplateSelect 子扩展） */
  TEMPLATE: 'template',
  /** Mention 扩展 */
  MENTION: 'mention',
  /** Suggestion 扩展 */
  SUGGESTION: 'suggestion',
} as const

/**
 * ProseMirror 节点类型名称常量
 *
 * 用于 node.type.name 检查和节点创建
 * 这些是 ProseMirror Schema 中注册的节点类型名称
 */
export const NODE_TYPE_NAMES = {
  /** TemplateBlock 节点类型（可编辑块） */
  TEMPLATE_BLOCK: 'templateBlock',
  /** TemplateSelect 节点类型（下拉选择） */
  TEMPLATE_SELECT: 'templateSelect',
  /** Mention 节点类型 */
  MENTION: 'mention',
  /** Paragraph 节点类型（ProseMirror 内置） */
  PARAGRAPH: 'paragraph',
  /** Text 节点类型（ProseMirror 内置） */
  TEXT: 'text',
} as const

/**
 * ProseMirror 插件 Key 名称常量
 */
export const PLUGIN_KEY_NAMES = {
  /** Mention 插件 */
  MENTION: 'mention',
  /** Suggestion 插件 */
  SUGGESTION: 'suggestion',
  /** Template Select 下拉菜单插件 */
  TEMPLATE_SELECT_DROPDOWN: 'templateSelectDropdown',
  /** Template Select 零宽字符插件 */
  TEMPLATE_SELECT_ZERO_WIDTH: 'templateSelectZeroWidth',
  /** Template Select 键盘导航插件 */
  TEMPLATE_SELECT_KEYBOARD: 'templateSelectKeyboard',
  /** Template Block 零宽字符插件 */
  TEMPLATE_BLOCK_ZERO_WIDTH: 'templateBlockZeroWidth',
  /** Template Block 键盘导航插件 */
  TEMPLATE_BLOCK_KEYBOARD: 'templateBlockKeyboard',
  /** Template Block 粘贴处理插件 */
  TEMPLATE_BLOCK_PASTE: 'templateBlockPaste',
} as const

/**
 * 用户 API 类型常量
 *
 * 用于 TemplateItem 等用户 API 中的 type 字段
 * 这些是暴露给用户的类型名称，与内部节点类型可能不同
 */
export const USER_API_TYPES = {
  /** 文本类型 */
  TEXT: 'text',
  /** 模板块类型（对应内部的 TemplateBlock 节点） */
  BLOCK: 'block',
  /** 选择器类型（对应内部的 TemplateSelect 节点） */
  SELECT: 'select',
  /** Mention 类型 */
  MENTION: 'mention',
} as const

/**
 * 键盘按键常量
 */
export const KEYBOARD_KEYS = {
  /** Enter 键 */
  ENTER: 'Enter',
  /** Escape 键 */
  ESCAPE: 'Escape',
  /** Tab 键 */
  TAB: 'Tab',
  /** Backspace 键 */
  BACKSPACE: 'Backspace',
  /** Delete 键 */
  DELETE: 'Delete',
  /** 上箭头键 */
  ARROW_UP: 'ArrowUp',
  /** 下箭头键 */
  ARROW_DOWN: 'ArrowDown',
  /** 左箭头键 */
  ARROW_LEFT: 'ArrowLeft',
  /** 右箭头键 */
  ARROW_RIGHT: 'ArrowRight',
  /** 空格键 */
  SPACE: ' ',
} as const

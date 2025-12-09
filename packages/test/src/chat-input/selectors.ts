/**
 * ChatInput 组件相关的选择器常量
 */

export const CHAT_INPUT_SELECTORS = {
  // 基础属性控制按钮
  toggleModeBtn: '[data-testid="toggle-mode-btn"]',
  toggleClearableBtn: '[data-testid="toggle-clearable-btn"]',
  toggleLoadingBtn: '[data-testid="toggle-loading-btn"]',
  toggleDisabledBtn: '[data-testid="toggle-disabled-btn"]',
  toggleWordLimitBtn: '[data-testid="toggle-word-limit-btn"]',
  toggleSizeBtn: '[data-testid="toggle-size-btn"]',
  submitTypeSelect: '[data-testid="submit-type-select"]',
  maxLengthInput: '[data-testid="max-length-input"]',
  placeholderInput: '[data-testid="placeholder-input"]',

  // 方法调用按钮
  setContentBtn: '[data-testid="set-content-btn"]',
  getContentBtn: '[data-testid="get-content-btn"]',
  focusBtn: '[data-testid="focus-btn"]',
  blurBtn: '[data-testid="blur-btn"]',
  clearBtn: '[data-testid="clear-btn"]',
  submitBtn: '[data-testid="submit-btn"]',

  // 插件开关按钮
  toggleMentionBtn: '[data-testid="toggle-mention-btn"]',
  toggleTemplateBtn: '[data-testid="toggle-template-btn"]',
  toggleSuggestionBtn: '[data-testid="toggle-suggestion-btn"]',

  // ChatInput 组件
  chatInput: '[data-testid="test-chat-input"]',
  editor: '.tr-chat-input .ProseMirror',

  // 按钮
  submitButton: '.tr-chat-input-submit-button',
  clearButton: '.tr-action-buttons-group .tr-action-button', // 更新：使用通用组件后的选择器
  loadingButton: '.tr-chat-input-submit-button.is-loading',

  // 字数统计
  wordCounter: '.tr-chat-input-word-counter',

  // 底部区域
  footer: '.tr-chat-input-footer',
  customFooterBtn: '[data-testid="custom-footer-btn"]',

  // 结果显示
  resultDisplay: '[data-testid="result-display"]',
  modeDisplay: '[data-testid="mode-display"]',

  // Mention 功能
  mentionList: '.mention-list',
  mentionItem: '.mention-list button',
  mentionSelected: '.mention-list button.is-selected',
  mentionNode: '.mention',

  // Template Block 功能
  template: '.template-block',
  templateContent: '.template-block__content',

  // 模板测试按钮
  setTemplateSimpleBtn: '[data-testid="set-template-simple-btn"]',
  setTemplateEmptyBtn: '[data-testid="set-template-empty-btn"]',
  setTemplateMultipleBtn: '[data-testid="set-template-multiple-btn"]',
  clearTemplateBtn: '[data-testid="clear-template-btn"]',

  // Suggestion 功能
  suggestionList: '.suggestion-list',
  suggestionItem: '.suggestion-list__item',
  suggestionHighlighted: '.suggestion-list__item.highlighted',
} as const

export type ChatInputSelectors = typeof CHAT_INPUT_SELECTORS

export const DEFAULT_CHAT_INPUT_SELECTORS = CHAT_INPUT_SELECTORS

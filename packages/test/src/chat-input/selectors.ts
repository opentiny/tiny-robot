/**
 * ChatInput 组件相关的选择器常量
 */

export const CHAT_INPUT_SELECTORS = {
  // 主要控制按钮
  toggleModeBtn: '[data-testid="toggle-mode-btn"]',
  toggleClearableBtn: '[data-testid="toggle-clearable-btn"]',
  toggleLoadingBtn: '[data-testid="toggle-loading-btn"]',
  setContentBtn: '[data-testid="set-content-btn"]',
  getContentBtn: '[data-testid="get-content-btn"]',
  focusBtn: '[data-testid="focus-btn"]',

  // ChatInput 组件
  chatInput: '[data-testid="test-chat-input"]',
  editor: '.tr-chat-input .ProseMirror',

  // 按钮
  submitButton: '.tr-chat-input-submit-button',
  clearButton: '.tr-chat-input-clear-button',
  loadingButton: '.tr-chat-input-submit-button.is-loading',

  // 字数统计
  wordCounter: '.tr-chat-input-word-counter',

  // 底部区域
  footer: '.tr-chat-input-footer',
  customFooterBtn: '[data-testid="custom-footer-btn"]',

  // 结果显示
  resultDisplay: '[data-testid="result-display"]',

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
} as const

export type ChatInputSelectors = typeof CHAT_INPUT_SELECTORS

export const DEFAULT_CHAT_INPUT_SELECTORS = CHAT_INPUT_SELECTORS

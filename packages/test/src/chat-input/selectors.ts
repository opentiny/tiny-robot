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
  skillMentionList: '.skill-mention-list',
  skillMentionItem: '.skill-mention-list button',
  skillMentionSelected: '.skill-mention-list button.is-selected',
  skillMentionNode: '.skill-mention',
} as const

export type ChatInputSelectors = typeof CHAT_INPUT_SELECTORS

export const DEFAULT_CHAT_INPUT_SELECTORS = CHAT_INPUT_SELECTORS

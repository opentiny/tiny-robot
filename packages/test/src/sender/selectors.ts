/**
 * Sender 组件相关的选择器常量
 */

export const SENDER_SELECTORS = {
  toggleModeBtn: '[data-testid="toggle-mode-btn"]',
  toggleClearableBtn: '[data-testid="toggle-clearable-btn"]',
  toggleLoadingBtn: '[data-testid="toggle-loading-btn"]',
  toggleDisabledBtn: '[data-testid="toggle-disabled-btn"]',
  toggleWordLimitBtn: '[data-testid="toggle-word-limit-btn"]',
  toggleSizeBtn: '[data-testid="toggle-size-btn"]',
  toggleExternalContentBtn: '[data-testid="toggle-external-content-btn"]',
  toggleAttachmentsSourceBtn: '[data-testid="toggle-attachments-source-btn"]',
  clearAttachmentsSourceItemsBtn: '[data-testid="clear-attachments-source-items-btn"]',
  submitTypeSelect: '[data-testid="submit-type-select"]',
  maxLengthInput: '[data-testid="max-length-input"]',
  placeholderInput: '[data-testid="placeholder-input"]',

  setContentBtn: '[data-testid="set-content-btn"]',
  getContentBtn: '[data-testid="get-content-btn"]',
  focusBtn: '[data-testid="focus-btn"]',
  blurBtn: '[data-testid="blur-btn"]',
  clearBtn: '[data-testid="clear-btn"]',
  submitBtn: '[data-testid="submit-btn"]',

  toggleMentionBtn: '[data-testid="toggle-mention-btn"]',
  toggleTemplateBtn: '[data-testid="toggle-template-btn"]',
  toggleSuggestionBtn: '[data-testid="toggle-suggestion-btn"]',

  sender: '[data-testid="test-sender"]',
  editor: '[data-testid="test-sender"] .ProseMirror',
  editorScroll: '[data-testid="test-sender"] .tr-sender-editor-scroll',

  submitButton: '.tr-sender-submit-button',
  clearButton: '.tr-action-buttons-group .tr-action-button',
  loadingButton: '.tr-sender-submit-button.is-loading',

  wordCounter: '.tr-sender-word-counter',

  footer: '.tr-sender-footer',
  customFooterBtn: '[data-testid="custom-footer-btn"]',

  resultDisplay: '[data-testid="result-display"]',
  submitDetailDisplay: '[data-testid="submit-detail-display"]',
  modeDisplay: '[data-testid="mode-display"]',

  mentionList: '.mention-list',
  mentionItem: '.mention-item',
  mentionSelected: '.mention-item.is-selected',
  mentionNode: '.mention',

  template: '.template-block',
  templateContent: '.template-block__content',

  setTemplateSimpleBtn: '[data-testid="set-template-simple-btn"]',
  setTemplateEmptyBtn: '[data-testid="set-template-empty-btn"]',
  setTemplateMultipleBtn: '[data-testid="set-template-multiple-btn"]',
  clearTemplateBtn: '[data-testid="clear-template-btn"]',

  suggestionList: '.suggestion-list',
  suggestionItem: '.suggestion-list__item',
  suggestionHighlighted: '.suggestion-list__item.highlighted',
} as const

export type SenderSelectors = typeof SENDER_SELECTORS

export const DEFAULT_SENDER_SELECTORS = SENDER_SELECTORS

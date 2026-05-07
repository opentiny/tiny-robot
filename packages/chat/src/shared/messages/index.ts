import { computed, inject } from 'vue'
import { CHAT_MESSAGES_KEY } from '@/shared/context'
import type { ChatMessages, ChatMessagesOverrides } from '@/types'

/**
 * Centralized chat-owned copy.
 * This is a preparation step for future app-wide i18n, not a runtime locale system.
 */
export const CHAT_MESSAGES: ChatMessages = {
  header: {
    newChat: '新建对话',
    openHistory: '打开历史',
    closeHistory: '关闭历史',
    close: '关闭',
  },
  history: {
    newSession: '新建会话',
    manage: '管理',
    done: '完成',
    defaultConversationTitle: '新对话',
    searchPlaceholder: '搜索会话...',
    deleteSelected: '删除选中',
    cancel: '取消',
  },
  sender: {
    placeholder: '请输入您的问题',
  },
  workspace: {
    expandLeftSidebar: '展开左侧边栏',
    expandRightSidebar: '展开右侧面板',
    historyRailLabel: '历史',
    previewRailLabel: '预览',
    toggleRightPanel: '切换工作区面板',
    rightPanelTitle: '扩展工作区',
    closeRightPanel: '关闭右侧面板',
  },
  modelSelector: {
    triggerLabel: '选择模型',
  },
  attachments: {
    uploadTooltip: '上传附件',
  },
  senderActions: {
    uploadTooltip: '上传附件',
    voiceTooltip: '语音输入',
  },
  feedback: {
    copy: '复制',
    edit: '编辑',
    regenerate: '重新生成',
  },
  editMessage: {
    placeholder: '编辑消息内容...',
    cancel: '取消',
    save: '保存',
    saving: '保存中...',
  },
  toolCall: {
    running: '正在调用',
    success: '已调用',
    failed: '调用失败',
    cancelled: '已取消',
    untitled: '未命名工具',
  },
  error: {
    defaultMessage: '发生错误',
    retry: '重试',
  },
  mcp: {
    triggerLabel: '扩展',
    triggerActiveTitle: '已激活 {count} 个插件',
    triggerInactiveTitle: '当前没有激活插件',
    addPlugin: '添加新插件',
    installPlugin: '安装更多插件',
  },
  sidebar: {
    collapse: '折叠侧边栏',
    close: '关闭侧边栏',
    emptyTitle: '暂无扩展内容',
    emptyDescription: '后续可在此查看文件、链接或扩展结果。',
  },
}

export function resolveChatMessages(overrides?: ChatMessagesOverrides): ChatMessages {
  if (!overrides) {
    return CHAT_MESSAGES
  }

  return {
    header: { ...CHAT_MESSAGES.header, ...overrides.header },
    history: { ...CHAT_MESSAGES.history, ...overrides.history },
    sender: { ...CHAT_MESSAGES.sender, ...overrides.sender },
    workspace: { ...CHAT_MESSAGES.workspace, ...overrides.workspace },
    modelSelector: { ...CHAT_MESSAGES.modelSelector, ...overrides.modelSelector },
    attachments: { ...CHAT_MESSAGES.attachments, ...overrides.attachments },
    senderActions: { ...CHAT_MESSAGES.senderActions, ...overrides.senderActions },
    feedback: { ...CHAT_MESSAGES.feedback, ...overrides.feedback },
    editMessage: { ...CHAT_MESSAGES.editMessage, ...overrides.editMessage },
    toolCall: { ...CHAT_MESSAGES.toolCall, ...overrides.toolCall },
    error: { ...CHAT_MESSAGES.error, ...overrides.error },
    mcp: { ...CHAT_MESSAGES.mcp, ...overrides.mcp },
    sidebar: { ...CHAT_MESSAGES.sidebar, ...overrides.sidebar },
  }
}

export function useResolvedChatMessages() {
  return inject(
    CHAT_MESSAGES_KEY,
    computed(() => CHAT_MESSAGES),
  )
}

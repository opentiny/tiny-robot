<script setup lang="ts">
import { TrHistory, type HistoryMenuItem } from '@opentiny/tiny-robot'
import { IconMenuCollapse, IconNewSession, IconSetting } from '@opentiny/tiny-robot-svgs'
import { useChatHistoryItems, type ChatHistoryItem, type ChatConversationView } from '@opentiny/tiny-robot-chat'
import geminiMask from './icons/gemini-mask.svg'

const props = defineProps<{
  conversation: ChatConversationView
}>()

const emit = defineEmits<{
  createConversation: []
  close: []
  conversationSelect: [id: string]
  conversationTitleChange: [title: string, id: string]
  conversationAction: [action: HistoryMenuItem, id: string]
}>()

const historyItems = useChatHistoryItems({
  conversations: () => props.conversation.items,
  defaultTitle: '新对话',
})
const historyMenuItems: HistoryMenuItem[] = [
  { id: 'rename', text: '重命名' },
  { id: 'delete', text: '删除' },
]

function handleConversationSelect(item: ChatHistoryItem) {
  emit('conversationSelect', item.raw.id)
}

function handleConversationTitleChange(title: string, item: ChatHistoryItem) {
  emit('conversationTitleChange', title, item.raw.id)
}

function handleConversationAction(action: HistoryMenuItem, item: ChatHistoryItem) {
  emit('conversationAction', action, item.raw.id)
}
</script>

<template>
  <aside class="gemini-sidebar">
    <header class="gemini-sidebar__brand">
      <div class="gemini-sidebar__brand-mark">
        <img :src="geminiMask" alt="Gemini" />
        <span>Gemini</span>
      </div>
      <button
        class="gemini-sidebar__icon-button"
        type="button"
        aria-label="收起侧栏"
        title="收起侧栏"
        @click="emit('close')"
      >
        <IconMenuCollapse :size="18" />
      </button>
    </header>

    <nav class="gemini-sidebar__navigation" aria-label="主导航">
      <button class="gemini-sidebar__nav-item is-active" type="button" @click="emit('createConversation')">
        <IconNewSession :size="18" />
        <span>发起新对话</span>
      </button>
    </nav>

    <section class="gemini-sidebar__recent" aria-label="最近会话">
      <div class="gemini-sidebar__section-title">最近</div>
      <!-- @vue-generic {ChatHistoryItem} -->
      <TrHistory
        class="gemini-sidebar__history"
        :data="historyItems as unknown as ChatHistoryItem[]"
        :selected="props.conversation.activeId ?? undefined"
        :menu-items="historyMenuItems"
        @item-click="handleConversationSelect"
        @item-title-change="handleConversationTitleChange"
        @item-action="handleConversationAction"
      />
    </section>

    <footer class="gemini-sidebar__footer">
      <button class="gemini-sidebar__profile" type="button" aria-label="用户账户" title="用户账户">
        <span class="gemini-sidebar__avatar">sl</span>
        <span>song lii</span>
      </button>
      <button class="gemini-sidebar__icon-button" type="button" aria-label="设置" title="设置">
        <IconSetting :size="18" />
      </button>
    </footer>
  </aside>
</template>

<style scoped>
.gemini-sidebar {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  flex-direction: column;
  padding: 14px 8px 16px;
  color: #1f1f1f;
  background: #fff;
}

.gemini-sidebar__brand,
.gemini-sidebar__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gemini-sidebar__brand {
  min-height: 34px;
  padding: 0 4px 0 8px;
}

.gemini-sidebar__brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.gemini-sidebar__brand-mark img {
  display: block;
  width: 24px;
  height: 24px;
}

.gemini-sidebar__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  color: #1f1f1f;
  background: transparent;
  cursor: pointer;
}

.gemini-sidebar__icon-button:hover,
.gemini-sidebar__nav-item:hover,
.gemini-sidebar__profile:hover {
  background: #f1f3f4;
}

.gemini-sidebar__navigation {
  display: grid;
  gap: 2px;
  margin-top: 18px;
}

.gemini-sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 34px;
  padding: 6px 12px;
  border: 0;
  border-radius: 18px;
  color: #1f1f1f;
  background: transparent;
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.gemini-sidebar__nav-item.is-active {
  background: #f1f0ef;
}

.gemini-sidebar__notebooks {
  margin-top: 24px;
}

.gemini-sidebar__section-title {
  margin: 0 8px 8px;
  color: #777b82;
  font-size: 12px;
  line-height: 18px;
}

.gemini-sidebar__recent {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  margin-top: 22px;
}

.gemini-sidebar__history {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  --tr-history-item-padding: 6px 12px;
  --tr-history-item-padding-editing: 6px 12px;
  --tr-history-item-border-radius: 8px;
  --tr-history-item-hover-bg: #f1f3f4;
  --tr-history-item-selected-bg: #dceaff;
  --tr-history-item-space-y: 2px;
  --tr-history-item-font-size: 13px;
}

.gemini-sidebar__footer {
  flex-shrink: 0;
  gap: 4px;
  margin-top: 12px;
  padding: 4px 4px 0;
}

.gemini-sidebar__profile {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  gap: 9px;
  height: 34px;
  padding: 0 8px;
  border: 0;
  border-radius: 18px;
  color: #1f1f1f;
  background: transparent;
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.gemini-sidebar__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex: none;
  border-radius: 50%;
  color: #4268a8;
  background: #d8e5f8;
  font-size: 10px;
  font-weight: 600;
}
</style>

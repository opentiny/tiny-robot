<script setup lang="ts">
import { TrHistory } from '@opentiny/tiny-robot'
import {
  useChatHistoryData,
  type ChatHistoryItem,
  type ChatConversationInfo,
  type ChatConversationView,
  type ChatHistoryData,
} from '@opentiny/tiny-robot-chat'
import DouBaoIcon from './DouBaoIcon.vue'

const props = defineProps<{
  variant: 'fixed' | 'floating'
  conversation: ChatConversationView
  historyData: ChatHistoryData
}>()

const emit = defineEmits<{
  createConversation: []
  conversationSelect: [id: string]
}>()

const displayNavigationItems = [
  { id: 'ai-create', label: 'AI创作', icon: 'ai-create' },
  { id: 'cloud', label: '云盘', icon: 'cloud' },
] as const

const historyItems = useChatHistoryData({
  conversations: () => props.conversation.items,
  history: () => props.historyData,
  defaultTitle: '新对话',
})

function handleConversationSelect(item: ChatHistoryItem) {
  emit('conversationSelect', item.raw.id)
}

const historyIconColors = ['blue', 'cyan', 'green', 'yellow', 'orange', 'pink'] as const

function getHistoryIconColor(item: ChatConversationInfo) {
  const color = item.metadata?.color

  if (typeof color === 'string' && historyIconColors.includes(color as (typeof historyIconColors)[number])) {
    return color
  }

  const checksum = [...item.id].reduce((total, character) => total + character.charCodeAt(0), 0)

  return historyIconColors[checksum % historyIconColors.length]
}
</script>

<template>
  <aside class="doubao-sidebar" :class="`doubao-sidebar--${variant}`">
    <div class="doubao-sidebar__search" aria-label="搜索（展示）">
      <DouBaoIcon name="search" :size="16" />
      <span>搜索</span>
      <kbd>Ctrl K</kbd>
    </div>

    <div class="doubao-sidebar__brand">
      <img
        class="doubao-sidebar__brand-avatar"
        src="https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/chat/favicon-doubao.png"
        alt=""
      />
      <span>豆包</span>
    </div>

    <nav class="doubao-sidebar__navigation" aria-label="主导航">
      <div class="doubao-sidebar__nav-item is-display-only">
        <DouBaoIcon class="doubao-sidebar__nav-icon" name="new-work" />
        <span>新工作任务</span>
      </div>
      <button
        class="doubao-sidebar__nav-item"
        :class="{ 'is-active': !props.conversation.activeId }"
        type="button"
        @click="emit('createConversation')"
      >
        <DouBaoIcon class="doubao-sidebar__nav-icon" name="new-chat" />
        <span>新对话</span>
      </button>
      <div v-for="item in displayNavigationItems" :key="item.id" class="doubao-sidebar__nav-item is-display-only">
        <DouBaoIcon class="doubao-sidebar__nav-icon" :name="item.icon" />
        <span>{{ item.label }}</span>
      </div>
      <div class="doubao-sidebar__nav-item is-display-only">
        <DouBaoIcon name="blocks" />
        <span>技能</span>
      </div>
      <div class="doubao-sidebar__nav-item is-display-only">
        <DouBaoIcon class="doubao-sidebar__nav-icon" name="more" />
        <span>更多</span>
      </div>
    </nav>

    <section class="doubao-sidebar__projects" aria-label="项目">
      <div class="doubao-sidebar__section-title">项目</div>
      <div class="doubao-sidebar__create-project">
        <DouBaoIcon name="plus" />
        <span>创建新项目</span>
      </div>
    </section>

    <section class="doubao-sidebar__recent" aria-label="最近会话">
      <!-- @vue-generic {ChatHistoryItem} -->
      <TrHistory
        class="doubao-sidebar__history"
        :data="historyItems as never"
        :selected="props.conversation.activeId ?? undefined"
        :menu-items="[]"
        @item-click="handleConversationSelect"
      >
        <template #item-prefix="{ item }">
          <span
            class="doubao-sidebar__history-icon"
            :class="`doubao-sidebar__history-icon--${getHistoryIconColor(item)}`"
            aria-hidden="true"
          >
            <DouBaoIcon name="history" :size="13" />
          </span>
        </template>
      </TrHistory>
    </section>
  </aside>
</template>

<style>
.doubao-sidebar {
  box-sizing: border-box;
  width: 238px;
  display: flex;
  flex-direction: column;
  padding: 15px 16px 0;
  overflow: hidden;
  color: #17191c;
  background: #f7f8fa;
}

.doubao-sidebar--fixed {
  width: 100%;
  height: 100%;
}

.doubao-sidebar--floating {
  height: 100%;
  border: 1px solid #e6e8ec;
  border-radius: 14px;
  box-shadow: 0 14px 40px rgb(0 0 0 / 12%);
}

.doubao-sidebar__search {
  height: 36px;
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid #d9dce1;
  border-radius: 8px;
  color: #a1a5ad;
  background: #f2f3f5;
  font-size: 13px;
}

.doubao-sidebar__search span {
  flex: 1;
}

.doubao-sidebar__search kbd {
  color: #aeb2b9;
  background: transparent;
  font: inherit;
}

.doubao-sidebar__brand {
  height: 32px;
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 14px;
  line-height: 32px;
}

.doubao-sidebar__brand-avatar {
  width: 22px;
  height: 22px;
  display: block;
  flex: none;
  border-radius: 50%;
  object-fit: cover;
}

.doubao-sidebar__navigation {
  flex-shrink: 0;
  display: grid;
  gap: 1px;
  margin-top: 5px;
}

.doubao-sidebar__nav-item,
.doubao-sidebar__create-project {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 35px;
  gap: 8px;
  padding: 5px 4px;
  border: 0;
  border-radius: 7px;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: 14px;
  text-align: left;
}

button.doubao-sidebar__nav-item {
  cursor: pointer;
}

button.doubao-sidebar__nav-item:hover,
button.doubao-sidebar__nav-item.is-active {
  background: #eceef2;
}

button.doubao-sidebar__nav-item:focus-visible {
  outline: 2px solid #4c83ff;
  outline-offset: 1px;
}

.doubao-sidebar__nav-item.is-display-only,
.doubao-sidebar__create-project {
  cursor: default;
}

.doubao-sidebar__nav-icon {
  width: 20px;
  height: 20px;
}

.doubao-sidebar__nav-item svg {
  color: #1f2227;
}

.doubao-sidebar__projects {
  flex: none;
  margin-top: 10px;
}

.doubao-sidebar__section-title {
  padding: 4px;
  color: #9ba0a8;
  font-size: 12px;
  line-height: 20px;
}

.doubao-sidebar__create-project {
  color: #a6abb3;
}

.doubao-sidebar__recent {
  min-height: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-top: 9px;
}

.doubao-sidebar__history {
  min-height: 0;
  flex: 1;
  overflow-x: hidden;
  --tr-history-group-title-color: #9ba0a8;
  --tr-history-group-title-font-size: 12px;
  --tr-history-group-title-padding: 4px;
  --tr-history-item-padding: 6px 4px;
  --tr-history-item-padding-editing: 6px 4px;
  --tr-history-item-border-radius: 7px;
  --tr-history-item-hover-bg: #eceef2;
  --tr-history-item-selected-bg: #e9edf5;
  --tr-history-item-space-y: 2px;
}

.doubao-sidebar__history .tr-history__item-actions {
  display: none;
}

.doubao-sidebar__history-icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid currentColor;
  border-radius: 50%;
}

.doubao-sidebar__history-icon--blue {
  color: #72a9e7;
  background: #e9f3ff;
}

.doubao-sidebar__history-icon--cyan {
  color: #62c4b1;
  background: #e7faf6;
}

.doubao-sidebar__history-icon--green {
  color: #8bc865;
  background: #eff9e8;
}

.doubao-sidebar__history-icon--yellow {
  color: #d8b92e;
  background: #fff7d6;
}

.doubao-sidebar__history-icon--orange {
  color: #e89061;
  background: #ffede3;
}

.doubao-sidebar__history-icon--pink {
  color: #df86a3;
  background: #ffedf3;
}
</style>

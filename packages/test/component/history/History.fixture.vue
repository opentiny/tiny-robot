<script setup lang="ts">
import { ref } from 'vue'
import History from '../../../components/src/history/index.vue'
import type { HistoryItem, HistoryMenuItem } from '../../../components/src/history/index.type'

type FixtureItem = HistoryItem & { kind: string }

const flatItems: FixtureItem[] = [
  { id: 'chat-1', title: 'First chat', kind: 'work' },
  { id: 'chat-2', title: 'Second chat', kind: 'personal' },
]

const groupedItems = [
  { group: 'Today', items: [{ id: 'today-1', title: 'Today chat', kind: 'work' }] },
  { group: 'Earlier', items: [{ id: 'old-1', title: 'Older chat', kind: 'personal' }] },
]

const menuItems: HistoryMenuItem[] = [
  { id: 'rename', text: '重命名' },
  { id: 'archive', text: '归档' },
]

const lastItemClick = ref('')
const lastItemAction = ref('')
const lastActionIdentity = ref('')
const confirmedRename = ref('')
const confirmedRenameIdentity = ref('')
const cancelledRename = ref('')
const untouchedRename = ref('')

const recordClick = (item: FixtureItem) => {
  lastItemClick.value = JSON.stringify(item)
}

const recordAction = (action: HistoryMenuItem, item: FixtureItem) => {
  lastItemAction.value = JSON.stringify({ action, item })
  lastActionIdentity.value = item === flatItems.find((candidate) => candidate.id === item.id) ? 'same' : 'different'
}

const serializeRename = (newTitle: string, item: FixtureItem) => JSON.stringify({ newTitle, item })

const recordConfirmedRename = (newTitle: string, item: FixtureItem) => {
  confirmedRename.value = serializeRename(newTitle, item)
  confirmedRenameIdentity.value =
    item === flatItems.find((candidate) => candidate.id === item.id) ? 'same' : 'different'
}

const recordCancelledRename = (newTitle: string, item: FixtureItem) => {
  cancelledRename.value = serializeRename(newTitle, item)
}

const recordUntouchedRename = (newTitle: string, item: FixtureItem) => {
  untouchedRename.value = serializeRename(newTitle, item)
}
</script>

<template>
  <main>
    <section data-testid="flat-history">
      <History
        :data="flatItems"
        selected="chat-2"
        :menu-items="menuItems"
        @item-click="recordClick"
        @item-action="recordAction"
      >
        <template #item-prefix="{ item }">
          <span :data-testid="`prefix-${item.id}`">{{ item.kind }}</span>
        </template>
        <template #item-title="{ item }">
          <strong :data-testid="`title-${item.id}`">{{ item.title }} custom</strong>
        </template>
      </History>
      <output data-testid="item-click-output">{{ lastItemClick }}</output>
      <output data-testid="item-action-output">{{ lastItemAction }}</output>
      <output data-testid="item-action-identity">{{ lastActionIdentity }}</output>
    </section>

    <section data-testid="grouped-history">
      <History :data="groupedItems" />
    </section>

    <section data-testid="empty-history">
      <History :data="[]" />
    </section>

    <button data-testid="outside-confirm" type="button">Outside confirm</button>
    <section data-testid="confirm-history">
      <History
        :data="flatItems"
        :show-rename-controls="true"
        rename-control-on-click-outside="confirm"
        @item-title-change="recordConfirmedRename"
      />
      <output data-testid="confirm-output">{{ confirmedRename }}</output>
      <output data-testid="confirm-identity">{{ confirmedRenameIdentity }}</output>
    </section>

    <button data-testid="outside-cancel" type="button">Outside cancel</button>
    <section data-testid="cancel-history">
      <History :data="flatItems" rename-control-on-click-outside="cancel" @item-title-change="recordCancelledRename" />
      <output data-testid="cancel-output">{{ cancelledRename }}</output>
    </section>

    <button data-testid="outside-none" type="button">Outside none</button>
    <section data-testid="none-history">
      <History :data="flatItems" rename-control-on-click-outside="none" @item-title-change="recordUntouchedRename" />
      <output data-testid="none-output">{{ untouchedRename }}</output>
    </section>
  </main>
</template>

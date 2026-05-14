<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { TrHistory, TrIconButton } from '@opentiny/tiny-robot'
import {
  IconAi,
  IconCheck,
  IconCopy,
  IconDelete,
  IconNewSession,
  IconRefresh,
  IconSearch,
  IconSparkles,
} from '@opentiny/tiny-robot-svgs'

const selectedId = shallowRef<string | undefined>('2')

const historyItems = shallowRef([
  { title: '已选中会话', id: '1', icon: h(IconCheck, { style: { fontSize: '16px' } }) },
  { title: '已复制消息', id: '2', icon: h(IconCopy, { style: { fontSize: '16px' } }) },
  { title: '待删除记录', id: '3', icon: h(IconDelete, { style: { fontSize: '16px' } }) },
])

function handleItemClick(item: { id: string }) {
  selectedId.value = item.id
}
</script>

<template>
  <div class="icon-basic-demo">
    <section class="icon-basic-demo__card">
      <h3 class="icon-basic-demo__title">直接渲染</h3>
      <p class="icon-basic-demo__desc">图标可以像普通 Vue 组件一样直接使用。</p>
      <div class="icon-basic-demo__row">
        <IconAi class="icon-basic-demo__icon icon-basic-demo__icon--xl" />
        <IconSparkles class="icon-basic-demo__icon icon-basic-demo__icon--brand" />
        <IconSearch class="icon-basic-demo__icon icon-basic-demo__icon--muted" />
      </div>
    </section>

    <section class="icon-basic-demo__card">
      <h3 class="icon-basic-demo__title">作为 props 传递</h3>
      <p class="icon-basic-demo__desc">适合 `TrIconButton`、`History`、`Feedback` 等支持 icon 属性的组件。</p>
      <div class="icon-basic-demo__row">
        <TrIconButton size="34" svg-size="18" :icon="IconNewSession" />
        <TrIconButton size="34" svg-size="18" :icon="IconRefresh" />
        <TrIconButton size="34" svg-size="18" :icon="IconSearch" />
      </div>
    </section>

    <section class="icon-basic-demo__card icon-basic-demo__card--wide">
      <h3 class="icon-basic-demo__title">作为 VNode 传递</h3>
      <p class="icon-basic-demo__desc">在需要 VNode 的场景中，可以通过 `h(IconXxx)` 组装图标节点。</p>
      <TrHistory :data="historyItems" :selected="selectedId" @item-click="handleItemClick" />
    </section>
  </div>
</template>

<style scoped>
.icon-basic-demo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.icon-basic-demo__card {
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.icon-basic-demo__card--wide {
  grid-column: 1 / -1;
}

.icon-basic-demo__title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
}

.icon-basic-demo__desc {
  margin: 0 0 14px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.icon-basic-demo__row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.icon-basic-demo__icon {
  font-size: 20px;
}

.icon-basic-demo__icon--xl {
  font-size: 30px;
}

.icon-basic-demo__icon--brand {
  font-size: 24px;
  color: #1476ff;
}

.icon-basic-demo__icon--muted {
  font-size: 18px;
  color: #5b6b82;
}

@media (max-width: 768px) {
  .icon-basic-demo {
    grid-template-columns: 1fr;
  }

  .icon-basic-demo__card--wide {
    grid-column: auto;
  }
}
</style>

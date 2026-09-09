<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconEditPen } from '@opentiny/tiny-robot-svgs'
import type {
  ExtensionCardAction,
  ExtensionCardActionEvent,
} from '../../../components/src/extension-manager/index.type'
import ExtensionCard from '../../../components/src/extension-manager/components/ExtensionCard.vue'

const actions: ExtensionCardAction[] = [
  { id: 'enabled', type: 'switch', label: '启用扩展', checked: true },
  { id: 'hidden', type: 'button', label: '隐藏操作', hidden: true },
  { id: 'disabled', type: 'button', label: '禁用操作', disabled: true },
  { id: 'install', type: 'button', label: '安装' },
  { id: 'inspect', type: 'custom', label: '检查', data: { origin: 'fixture' } },
]

const getOverflowSwitchLabel = (checked: boolean) => (checked ? '停止跟踪更新' : '跟踪更新')

const overflowActions = ref<ExtensionCardAction[]>([
  { id: 'overflow-enabled', type: 'switch', label: getOverflowSwitchLabel(true), checked: true },
  { id: 'overflow-hidden', type: 'button', label: '隐藏溢出操作', hidden: true },
  { id: 'overflow-custom', type: 'custom', label: '自定义溢出操作' },
  { id: 'overflow-danger', type: 'button', label: '危险操作', danger: true },
])

const iconOverflowActions: ExtensionCardAction[] = [
  { id: 'overflow-icon', type: 'button', label: '带图标操作', icon: IconEditPen },
  { id: 'overflow-text', type: 'button', label: '无图标操作' },
]

const lastEvent = ref<ExtensionCardActionEvent>()

const eventChecked = computed(() => {
  return typeof lastEvent.value?.checked === 'boolean' ? String(lastEvent.value.checked) : ''
})

const handleAction = (event: ExtensionCardActionEvent) => {
  lastEvent.value = event

  if (event.type !== 'switch' || typeof event.checked !== 'boolean') return
  const checked = event.checked

  overflowActions.value = overflowActions.value.map((action) =>
    action.id === event.id && action.type === 'switch'
      ? { ...action, checked, label: getOverflowSwitchLabel(checked) }
      : action,
  )
}
</script>

<template>
  <div>
    <ExtensionCard
      data-testid="presentation-card"
      name="Item name"
      description="Item description"
      icon="https://example.com/item-icon.png"
      :name-clickable="false"
    />

    <ExtensionCard data-testid="component-icon-card" name="Component icon" :icon="IconEditPen" />

    <ExtensionCard
      data-testid="actions-card"
      name="Actions card"
      :actions="actions"
      :primary-actions-limit="2"
      overflow-menu-label="扩展操作"
      @action="handleAction"
    />

    <ExtensionCard
      data-testid="custom-fallback-card"
      name="Custom fallback"
      :actions="[{ id: 'fallback', type: 'custom', label: '自定义操作' }]"
      @action="handleAction"
    />

    <ExtensionCard
      data-testid="overflow-switch-card"
      name="Overflow switch"
      :actions="overflowActions"
      :primary-actions-limit="0"
      overflow-menu-label="扩展操作"
      @action="handleAction"
    />

    <ExtensionCard
      data-testid="overflow-without-icons-card"
      name="Overflow without icons"
      :actions="iconOverflowActions"
      :primary-actions-limit="0"
      :overflow-menu-show-icons="false"
      overflow-menu-label="无图标溢出菜单"
      @action="handleAction"
    />

    <ExtensionCard data-testid="progress-card" name="Progress card" progress="indeterminate" />
    <ExtensionCard data-testid="high-progress-card" name="High progress" :progress="125" />
    <ExtensionCard data-testid="low-progress-card" name="Low progress" :progress="-10" />

    <output data-testid="event-id">{{ lastEvent?.id }}</output>
    <output data-testid="event-type">{{ lastEvent?.type }}</output>
    <output data-testid="event-checked">{{ eventChecked }}</output>
  </div>
</template>

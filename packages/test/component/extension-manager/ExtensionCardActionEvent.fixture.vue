<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  ExtensionCardAction,
  ExtensionCardActionEvent,
} from '../../../components/src/extension-manager/index.type'
import ExtensionCard from '../../../components/src/extension-manager/components/ExtensionCard.vue'

const actions = ref<ExtensionCardAction[]>([
  { id: 'toggle-extension', type: 'switch', label: '扩展开关', checked: true },
  { id: 'install-extension', type: 'button', label: '安装' },
  { id: 'inspect-extension', type: 'custom', label: '检查' },
  { id: 'delete-extension', type: 'button', label: '删除' },
])
const lastEvent = ref<ExtensionCardActionEvent>()

const eventChecked = computed(() => {
  return typeof lastEvent.value?.checked === 'boolean' ? String(lastEvent.value.checked) : ''
})

const eventPayload = computed(() => JSON.stringify(lastEvent.value?.payload ?? null))

const handleAction = (event: ExtensionCardActionEvent) => {
  lastEvent.value = event
  if (event.type !== 'switch' || typeof event.checked !== 'boolean') return

  actions.value = actions.value.map((action) =>
    action.id === event.id && action.type === 'switch' ? { ...action, checked: event.checked } : action,
  )
}
</script>

<template>
  <div>
    <ExtensionCard
      data-testid="action-event-card"
      name="Action event card"
      :actions="actions"
      :primary-actions-limit="3"
      overflow-menu-label="扩展操作菜单"
      overflow-menu-placement="top-end"
      @action="handleAction"
    >
      <template #primary-action="{ action, trigger }">
        <button type="button" :aria-label="action.label" @click="trigger({ origin: 'fixture' })">
          {{ action.label }}
        </button>
      </template>
    </ExtensionCard>

    <output data-testid="event-id">{{ lastEvent?.id }}</output>
    <output data-testid="event-type">{{ lastEvent?.type }}</output>
    <output data-testid="event-checked">{{ eventChecked }}</output>
    <output data-testid="event-payload">{{ eventPayload }}</output>
  </div>
</template>

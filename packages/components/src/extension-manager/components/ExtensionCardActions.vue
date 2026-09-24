<script setup lang="ts">
import type { VNode } from 'vue'
import Switch from '../../shared/components/Switch.vue'
import type { ExtensionCardActionEvent, ExtensionCardRenderableAction } from '../index.type'

const props = withDefaults(
  defineProps<{
    actions?: ExtensionCardRenderableAction[]
  }>(),
  {
    actions: () => [],
  },
)

defineSlots<{
  'primary-action'?: (props: {
    action: Extract<ExtensionCardRenderableAction, { type: 'custom' }>
    trigger: (payload?: unknown) => void
  }) => VNode[]
}>()

const emit = defineEmits<{
  (e: 'action', payload: ExtensionCardActionEvent): void
}>()

const handleSwitch = (action: Extract<ExtensionCardRenderableAction, { type: 'switch' }>, checked: boolean) => {
  if (action.disabled) return

  emit('action', {
    id: action.id,
    type: action.type,
    checked,
  })
}

const handleButton = (action: Extract<ExtensionCardRenderableAction, { type: 'button' }>) => {
  if (action.disabled) return
  emit('action', { id: action.id, type: action.type })
}

const handleCustom = (action: Extract<ExtensionCardRenderableAction, { type: 'custom' }>, payload?: unknown) => {
  if (action.disabled) return

  const event: ExtensionCardActionEvent = { id: action.id, type: action.type }
  if (payload !== undefined) event.payload = payload

  emit('action', event)
}
</script>

<template>
  <div class="tr-extension-card-primary-actions">
    <template v-for="action in props.actions" :key="action.id">
      <Switch
        v-if="action.type === 'switch'"
        class="tr-extension-card-primary-actions__switch"
        :class="{ 'is-disabled': action.disabled, 'is-danger': action.danger }"
        :model-value="action.checked"
        :disabled="action.disabled"
        :label="action.label"
        @update:model-value="handleSwitch(action, $event)"
      />

      <button
        v-else-if="action.type === 'button'"
        class="tr-extension-card-primary-actions__button"
        :class="{ 'is-danger': action.danger }"
        type="button"
        :aria-label="action.label"
        :disabled="action.disabled"
        @click="handleButton(action)"
      >
        <component v-if="action.icon" :is="action.icon" class="tr-extension-card-primary-actions__button-icon" />
        <span>{{ action.label }}</span>
      </button>

      <span
        v-else-if="$slots['primary-action']"
        class="tr-extension-card-primary-actions__custom-action"
        :class="{ 'is-disabled': action.disabled, 'is-danger': action.danger }"
      >
        <slot name="primary-action" :action="action" :trigger="(payload: unknown) => handleCustom(action, payload)" />
      </span>

      <button
        v-else
        class="tr-extension-card-primary-actions__button"
        :class="{ 'is-danger': action.danger }"
        type="button"
        :aria-label="action.label"
        :disabled="action.disabled"
        @click="handleCustom(action)"
      >
        <component v-if="action.icon" :is="action.icon" class="tr-extension-card-primary-actions__button-icon" />
        <span>{{ action.label }}</span>
      </button>
    </template>
  </div>
</template>

<style lang="less" scoped>
.tr-extension-card-primary-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tr-extension-card-primary-actions__switch {
  --tr-switch-bg-color: var(--tr-extension-card-switch-bg-color, var(--tr-text-disabled));
  --tr-switch-bg-color-checked: var(--tr-extension-card-switch-bg-color-checked, var(--tr-color-primary));

  &.is-danger {
    color: var(--tr-color-error);
  }
}

.tr-extension-card-primary-actions__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 48px;
  padding: 4px 12px;
  border: 0;
  border-radius: 999px;
  background: var(--tr-extension-card-bg-color-hover, var(--tr-container-bg-hover));
  color: var(--tr-text-primary);
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: color-mix(
      in srgb,
      var(--tr-extension-card-bg-color-hover, var(--tr-container-bg-hover)) 80%,
      var(--tr-text-primary) 20%
    );
  }

  &:active:not(:disabled) {
    background-color: var(--tr-container-bg-active);
  }

  &.is-danger {
    color: var(--tr-color-error);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.tr-extension-card-primary-actions__button-icon {
  flex: 0 0 var(--tr-extension-card-action-icon-size, 16px);
  width: var(--tr-extension-card-action-icon-size, 16px);
  height: var(--tr-extension-card-action-icon-size, 16px);
}

.tr-extension-card-primary-actions__custom-action {
  display: inline-flex;
  align-items: center;

  &.is-disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &.is-danger {
    color: var(--tr-color-error);
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { IconMore } from '@opentiny/tiny-robot-svgs'
import type {
  ExtensionCardActionEvent,
  ExtensionCardOverflowMenuPlacement,
  ExtensionCardRenderableAction,
} from '../index.type'
import ExtensionCardPopover from './ExtensionCardPopover.vue'

const props = withDefaults(
  defineProps<{
    actions?: ExtensionCardRenderableAction[]
    label?: string
    placement?: ExtensionCardOverflowMenuPlacement
    showIcons?: boolean
  }>(),
  {
    actions: () => [],
    label: '更多操作',
    placement: 'bottom-end',
    showIcons: true,
  },
)

const emit = defineEmits<{
  (e: 'action', action: ExtensionCardActionEvent): void
}>()

const hasActionIcons = computed(() => props.showIcons && props.actions.some((action) => Boolean(action.icon)))

const handleAction = (action: ExtensionCardRenderableAction, close: () => void) => {
  if (action.disabled) return

  close()

  emit('action', {
    id: action.id,
    type: action.type,
    ...(action.type === 'switch' ? { checked: !action.checked } : {}),
  })
}
</script>

<template>
  <div v-if="props.actions.length" class="tr-extension-card__more-action">
    <ExtensionCardPopover as-child :placement="props.placement">
      <template #trigger="{ popoverId, open }">
        <button
          class="tr-extension-card__icon-button"
          type="button"
          :popovertarget="popoverId"
          popovertargetaction="toggle"
          :title="props.label"
          :aria-label="props.label"
          :aria-expanded="open"
        >
          <IconMore class="tr-extension-card__action-icon" />
        </button>
      </template>
      <template #content="{ close }">
        <ul class="tr-extension-card__more-menu">
          <li v-for="action in props.actions" :key="action.id">
            <button
              class="tr-extension-card__more-menu-item"
              :class="{ 'is-danger': action.danger }"
              type="button"
              :disabled="action.disabled"
              :aria-pressed="action.type === 'switch' ? action.checked : undefined"
              @click="handleAction(action, close)"
            >
              <span v-if="hasActionIcons" class="tr-extension-card__more-menu-item-icon-slot">
                <component v-if="action.icon" :is="action.icon" class="tr-extension-card__more-menu-item-icon" />
                <span v-else class="tr-extension-card__more-menu-item-icon-placeholder" aria-hidden="true"></span>
              </span>
              <span>{{ action.label }}</span>
            </button>
          </li>
        </ul>
      </template>
    </ExtensionCardPopover>
  </div>
</template>

<style lang="less" scoped>
.tr-extension-card__more-action {
  display: inline-flex;
  align-items: center;
}

.tr-extension-card__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--tr-extension-card-bg-color-hover);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.tr-extension-card__action-icon {
  width: 16px;
  height: 16px;
  color: var(--tr-extension-card-icon-color);
  transform: rotate(90deg);
}

.tr-extension-card__more-menu {
  padding: 0;
  margin: 0;
  list-style: none;
}

.tr-extension-card__more-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 12px;
  border: 0;
  background: transparent;
  color: var(--tr-dropdown-menu-item-color);
  cursor: pointer;
  font-size: 14px;
  line-height: 24px;
  text-align: left;
  white-space: nowrap;
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background-color: var(--tr-dropdown-menu-item-hover-bg-color);
  }

  &.is-danger {
    color: var(--tr-color-error);

    &:hover:not(:disabled) {
      background-color: var(--tr-color-error-light);
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.tr-extension-card__more-menu-item-icon {
  flex: 0 0 auto;
  width: var(--tr-extension-card-action-icon-size, 16px);
  height: var(--tr-extension-card-action-icon-size, 16px);
}

.tr-extension-card__more-menu-item-icon-slot {
  display: inline-flex;
  flex: 0 0 var(--tr-extension-card-menu-icon-slot-size, 16px);
  align-items: center;
  justify-content: center;
  width: var(--tr-extension-card-menu-icon-slot-size, 16px);
  height: var(--tr-extension-card-menu-icon-slot-size, 16px);
}

.tr-extension-card__more-menu-item-icon-placeholder {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

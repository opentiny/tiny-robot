<script setup lang="ts">
import { computed, useSlots, watch } from 'vue'
import type {
  ExtensionCardActionEvent,
  ExtensionCardEmits,
  ExtensionCardProps,
  ExtensionCardSlots,
} from '../index.type'
import ExtensionCardMoreMenu from './ExtensionCardMoreMenu.vue'
import ExtensionCardActions from './ExtensionCardActions.vue'

const props = withDefaults(defineProps<ExtensionCardProps>(), {
  actions: () => [],
  primaryActionsLimit: 1,
  nameClickable: true,
  overflowMenuLabel: '更多操作',
  overflowMenuPlacement: 'bottom-end',
  overflowMenuShowIcons: true,
})

const slots = useSlots()
defineSlots<ExtensionCardSlots>()

const emit = defineEmits<ExtensionCardEmits>()

const visibleActions = computed(() => props.actions.filter((action) => !action.hidden))

const normalizedPrimaryActionsLimit = computed(() => Math.max(0, Math.floor(props.primaryActionsLimit)))

const primaryActions = computed(() => visibleActions.value.slice(0, normalizedPrimaryActionsLimit.value))

const overflowActions = computed(() => visibleActions.value.slice(normalizedPrimaryActionsLimit.value))

const shouldShowActions = computed(() => primaryActions.value.length > 0 || overflowActions.value.length > 0)

const normalizedProgress = computed(() => {
  if (props.progress === 'indeterminate' || props.progress === undefined) return props.progress
  return Math.min(100, Math.max(0, props.progress))
})

const hasPrimaryActionSlot = computed(() => Boolean(slots['primary-action']))

if (import.meta.env.DEV) {
  let lastDuplicateIdSet: string | undefined

  const getDuplicateIdSet = () => {
    const seenIds = new Set<string>()
    const duplicateIds = new Set<string>()

    for (const action of props.actions) {
      if (seenIds.has(action.id)) duplicateIds.add(action.id)
      seenIds.add(action.id)
    }

    const duplicateIdList = [...duplicateIds].sort()

    return duplicateIdList.length ? duplicateIdList.join('\u0000') : undefined
  }

  watch(
    getDuplicateIdSet,
    (duplicateIdSet) => {
      if (duplicateIdSet === lastDuplicateIdSet) return

      lastDuplicateIdSet = duplicateIdSet
      if (duplicateIdSet === undefined) return

      console.warn('[ExtensionManager.Card] Action ids must be unique:', duplicateIdSet.split('\u0000'))
    },
    { immediate: true },
  )
}

const handleOverflowAction = (action: ExtensionCardActionEvent) => {
  emit('action', action)
}

const handleNameClick = (event: MouseEvent) => {
  if (!props.nameClickable) return
  emit('name-click', event)
}

const handleNameKeydown = (event: KeyboardEvent) => {
  if (!props.nameClickable || (event.key !== 'Enter' && event.key !== ' ')) return
  event.preventDefault()
  emit('name-click', event)
}
</script>

<template>
  <div class="tr-extension-card">
    <div class="tr-extension-card__icon-region">
      <img v-if="typeof icon === 'string' && icon" :src="icon" :alt="name" class="tr-extension-card__icon" />
      <component v-else-if="icon" :is="icon" class="tr-extension-card__icon" />
      <div v-else class="tr-extension-card__icon tr-extension-card__icon--placeholder">
        {{ name.slice(0, 1) }}
      </div>
    </div>

    <div class="tr-extension-card__content">
      <div
        class="tr-extension-card__name"
        :class="{ 'is-clickable': nameClickable }"
        :role="nameClickable ? 'button' : undefined"
        :tabindex="nameClickable ? 0 : undefined"
        :title="name"
        @click="handleNameClick"
        @keydown="handleNameKeydown"
      >
        {{ name }}
      </div>
      <div v-if="description" class="tr-extension-card__description" :title="description">
        {{ description }}
      </div>
    </div>

    <div v-if="shouldShowActions" class="tr-extension-card__actions" @click.stop @keydown.stop>
      <ExtensionCardActions v-if="primaryActions.length" :actions="primaryActions" @action="emit('action', $event)">
        <template v-if="hasPrimaryActionSlot" #primary-action="slotProps">
          <slot name="primary-action" v-bind="slotProps" />
        </template>
      </ExtensionCardActions>

      <ExtensionCardMoreMenu
        v-if="overflowActions.length"
        :actions="overflowActions"
        :label="overflowMenuLabel"
        :placement="overflowMenuPlacement"
        :show-icons="overflowMenuShowIcons"
        @action="handleOverflowAction"
      />
    </div>

    <div
      v-if="normalizedProgress !== undefined"
      class="tr-extension-card__progress"
      role="progressbar"
      :aria-label="name"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="normalizedProgress === 'indeterminate' ? undefined : normalizedProgress"
    >
      <span
        class="tr-extension-card__progress-bar"
        :class="{ 'is-indeterminate': normalizedProgress === 'indeterminate' }"
        :style="normalizedProgress === 'indeterminate' ? undefined : { width: `${normalizedProgress}%` }"
      ></span>
    </div>
  </div>
</template>

<style lang="less">
:root {
  --tr-extension-card-bg-color: #f8f8f8;
  --tr-extension-card-bg-color-hover: rgba(0, 0, 0, 0.04);
  --tr-extension-card-focus-color: #191919;
  --tr-extension-card-icon-color: #808080;
  --tr-extension-card-switch-bg-color: var(--tr-text-disabled);
  --tr-extension-card-switch-bg-color-checked: var(--tr-color-primary);
}
</style>

<style lang="less" scoped>
.tr-extension-card {
  --tr-extension-card-action-icon-size: 16px;
  --tr-extension-card-menu-icon-slot-size: var(--tr-extension-card-action-icon-size);
  --tr-extension-card-progress-bg-color: var(--tr-extension-card-bg-color-hover);
  --tr-extension-card-progress-bar-color: var(--tr-success-color, #52c41a);

  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  min-height: 86px;
  padding: 14px 20px;
  border-radius: 8px;
  background: var(--tr-extension-card-bg-color);
  overflow: hidden;
}

.tr-extension-card__icon-region {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
}

.tr-extension-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  overflow: hidden;
}

.tr-extension-card__icon--placeholder {
  background: var(--tr-extension-card-bg-color-hover);
  color: var(--tr-text-secondary);
  font-size: 18px;
  font-weight: 600;
  cursor: default;
}

.tr-extension-card__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
}

.tr-extension-card__name {
  align-self: flex-start;
  max-width: 100%;
  overflow: hidden;
  color: var(--tr-text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  outline: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
}

.tr-extension-card__name.is-clickable:hover {
  text-decoration: underline;
}

.tr-extension-card__name.is-clickable:focus-visible {
  border-radius: 4px;
  box-shadow: 0 0 0 2px var(--tr-extension-card-focus-color);
}

.tr-extension-card__description {
  overflow: hidden;
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tr-extension-card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.tr-extension-card__progress {
  position: absolute;
  right: 20px;
  bottom: 8px;
  left: 74px;
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--tr-extension-card-progress-bg-color);
}

.tr-extension-card__progress-bar {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--tr-extension-card-progress-bar-color);
  transition: width 240ms ease-out;
}

.tr-extension-card__progress-bar.is-indeterminate {
  width: 40%;
  animation: tr-extension-card-progress-indeterminate 1.2s ease-in-out infinite;
}

@keyframes tr-extension-card-progress-indeterminate {
  0% {
    transform: translateX(-120%);
  }

  100% {
    transform: translateX(260%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tr-extension-card__progress-bar {
    transition: none;
  }

  .tr-extension-card__progress-bar.is-indeterminate {
    animation: none;
  }
}
</style>

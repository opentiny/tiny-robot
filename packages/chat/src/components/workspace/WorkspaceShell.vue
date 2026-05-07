<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useSlots } from 'vue'
import { CHAT_UI_KEY } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'
import type { TrChatWorkspaceShellProps } from '@/types'
import { useWorkspaceRegion } from './useWorkspaceRegion'
import ConditionalThemeProvider from '@/components/shared/ConditionalThemeProvider.vue'

defineOptions({ name: 'TrChatWorkspaceShell' })

const props = withDefaults(
  defineProps<
    TrChatWorkspaceShellProps & {
      mobile?: boolean
    }
  >(),
  {
    leftCollapsed: undefined,
    rightCollapsed: undefined,
    mobile: false,
  },
)

const emit = defineEmits<{
  'update:leftCollapsed': [value: boolean]
  'update:rightCollapsed': [value: boolean]
}>()

const slots = useSlots()
const chatUi = inject(CHAT_UI_KEY, null)
const chatMessages = useResolvedChatMessages()
const shellElement = ref<HTMLElement | null>(null)
const leftRegion = computed(() => props.leftRegion)
const rightRegion = computed(() => props.rightRegion)

const left = useWorkspaceRegion({
  side: 'left',
  region: leftRegion,
  controlledCollapsed: computed(() => props.leftCollapsed),
  onUpdateCollapsed: (value) => emit('update:leftCollapsed', value),
})

const right = useWorkspaceRegion({
  side: 'right',
  region: rightRegion,
  controlledCollapsed: computed(() => props.rightCollapsed),
  onUpdateCollapsed: (value) => emit('update:rightCollapsed', value),
})

const showLeftRegion = computed(() => !props.mobile && props.leftRegion?.enabled !== false && Boolean(slots.left))
const showRightRegion = computed(() => !props.mobile && props.rightRegion?.enabled !== false && Boolean(slots.right))
const showLeftRail = computed(
  () =>
    showLeftRegion.value && left.isCollapsible.value && left.collapsedState.value && left.collapseMode.value === 'rail',
)
const showRightRail = computed(
  () =>
    showRightRegion.value &&
    right.isCollapsible.value &&
    right.collapsedState.value &&
    right.collapseMode.value === 'rail',
)
const hideLeftRegion = computed(() => left.collapsedState.value && left.collapseMode.value === 'hidden')
const hideRightRegion = computed(() => right.collapsedState.value && right.collapseMode.value === 'hidden')
const leftRailLabel = computed(
  () => props.leftRailLabel || props.leftRegion?.railLabel || chatMessages.value.workspace.historyRailLabel,
)
const rightRailLabel = computed(
  () => props.rightRailLabel || props.rightRegion?.railLabel || chatMessages.value.workspace.previewRailLabel,
)

onMounted(() => {
  chatUi?.workspace.setResponsiveHost(shellElement.value)
})

onBeforeUnmount(() => {
  chatUi?.workspace.setResponsiveHost(null)
})
</script>

<template>
  <ConditionalThemeProvider :appearance="props.appearance" scope-id-prefix="tr-workspace-theme-scope">
    <template #default="{ themeScopeId }">
      <div
        :id="themeScopeId"
        ref="shellElement"
        class="tr-workspace-shell"
        :data-tr-appearance-mode="props.appearance?.mode"
      >
        <aside
          v-if="showLeftRegion"
          class="tr-workspace-shell__region tr-workspace-shell__region--left"
          :class="{
            'is-collapsed': left.collapsedState.value,
            'is-hidden': hideLeftRegion,
          }"
          :style="{ '--workspace-region-width': left.regionWidth.value }"
        >
          <button
            v-if="showLeftRail"
            type="button"
            class="tr-workspace-shell__rail"
            :aria-label="leftRailLabel"
            @click="left.updateCollapsed(false)"
          >
            <slot name="left-rail" :expand="() => left.updateCollapsed(false)" />
          </button>

          <div
            class="tr-workspace-shell__region-content"
            :class="{ 'is-hidden': left.collapsedState.value && showLeftRail }"
          >
            <slot
              name="left"
              :collapsed="left.collapsedState.value"
              :toggle="left.toggleRegion"
              :collapse="() => left.updateCollapsed(true)"
              :expand="() => left.updateCollapsed(false)"
            />
          </div>
        </aside>

        <section class="tr-workspace-shell__center">
          <div class="tr-workspace-shell__center-content">
            <slot />
          </div>
        </section>

        <aside
          v-if="showRightRegion"
          class="tr-workspace-shell__region tr-workspace-shell__region--right"
          :class="{
            'is-collapsed': right.collapsedState.value,
            'is-hidden': hideRightRegion,
          }"
          :style="{ '--workspace-region-width': right.regionWidth.value }"
        >
          <button
            v-if="showRightRail"
            type="button"
            class="tr-workspace-shell__rail"
            :aria-label="rightRailLabel"
            @click="right.updateCollapsed(false)"
          >
            <slot name="right-rail" :expand="() => right.updateCollapsed(false)" />
          </button>

          <div
            class="tr-workspace-shell__region-content"
            :class="{ 'is-hidden': right.collapsedState.value && showRightRail }"
          >
            <slot
              name="right"
              :collapsed="right.collapsedState.value"
              :toggle="right.toggleRegion"
              :collapse="() => right.updateCollapsed(true)"
              :expand="() => right.updateCollapsed(false)"
            />
          </div>
        </aside>
      </div>
    </template>
  </ConditionalThemeProvider>
</template>

<style scoped lang="less">
.tr-workspace-shell {
  --workspace-shell-bg: var(--chat-workspace-bg, var(--chat-surface-bg, var(--tr-page-bg-default, #fff)));
  --workspace-shell-region-bg: var(
    --chat-workspace-panel-bg,
    var(--chat-panel-bg, var(--tr-container-bg-default, #fff))
  );
  --workspace-shell-region-bg-muted: var(
    --chat-workspace-panel-bg-muted,
    var(--chat-panel-bg-muted, var(--tr-container-bg-default-2, #f7f7f7))
  );
  --workspace-shell-border-color: var(
    --chat-workspace-border,
    var(--chat-panel-border, var(--tr-border-color-disabled, rgba(15, 23, 42, 0.08)))
  );
  --workspace-shell-text-primary: var(
    --chat-workspace-text-primary,
    var(--chat-text-primary, var(--tr-text-primary, #111827))
  );
  --workspace-shell-text-secondary: var(
    --chat-workspace-text-secondary,
    var(--chat-text-secondary, var(--tr-text-secondary, #6b7280))
  );
  --workspace-shell-accent: var(--chat-workspace-accent, var(--chat-accent-color, var(--tr-color-primary, #2f6bff)));
  --workspace-shell-accent-soft: var(
    --chat-workspace-accent-soft,
    var(--chat-accent-bg, var(--tr-color-primary-light, rgba(47, 107, 255, 0.12)))
  );
  --workspace-shell-hover-bg: var(
    --chat-workspace-hover-bg,
    var(--chat-surface-bg-hover, var(--tr-container-bg-hover, rgba(15, 23, 42, 0.06)))
  );
  --workspace-shell-shadow: var(
    --chat-workspace-shadow,
    var(--chat-shadow-sm, var(--tr-shadow-sm, 0 10px 24px rgba(15, 23, 42, 0.08)))
  );
  --workspace-shell-rail-width: var(--chat-workspace-rail-width, 48px);
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--workspace-shell-bg);
  color: var(--workspace-shell-text-primary);

  &__region {
    position: relative;
    flex-shrink: 0;
    width: var(--workspace-region-width);
    min-height: 0;
    overflow: hidden;
    border-right: 0;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--workspace-shell-region-bg) 92%, white 8%) 0%,
      var(--workspace-shell-region-bg-muted) 100%
    );
    transition:
      width 0.32s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.2s ease,
      transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
      background-color 0.2s ease;

    &--right {
      border-right: 0;
      border-left: 0;
      background: var(--workspace-shell-region-bg);
    }

    &.is-collapsed {
      width: var(--workspace-shell-rail-width);
    }

    &.is-hidden {
      width: 0;
      border-width: 0;
    }
  }

  &__rail {
    position: absolute;
    inset: 0;
    border: 0;
    background: transparent;
    padding: 0;
  }

  &__region-content {
    height: 100%;
    transition:
      opacity 0.18s ease,
      transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform;

    &.is-hidden {
      opacity: 0;
      pointer-events: none;
    }
  }

  &__region--left > &__region-content {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--workspace-region-width);
    min-width: var(--workspace-region-width);
    transform-origin: left center;
  }

  &__region--right > &__region-content {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--workspace-region-width);
    min-width: var(--workspace-region-width);
    transform-origin: right center;
  }

  &__region--left.is-hidden > &__region-content,
  &__region--left > &__region-content.is-hidden {
    opacity: 0;
    transform: translateX(-18px);
    pointer-events: none;
  }

  &__region--right.is-hidden > &__region-content,
  &__region--right > &__region-content.is-hidden {
    opacity: 0;
    transform: translateX(18px);
    pointer-events: none;
  }

  &__center {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    background: var(--workspace-shell-bg);
  }

  &__center-content {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
  }
}
</style>

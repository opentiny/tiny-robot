<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import AsideResizeTrigger from './AsideResizeTrigger.vue'
import type { LayoutAsideResizeDetail } from '../index.type'
import type { LayoutAsideState } from '../internal.type'

defineOptions({
  name: 'LayoutAsideContent',
})

interface LayoutAsideContentProps {
  panel: LayoutAsideState
  oppositeDockWidth: number
  drawerId: string
  accessibleName: string
}

const asideRef = ref<HTMLElement | null>(null)
const props = defineProps<LayoutAsideContentProps>()

const emit = defineEmits<{
  (event: 'width-change', value: number): void
  (event: 'aside-resize-start', value: LayoutAsideResizeDetail): void
  (event: 'aside-resize-end', value: LayoutAsideResizeDetail): void
}>()

function parseCssTime(value: string): number {
  const trimmed = value.trim()
  const amount = Number.parseFloat(trimmed)
  if (!Number.isFinite(amount)) return 0
  return trimmed.endsWith('ms') ? amount : amount * 1000
}

async function waitForDrawerReveal(aside: HTMLElement): Promise<void> {
  const style = getComputedStyle(aside)
  const durations = style.transitionDuration.split(',').map(parseCssTime)
  const delays = style.transitionDelay.split(',').map(parseCssTime)
  const totalDuration = Math.max(0, ...durations.map((duration, index) => duration + (delays[index] ?? delays[0] ?? 0)))

  if (totalDuration === 0) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    return
  }

  await new Promise<void>((resolve) => {
    let timeoutId = 0
    const finish = () => {
      aside.removeEventListener('transitionend', handleTransitionEnd)
      window.clearTimeout(timeoutId)
      resolve()
    }
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target === aside) finish()
    }
    aside.addEventListener('transitionend', handleTransitionEnd)
    timeoutId = window.setTimeout(finish, totalDuration + 50)
  })
}

const asideClass = computed(() => [
  `tr-layout__aside--${props.panel.side}`,
  `tr-layout__aside--effect-${props.panel.collapseEffect.value}`,
  {
    'tr-layout__aside--dock': props.panel.isDock.value,
    'tr-layout__aside--drawer': props.panel.isDrawer.value,
    'tr-layout__aside--expanded': props.panel.isOpen.value,
    'tr-layout__aside--rail': props.panel.isRail.value,
    'tr-layout__aside--hidden': props.panel.isHidden.value,
  },
])

watch(props.panel.isOpen, async (open) => {
  if (!open || !props.panel.isDrawer.value) return
  await nextTick()
  const aside = asideRef.value
  if (!aside) return
  aside.focus({ preventScroll: true })
  await waitForDrawerReveal(aside)
  if (!props.panel.isOpen.value || !props.panel.isDrawer.value || asideRef.value !== aside) return
  const focusable = Array.from(
    aside.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).find((element) => element.checkVisibility() && !element.closest('.is-hidden, [aria-hidden="true"], [inert]'))
  const target = focusable ?? aside
  target.focus({ preventScroll: true })
  if (document.activeElement !== target) aside.focus({ preventScroll: true })
})
</script>

<template>
  <aside
    :id="drawerId"
    ref="asideRef"
    class="tr-layout__aside"
    :class="asideClass"
    :inert="props.panel.isHidden.value || undefined"
    :role="props.panel.isDrawer.value ? 'dialog' : undefined"
    :aria-modal="props.panel.isDrawer.value ? 'true' : undefined"
    :aria-label="props.panel.isDrawer.value ? accessibleName : undefined"
    :tabindex="props.panel.isDrawer.value ? -1 : undefined"
  >
    <AsideResizeTrigger
      v-if="panel.canResize.value"
      :side="panel.side"
      :aside-el="asideRef"
      :min-width="panel.minExpandedWidth.value"
      :max-width="panel.maxExpandedWidth.value"
      :opposite-dock-width="oppositeDockWidth"
      @width-change="emit('width-change', $event)"
      @aside-resize-start="emit('aside-resize-start', $event)"
      @aside-resize-end="emit('aside-resize-end', $event)"
    />
    <div class="tr-layout__aside-mask">
      <div class="tr-layout__aside-body">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style lang="less" scoped>
.tr-layout__aside {
  min-width: 0;
  min-height: 0;
  position: relative;
  overflow: visible;

  &--left {
    --tr-layout-aside-expanded-width: var(--left-dock-width);
    --tr-layout-aside-collapsed-width: var(--left-collapsed-width);
    --tr-layout-aside-rail-overlay-transform: translateX(0);
    --tr-layout-aside-rail-slide-transform: translateX(
      calc(var(--tr-layout-aside-collapsed-width) - var(--tr-layout-aside-expanded-width))
    );
    --tr-layout-aside-hidden-transform: translateX(calc(-100% - var(--hidden-offset, 12px)));

    grid-area: left;
    background: var(--tr-layout-left-aside-bg);
    border-inline-end: 1px solid var(--tr-layout-divider-color);
  }

  &--right {
    --tr-layout-aside-expanded-width: var(--right-dock-width);
    --tr-layout-aside-collapsed-width: var(--right-collapsed-width);
    --tr-layout-aside-rail-overlay-transform: translateX(
      calc(var(--tr-layout-aside-collapsed-width) - var(--tr-layout-aside-expanded-width))
    );
    --tr-layout-aside-rail-slide-transform: translateX(0);
    --tr-layout-aside-hidden-transform: translateX(calc(100% + var(--hidden-offset, 12px)));

    grid-area: right;
    background: var(--tr-layout-right-aside-bg);
    border-inline-start: 1px solid var(--tr-layout-divider-color);
  }

  &--hidden {
    border-color: transparent;
  }

  &--dock {
    position: relative;
    z-index: 1;

    &.tr-layout__aside--rail {
      overflow: visible;
    }
  }

  &--drawer {
    position: absolute;
    grid-area: auto;
    top: 0;
    bottom: 0;
    z-index: var(--overlay-z-index);
    width: var(--tr-layout-drawer-width, var(--tr-layout-aside-expanded-width));
    max-width: 100%;
    overflow: hidden;
    visibility: hidden;
    pointer-events: none;
    box-shadow: var(--tr-layout-panel-shadow);
    will-change: transform;
    transition:
      transform var(--transition-duration) var(--transition-easing),
      visibility var(--transition-duration) var(--transition-easing);

    &.tr-layout__aside--left {
      left: 0;
      transform: translateX(-100%);
    }

    &.tr-layout__aside--right {
      right: 0;
      transform: translateX(100%);
    }

    &.tr-layout__aside--expanded {
      visibility: visible;
      pointer-events: auto;
      transform: translateX(0);
    }
  }
}

.tr-layout__aside-mask {
  min-width: 0;
  min-height: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.tr-layout__aside-body {
  min-width: 0;
  min-height: 0;
  width: var(--tr-layout-aside-expanded-width);
  height: 100%;
  transition: var(--tr-layout-aside-body-transition);
  will-change: width, transform;
}

.tr-layout__aside--drawer .tr-layout__aside-body {
  width: var(--tr-layout-drawer-width, var(--tr-layout-aside-expanded-width));
}

.tr-layout__aside--dock .tr-layout__aside-body {
  transform: translateX(0);
}

.tr-layout__aside--dock.tr-layout__aside--rail.tr-layout__aside--effect-overlay .tr-layout__aside-body {
  transform: var(--tr-layout-aside-rail-overlay-transform);
}

.tr-layout__aside--dock.tr-layout__aside--rail.tr-layout__aside--effect-slide .tr-layout__aside-body {
  transform: var(--tr-layout-aside-rail-slide-transform);
}

.tr-layout__aside--dock.tr-layout__aside--hidden .tr-layout__aside-body {
  transform: var(--tr-layout-aside-hidden-transform);
}
</style>

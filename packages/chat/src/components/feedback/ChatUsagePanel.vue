<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useDateFormat } from '@vueuse/core'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { TrIconButton } from '@opentiny/tiny-robot'
import { IconInfo } from '@opentiny/tiny-robot-svgs'
import type { UsageInfo } from './useUsageInfo'

defineOptions({ name: 'TrChatUsagePanel' })

defineProps<{ usage: UsageInfo }>()

const triggerRef = ref<InstanceType<typeof TrIconButton> | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)
const visible = ref(false)
const panelStyle = ref({ top: '0px', left: '0px' })

async function updatePosition() {
  const triggerEl =
    (triggerRef.value as unknown as { $el?: HTMLElement })?.$el ?? (triggerRef.value as unknown as HTMLElement)
  if (!triggerEl || !panelRef.value) return
  const { x, y } = await computePosition(triggerEl, panelRef.value, {
    placement: 'bottom',
    strategy: 'fixed',
    middleware: [
      offset(6),
      flip({ fallbackPlacements: ['top'], boundary: 'clippingAncestors' }),
      shift({ padding: 8, boundary: 'clippingAncestors' }),
    ],
  })
  panelStyle.value = { top: `${y}px`, left: `${x}px` }
}

async function show() {
  visible.value = true
  await nextTick()
  await updatePosition()
}

function hide() {
  visible.value = false
}

function formatTime(ts?: number) {
  if (!ts) return '-'
  return useDateFormat(ts * 1000, 'YYYY-MM-DD HH:mm:ss').value
}
</script>

<template>
  <div class="tr-chat-usage" @mouseenter="show" @mouseleave="hide">
    <TrIconButton ref="triggerRef" :icon="IconInfo" aria-label="查看用量" />
    <Transition name="tr-chat-usage-fade">
      <div v-if="visible" ref="panelRef" class="tr-chat-usage__panel" role="tooltip" :style="panelStyle">
        <div
          v-for="item in [
            { label: '模型', value: usage.model || '-' },
            { label: '结束原因', value: usage.finishReason || '-' },
            { label: '时间', value: formatTime(usage.createdAt) },
            { label: '输入 Token', value: usage.promptTokens ?? '-' },
            { label: '输出 Token', value: usage.completionTokens ?? '-' },
            { label: '总计 Token', value: usage.totalTokens ?? '-' },
          ]"
          :key="item.label"
          class="tr-chat-usage__row"
        >
          <span class="tr-chat-usage__label">{{ item.label }}</span>
          <span class="tr-chat-usage__value">{{ item.value }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-usage {
  position: relative;
  display: inline-flex;
  align-items: center;

  .tr-chat-usage__panel {
    position: fixed;
    z-index: var(--tr-z-index-dropdown, 1000);
    min-width: 200px;
    padding: 10px 12px;
    background: var(--chat-surface-bg, #fff);
    border: 1px solid var(--chat-surface-border, rgba(0, 0, 0, 0.08));
    border-radius: 10px;
    box-shadow: var(--chat-shadow-sm, 0 4px 16px 0 rgba(0, 0, 0, 0.1));
    white-space: nowrap;
  }

  .tr-chat-usage__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 2px 0;
    font-size: 12px;
    line-height: 20px;
  }

  .tr-chat-usage__label {
    color: var(--chat-text-secondary, rgb(128, 128, 128));
    flex-shrink: 0;
  }

  .tr-chat-usage__value {
    color: var(--chat-text-primary, rgb(25, 25, 25));
    font-variant-numeric: tabular-nums;
  }
}

.tr-chat-usage-fade-enter-active,
.tr-chat-usage-fade-leave-active {
  transition: opacity 0.15s ease;
}

.tr-chat-usage-fade-enter-from,
.tr-chat-usage-fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import { IconFileFolder } from '@opentiny/tiny-robot-svgs'
import { useResolvedChatMessages } from '@/shared/messages'

defineOptions({ name: 'TrChatWorkspaceRightEmpty' })

const chatMessages = useResolvedChatMessages()
</script>

<template>
  <div class="tr-chat-workspace-right-empty">
    <span class="tr-chat-workspace-right-empty__icon">
      <IconFileFolder />
    </span>
    <strong>{{ chatMessages.sidebar.emptyTitle }}</strong>
    <span>{{ chatMessages.sidebar.emptyDescription }}</span>
  </div>
</template>

<style scoped lang="less">
.tr-chat-workspace-right-empty {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--chat-workspace-empty-gap, 10px);
  padding: var(--chat-workspace-empty-padding, 40px 28px);
  text-align: center;
  color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));

  &__icon {
    width: var(--chat-workspace-empty-icon-size, 72px);
    height: var(--chat-workspace-empty-icon-size, 72px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--chat-workspace-empty-icon-radius, 24px);
    background: color-mix(in srgb, var(--chat-workspace-hover-bg, rgba(15, 23, 42, 0.06)) 72%, transparent);
    color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));
    margin: 0 auto 8px;

    :deep(svg) {
      width: 32px;
      height: 32px;
    }
  }

  strong {
    color: var(--chat-workspace-text-primary, var(--tr-text-primary, #111827));
    font-size: var(--chat-workspace-empty-title-size, 18px);
    font-weight: 700;
  }

  span {
    font-size: var(--chat-workspace-empty-text-size, 14px);
    line-height: 1.7;
    max-width: 280px;
    margin: 0 auto;
  }
}
</style>

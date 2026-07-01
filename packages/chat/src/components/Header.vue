<script setup lang="ts">
import { computed } from 'vue'
import { TrIconButton, TrLayout } from '@opentiny/tiny-robot'
import { IconCollapseLeft, IconCollapseRight, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { useChatContext } from '../composables/useChatContext'

const { runtime } = useChatContext()

const currentTitle = computed(() => {
  const currentId = runtime.conversations?.currentId.value
  const current = runtime.conversations?.items.value.find((item) => item.id === currentId)

  return current?.title || '新对话'
})

function handleCreateConversation() {
  runtime.actions.createConversation?.()
}
</script>

<template>
  <div class="tr-chat-header">
    <slot>
      <div class="tr-chat-header__start">
        <TrLayout.AsideToggle placement="left">
          <template #default="{ isOpen }">
            <TrIconButton
              class="tr-chat-header__aside-toggle"
              :icon="isOpen ? IconCollapseRight : IconCollapseLeft"
              size="32"
              svg-size="18"
              type="button"
              :aria-label="isOpen ? '收起会话列表' : '展开会话列表'"
            />
          </template>
        </TrLayout.AsideToggle>
        <span class="tr-chat-header__title">{{ currentTitle }}</span>
      </div>

      <TrIconButton
        v-if="runtime.actions.createConversation"
        class="tr-chat-header__create"
        :icon="IconNewSession"
        size="32"
        svg-size="18"
        type="button"
        aria-label="新建对话"
        @click="handleCreateConversation"
      />
    </slot>
  </div>
</template>

<style scoped>
.tr-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
}

.tr-chat-header__start {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
}

.tr-chat-header__aside-toggle {
  flex-shrink: 0;
}

.tr-chat-header__title {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tr-chat-header__create {
  flex-shrink: 0;
}
</style>

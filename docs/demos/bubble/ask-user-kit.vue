<template>
  <div class="ask-user-kit-demo">
    <div class="ask-user-kit-demo__controls">
      <TinyButton :disabled="!canStartTurn" @click="startTurn">
        {{ canStartTurn ? (requestState === 'completed' ? '再次发起 AskUser' : '发起 AskUser') : '等待回答中' }}
      </TinyButton>
      <span class="ask-user-kit-demo__status" role="status" aria-live="polite">{{ statusText }}</span>
    </div>

    <p v-if="errorMessage" class="ask-user-kit-demo__error" role="alert">{{ errorMessage }}</p>

    <div class="ask-user-kit-demo__messages">
      <TrBubbleList
        :messages="messages"
        :auto-scroll="true"
        @state-change="askUserRuntime.handleStateChange"
        @bubble-event="askUserRuntime.handleBubbleEvent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import { onMounted } from 'vue'
import { useAskUserKitDemo } from './ask-user-kit'

const { askUserRuntime, canStartTurn, errorMessage, messages, requestState, startTurn, statusText } =
  useAskUserKitDemo()

onMounted(() => {
  void startTurn()
})
</script>

<style scoped>
.ask-user-kit-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ask-user-kit-demo__controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ask-user-kit-demo__status {
  color: #666;
  font-size: 13px;
}

.ask-user-kit-demo__error {
  margin: 0;
  color: #c00;
}

.ask-user-kit-demo__messages {
  height: clamp(320px, 65vh, 520px);
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.ask-user-kit-demo__messages :deep(.tr-bubble-list) {
  height: 100%;
}
</style>

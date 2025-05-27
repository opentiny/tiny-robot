<template>
  <tr-sender mode="multiple" :showWordLimit="true" :maxLength="1000">
    <template #footer-left>
      <tiny-tooltip :disabled="isActive" content="适用于复杂问题解析" placement="top" theme="dark">
        <tiny-button
          size="mini"
          plain
          circle
          :reset-time="0"
          style=""
          :class="['custom-button', isActive ? 'active' : '']"
          @click="toggleActive"
        >
          <div class="icon-container">
            <IconThink class="icon-think" />
            <span class="text">深度思考</span>
          </div>
        </tiny-button>
      </tiny-tooltip>
    </template>
  </tr-sender>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { IconThink } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinyTooltip } from '@opentiny/vue'

const isActive = ref(false)

const toggleActive = () => {
  isActive.value = !isActive.value
}
</script>

<style scoped>
.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.icon-think {
  font-size: 16px;
}

.text {
  width: 56px;
  height: 22px;
  line-height: 22px;
  font-size: 14px;
}

.custom-button {
  width: 100px;
  height: 32px;
}

:deep(.tiny-button) {
  background-color: rgb(255, 255, 255) !important;
}

:deep(.tiny-button:hover) {
  background-color: rgba(0, 0, 0, 0.04) !important;
  border: 1px solid rgb(194, 194, 194) !important;
}

:deep(.tiny-button.active) {
  border: 1px solid rgb(20, 118, 255) !important;
  background: rgba(20, 118, 255, 0.08) !important;
  color: rgb(20, 118, 255) !important;
}

:deep(.tiny-tooltip.tiny-tooltip__popper) {
  border-radius: 4px;
  padding: 4px 8px;
  background: rgb(89, 89, 89);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.16);
}
</style>

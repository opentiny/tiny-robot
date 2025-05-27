<template>
  <tr-sender
    v-model="inputMessage"
    mode="multiple"
    submitType="ctrlEnter"
    :maxLength="2000"
    :showWordLimit="true"
    :autoSize="true"
    :clearable="true"
    :allowSpeech="true"
    :loading="isSubmitting"
    placeholder="请输入您的消息..."
    @submit="handleSubmit"
    @speech-end="handleSpeechEnd"
  >
    <template #header>
      <div class="conversation-title">自定义插槽</div>
    </template>

    <template #prefix>
      <icon-ai class="user-avatar" />
    </template>

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

    <template #footer-right>
      <tiny-button plain type="text">
        <IconRefresh class="icon-refresh" />
      </tiny-button>
    </template>
  </tr-sender>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { IconAi, IconThink, IconRefresh } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinyTooltip } from '@opentiny/vue'

const isActive = ref(false)

const inputMessage = ref('')
const isSubmitting = ref(false)

const toggleActive = () => {
  isActive.value = !isActive.value
}

const handleSubmit = async (message) => {
  isSubmitting.value = true
  try {
    inputMessage.value = '' // 清空输入
    console.log('发送成功:', message)
  } catch (error) {
    console.error('发送失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleSpeechEnd = (transcript) => {
  console.log('语音识别结果:', transcript)
}
</script>

<style scoped>
.conversation-title {
  font-weight: bold;
  padding: 8px 0;
  text-align: center;
}

.user-avatar {
  font-size: 28px;
  object-fit: cover;
}

.custom-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-top: 1px solid #eee;
}

.icon-refresh {
  font-size: 20px;
}

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

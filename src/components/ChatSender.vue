<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
import { ref } from 'vue'

defineProps<{
  processing: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
  stop: []
}>()

const input = ref('')

const handleSubmit = (content: string) => {
  if (!content.trim()) return

  emit('send', content.trim())
  input.value = ''
}
</script>

<template>
  <TrSender
    v-model="input"
    class="chat-sender"
    mode="multiple"
    placeholder="请输入您的问题"
    :loading="processing"
    :clearable="true"
    @submit="handleSubmit"
    @cancel="emit('stop')"
  />
</template>

<style scoped>
.chat-sender {
  max-width: 860px;
  margin: 0 auto;
  border-radius: var(--tr-radius-xl);
  box-shadow: var(--tr-shadow-sm);
}
</style>

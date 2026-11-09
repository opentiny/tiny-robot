<script setup lang="ts">
import { TinyButton, TinyModal } from '@opentiny/vue'
import { ref } from 'vue'

defineOptions({ name: 'SkillDeleteDialog' })

defineProps<{
  title: string
  message: string
}>()

const emit = defineEmits<{
  (event: 'confirm'): void
  (event: 'cancel'): void
}>()

const visible = ref(true)

const cancel = () => {
  visible.value = false
  emit('cancel')
}

const confirm = () => {
  visible.value = false
  emit('confirm')
}
</script>

<template>
  <TinyModal
    v-model="visible"
    :title="title"
    :show-footer="true"
    :show-close="true"
    :mask-closable="true"
    :esc-closable="true"
    @close="cancel"
  >
    <p class="skill-delete-dialog__message">{{ message }}</p>
    <template #footer>
      <TinyButton type="default" round @click="cancel">取消</TinyButton>
      <TinyButton type="primary" round @click="confirm">确定</TinyButton>
    </template>
  </TinyModal>
</template>

<style lang="less" scoped>
.skill-delete-dialog__message {
  margin: 4px 0;
  color: var(--tr-text-primary);
  font-size: 14px;
  line-height: 22px;
}
</style>

<script setup lang="ts">
import { TinyButton, TinyInput, TinyModal } from '@opentiny/vue'
import { ref } from 'vue'

defineOptions({ name: 'SkillNameDialog' })

const props = defineProps<{
  title: string
  modelValue: string
  error?: string
  hint?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'submit'): void
  (event: 'cancel'): void
}>()

const visible = ref(true)

const cancel = () => {
  visible.value = false
  emit('cancel')
}
</script>

<template>
  <TinyModal
    v-model="visible"
    :title="props.title"
    :show-footer="true"
    :show-close="true"
    :mask-closable="true"
    :esc-closable="true"
    @close="cancel"
  >
    <form class="skill-name-dialog__content" @submit.prevent="emit('submit')">
      <label class="skill-name-dialog__label" for="skill-name-dialog-input">名称</label>
      <TinyInput
        id="skill-name-dialog-input"
        class="skill-name-dialog__input"
        :model-value="props.modelValue"
        autocomplete="off"
        :validate-event="false"
        :aria-invalid="Boolean(props.error)"
        @update:model-value="emit('update:modelValue', String($event ?? ''))"
      />
      <p v-if="props.hint || props.error" class="skill-name-dialog__hint">
        {{ props.hint || '名称只能包含英文字母、数字、下划线、中划线和点号。' }}
      </p>
      <p v-if="props.error" class="skill-name-dialog__error">{{ props.error }}</p>
    </form>
    <template #footer>
      <TinyButton type="default" round @click="cancel">取消</TinyButton>
      <TinyButton type="primary" round @click="emit('submit')">确定</TinyButton>
    </template>
  </TinyModal>
</template>

<style lang="less" scoped>
.skill-name-dialog__content {
  padding: 4px 0;
}

.skill-name-dialog__label {
  display: block;
  margin-bottom: 6px;
  color: var(--tr-text-primary);
  font-size: 13px;
  line-height: 20px;
}

.skill-name-dialog__input {
  width: 100%;
}

.skill-name-dialog__error {
  margin: 6px 0 0;
  color: var(--tr-color-error, #f23030);
  font-size: 12px;
  line-height: 18px;
}

.skill-name-dialog__hint {
  margin: 6px 0 0;
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 18px;
}
</style>

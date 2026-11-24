<script setup lang="ts">
import { TinyButton, TinyModal } from '@opentiny/vue'
import { ref } from 'vue'
import type { SkillFileSwitchDecision } from './index.type'

defineOptions({ name: 'SkillFileSwitchDialog' })

const props = defineProps<{
  currentFile: string
  nextFile: string
}>()

const emit = defineEmits<{
  (event: 'decision', decision: SkillFileSwitchDecision): void
}>()

const visible = ref(true)

const decide = (decision: SkillFileSwitchDecision) => {
  visible.value = false
  emit('decision', decision)
}
</script>

<template>
  <TinyModal
    v-model="visible"
    title="未保存的修改"
    width="min(560px, calc(100vw - 32px))"
    :show-footer="true"
    :show-close="true"
    :mask-closable="true"
    :esc-closable="true"
    @close="decide('cancel')"
  >
    <p class="skill-file-switch-dialog__message">
      当前文件“{{ props.currentFile }}”有未保存的修改，执行“{{ props.nextFile }}”前是否保存？
    </p>
    <template #footer>
      <div class="skill-file-switch-dialog__footer">
        <TinyButton class="skill-file-switch-dialog__cancel" type="default" round @click="decide('cancel')"
          >取消</TinyButton
        >
        <TinyButton type="default" round @click="decide('discard')">放弃修改</TinyButton>
        <TinyButton type="primary" round @click="decide('save')">保存并切换</TinyButton>
      </div>
    </template>
  </TinyModal>
</template>

<style lang="less" scoped>
.skill-file-switch-dialog__message {
  margin: 4px 0;
  color: var(--tr-text-primary);
  font-size: 14px;
  line-height: 22px;
  overflow-wrap: anywhere;
}

.skill-file-switch-dialog__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}

.skill-file-switch-dialog__footer > * {
  flex: 0 0 auto;
}

@media (max-width: 450px) {
  .skill-file-switch-dialog__footer {
    flex-wrap: nowrap;
  }

  .skill-file-switch-dialog__cancel {
    display: none;
  }
}
</style>

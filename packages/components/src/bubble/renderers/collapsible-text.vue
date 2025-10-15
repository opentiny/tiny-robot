<script setup lang="ts">
import { IconArrowUp } from '@opentiny/tiny-robot-svgs'
import { computed, ref } from 'vue'

const model = defineModel<{ open?: boolean }>({
  default() {
    return {}
  },
})

const props = defineProps<{
  title: string
  content: string
}>()

const openInternal = ref(false)
const modelOpenIsSet = computed<boolean>(() => model.value && model.value.open !== void 0)
const open = computed<boolean>({
  get() {
    return modelOpenIsSet.value ? model.value.open! : openInternal.value
  },
  set(value) {
    if (modelOpenIsSet.value) {
      model.value.open = value
    } else {
      openInternal.value = value
    }
  },
})
</script>

<template>
  <div class="tr-bubble__step-text">
    <div class="tr-bubble__step-text-title">
      <span>{{ props.title }}</span>
      <IconArrowUp class="expand-icon" :class="{ 'rotate-180': !open }" @click="open = !open" />
    </div>
    <div class="tr-bubble__step-text-content-wrapper">
      <div v-show="open" class="tr-bubble__step-text-content">{{ props.content }}</div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble__step-text-title {
  font-size: 14px;
  line-height: 22px;
  color: var(--tr-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    margin-left: -1px;
    border-radius: 50%;
    background-color: var(--tr-text-primary);
  }
}

.tr-bubble__step-text-content-wrapper {
  overflow: hidden;
}

.tr-bubble__step-text-content {
  font-size: 14px;
  line-height: 16px;
  color: var(--tr-text-secondary);
  border-left: 2px solid var(--tr-border-color-disabled);
  padding-left: 8px;
  margin-top: 8px;
  white-space: pre-line;
  word-break: break-word;
  display: inline-block;
}

.expand-icon {
  font-size: 14px;
  cursor: pointer;

  &.rotate-180 {
    transform: rotate(180deg);
  }
}
</style>

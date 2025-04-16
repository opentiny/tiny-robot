<script setup lang="ts">
import { computed, defineComponent, VNode } from 'vue'
import { PromptProps } from './index.type'

const props = defineProps<PromptProps>()

const vnodeToComponent = (vnode?: VNode | string) => {
  if (!vnode) {
    return null
  }

  return defineComponent(() => {
    return () => vnode
  })
}

const iconComp = computed(() => {
  return vnodeToComponent(props.icon)
})

const badgeComp = computed(() => {
  return vnodeToComponent(props.badge)
})
</script>

<template>
  <div :class="['tr-prompt', { disabled: props.disabled }]">
    <div class="tr-prompt__icon">
      <component :is="iconComp"></component>
    </div>
    <div class="tr-prompt__content">
      <h6 class="tr-prompt__content-label">{{ props.label }}</h6>
      <p v-if="props.description" class="tr-prompt__content-description">{{ props.description }}</p>
    </div>
    <div :class="['tr-prompt__badge', { label: typeof props.badge === 'string' }]">
      <component :is="badgeComp"></component>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-prompt {
  --tr-prompt-bg-color: white;
  --tr-prompt-hover-color: rgba(0, 0, 0, 0.04);
  --tr-prompt-active-color: rgba(0, 0, 0, 0.15);
  --tr-prompt-disabled-color: rgba(0, 0, 0, 0.04);
  --tr-prompt-box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  --tr-prompt-text: rgb(25, 25, 25);
  --tr-prompt-text-muted: rgb(89, 89, 89);

  flex: none;
  display: flex;
  gap: 12px;
  border-radius: 16px;
  box-shadow: var(--tr-prompt-box-shadow);
  padding: 16px 24px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
  background-color: var(--tr-prompt-bg-color);

  &:hover {
    background-color: var(--tr-prompt-hover-color);
  }

  &.disabled {
    cursor: default;
    pointer-events: none;
    background-color: var(--tr-prompt-disabled-color);
  }

  &:active {
    background-color: var(--tr-prompt-active-color);
  }
}

.tr-prompt__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: start;

  font-size: 14px;
  line-height: 24px;
  color: var(--tr-prompt-text);
}

.tr-prompt__content-label {
  margin: 0;
  padding: 0;
  font-weight: 500;
}

.tr-prompt__content-description {
  margin: 0;
  padding: 0;
  color: var(--tr-prompt-text-muted);
}

.tr-prompt__badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0 12px;
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  background-color: rgb(255, 234, 232);

  &.label {
    color: rgb(242, 48, 48);
    font-size: 14px;
    line-height: 22px;
  }
}
</style>

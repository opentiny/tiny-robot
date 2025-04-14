<script setup lang="ts">
import { PromptProps } from './index.type'

const props = defineProps<PromptProps>()
</script>

<template>
  <div class="tr-prompt">
    <div class="tr-prompt__icon">
      <component :is="props.icon"></component>
    </div>
    <div class="tr-prompt__content">
      <h6 class="tr-prompt__content-label">{{ props.label }}</h6>
      <p class="tr-prompt__content-description">{{ props.description }}</p>
    </div>
    <div class="tr-prompt__badge">{{ props.badge }}</div>
  </div>
</template>

<style lang="less" scoped>
.tr-prompt {
  display: flex;
  gap: 12px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 16px 24px;
  position: relative;
}

.tr-prompt__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: start;

  font-size: 14px;
  line-height: 24px;
  color: rgb(25, 25, 25);
}

.tr-prompt__content-label {
  margin: 0;
  padding: 0;
  font-weight: 500;
}

.tr-prompt__content-description {
  margin: 0;
  padding: 0;
  color: rgb(89, 89, 89);
}

.tr-prompt__badge {
  position: absolute;
  color: rgb(242, 48, 48);
  background-color: rgb(255, 234, 232);
  top: 0;
  right: 0;
  font-size: 14px;
  line-height: 22px;
  padding: 0 12px;
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
}
</style>

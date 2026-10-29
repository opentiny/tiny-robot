<template>
  <tr-welcome
    title="TinyRobot"
    description="您好，我是TinyRobot，您专属的 AI 智能专家"
    :icon="icon"
    :align="align"
  ></tr-welcome>
  <hr />
  <div class="align-controls">
    <label>对齐方向：</label>
    <tiny-radio-group v-model="align">
      <tiny-radio label="left">left</tiny-radio>
      <tiny-radio label="center">center</tiny-radio>
      <tiny-radio label="right">right</tiny-radio>
    </tiny-radio-group>
  </div>
</template>

<script setup lang="ts">
import { TrWelcome } from '@opentiny/tiny-robot'
import { TinyRadio, TinyRadioGroup } from '@opentiny/vue'
import { CSSProperties, h, ref } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')

const align = ref('left')
</script>

<style lang="less" scoped>
.align-controls {
  display: flex;
  align-items: center;
  color: var(--tr-text-primary);

  :deep(.tiny-radio) {
    --tv-Radio-text-color: var(--tr-text-primary);
  }
}
</style>

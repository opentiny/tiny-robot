<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const showInputPrefix = shallowRef(true)
const longPlaceholder =
  '这是一段用于观察多行模式换行效果的超长占位文本，输入区域宽度不足时会自动折行，同时可以切换首行前置插槽观察缩进变化。'.repeat(
    2,
  )
</script>

<template>
  <div class="demo-container">
    <button class="toggle-button" type="button" @click="showInputPrefix = !showInputPrefix">
      {{ showInputPrefix ? '移除首行前置插槽' : '添加首行前置插槽' }}
    </button>

    <tr-sender mode="multiple" :placeholder="longPlaceholder">
      <template v-if="showInputPrefix" #input-prefix>
        <span class="input-prefix-label">需求</span>
      </template>
    </tr-sender>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.toggle-button {
  margin-bottom: 12px;
  padding: 5px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
}

.toggle-button:hover {
  border-color: #1476ff;
  color: #1476ff;
}

.input-prefix-label {
  color: #1476ff;
  font-weight: 600;
}
</style>

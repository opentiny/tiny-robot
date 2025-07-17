<template>
  <div class="demo-section">
    <p>通过指令传递 disabled 标志可以禁用拖拽功能：</p>

    <div
      class="disabled-area"
      v-dropzone="{ onDrop: () => {}, onError: () => {}, disabled: true }"
      :class="{ disabled: true }"
    >
      <div class="disabled-content">
        <div class="disabled-icon">🚫</div>
        <div class="disabled-text">拖拽功能已禁用</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { vDropzone } from '@opentiny/tiny-robot'
</script>

<style scoped>
.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.demo-section h3 {
  margin-top: 0;
  color: #333;
}

.demo-section p {
  color: #666;
  margin-bottom: 16px;
}

/* 禁用状态样式 */
.disabled-area {
  border: 2px solid #ccc;
  border-radius: 8px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.disabled-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.disabled-content {
  text-align: center;
  color: #666;
}

.disabled-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.disabled-text {
  font-size: 14px;
}
</style>

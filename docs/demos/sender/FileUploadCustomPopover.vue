<template>
  <tr-sender mode="multiple" :allow-files="true" :button-group="buttonGroup" upload-popup-class="custom-upload-popup" />
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const renderTooltip = () => {
  return h('div', null, '• 支持最多上传3个图片')
}

const buttonGroup = ref({
  file: {
    tooltips: renderTooltip,
    disabled: false,
    accept: 'image/jpeg, image/png',
  },
})
</script>

<style>
/* 自定义上传按钮弹出层样式 */
.custom-upload-popup {
  top: -8px !important;
  left: 5px !important;
  background-color: #e8f5e8 !important;
  border: 2px solid #4caf50 !important;
  border-radius: 8px !important;
  color: #2e7d32 !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  font-weight: 500 !important;
}
</style>

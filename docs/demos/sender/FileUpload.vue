<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
      <span style="font-weight: 500">Tooltip 位置：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="top" v-model="tooltipPlacement" style="cursor: pointer" />
        <span>top</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="bottom" v-model="tooltipPlacement" style="cursor: pointer" />
        <span>bottom</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="left" v-model="tooltipPlacement" style="cursor: pointer" />
        <span>left</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="right" v-model="tooltipPlacement" style="cursor: pointer" />
        <span>right</span>
      </label>
    </div>
    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      通过
      <code style="background: #e8e8e8; padding: 2px 6px; border-radius: 3px">buttonGroup.file.tooltipPlacement</code>
      配置 tooltip 位置，支持 top、top-start、top-end、bottom、bottom-start、bottom-end、left、right 等方向
    </div>
    <tr-sender
      :key="tooltipPlacement"
      mode="multiple"
      :allow-files="true"
      :button-group="buttonGroup"
      @files-selected="handleFilesSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

type TooltipPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'
const tooltipPlacement = ref<TooltipPlacement>('top')

const renderTooltip = () => {
  return h('div', { style: { fontSize: '12px', maxWidth: '200px' } }, [
    h('div', null, '• 支持图片格式 JPG、PNG'),
    h('div', null, '• 单个文件不超过 10MB'),
  ])
}

const buttonGroup = computed(() => ({
  file: {
    tooltips: renderTooltip,
    tooltipPlacement: tooltipPlacement.value,
    disabled: false,
    accept: 'image/jpeg, image/png',
  },
}))

const handleFilesSelected = (files: File[]) => {
  console.log('选择的文件:', files)
}
</script>

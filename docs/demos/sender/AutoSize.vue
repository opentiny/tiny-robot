<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">配置：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="true" v-model="config" style="cursor: pointer" />
        <span>自动调整</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="custom" v-model="config" style="cursor: pointer" />
        <span>限制行数 (2-4行)</span>
      </label>
    </div>
    <tr-sender
      :key="config"
      mode="multiple"
      :autoSize="config === 'true' ? true : { minRows: 2, maxRows: 4 }"
      :placeholder="config === 'true' ? '高度随内容自动调整' : '最小2行，最大4行，输入多行文本查看效果'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const config = ref<'true' | 'custom'>('true')
</script>

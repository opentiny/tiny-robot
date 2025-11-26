<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">模式：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="single" v-model="mode" style="cursor: pointer" />
        <span>单行</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="multiple" v-model="mode" style="cursor: pointer" />
        <span>多行</span>
      </label>
    </div>
    <tr-sender
      :key="mode"
      :mode="mode"
      :placeholder="mode === 'single' ? '单行模式，超出宽度或按 Shift+Enter 自动切换为多行' : '多行模式'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const mode = ref<'single' | 'multiple'>('single')
</script>

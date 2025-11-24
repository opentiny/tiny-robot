<template>
  <div style="display: flex; gap: 24px; flex-wrap: wrap">
    <div style="flex: 1; min-width: 300px">
      <h4 style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500">默认样式（宽松模式）</h4>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <tr-sender mode="single" placeholder="默认单行模式..." />
        <tr-sender mode="multiple" placeholder="默认多行模式..." :showWordLimit="true" :maxLength="200" />
      </div>
    </div>

    <div style="flex: 1; min-width: 300px">
      <h4 style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500">
        紧凑模式（添加
        <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px">tr-sender-compact</code> 类）
      </h4>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <tr-sender class="tr-sender-compact" mode="single" placeholder="紧凑单行模式..." />
        <tr-sender
          class="tr-sender-compact"
          mode="multiple"
          placeholder="紧凑多行模式..."
          :showWordLimit="true"
          :maxLength="100"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
</script>

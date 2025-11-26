<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div>
      <h4 style="margin: 0 0 8px 0">加载状态</h4>
      <tr-sender :loading="true" stopText="停止回答" placeholder="加载中，点击图标可取消..." />
    </div>
    <div>
      <h4 style="margin: 0 0 8px 0">禁用状态</h4>
      <tr-sender :disabled="true" placeholder="输入框已禁用..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
</script>

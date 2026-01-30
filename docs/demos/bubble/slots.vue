<template>
  <tr-bubble content="消息内容" :avatar="aiAvatar">
    <template #prefix>
      <div style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px">
        前缀插槽
      </div>
    </template>
    <template #suffix>
      <div style="background: #f3e5f5; color: #7b1fa2; padding: 4px 8px; border-radius: 4px; font-size: 12px">
        后缀插槽
      </div>
    </template>
    <template #content-footer>
      <div
        style="
          background: #e8f5e9;
          color: #388e3c;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-top: 8px;
        "
      >
        内容底部插槽
      </div>
    </template>
    <template #after>
      <div
        style="
          background: #fff3e0;
          color: #f57c00;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-top: 8px;
        "
      >
        后置插槽
      </div>
    </template>
  </tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
</script>

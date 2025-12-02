<template>
  <div style="display: flex; gap: 24px; flex-wrap: wrap">
    <!-- 默认模式 -->
    <div style="flex: 1; min-width: 300px">
      <h4 style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500">默认样式（宽松模式）</h4>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <ChatInput :default-value="message" mode="single" placeholder="默认单行模式..." />
        <ChatInput
          :default-value="message"
          mode="multiple"
          placeholder="默认多行模式..."
          :showWordLimit="true"
          :maxLength="200"
        />
      </div>
    </div>

    <!-- 紧凑模式 -->
    <div style="flex: 1; min-width: 300px">
      <h4 style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500">
        紧凑模式（添加
        <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px">tr-chat-input-compact</code> 类）
      </h4>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <ChatInput :default-value="message" class="tr-chat-input-compact" mode="single" placeholder="紧凑单行模式..." />
        <ChatInput
          :default-value="message"
          class="tr-chat-input-compact"
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
import { ChatInput } from '@opentiny/tiny-robot'

const message = 'Hello TinyRobot'
</script>

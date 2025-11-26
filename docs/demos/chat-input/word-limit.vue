<template>
  <div class="demo-container">
    <ChatInput
      default-value="测试超出字数限制，当前已经超过了字数限制。"
      placeholder="最多输入 20 个字符..."
      :max-length="20"
      show-word-limit
      mode="multiple"
    />
  </div>
</template>

<script setup lang="ts">
import { ChatInput } from '@opentiny/tiny-robot'
</script>

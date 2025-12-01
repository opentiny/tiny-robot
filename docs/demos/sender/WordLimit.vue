<template>
  <tr-sender
    mode="multiple"
    :showWordLimit="true"
    :maxLength="20"
    defaultValue="测试超出字数限制，当前已经超过了字数限制。"
  />
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
</script>

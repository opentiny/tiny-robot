<template>
  <tr-sender mode="multiple" :showWordLimit="true" :maxLength="1000">
    <template #footer-left>
      <tiny-button size="mini" type="info" plain circle>💡 深度思考</tiny-button>
    </template>
    <template #footer-right>
      <tiny-button size="mini" type="info" plain circle>📋 截图</tiny-button>
    </template>
  </tr-sender>
</template>

<script setup lang="ts">
// import { TrSender } from '@opentiny/tiny-robot'
</script>

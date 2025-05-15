<template>
  <div class="demo-container">
    <h3>固定提示文本示例</h3>

    <div class="demo-section">
      <h4>基础用法</h4>
      <tr-sender
        :disabled="true"
        fixedText="缴费服务正在进行中，点击前往"
        :fixedTextLink="{ text: '点击前往', handler: handleLinkClick }"
      />
    </div>

    <div class="demo-section">
      <h4>带链接URL</h4>
      <tr-sender
        :disabled="true"
        fixedText="查看更多服务介绍，请访问官网"
        :fixedTextLink="{ text: '官网', url: 'https://example.com' }"
        @fixed-link-click="handleExternalLink"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// import { TrSender } from '@opentiny/tiny-robot'
const handleLinkClick = () => {
  alert('链接被点击了！这里可以执行任何自定义操作')
}

const handleExternalLink = () => {
  alert('外部链接被点击')
}
</script>

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

h4 {
  margin-bottom: 8px;
}
</style>

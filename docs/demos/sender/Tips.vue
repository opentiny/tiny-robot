<template>
  <div class="demo-container">
    <h3>消息提示示例</h3>
    <div class="demo-section">
      <div class="demo-section">
        <h4>基础用法</h4>
        <p>1. 通过 tipsMessage 属性设置提示信息，支持 HTML 内容：</p>
        <tr-sender
          :disabled="true"
          tipsMessage="缴费服务正在进行中，<a href='https://example.com' target='_blank'>点击前往</a>"
        />
      </div>
    </div>

    <div class="demo-section">
      <h4>使用插槽</h4>
      <p>2. 通过 tips 插槽可以实现更加灵活的自定义提示内容：</p>
      <tr-sender :disabled="true">
        <template #tips>
          <span>查看更多服务介绍，请访问</span>
          <a href="https://example.com" @click.prevent="handleExternalLink">官网</a>
        </template>
      </tr-sender>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'

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

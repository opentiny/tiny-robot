<template>
  <div class="home">
    <h2>欢迎使用 Tiny Robot E2E 测试应用</h2>
    <p>这是一个用于测试 Tiny Robot 组件的演示应用。</p>

    <div class="test-info">
      <h3>可用测试组件：</h3>
      <ul>
        <li><strong>Container 组件</strong> - 测试容器组件的显示/隐藏、全屏切换、拖拽条等功能</li>
      </ul>
    </div>

    <div class="instructions">
      <h3>测试说明：</h3>
      <p>点击导航栏中的组件链接来查看和测试不同的组件。</p>
      <p>每个组件页面都包含了相应的交互元素，用于 E2E 测试。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 首页组件，用于显示测试应用的基本信息
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-info {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.instructions {
  background-color: #e7f3ff;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

ul {
  padding-left: 20px;
}

li {
  margin: 10px 0;
}
</style>

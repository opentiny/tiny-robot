<template>
  <div class="home">
    <h2>欢迎使用 Tiny Robot E2E 测试应用</h2>
    <p>这里会挂载组件的交互演示页，供 Playwright 用例直接操作和断言。</p>

    <div class="test-info">
      <h3>可用测试组件</h3>
      <ul>
        <li><strong>Attachments 组件</strong> - 验证附件列表的数据规范化、渲染和清空同步行为。</li>
        <li><strong>Container 组件</strong> - 验证容器组件的显示、隐藏、全屏切换等行为。</li>
        <li><strong>Sender 组件</strong> - 验证输入、提交、Mention、Template、Suggestion 等行为。</li>
      </ul>
    </div>

    <div class="instructions">
      <h3>测试说明</h3>
      <p>点击上方导航可以切换到具体组件页面。</p>
      <p>每个页面都会暴露稳定的测试按钮和 `data-testid`，便于 E2E 用例编写与维护。</p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

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

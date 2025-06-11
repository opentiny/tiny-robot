<template>
  <div class="demo-container">
    <h3>容器模式配置演示</h3>
    <p>通过 <code>containerMode</code> 属性可以配置适合不同容器的样式风格。</p>

    <div class="mode-section">
      <h4>全屏模式 (containerMode="fullscreen")</h4>
      <p>适用于独立页面或全屏对话场景，具有较大的字体（16px）、宽松的内边距、大圆角（26px）和大发送图标（36px）。</p>

      <div class="example-group">
        <h5>单行模式</h5>
        <tr-sender containerMode="fullscreen" mode="single" placeholder="全屏单行模式..." style="margin-bottom: 10px" />

        <h5>多行模式</h5>
        <tr-sender
          containerMode="fullscreen"
          mode="multiple"
          placeholder="全屏多行模式..."
          :showWordLimit="true"
          :maxLength="200"
        />
      </div>
    </div>

    <div class="mode-section">
      <h4>侧边栏模式 (containerMode="sidebar")</h4>
      <p>适用于侧边栏、抽屉或紧凑界面，具有较小的字体（14px）、紧凑的内边距、小圆角（24px）和小发送图标（32px）。</p>

      <div class="example-group sidebar-container">
        <h5>单行模式</h5>
        <tr-sender containerMode="sidebar" mode="single" placeholder="侧边栏单行模式..." style="margin-bottom: 10px" />

        <h5>多行模式</h5>
        <tr-sender
          containerMode="sidebar"
          mode="multiple"
          placeholder="侧边栏多行模式..."
          :showWordLimit="true"
          :maxLength="100"
        />
      </div>
    </div>

    <div class="custom-vars-section">
      <h4>自定义变量覆盖</h4>
      <p>你可以通过CSS变量来自定义特定模式的样式：</p>

      <div class="custom-example">
        <tr-sender
          containerMode="sidebar"
          mode="multiple"
          placeholder="自定义样式的侧边栏模式..."
          class="custom-sidebar-sender"
          :showWordLimit="true"
          :maxLength="50"
        />
      </div>

      <pre class="code-example"><code>/* 自定义侧边栏模式的变量 */
.custom-sidebar-sender {
  /* 基础字体和行高 */
  --tr-sender-sidebar-font-size: 12px;
  --tr-sender-sidebar-line-height: 18px;
  --tr-sender-sidebar-input-height: 18px;
  
  /* 圆角和图标尺寸 */
  --tr-sender-sidebar-input-radius: 16px;
  --tr-sender-sidebar-send-icon-size: 28px;
  
  /* 内边距配置 */
  --tr-sender-sidebar-single-content-padding: 6px 4px 6px 8px;
  --tr-sender-sidebar-multiple-content-padding: 8px 12px 0 12px;
  --tr-sender-sidebar-prefix-padding: 6px 2px 6px 4px;
  --tr-sender-sidebar-actions-padding: 0 4px;
  --tr-sender-sidebar-bottom-row-padding: 6px 4px 6px 4px;
  --tr-sender-sidebar-footer-padding: 6px 4px 4px 8px;
}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
</script>

<style scoped>
.demo-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mode-section {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.example-group {
  margin-top: 12px;
}

.sidebar-container {
  max-width: 300px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
}

.custom-vars-section {
  border: 1px solid #1476ff;
  border-radius: 8px;
  padding: 16px;
  background: rgba(20, 118, 255, 0.02);
}

.custom-example {
  margin: 12px 0;
  max-width: 280px;
}

.code-example {
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  color: #333;
  overflow-x: auto;
}

h3 {
  color: #333;
  margin-bottom: 8px;
}

h4 {
  color: #1476ff;
  margin-bottom: 8px;
}

h5 {
  color: #666;
  font-size: 14px;
  margin: 8px 0 4px 0;
}

p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

code {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
}

/* 自定义样式示例 */
:deep(.custom-sidebar-sender) {
  --tr-sender-sidebar-font-size: 12px;
  --tr-sender-sidebar-line-height: 18px;
  --tr-sender-sidebar-single-content-padding: 6px 4px 6px 8px;
  --tr-sender-sidebar-input-radius: 16px;
  --tr-sender-sidebar-send-icon-size: 28px;
}
</style>

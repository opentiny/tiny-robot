<template>
  <div class="container-demo">
    <h2>Container 组件测试</h2>

    <div class="control-container">
      <div>
        <label>show：</label>
        <tiny-switch data-testid="toggle-show-btn" v-model="showContainer"></tiny-switch>
      </div>
      <div>
        <label>fullscreen：</label>
        <tiny-switch data-testid="toggle-fullscreen-btn" v-model="isFullscreen"></tiny-switch>
      </div>
    </div>

    <!-- Container 组件 -->
    <TrContainer v-model:show="showContainer" v-model:fullscreen="isFullscreen" data-testid="test-container">
      <template #title>
        <h3 data-testid="container-title">测试容器标题</h3>
      </template>

      <template #operations>
        <button data-testid="custom-operation-btn" class="custom-btn">自定义操作</button>
      </template>

      <div class="container-content" data-testid="container-content">
        <h4>容器内容区域</h4>
        <p>这里是容器的主要内容区域。</p>
        <p>可以放置任何需要的内容。</p>

        <div class="demo-content">
          <h5>演示内容</h5>
          <ul>
            <li>列表项 1</li>
            <li>列表项 2</li>
            <li>列表项 3</li>
          </ul>
        </div>
      </div>

      <template #footer>
        <div class="container-footer" data-testid="container-footer">
          <button data-testid="footer-action-btn">底部操作</button>
          <span class="footer-text">容器底部区域</span>
        </div>
      </template>
    </TrContainer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { TrContainer } from '@opentiny/tiny-robot'

const showContainer = ref(false)
const isFullscreen = ref(false)
</script>

<style scoped>
.container-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.control-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 容器内容 */
.container-content {
  padding: 15px;
}

/* 基础按钮样式 */
.custom-btn {
  padding: 4px 8px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
</style>

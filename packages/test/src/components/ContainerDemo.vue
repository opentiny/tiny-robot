<template>
  <div class="container-demo">
    <h2>Container 组件测试</h2>

    <div class="controls">
      <button data-testid="show-container-btn" @click="showContainer = true" :disabled="showContainer">
        显示 Container
      </button>

      <button data-testid="hide-container-btn" @click="showContainer = false" :disabled="!showContainer">
        隐藏 Container
      </button>

      <button data-testid="toggle-fullscreen-btn" @click="isFullscreen = !isFullscreen">
        {{ isFullscreen ? '退出全屏' : '全屏模式' }}
      </button>
    </div>

    <div class="status-info">
      <p>
        Container 状态:
        <span data-testid="container-status">
          {{ showContainer ? '显示' : '隐藏' }}
        </span>
      </p>
      <p>
        全屏状态:
        <span data-testid="fullscreen-status">
          {{ isFullscreen ? '全屏' : '普通' }}
        </span>
      </p>
    </div>

    <!-- Container 组件 -->
    <TrContainer v-model:show="showContainer" v-model:fullscreen="isFullscreen" data-testid="test-container">
      <template #title>
        <h3 data-testid="container-title">测试容器标题</h3>
      </template>

      <template #operations>
        <button data-testid="custom-operation-btn" class="custom-btn" @click="handleCustomOperation">自定义操作</button>
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

          <div class="form-demo">
            <label>
              输入框演示:
              <input type="text" v-model="demoInput" data-testid="demo-input" placeholder="请输入内容" />
            </label>
            <p data-testid="demo-input-value">输入值: {{ demoInput }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="container-footer" data-testid="container-footer">
          <button data-testid="footer-action-btn" @click="handleFooterAction">底部操作</button>
          <span class="footer-text">容器底部区域</span>
        </div>
      </template>
    </TrContainer>

    <!-- 操作日志 -->
    <div class="action-log" data-testid="action-log">
      <h3>操作日志</h3>
      <ul>
        <li v-for="(log, index) in actionLogs" :key="index" :data-testid="`log-item-${index}`">
          {{ log }}
        </li>
      </ul>
      <button data-testid="clear-logs-btn" @click="clearLogs" v-if="actionLogs.length > 0">清空日志</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TrContainer from '../../../components/src/container/index.vue'

// 响应式数据
const showContainer = ref(false)
const isFullscreen = ref(false)
const demoInput = ref('')
const actionLogs = ref<string[]>([])

// 添加日志的辅助函数
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  actionLogs.value.unshift(`[${timestamp}] ${message}`)
}

// 事件处理函数
const handleCustomOperation = () => {
  addLog('执行了自定义操作')
}

const handleFooterAction = () => {
  addLog('执行了底部操作')
}

const clearLogs = () => {
  actionLogs.value = []
  addLog('日志已清空')
}

// 监听容器状态变化
import { watch } from 'vue'

watch(showContainer, (newVal) => {
  addLog(`容器${newVal ? '显示' : '隐藏'}`)
})

watch(isFullscreen, (newVal) => {
  addLog(`${newVal ? '进入' : '退出'}全屏模式`)
})
</script>

<style scoped>
.container-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.controls button:hover:not(:disabled) {
  background: #f0f0f0;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
}

.status-info span {
  font-weight: bold;
  color: #007bff;
}

.container-content {
  padding: 20px;
  line-height: 1.6;
}

.demo-content {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
}

.form-demo {
  margin: 15px 0;
}

.form-demo label {
  display: block;
  margin: 10px 0;
}

.form-demo input {
  margin-left: 10px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.container-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #f8f9fa;
  border-top: 1px solid #ddd;
}

.custom-btn {
  padding: 4px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.custom-btn:hover {
  background: #0056b3;
}

.action-log {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.action-log ul {
  max-height: 200px;
  overflow-y: auto;
  margin: 10px 0;
  padding: 0;
  list-style: none;
}

.action-log li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
  font-family: monospace;
  font-size: 14px;
}

.action-log li:last-child {
  border-bottom: none;
}

.footer-text {
  color: #666;
  font-size: 14px;
}
</style>

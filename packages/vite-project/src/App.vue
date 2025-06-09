<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="test-container">
    <header class="test-header">
      <h1>TrSender Shadow DOM 兼容性测试</h1>
      <p>对比正常组件与 Shadow DOM 组件的表现</p>
    </header>

    <main class="test-main">
      <!-- 正常加载 -->
      <section class="test-section">
        <h2>🔹 正常组件（普通 DOM）</h2>
        <HelloWorld msg="Vite + Vue" />
      </section>

      <!-- defineCustomElement 加载 (使用 shadow dom 隔离)-->
      <section class="test-section">
        <h2>🔸 Shadow DOM 组件</h2>
        <sender-shadow />
      </section>
    </main>

    <footer class="test-footer">
      <details class="test-instructions">
        <summary>📝 测试说明</summary>
        <div class="instructions-content">
          <h3>主要测试项目：</h3>
          <ul>
            <li><strong>样式一致性</strong>：模板字段在两个组件中应该具有相同的蓝色背景和样式</li>
            <li><strong>删除逻辑</strong>：删除字段内容时，字段结构应该保持，不会完全消失</li>
            <li><strong>格式化控制</strong>：输入时不应该出现 &lt;font&gt; 标签或其他浏览器默认格式化</li>
            <li><strong>复制粘贴</strong>：模板字段的复制粘贴应该保持样式一致</li>
          </ul>
          <p><strong>打开开发者工具检查：</strong></p>
          <ol>
            <li>检查 Shadow DOM 结构中是否有样式注入</li>
            <li>确认模板字段有正确的内联样式或 CSS 类</li>
            <li>验证无不期望的 HTML 标签生成</li>
          </ol>
        </div>
      </details>
    </footer>
  </div>
</template>

<style scoped>
.test-container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
}

.test-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.test-header h1 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
}

.test-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.test-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

@media (max-width: 1200px) {
  .test-main {
    grid-template-columns: 1fr;
  }
}

.test-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.test-section h2 {
  margin: 0 0 20px 0;
  color: #34495e;
  font-size: 1.5rem;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.test-footer {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.test-instructions summary {
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2980b9;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.test-instructions summary:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

.instructions-content {
  padding: 20px;
  margin-top: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.instructions-content h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.instructions-content ul,
.instructions-content ol {
  margin: 10px 0;
  padding-left: 20px;
}

.instructions-content li {
  margin: 8px 0;
  line-height: 1.5;
}

.instructions-content p {
  margin: 15px 0;
  font-weight: 600;
  color: #e67e22;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

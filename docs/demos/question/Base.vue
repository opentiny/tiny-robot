<template>
  <div style="display: flex; flex-direction: column; height: 200px; padding-top: 80px; background-color: #fafafa">
    <tr-question
      ref="questionRef"
      :categories="questionConfig.categories"
      :commonQuestions="questionConfig.commonQuestions"
      :initialExpanded="questionConfig.initialExpanded"
      :theme="questionConfig.theme"
      :modalWidth="questionConfig.modalWidth"
      :loading="loading"
      @question-click="handleQuestionClick"
      @select-category="handleCategorySelect"
    >
      <!-- 自定义问题项渲染 -->
      <template #question-item="{ question, index }">
        <div class="custom-question">
          <span class="question-number">{{ index + 1 }}. </span>
          <span class="question-text">{{ question.text }}</span>
        </div>
      </template>

      <!-- 数据加载时的加载动画 -->
      <template #loading-indicator>
        <div class="custom-loading">
          <div class="loading-spinner"></div>
          <div>正在加载问题数据...</div>
        </div>
      </template>

      <!-- 数据为空时的占位提示 -->
      <template #empty-state>
        <div class="custom-empty-state">
          <img src="https://via.placeholder.com/48" alt="Empty" />
          <p>暂无相关问题，请尝试其他分类</p>
        </div>
      </template>
    </tr-question>

    <!-- 操作按钮 -->
    <div class="action-btns">
      <button @click="questionRef.openModal()">打开热门问题弹窗</button>
      <button @click="questionRef.closeModal()">关闭热门问题弹窗</button>
      <button @click="questionRef.toggleFloating()">切换悬浮胶囊状态</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrQuestion } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

// 引用组件实例
const questionRef = ref(null)

// 控制加载状态
const loading = ref(false)

// 问题配置
const questionConfig = reactive<QuestionProps>({
  categories: [
    {
      id: 'basic',
      label: '基础问题',
      icon: 'icon-basic',
      questions: [
        { id: 'b1', text: '什么是弹性云服务器?' },
        { id: 'b2', text: '如何登录到Windows云服务器?' },
        { id: 'b3', text: '弹性公网IP为什么ping不通?' },
        { id: 'b4', text: '云服务器安全组如何配置?' },
        { id: 'b5', text: '如何查看云服务器密码?' },
      ],
    },
    {
      id: 'purchase',
      label: '购买咨询',
      icon: 'icon-purchase',
      questions: [
        { id: 'p1', text: '如何购买弹性云服务器?' },
        { id: 'p2', text: '无法登录弹性云服务器怎么办?' },
        { id: 'p3', text: '云服务器价格怎么计算?' },
        { id: 'p4', text: '如何查看账单详情?' },
        { id: 'p5', text: '如何续费云服务器?' },
      ],
    },
    {
      id: 'usage',
      label: '使用咨询',
      icon: 'icon-usage',
      questions: [
        { id: 'u1', text: '云服务器使用限制与须知' },
        { id: 'u2', text: '使用RDP文件连接Windows实例' },
        { id: 'u3', text: '多用户登录（Windows2016）' },
        { id: 'u4', text: '如何重置云服务器密码?' },
        { id: 'u5', text: '云服务器如何安装软件?' },
      ],
    },
  ],
  commonQuestions: [
    { id: 'f1', text: '如何注册账号?' },
    { id: 'f2', text: '购买云服务器的付款方式有哪些?' },
    { id: 'f3', text: '更换操作系统需要多久?' },
    { id: 'f4', text: '云服务器可以安装自定义镜像吗?' },
    { id: 'f5', text: '如何连接Linux云服务器?' },
  ],
  initialExpanded: false,
  theme: 'light',
  modalWidth: '640px',
})

const handleQuestionClick = (question) => {
  console.log('点击了问题:', question)
}

const handleCategorySelect = (category) => {
  console.log('选择了分类:', category)
}
</script>

<style scoped>
.action-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 10px;
}

.action-btns button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
}

.action-btns button:hover {
  background-color: #f0f0f0;
}

.custom-category {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-question {
  display: flex;
  align-items: center;
}

.question-number {
  color: #666;
  margin-right: 4px;
}

.question-text {
  font-weight: 500;
}

.custom-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.custom-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #999;
}
</style>

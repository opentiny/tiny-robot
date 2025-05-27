<template>
  <div class="demo-container">
    <h3>单行模式 (mode="single") - 默认</h3>
    <p>尝试输入 "ECS", "CDN", "服务器" 等查看联想效果。</p>
    <tr-sender
      v-model="textSingle"
      :suggestions="sampleSuggestions"
      mode="single"
      placeholder="单行模式联想..."
    ></tr-sender>
    <p>当前输入: {{ textSingle }}</p>

    <h3>多行模式 (mode="multiple")</h3>
    <tr-sender
      v-model="textMultiple"
      :suggestions="sampleSuggestions"
      mode="multiple"
      placeholder="多行模式联想..."
    ></tr-sender>
    <p>当前输入: {{ textMultiple }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const textSingle = ref('')
const textMultiple = ref('')

const sampleSuggestions = ref([
  'ECS-云服务器卡顿',
  'ECS-备份弹性云服务器',
  'ECS-搜索ECS',
  'ECS-云服务器状态',
  'ECS-免费云服务器',
  'CDN-权限管理',
  'CDN常见问题场景以及解决方法有哪些？',
  'CDN-CDN是否支持全站加速？',
  'CDN-添加CDN加速域名',
])
</script>

<style scoped>
.demo-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h3 {
  margin-bottom: 5px;
}

p {
  margin-top: 5px;
  margin-bottom: 10px;
  font-size: 0.9em;
  color: #555;
}
</style>

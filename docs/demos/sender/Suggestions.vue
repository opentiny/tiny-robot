<template>
  <div class="demo-container">
    <h3>输入联想基础示例</h3>
    <p>尝试输入 "a", "ap", "b", "ban" 等查看联想效果。</p>
    <tr-sender v-model="text1" :suggestions="sampleSuggestions" placeholder="尝试输入..."></tr-sender>
    <p>当前输入: {{ text1 }}</p>

    <h3>单行模式 (mode="single") - 默认</h3>
    <tr-sender
      v-model="textSingle"
      :suggestions="sampleSuggestions"
      mode="single"
      placeholder="单行模式联想..."
    ></tr-sender>
    <p>当前输入: {{ textSingle }}</p>

    <h3>多行模式 (mode="multiple")</h3>
    <p>注意：多行模式下，为避免复杂性，输入框内补全提示当前未精确显示，但联想弹窗正常工作。</p>
    <tr-sender
      v-model="textMultiple"
      :suggestions="sampleSuggestions"
      mode="multiple"
      placeholder="多行模式联想..."
    ></tr-sender>
    <p>当前输入: {{ textMultiple }}</p>

    <h3>空联想数据</h3>
    <tr-sender v-model="textEmpty" :suggestions="[]" placeholder="无联想数据..."></tr-sender>
    <p>当前输入: {{ textEmpty }}</p>

    <h3>配合其他 Prop (例如 clearable)</h3>
    <tr-sender
      v-model="textWithClear"
      :suggestions="sampleSuggestions"
      :clearable="true"
      placeholder="可清空..."
    ></tr-sender>
    <p>当前输入: {{ textWithClear }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const text1 = ref('')
const textSingle = ref('')
const textMultiple = ref('')
const textEmpty = ref('')
const textWithClear = ref('')

const sampleSuggestions = ref([
  'apple',
  'apply',
  'apricot',
  'banana',
  'bandana',
  'bank',
  'orange',
  'oracle',
  'origami',
  'strawberry',
  'stream',
  'strong',
  '你觉得自己今天还好吗？',
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

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-sender v-model:template-data="templateData" mode="multiple" clearable @submit="handleSubmit" ref="senderRef" />

    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      💡 点击蓝色字段可编辑，光标自动聚焦到第一个可编辑字段
    </div>

    <div style="display: flex; gap: 8px; flex-wrap: wrap">
      <button
        v-for="(item, index) in templates"
        :key="index"
        @click="selectTemplate(item, index)"
        :style="{
          padding: '6px 12px',
          background: activeIndex === index ? '#1890ff' : '#f0f0f0',
          color: activeIndex === index ? 'white' : '#333',
          border: '1px solid ' + (activeIndex === index ? '#1890ff' : '#ddd'),
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
        }"
      >
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender, type UserItem } from '@opentiny/tiny-robot'
import { ref, onMounted } from 'vue'

const senderRef = ref<InstanceType<typeof TrSender> | null>(null)
const templateData = ref<UserItem[]>([])
const activeIndex = ref(0)

// 预定义模板
const templates: Array<{ name: string; data: UserItem[] }> = [
  {
    name: '模板1',
    data: [
      { type: 'text', content: '你好' },
      { type: 'template', content: '张三' },
      { type: 'text', content: '，欢迎使用' },
      { type: 'template', content: 'TinyRobot' },
      { type: 'text', content: '！' },
    ],
  },
  {
    name: '模板2',
    data: [
      { type: 'text', content: '你好' },
      { type: 'template', content: '张三先生' },
      { type: 'text', content: '，关于' },
      { type: 'template', content: '' },
      { type: 'text', content: '的进展，请查看' },
      { type: 'template', content: '' },
      { type: 'text', content: '。' },
    ],
  },
  {
    name: '模板3',
    data: [{ type: 'text', content: 'ECS 服务器的最新版本' }],
  },
]

// 选择模板
const selectTemplate = (template: (typeof templates)[0], index: number) => {
  activeIndex.value = index
  templateData.value = template.data
  senderRef.value?.activateTemplateFirstField()
}

// 提交处理
const handleSubmit = (text: string) => {
  console.log('提交内容:', text)
}

onMounted(() => {
  selectTemplate(templates[0], 0)
})
</script>

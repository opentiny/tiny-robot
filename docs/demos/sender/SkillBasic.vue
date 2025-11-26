<script setup lang="ts">
import { ref, watch } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import SkillSelector from './SkillSelector.vue'
import type { SkillOption } from './SkillSelector.vue'

const availableSkills: SkillOption[] = [
  { label: '翻译专家', value: '请帮我翻译以下内容：' },
  { label: '代码审查', value: '请审查以下代码：' },
  { label: '内容总结', value: '请总结以下内容：' },
]

const message = ref('')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateData = ref<any[]>([])
const showSkillSelector = ref(false)
const skillSelectorPosition = ref({ top: 0, left: 0 })
const filterText = ref('')
const skillSelectorRef = ref<InstanceType<typeof SkillSelector> | null>(null)
const senderRef = ref<InstanceType<typeof TrSender> | null>(null)

const canTriggerSkillSelector = (text: string, atIndex: number): boolean => {
  if (atIndex === 0) return true
  if (atIndex > 0 && text[atIndex - 1] === ' ') return true
  return false
}

const handleTriggerChar = (char: string, position: { top: number; left: number }) => {
  if (char === '@') {
    showSkillSelector.value = true
    skillSelectorPosition.value = position
    filterText.value = ''
  }
}

const selectSkill = (skill: SkillOption) => {
  showSkillSelector.value = false
  filterText.value = ''

  if (templateData.value.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newData: any[] = []
    if (message.value) {
      const atIndex = message.value.lastIndexOf('@')
      const beforeAt = atIndex !== -1 ? message.value.substring(0, atIndex) : message.value
      if (beforeAt) newData.push({ type: 'text', content: beforeAt })
    }
    newData.push({ type: 'skill', label: skill.label, value: skill.value })
    newData.push({ type: 'text', content: ' ' })
    templateData.value = newData
    message.value = ''
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sender = senderRef.value as any
      sender?.$refs?.templateEditorRef?.focusToEnd?.()
    }, 100)
    return
  }

  const lastItem = templateData.value[templateData.value.length - 1]
  if (lastItem?.type === 'text') {
    const atIndex = lastItem.content.lastIndexOf('@')
    if (atIndex !== -1) {
      const beforeAt = lastItem.content.substring(0, atIndex)
      const newData = [...templateData.value]
      if (beforeAt) {
        newData[newData.length - 1] = { type: 'text', content: beforeAt }
      } else {
        newData.pop()
      }
      newData.push({ type: 'skill', label: skill.label, value: skill.value })
      templateData.value = newData
    }
  }

  setTimeout(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sender = senderRef.value as any
    sender?.$refs?.templateEditorRef?.focusToEnd?.()
  }, 100)
}

const closeSkillSelector = () => {
  showSkillSelector.value = false
  filterText.value = ''
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (showSkillSelector.value && skillSelectorRef.value) {
    e.stopPropagation()
    skillSelectorRef.value.handleKeyDown(e)
  }
}

watch(
  templateData,
  (newData) => {
    if (!showSkillSelector.value || newData.length === 0) {
      showSkillSelector.value = false
      filterText.value = ''
      return
    }

    const lastItem = newData[newData.length - 1]
    if (lastItem?.type === 'text') {
      const content = lastItem.content || ''
      const atIndex = content.lastIndexOf('@')

      if (atIndex !== -1 && canTriggerSkillSelector(content, atIndex)) {
        const textAfterAt = content.substring(atIndex + 1)
        if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
          showSkillSelector.value = false
          filterText.value = ''
        } else {
          filterText.value = textAfterAt
        }
      } else {
        showSkillSelector.value = false
        filterText.value = ''
      }
    } else {
      showSkillSelector.value = false
      filterText.value = ''
    }
  },
  { deep: true },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSubmit = (inputValue: string, templateDataParam?: any[]) => {
  // 现在可以直接从参数中获取完整的 templateData
  console.log('提交时的完整数据：', templateDataParam)
  console.log('拼接后的文本：', inputValue)
}
</script>

<template>
  <div class="skill-basic-demo" @keydown="handleKeyDown">
    <div class="sender-wrapper">
      <tr-sender
        ref="senderRef"
        v-model="message"
        mode="multiple"
        v-model:template-data="templateData"
        placeholder="输入 @ 来选择技能..."
        @submit="handleSubmit"
        @trigger-char="handleTriggerChar"
      />

      <SkillSelector
        ref="skillSelectorRef"
        :visible="showSkillSelector"
        :skills="availableSkills"
        :position="skillSelectorPosition"
        :filter-text="filterText"
        @select="selectSkill"
        @close="closeSkillSelector"
      />
    </div>
  </div>
</template>

<style scoped>
.sender-wrapper {
  position: relative;
}
</style>

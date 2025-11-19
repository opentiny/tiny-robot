<script setup lang="ts">
import { ref, watch } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import SkillSelector from './SkillSelector.vue'
import type { SkillOption } from './SkillSelector.vue'

// 可用技能列表
const availableSkills: SkillOption[] = [
  { label: '翻译专家', value: '请帮我翻译以下内容：', description: '将文本翻译成其他语言' },
  { label: '代码审查', value: '请审查以下代码并提供改进建议：', description: '代码质量检查和优化' },
  { label: '内容总结', value: '请总结以下内容的要点：', description: '提取关键信息' },
  { label: '写作助手', value: '请帮我润色以下文字：', description: '改善文字表达' },
  { label: '问题解答', value: '请回答以下问题：', description: '提供详细解答' },
]

// 普通输入框的内容
const message = ref('')

// 模板数据
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateData = ref<any[]>([])

// 技能选择器状态
const showSkillSelector = ref(false)
const skillSelectorPosition = ref({ top: 0, left: 0 })
const filterText = ref('')
const skillSelectorRef = ref<InstanceType<typeof SkillSelector> | null>(null)
const senderRef = ref<InstanceType<typeof TrSender> | null>(null)

// 检查 @ 字符是否可以触发技能选择器
// 条件：@ 位于第一个位置，或者前面是空格
const canTriggerSkillSelector = (text: string, atIndex: number): boolean => {
  if (atIndex === 0) return true // @ 在第一个位置
  if (atIndex > 0 && text[atIndex - 1] === ' ') return true // @ 前面是空格
  return false
}

// 处理触发字符事件
const handleTriggerChar = (char: string, position: { top: number; left: number }) => {
  if (char === '@') {
    // 直接显示面板，条件检查由 watch 负责
    // 因为此时 @ 字符还没有被插入到 templateData 中
    showSkillSelector.value = true
    skillSelectorPosition.value = position
    filterText.value = ''
  }
}

// 选择技能
const selectSkill = (skill: SkillOption) => {
  // 关闭选择器
  showSkillSelector.value = false
  filterText.value = ''

  // 如果模板数据为空，需要从普通输入框切换到模板模式
  if (templateData.value.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newData: any[] = []

    // 如果普通输入框有内容，需要保留
    if (message.value) {
      // 找到 @ 的位置
      const atIndex = message.value.lastIndexOf('@')

      if (atIndex !== -1) {
        // 分割文本：@ 之前的部分
        const beforeAt = message.value.substring(0, atIndex)

        // 如果 @ 之前有内容，添加文本节点
        if (beforeAt) {
          newData.push({
            type: 'text',
            content: beforeAt,
          })
        }
      } else {
        // 没有 @，保留全部内容
        newData.push({
          type: 'text',
          content: message.value,
        })
      }
    }

    // 添加技能块
    newData.push({
      type: 'skill',
      label: skill.label,
      value: skill.value,
    })

    // 添加空文本节点用于继续输入
    newData.push({
      type: 'text',
      content: ' ',
    })

    templateData.value = newData

    // 清空普通输入框
    message.value = ''

    // 等待 DOM 更新后聚焦到末尾
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sender = senderRef.value as any
      sender?.$refs?.templateEditorRef?.focusToEnd?.()
    }, 100)

    return
  }

  // 已经在模板编辑器模式，数据驱动方式
  const lastItem = templateData.value[templateData.value.length - 1]

  if (lastItem && lastItem.type === 'text') {
    const content = lastItem.content
    const atIndex = content.lastIndexOf('@')

    if (atIndex !== -1) {
      // 分割文本：@ 之前的部分
      const beforeAt = content.substring(0, atIndex)

      // 构建新的数据结构
      const newData = [...templateData.value]

      // 更新最后一个文本节点（只保留 @ 之前的内容）
      if (beforeAt) {
        newData[newData.length - 1] = {
          type: 'text',
          content: beforeAt,
        }
      } else {
        // 如果 @ 之前没有内容，移除这个文本节点
        newData.pop()
      }

      // 插入技能块
      newData.push({
        type: 'skill',
        label: skill.label,
        value: skill.value,
      })

      // 添加一个空文本节点（用于继续输入）
      newData.push({
        type: 'text',
        content: ' ',
      })

      templateData.value = newData
    }
  }

  // 等待 DOM 更新后聚焦到末尾
  setTimeout(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sender = senderRef.value as any
    sender?.$refs?.templateEditorRef?.focusToEnd?.()
  }, 100)
}

// 关闭选择器
const closeSkillSelector = () => {
  showSkillSelector.value = false
  filterText.value = ''
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (showSkillSelector.value && skillSelectorRef.value) {
    e.stopPropagation() // 阻止事件传播，避免触发发送
    skillSelectorRef.value.handleKeyDown(e)
  }
}

// 监听模板数据变化，更新筛选文本和面板状态
watch(
  templateData,
  (newData) => {
    // 如果面板未显示，不需要处理
    if (!showSkillSelector.value) {
      return
    }

    // 如果数据为空，关闭面板
    if (newData.length === 0) {
      showSkillSelector.value = false
      filterText.value = ''
      return
    }

    const lastItem = newData[newData.length - 1]

    // 只处理最后一个元素是文本的情况
    if (lastItem?.type === 'text') {
      const content = lastItem.content || ''
      const atIndex = content.lastIndexOf('@')

      if (atIndex !== -1) {
        // 检查 @ 是否满足触发条件
        if (!canTriggerSkillSelector(content, atIndex)) {
          showSkillSelector.value = false
          filterText.value = ''
          return
        }

        // 找到了有效的 @ 字符
        const textAfterAt = content.substring(atIndex + 1)

        // 如果 @ 后面有空格或换行，关闭面板
        if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
          showSkillSelector.value = false
          filterText.value = ''
        } else {
          // 更新筛选文本
          filterText.value = textAfterAt
        }
      } else {
        // 没有找到 @ 字符（被删除），关闭面板
        showSkillSelector.value = false
        filterText.value = ''
      }
    } else {
      // 最后一个元素不是文本，关闭面板
      showSkillSelector.value = false
      filterText.value = ''
    }
  },
  { deep: true },
)

const handleSubmit = () => {
  // 如果没有内容，不处理
  if (templateData.value.length === 0) {
    return
  }

  // 先提取最终消息
  const finalMessage = templateData.value
    .map((item) => {
      if (item.type === 'skill') {
        return item.value
      }
      return item.content || ''
    })
    .join('')

  alert(`发送消息:\n${finalMessage}`)

  // 清空编辑器
  templateData.value = []
}
</script>

<template>
  <div class="skill-basic-demo" @keydown="handleKeyDown">
    <h3>技能块基础示例</h3>
    <p>技能块（蓝色标签）会在发送时被替换为对应的 value 值。输入 <code>@</code> 可以触发技能选择器。</p>

    <div class="sender-wrapper">
      <tr-sender
        ref="senderRef"
        v-model="message"
        mode="multiple"
        v-model:template-data="templateData"
        placeholder="输入 @ 来选择技能，或直接输入消息..."
        @submit="handleSubmit"
        @trigger-char="handleTriggerChar"
      />

      <!-- 技能选择器弹窗 -->
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

    <div class="info">
      <h4>使用说明：</h4>
      <ul class="usage-tips">
        <li>输入 <code>@</code> 字符触发技能选择器（@ 需要在开头或前面是空格）</li>
        <li>继续输入可以过滤技能列表（如 <code>@翻译</code>）</li>
        <li>使用 <kbd>↑</kbd> <kbd>↓</kbd> 键导航，<kbd>Enter</kbd> 选择，<kbd>Esc</kbd> 关闭</li>
        <li>也可以用鼠标点击选择技能</li>
        <li>技能块显示为蓝色标签，发送时会替换为对应的提示词</li>
        <li>删除 @ 字符或在 @ 后输入空格会关闭选择器</li>
      </ul>

      <h4>发送时的实际内容：</h4>
      <div class="content-display">
        {{
          templateData.length > 0
            ? templateData
                .map((item) => {
                  if (item.type === 'skill') return item.value
                  return item.content
                })
                .join('')
            : '(空)'
        }}
      </div>

      <h4>可用技能列表：</h4>
      <div class="skills-list">
        <div v-for="skill in availableSkills" :key="skill.label" class="skill-item">
          <strong>{{ skill.label }}</strong>
          <span class="skill-desc">{{ skill.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-basic-demo {
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
}

h3 {
  margin-bottom: 8px;
  color: #333;
}

p {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

code {
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #e83e8c;
  font-size: 13px;
}

kbd {
  display: inline-block;
  padding: 2px 6px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 11px;
  font-family: monospace;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.sender-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.info {
  margin-top: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.info h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.info h4:not(:first-child) {
  margin-top: 16px;
}

.usage-tips {
  margin: 0;
  padding-left: 20px;
  background: white;
  padding: 12px 12px 12px 32px;
  border-radius: 4px;
}

.usage-tips li {
  margin-bottom: 6px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.usage-tips li:last-child {
  margin-bottom: 0;
}

.content-display {
  padding: 12px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  min-height: 40px;
  word-break: break-word;
}

.skills-list {
  background: white;
  border-radius: 4px;
  padding: 8px;
}

.skill-item {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-item:last-child {
  border-bottom: none;
}

.skill-item strong {
  color: #333;
  font-size: 13px;
  min-width: 80px;
}

.skill-desc {
  color: #999;
  font-size: 12px;
}
</style>

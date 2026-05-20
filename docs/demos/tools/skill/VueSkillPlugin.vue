<template>
  <div class="skill-chat-demo">
    <aside class="skill-sidebar">
      <div class="sidebar-section">
        <h3>Skills</h3>
        <p class="sidebar-hint">勾选后发送消息，skillPlugin 会将技能指令注入请求。</p>
        <div class="skill-options">
          <label v-for="skill in allSkills" :key="skill.name" class="skill-option">
            <input
              type="checkbox"
              :checked="selectedSkillNames.includes(skill.name)"
              @change="toggleSkill(skill.name, $event)"
            />
            <span>
              <strong>{{ skill.name }}</strong>
              <small>{{ skill.description }}</small>
            </span>
          </label>
        </div>
      </div>
      <div class="sidebar-section">
        <h3>请求详情</h3>
        <div class="selected-summary">
          <span>选中 skills</span>
          <strong v-for="skillName in selectedSkillNames" :key="skillName">{{ skillName }}</strong>
          <em v-if="selectedSkillNames.length === 0">None</em>
        </div>
        <h4 class="subsection-title">System message</h4>
        <pre class="sidebar-pre">{{ systemMessageContent }}</pre>
        <h4 class="subsection-title">Runtime tools</h4>
        <pre class="sidebar-pre">{{ toolNamesList }}</pre>
      </div>
    </aside>
    <div class="chat-area">
      <tr-bubble-list :messages="messages" :role-configs="roles" :auto-scroll="true"></tr-bubble-list>
      <tr-sender
        v-model="inputMessage"
        :placeholder="isProcessing ? '正在思考...' : '请输入您的问题'"
        :clearable="true"
        :loading="isProcessing"
        @submit="handleSubmit"
        @cancel="abortRequest"
      ></tr-sender>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BubbleRoleConfig } from '@opentiny/tiny-robot'
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import type { ChatCompletion, MessageRequestBody } from '@opentiny/tiny-robot-kit'
import { skillPlugin, toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'
import type { SkillDefinition } from '@opentiny/tiny-robot-kit/core'
import { SkillManager } from '@opentiny/tiny-robot-kit/core'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { computed, h, ref } from 'vue'
import './VueSkillPlugin.css'

const allSkills: SkillDefinition[] = [
  {
    name: 'weather',
    description: '回答天气、温度、降雨和预报相关问题。',
    instructions: 'Use weather references when the user asks about weather. Keep the answer concise.',
    files: [
      {
        path: 'references/weather-format.md',
        kind: 'text',
        content: 'Return current condition first, then one short forecast point.',
      },
    ],
  },
  {
    name: 'vue-best-practices',
    description: '回答 Vue 组合式 API、响应式和组件拆分问题。',
    instructions: 'Prefer Vue Composition API and keep reactive state close to the feature that owns it.',
  },
]

const manager = new SkillManager({
  skills: allSkills,
  selectedSkillNames: ['weather'],
})

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}

const inputMessage = ref('')
const selectedSkillNames = ref(manager.getSelectedSkillNames())
const systemMessageContent = ref('发送一次消息后查看注入结果。')
const toolNamesList = ref('[]')

const selectedSkills = computed(() =>
  selectedSkillNames.value.flatMap((skillName) => {
    const skill = manager.get(skillName)
    return skill ? [skill] : []
  }),
)

const syncSelectedSkillNames = () => {
  selectedSkillNames.value = manager.getSelectedSkillNames()
}

const toggleSkill = (skillName: string, event: Event) => {
  if ((event.target as HTMLInputElement).checked) {
    manager.select(skillName)
  } else {
    manager.unselect(skillName)
  }
  syncSelectedSkillNames()
}

const responseProvider = async (requestBody: MessageRequestBody): Promise<ChatCompletion> => {
  const sysMsg = requestBody.messages.find((m) => m.role === 'system')
  const toolNames =
    requestBody.tools?.map((t: { function?: { name?: string } }) => t.function?.name).filter(Boolean) ?? []
  const parts: string[] = []

  if (sysMsg?.content) {
    const skills = sysMsg.content.match(/##\s+(\S+)/g)?.map((s) => s.replace(/^##\s+/, '')) ?? []
    parts.push(`📄 识别到 ${skills.length} 个技能：${skills.join('、') || '无'}`)
  }

  if (toolNames.length) {
    parts.push(`🛠️ ${toolNames.length} 个工具：${toolNames.join('、')}`)
  }

  parts.push('请求已捕获，详情见右侧面板。')

  return {
    id: 'skill-plugin-demo',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'mock',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: parts.join('\n\n'),
        },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }
}

const { isProcessing, messages, sendMessage, abortRequest } = useMessage({
  responseProvider,
  plugins: [
    skillPlugin({
      skills: selectedSkills,
    }),
    toolPlugin({
      getTools: async () => [],
      callTool: async () => 'fallback',
    }),
    {
      onBeforeRequest: (context: { requestBody: MessageRequestBody }) => {
        const sysMsg = context.requestBody.messages.find((m) => m.role === 'system')
        systemMessageContent.value =
          typeof sysMsg?.content === 'string' ? sysMsg.content : '发送一次消息后查看注入结果。'
        const tools = context.requestBody.tools?.map((t: { function?: { name?: string } }) => t.function?.name)
        toolNamesList.value = JSON.stringify(tools ?? [], null, 2)
      },
    },
  ],
})

function handleSubmit(content: string) {
  if (!content?.trim() || isProcessing.value) return
  sendMessage(content.trim())
  inputMessage.value = ''
}
</script>

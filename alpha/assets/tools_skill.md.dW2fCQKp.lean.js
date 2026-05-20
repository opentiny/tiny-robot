const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/VueSkillPlugin.Bpywsu50.js","assets/chunks/theme.BrKp_t0z.js","assets/chunks/framework.Ck99i4t_.js","assets/chunks/index.CknsOgdS.js","assets/chunks/chunk-6JEZBNBO.B-1UueO0.js","assets/chunks/core.BK6QCpYc.js","assets/chunks/SkillInspector.C_emD6HL.js"])))=>i.map(i=>d[i]);
import{aV as r,_ as o,bg as F,b1 as B,G as m,O as k,cn as d,cb as C,Q as i,bH as n,cl as e,N as E,bq as c,bb as u}from"./chunks/framework.Ck99i4t_.js";import{L as g,N as y}from"./chunks/index.Cb5JAxSq.js";const A=`<template>
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
        id: 'references/weather-format.md',
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
    const skills = sysMsg.content.match(/##\\s+(\\S+)/g)?.map((s) => s.replace(/^##\\s+/, '')) ?? []
    parts.push(\`📄 识别到 \${skills.length} 个技能：\${skills.join('、') || '无'}\`)
  }

  if (toolNames.length) {
    parts.push(\`🛠️ \${toolNames.length} 个工具：\${toolNames.join('、')}\`)
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
          content: parts.join('\\n\\n'),
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
<\/script>
`,D=`<template>
  <div class="skill-inspector">
    <section class="panel import-panel">
      <div class="panel-heading">
        <div>
          <h3>导入与管理</h3>
          <p>从示例或本地目录导入 skill，再用 manager 选择本次要编译的 skill。</p>
        </div>
        <button type="button" class="primary-action" @click="loadExampleSkill">导入示例 skill</button>
      </div>

      <label class="directory-picker">
        <input type="file" webkitdirectory directory multiple @change="handleDirectoryChange" />
        <span>选择本地 skill 目录</span>
      </label>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div class="skill-list">
        <div
          v-for="skill in skills"
          :key="skill.name"
          class="skill-item"
          :class="{ active: inspectedSkillName === skill.name }"
          role="button"
          tabindex="0"
          @click="inspectSkill(skill.name)"
          @keydown.enter.prevent="inspectSkill(skill.name)"
          @keydown.space.prevent="inspectSkill(skill.name)"
        >
          <input
            type="checkbox"
            :checked="selectedSkillNames.includes(skill.name)"
            @click.stop
            @change="toggleSkillFromEvent(skill.name, $event)"
          />
          <span>
            <strong>{{ skill.name }}</strong>
            <small>{{ skill.description }}</small>
          </span>
        </div>
      </div>
    </section>

    <div class="output-stack">
      <section class="panel right-panel">
        <div class="right-tab-header">
          <button type="button" :class="{ active: rightTab === 'skill' }" @click="rightTab = 'skill'">
            当前 Skill
          </button>
          <button type="button" :class="{ active: rightTab === 'compiler' }" @click="rightTab = 'compiler'">
            Compiler 输出
          </button>
        </div>

        <div v-if="rightTab === 'skill'" class="right-tab-content">
          <div class="summary-grid">
            <div>
              <span>Name</span>
              <strong>{{ inspectedSkill?.name || '-' }}</strong>
            </div>
            <div>
              <span>Files</span>
              <strong>{{ inspectedSkill?.files?.length ?? 0 }}</strong>
            </div>
          </div>

          <pre>{{ inspectedDefinitionJson }}</pre>
        </div>

        <div v-else class="right-tab-content">
          <div class="selected-skills">
            <span>Selected skills</span>
            <div>
              <strong v-for="skillName in selectedSkillNames" :key="skillName">{{ skillName }}</strong>
              <em v-if="selectedSkillNames.length === 0">None</em>
            </div>
          </div>

          <div class="tabs">
            <button
              v-for="tab in compilerTabs"
              :key="tab.value"
              type="button"
              :class="{ active: compilerTab === tab.value }"
              @click="compilerTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>

          <pre v-if="compilerTab === 'instructions'">{{ compiledInstructionsText }}</pre>
          <pre v-else>{{ compiledToolsJson }}</pre>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import './SkillInspector.css'
import { useSkillInspector } from './useSkillInspector'

const {
  compilerTab,
  compilerTabs,
  compiledInstructionsText,
  compiledToolsJson,
  errorMessage,
  handleDirectoryChange,
  inspectSkill,
  inspectedDefinitionJson,
  inspectedSkill,
  inspectedSkillName,
  loadExampleSkill,
  rightTab,
  selectedSkillNames,
  skills,
  toggleSkillFromEvent,
} = useSkillInspector()
<\/script>
`,x=JSON.parse('{"title":"Skill 技能工具链","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"tools/skill.md","filePath":"tools/skill.md"}'),b={name:"tools/skill.md"},w=Object.assign(b,{setup(v){const t=c();r(async()=>{t.value=(await o(async()=>{const{default:l}=await import("./chunks/VueSkillPlugin.Bpywsu50.js");return{default:l}},__vite__mapDeps([0,1,2,3,4,5]))).default});const a=u(!0),p=c();return r(async()=>{p.value=(await o(async()=>{const{default:l}=await import("./chunks/SkillInspector.C_emD6HL.js");return{default:l}},__vite__mapDeps([6,2,5,4]))).default}),(l,s)=>{const h=F("ClientOnly");return B(),m("div",null,[s[2]||(s[2]=k("",8)),d(i(n(g),null,null,512),[[C,a.value]]),i(h,null,{default:e(()=>[i(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22SkillInspector.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FSkillInspector.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22skill-inspector%5C%22%3E%5Cn%20%20%20%20%3Csection%20class%3D%5C%22panel%20import-panel%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22panel-heading%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ch3%3E%E5%AF%BC%E5%85%A5%E4%B8%8E%E7%AE%A1%E7%90%86%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cp%3E%E4%BB%8E%E7%A4%BA%E4%BE%8B%E6%88%96%E6%9C%AC%E5%9C%B0%E7%9B%AE%E5%BD%95%E5%AF%BC%E5%85%A5%20skill%EF%BC%8C%E5%86%8D%E7%94%A8%20manager%20%E9%80%89%E6%8B%A9%E6%9C%AC%E6%AC%A1%E8%A6%81%E7%BC%96%E8%AF%91%E7%9A%84%20skill%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20class%3D%5C%22primary-action%5C%22%20%40click%3D%5C%22loadExampleSkill%5C%22%3E%E5%AF%BC%E5%85%A5%E7%A4%BA%E4%BE%8B%20skill%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%20class%3D%5C%22directory-picker%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20type%3D%5C%22file%5C%22%20webkitdirectory%20directory%20multiple%20%40change%3D%5C%22handleDirectoryChange%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%E9%80%89%E6%8B%A9%E6%9C%AC%E5%9C%B0%20skill%20%E7%9B%AE%E5%BD%95%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%5Cn%20%20%20%20%20%20%3Cp%20v-if%3D%5C%22errorMessage%5C%22%20class%3D%5C%22error-message%5C%22%3E%7B%7B%20errorMessage%20%7D%7D%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22skill-list%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22skill%20in%20skills%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22skill.name%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20class%3D%5C%22skill-item%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20active%3A%20inspectedSkillName%20%3D%3D%3D%20skill.name%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20role%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20tabindex%3D%5C%220%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22inspectSkill(skill.name)%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40keydown.enter.prevent%3D%5C%22inspectSkill(skill.name)%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40keydown.space.prevent%3D%5C%22inspectSkill(skill.name)%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22checkbox%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Achecked%3D%5C%22selectedSkillNames.includes(skill.name)%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40click.stop%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40change%3D%5C%22toggleSkillFromEvent(skill.name%2C%20%24event)%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20skill.name%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Csmall%3E%7B%7B%20skill.description%20%7D%7D%3C%2Fsmall%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fsection%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22output-stack%5C%22%3E%5Cn%20%20%20%20%20%20%3Csection%20class%3D%5C%22panel%20right-panel%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22right-tab-header%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%3Aclass%3D%5C%22%7B%20active%3A%20rightTab%20%3D%3D%3D%20'skill'%20%7D%5C%22%20%40click%3D%5C%22rightTab%20%3D%20'skill'%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%E5%BD%93%E5%89%8D%20Skill%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%3Aclass%3D%5C%22%7B%20active%3A%20rightTab%20%3D%3D%3D%20'compiler'%20%7D%5C%22%20%40click%3D%5C%22rightTab%20%3D%20'compiler'%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20Compiler%20%E8%BE%93%E5%87%BA%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20v-if%3D%5C%22rightTab%20%3D%3D%3D%20'skill'%5C%22%20class%3D%5C%22right-tab-content%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22summary-grid%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%3EName%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20inspectedSkill%3F.name%20%7C%7C%20'-'%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%3EFiles%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20inspectedSkill%3F.files%3F.length%20%3F%3F%200%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%3Cpre%3E%7B%7B%20inspectedDefinitionJson%20%7D%7D%3C%2Fpre%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20v-else%20class%3D%5C%22right-tab-content%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22selected-skills%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%3ESelected%20skills%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%20v-for%3D%5C%22skillName%20in%20selectedSkillNames%5C%22%20%3Akey%3D%5C%22skillName%5C%22%3E%7B%7B%20skillName%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cem%20v-if%3D%5C%22selectedSkillNames.length%20%3D%3D%3D%200%5C%22%3ENone%3C%2Fem%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22tabs%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22tab%20in%20compilerTabs%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22tab.value%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20active%3A%20compilerTab%20%3D%3D%3D%20tab.value%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22compilerTab%20%3D%20tab.value%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%7B%20tab.label%20%7D%7D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%3Cpre%20v-if%3D%5C%22compilerTab%20%3D%3D%3D%20'instructions'%5C%22%3E%7B%7B%20compiledInstructionsText%20%7D%7D%3C%2Fpre%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cpre%20v-else%3E%7B%7B%20compiledToolsJson%20%7D%7D%3C%2Fpre%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20'.%2FSkillInspector.css'%5Cnimport%20%7B%20useSkillInspector%20%7D%20from%20'.%2FuseSkillInspector'%5Cn%5Cnconst%20%7B%5Cn%20%20compilerTab%2C%5Cn%20%20compilerTabs%2C%5Cn%20%20compiledInstructionsText%2C%5Cn%20%20compiledToolsJson%2C%5Cn%20%20errorMessage%2C%5Cn%20%20handleDirectoryChange%2C%5Cn%20%20inspectSkill%2C%5Cn%20%20inspectedDefinitionJson%2C%5Cn%20%20inspectedSkill%2C%5Cn%20%20inspectedSkillName%2C%5Cn%20%20loadExampleSkill%2C%5Cn%20%20rightTab%2C%5Cn%20%20selectedSkillNames%2C%5Cn%20%20skills%2C%5Cn%20%20toggleSkillFromEvent%2C%5Cn%7D%20%3D%20useSkillInspector()%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22useSkillInspector.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FuseSkillInspector.ts%22%2C%22code%22%3A%22import%20%7B%5Cn%20%20SkillManager%2C%5Cn%20%20compileSkillInstructions%2C%5Cn%20%20createSkillRuntimeTools%2C%5Cn%20%20loadSkillFilesFromFileList%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-kit%2Fcore'%5Cnimport%20type%20%7B%20SkillDefinition%2C%20SkillFile%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit%2Fcore'%5Cnimport%20%7B%20computed%2C%20ref%2C%20watch%20%7D%20from%20'vue'%5Cnimport%20%7B%20exampleSkillFiles%20%7D%20from%20'.%2FexampleSkillFiles'%5Cn%5Cnexport%20const%20compilerOutputTabs%20%3D%20%5B%5Cn%20%20%7B%20label%3A%20'Instructions'%2C%20value%3A%20'instructions'%20%7D%2C%5Cn%20%20%7B%20label%3A%20'Runtime%20tools'%2C%20value%3A%20'tools'%20%7D%2C%5Cn%5D%20as%20const%5Cn%5Cntype%20CompilerOutputTab%20%3D%20(typeof%20compilerOutputTabs)%5Bnumber%5D%5B'value'%5D%5Cn%5Cnexport%20const%20useSkillInspector%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20const%20manager%20%3D%20new%20SkillManager()%5Cn%20%20const%20skills%20%3D%20ref%3CSkillDefinition%5B%5D%3E(%5B%5D)%5Cn%20%20const%20selectedSkillNames%20%3D%20ref%3Cstring%5B%5D%3E(%5B%5D)%5Cn%20%20const%20inspectedSkillName%20%3D%20ref('')%5Cn%20%20const%20compilerTab%20%3D%20ref%3CCompilerOutputTab%3E('instructions')%5Cn%20%20const%20rightTab%20%3D%20ref%3C'skill'%20%7C%20'compiler'%3E('skill')%5Cn%20%20const%20errorMessage%20%3D%20ref('')%5Cn%20%20const%20compiledInstructionsText%20%3D%20ref('')%5Cn%5Cn%20%20const%20syncManagerState%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20skills.value%20%3D%20manager.list()%5Cn%20%20%20%20selectedSkillNames.value%20%3D%20manager.getSelectedSkillNames()%5Cn%20%20%7D%5Cn%5Cn%20%20const%20importSkillFiles%20%3D%20(files%3A%20SkillFile%5B%5D)%20%3D%3E%20%7B%5Cn%20%20%20%20errorMessage.value%20%3D%20''%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20const%20result%20%3D%20manager.import(files)%5Cn%20%20%20%20%20%20manager.select(result.skill.name)%5Cn%20%20%20%20%20%20inspectedSkillName.value%20%3D%20result.skill.name%5Cn%20%20%20%20%20%20syncManagerState()%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20errorMessage.value%20%3D%20error%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20const%20loadExampleSkill%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20importSkillFiles(exampleSkillFiles)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20handleDirectoryChange%20%3D%20async%20(event%3A%20Event)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20input%20%3D%20event.target%20as%20HTMLInputElement%5Cn%20%20%20%20if%20(!input.files%3F.length)%20%7B%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20importSkillFiles(await%20loadSkillFilesFromFileList(input.files))%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20errorMessage.value%20%3D%20error%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%5Cn%20%20%20%20%7D%20finally%20%7B%5Cn%20%20%20%20%20%20input.value%20%3D%20''%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20const%20toggleSkill%20%3D%20(skillName%3A%20string%2C%20checked%3A%20boolean)%20%3D%3E%20%7B%5Cn%20%20%20%20if%20(checked)%20%7B%5Cn%20%20%20%20%20%20manager.select(skillName)%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20manager.unselect(skillName)%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20syncManagerState()%5Cn%20%20%7D%5Cn%5Cn%20%20const%20inspectSkill%20%3D%20(skillName%3A%20string)%20%3D%3E%20%7B%5Cn%20%20%20%20inspectedSkillName.value%20%3D%20skillName%5Cn%20%20%7D%5Cn%5Cn%20%20const%20toggleSkillFromEvent%20%3D%20(skillName%3A%20string%2C%20event%3A%20Event)%20%3D%3E%20%7B%5Cn%20%20%20%20toggleSkill(skillName%2C%20(event.target%20as%20HTMLInputElement).checked)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20selectedSkills%20%3D%20computed(()%20%3D%3E%5Cn%20%20%20%20selectedSkillNames.value.flatMap((skillName)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20skill%20%3D%20manager.get(skillName)%5Cn%20%20%20%20%20%20return%20skill%20%3F%20%5Bskill%5D%20%3A%20%5B%5D%5Cn%20%20%20%20%7D)%2C%5Cn%20%20)%5Cn%5Cn%20%20const%20inspectedSkill%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20%20%20return%20manager.get(inspectedSkillName.value)%20%3F%3F%20skills.value%5B0%5D%5Cn%20%20%7D)%5Cn%5Cn%20%20const%20inspectedDefinitionJson%20%3D%20computed(()%20%3D%3E%20JSON.stringify(inspectedSkill.value%20%3F%3F%20null%2C%20null%2C%202))%5Cn%5Cn%20%20const%20compiledToolsJson%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20%20%20const%20tools%20%3D%20createSkillRuntimeTools(selectedSkills.value).map((runtimeTool)%20%3D%3E%20runtimeTool.tool)%5Cn%20%20%20%20return%20JSON.stringify(tools%2C%20null%2C%202)%5Cn%20%20%7D)%5Cn%5Cn%20%20watch(%5Cn%20%20%20%20selectedSkills%2C%5Cn%20%20%20%20async%20(currentSkills)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20message%20%3D%20await%20compileSkillInstructions(currentSkills)%5Cn%20%20%20%20%20%20compiledInstructionsText.value%20%3D%20message%20%3F%20JSON.stringify(message%2C%20null%2C%202)%20%3A%20'undefined'%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20%7B%20immediate%3A%20true%20%7D%2C%5Cn%20%20)%5Cn%5Cn%20%20loadExampleSkill()%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20compilerTab%2C%5Cn%20%20%20%20compilerTabs%3A%20compilerOutputTabs%2C%5Cn%20%20%20%20compiledInstructionsText%2C%5Cn%20%20%20%20compiledToolsJson%2C%5Cn%20%20%20%20errorMessage%2C%5Cn%20%20%20%20handleDirectoryChange%2C%5Cn%20%20%20%20inspectSkill%2C%5Cn%20%20%20%20inspectedDefinitionJson%2C%5Cn%20%20%20%20inspectedSkill%2C%5Cn%20%20%20%20inspectedSkillName%2C%5Cn%20%20%20%20loadExampleSkill%2C%5Cn%20%20%20%20rightTab%2C%5Cn%20%20%20%20selectedSkillNames%2C%5Cn%20%20%20%20skills%2C%5Cn%20%20%20%20toggleSkillFromEvent%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%2C%22exampleSkillFiles.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FexampleSkillFiles.ts%22%2C%22code%22%3A%22import%20type%20%7B%20SkillFile%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit%2Fcore'%5Cn%5Cnexport%20const%20exampleSkillFiles%3A%20SkillFile%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20path%3A%20'SKILL.md'%2C%5Cn%20%20%20%20kind%3A%20'text'%2C%5Cn%20%20%20%20content%3A%20%60---%5Cnname%3A%20weather%5Cndescription%3A%20Answer%20weather%20questions%20with%20concise%20current%20conditions%20and%20forecast%20guidance.%5Cn---%5Cn%5Cn%23%20Weather%20Skill%5Cn%5CnUse%20this%20skill%20when%20the%20user%20asks%20about%20weather%2C%20temperature%2C%20rain%2C%20wind%2C%20or%20forecast.%5CnAlways%20mention%20the%20target%20location%20and%20keep%20the%20answer%20concise.%60%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20path%3A%20'references%2Fweather-format.md'%2C%5Cn%20%20%20%20kind%3A%20'text'%2C%5Cn%20%20%20%20content%3A%20'Return%20current%20condition%20first%2C%20then%20list%20the%20next%20forecast%20point%20when%20available.'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%2C%22SkillInspector.css%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FSkillInspector.css%22%2C%22code%22%3A%22.skill-inspector%20%7B%5Cn%20%20container-type%3A%20inline-size%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20minmax(240px%2C%20320px)%20minmax(0%2C%201fr)%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.panel%20%7B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20background%3A%20var(--vp-c-bg)%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.panel-heading%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20margin-bottom%3A%2014px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.panel-heading%20h3%20%7B%5Cn%20%20margin%3A%200%200%204px%3B%5Cn%20%20font-size%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.panel-heading%20p%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.right-panel%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20gap%3A%200%3B%5Cn%20%20padding%3A%200%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.right-panel%20.right-tab-header%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20margin%3A%200%3B%5Cn%20%20border-bottom%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.right-panel%20.right-tab-header%20button%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20padding%3A%2010px%2016px%3B%5Cn%20%20border%3A%20none%3B%5Cn%20%20border-bottom%3A%202px%20solid%20transparent%3B%5Cn%20%20border-radius%3A%200%3B%5Cn%20%20background%3A%20transparent%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%20%20font-weight%3A%20500%3B%5Cn%20%20transition%3A%20color%200.15s%2C%20border-color%200.15s%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.right-panel%20.right-tab-header%20button%3Ahover%20%7B%5Cn%20%20color%3A%20var(--vp-c-text-1)%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.right-panel%20.right-tab-header%20button.active%20%7B%5Cn%20%20color%3A%20var(--vp-c-brand-1)%3B%5Cn%20%20border-bottom-color%3A%20var(--vp-c-brand-1)%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.right-tab-content%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.right-tab-content%20pre%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.primary-action%2C%5Cn.skill-inspector%20.tabs%20button%20%7B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-text-1)%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.primary-action%20%7B%5Cn%20%20flex%3A%20none%3B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.primary-action%3Ahover%2C%5Cn.skill-inspector%20.tabs%20button%3Ahover%2C%5Cn.skill-inspector%20.tabs%20button.active%20%7B%5Cn%20%20border-color%3A%20var(--vp-c-brand-1)%3B%5Cn%20%20color%3A%20var(--vp-c-brand-1)%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.directory-picker%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20min-height%3A%2072px%3B%5Cn%20%20border%3A%201px%20dashed%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.directory-picker%20input%20%7B%5Cn%20%20display%3A%20none%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.error-message%20%7B%5Cn%20%20margin%3A%2010px%200%200%3B%5Cn%20%20color%3A%20var(--vp-c-danger-1)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-list%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20margin-top%3A%2014px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-item%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20padding%3A%2010px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-item%20input%20%7B%5Cn%20%20flex%3A%20none%3B%5Cn%20%20margin-top%3A%203px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-item.active%20%7B%5Cn%20%20border-color%3A%20var(--vp-c-brand-1)%3B%5Cn%20%20box-shadow%3A%200%200%200%201px%20var(--vp-c-brand-1)%20inset%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-item%20strong%2C%5Cn.skill-inspector%20.skill-item%20small%20%7B%5Cn%20%20display%3A%20block%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-item%20small%20%7B%5Cn%20%20margin-top%3A%204px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20line-height%3A%201.5%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.summary-grid%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20repeat(auto-fit%2C%20minmax(120px%2C%201fr))%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20margin-bottom%3A%2014px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.summary-grid%20div%20%7B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20padding%3A%2010px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.summary-grid%20span%2C%5Cn.skill-inspector%20.summary-grid%20strong%20%7B%5Cn%20%20display%3A%20block%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.summary-grid%20span%20%7B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.summary-grid%20strong%20%7B%5Cn%20%20margin-top%3A%204px%3B%5Cn%20%20word-break%3A%20break-word%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.selected-skills%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20gap%3A%2010px%3B%5Cn%20%20margin-bottom%3A%2010px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20padding%3A%2010px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.selected-skills%20span%20%7B%5Cn%20%20flex%3A%20none%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%2024px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.selected-skills%20div%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.selected-skills%20strong%20%7B%5Cn%20%20border-radius%3A%20999px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-brand-1)%3B%5Cn%20%20padding%3A%204px%208px%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.selected-skills%20em%20%7B%5Cn%20%20color%3A%20var(--vp-c-text-3)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20font-style%3A%20normal%3B%5Cn%20%20line-height%3A%2024px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.tabs%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20margin-bottom%3A%2010px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.tabs%20button%20%7B%5Cn%20%20padding%3A%207px%2010px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20pre%20%7B%5Cn%20%20min-height%3A%20240px%3B%5Cn%20%20max-height%3A%20420px%3B%5Cn%20%20margin%3A%200%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20background%3A%20var(--vp-code-block-bg)%3B%5Cn%20%20padding%3A%2014px%3B%5Cn%20%20color%3A%20var(--vp-code-block-color)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20768px)%20%7B%5Cn%20%20.skill-inspector%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%5Cn%20%20.skill-inspector%20.panel-heading%20%7B%5Cn%20%20%20%20flex-direction%3A%20column%3B%5Cn%20%20%7D%5Cn%5Cn%20%20.skill-inspector%20.primary-action%20%7B%5Cn%20%20%20%20width%3A%20100%25%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%40container%20(max-width%3A%20720px)%20%7B%5Cn%20%20.skill-inspector%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{a.value=!1}),vueCode:n(D)},E({_:2},[p.value?{name:"vue",fn:e(()=>[i(n(p))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[3]||(s[3]=k("",37)),d(i(n(g),null,null,512),[[C,a.value]]),i(h,null,{default:e(()=>[i(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22VueSkillPlugin.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FVueSkillPlugin.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22skill-chat-demo%5C%22%3E%5Cn%20%20%20%20%3Caside%20class%3D%5C%22skill-sidebar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22sidebar-section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ch3%3ESkills%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22sidebar-hint%5C%22%3E%E5%8B%BE%E9%80%89%E5%90%8E%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%EF%BC%8CskillPlugin%20%E4%BC%9A%E5%B0%86%E6%8A%80%E8%83%BD%E6%8C%87%E4%BB%A4%E6%B3%A8%E5%85%A5%E8%AF%B7%E6%B1%82%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22skill-options%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Clabel%20v-for%3D%5C%22skill%20in%20allSkills%5C%22%20%3Akey%3D%5C%22skill.name%5C%22%20class%3D%5C%22skill-option%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cinput%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22checkbox%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Achecked%3D%5C%22selectedSkillNames.includes(skill.name)%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40change%3D%5C%22toggleSkill(skill.name%2C%20%24event)%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20skill.name%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Csmall%3E%7B%7B%20skill.description%20%7D%7D%3C%2Fsmall%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22sidebar-section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ch3%3E%E8%AF%B7%E6%B1%82%E8%AF%A6%E6%83%85%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22selected-summary%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cspan%3E%E9%80%89%E4%B8%AD%20skills%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cstrong%20v-for%3D%5C%22skillName%20in%20selectedSkillNames%5C%22%20%3Akey%3D%5C%22skillName%5C%22%3E%7B%7B%20skillName%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cem%20v-if%3D%5C%22selectedSkillNames.length%20%3D%3D%3D%200%5C%22%3ENone%3C%2Fem%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3Ch4%20class%3D%5C%22subsection-title%5C%22%3ESystem%20message%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%20%20%3Cpre%20class%3D%5C%22sidebar-pre%5C%22%3E%7B%7B%20systemMessageContent%20%7D%7D%3C%2Fpre%3E%5Cn%20%20%20%20%20%20%20%20%3Ch4%20class%3D%5C%22subsection-title%5C%22%3ERuntime%20tools%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%20%20%3Cpre%20class%3D%5C%22sidebar-pre%5C%22%3E%7B%7B%20toolNamesList%20%7D%7D%3C%2Fpre%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Faside%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-area%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%20%3Aauto-scroll%3D%5C%22true%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20type%20%7B%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20skillPlugin%2C%20toolPlugin%2C%20useMessage%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20type%20%7B%20SkillDefinition%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit%2Fcore'%5Cnimport%20%7B%20SkillManager%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit%2Fcore'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20computed%2C%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20'.%2FVueSkillPlugin.css'%5Cn%5Cnconst%20allSkills%3A%20SkillDefinition%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20name%3A%20'weather'%2C%5Cn%20%20%20%20description%3A%20'%E5%9B%9E%E7%AD%94%E5%A4%A9%E6%B0%94%E3%80%81%E6%B8%A9%E5%BA%A6%E3%80%81%E9%99%8D%E9%9B%A8%E5%92%8C%E9%A2%84%E6%8A%A5%E7%9B%B8%E5%85%B3%E9%97%AE%E9%A2%98%E3%80%82'%2C%5Cn%20%20%20%20instructions%3A%20'Use%20weather%20references%20when%20the%20user%20asks%20about%20weather.%20Keep%20the%20answer%20concise.'%2C%5Cn%20%20%20%20files%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'references%2Fweather-format.md'%2C%5Cn%20%20%20%20%20%20%20%20path%3A%20'references%2Fweather-format.md'%2C%5Cn%20%20%20%20%20%20%20%20kind%3A%20'text'%2C%5Cn%20%20%20%20%20%20%20%20content%3A%20'Return%20current%20condition%20first%2C%20then%20one%20short%20forecast%20point.'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20name%3A%20'vue-best-practices'%2C%5Cn%20%20%20%20description%3A%20'%E5%9B%9E%E7%AD%94%20Vue%20%E7%BB%84%E5%90%88%E5%BC%8F%20API%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E5%92%8C%E7%BB%84%E4%BB%B6%E6%8B%86%E5%88%86%E9%97%AE%E9%A2%98%E3%80%82'%2C%5Cn%20%20%20%20instructions%3A%20'Prefer%20Vue%20Composition%20API%20and%20keep%20reactive%20state%20close%20to%20the%20feature%20that%20owns%20it.'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20manager%20%3D%20new%20SkillManager(%7B%5Cn%20%20skills%3A%20allSkills%2C%5Cn%20%20selectedSkillNames%3A%20%5B'weather'%5D%2C%5Cn%7D)%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cnconst%20selectedSkillNames%20%3D%20ref(manager.getSelectedSkillNames())%5Cnconst%20systemMessageContent%20%3D%20ref('%E5%8F%91%E9%80%81%E4%B8%80%E6%AC%A1%E6%B6%88%E6%81%AF%E5%90%8E%E6%9F%A5%E7%9C%8B%E6%B3%A8%E5%85%A5%E7%BB%93%E6%9E%9C%E3%80%82')%5Cnconst%20toolNamesList%20%3D%20ref('%5B%5D')%5Cn%5Cnconst%20selectedSkills%20%3D%20computed(()%20%3D%3E%5Cn%20%20selectedSkillNames.value.flatMap((skillName)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20skill%20%3D%20manager.get(skillName)%5Cn%20%20%20%20return%20skill%20%3F%20%5Bskill%5D%20%3A%20%5B%5D%5Cn%20%20%7D)%2C%5Cn)%5Cn%5Cnconst%20syncSelectedSkillNames%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20selectedSkillNames.value%20%3D%20manager.getSelectedSkillNames()%5Cn%7D%5Cn%5Cnconst%20toggleSkill%20%3D%20(skillName%3A%20string%2C%20event%3A%20Event)%20%3D%3E%20%7B%5Cn%20%20if%20((event.target%20as%20HTMLInputElement).checked)%20%7B%5Cn%20%20%20%20manager.select(skillName)%5Cn%20%20%7D%20else%20%7B%5Cn%20%20%20%20manager.unselect(skillName)%5Cn%20%20%7D%5Cn%20%20syncSelectedSkillNames()%5Cn%7D%5Cn%5Cnconst%20responseProvider%20%3D%20async%20(requestBody%3A%20MessageRequestBody)%3A%20Promise%3CChatCompletion%3E%20%3D%3E%20%7B%5Cn%20%20const%20sysMsg%20%3D%20requestBody.messages.find((m)%20%3D%3E%20m.role%20%3D%3D%3D%20'system')%5Cn%20%20const%20toolNames%20%3D%5Cn%20%20%20%20requestBody.tools%3F.map((t%3A%20%7B%20function%3F%3A%20%7B%20name%3F%3A%20string%20%7D%20%7D)%20%3D%3E%20t.function%3F.name).filter(Boolean)%20%3F%3F%20%5B%5D%5Cn%20%20const%20parts%3A%20string%5B%5D%20%3D%20%5B%5D%5Cn%5Cn%20%20if%20(sysMsg%3F.content)%20%7B%5Cn%20%20%20%20const%20skills%20%3D%20sysMsg.content.match(%2F%23%23%5C%5Cs%2B(%5C%5CS%2B)%2Fg)%3F.map((s)%20%3D%3E%20s.replace(%2F%5E%23%23%5C%5Cs%2B%2F%2C%20''))%20%3F%3F%20%5B%5D%5Cn%20%20%20%20parts.push(%60%F0%9F%93%84%20%E8%AF%86%E5%88%AB%E5%88%B0%20%24%7Bskills.length%7D%20%E4%B8%AA%E6%8A%80%E8%83%BD%EF%BC%9A%24%7Bskills.join('%E3%80%81')%20%7C%7C%20'%E6%97%A0'%7D%60)%5Cn%20%20%7D%5Cn%5Cn%20%20if%20(toolNames.length)%20%7B%5Cn%20%20%20%20parts.push(%60%F0%9F%9B%A0%EF%B8%8F%20%24%7BtoolNames.length%7D%20%E4%B8%AA%E5%B7%A5%E5%85%B7%EF%BC%9A%24%7BtoolNames.join('%E3%80%81')%7D%60)%5Cn%20%20%7D%5Cn%5Cn%20%20parts.push('%E8%AF%B7%E6%B1%82%E5%B7%B2%E6%8D%95%E8%8E%B7%EF%BC%8C%E8%AF%A6%E6%83%85%E8%A7%81%E5%8F%B3%E4%BE%A7%E9%9D%A2%E6%9D%BF%E3%80%82')%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20id%3A%20'skill-plugin-demo'%2C%5Cn%20%20%20%20object%3A%20'chat.completion'%2C%5Cn%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20message%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20parts.join('%5C%5Cn%5C%5Cn')%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20delta%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20finish_reason%3A%20'stop'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20%7B%20isProcessing%2C%20messages%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessage(%7B%5Cn%20%20responseProvider%2C%5Cn%20%20plugins%3A%20%5B%5Cn%20%20%20%20skillPlugin(%7B%5Cn%20%20%20%20%20%20skills%3A%20selectedSkills%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20%20%20toolPlugin(%7B%5Cn%20%20%20%20%20%20getTools%3A%20async%20()%20%3D%3E%20%5B%5D%2C%5Cn%20%20%20%20%20%20callTool%3A%20async%20()%20%3D%3E%20'fallback'%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20onBeforeRequest%3A%20(context%3A%20%7B%20requestBody%3A%20MessageRequestBody%20%7D)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20const%20sysMsg%20%3D%20context.requestBody.messages.find((m)%20%3D%3E%20m.role%20%3D%3D%3D%20'system')%5Cn%20%20%20%20%20%20%20%20systemMessageContent.value%20%3D%5Cn%20%20%20%20%20%20%20%20%20%20typeof%20sysMsg%3F.content%20%3D%3D%3D%20'string'%20%3F%20sysMsg.content%20%3A%20'%E5%8F%91%E9%80%81%E4%B8%80%E6%AC%A1%E6%B6%88%E6%81%AF%E5%90%8E%E6%9F%A5%E7%9C%8B%E6%B3%A8%E5%85%A5%E7%BB%93%E6%9E%9C%E3%80%82'%5Cn%20%20%20%20%20%20%20%20const%20tools%20%3D%20context.requestBody.tools%3F.map((t%3A%20%7B%20function%3F%3A%20%7B%20name%3F%3A%20string%20%7D%20%7D)%20%3D%3E%20t.function%3F.name)%5Cn%20%20%20%20%20%20%20%20toolNamesList.value%20%3D%20JSON.stringify(tools%20%3F%3F%20%5B%5D%2C%20null%2C%202)%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%2C%5Cn%7D)%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20if%20(!content%3F.trim()%20%7C%7C%20isProcessing.value)%20return%5Cn%20%20sendMessage(content.trim())%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22VueSkillPlugin.css%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FVueSkillPlugin.css%22%2C%22code%22%3A%22.skill-chat-demo%20%7B%5Cn%20%20container-type%3A%20inline-size%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.chat-area%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20min-height%3A%20400px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.chat-area%20%3E%20%3Afirst-child%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20max-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-sidebar%20%7B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20background%3A%20var(--vp-c-bg)%3B%5Cn%20%20padding%3A%2014px%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%201fr%201fr%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.sidebar-section%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.sidebar-section%20h3%20%7B%5Cn%20%20font-size%3A%2014px%3B%5Cn%20%20margin%3A%200%200%204px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.sidebar-hint%20%7B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%201.5%3B%5Cn%20%20margin%3A%200%200%2010px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-options%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%206px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-option%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20padding%3A%208px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-option%20input%20%7B%5Cn%20%20flex%3A%20none%3B%5Cn%20%20margin-top%3A%202px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-option%20strong%2C%5Cn.skill-chat-demo%20.skill-option%20small%20%7B%5Cn%20%20display%3A%20block%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-option%20strong%20%7B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-option%20small%20%7B%5Cn%20%20margin-top%3A%202px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20line-height%3A%201.4%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.selected-summary%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%204px%3B%5Cn%20%20margin-bottom%3A%2010px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.selected-summary%20span%20%7B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.selected-summary%20strong%20%7B%5Cn%20%20border-radius%3A%20999px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-brand-1)%3B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20line-height%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.selected-summary%20em%20%7B%5Cn%20%20color%3A%20var(--vp-c-text-3)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20font-style%3A%20normal%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.subsection-title%20%7B%5Cn%20%20margin%3A%200%200%204px%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.sidebar-pre%20%7B%5Cn%20%20margin%3A%200%200%2010px%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20background%3A%20var(--vp-code-block-bg)%3B%5Cn%20%20padding%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-code-block-color)%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20line-height%3A%201.5%3B%5Cn%20%20min-height%3A%2060px%3B%5Cn%20%20max-height%3A%20150px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.sidebar-pre%3Alast-child%20%7B%5Cn%20%20margin-bottom%3A%200%3B%5Cn%7D%5Cn%5Cn%40container%20(max-width%3A%20640px)%20%7B%5Cn%20%20.skill-chat-demo%20.skill-sidebar%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{a.value=!1}),vueCode:n(A)},E({_:2},[t.value?{name:"vue",fn:e(()=>[i(n(t))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[4]||(s[4]=k("",37))])}}});export{x as __pageData,w as default};

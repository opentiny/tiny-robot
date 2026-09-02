const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/SkillInspector.BLMB6W93.js","assets/chunks/framework.CwYEzWt_.js","assets/chunks/index.AlJEDjRI.js","assets/chunks/VueSkillPlugin.CdJN0ZAZ.js","assets/chunks/theme.IOfw27ii.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as d,aZ as F,aL as u,v as B,H as k,bL as o,bB as E,J as i,bk as n,bJ as t,G as c,b7 as C,aU as m}from"./chunks/framework.CwYEzWt_.js";import{L as g,N as y}from"./chunks/index.D1WBd62Z.js";const A=`<template>
  <div class="skill-inspector">
    <section class="panel storage-panel">
      <div class="panel-heading">
        <div>
          <h3>Storage 管理</h3>
          <p>演示 add、get、list、delete，以及从本地目录导入后写入 storage。</p>
        </div>
        <button type="button" class="primary-action" @click="resetExampleSkills">重置示例</button>
      </div>

      <div class="action-row">
        <label class="directory-picker">
          <input type="file" webkitdirectory directory multiple @change="importDirectory" />
          <span>导入本地 skill 目录</span>
        </label>
        <button type="button" class="danger-action" :disabled="!inspectedSkill" @click="deleteInspectedSkill">
          删除当前
        </button>
      </div>

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
          <span>
            <strong>{{ skill.name }}</strong>
            <small>{{ skill.description }}</small>
          </span>
          <em>{{ skill.resources?.length ?? 0 }} files</em>
        </div>
      </div>
    </section>

    <section class="panel detail-panel">
      <div class="storage-viewer">
        <section class="file-tree">
          <h4>目录结构</h4>
          <div class="file-node-list">
            <button
              v-for="node in fileNodes"
              :key="node.path"
              type="button"
              class="file-node"
              :class="{ active: selectedFilePath === node.path, folder: node.kind === 'folder' }"
              :style="{ paddingLeft: \`\${10 + node.depth * 14}px\` }"
              @click="node.kind !== 'folder' && selectFile(node.path)"
            >
              <span>{{ node.label }}</span>
              <em>{{ node.kind }}</em>
            </button>
          </div>
        </section>

        <section class="resource-text">
          <h4>{{ selectedFilePath || '资源内容' }}</h4>
          <pre>{{ selectedFileText }}</pre>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import './SkillInspector.css'
import { useSkillInspector } from './useSkillInspector'

const {
  deleteInspectedSkill,
  errorMessage,
  fileNodes,
  importDirectory,
  inspectSkill,
  inspectedSkill,
  inspectedSkillName,
  resetExampleSkills,
  selectFile,
  selectedFilePath,
  selectedFileText,
  skills,
} = useSkillInspector()
<\/script>
`,D=`<template>
  <div class="skill-chat-demo">
    <aside class="skill-sidebar">
      <div class="sidebar-section">
        <h3>Skills</h3>
        <p class="sidebar-hint">勾选后发送消息，示例会将 skillPlugin 生成的技能指令注入请求。</p>
        <div class="skill-options">
          <label v-for="skill in allSkills" :key="skill.name" class="skill-option">
            <input v-model="selectedSkillNames" type="checkbox" :value="skill.name" />
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
import { getSkillRequestContext, skillPlugin, toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'
import type { SkillDefinition } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'
import './VueSkillPlugin.css'

const allSkills: SkillDefinition[] = [
  {
    name: 'weather',
    description: '回答天气、温度、降雨和预报相关问题。',
    instructions: 'Use weather references when the user asks about weather. Keep the answer concise.',
    resources: [
      {
        path: 'references/weather-format.md',
        kind: 'text',
        resourceId: 'references/weather-format.md',
        text: 'Return current condition first, then one short forecast point.',
        mimeType: 'text/markdown',
      },
    ],
  },
  {
    name: 'vue-best-practices',
    description: '回答 Vue 组合式 API、响应式和组件拆分问题。',
    instructions: 'Prefer Vue Composition API and keep reactive state close to the feature that owns it.',
  },
]

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}

const inputMessage = ref('')
const selectedSkillNames = ref(['weather'])
const systemMessageContent = ref('发送一次消息后查看注入结果。')
const toolNamesList = ref('[]')

const responseProvider = async (requestBody: MessageRequestBody): Promise<ChatCompletion> => {
  const sysMsg = requestBody.messages.find((m) => m.role === 'system')
  const toolNames =
    requestBody.tools?.map((t: { function?: { name?: string } }) => t.function?.name).filter(Boolean) ?? []
  const parts: string[] = []

  systemMessageContent.value =
    typeof sysMsg?.content === 'string' ? sysMsg.content : '当前请求没有 skill instructions。'
  toolNamesList.value = JSON.stringify(toolNames, null, 2)

  if (typeof sysMsg?.content === 'string') {
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
    toolPlugin({
      getTools: async () => [],
      callTool: async () => 'fallback',
    }),
    skillPlugin({
      mode: 'manual',
      skillNames: selectedSkillNames,
      getSkillByName: async (name) => allSkills.find((skill) => skill.name === name),
      onBeforeRequest: (context) => {
        const instructions = getSkillRequestContext(context)?.instructions ?? []

        if (instructions.length > 0) {
          context.requestBody.messages.unshift({
            role: 'system',
            content: instructions.join('\\n\\n'),
          })
        }
      },
    }),
  ],
})

function handleSubmit(content: string) {
  if (!content?.trim() || isProcessing.value) return
  sendMessage(content.trim())
  inputMessage.value = ''
}
<\/script>
`,x=JSON.parse('{"title":"Skill 技能接入","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"tools/skill.md","filePath":"tools/skill.md"}'),b={name:"tools/skill.md"},w=Object.assign(b,{setup(f){const l=C();r(async()=>{l.value=(await d(async()=>{const{default:e}=await import("./chunks/SkillInspector.BLMB6W93.js");return{default:e}},__vite__mapDeps([0,1,2]))).default});const a=m(!0),p=C();return r(async()=>{p.value=(await d(async()=>{const{default:e}=await import("./chunks/VueSkillPlugin.CdJN0ZAZ.js");return{default:e}},__vite__mapDeps([3,1,4,2]))).default}),(e,s)=>{const h=F("ClientOnly");return u(),B("div",null,[s[2]||(s[2]=k("",27)),o(i(n(g),null,null,512),[[E,a.value]]),i(h,null,{default:t(()=>[i(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22VueSkillPlugin.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FVueSkillPlugin.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22skill-chat-demo%5C%22%3E%5Cn%20%20%20%20%3Caside%20class%3D%5C%22skill-sidebar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22sidebar-section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ch3%3ESkills%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22sidebar-hint%5C%22%3E%E5%8B%BE%E9%80%89%E5%90%8E%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%EF%BC%8C%E7%A4%BA%E4%BE%8B%E4%BC%9A%E5%B0%86%20skillPlugin%20%E7%94%9F%E6%88%90%E7%9A%84%E6%8A%80%E8%83%BD%E6%8C%87%E4%BB%A4%E6%B3%A8%E5%85%A5%E8%AF%B7%E6%B1%82%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22skill-options%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Clabel%20v-for%3D%5C%22skill%20in%20allSkills%5C%22%20%3Akey%3D%5C%22skill.name%5C%22%20class%3D%5C%22skill-option%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22selectedSkillNames%5C%22%20type%3D%5C%22checkbox%5C%22%20%3Avalue%3D%5C%22skill.name%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20skill.name%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Csmall%3E%7B%7B%20skill.description%20%7D%7D%3C%2Fsmall%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22sidebar-section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ch3%3E%E8%AF%B7%E6%B1%82%E8%AF%A6%E6%83%85%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22selected-summary%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cspan%3E%E9%80%89%E4%B8%AD%20skills%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cstrong%20v-for%3D%5C%22skillName%20in%20selectedSkillNames%5C%22%20%3Akey%3D%5C%22skillName%5C%22%3E%7B%7B%20skillName%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cem%20v-if%3D%5C%22selectedSkillNames.length%20%3D%3D%3D%200%5C%22%3ENone%3C%2Fem%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3Ch4%20class%3D%5C%22subsection-title%5C%22%3ESystem%20message%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%20%20%3Cpre%20class%3D%5C%22sidebar-pre%5C%22%3E%7B%7B%20systemMessageContent%20%7D%7D%3C%2Fpre%3E%5Cn%20%20%20%20%20%20%20%20%3Ch4%20class%3D%5C%22subsection-title%5C%22%3ERuntime%20tools%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%20%20%3Cpre%20class%3D%5C%22sidebar-pre%5C%22%3E%7B%7B%20toolNamesList%20%7D%7D%3C%2Fpre%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Faside%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-area%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%20%3Aauto-scroll%3D%5C%22true%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20type%20%7B%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20getSkillRequestContext%2C%20skillPlugin%2C%20toolPlugin%2C%20useMessage%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20type%20%7B%20SkillDefinition%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20'.%2FVueSkillPlugin.css'%5Cn%5Cnconst%20allSkills%3A%20SkillDefinition%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20name%3A%20'weather'%2C%5Cn%20%20%20%20description%3A%20'%E5%9B%9E%E7%AD%94%E5%A4%A9%E6%B0%94%E3%80%81%E6%B8%A9%E5%BA%A6%E3%80%81%E9%99%8D%E9%9B%A8%E5%92%8C%E9%A2%84%E6%8A%A5%E7%9B%B8%E5%85%B3%E9%97%AE%E9%A2%98%E3%80%82'%2C%5Cn%20%20%20%20instructions%3A%20'Use%20weather%20references%20when%20the%20user%20asks%20about%20weather.%20Keep%20the%20answer%20concise.'%2C%5Cn%20%20%20%20resources%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20path%3A%20'references%2Fweather-format.md'%2C%5Cn%20%20%20%20%20%20%20%20kind%3A%20'text'%2C%5Cn%20%20%20%20%20%20%20%20resourceId%3A%20'references%2Fweather-format.md'%2C%5Cn%20%20%20%20%20%20%20%20text%3A%20'Return%20current%20condition%20first%2C%20then%20one%20short%20forecast%20point.'%2C%5Cn%20%20%20%20%20%20%20%20mimeType%3A%20'text%2Fmarkdown'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20name%3A%20'vue-best-practices'%2C%5Cn%20%20%20%20description%3A%20'%E5%9B%9E%E7%AD%94%20Vue%20%E7%BB%84%E5%90%88%E5%BC%8F%20API%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E5%92%8C%E7%BB%84%E4%BB%B6%E6%8B%86%E5%88%86%E9%97%AE%E9%A2%98%E3%80%82'%2C%5Cn%20%20%20%20instructions%3A%20'Prefer%20Vue%20Composition%20API%20and%20keep%20reactive%20state%20close%20to%20the%20feature%20that%20owns%20it.'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cnconst%20selectedSkillNames%20%3D%20ref(%5B'weather'%5D)%5Cnconst%20systemMessageContent%20%3D%20ref('%E5%8F%91%E9%80%81%E4%B8%80%E6%AC%A1%E6%B6%88%E6%81%AF%E5%90%8E%E6%9F%A5%E7%9C%8B%E6%B3%A8%E5%85%A5%E7%BB%93%E6%9E%9C%E3%80%82')%5Cnconst%20toolNamesList%20%3D%20ref('%5B%5D')%5Cn%5Cnconst%20responseProvider%20%3D%20async%20(requestBody%3A%20MessageRequestBody)%3A%20Promise%3CChatCompletion%3E%20%3D%3E%20%7B%5Cn%20%20const%20sysMsg%20%3D%20requestBody.messages.find((m)%20%3D%3E%20m.role%20%3D%3D%3D%20'system')%5Cn%20%20const%20toolNames%20%3D%5Cn%20%20%20%20requestBody.tools%3F.map((t%3A%20%7B%20function%3F%3A%20%7B%20name%3F%3A%20string%20%7D%20%7D)%20%3D%3E%20t.function%3F.name).filter(Boolean)%20%3F%3F%20%5B%5D%5Cn%20%20const%20parts%3A%20string%5B%5D%20%3D%20%5B%5D%5Cn%5Cn%20%20systemMessageContent.value%20%3D%5Cn%20%20%20%20typeof%20sysMsg%3F.content%20%3D%3D%3D%20'string'%20%3F%20sysMsg.content%20%3A%20'%E5%BD%93%E5%89%8D%E8%AF%B7%E6%B1%82%E6%B2%A1%E6%9C%89%20skill%20instructions%E3%80%82'%5Cn%20%20toolNamesList.value%20%3D%20JSON.stringify(toolNames%2C%20null%2C%202)%5Cn%5Cn%20%20if%20(typeof%20sysMsg%3F.content%20%3D%3D%3D%20'string')%20%7B%5Cn%20%20%20%20const%20skills%20%3D%20sysMsg.content.match(%2F%23%23%5C%5Cs%2B(%5C%5CS%2B)%2Fg)%3F.map((s)%20%3D%3E%20s.replace(%2F%5E%23%23%5C%5Cs%2B%2F%2C%20''))%20%3F%3F%20%5B%5D%5Cn%20%20%20%20parts.push(%60%F0%9F%93%84%20%E8%AF%86%E5%88%AB%E5%88%B0%20%24%7Bskills.length%7D%20%E4%B8%AA%E6%8A%80%E8%83%BD%EF%BC%9A%24%7Bskills.join('%E3%80%81')%20%7C%7C%20'%E6%97%A0'%7D%60)%5Cn%20%20%7D%5Cn%5Cn%20%20if%20(toolNames.length)%20%7B%5Cn%20%20%20%20parts.push(%60%F0%9F%9B%A0%EF%B8%8F%20%24%7BtoolNames.length%7D%20%E4%B8%AA%E5%B7%A5%E5%85%B7%EF%BC%9A%24%7BtoolNames.join('%E3%80%81')%7D%60)%5Cn%20%20%7D%5Cn%5Cn%20%20parts.push('%E8%AF%B7%E6%B1%82%E5%B7%B2%E6%8D%95%E8%8E%B7%EF%BC%8C%E8%AF%A6%E6%83%85%E8%A7%81%E5%8F%B3%E4%BE%A7%E9%9D%A2%E6%9D%BF%E3%80%82')%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20id%3A%20'skill-plugin-demo'%2C%5Cn%20%20%20%20object%3A%20'chat.completion'%2C%5Cn%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20message%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20parts.join('%5C%5Cn%5C%5Cn')%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20delta%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20finish_reason%3A%20'stop'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20%7B%20isProcessing%2C%20messages%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessage(%7B%5Cn%20%20responseProvider%2C%5Cn%20%20plugins%3A%20%5B%5Cn%20%20%20%20toolPlugin(%7B%5Cn%20%20%20%20%20%20getTools%3A%20async%20()%20%3D%3E%20%5B%5D%2C%5Cn%20%20%20%20%20%20callTool%3A%20async%20()%20%3D%3E%20'fallback'%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20%20%20skillPlugin(%7B%5Cn%20%20%20%20%20%20mode%3A%20'manual'%2C%5Cn%20%20%20%20%20%20skillNames%3A%20selectedSkillNames%2C%5Cn%20%20%20%20%20%20getSkillByName%3A%20async%20(name)%20%3D%3E%20allSkills.find((skill)%20%3D%3E%20skill.name%20%3D%3D%3D%20name)%2C%5Cn%20%20%20%20%20%20onBeforeRequest%3A%20(context)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20const%20instructions%20%3D%20getSkillRequestContext(context)%3F.instructions%20%3F%3F%20%5B%5D%5Cn%5Cn%20%20%20%20%20%20%20%20if%20(instructions.length%20%3E%200)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20context.requestBody.messages.unshift(%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20role%3A%20'system'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20content%3A%20instructions.join('%5C%5Cn%5C%5Cn')%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20%5D%2C%5Cn%7D)%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20if%20(!content%3F.trim()%20%7C%7C%20isProcessing.value)%20return%5Cn%20%20sendMessage(content.trim())%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22VueSkillPlugin.css%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FVueSkillPlugin.css%22%2C%22code%22%3A%22.skill-chat-demo%20%7B%5Cn%20%20container-type%3A%20inline-size%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.chat-area%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20min-height%3A%20400px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.chat-area%20%3E%20%3Afirst-child%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20max-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-sidebar%20%7B%5Cn%20%20border%3A%201px%20solid%20color-mix(in%20srgb%2C%20var(--tr-text-primary)%208%25%2C%20transparent)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default)%3B%5Cn%20%20padding%3A%2014px%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%201fr%201fr%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.sidebar-section%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.sidebar-section%20h3%20%7B%5Cn%20%20font-size%3A%2014px%3B%5Cn%20%20margin%3A%200%200%204px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.sidebar-hint%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%201.5%3B%5Cn%20%20margin%3A%200%200%2010px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-options%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%206px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-option%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20padding%3A%208px%3B%5Cn%20%20border%3A%201px%20solid%20color-mix(in%20srgb%2C%20var(--tr-text-primary)%208%25%2C%20transparent)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-option%20input%20%7B%5Cn%20%20flex%3A%20none%3B%5Cn%20%20margin-top%3A%202px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-option%20strong%2C%5Cn.skill-chat-demo%20.skill-option%20small%20%7B%5Cn%20%20display%3A%20block%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-option%20strong%20%7B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.skill-option%20small%20%7B%5Cn%20%20margin-top%3A%202px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20line-height%3A%201.4%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.selected-summary%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%204px%3B%5Cn%20%20margin-bottom%3A%2010px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.selected-summary%20span%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.selected-summary%20strong%20%7B%5Cn%20%20border-radius%3A%20999px%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default-2)%3B%5Cn%20%20color%3A%20var(--tr-color-primary)%3B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20line-height%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.selected-summary%20em%20%7B%5Cn%20%20color%3A%20var(--tr-text-tertiary)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20font-style%3A%20normal%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.subsection-title%20%7B%5Cn%20%20margin%3A%200%200%204px%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.sidebar-pre%20%7B%5Cn%20%20margin%3A%200%200%2010px%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default-2)%3B%5Cn%20%20padding%3A%208px%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20line-height%3A%201.5%3B%5Cn%20%20min-height%3A%2060px%3B%5Cn%20%20max-height%3A%20150px%3B%5Cn%7D%5Cn%5Cn.skill-chat-demo%20.sidebar-pre%3Alast-child%20%7B%5Cn%20%20margin-bottom%3A%200%3B%5Cn%7D%5Cn%5Cn%40container%20(max-width%3A%20640px)%20%7B%5Cn%20%20.skill-chat-demo%20.skill-sidebar%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{a.value=!1}),vueCode:n(D)},c({_:2},[p.value?{name:"vue",fn:t(()=>[i(n(p))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[3]||(s[3]=k("",52)),o(i(n(g),null,null,512),[[E,a.value]]),i(h,null,{default:t(()=>[i(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22SkillInspector.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FSkillInspector.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22skill-inspector%5C%22%3E%5Cn%20%20%20%20%3Csection%20class%3D%5C%22panel%20storage-panel%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22panel-heading%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ch3%3EStorage%20%E7%AE%A1%E7%90%86%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cp%3E%E6%BC%94%E7%A4%BA%20add%E3%80%81get%E3%80%81list%E3%80%81delete%EF%BC%8C%E4%BB%A5%E5%8F%8A%E4%BB%8E%E6%9C%AC%E5%9C%B0%E7%9B%AE%E5%BD%95%E5%AF%BC%E5%85%A5%E5%90%8E%E5%86%99%E5%85%A5%20storage%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20class%3D%5C%22primary-action%5C%22%20%40click%3D%5C%22resetExampleSkills%5C%22%3E%E9%87%8D%E7%BD%AE%E7%A4%BA%E4%BE%8B%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22action-row%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Clabel%20class%3D%5C%22directory-picker%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%20type%3D%5C%22file%5C%22%20webkitdirectory%20directory%20multiple%20%40change%3D%5C%22importDirectory%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cspan%3E%E5%AF%BC%E5%85%A5%E6%9C%AC%E5%9C%B0%20skill%20%E7%9B%AE%E5%BD%95%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20class%3D%5C%22danger-action%5C%22%20%3Adisabled%3D%5C%22!inspectedSkill%5C%22%20%40click%3D%5C%22deleteInspectedSkill%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E5%88%A0%E9%99%A4%E5%BD%93%E5%89%8D%5Cn%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Cp%20v-if%3D%5C%22errorMessage%5C%22%20class%3D%5C%22error-message%5C%22%3E%7B%7B%20errorMessage%20%7D%7D%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22skill-list%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22skill%20in%20skills%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22skill.name%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20class%3D%5C%22skill-item%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20active%3A%20inspectedSkillName%20%3D%3D%3D%20skill.name%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20role%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20tabindex%3D%5C%220%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22inspectSkill(skill.name)%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40keydown.enter.prevent%3D%5C%22inspectSkill(skill.name)%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40keydown.space.prevent%3D%5C%22inspectSkill(skill.name)%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20skill.name%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Csmall%3E%7B%7B%20skill.description%20%7D%7D%3C%2Fsmall%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cem%3E%7B%7B%20skill.resources%3F.length%20%3F%3F%200%20%7D%7D%20files%3C%2Fem%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fsection%3E%5Cn%5Cn%20%20%20%20%3Csection%20class%3D%5C%22panel%20detail-panel%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22storage-viewer%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Csection%20class%3D%5C%22file-tree%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ch4%3E%E7%9B%AE%E5%BD%95%E7%BB%93%E6%9E%84%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22file-node-list%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22node%20in%20fileNodes%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22node.path%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22file-node%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20active%3A%20selectedFilePath%20%3D%3D%3D%20node.path%2C%20folder%3A%20node.kind%20%3D%3D%3D%20'folder'%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Astyle%3D%5C%22%7B%20paddingLeft%3A%20%60%24%7B10%20%2B%20node.depth%20*%2014%7Dpx%60%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22node.kind%20!%3D%3D%20'folder'%20%26%26%20selectFile(node.path)%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%3E%7B%7B%20node.label%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cem%3E%7B%7B%20node.kind%20%7D%7D%3C%2Fem%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3Csection%20class%3D%5C%22resource-text%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ch4%3E%7B%7B%20selectedFilePath%20%7C%7C%20'%E8%B5%84%E6%BA%90%E5%86%85%E5%AE%B9'%20%7D%7D%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cpre%3E%7B%7B%20selectedFileText%20%7D%7D%3C%2Fpre%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20'.%2FSkillInspector.css'%5Cnimport%20%7B%20useSkillInspector%20%7D%20from%20'.%2FuseSkillInspector'%5Cn%5Cnconst%20%7B%5Cn%20%20deleteInspectedSkill%2C%5Cn%20%20errorMessage%2C%5Cn%20%20fileNodes%2C%5Cn%20%20importDirectory%2C%5Cn%20%20inspectSkill%2C%5Cn%20%20inspectedSkill%2C%5Cn%20%20inspectedSkillName%2C%5Cn%20%20resetExampleSkills%2C%5Cn%20%20selectFile%2C%5Cn%20%20selectedFilePath%2C%5Cn%20%20selectedFileText%2C%5Cn%20%20skills%2C%5Cn%7D%20%3D%20useSkillInspector()%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22useSkillInspector.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FuseSkillInspector.ts%22%2C%22code%22%3A%22import%20%7B%20createMemorySkillStorage%2C%20loadSkill%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20type%20%7B%20SkillDefinition%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20computed%2C%20ref%2C%20watch%20%7D%20from%20'vue'%5Cnimport%20%7B%20exampleSkills%20%7D%20from%20'.%2FexampleSkillFiles'%5Cn%5Cntype%20SkillFileNode%20%3D%20%7B%5Cn%20%20path%3A%20string%5Cn%20%20label%3A%20string%5Cn%20%20kind%3A%20'entry'%20%7C%20'folder'%20%7C%20'text'%20%7C%20'binary'%5Cn%20%20depth%3A%20number%5Cn%7D%5Cn%5Cnexport%20const%20useSkillInspector%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20const%20storage%20%3D%20createMemorySkillStorage()%5Cn%20%20const%20skills%20%3D%20ref%3CSkillDefinition%5B%5D%3E(%5B%5D)%5Cn%20%20const%20inspectedSkillName%20%3D%20ref('')%5Cn%20%20const%20selectedFilePath%20%3D%20ref('SKILL.md')%5Cn%20%20const%20selectedFileText%20%3D%20ref('')%5Cn%20%20const%20errorMessage%20%3D%20ref('')%5Cn%5Cn%20%20const%20syncStorageState%20%3D%20async%20()%20%3D%3E%20%7B%5Cn%20%20%20%20const%20summaries%20%3D%20await%20storage.list()%5Cn%20%20%20%20const%20loadedSkills%20%3D%20await%20Promise.all(summaries.map((summary)%20%3D%3E%20storage.get(summary.name)))%5Cn%20%20%20%20skills.value%20%3D%20loadedSkills.filter((skill)%3A%20skill%20is%20SkillDefinition%20%3D%3E%20Boolean(skill))%5Cn%5Cn%20%20%20%20if%20(!skills.value.some((skill)%20%3D%3E%20skill.name%20%3D%3D%3D%20inspectedSkillName.value))%20%7B%5Cn%20%20%20%20%20%20inspectedSkillName.value%20%3D%20skills.value%5B0%5D%3F.name%20%3F%3F%20''%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20if%20(!fileNodes.value.some((node)%20%3D%3E%20node.path%20%3D%3D%3D%20selectedFilePath.value))%20%7B%5Cn%20%20%20%20%20%20selectedFilePath.value%20%3D%20'SKILL.md'%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20const%20runStorageAction%20%3D%20async%20(action%3A%20()%20%3D%3E%20Promise%3Cvoid%3E)%20%3D%3E%20%7B%5Cn%20%20%20%20errorMessage.value%20%3D%20''%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20await%20action()%5Cn%20%20%20%20%20%20await%20syncStorageState()%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20errorMessage.value%20%3D%20error%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20const%20resetExampleSkills%20%3D%20async%20()%20%3D%3E%20%7B%5Cn%20%20%20%20await%20runStorageAction(async%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20for%20(const%20skill%20of%20skills.value)%20%7B%5Cn%20%20%20%20%20%20%20%20await%20storage.delete(skill.name)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20for%20(const%20skill%20of%20exampleSkills)%20%7B%5Cn%20%20%20%20%20%20%20%20await%20storage.add(skill)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20inspectedSkillName.value%20%3D%20exampleSkills%5B0%5D%3F.name%20%3F%3F%20''%5Cn%20%20%20%20%7D)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20deleteInspectedSkill%20%3D%20async%20()%20%3D%3E%20%7B%5Cn%20%20%20%20const%20name%20%3D%20inspectedSkillName.value%5Cn%20%20%20%20if%20(!name)%20%7B%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20await%20runStorageAction(async%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20await%20storage.delete(name)%5Cn%20%20%20%20%7D)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20importDirectory%20%3D%20async%20(event%3A%20Event)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20input%20%3D%20event.target%20as%20HTMLInputElement%5Cn%20%20%20%20if%20(!input.files%3F.length)%20%7B%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20await%20runStorageAction(async%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20skill%20%3D%20await%20loadSkill(%7B%5Cn%20%20%20%20%20%20%20%20source%3A%20'browser'%2C%5Cn%20%20%20%20%20%20%20%20fileList%3A%20input.files%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20await%20storage.add(skill)%5Cn%20%20%20%20%20%20inspectedSkillName.value%20%3D%20skill.name%5Cn%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20input.value%20%3D%20''%5Cn%20%20%7D%5Cn%5Cn%20%20const%20inspectSkill%20%3D%20async%20(skillName%3A%20string)%20%3D%3E%20%7B%5Cn%20%20%20%20await%20runStorageAction(async%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20skill%20%3D%20await%20storage.get(skillName)%5Cn%20%20%20%20%20%20inspectedSkillName.value%20%3D%20skill%3F.name%20%3F%3F%20''%5Cn%20%20%20%20%20%20selectedFilePath.value%20%3D%20'SKILL.md'%5Cn%20%20%20%20%7D)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20selectFile%20%3D%20(path%3A%20string)%20%3D%3E%20%7B%5Cn%20%20%20%20selectedFilePath.value%20%3D%20path%5Cn%20%20%7D%5Cn%5Cn%20%20const%20inspectedSkill%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20%20%20return%20skills.value.find((skill)%20%3D%3E%20skill.name%20%3D%3D%3D%20inspectedSkillName.value)%5Cn%20%20%7D)%5Cn%5Cn%20%20const%20fileNodes%20%3D%20computed%3CSkillFileNode%5B%5D%3E(()%20%3D%3E%20%7B%5Cn%20%20%20%20const%20skill%20%3D%20inspectedSkill.value%5Cn%20%20%20%20if%20(!skill)%20%7B%5Cn%20%20%20%20%20%20return%20%5B%5D%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20const%20nodes%3A%20SkillFileNode%5B%5D%20%3D%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20path%3A%20'SKILL.md'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'SKILL.md'%2C%5Cn%20%20%20%20%20%20%20%20kind%3A%20'entry'%2C%5Cn%20%20%20%20%20%20%20%20depth%3A%200%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%5Cn%20%20%20%20const%20folderPaths%20%3D%20new%20Set%3Cstring%3E()%5Cn%5Cn%20%20%20%20for%20(const%20resource%20of%20skill.resources%20%3F%3F%20%5B%5D)%20%7B%5Cn%20%20%20%20%20%20const%20parts%20%3D%20resource.path.split('%2F').filter(Boolean)%5Cn%5Cn%20%20%20%20%20%20for%20(let%20index%20%3D%200%3B%20index%20%3C%20parts.length%20-%201%3B%20index%20%2B%3D%201)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20folderPath%20%3D%20parts.slice(0%2C%20index%20%2B%201).join('%2F')%5Cn%20%20%20%20%20%20%20%20if%20(folderPaths.has(folderPath))%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20continue%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20folderPaths.add(folderPath)%5Cn%20%20%20%20%20%20%20%20nodes.push(%7B%5Cn%20%20%20%20%20%20%20%20%20%20path%3A%20folderPath%2C%5Cn%20%20%20%20%20%20%20%20%20%20label%3A%20parts%5Bindex%5D%2C%5Cn%20%20%20%20%20%20%20%20%20%20kind%3A%20'folder'%2C%5Cn%20%20%20%20%20%20%20%20%20%20depth%3A%20index%2C%5Cn%20%20%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20nodes.push(%7B%5Cn%20%20%20%20%20%20%20%20path%3A%20resource.path%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20parts.at(-1)%20%7C%7C%20resource.path%2C%5Cn%20%20%20%20%20%20%20%20kind%3A%20resource.kind%2C%5Cn%20%20%20%20%20%20%20%20depth%3A%20Math.max(0%2C%20parts.length%20-%201)%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20return%20nodes%5Cn%20%20%7D)%5Cn%5Cn%20%20const%20loadSelectedFileText%20%3D%20async%20()%20%3D%3E%20%7B%5Cn%20%20%20%20const%20skill%20%3D%20inspectedSkill.value%5Cn%20%20%20%20if%20(!skill)%20%7B%5Cn%20%20%20%20%20%20selectedFileText.value%20%3D%20''%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20if%20(selectedFilePath.value%20%3D%3D%3D%20'SKILL.md')%20%7B%5Cn%20%20%20%20%20%20selectedFileText.value%20%3D%20skill.instructions%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20const%20resource%20%3D%20skill.resources%3F.find((item)%20%3D%3E%20item.path%20%3D%3D%3D%20selectedFilePath.value)%5Cn%20%20%20%20if%20(!resource)%20%7B%5Cn%20%20%20%20%20%20selectedFileText.value%20%3D%20''%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20if%20(resource.kind%20%3D%3D%3D%20'binary')%20%7B%5Cn%20%20%20%20%20%20selectedFileText.value%20%3D%20%60Binary%20resource%3A%20%24%7Bresource.path%7D%60%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20selectedFileText.value%20%3D%20resource.text%20%3F%3F%20(resource.readText%20%3F%20await%20resource.readText()%20%3A%20'')%5Cn%20%20%7D%5Cn%5Cn%20%20watch(%5Cn%20%20%20%20%5BinspectedSkill%2C%20selectedFilePath%5D%2C%5Cn%20%20%20%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20void%20loadSelectedFileText()%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20%7B%20immediate%3A%20true%20%7D%2C%5Cn%20%20)%5Cn%5Cn%20%20void%20resetExampleSkills()%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20deleteInspectedSkill%2C%5Cn%20%20%20%20errorMessage%2C%5Cn%20%20%20%20importDirectory%2C%5Cn%20%20%20%20inspectSkill%2C%5Cn%20%20%20%20inspectedSkill%2C%5Cn%20%20%20%20inspectedSkillName%2C%5Cn%20%20%20%20fileNodes%2C%5Cn%20%20%20%20resetExampleSkills%2C%5Cn%20%20%20%20selectFile%2C%5Cn%20%20%20%20selectedFilePath%2C%5Cn%20%20%20%20selectedFileText%2C%5Cn%20%20%20%20skills%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%2C%22exampleSkillFiles.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FexampleSkillFiles.ts%22%2C%22code%22%3A%22import%20type%20%7B%20SkillDefinition%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cnexport%20const%20exampleSkills%3A%20SkillDefinition%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20name%3A%20'weather'%2C%5Cn%20%20%20%20description%3A%20'Answer%20weather%20questions%20with%20concise%20current%20conditions%20and%20forecast%20guidance.'%2C%5Cn%20%20%20%20instructions%3A%20%60%23%20Weather%20Skill%5Cn%5CnUse%20this%20skill%20when%20the%20user%20asks%20about%20weather%2C%20temperature%2C%20rain%2C%20wind%2C%20or%20forecast.%5CnAlways%20mention%20the%20target%20location%20and%20keep%20the%20answer%20concise.%60%2C%5Cn%20%20%20%20resources%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20path%3A%20'references%2Fweather-format.md'%2C%5Cn%20%20%20%20%20%20%20%20kind%3A%20'text'%2C%5Cn%20%20%20%20%20%20%20%20resourceId%3A%20'references%2Fweather-format.md'%2C%5Cn%20%20%20%20%20%20%20%20text%3A%20'Return%20current%20condition%20first%2C%20then%20list%20the%20next%20forecast%20point%20when%20available.'%2C%5Cn%20%20%20%20%20%20%20%20mimeType%3A%20'text%2Fmarkdown'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20path%3A%20'references%2Fexamples%2Fcurrent-weather.md'%2C%5Cn%20%20%20%20%20%20%20%20kind%3A%20'text'%2C%5Cn%20%20%20%20%20%20%20%20resourceId%3A%20'references%2Fexamples%2Fcurrent-weather.md'%2C%5Cn%20%20%20%20%20%20%20%20text%3A%20'Example%3A%20Shanghai%20is%20cloudy%2C%2024%C2%B0C.%20Light%20rain%20is%20possible%20tonight.'%2C%5Cn%20%20%20%20%20%20%20%20mimeType%3A%20'text%2Fmarkdown'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%2C%22SkillInspector.css%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fskill%2FSkillInspector.css%22%2C%22code%22%3A%22.skill-inspector%20%7B%5Cn%20%20container-type%3A%20inline-size%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20minmax(220px%2C%20340px)%20minmax(0%2C%201fr)%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.panel%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20border%3A%201px%20solid%20color-mix(in%20srgb%2C%20var(--tr-text-primary)%208%25%2C%20transparent)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default)%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.panel-heading%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20margin-bottom%3A%2014px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.panel-heading%20%3E%20div%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.panel-heading%20h3%20%7B%5Cn%20%20margin%3A%200%200%204px%3B%5Cn%20%20font-size%3A%2016px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.panel-heading%20p%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.action-row%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20minmax(0%2C%201fr)%20minmax(72px%2C%20auto)%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20button%2C%5Cn.skill-inspector%20.directory-picker%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20min-height%3A%2036px%3B%5Cn%20%20border%3A%201px%20solid%20color-mix(in%20srgb%2C%20var(--tr-text-primary)%208%25%2C%20transparent)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default-2)%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.3%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%20%20white-space%3A%20normal%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20button%3Adisabled%20%7B%5Cn%20%20cursor%3A%20not-allowed%3B%5Cn%20%20opacity%3A%200.45%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.primary-action%20%7B%5Cn%20%20flex%3A%20none%3B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.danger-action%20%7B%5Cn%20%20padding%3A%200%2010px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.primary-action%3Ahover%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary)%3B%5Cn%20%20color%3A%20var(--tr-color-primary)%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.danger-action%3Ahover%3Anot(%3Adisabled)%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-error)%3B%5Cn%20%20color%3A%20var(--tr-color-error)%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.directory-picker%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20padding%3A%200%2010px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20text-align%3A%20center%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.directory-picker%20span%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.directory-picker%20input%20%7B%5Cn%20%20display%3A%20none%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.error-message%20%7B%5Cn%20%20margin%3A%2010px%200%200%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.5%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%20%20color%3A%20var(--tr-color-error)%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-list%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20margin-top%3A%2014px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-item%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20gap%3A%2010px%3B%5Cn%20%20padding%3A%2010px%3B%5Cn%20%20border%3A%201px%20solid%20color-mix(in%20srgb%2C%20var(--tr-text-primary)%208%25%2C%20transparent)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-item%20%3E%20span%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-item.active%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary)%3B%5Cn%20%20box-shadow%3A%200%200%200%201px%20var(--tr-color-primary)%20inset%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default-2)%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-item%20strong%2C%5Cn.skill-inspector%20.skill-item%20small%20%7B%5Cn%20%20display%3A%20block%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-item%20small%20%7B%5Cn%20%20margin-top%3A%204px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20line-height%3A%201.5%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.skill-item%20em%20%7B%5Cn%20%20flex%3A%20none%3B%5Cn%20%20color%3A%20var(--tr-text-tertiary)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20font-style%3A%20normal%3B%5Cn%20%20line-height%3A%2020px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.detail-panel%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.storage-viewer%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-rows%3A%20minmax(120px%2C%20auto)%20minmax(220px%2C%201fr)%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.storage-viewer%20h4%20%7B%5Cn%20%20margin%3A%200%200%208px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.file-tree%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.file-node-list%20%7B%5Cn%20%20max-height%3A%20240px%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20padding-right%3A%204px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.file-node%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20min-height%3A%2026px%3B%5Cn%20%20margin-top%3A%203px%3B%5Cn%20%20padding-right%3A%208px%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20text-align%3A%20left%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.file-node.active%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary)%3B%5Cn%20%20color%3A%20var(--tr-color-primary)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default-2)%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.file-node.folder%20%7B%5Cn%20%20cursor%3A%20default%3B%5Cn%20%20border-color%3A%20transparent%3B%5Cn%20%20background%3A%20transparent%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-weight%3A%20600%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.file-node.folder%3Ahover%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.file-node%20span%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.file-node%20em%20%7B%5Cn%20%20flex%3A%20none%3B%5Cn%20%20color%3A%20var(--tr-text-tertiary)%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20font-style%3A%20normal%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.resource-text%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20.resource-text%20pre%20%7B%5Cn%20%20white-space%3A%20pre-wrap%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.skill-inspector%20pre%20%7B%5Cn%20%20min-height%3A%20260px%3B%5Cn%20%20max-height%3A%20420px%3B%5Cn%20%20margin%3A%200%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default-2)%3B%5Cn%20%20padding%3A%2014px%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20768px)%20%7B%5Cn%20%20.skill-inspector%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%5Cn%20%20.skill-inspector%20.panel-heading%20%7B%5Cn%20%20%20%20flex-direction%3A%20column%3B%5Cn%20%20%7D%5Cn%5Cn%20%20.skill-inspector%20.primary-action%20%7B%5Cn%20%20%20%20width%3A%20100%25%3B%5Cn%20%20%7D%5Cn%5Cn%20%20.skill-inspector%20.action-row%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%40container%20(max-width%3A%20760px)%20%7B%5Cn%20%20.skill-inspector%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{a.value=!1}),vueCode:n(A)},c({_:2},[l.value?{name:"vue",fn:t(()=>[i(n(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[4]||(s[4]=k("",34))])}}});export{x as __pageData,w as default};

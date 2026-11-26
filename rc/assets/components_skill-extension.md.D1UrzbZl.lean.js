const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/editing.ZjP3Vcr7.js","assets/chunks/index._E8rXUUF.js","assets/chunks/framework.V2e55FFV.js","assets/chunks/theme.BG3R3r23.js","assets/chunks/basic.B9I88xX8.js","assets/chunks/resolver-states.Ch7uMIzT.js","assets/chunks/github-import.Y4roKumz.js","assets/chunks/archive-import.DmjA4XZi.js","assets/chunks/local-import.Ck5E2vCv.js","assets/chunks/basic.DfO3cfvd.js"])))=>i.map(i=>d[i]);
import{aD as o,bQ as r,aZ as C,aL as B,v as D,H as m,bL as h,bB as p,J as t,bk as e,bJ as n,G as k,w as l,I as c,b7 as u,aU as x}from"./chunks/framework.V2e55FFV.js";import{L as y,N as g}from"./chunks/index.D4H-2xaJ.js";const _=`<script setup lang="ts">
import { ref } from 'vue'
import { createMemorySkillStorage } from '@opentiny/tiny-robot-kit'
import { TrSkillExtensionDetail } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const definition = ref<SkillDefinition>({
  name: 'release-notes',
  description: '整理版本更新内容。',
  instructions: ['# 发布说明', '', '列出本次版本的重要变更。', '', '## 输出格式', '- 新增功能', '- 修复问题'].join(
    '\\n',
  ),
  resources: [
    {
      path: 'references/style.md',
      kind: 'text',
      resourceId: 'references/style.md',
      text: '# 写作规范\\n\\n使用简洁、清晰的语言。',
    },
  ],
  directories: ['references/drafts'],
})

const saveMessage = ref('')
const storage = createMemorySkillStorage()

const handleSave = async (nextDefinition: SkillDefinition) => {
  definition.value = await storage.add(nextDefinition)
  saveMessage.value = '已保存到当前示例状态。'
}

const reload = async () => {
  const restored = await storage.get(definition.value.name)
  if (restored) definition.value = restored
  saveMessage.value = '已从 Storage 重新读取当前 Skill。'
}

void storage.add(definition.value)
<\/script>

<template>
  <div class="skill-editing-demo">
    <p class="skill-editing-demo__hint">
      默认会选中入口文件。可以切换左侧文件、编辑文本内容或管理文件树；保存后会写入示例 Storage。
    </p>
    <button type="button" class="skill-editing-demo__reload" @click="reload">从 Storage 重新读取</button>
    <TrSkillExtensionDetail mode="edit" :definition="definition" @save="handleSave" />
    <p v-if="saveMessage" class="skill-editing-demo__status" role="status">{{ saveMessage }}</p>
  </div>
</template>

<style scoped>
.skill-editing-demo__hint,
.skill-editing-demo__status {
  margin: 0 0 12px;
  color: var(--tr-text-secondary, #595959);
  font-size: 13px;
}

.skill-editing-demo__status {
  margin: 12px 0 0;
}

.skill-editing-demo__reload {
  margin-bottom: 12px;
}
</style>
`,T=`<script setup lang="ts">
import { TrSkillExtensionDetail } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const decodeBase64 = (value: string) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0))

const examplePng = decodeBase64(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
)

const definition: SkillDefinition = {
  name: 'document-summary',
  description: '将长文档整理为摘要。',
  instructions: [
    '# 文档摘要',
    '',
    '先阅读文档，再列出三条要点和待办事项。',
    '',
    '## 输出格式',
    '- 摘要',
    '- 待办事项',
  ].join('\\n'),
  resources: [
    {
      path: 'references/style.md',
      kind: 'text',
      resourceId: 'references/style.md',
      size: 32,
      text: '# 摘要格式',
    },
    {
      path: 'assets/example.png',
      kind: 'binary',
      resourceId: 'assets/example.png',
      mimeType: 'image/png',
      size: examplePng.byteLength,
      binary: examplePng,
    },
  ],
}
<\/script>

<template>
  <tr-skill-extension-detail :definition="definition" updated-at="2026-07-10" />
</template>
`,q=`<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { TrSkillImportForm } from '@opentiny/tiny-robot'
import type { SkillDefinition, SkillResolver } from '@opentiny/tiny-robot'

const exampleUrl = 'https://github.com/opentiny/tiny-robot/tree/main/skills/demo'
const example: SkillDefinition = {
  name: 'demo',
  description: '可重复演示异步解析的 Skill。',
  instructions: '总结输入文档。',
}

const formKey = ref(0)
const pending = ref(false)
const imported = ref<SkillDefinition>()
let resolvePending: ((definition: SkillDefinition) => void) | undefined
let rejectPending: ((error: Error) => void) | undefined

const resolveExample: SkillResolver = () =>
  new Promise((resolve, reject) => {
    pending.value = true
    resolvePending = resolve
    rejectPending = reject
  })

const finishSuccess = () => {
  resolvePending?.(example)
  pending.value = false
  resolvePending = undefined
  rejectPending = undefined
}

const finishError = () => {
  rejectPending?.(new Error('示例解析失败，请重试'))
  pending.value = false
  resolvePending = undefined
  rejectPending = undefined
}

const reset = () => {
  imported.value = undefined
  formKey.value += 1
}

onUnmounted(() => resolvePending?.(example))
<\/script>

<template>
  <section>
    <div class="demo-aux-controls">
      <button type="button" class="demo-aux-control" :disabled="!pending" @click="finishSuccess">让解析成功</button>
      <button type="button" class="demo-aux-control" :disabled="!pending" @click="finishError">让解析失败</button>
      <button type="button" class="demo-aux-control" :disabled="pending" @click="reset">重置示例</button>
    </div>
    <p>
      将示例地址粘贴到 URL 输入框并点击“导入”：<code>{{ exampleUrl }}</code>
    </p>
    <tr-skill-import-form
      :key="formKey"
      source="github"
      :resolve-timeout="0"
      :resolve-skill="resolveExample"
      @submit="imported = $event"
    />
    <p aria-live="polite">应用收到：{{ imported?.name ?? '尚未收到解析结果' }}</p>
  </section>
</template>
`,P=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSkillExtensionDetail, TrSkillImportForm } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const exampleUrl = 'https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling'
const formKey = ref(0)
const imported = ref<SkillDefinition>()

const reset = () => {
  imported.value = undefined
  formKey.value += 1
}
<\/script>

<template>
  <section>
    <div class="demo-aux-controls">
      <button type="button" class="demo-aux-control" @click="reset">重置示例</button>
    </div>
    <p>将这个真实 Skill 的目录地址复制到下方 URL 输入框：</p>
    <p class="example-url">
      <a :href="exampleUrl" target="_blank" rel="noopener noreferrer">{{ exampleUrl }}</a>
    </p>
    <TrSkillImportForm :key="formKey" source="github" @submit="imported = $event" />
    <div v-if="imported" class="imported-result">
      <p role="status">已导入：{{ imported.name }}</p>
      <TrSkillExtensionDetail :definition="imported" />
    </div>
    <p v-else aria-live="polite">尚未导入 Skill。</p>
  </section>
</template>

<style scoped>
.example-url {
  overflow-wrap: anywhere;
}
</style>
`,w=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSkillExtensionDetail, TrSkillImportForm } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const imported = ref<SkillDefinition>()
<\/script>

<template>
  <section>
    <tr-skill-import-form source="archive" @submit="imported = $event" />
    <tr-skill-extension-detail v-if="imported" :definition="imported" />
  </section>
</template>
`,I=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSkillExtensionDetail, TrSkillImportForm } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const formKey = ref(0)
const imported = ref<SkillDefinition>()
const cancelled = ref(false)

const handleSubmit = (definition: SkillDefinition) => {
  imported.value = definition
  cancelled.value = false
}

const reset = () => {
  imported.value = undefined
  cancelled.value = false
  formKey.value += 1
}
<\/script>

<template>
  <section>
    <div class="demo-aux-controls">
      <button type="button" class="demo-aux-control" @click="reset">重置示例</button>
    </div>
    <tr-skill-import-form :key="formKey" source="local" @submit="handleSubmit" @cancel="cancelled = true" />
    <p aria-live="polite">
      {{ imported ? \`应用收到 \${imported.name}\` : cancelled ? '应用收到取消意图' : '请选择包含 SKILL.md 的文件夹' }}
    </p>
    <TrSkillExtensionDetail v-if="imported" :definition="imported" />
  </section>
</template>
`,L=`<script setup lang="ts">
import { TrSkillExtensionDetail } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const definition: SkillDefinition = {
  name: 'example-skill',
  description: '一个不依赖网络的最小 Skill 定义。',
  instructions: '# 使用说明\\n\\n先阅读输入，再输出三条重点。',
  resources: [
    {
      path: 'references/format.md',
      kind: 'text',
      resourceId: 'references/format.md',
      text: '# 输出格式\\n\\n先给结论，再列出依据。',
    },
  ],
}
<\/script>

<template>
  <section>
    <p>这个示例直接传入一个内联的 <code>SkillDefinition</code>，不需要网络或导入器。</p>
    <tr-skill-extension-detail :definition="definition" />
  </section>
</template>
`,G=JSON.parse('{"title":"Skill 扩展导入与详情","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/skill-extension.md","filePath":"components/skill-extension.md"}'),Z={name:"components/skill-extension.md"},V=Object.assign(Z,{setup(W){const E=u();o(async()=>{E.value=(await r(async()=>{const{default:a}=await import("./chunks/editing.ZjP3Vcr7.js");return{default:a}},__vite__mapDeps([0,1,2,3]))).default});const b=u();o(async()=>{b.value=(await r(async()=>{const{default:a}=await import("./chunks/basic.B9I88xX8.js");return{default:a}},__vite__mapDeps([4,3,2]))).default});const F=u();o(async()=>{F.value=(await r(async()=>{const{default:a}=await import("./chunks/resolver-states.Ch7uMIzT.js");return{default:a}},__vite__mapDeps([5,3,2]))).default});const f=u();o(async()=>{f.value=(await r(async()=>{const{default:a}=await import("./chunks/github-import.Y4roKumz.js");return{default:a}},__vite__mapDeps([6,3,2]))).default});const v=u();o(async()=>{v.value=(await r(async()=>{const{default:a}=await import("./chunks/archive-import.DmjA4XZi.js");return{default:a}},__vite__mapDeps([7,3,2]))).default});const S=u();o(async()=>{S.value=(await r(async()=>{const{default:a}=await import("./chunks/local-import.Ck5E2vCv.js");return{default:a}},__vite__mapDeps([8,3,2]))).default});const s=x(!0),A=u();return o(async()=>{A.value=(await r(async()=>{const{default:a}=await import("./chunks/basic.DfO3cfvd.js");return{default:a}},__vite__mapDeps([9,3,2]))).default}),(a,i)=>{const d=C("ClientOnly");return B(),D("div",null,[i[7]||(i[7]=m("",12)),h(t(e(y),null,null,512),[[p,s.value]]),t(d,null,{default:n(()=>[t(e(g),{title:"最小 Skill 定义",description:"使用内联 SkillDefinition 查看 SKILL.md 和文本资源，不依赖网络。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:i[0]||(i[0]=()=>{s.value=!1}),vueCode:e(L)},k({_:2},[A.value?{name:"vue",fn:n(()=>[t(e(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),i[8]||(i[8]=m("",7)),h(t(e(y),null,null,512),[[p,s.value]]),t(d,null,{default:n(()=>[t(e(g),{title:"本地文件夹与默认解析器",description:"选择包含 SKILL.md 的文件夹，确认后查看应用收到的定义。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:i[1]||(i[1]=()=>{s.value=!1}),vueCode:e(I)},k({_:2},[S.value?{name:"vue",fn:n(()=>[t(e(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),i[9]||(i[9]=m("",3)),h(t(e(y),null,null,512),[[p,s.value]]),t(d,null,{default:n(()=>[t(e(g),{title:"导入 Skill 压缩包",description:"选择或拖入归档，解析成功后点击确定查看 Skill 定义。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:i[2]||(i[2]=()=>{s.value=!1}),vueCode:e(w)},k({_:2},[v.value?{name:"vue",fn:n(()=>[t(e(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),i[10]||(i[10]=m("",4)),h(t(e(y),null,null,512),[[p,s.value]]),t(d,null,{default:n(()=>[t(e(g),{title:"从 GitHub 地址导入并查看",description:"导入成功后直接把 SkillDefinition 传给详情组件查看正文和资源。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:i[3]||(i[3]=()=>{s.value=!1}),vueCode:e(P)},k({_:2},[f.value?{name:"vue",fn:n(()=>[t(e(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),i[11]||(i[11]=l("h3",{id:"自定义解析器的状态、失败与重试",tabindex:"-1"},[c("自定义解析器的状态、失败与重试 "),l("a",{class:"header-anchor",href:"#自定义解析器的状态、失败与重试","aria-label":'Permalink to "自定义解析器的状态、失败与重试"'},"​")],-1)),i[12]||(i[12]=l("p",null,[c("点击“导入”后，组件把规范化的输入交给解析器；成功时触发 "),l("code",null,"submit"),c("，失败时在组件内显示错误。自定义解析器若需要 "),l("code",null,"ref"),c(" 和目录边界，必须自行解析，或调用 kit 的加载能力。下面的示例用手动完成的本地 Promise 展示加载、成功和失败，不依赖真实网络，并可再次导入或重置。")],-1)),h(t(e(y),null,null,512),[[p,s.value]]),t(d,null,{default:n(()=>[t(e(g),{title:"解析状态与重试",description:"控制本地解析结果，观察加载、错误、成功以及重试路径。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:i[4]||(i[4]=()=>{s.value=!1}),vueCode:e(q)},k({_:2},[F.value?{name:"vue",fn:n(()=>[t(e(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),i[13]||(i[13]=m("",3)),h(t(e(y),null,null,512),[[p,s.value]]),t(d,null,{default:n(()=>[t(e(g),{title:"查看 Skill 详情",description:"浏览 Skill 文件树并查看说明正文和资源文件。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:i[5]||(i[5]=()=>{s.value=!1}),vueCode:e(T)},k({_:2},[b.value?{name:"vue",fn:n(()=>[t(e(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),i[14]||(i[14]=l("h3",{id:"skill-编辑与文件管理",tabindex:"-1"},[c("Skill 编辑与文件管理 "),l("a",{class:"header-anchor",href:"#skill-编辑与文件管理","aria-label":'Permalink to "Skill 编辑与文件管理"'},"​")],-1)),i[15]||(i[15]=l("p",null,[c("下面的示例单独展示编辑流程。示例默认选中 "),l("code",null,"SKILL.md"),c("，可以直接点击右侧文件标题栏的“编辑”进入编辑态；保存后，示例会更新传入的定义并显示保存提示。")],-1)),h(t(e(y),null,null,512),[[p,s.value]]),t(d,null,{default:n(()=>[t(e(g),{title:"编辑 Skill 正文",description:"点击右侧文件标题栏的“编辑”，切换可视化或源码模式并保存；也可以选择文本资源编辑。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:i[6]||(i[6]=()=>{s.value=!1}),vueCode:e(_)},k({_:2},[E.value?{name:"vue",fn:n(()=>[t(e(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),i[16]||(i[16]=m("",50))])}}});export{G as __pageData,V as default};

const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.D2Ir1Cv_.js","assets/chunks/theme.BhrndRSw.js","assets/chunks/framework.BHsLpWB3.js","assets/chunks/code-mode.CTrJd-kG.js","assets/chunks/basic.B4Cs3rel.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as c,aZ as C,aL as B,v as A,H as E,bL as g,bB as y,J as i,bk as t,bJ as l,G as F,w as a,I as p,b7 as u,aU as v}from"./chunks/framework.BHsLpWB3.js";import{L as m,N as b}from"./chunks/index.DXUwwNat.js";const x=`<script setup lang="ts">
import { ref } from 'vue'
import { TrMcpExtensionDetail } from '@opentiny/tiny-robot'
import type { McpExtensionTool, McpExtensionToolToggleEvent } from '@opentiny/tiny-robot'

const initialTools = (): McpExtensionTool[] => [
  { id: 'forecast', name: '天气预报', description: '查询未来三天的天气。', enabled: true },
  { id: 'alerts', name: '天气预警', description: '查询当前预警。', enabled: false },
  { id: 'admin', name: '管理设置', description: '由应用策略禁用。', enabled: false, disabled: true },
]

const tools = ref<McpExtensionTool[]>(initialTools())
const result = ref('尚未切换工具')

const handleToggle = ({ toolId, enabled }: McpExtensionToolToggleEvent) => {
  tools.value = tools.value.map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool))
  result.value = \`应用已将 \${toolId} 更新为\${enabled ? '启用' : '停用'}\`
}

const reset = () => {
  tools.value = initialTools()
  result.value = '尚未切换工具'
}
<\/script>

<template>
  <section>
    <div class="demo-aux-controls">
      <button type="button" class="demo-aux-control" @click="reset">恢复工具状态</button>
    </div>
    <tr-mcp-extension-detail
      id="weather"
      name="天气 MCP"
      description="提供天气预报与预警查询。"
      updated-at="2026-07-10"
      :tools="tools"
      @tool-toggle="handleToggle"
    />
    <p aria-live="polite">{{ result }}</p>
  </section>
</template>
`,D=`<script setup lang="ts">
import { ref } from 'vue'
import { TrMcpExtensionForm } from '@opentiny/tiny-robot'
import type { McpExtensionFormMode, McpExtensionFormSubmitMeta, McpExtensionFormValue } from '@opentiny/tiny-robot'

const example = (): McpExtensionFormValue => ({
  name: 'weather',
  type: 'streamableHttp',
  url: 'https://example.com/mcp',
})

const value = ref<McpExtensionFormValue>(example())
const mode = ref<McpExtensionFormMode>('code')
const formKey = ref(0)
const result = ref('')

const handleSubmit = (submitted: McpExtensionFormValue, meta: McpExtensionFormSubmitMeta) => {
  result.value = \`应用收到 \${submitted.name}，提交来源：\${meta.source}\`
}

const reset = () => {
  value.value = example()
  mode.value = 'code'
  result.value = ''
  formKey.value += 1
}
<\/script>

<template>
  <section class="mcp-demo">
    <div class="demo-aux-controls">
      <button type="button" class="demo-aux-control" @click="reset">恢复示例配置</button>
    </div>
    <tr-mcp-extension-form :key="formKey" v-model="value" v-model:mode="mode" @submit="handleSubmit" />
    <p aria-live="polite">{{ result || \`当前添加方式：\${mode}\` }}</p>
  </section>
</template>

<style scoped>
.mcp-demo {
  max-width: 700px;
}
</style>
`,f=`<script setup lang="ts">
import { ref } from 'vue'
import { TrMcpExtensionForm } from '@opentiny/tiny-robot'
import type { McpExtensionFormSubmitMeta, McpExtensionFormValue } from '@opentiny/tiny-robot'

const emptyValue = (): McpExtensionFormValue => ({ name: '', type: 'streamableHttp', url: '' })
const value = ref<McpExtensionFormValue>(emptyValue())
const formKey = ref(0)
const result = ref('')

const handleSubmit = (submitted: McpExtensionFormValue, meta: McpExtensionFormSubmitMeta) => {
  result.value = \`应用收到 \${submitted.name}（\${meta.source}）：\${submitted.url}\`
}

const reset = () => {
  value.value = emptyValue()
  result.value = ''
  formKey.value += 1
}
<\/script>

<template>
  <section class="mcp-demo">
    <div class="demo-aux-controls">
      <button type="button" class="demo-aux-control" @click="reset">重置示例</button>
    </div>
    <tr-mcp-extension-form
      :key="formKey"
      v-model="value"
      @submit="handleSubmit"
      @cancel="result = '应用收到取消意图'"
    />
    <p aria-live="polite">{{ result || '填写名称和 HTTP 地址，然后点击“确定”。' }}</p>
  </section>
</template>

<style scoped>
.mcp-demo {
  max-width: 700px;
}
</style>
`,S=JSON.parse('{"title":"MCP 扩展添加与详情","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/mcp-extension.md","filePath":"components/mcp-extension.md"}'),M={name:"components/mcp-extension.md"},W=Object.assign(M,{setup(T){const h=u();r(async()=>{h.value=(await c(async()=>{const{default:e}=await import("./chunks/basic.D2Ir1Cv_.js");return{default:e}},__vite__mapDeps([0,1,2]))).default});const d=u();r(async()=>{d.value=(await c(async()=>{const{default:e}=await import("./chunks/code-mode.CTrJd-kG.js");return{default:e}},__vite__mapDeps([3,1,2]))).default});const n=v(!0),k=u();return r(async()=>{k.value=(await c(async()=>{const{default:e}=await import("./chunks/basic.B4Cs3rel.js");return{default:e}},__vite__mapDeps([4,1,2]))).default}),(e,s)=>{const o=C("ClientOnly");return B(),A("div",null,[s[3]||(s[3]=E("",11)),g(i(t(m),null,null,512),[[y,n.value]]),i(o,null,{default:l(()=>[i(t(b),{title:"填写并提交连接",description:"填写名称和 HTTP 地址后提交；取消和重置都可在页面观察。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{n.value=!1}),vueCode:t(f)},F({_:2},[k.value?{name:"vue",fn:l(()=>[i(t(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[4]||(s[4]=E("",3)),g(i(t(m),null,null,512),[[y,n.value]]),i(o,null,{default:l(()=>[i(t(b),{title:"代码方式与受控添加方式",description:"编辑单条 MCP JSON 配置，观察提交来源和错误恢复。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{n.value=!1}),vueCode:t(D)},F({_:2},[d.value?{name:"vue",fn:l(()=>[i(t(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[5]||(s[5]=a("h3",{id:"显示并切换工具",tabindex:"-1"},[p("显示并切换工具 "),a("a",{class:"header-anchor",href:"#显示并切换工具","aria-label":'Permalink to "显示并切换工具"'},"​")],-1)),s[6]||(s[6]=a("p",null,[a("code",null,"McpExtensionDetail"),p(" 按传入的 "),a("code",null,"tools"),p(" 展示开关。用户操作时，它只触发 "),a("code",null,"tool-toggle"),p("，不会自行修改 "),a("code",null,"tools"),p("。示例由应用更新数组，因此开关状态会在事件后保持；禁用项不能触发切换。")],-1)),g(i(t(m),null,null,512),[[y,n.value]]),i(o,null,{default:l(()=>[i(t(b),{title:"应用更新工具状态",description:"切换工具后由应用更新传入数据，并可一键恢复初始状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{n.value=!1}),vueCode:t(x)},F({_:2},[h.value?{name:"vue",fn:l(()=>[i(t(h))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[7]||(s[7]=E("",35))])}}});export{S as __pageData,W as default};

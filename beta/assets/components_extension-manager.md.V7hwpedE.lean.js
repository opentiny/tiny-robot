const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/responsive-layout.CiPVEOHS.js","assets/chunks/theme.FBhdtw51.js","assets/chunks/framework.CSCYUGUn.js","assets/chunks/card-and-grid.Cp6xqWrm.js","assets/chunks/manager-slots.BPW4ykmD.js","assets/chunks/single-tab-navigation.-8u6evBD.js","assets/chunks/controlled-events.CK-8jMkU.js","assets/chunks/empty-states.Dvr6en1o.js","assets/chunks/progress.D1fjeGU5.js","assets/chunks/browse-and-filter.4cWQtP_g.js","assets/chunks/basic.x28uQF_9.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as c,aZ as D,aL as _,v as T,H as b,bL as h,bB as p,J as e,bk as i,bJ as s,G as k,w as d,I as l,b7 as y,aU as w}from"./chunks/framework.CSCYUGUn.js";import{L as g,N as u}from"./chunks/index.DLLCwG7b.js";const M=`<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const narrow = ref(false)

const tabs: ExtensionManagerTab[] = [
  {
    id: 'catalog',
    label: '扩展目录',
    items: [
      {
        id: 'summary',
        name: '内容总结',
        description: '提炼文档重点。',
        installed: true,
        tags: ['写作'],
      },
      {
        id: 'translation',
        name: '翻译助手',
        description: '翻译选中的文本。',
        installed: true,
        tags: ['写作'],
      },
      {
        id: 'repository',
        name: '仓库搜索',
        description: '检索代码和文档。',
        tags: ['开发'],
      },
      {
        id: 'release-notes',
        name: '发布说明',
        description: '根据变更生成版本说明。',
        tags: ['开发'],
      },
    ],
  },
]
<\/script>

<template>
  <button type="button" :aria-pressed="narrow" @click="narrow = !narrow">
    {{ narrow ? '切换为宽容器' : '切换为窄容器' }}
  </button>
  <p aria-live="polite">当前布局：{{ narrow ? '窄容器' : '宽容器' }}</p>
  <div class="responsive-layout" :class="{ 'is-narrow': narrow }">
    <tr-extension-manager :tabs="tabs" />
  </div>
</template>

<style scoped>
.responsive-layout {
  width: 760px;
  max-width: 100%;
}

.responsive-layout.is-narrow {
  width: 440px;
}
</style>
`,W=`<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionCard, TrExtensionCardGrid } from '@opentiny/tiny-robot'
import type { ExtensionCardAction, ExtensionCardActionEvent, ExtensionCardGridItem } from '@opentiny/tiny-robot'

const result = ref('尚未触发')
const actions: ExtensionCardAction[] = [
  { id: 'inspect', type: 'custom', label: '查看' },
  { id: 'remove', type: 'button', label: '移除' },
]
const items: ExtensionCardGridItem[] = [
  { id: 'search', name: '全文搜索', description: '在已接入内容中搜索。' },
  { id: 'archive', name: '归档助手', description: '自动归档完成的内容。' },
]

const handleAction = (event: ExtensionCardActionEvent) => {
  const payload = event.payload === undefined ? '无' : JSON.stringify(event.payload)
  result.value = \`\${event.id}：\${payload}\`
}
<\/script>

<template>
  <tr-extension-card name="自定义操作" :actions="actions" :primary-actions-limit="1" @action="handleAction">
    <template #primary-action="{ action, trigger }">
      <button type="button" :disabled="action.disabled" @click="trigger({ source: 'card-demo' })">
        {{ action.label }}
      </button>
    </template>
  </tr-extension-card>

  <tr-extension-card-grid :items="items">
    <template #item="{ item, index }">
      <article>{{ index + 1 }}. {{ item.name }}</article>
    </template>
  </tr-extension-card-grid>
  <p aria-live="polite">{{ result }}</p>
</template>
`,P=`<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const headerActionCount = ref(0)

const tabs: ExtensionManagerTab[] = [
  { id: 'library', label: '资料库', items: [{ id: 'reader', name: '文档阅读', installed: true }] },
  { id: 'empty', label: '空分组', items: [] },
]
<\/script>

<template>
  <tr-extension-manager title="扩展" :tabs="tabs">
    <template #header-actions>
      <button type="button" @click="headerActionCount += 1">添加扩展</button>
    </template>
    <template #tab="{ tab, active, select }">
      <span @click="select">{{ tab.label }}{{ active ? '（当前）' : '' }}</span>
    </template>
    <template #item="{ item, index }">
      <article>{{ index + 1 }}. {{ item.name }}</article>
    </template>
    <template #empty="{ title }">{{ title }}暂时没有扩展。</template>
  </tr-extension-manager>
  <p aria-live="polite">添加扩展操作触发次数：{{ headerActionCount }}</p>
</template>
`,G=`<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const hideSingleTab = ref(false)
const tabs: ExtensionManagerTab[] = [
  {
    id: 'mcp',
    label: 'MCP',
    items: [{ id: 'filesystem', name: '文件系统', description: '读取和管理本地文件。', installed: true }],
  },
]
<\/script>

<template>
  <label><input v-model="hideSingleTab" type="checkbox" /> 隐藏单标签导航</label>
  <tr-extension-manager title="扩展" :tabs="tabs" :hide-single-tab="hideSingleTab" />
</template>
`,S=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const activeTab = ref<string | undefined>('writing')
const tabs: ExtensionManagerTab[] = [
  {
    id: 'writing',
    label: '写作',
    items: [
      {
        id: 'summarizer',
        name: '内容总结',
        description: '提炼长文档的关键信息。',
        installed: true,
      },
    ],
  },
  {
    id: 'development',
    label: '开发',
    items: [
      {
        id: 'repository-search',
        name: '仓库搜索',
        description: '检索代码和文档。',
        installed: true,
      },
    ],
  },
]

const activeLabel = computed(() => tabs.find((tab) => tab.id === activeTab.value)?.label ?? '无')
<\/script>

<template>
  <tr-extension-manager v-model:active-tab="activeTab" :tabs="tabs" />
  <p aria-live="polite">父组件保存的当前标签页：{{ activeLabel }}</p>
</template>
`,q=`<script setup lang="ts">
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const tabs: ExtensionManagerTab[] = [{ id: 'empty-section', label: '空分区', items: [] }]
<\/script>

<template>
  <tr-extension-manager :tabs="tabs">
    <template #empty="{ title }">{{ title }}中没有匹配的扩展。</template>
  </tr-extension-manager>

  <tr-extension-manager :tabs="[]" empty-text="当前没有可用的扩展分类。" />
</template>
`,Z=`<script setup lang="ts">
import { TrExtensionCard } from '@opentiny/tiny-robot'
<\/script>

<template>
  <tr-extension-card name="知识库同步" description="已同步 64% 的资料。" :progress="64" />
  <tr-extension-card name="本地索引" description="正在准备搜索索引。" progress="indeterminate" />
  <tr-extension-card name="范围限制" description="超过范围的数值会显示为 100%。" :progress="160" />
</template>
`,I=`<script setup lang="ts">
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const tabs: ExtensionManagerTab[] = [
  {
    id: 'catalog',
    label: '扩展目录',
    items: [
      { id: 'summary', name: '内容总结', description: '提炼文档重点。', installed: true, tags: ['写作'] },
      { id: 'translate', name: '翻译助手', description: '翻译选中的文本。', tags: ['写作', '效率'] },
      { id: 'repository', name: '仓库搜索', description: '检索代码和文档。', tags: ['开发'] },
    ],
  },
  {
    id: 'updates',
    label: '更新',
    items: [{ id: 'release-note', name: '发布说明', description: '生成版本说明。', tags: ['开发'] }],
  },
]
<\/script>

<template>
  <tr-extension-manager :tabs="tabs" />
</template>
`,X=`<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionCardAction, ExtensionManagerActionEvent, ExtensionManagerTab } from '@opentiny/tiny-robot'

const createMcpActions = (name: string, checked = true): ExtensionCardAction[] => [
  { id: 'enabled', type: 'switch', label: \`启用\${name}\`, checked },
  { id: 'uninstall', type: 'button', label: '卸载', danger: true },
]

const tabs = ref<ExtensionManagerTab[]>([
  {
    id: 'mcp',
    label: 'MCP',
    items: [
      {
        id: 'filesystem',
        name: '文件系统',
        description: '读取和管理本地文件。',
        installed: true,
        actions: createMcpActions('文件系统'),
      },
      {
        id: 'github',
        name: 'GitHub',
        description: '访问仓库、议题和拉取请求。',
        installed: true,
        actions: createMcpActions('GitHub', false),
      },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    items: [
      {
        id: 'document-summary',
        name: '文档总结',
        description: '将长文档整理为简明要点。',
        actions: [{ id: 'install', type: 'button', label: '安装' }],
      },
      {
        id: 'code-review',
        name: '代码评审',
        description: '检查代码改动并给出改进建议。',
        actions: [{ id: 'install', type: 'button', label: '安装' }],
      },
    ],
  },
])

const handleAction = (event: ExtensionManagerActionEvent) => {
  const tab = tabs.value.find((candidate) => candidate.id === event.tabId)
  const item = tab?.items.find((candidate) => candidate.id === event.itemId)
  if (!item) return

  if (event.action.type === 'switch' && typeof event.action.checked === 'boolean') {
    const action = item.actions?.find((candidate) => candidate.id === event.action.id)
    if (action?.type === 'switch') action.checked = event.action.checked
    return
  }

  if (event.action.type === 'button' && event.action.id === 'install') {
    item.installed = true
    item.actions = event.tabId === 'mcp' ? createMcpActions(item.name) : []
    return
  }

  if (event.action.type === 'button' && event.action.id === 'uninstall') {
    item.installed = false
    item.actions = [{ id: 'install', type: 'button', label: '安装' }]
  }
}
<\/script>

<template>
  <tr-extension-manager title="扩展管理" :tabs="tabs" @action="handleAction" />
</template>
`,N=JSON.parse('{"title":"ExtensionManager 扩展管理组件","description":"","frontmatter":{"outline":[1,3],"pageClass":"demo-container-page-bg"},"headers":[],"relativePath":"components/extension-manager.md","filePath":"components/extension-manager.md"}'),L={name:"components/extension-manager.md"},O=Object.assign(L,{setup(R){const m=y();r(async()=>{m.value=(await c(async()=>{const{default:n}=await import("./chunks/responsive-layout.CiPVEOHS.js");return{default:n}},__vite__mapDeps([0,1,2]))).default});const E=y();r(async()=>{E.value=(await c(async()=>{const{default:n}=await import("./chunks/card-and-grid.Cp6xqWrm.js");return{default:n}},__vite__mapDeps([3,1,2]))).default});const F=y();r(async()=>{F.value=(await c(async()=>{const{default:n}=await import("./chunks/manager-slots.BPW4ykmD.js");return{default:n}},__vite__mapDeps([4,1,2]))).default});const C=y();r(async()=>{C.value=(await c(async()=>{const{default:n}=await import("./chunks/single-tab-navigation.-8u6evBD.js");return{default:n}},__vite__mapDeps([5,2,1]))).default});const v=y();r(async()=>{v.value=(await c(async()=>{const{default:n}=await import("./chunks/controlled-events.CK-8jMkU.js");return{default:n}},__vite__mapDeps([6,1,2]))).default});const A=y();r(async()=>{A.value=(await c(async()=>{const{default:n}=await import("./chunks/empty-states.Dvr6en1o.js");return{default:n}},__vite__mapDeps([7,1,2]))).default});const x=y();r(async()=>{x.value=(await c(async()=>{const{default:n}=await import("./chunks/progress.D1fjeGU5.js");return{default:n}},__vite__mapDeps([8,1,2]))).default});const f=y();r(async()=>{f.value=(await c(async()=>{const{default:n}=await import("./chunks/browse-and-filter.4cWQtP_g.js");return{default:n}},__vite__mapDeps([9,1,2]))).default});const a=w(!0),B=y();return r(async()=>{B.value=(await c(async()=>{const{default:n}=await import("./chunks/basic.x28uQF_9.js");return{default:n}},__vite__mapDeps([10,1,2]))).default}),(n,t)=>{const o=D("ClientOnly");return _(),T("div",null,[t[9]||(t[9]=b("",9)),h(e(i(g),null,null,512),[[p,a.value]]),e(o,null,{default:s(()=>[e(i(u),{title:"管理 MCP 与 Skills",description:"切换 MCP 开关、安装 Skills，或卸载并重新安装 MCP，观察条目在分区之间移动。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{a.value=!1}),vueCode:i(X)},k({_:2},[B.value?{name:"vue",fn:s(()=>[e(i(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=b("",5)),h(e(i(g),null,null,512),[[p,a.value]]),e(o,null,{default:s(()=>[e(i(u),{title:"浏览、筛选与自动分区",description:"切换标签页、选择标签或输入关键词，观察筛选后的已安装和可安装分区。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{a.value=!1}),vueCode:i(I)},k({_:2},[f.value?{name:"vue",fn:s(()=>[e(i(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[11]||(t[11]=d("h3",{id:"进度反馈",tabindex:"-1"},[l("进度反馈 "),d("a",{class:"header-anchor",href:"#进度反馈","aria-label":'Permalink to "进度反馈"'},"​")],-1)),t[12]||(t[12]=d("p",null,[l("Card 的 "),d("code",null,"progress"),l(" 可以是 "),d("code",null,"0"),l(" 至 "),d("code",null,"100"),l(" 的数值，超出范围会被限制；使用 "),d("code",null,"'indeterminate'"),l(" 表示不确定进度。")],-1)),h(e(i(g),null,null,512),[[p,a.value]]),e(o,null,{default:s(()=>[e(i(u),{title:"卡片进度",description:"分别展示确定进度、不确定进度和超出范围数值的限制结果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{a.value=!1}),vueCode:i(Z)},k({_:2},[x.value?{name:"vue",fn:s(()=>[e(i(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[13]||(t[13]=d("h3",{id:"空状态",tabindex:"-1"},[l("空状态 "),d("a",{class:"header-anchor",href:"#空状态","aria-label":'Permalink to "空状态"'},"​")],-1)),t[14]||(t[14]=d("p",null,[l("每个当前标签页都有“已安装”和“可安装”两个可折叠分区。没有匹配项时，"),d("code",null,"ExtensionManager"),l(" 的 "),d("code",null,"empty"),l(" 插槽接收分区标题；没有可显示的标签页时显示 "),d("code",null,"empty-text"),l("。")],-1)),h(e(i(g),null,null,512),[[p,a.value]]),e(o,null,{default:s(()=>[e(i(u),{title:"分区与管理器空状态",description:"分别定制空分区内容，并为没有标签页的管理器提供提示文字。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{a.value=!1}),vueCode:i(q)},k({_:2},[A.value?{name:"vue",fn:s(()=>[e(i(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=b("",8)),h(e(i(g),null,null,512),[[p,a.value]]),e(o,null,{default:s(()=>[e(i(u),{title:"由父组件控制当前标签页",description:"使用 v-model:active-tab 保存当前标签页，并显示父组件收到的最新值。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{a.value=!1}),vueCode:i(S)},k({_:2},[v.value?{name:"vue",fn:s(()=>[e(i(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[16]||(t[16]=d("p",null,[l("只有一个标签页且不需要展示切换入口时，可以设置 "),d("code",null,"hide-single-tab"),l("。该属性只隐藏单标签导航，不会改变当前标签页的状态或内容；当 "),d("code",null,"tabs"),l(" 增加到多个标签页时，导航会自动恢复。")],-1)),h(e(i(g),null,null,512),[[p,a.value]]),e(o,null,{default:s(()=>[e(i(u),{title:"隐藏单标签导航",description:"切换 hide-single-tab，观察标签导航隐藏后标题和内容保持不变。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{a.value=!1}),vueCode:i(G)},k({_:2},[C.value?{name:"vue",fn:s(()=>[e(i(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[17]||(t[17]=b("",8)),h(e(i(g),null,null,512),[[p,a.value]]),e(o,null,{default:s(()=>[e(i(u),{title:"替换管理器区域",description:"在不依赖内部 DOM 的前提下定制头部、标签、条目和空分区。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{a.value=!1}),vueCode:i(P)},k({_:2},[F.value?{name:"vue",fn:s(()=>[e(i(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[18]||(t[18]=b("",4)),h(e(i(g),null,null,512),[[p,a.value]]),e(o,null,{default:s(()=>[e(i(u),{title:"独立使用 Card 与 CardGrid",description:"在独立 Card 中定制主操作并展示更多操作，同时使用 CardGrid 的 item 插槽替换条目内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{a.value=!1}),vueCode:i(W)},k({_:2},[E.value?{name:"vue",fn:s(()=>[e(i(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[19]||(t[19]=b("",7)),h(e(i(g),null,null,512),[[p,a.value]]),e(o,null,{default:s(()=>[e(i(u),{title:"容器响应式布局",description:"切换宽窄容器，观察筛选控件和 CardGrid 如何根据组件容器宽度调整布局。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[8]||(t[8]=()=>{a.value=!1}),vueCode:i(M)},k({_:2},[m.value?{name:"vue",fn:s(()=>[e(i(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[20]||(t[20]=b("",38))])}}});export{N as __pageData,O as default};

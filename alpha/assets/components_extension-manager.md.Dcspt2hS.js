const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/responsive-layout.q5FlMPYb.js","assets/chunks/theme.DFIyBece.js","assets/chunks/framework.BxUN6Jop.js","assets/chunks/card-and-grid.D36w4qx6.js","assets/chunks/manager-slots.BwEpNvxW.js","assets/chunks/controlled-events.XAUOMqNY.js","assets/chunks/empty-states.BanB8Wsm.js","assets/chunks/progress.mrw-SZMs.js","assets/chunks/browse-and-filter.B7xmbPdC.js","assets/chunks/basic.BEaWRrEL.js"])))=>i.map(i=>d[i]);
import{aD as o,bQ as l,aZ as B,aL as D,v as _,H as r,bL as c,bB as h,J as e,bk as i,bJ as n,G as p,w as u,I as E,b7 as k,aU as T}from"./chunks/framework.BxUN6Jop.js";import{L as y,N as g}from"./chunks/index.DtYzv2Q1.js";const w=`<script setup lang="ts">
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
`,M=`<script setup lang="ts">
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
`,W=`<script setup lang="ts">
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
`,P=`<script setup lang="ts">
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
`,S=`<script setup lang="ts">
import { TrExtensionCard } from '@opentiny/tiny-robot'
<\/script>

<template>
  <tr-extension-card name="知识库同步" description="已同步 64% 的资料。" :progress="64" />
  <tr-extension-card name="本地索引" description="正在准备搜索索引。" progress="indeterminate" />
  <tr-extension-card name="范围限制" description="超过范围的数值会显示为 100%。" :progress="160" />
</template>
`,G=`<script setup lang="ts">
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
`,I=`<script setup lang="ts">
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
`,V=JSON.parse('{"title":"ExtensionManager 扩展管理组件","description":"","frontmatter":{"outline":[1,3],"pageClass":"demo-container-page-bg"},"headers":[],"relativePath":"components/extension-manager.md","filePath":"components/extension-manager.md"}'),Z={name:"components/extension-manager.md"},N=Object.assign(Z,{setup(X){const b=k();o(async()=>{b.value=(await l(async()=>{const{default:s}=await import("./chunks/responsive-layout.q5FlMPYb.js");return{default:s}},__vite__mapDeps([0,1,2]))).default});const m=k();o(async()=>{m.value=(await l(async()=>{const{default:s}=await import("./chunks/card-and-grid.D36w4qx6.js");return{default:s}},__vite__mapDeps([3,1,2]))).default});const F=k();o(async()=>{F.value=(await l(async()=>{const{default:s}=await import("./chunks/manager-slots.BwEpNvxW.js");return{default:s}},__vite__mapDeps([4,1,2]))).default});const C=k();o(async()=>{C.value=(await l(async()=>{const{default:s}=await import("./chunks/controlled-events.XAUOMqNY.js");return{default:s}},__vite__mapDeps([5,1,2]))).default});const A=k();o(async()=>{A.value=(await l(async()=>{const{default:s}=await import("./chunks/empty-states.BanB8Wsm.js");return{default:s}},__vite__mapDeps([6,1,2]))).default});const v=k();o(async()=>{v.value=(await l(async()=>{const{default:s}=await import("./chunks/progress.mrw-SZMs.js");return{default:s}},__vite__mapDeps([7,1,2]))).default});const x=k();o(async()=>{x.value=(await l(async()=>{const{default:s}=await import("./chunks/browse-and-filter.B7xmbPdC.js");return{default:s}},__vite__mapDeps([8,1,2]))).default});const a=T(!0),f=k();return o(async()=>{f.value=(await l(async()=>{const{default:s}=await import("./chunks/basic.BEaWRrEL.js");return{default:s}},__vite__mapDeps([9,1,2]))).default}),(s,t)=>{const d=B("ClientOnly");return D(),_("div",null,[t[8]||(t[8]=r('<h1 id="extensionmanager-扩展管理组件" tabindex="-1">ExtensionManager 扩展管理组件 <a class="header-anchor" href="#extensionmanager-扩展管理组件" aria-label="Permalink to &quot;ExtensionManager 扩展管理组件&quot;">​</a></h1><p><code>ExtensionManager</code> 用于浏览和管理通用 Extension。组件提供标签页切换、筛选、自动分区和分区展开，并自行维护筛选与分区展开状态。当前标签页既可以由父组件控制，也可以由组件维护。安装、卸载、开关状态和详情跳转等操作会触发事件，由应用决定如何更新 Extension 数据或打开后续界面。</p><h2 id="概览" tabindex="-1">概览 <a class="header-anchor" href="#概览" aria-label="Permalink to &quot;概览&quot;">​</a></h2><h3 id="适用场景" tabindex="-1">适用场景 <a class="header-anchor" href="#适用场景" aria-label="Permalink to &quot;适用场景&quot;">​</a></h3><ul><li>在一个面板中按标签页浏览 Extension，并按标签和关键词过滤。</li><li>为已安装和可安装的 Extension 提供一致的卡片、操作和进度反馈。</li><li>在应用页面、Modal 或 Drawer 中嵌入管理内容。组件本身不控制容器的显示、焦点和滚动。</li></ul><h3 id="选择建议" tabindex="-1">选择建议 <a class="header-anchor" href="#选择建议" aria-label="Permalink to &quot;选择建议&quot;">​</a></h3><p><code>ExtensionManager</code> 只处理通用的扩展管理功能。<code>installed</code> 和 <code>tags</code> 用于分区与筛选，不会传入 Card 或 CardGrid 的 <code>item</code> 插槽。MCP 工具、表单或详情等特定类型的内容应由应用实现。例如，应用可以在收到 <code>name-click</code> 后打开对应的详情界面。</p><h2 id="快速开始" tabindex="-1">快速开始 <a class="header-anchor" href="#快速开始" aria-label="Permalink to &quot;快速开始&quot;">​</a></h2><p>下面以 MCP 和 Skills 两类 Extension 为例，展示一个可直接运行的管理场景。MCP 已安装，支持启用开关，并可从更多操作中卸载；Skills 可以安装，安装后会移动到“已安装”分区。卸载 MCP 后，条目会回到“可安装”分区，并可重新安装。</p>',9)),c(e(i(y),null,null,512),[[h,a.value]]),e(d,null,{default:n(()=>[e(i(g),{title:"管理 MCP 与 Skills",description:"切换 MCP 开关、安装 Skills，或卸载并重新安装 MCP，观察条目在分区之间移动。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{a.value=!1}),vueCode:i(I)},p({_:2},[f.value?{name:"vue",fn:n(()=>[e(i(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[9]||(t[9]=r('<h2 id="常用用法" tabindex="-1">常用用法 <a class="header-anchor" href="#常用用法" aria-label="Permalink to &quot;常用用法&quot;">​</a></h2><h3 id="浏览、筛选和自动分区" tabindex="-1">浏览、筛选和自动分区 <a class="header-anchor" href="#浏览、筛选和自动分区" aria-label="Permalink to &quot;浏览、筛选和自动分区&quot;">​</a></h3><p>组件会读取当前标签页中各条目的 <code>tags</code>，生成标签筛选选项。当前标签页没有可用标签时，组件隐藏标签筛选器，但仍显示关键词搜索。</p><p>搜索会忽略首尾空白，并匹配 <code>name</code> 和 <code>description</code>。同时设置标签和关键词时，条目需要同时满足两个条件。每个标签页保存自己的筛选条件。已选择的标签不再存在时，组件会清除该标签条件。</p><p><code>installed: true</code> 的条目归入“已安装”；<code>installed: false</code> 或省略 <code>installed</code> 的条目归入“可安装”。两段始终显示，即使筛选后没有条目；原始数据的顺序会保留。</p>',5)),c(e(i(y),null,null,512),[[h,a.value]]),e(d,null,{default:n(()=>[e(i(g),{title:"浏览、筛选与自动分区",description:"切换标签页、选择标签或输入关键词，观察筛选后的已安装和可安装分区。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{a.value=!1}),vueCode:i(G)},p({_:2},[x.value?{name:"vue",fn:n(()=>[e(i(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=r('<h2 id="状态与反馈" tabindex="-1">状态与反馈 <a class="header-anchor" href="#状态与反馈" aria-label="Permalink to &quot;状态与反馈&quot;">​</a></h2><h3 id="进度" tabindex="-1">进度 <a class="header-anchor" href="#进度" aria-label="Permalink to &quot;进度&quot;">​</a></h3><p>Card 的 <code>progress</code> 可以是 <code>0</code> 至 <code>100</code> 的数值，超出范围会被限制；使用 <code>&#39;indeterminate&#39;</code> 表示不确定进度。</p>',3)),c(e(i(y),null,null,512),[[h,a.value]]),e(d,null,{default:n(()=>[e(i(g),{title:"卡片进度",description:"分别展示确定进度、不确定进度和超出范围数值的限制结果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{a.value=!1}),vueCode:i(S)},p({_:2},[v.value?{name:"vue",fn:n(()=>[e(i(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[11]||(t[11]=u("h3",{id:"空状态",tabindex:"-1"},[E("空状态 "),u("a",{class:"header-anchor",href:"#空状态","aria-label":'Permalink to "空状态"'},"​")],-1)),t[12]||(t[12]=u("p",null,[E("每个当前标签页都有“已安装”和“可安装”两个可折叠分区。没有匹配项时，"),u("code",null,"ExtensionManager"),E(" 的 "),u("code",null,"empty"),E(" 插槽接收分区标题；没有可显示的标签页时显示 "),u("code",null,"empty-text"),E("。")],-1)),c(e(i(y),null,null,512),[[h,a.value]]),e(d,null,{default:n(()=>[e(i(g),{title:"分区与管理器空状态",description:"分别定制空分区内容，并为没有标签页的管理器提供提示文字。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{a.value=!1}),vueCode:i(q)},p({_:2},[A.value?{name:"vue",fn:n(()=>[e(i(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[13]||(t[13]=r('<h2 id="交互与状态管理" tabindex="-1">交互与状态管理 <a class="header-anchor" href="#交互与状态管理" aria-label="Permalink to &quot;交互与状态管理&quot;">​</a></h2><h3 id="状态所有权" tabindex="-1">状态所有权 <a class="header-anchor" href="#状态所有权" aria-label="Permalink to &quot;状态所有权&quot;">​</a></h3><p><code>ExtensionManager</code> 同时处理外部数据、可由父组件控制的值，以及组件自身的界面状态。接入时需要先明确每项数据由谁更新。用户点击“安装”、切换开关或点击名称时，组件不会直接修改 <code>tabs</code> 或条目数据。</p><table tabindex="0"><thead><tr><th>状态 / 数据</th><th>管理方</th><th>更新方式</th></tr></thead><tbody><tr><td>Extension 数据</td><td>应用</td><td>处理 <code>action</code> 后更新 <code>tabs</code></td></tr><tr><td>当前标签页（受控）</td><td>应用</td><td>处理 <code>update:active-tab</code> 后更新绑定值</td></tr><tr><td>当前标签页（非受控）</td><td>组件</td><td>自动更新内部状态</td></tr><tr><td>标签筛选和搜索词</td><td>组件</td><td>按标签页分别保存筛选条件</td></tr><tr><td>分区展开状态</td><td>组件</td><td>先更新内部状态，再触发 <code>section-toggle</code></td></tr></tbody></table><h3 id="当前标签页" tabindex="-1">当前标签页 <a class="header-anchor" href="#当前标签页" aria-label="Permalink to &quot;当前标签页&quot;">​</a></h3><p>当前标签页同时支持受控和非受控两种使用方式：</p><ul><li><strong>受控方式</strong><ul><li>当前值来自 <code>active-tab</code>，<code>default-active-tab</code> 不生效。</li><li>用户选择标签页时，组件依次触发 <code>update:active-tab</code> 和 <code>tab-change</code>；父组件需要更新 <code>active-tab</code>。</li><li><code>active-tab</code> 无效时，组件显示第一个可用标签页并触发 <code>update:active-tab</code>。没有标签页时参数为 <code>undefined</code>。这两种情况都不会触发 <code>tab-change</code>。</li></ul></li><li><strong>非受控方式</strong><ul><li>当前值由组件保存，初始值来自 <code>default-active-tab</code>；未提供或无效时使用第一个标签页。</li><li>用户选择标签页时，组件先更新内部状态，再依次触发 <code>update:active-tab</code> 和 <code>tab-change</code>。</li><li><code>tabs</code> 变化导致当前值失效时，组件自动切换到新的第一个标签页并触发 <code>update:active-tab</code>，不触发 <code>tab-change</code>。</li></ul></li></ul><p>非受控模式初始化时，即使 <code>default-active-tab</code> 无效并改用第一个标签页，也不会额外触发 <code>update:active-tab</code>。父组件直接修改受控的 <code>active-tab</code> 也不会触发 <code>tab-change</code>，因为 <code>tab-change</code> 只表示用户选择了标签页。</p>',8)),c(e(i(y),null,null,512),[[h,a.value]]),e(d,null,{default:n(()=>[e(i(g),{title:"由父组件控制当前标签页",description:"使用 v-model:active-tab 保存当前标签页，并显示父组件收到的最新值。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{a.value=!1}),vueCode:i(P)},p({_:2},[C.value?{name:"vue",fn:n(()=>[e(i(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[14]||(t[14]=r('<h3 id="处理操作事件" tabindex="-1">处理操作事件 <a class="header-anchor" href="#处理操作事件" aria-label="Permalink to &quot;处理操作事件&quot;">​</a></h3><p>快速开始中的 MCP 开关与卸载操作，以及 Skills 安装按钮，展示了应用如何根据 <code>action</code> 更新数据。<code>action</code> 和 <code>name-click</code> 只说明用户执行了什么操作，不表示组件已经修改 <code>tabs</code>。例如，switch action 的 <code>action.checked</code> 是用户选择的新状态。Card 仍会显示传入的 <code>checked</code>，因此应用需要更新对应 action。用户点击安装或卸载按钮时，组件同样只触发事件。操作完成后，应用需要更新 <code>item.installed</code> 和对应 <code>actions</code>，组件随后会按照新的 <code>tabs</code> 重新分区。</p><p>分区展开状态按标签页和分区分别保存。组件会先更新展开状态，再触发 <code>section-toggle</code>。事件中的 <code>expanded</code> 是更新后的值，应用不需要再同步这个状态，可以按需监听该事件。</p><h2 id="组合与定制" tabindex="-1">组合与定制 <a class="header-anchor" href="#组合与定制" aria-label="Permalink to &quot;组合与定制&quot;">​</a></h2><h3 id="定制-extensionmanager-区域" tabindex="-1">定制 ExtensionManager 区域 <a class="header-anchor" href="#定制-extensionmanager-区域" aria-label="Permalink to &quot;定制 ExtensionManager 区域&quot;">​</a></h3><p><code>header-actions</code>、<code>tab</code>、<code>item</code> 和 <code>empty</code> 分别用于定制头部操作区、标签内容、条目和空状态。定制 <code>tab</code> 时，建议调用作用域中的 <code>select()</code> 选择标签页，不要依赖内部 DOM。</p><p><code>item</code> 插槽会替换默认 Card。<code>ExtensionManager</code> 仍负责外层列表和条目顺序，并使用 <code>item.id</code> 标识条目，但不再提供默认 Card 的 <code>action</code>、<code>name-click</code>、键盘交互和 ARIA 语义。如果自定义条目需要这些功能，开发者需要在插槽内自行实现。插槽中的 <code>item</code> 是 <code>ExtensionCardGridItem</code>，不包含 <code>ExtensionManager</code> 使用的 <code>installed</code> 和 <code>tags</code>。</p>',7)),c(e(i(y),null,null,512),[[h,a.value]]),e(d,null,{default:n(()=>[e(i(g),{title:"替换管理器区域",description:"在不依赖内部 DOM 的前提下定制头部、标签、条目和空分区。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{a.value=!1}),vueCode:i(W)},p({_:2},[F.value?{name:"vue",fn:n(()=>[e(i(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=r('<h3 id="独立组合-card-与-cardgrid" tabindex="-1">独立组合 Card 与 CardGrid <a class="header-anchor" href="#独立组合-card-与-cardgrid" aria-label="Permalink to &quot;独立组合 Card 与 CardGrid&quot;">​</a></h3><p><code>ExtensionManager.Card</code> 和 <code>ExtensionManager.CardGrid</code> 可以独立使用，也分别以 <code>TrExtensionCard</code> 和 <code>TrExtensionCardGrid</code> 导出。Card 直接接收 <code>name</code>、<code>description</code> 和 <code>actions</code> 等 Prop，不接收 <code>item</code> Prop。CardGrid 则接收带有稳定 <code>id</code> 的条目数组。</p><p>Card 会先过滤 <code>hidden: true</code> 的 action，再按数组顺序和 <code>primary-actions-limit</code> 划分主操作与更多操作。<code>disabled</code> action 不会被过滤，仍会占据原来的位置，但用户无法触发它。</p><p><code>primary-action</code> 插槽只会处理位于主操作区域的 custom action。调用 <code>trigger(payload)</code> 后，Card 会触发标准 <code>action</code> 事件，并将参数放入 <code>event.payload</code>。<code>action.data</code> 是 action 自身的数据，不会自动复制到 <code>event.payload</code>。没有提供插槽时，custom action 会显示为普通按钮；进入更多操作菜单的 custom action 也使用默认菜单项。</p>',4)),c(e(i(y),null,null,512),[[h,a.value]]),e(d,null,{default:n(()=>[e(i(g),{title:"独立使用 Card 与 CardGrid",description:"在独立 Card 中定制主操作并展示更多操作，同时使用 CardGrid 的 item 插槽替换条目内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{a.value=!1}),vueCode:i(M)},p({_:2},[m.value?{name:"vue",fn:n(()=>[e(i(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[16]||(t[16]=r('<h2 id="可访问性与设计约束" tabindex="-1">可访问性与设计约束 <a class="header-anchor" href="#可访问性与设计约束" aria-label="Permalink to &quot;可访问性与设计约束&quot;">​</a></h2><h3 id="键盘与焦点" tabindex="-1">键盘与焦点 <a class="header-anchor" href="#键盘与焦点" aria-label="Permalink to &quot;键盘与焦点&quot;">​</a></h3><p>标签页使用原生按钮和 tab 语义。焦点位于标签页时，使用 <code>ArrowLeft</code>、<code>ArrowRight</code> 循环选择并聚焦相邻标签页，使用 <code>Home</code> 或 <code>End</code> 跳到首个或末个标签页；<code>Enter</code> 和 <code>Space</code> 也可以激活标签页。</p><p>Card 名称默认可以点击，并支持 <code>Enter</code> 和 <code>Space</code>。设置 <code>name-clickable=&quot;false&quot;</code> 后，名称显示为普通文本，不再进入 Tab 顺序。分区标题、switch、更多操作按钮、筛选控件和清空搜索按钮均保留对应原生控件的键盘行为。系统启用“减少动态效果”后，活动标签指示条不再播放过渡动画。</p><h3 id="响应式与长内容" tabindex="-1">响应式与长内容 <a class="header-anchor" href="#响应式与长内容" aria-label="Permalink to &quot;响应式与长内容&quot;">​</a></h3><p>筛选区域根据 <code>ExtensionManager</code> 自身的容器宽度调整布局，不依赖浏览器视口宽度。存在标签筛选器且容器宽度不超过 <code>480px</code> 时，标签选择和搜索框由两列变为单列；没有可用标签时，搜索框始终独占一行。</p><p>CardGrid 根据自身容器宽度自动调整列数。每列默认至少为 <code>320px</code>，可以通过 <code>--tr-extension-card-grid-card-min-width</code> 调整。Card 名称和描述过长时会在单行内省略，完整内容保留在 <code>title</code> 中。</p>',7)),c(e(i(y),null,null,512),[[h,a.value]]),e(d,null,{default:n(()=>[e(i(g),{title:"容器响应式布局",description:"切换宽窄容器，观察筛选控件和 CardGrid 如何根据组件容器宽度调整布局。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{a.value=!1}),vueCode:i(w)},p({_:2},[b.value?{name:"vue",fn:n(()=>[e(i(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[17]||(t[17]=r(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><p>以下组件和类型均从 <code>@opentiny/tiny-robot</code> 导出：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { TrExtensionCard, TrExtensionCardGrid, TrExtensionManager } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ExtensionCardAction,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ExtensionCardGridItem,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ExtensionManagerItem,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ExtensionManagerTab,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span></code></pre></div><h3 id="extensionmanager-props" tabindex="-1">ExtensionManager Props <a class="header-anchor" href="#extensionmanager-props" aria-label="Permalink to &quot;ExtensionManager Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>tabs</code></td><td>标签页及其 Extension 数据；每个 tab 和 item 的 <code>id</code> 应稳定且唯一。</td><td><code>ExtensionManagerTab[]</code></td><td>—</td><td>是</td></tr><tr><td><code>active-tab</code></td><td>当前标签页，优先于 <code>default-active-tab</code>。无效值会显示第一个可用标签页，并触发 <code>update:active-tab</code> 通知父组件更新当前值。</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>default-active-tab</code></td><td>未设置 <code>active-tab</code> 时使用的初始标签页；无效值会自动改为第一个标签页。</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>title</code></td><td>头部标题；与 <code>header-actions</code> 都未提供时不渲染头部。</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>empty-text</code></td><td>没有可显示的标签页时显示的提示文字。</td><td><code>string</code></td><td><code>&#39;暂无内容&#39;</code></td><td>否</td></tr></tbody></table><h3 id="extensionmanager-events" tabindex="-1">ExtensionManager Events <a class="header-anchor" href="#extensionmanager-events" aria-label="Permalink to &quot;ExtensionManager Events&quot;">​</a></h3><p><code>update:active-tab</code> 和 <code>tab-change</code> 在受控、非受控模式下的更新方式不同，详见“交互与状态管理”。其他事件的状态变化和应用处理方式如下。</p><table tabindex="0"><thead><tr><th>事件名</th><th>触发时机</th><th>回调参数</th></tr></thead><tbody><tr><td><code>update:active-tab</code></td><td>用户选择不同标签页，或当前标签页因 <code>active-tab</code> / <code>tabs</code> 变化而改用其他标签页时。非受控模式初始化不会触发该事件。</td><td><code>(tabId: string | undefined) =&gt; void</code></td></tr><tr><td><code>tab-change</code></td><td>用户选择不同标签页后；在 <code>update:active-tab</code> 之后触发。</td><td><code>(event: ExtensionManagerTabChangeEvent) =&gt; void</code></td></tr><tr><td><code>section-toggle</code></td><td>组件更新分区展开状态后触发；<code>expanded</code> 是更新后的值，应用不需要再同步该状态。</td><td><code>(event: ExtensionManagerSectionToggleEvent) =&gt; void</code></td></tr><tr><td><code>action</code></td><td>默认 Card 的操作被触发时触发；组件不会修改 <code>tabs</code>，应用需要处理操作并更新数据。</td><td><code>(event: ExtensionManagerActionEvent) =&gt; void</code></td></tr><tr><td><code>name-click</code></td><td>默认 Card 名称被鼠标、Enter 或 Space 激活时触发；应用根据该事件决定如何打开详情。</td><td><code>(event: ExtensionManagerNameClickEvent) =&gt; void</code></td></tr></tbody></table><h3 id="extensionmanager-slots" tabindex="-1">ExtensionManager Slots <a class="header-anchor" href="#extensionmanager-slots" aria-label="Permalink to &quot;ExtensionManager Slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>用途</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>header-actions</code></td><td>扩展标题右侧的操作区。</td><td><code>—</code></td></tr><tr><td><code>tab</code></td><td>替换单个标签的内容。建议调用 <code>select()</code> 选择标签页，不要依赖内部 DOM。</td><td><code>{ tab: ExtensionManagerTab; active: boolean; select: () =&gt; void }</code></td></tr><tr><td><code>item</code></td><td>替换默认 Card。组件仍负责外层列表和条目顺序，并使用 <code>item.id</code> 标识条目；插槽内容需要自行实现 Card 的事件、键盘交互和 ARIA 语义。</td><td><code>{ tab: ExtensionManagerTab; sectionKey: ExtensionManagerSectionKey; item: ExtensionCardGridItem; index: number }</code></td></tr><tr><td><code>empty</code></td><td>替换当前标签页内空分区的内容。</td><td><code>{ tab: ExtensionManagerTab; sectionKey: ExtensionManagerSectionKey; title: string }</code></td></tr></tbody></table><h3 id="cardgrid-props" tabindex="-1">CardGrid Props <a class="header-anchor" href="#cardgrid-props" aria-label="Permalink to &quot;CardGrid Props&quot;">​</a></h3><p>以下 Card 配置按 <code>item</code> 字段、CardGrid Prop、Card 默认值的顺序生效。<code>0</code> 和 <code>false</code> 都是有效配置，不会继续使用下一层默认值。</p><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>有效默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>items</code></td><td>要渲染的卡片数据；每项都必须有稳定且唯一的 <code>id</code>。</td><td><code>ExtensionCardGridItem[]</code></td><td>—</td><td>是</td></tr><tr><td><code>empty-text</code></td><td><code>items</code> 为空且未提供 <code>empty</code> 插槽时的提示。</td><td><code>string</code></td><td><code>&#39;暂无内容&#39;</code></td><td>否</td></tr><tr><td><code>primary-actions-limit</code></td><td>item 未设置同名字段时，每个 Card 放入主操作区域的 action 数量。<code>0</code> 会将所有可见 action 放入更多操作菜单。</td><td><code>number</code></td><td><code>1</code></td><td>否</td></tr><tr><td><code>name-clickable</code></td><td>item 未设置同名字段时，Card 名称是否可以点击和键盘激活。</td><td><code>boolean</code></td><td><code>true</code></td><td>否</td></tr><tr><td><code>overflow-menu-label</code></td><td>item 未设置同名字段时，更多操作按钮的可访问名称和 <code>title</code>。</td><td><code>string</code></td><td><code>&#39;更多操作&#39;</code></td><td>否</td></tr><tr><td><code>overflow-menu-placement</code></td><td>item 未设置同名字段时，更多操作菜单的首选位置。空间不足时，组件可能切换到另一方向。</td><td><code>ExtensionCardOverflowMenuPlacement</code></td><td><code>&#39;bottom-end&#39;</code></td><td>否</td></tr><tr><td><code>overflow-menu-show-icons</code></td><td>item 未设置同名字段时，更多操作菜单是否显示 action 图标。</td><td><code>boolean</code></td><td><code>true</code></td><td>否</td></tr></tbody></table><h3 id="cardgrid-events" tabindex="-1">CardGrid Events <a class="header-anchor" href="#cardgrid-events" aria-label="Permalink to &quot;CardGrid Events&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>触发时机</th><th>回调参数</th></tr></thead><tbody><tr><td><code>action</code></td><td>默认 Card 的 action 被触发时，事件包含所属条目的 <code>itemId</code>。</td><td><code>(event: ExtensionCardGridActionEvent) =&gt; void</code></td></tr><tr><td><code>name-click</code></td><td>默认 Card 名称被激活时，事件包含所属条目的 <code>itemId</code>。</td><td><code>(event: ExtensionCardGridNameClickEvent) =&gt; void</code></td></tr></tbody></table><h3 id="cardgrid-slots" tabindex="-1">CardGrid Slots <a class="header-anchor" href="#cardgrid-slots" aria-label="Permalink to &quot;CardGrid Slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>用途</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>item</code></td><td>替换默认 Card。Grid 仍负责外层列表和条目顺序，并使用 <code>item.id</code> 标识条目；插槽内容不会自动触发 Grid 的 <code>action</code> 或 <code>name-click</code>。</td><td><code>{ item: ExtensionCardGridItem; index: number }</code></td></tr><tr><td><code>empty</code></td><td>替换空列表提示，优先于 <code>empty-text</code>。</td><td><code>—</code></td></tr></tbody></table><h3 id="card-props" tabindex="-1">Card Props <a class="header-anchor" href="#card-props" aria-label="Permalink to &quot;Card Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>name</code></td><td>卡片名称，也是图片 icon 的替代文本和进度条可访问名称。</td><td><code>string</code></td><td>—</td><td>是</td></tr><tr><td><code>description</code></td><td>名称下方的单行描述。</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>icon</code></td><td>图片 URL 或 Vue 组件；缺省时显示名称首字母占位。</td><td><code>string | Component</code></td><td>—</td><td>否</td></tr><tr><td><code>actions</code></td><td>action 列表。Card 先过滤 <code>hidden</code> 项，再划分主操作和更多操作。<code>disabled</code> 项保留原排列位置，但不会触发事件。action id 应在同一 Card 内唯一。</td><td><code>ExtensionCardAction[]</code></td><td><code>[]</code></td><td>否</td></tr><tr><td><code>primary-actions-limit</code></td><td>可见 action 中放入主操作区域的数量。负数按 <code>0</code> 处理，小数向下取整；<code>0</code> 表示所有可见 action 都进入更多操作菜单。</td><td><code>number</code></td><td><code>1</code></td><td>否</td></tr><tr><td><code>progress</code></td><td>数值进度会限制在 0–100；<code>&#39;indeterminate&#39;</code> 显示不确定进度。</td><td><code>number | &#39;indeterminate&#39;</code></td><td>—</td><td>否</td></tr><tr><td><code>name-clickable</code></td><td>是否将名称显示为可通过键盘激活的按钮。</td><td><code>boolean</code></td><td><code>true</code></td><td>否</td></tr><tr><td><code>overflow-menu-label</code></td><td>溢出菜单按钮的可访问名称和 title。</td><td><code>string</code></td><td><code>&#39;更多操作&#39;</code></td><td>否</td></tr><tr><td><code>overflow-menu-placement</code></td><td>更多操作菜单的首选位置，支持 <code>&#39;bottom-end&#39;</code> 和 <code>&#39;top-end&#39;</code>。首选方向空间不足时，组件可能切换到另一方向。</td><td><code>ExtensionCardOverflowMenuPlacement</code></td><td><code>&#39;bottom-end&#39;</code></td><td>否</td></tr><tr><td><code>overflow-menu-show-icons</code></td><td>是否在更多操作菜单中显示 action 图标。设为 <code>true</code> 且至少一个 action 有图标时，菜单会为所有 action 保留统一的图标列。</td><td><code>boolean</code></td><td><code>true</code></td><td>否</td></tr></tbody></table><h3 id="card-events" tabindex="-1">Card Events <a class="header-anchor" href="#card-events" aria-label="Permalink to &quot;Card Events&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>触发时机</th><th>回调参数</th></tr></thead><tbody><tr><td><code>action</code></td><td>可见且未禁用的 action 被触发时。switch 的 <code>checked</code> 是新值；只有 <code>primary-action</code> 插槽调用 <code>trigger(payload)</code> 时，参数才会进入事件的 <code>payload</code>。</td><td><code>(event: ExtensionCardActionEvent) =&gt; void</code></td></tr><tr><td><code>name-click</code></td><td>可点击名称被鼠标、Enter 或 Space 激活时。</td><td><code>(event: MouseEvent | KeyboardEvent) =&gt; void</code></td></tr></tbody></table><h3 id="card-slots" tabindex="-1">Card Slots <a class="header-anchor" href="#card-slots" aria-label="Permalink to &quot;Card Slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>用途</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>primary-action</code></td><td>自定义主操作区域中 <code>type: &#39;custom&#39;</code> 的 action。调用 <code>trigger(payload)</code> 会触发标准 <code>action</code> 事件；未提供插槽时显示普通按钮。该插槽不处理更多操作菜单中的 custom action。</td><td><code>{ action: ExtensionCardCustomAction; trigger: (payload?: unknown) =&gt; void }</code></td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><p>以下索引按组件分组。所有类型均从 <code>@opentiny/tiny-robot</code> 导出。</p><h4 id="card-types" tabindex="-1">Card Types <a class="header-anchor" href="#card-types" aria-label="Permalink to &quot;Card Types&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型名</th><th>类型或签名</th><th>说明</th></tr></thead><tbody><tr><td><code>ExtensionCardAction</code></td><td>union</td><td>Card 的 switch、button 和 custom action。</td></tr><tr><td><code>ExtensionCardActionBase</code></td><td>interface</td><td>所有 Card action 共有的标识、文案、图标和状态字段。</td></tr><tr><td><code>ExtensionCardSwitchAction</code></td><td>interface</td><td><code>checked</code> 值由应用提供的 switch action。</td></tr><tr><td><code>ExtensionCardButtonAction</code></td><td>interface</td><td>普通 button action。</td></tr><tr><td><code>ExtensionCardCustomAction</code></td><td>interface</td><td>可由 <code>primary-action</code> 插槽渲染的 custom action。</td></tr><tr><td><code>ExtensionCardRenderableAction</code></td><td>union</td><td>从每种 <code>ExtensionCardAction</code> 中移除 <code>hidden</code> 字段后得到的联合类型。</td></tr><tr><td><code>ExtensionCardActionEvent</code></td><td>interface</td><td>Card 触发 action 事件时提供的数据。</td></tr><tr><td><code>ExtensionCardProps</code></td><td>interface</td><td>Card 的公开 Props 类型。</td></tr><tr><td><code>ExtensionCardEmits</code></td><td>interface</td><td>Card 的公开事件类型。</td></tr><tr><td><code>ExtensionCardSlots</code></td><td>interface</td><td>Card 的公开插槽类型。</td></tr><tr><td><code>ExtensionCardOverflowMenuPlacement</code></td><td>union</td><td><code>&#39;bottom-end&#39; | &#39;top-end&#39;</code>。</td></tr></tbody></table><h4 id="cardgrid-types" tabindex="-1">CardGrid Types <a class="header-anchor" href="#cardgrid-types" aria-label="Permalink to &quot;CardGrid Types&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型名</th><th>类型或签名</th><th>说明</th></tr></thead><tbody><tr><td><code>ExtensionCardGridItem</code></td><td>type</td><td>带 <code>id</code> 的 Card 数据。</td></tr><tr><td><code>ExtensionCardGridActionEvent</code></td><td>interface</td><td>包含 <code>itemId</code> 和 Card action 的事件数据。</td></tr><tr><td><code>ExtensionCardGridNameClickEvent</code></td><td>interface</td><td>包含 <code>itemId</code> 和 Card name-click 原生事件的数据。</td></tr><tr><td><code>ExtensionCardGridProps</code></td><td>interface</td><td>CardGrid 的公开 Props 类型。</td></tr><tr><td><code>ExtensionCardGridEmits</code></td><td>interface</td><td>CardGrid 的公开事件类型。</td></tr><tr><td><code>ExtensionCardGridSlots</code></td><td>interface</td><td>CardGrid 的公开插槽类型。</td></tr></tbody></table><h4 id="extensionmanager-types" tabindex="-1">ExtensionManager Types <a class="header-anchor" href="#extensionmanager-types" aria-label="Permalink to &quot;ExtensionManager Types&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型名</th><th>类型或签名</th><th>说明</th></tr></thead><tbody><tr><td><code>ExtensionManagerItem</code></td><td>type</td><td><code>ExtensionManager</code> 接收的条目；在 Grid item 基础上增加分区和筛选字段。</td></tr><tr><td><code>ExtensionManagerTab</code></td><td>interface</td><td><code>ExtensionManager</code> 的标签页数据。</td></tr><tr><td><code>ExtensionManagerSectionKey</code></td><td>union</td><td><code>&#39;installed&#39; | &#39;available&#39;</code>。</td></tr><tr><td><code>ExtensionManagerTagOption</code></td><td>interface</td><td>组件根据当前数据生成的标签选项结构。</td></tr><tr><td><code>ExtensionManagerTabChangeEvent</code></td><td>interface</td><td>标签切换事件数据。</td></tr><tr><td><code>ExtensionManagerSectionToggleEvent</code></td><td>interface</td><td>分区折叠事件数据。</td></tr><tr><td><code>ExtensionManagerActionEvent</code></td><td>interface</td><td>包含标签页、分区、条目和 Card action 的事件数据。</td></tr><tr><td><code>ExtensionManagerNameClickEvent</code></td><td>interface</td><td>包含标签页、分区、条目和 Card name-click 原生事件的数据。</td></tr><tr><td><code>ExtensionManagerProps</code></td><td>interface</td><td><code>ExtensionManager</code> 的公开 Props 类型。</td></tr><tr><td><code>ExtensionManagerEmits</code></td><td>interface</td><td><code>ExtensionManager</code> 的公开事件类型。</td></tr><tr><td><code>ExtensionManagerSlots</code></td><td>interface</td><td><code>ExtensionManager</code> 的公开插槽类型。</td></tr></tbody></table><h4 id="核心数据与事件类型-节选" tabindex="-1">核心数据与事件类型（节选） <a class="header-anchor" href="#核心数据与事件类型-节选" aria-label="Permalink to &quot;核心数据与事件类型（节选）&quot;">​</a></h4><p>下面的代码块选择性展开 Card action、条目结构和事件 payload，便于理解它们之间的关系，并不是全部公开类型定义。Props、Events 和 Slots 的完整公开契约见前面的对应 API 表；未展开的类型仍可通过上面的 Types 索引查找。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { Component } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardOverflowMenuPlacement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;bottom-end&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;top-end&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardActionBase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  hidden</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  danger</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardSwitchAction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardActionBase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;switch&#39;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  checked</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardButtonAction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardActionBase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;button&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardCustomAction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardActionBase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;custom&#39;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unknown</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardAction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardSwitchAction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardButtonAction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardCustomAction</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DistributiveOmit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">K</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PropertyKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> T</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unknown</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ?</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Omit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">K</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> never</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardRenderableAction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DistributiveOmit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ExtensionCardAction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;hidden&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardActionEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardAction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;type&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  checked</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  payload</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unknown</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  actions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardAction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  primaryActionsLimit</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  progress</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;indeterminate&#39;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  nameClickable</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  overflowMenuLabel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  overflowMenuPlacement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardOverflowMenuPlacement</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  overflowMenuShowIcons</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardGridItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardProps</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardGridItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  installed</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tags</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerSectionKey</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;installed&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;available&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerTagOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerTab</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  items</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardGridActionEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  itemId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  action</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardActionEvent</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardGridNameClickEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  itemId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MouseEvent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> KeyboardEvent</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerTabChangeEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tabId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerSectionToggleEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tabId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  sectionKey</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerSectionKey</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  expanded</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerActionEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tabId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  sectionKey</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerSectionKey</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  itemId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  action</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionCardActionEvent</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerNameClickEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tabId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  sectionKey</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtensionManagerSectionKey</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  itemId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MouseEvent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> KeyboardEvent</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><code>ExtensionCardRenderableAction</code> 是从每种 <code>ExtensionCardAction</code> 中移除 <code>hidden</code> 字段后得到的联合类型。<code>ExtensionCardActionBase</code>、<code>ExtensionCardSwitchAction</code>、<code>ExtensionCardButtonAction</code> 和 <code>ExtensionCardCustomAction</code> 也从包根导出，字段与上面的完整 action 定义一致。<code>ExtensionManager</code> 的 <code>action</code> 通过 <code>tabId</code>、<code>sectionKey</code> 和 <code>itemId</code> 标记操作来自哪个条目，嵌套的 <code>action</code> 使用 Card 的完整事件结构。<code>name-click</code> 会提供原生鼠标或键盘事件，应用可以根据该事件打开详情或处理焦点。</p><h3 id="css-variables" tabindex="-1">CSS Variables <a class="header-anchor" href="#css-variables" aria-label="Permalink to &quot;CSS Variables&quot;">​</a></h3><p>下表仅列出当前作为公共定制接口的 CSS Variables。将这些变量设置在 Card、CardGrid 或其父级元素上，即可调整对应样式。未列出的组件内部变量不属于公共定制接口，不应依赖。</p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-extension-card-bg-color</code></td><td>Card 背景色。</td><td><code>var(--tr-container-bg-default-2)</code></td></tr><tr><td><code>--tr-extension-card-bg-color-hover</code></td><td>主操作按钮、默认图标占位、进度条轨道及更多操作按钮悬停背景色。</td><td><code>var(--tr-container-bg-hover)</code></td></tr><tr><td><code>--tr-extension-card-focus-color</code></td><td>可点击名称的 focus-visible 描边颜色。</td><td><code>var(--tr-text-primary)</code></td></tr><tr><td><code>--tr-extension-card-icon-color</code></td><td>更多操作按钮的三点图标颜色。</td><td><code>var(--tr-text-tertiary)</code></td></tr><tr><td><code>--tr-extension-card-switch-bg-color</code></td><td>未选中 switch 轨道颜色。</td><td><code>var(--tr-text-disabled)</code></td></tr><tr><td><code>--tr-extension-card-switch-bg-color-checked</code></td><td>选中 switch 轨道颜色。</td><td><code>var(--tr-color-primary)</code></td></tr><tr><td><code>--tr-extension-card-grid-card-min-width</code></td><td>CardGrid 每个响应式网格轨道的最小宽度。</td><td><code>320px</code></td></tr></tbody></table>`,38))])}}});export{V as __pageData,N as default};

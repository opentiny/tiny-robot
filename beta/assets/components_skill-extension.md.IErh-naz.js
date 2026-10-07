const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.C1W_-nSH.js","assets/chunks/theme.DWoXJ9L5.js","assets/chunks/framework.CSCYUGUn.js","assets/chunks/resolver-states.Djz9fV2i.js","assets/chunks/local-import.DlSDkb26.js","assets/chunks/basic.C2RWR6fi.js"])))=>i.map(i=>d[i]);
import{aD as o,bQ as r,aZ as E,aL as v,v as S,H as d,bL as p,bB as h,J as e,bk as i,bJ as a,G as c,b7 as k,aU as F}from"./chunks/framework.CSCYUGUn.js";import{L as u,N as m}from"./chunks/index.Dr3IFbIi.js";const _=`<script setup lang="ts">
import { TrSkillExtensionDetail } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

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
      size: 4,
      binary: new Uint8Array([137, 80, 78, 71]),
    },
  ],
}
<\/script>

<template>
  <tr-skill-extension-detail :definition="definition" updated-at="2026-07-10" />
</template>
`,x=`<script setup lang="ts">
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
`,C=`<script setup lang="ts">
import { ref } from 'vue'
import { TrSkillImportForm } from '@opentiny/tiny-robot'
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
  </section>
</template>
`,D=`<script setup lang="ts">
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
    <tr-skill-import-form :key="formKey" source="github" @submit="imported = $event" />
    <p aria-live="polite">应用收到：{{ imported?.name ?? '尚未导入' }}</p>
    <tr-skill-extension-detail v-if="imported" :definition="imported" />
  </section>
</template>

<style scoped>
.example-url {
  overflow-wrap: anywhere;
}
</style>
`,I=JSON.parse('{"title":"Skill 扩展导入与详情","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/skill-extension.md","filePath":"components/skill-extension.md"}'),B={name:"components/skill-extension.md"},q=Object.assign(B,{setup(A){const y=k();o(async()=>{y.value=(await r(async()=>{const{default:n}=await import("./chunks/basic.C1W_-nSH.js");return{default:n}},__vite__mapDeps([0,1,2]))).default});const b=k();o(async()=>{b.value=(await r(async()=>{const{default:n}=await import("./chunks/resolver-states.Djz9fV2i.js");return{default:n}},__vite__mapDeps([3,1,2]))).default});const g=k();o(async()=>{g.value=(await r(async()=>{const{default:n}=await import("./chunks/local-import.DlSDkb26.js");return{default:n}},__vite__mapDeps([4,1,2]))).default});const s=F(!0),f=k();return o(async()=>{f.value=(await r(async()=>{const{default:n}=await import("./chunks/basic.C2RWR6fi.js");return{default:n}},__vite__mapDeps([5,1,2]))).default}),(n,t)=>{const l=E("ClientOnly");return v(),S("div",null,[t[4]||(t[4]=d('<h1 id="skill-扩展导入与详情" tabindex="-1">Skill 扩展导入与详情 <a class="header-anchor" href="#skill-扩展导入与详情" aria-label="Permalink to &quot;Skill 扩展导入与详情&quot;">​</a></h1><p><code>SkillImportForm</code> 提供本地文件夹和 GitHub 两种 Skill 导入界面，并在解析成功后把 Skill 定义交给应用；<code>SkillExtensionDetail</code> 只读展示已取得的定义、说明和资源。应用可以将两者放在自己的页面、Dialog 或 Drawer 中，并自行决定数据来源、保存方式及容器行为。</p><h2 id="概览" tabindex="-1">概览 <a class="header-anchor" href="#概览" aria-label="Permalink to &quot;概览&quot;">​</a></h2><h3 id="适用场景" tabindex="-1">适用场景 <a class="header-anchor" href="#适用场景" aria-label="Permalink to &quot;适用场景&quot;">​</a></h3><ul><li>从本地文件夹或 GitHub 仓库路径取得一个 Skill 定义。</li><li>展示 Skill 的说明与资源清单，让用户了解已加载的内容。</li><li>与 <a href="./extension-manager.html">ExtensionManager</a> 组合时，由应用处理通用操作事件，打开对应界面并更新扩展列表。</li></ul><h3 id="职责边界" tabindex="-1">职责边界 <a class="header-anchor" href="#职责边界" aria-label="Permalink to &quot;职责边界&quot;">​</a></h3><p>导入表单管理输入、校验、解析中的加载状态和错误反馈；默认解析器由 kit 提供。<strong>解析不等于持久化</strong>：应用收到 Skill 定义后，仍需自行保存并更新扩展列表。详情组件只展示应用传入的定义，不读取资源内容或加载远程数据；弹窗标题、关闭和焦点管理由应用负责。</p><h2 id="快速开始" tabindex="-1">快速开始 <a class="header-anchor" href="#快速开始" aria-label="Permalink to &quot;快速开始&quot;">​</a></h2><p><code>@opentiny/tiny-robot-kit</code> 是组件库的 peer dependency。使用默认解析器前应安装两个包：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-kit</span></span></code></pre></div><p>下面的示例不传 <code>resolve-skill</code>，由组件使用 kit 默认解析器读取 GitHub 上的真实 Skill。复制示例地址并粘贴进 URL 输入框，点击“导入”后可查看解析出的名称、<code>SKILL.md</code> 正文和资源文件。示例需要能访问 GitHub；网络请求或限流失败时，表单会显示错误。导入结果只保存在当前页面内，刷新后不会保留。</p>',11)),p(e(i(u),null,null,512),[[h,s.value]]),e(l,null,{default:a(()=>[e(i(m),{title:"从 GitHub 地址导入",description:"使用 kit 默认解析器导入真实 Skill，并查看应用收到的定义。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{s.value=!1}),vueCode:i(D)},c({_:2},[f.value?{name:"vue",fn:a(()=>[e(i(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[5]||(t[5]=d(`<h2 id="用法示例" tabindex="-1">用法示例 <a class="header-anchor" href="#用法示例" aria-label="Permalink to &quot;用法示例&quot;">​</a></h2><h3 id="导入本地文件夹" tabindex="-1">导入本地文件夹 <a class="header-anchor" href="#导入本地文件夹" aria-label="Permalink to &quot;导入本地文件夹&quot;">​</a></h3><p><code>source=&quot;local&quot;</code> 时，用户选择或拖入一个包含根目录 <code>SKILL.md</code> 的文件夹。组件先检查目录结构及文件总大小，再立即调用解析器；解析成功后仍需点击“确定”才触发 <code>submit</code>。默认上限是 10 MB，可用 <code>max-upload-size</code> 调整。</p><p>可准备一个 <code>example-skill/SKILL.md</code> 文件来体验下面的 Demo：</p><div class="language-md vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">md</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">---</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name: example-skill</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">description: 用于试用 Skill 导入。</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">---</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;"># 使用说明</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">请总结输入文档的要点。</span></span></code></pre></div><p>此 Demo 使用 kit 默认解析器。移除已选择的文件夹可重新选择；“取消”只通知应用，不清空组件内部草稿。示例外部的“重置示例”可恢复初始界面。</p>`,6)),p(e(i(u),null,null,512),[[h,s.value]]),e(l,null,{default:a(()=>[e(i(m),{title:"本地文件夹与默认解析器",description:"选择包含 SKILL.md 的文件夹，确认后查看应用收到的定义。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{s.value=!1}),vueCode:i(C)},c({_:2},[g.value?{name:"vue",fn:a(()=>[e(i(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[6]||(t[6]=d('<h3 id="观察加载、失败与重试" tabindex="-1">观察加载、失败与重试 <a class="header-anchor" href="#观察加载、失败与重试" aria-label="Permalink to &quot;观察加载、失败与重试&quot;">​</a></h3><p><code>source=&quot;github&quot;</code> 接受带 Skill 子目录的 HTTPS GitHub <code>tree</code> 地址，或直接指向 <code>SKILL.md</code> 的 <code>blob</code> 地址。点击“导入”后，组件先把规范化的 <code>url</code> 和 <code>owner/repo</code> 形式的 <code>repo</code> 交给解析器；成功时直接触发 <code>submit</code>，失败时在组件内显示错误。默认解析器会查询仓库真实的分支和标签，按最长匹配确定 <code>ref</code> 与目录边界，也支持 40 位 commit SHA。自定义解析器若需要 <code>ref</code> 和目录，必须自行解析，或调用 kit 的加载能力。示例用手动完成的本地 Promise 展示加载、成功和失败，并可再次导入或重置。</p>',2)),p(e(i(u),null,null,512),[[h,s.value]]),e(l,null,{default:a(()=>[e(i(m),{title:"解析状态与重试",description:"控制本地解析结果，观察加载、错误、成功以及重试路径。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{s.value=!1}),vueCode:i(x)},c({_:2},[b.value?{name:"vue",fn:a(()=>[e(i(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[7]||(t[7]=d('<p>默认解析超时为 30 秒，可通过 <code>resolve-timeout</code> 调整；设为 <code>0</code> 表示不超时。超时后组件停止等待并忽略晚到结果，但不会取消已经发出的请求。切换 <code>source</code> 会清空组件内的文件选择、GitHub 地址和错误。若容器关闭后任务仍要继续，应用应自行持有任务并提供后续通知；组件卸载后不再显示解析反馈。</p><h3 id="查看-skill-详情" tabindex="-1">查看 Skill 详情 <a class="header-anchor" href="#查看-skill-详情" aria-label="Permalink to &quot;查看 Skill 详情&quot;">​</a></h3><p>将已取得的 <code>SkillDefinition</code> 传给 <code>SkillExtensionDetail</code>，即可显示名称、描述、<code>SKILL.md</code> 正文和资源路径。详情默认打开 <code>SKILL.md</code> 页签，用户可切换到“资源文件”查看清单。组件按 <code>resources.length</code> 显示数量，并列出每项的路径及可选大小；它不读取 <code>text</code>、<code>binary</code> 或惰性读取器的内容。</p>',3)),p(e(i(u),null,null,512),[[h,s.value]]),e(l,null,{default:a(()=>[e(i(m),{title:"展示 Skill 定义",description:"切换 SKILL.md 与资源文件页签，查看只读正文、资源路径和大小。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{s.value=!1}),vueCode:i(_)},c({_:2},[y.value?{name:"vue",fn:a(()=>[e(i(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[8]||(t[8]=d(`<h2 id="可访问性与设计约束" tabindex="-1">可访问性与设计约束 <a class="header-anchor" href="#可访问性与设计约束" aria-label="Permalink to &quot;可访问性与设计约束&quot;">​</a></h2><p>本地文件选择区支持键盘访问；移除文件夹后焦点回到上传入口。GitHub 地址无效时输入框会标记错误并获得焦点，解析错误以可见提示呈现。解析期间提交按钮不可用，用户可以在失败后修改输入并重试。</p><p>页签支持点击，以及左右方向键、Home 和 End 切换。<code>SKILL.md</code> 正文位于可聚焦、可滚动的只读编辑区，保留原有换行和空格。光标进入后可选中、复制，按 Ctrl+A（macOS 上按 Command+A）可全选正文；长文本可以用键盘阅读。资源清单也在自身区域内滚动，不会无限拉长详情。两处默认最大高度都是 <code>240px</code>，可用下方 CSS 变量调整。导入器将 YAML 头部解析为名称和描述，因此此处展示的是 <code>instructions</code> 正文。资源路径允许换行。详情只展示内容；页面或弹窗的标题、关闭按钮、焦点返回和持久化由宿主及应用负责。</p><h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><p>组件和以下类型均从 <code>@opentiny/tiny-robot</code> 导入；示例使用 <code>TrSkillImportForm</code>、<code>TrSkillExtensionDetail</code> 及对应的 <code>&lt;tr-skill-import-form&gt;</code>、<code>&lt;tr-skill-extension-detail&gt;</code> 标签。两个组件都没有公开 Slots 或 Expose 方法。</p><h3 id="skillimportform" tabindex="-1">SkillImportForm <a class="header-anchor" href="#skillimportform" aria-label="Permalink to &quot;SkillImportForm&quot;">​</a></h3><h4 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>source</code></td><td>导入来源；切换时重置组件内的草稿、解析结果和错误。</td><td><code>SkillImportFormSource</code></td><td><code>&#39;local&#39;</code></td><td>否</td></tr><tr><td><code>max-upload-size</code></td><td>本地文件夹允许的文件总字节数，超过时不调用解析器。</td><td><code>number</code></td><td><code>10485760</code>（10 MB）</td><td>否</td></tr><tr><td><code>resolve-timeout</code></td><td>解析超时毫秒数；<code>0</code> 表示不超时。超时不取消在途请求，但组件会忽略其晚到结果。</td><td><code>number</code></td><td><code>30000</code>（30 秒）</td><td>否</td></tr><tr><td><code>resolve-skill</code></td><td>自定义异步解析器；未提供时使用 kit 默认解析器，并在线解析 GitHub URL 中的真实 ref 与目录边界。</td><td><code>SkillResolver</code></td><td>kit 默认解析器</td><td>否</td></tr></tbody></table><h4 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>触发时机</th><th>回调参数</th></tr></thead><tbody><tr><td><code>submit</code></td><td>本地文件夹解析成功且用户点击“确定”，或 GitHub 地址解析成功后；应用需自行保存定义。</td><td><code>(definition: SkillDefinition) =&gt; void</code></td></tr><tr><td><code>cancel</code></td><td>用户在本地导入界面点击“取消”时；组件不自行关闭宿主或清空草稿。</td><td><code>() =&gt; void</code></td></tr></tbody></table><h4 id="css-variables" tabindex="-1">CSS Variables <a class="header-anchor" href="#css-variables" aria-label="Permalink to &quot;CSS Variables&quot;">​</a></h4><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-skill-import-form-primary-color</code></td><td>导入表单的强调色；未设置时跟随主题主文本色。</td><td><code>var(--tr-text-primary, #191919)</code></td></tr><tr><td><code>--tr-skill-import-form-primary-text-color</code></td><td>导入表单主按钮的文字色。</td><td><code>var(--tr-container-bg-default, #fff)</code></td></tr></tbody></table><h4 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型名</th><th>类型或签名</th><th>说明</th></tr></thead><tbody><tr><td><code>SkillFileKind</code></td><td>union</td><td><code>&#39;text&#39; | &#39;binary&#39;</code>。</td></tr><tr><td><code>SkillResourceDescriptor</code></td><td>union</td><td>资源路径、标识、元数据及按种类区分的内容读取方式。</td></tr><tr><td><code>SkillDefinition</code></td><td>interface</td><td>解析完成的 Skill 定义。</td></tr><tr><td><code>SkillImportFormSource</code></td><td>union</td><td><code>&#39;local&#39; | &#39;github&#39;</code>。</td></tr><tr><td><code>SkillImportFormInput</code></td><td>union</td><td>解析器收到的本地文件，或 GitHub URL 与仓库标识。</td></tr><tr><td><code>SkillResolver</code></td><td>function</td><td>接收 <code>SkillImportFormInput</code>，异步返回 <code>SkillDefinition</code>。</td></tr><tr><td><code>SkillImportFormProps</code></td><td>interface</td><td>导入组件的公开 Props。</td></tr><tr><td><code>SkillImportFormEmits</code></td><td>interface</td><td><code>submit</code> 和 <code>cancel</code> 的公开事件签名。</td></tr></tbody></table><p>以下是 <code>SkillDefinition</code>、<code>SkillImportFormInput</code> 与 <code>SkillResolver</code> 的完整定义：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SkillDefinition</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  instructions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  resources</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SkillResourceDescriptor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  metadata</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SkillImportFormInput</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;local&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">files</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> File</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;github&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">url</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">repo</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SkillResolver</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">input</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SkillImportFormInput</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SkillDefinition</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p><code>SkillResourceDescriptor</code> 的公共字段与按种类区分的内容要求如下。资源需要稳定的 <code>resourceId</code> 和相对路径 <code>path</code>；文本资源至少提供 <code>text</code> 或 <code>readText()</code>，二进制资源至少提供 <code>binary</code> 或 <code>readBinary()</code>。两种资源均可补充另一种内容表示。</p><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th><th>必填</th></tr></thead><tbody><tr><td><code>path</code></td><td><code>string</code></td><td>资源相对路径。</td><td>是</td></tr><tr><td><code>kind</code></td><td><code>SkillFileKind</code></td><td>文本或二进制种类。</td><td>是</td></tr><tr><td><code>resourceId</code></td><td><code>string</code></td><td>稳定的资源标识。</td><td>是</td></tr><tr><td><code>text</code> / <code>readText</code></td><td><code>string</code> / <code>() =&gt; Promise&lt;string&gt;</code></td><td>文本资源至少提供一种。</td><td>文本资源是</td></tr><tr><td><code>binary</code> / <code>readBinary</code></td><td><code>Uint8Array</code> / <code>() =&gt; Promise&lt;Uint8Array&gt;</code></td><td>二进制资源至少提供一种。</td><td>二进制资源是</td></tr><tr><td><code>mimeType</code></td><td><code>string</code></td><td>MIME 类型。</td><td>否</td></tr><tr><td><code>size</code></td><td><code>number</code></td><td>文件大小，字节。</td><td>否</td></tr><tr><td><code>lastModified</code></td><td><code>number</code></td><td>最后修改时间数值。</td><td>否</td></tr><tr><td><code>metadata</code></td><td><code>Record&lt;string, unknown&gt;</code></td><td>附加元数据。</td><td>否</td></tr></tbody></table><h3 id="skillextensiondetail" tabindex="-1">SkillExtensionDetail <a class="header-anchor" href="#skillextensiondetail" aria-label="Permalink to &quot;SkillExtensionDetail&quot;">​</a></h3><h4 id="props-1" tabindex="-1">Props <a class="header-anchor" href="#props-1" aria-label="Permalink to &quot;Props&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>definition</code></td><td>要展示的完整 Skill 定义；组件不加载或修改它。</td><td><code>SkillDefinition</code></td><td>—</td><td>是</td></tr><tr><td><code>updated-at</code></td><td>已格式化的更新时间文本；未提供时不显示。</td><td><code>string</code></td><td>—</td><td>否</td></tr></tbody></table><h4 id="types-1" tabindex="-1">Types <a class="header-anchor" href="#types-1" aria-label="Permalink to &quot;Types&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型名</th><th>类型或签名</th><th>说明</th></tr></thead><tbody><tr><td><code>SkillExtensionDetailProps</code></td><td>interface</td><td>详情的公开 Props。</td></tr></tbody></table><p><code>SkillExtensionDetail</code> 不触发公开事件；说明和资源都是只读内容。<code>updated-at</code> 只展示传入文本，不自行格式化日期。</p><h4 id="css-variables-1" tabindex="-1">CSS Variables <a class="header-anchor" href="#css-variables-1" aria-label="Permalink to &quot;CSS Variables&quot;">​</a></h4><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-skill-extension-detail-content-max-height</code></td><td><code>SKILL.md</code> 编辑区和资源清单各自的最大高度。</td><td><code>240px</code></td></tr></tbody></table><p>开发者可在组件或外层容器上设置此变量，例如：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-skill-extension-detail</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">definition</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">definition</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> style</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">--tr-skill-extension-detail-content-max-height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">320</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div>`,28))])}}});export{I as __pageData,q as default};

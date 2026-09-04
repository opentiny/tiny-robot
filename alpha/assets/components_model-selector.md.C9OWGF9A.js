const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/slots.CRzP72HT.js","assets/chunks/theme.Ch3P0qxO.js","assets/chunks/framework.B8Neh5gQ.js","assets/chunks/icon-trigger.C1UwrIPo.js","assets/chunks/variants.B3g6QXid.js","assets/chunks/reasoning-effort.poXdVKEt.js","assets/chunks/search-and-group.C2qPwoJN.js","assets/chunks/basic.C-JJoZ0w.js"])))=>i.map(i=>d[i]);
import{aD as o,bQ as r,aZ as C,aL as B,v as D,H as h,bL as p,bB as k,J as i,bk as e,bJ as n,G as c,w as l,I as A,b7 as g,aU as _}from"./chunks/framework.B8Neh5gQ.js";import{L as y,N as F}from"./chunks/index.DhKVcVs7.js";const x=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'

const model = shallowRef<string | null>('general-pro')

const models = [
  {
    value: 'general-pro',
    label: '通用模型 Pro',
    description: '适合问答、写作和代码生成',
    group: '推荐',
  },
  {
    value: 'reasoning-pro',
    label: '推理模型 Pro',
    description: '适合数学和复杂分析',
    group: '推荐',
  },
  {
    value: 'lightweight-model',
    label: '轻量模型',
    description: '低延迟，适合高频交互',
    group: '其他',
  },
] satisfies readonly ModelSelectorOption[]
<\/script>

<template>
  <div class="model-selector-slots-demo">
    <TrModelSelector
      v-model="model"
      :models="models"
      searchable
      search-placeholder="搜索模型"
      panel-class="model-selector-custom-panel"
    >
      <template #header="{ query }">
        <div class="model-selector-slots-demo__header">
          <strong>选择工作模型</strong>
          <small>{{ query ? \`正在搜索：\${query}\` : '根据当前任务选择合适的模型' }}</small>
        </div>
      </template>

      <template #item="{ option, selected }">
        <span class="model-selector-slots-demo__item">
          <span>
            <strong>{{ option.label }}</strong>
            <small>{{ option.description }}</small>
          </span>
          <span v-if="selected" class="model-selector-slots-demo__selected">当前</span>
        </span>
      </template>

      <template #empty="{ query }">
        <span class="model-selector-slots-demo__empty"> 没有找到“{{ query }}”，请尝试其他关键词。 </span>
      </template>

      <template #footer="{ option, close }">
        <div class="model-selector-slots-demo__footer">
          <small>已选择：{{ option?.label ?? '暂无' }}</small>
          <button type="button" @click="close">完成</button>
        </div>
      </template>
    </TrModelSelector>
  </div>
</template>

<style scoped>
.model-selector-slots-demo {
  display: flex;
  min-height: 120px;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-slots-demo__header,
.model-selector-slots-demo__item > span:first-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.model-selector-slots-demo__header small,
.model-selector-slots-demo__item small,
.model-selector-slots-demo__footer small,
.model-selector-slots-demo__empty {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.model-selector-slots-demo__item,
.model-selector-slots-demo__footer {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.model-selector-slots-demo__item strong,
.model-selector-slots-demo__item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-selector-slots-demo__selected {
  flex: 0 0 auto;
  color: var(--vp-c-brand-1);
  font-size: 12px;
}

.model-selector-slots-demo__footer button {
  min-height: 28px;
  padding: 3px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}
</style>
`,S=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('general-model')

const models = [
  { value: 'general-model', label: '通用模型' },
  { value: 'reasoning-model', label: '推理模型' },
  { value: 'lightweight-model', label: '轻量模型' },
] satisfies readonly ModelSelectorOption[]
<\/script>

<template>
  <div class="model-selector-trigger-demo">
    <TrModelSelector v-model="model" :models="models">
      <template #trigger="{ label, open }">
        <span class="model-selector-trigger-demo__content">
          <span class="model-selector-trigger-demo__badge" aria-hidden="true">AI</span>
          <span class="model-selector-trigger-demo__label">{{ label }}</span>
          <IconArrowDown
            class="model-selector-trigger-demo__arrow"
            :class="{ 'is-open': open }"
            aria-hidden="true"
            focusable="false"
          />
        </span>
      </template>
    </TrModelSelector>
  </div>
</template>

<style scoped>
.model-selector-trigger-demo {
  display: flex;
  min-height: 96px;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-trigger-demo__content {
  display: inline-flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.model-selector-trigger-demo__badge {
  display: inline-grid;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 7px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 10px;
  font-weight: 700;
}

.model-selector-trigger-demo__label {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-selector-trigger-demo__arrow {
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  transition: transform 0.18s ease;
}

.model-selector-trigger-demo__arrow.is-open {
  transform: rotate(180deg);
}

@media (max-width: 480px) {
  .model-selector-trigger-demo__label,
  .model-selector-trigger-demo__arrow {
    display: none;
  }
}
</style>
`,w=`<script setup lang="ts">
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'

const models = [
  { value: 'general-model', label: '通用模型' },
  { value: 'reasoning-model', label: '推理模型' },
] satisfies readonly ModelSelectorOption[]

const sizes = [
  { label: 'small', value: 'small' as const },
  { label: 'normal', value: 'normal' as const },
  { label: 'large', value: 'large' as const },
]

const variants = [
  { label: 'outline', value: 'outline' as const },
  { label: 'ghost', value: 'ghost' as const },
  { label: 'muted', value: 'muted' as const },
]
<\/script>

<template>
  <div class="model-selector-variants-demo">
    <section class="model-selector-variants-demo__group">
      <h4>尺寸</h4>
      <div class="model-selector-variants-demo__list">
        <div v-for="size in sizes" :key="size.value" class="model-selector-variants-demo__item">
          <span>{{ size.label }}</span>
          <TrModelSelector :models="models" default-value="general-model" :size="size.value" />
        </div>
      </div>
    </section>

    <section class="model-selector-variants-demo__group">
      <h4>外观</h4>
      <div class="model-selector-variants-demo__list">
        <div v-for="variant in variants" :key="variant.value" class="model-selector-variants-demo__item">
          <span>{{ variant.label }}</span>
          <TrModelSelector :models="models" default-value="general-model" :variant="variant.value" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.model-selector-variants-demo {
  display: grid;
  gap: 24px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-variants-demo__group {
  display: grid;
  gap: 12px;
}

.model-selector-variants-demo__group h4 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.model-selector-variants-demo__list {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
}

.model-selector-variants-demo__item {
  display: flex;
  min-width: 140px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.model-selector-variants-demo__item > span {
  color: var(--vp-c-text-2);
  font-size: 12px;
}
</style>
`,T=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'

const model = shallowRef<string | null>('reasoning-standard')
const reasoningEffort = shallowRef<string | null>('medium')

const models = [
  {
    value: 'reasoning-standard',
    label: '标准推理模型',
    description: '使用内置 Low、Medium、High 思考强度选项',
    reasoningEfforts: true,
  },
  {
    value: 'reasoning-custom',
    label: '自定义推理模型',
    description: '使用业务自定义的选项和值',
    reasoningEfforts: [
      { value: 'fast', label: '快速' },
      { value: 'balanced', label: '均衡' },
      { value: 'deep', label: '深度' },
      { value: 'max', label: '极致', disabled: true },
    ],
  },
  {
    value: 'general-model',
    label: '通用模型',
    description: '未声明思考强度',
  },
] satisfies readonly ModelSelectorOption[]
<\/script>

<template>
  <div class="model-selector-effort-demo">
    <TrModelSelector
      v-model="model"
      v-model:reasoning-effort="reasoningEffort"
      :models="models"
      reasoning-effort-label="思考强度"
    />
    <span aria-live="polite">当前值：{{ reasoningEffort ?? '未选择' }}</span>
  </div>
</template>

<style scoped>
.model-selector-effort-demo {
  display: flex;
  min-height: 120px;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-effort-demo span {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
`,M=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconAi, IconAtom, IconThink } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('general-pro')

const models = [
  {
    value: 'general-pro',
    label: '通用模型 Pro',
    description: '适合问答、写作和代码生成',
    group: '通用模型',
    icon: IconAi,
  },
  {
    value: 'general-fast',
    label: '通用模型 Fast',
    description: '低延迟，适合高频交互',
    group: '通用模型',
    icon: IconAtom,
  },
  {
    value: 'reasoning-pro',
    label: '推理模型 Pro',
    description: '适合数学和复杂分析',
    group: '推理模型',
    icon: IconThink,
  },
  {
    value: 'reasoning-preview',
    label: '推理模型 Preview',
    description: '当前工作区暂不可用',
    group: '推理模型',
    disabled: true,
    icon: IconThink,
  },
] satisfies readonly ModelSelectorOption[]
<\/script>

<template>
  <div class="model-selector-search-demo">
    <TrModelSelector v-model="model" :models="models" searchable search-placeholder="搜索名称、能力或分组" />
  </div>
</template>

<style scoped>
.model-selector-search-demo {
  display: flex;
  min-height: 120px;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}
</style>
`,q=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconAi, IconAtom, IconThink } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('general-model')

const models = [
  { value: 'general-model', label: '通用模型', icon: IconAi },
  { value: 'reasoning-model', label: '推理模型', icon: IconThink },
  { value: 'lightweight-model', label: '轻量模型', icon: IconAtom },
] satisfies readonly ModelSelectorOption[]
<\/script>

<template>
  <div class="model-selector-basic-demo">
    <TrModelSelector v-model="model" :models="models" />
    <span aria-live="polite">当前模型：{{ model }}</span>
  </div>
</template>

<style scoped>
.model-selector-basic-demo {
  display: flex;
  min-height: 96px;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-basic-demo span {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
`,I=JSON.parse('{"title":"ModelSelector 模型选择器","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/model-selector.md","filePath":"components/model-selector.md"}'),R={name:"components/model-selector.md"},V=Object.assign(R,{setup(P){const E=g();o(async()=>{E.value=(await r(async()=>{const{default:a}=await import("./chunks/slots.CRzP72HT.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const m=g();o(async()=>{m.value=(await r(async()=>{const{default:a}=await import("./chunks/icon-trigger.C1UwrIPo.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const u=g();o(async()=>{u.value=(await r(async()=>{const{default:a}=await import("./chunks/variants.B3g6QXid.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const b=g();o(async()=>{b.value=(await r(async()=>{const{default:a}=await import("./chunks/reasoning-effort.poXdVKEt.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const v=g();o(async()=>{v.value=(await r(async()=>{const{default:a}=await import("./chunks/search-and-group.C2qPwoJN.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const t=_(!0),f=g();return o(async()=>{f.value=(await r(async()=>{const{default:a}=await import("./chunks/basic.C-JJoZ0w.js");return{default:a}},__vite__mapDeps([7,1,2]))).default}),(a,s)=>{const d=C("ClientOnly");return B(),D("div",null,[s[6]||(s[6]=h('<h1 id="modelselector-模型选择器" tabindex="-1">ModelSelector 模型选择器 <a class="header-anchor" href="#modelselector-模型选择器" aria-label="Permalink to &quot;ModelSelector 模型选择器&quot;">​</a></h1><p>ModelSelector 用于从一组 AI 模型中选择当前模型。组件内置搜索、分组、禁用状态、思考强度、浮层定位和键盘操作，也支持通过插槽定制触发器与选项面板。</p><p>适合聊天输入区、模型配置表单或工作流工具栏等场景。模型目录、Provider 路由、价格、上下文长度和请求参数属于应用层业务逻辑。</p><div class="tip custom-block"><p class="custom-block-title">组件边界</p><p>ModelSelector 只展示传入的 <code>models</code> 并通知选择结果。它不会请求模型列表、判断模型能力，也不会把思考强度转换为 Provider 请求参数。</p></div><h2 id="基础用法" tabindex="-1">基础用法 <a class="header-anchor" href="#基础用法" aria-label="Permalink to &quot;基础用法&quot;">​</a></h2><p><code>models</code> 提供候选模型，<code>v-model</code> 绑定当前模型。每个模型最少包含唯一的 <code>value</code> 和用于展示的 <code>label</code>。</p>',6)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"基础用法",description:"models 与 v-model 的基础选择。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:e(q)},c({_:2},[f.value?{name:"vue",fn:n(()=>[i(e(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[7]||(s[7]=h('<h3 id="模型选项" tabindex="-1">模型选项 <a class="header-anchor" href="#模型选项" aria-label="Permalink to &quot;模型选项&quot;">​</a></h3><p>模型选项仅承载界面所需字段。价格、密钥和 Provider 参数等数据属于请求层业务逻辑。</p><table tabindex="0"><thead><tr><th>字段</th><th>必需</th><th>说明</th></tr></thead><tbody><tr><td><code>value</code></td><td>是</td><td>模型的稳定且唯一的标识</td></tr><tr><td><code>label</code></td><td>是</td><td>模型名称</td></tr><tr><td><code>description</code></td><td>否</td><td>模型能力、适用场景等辅助说明</td></tr><tr><td><code>icon</code></td><td>否</td><td>Vue 组件或图片 URL</td></tr><tr><td><code>disabled</code></td><td>否</td><td>是否保留展示但禁止选择</td></tr><tr><td><code>group</code></td><td>否</td><td>分组标识和分组标题</td></tr><tr><td><code>reasoningEfforts</code></td><td>否</td><td>当前模型支持的思考强度</td></tr></tbody></table><p>面板会根据选项内容收缩或展开，至少与触发器同宽，并受视口可用宽度限制。名称和描述所在文字列的默认最大宽度为 320px；面板打开期间可随更宽内容增长，不会因搜索过滤而收缩。</p><h2 id="搜索与分组" tabindex="-1">搜索与分组 <a class="header-anchor" href="#搜索与分组" aria-label="Permalink to &quot;搜索与分组&quot;">​</a></h2><p>模型数量较多时，<code>searchable</code> 可显示搜索框，<code>group</code> 可组织模型分组。禁用项仍会显示，但无法被选择。</p>',6)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"搜索与分组",description:"名称、描述、分组搜索与禁用状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{t.value=!1}),vueCode:e(M)},c({_:2},[v.value?{name:"vue",fn:n(()=>[i(e(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[8]||(s[8]=h(`<p>默认搜索不区分大小写，会匹配 <code>label</code>、<code>value</code>、<code>description</code> 和 <code>group</code>。未设置 <code>group</code> 的选项进入无标题分组。</p><p><code>filterMethod(query, option)</code> 可承载拼音、标签或其他业务搜索规则，并会完全替代内置搜索逻辑。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ModelSelectorFilterMethod } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> filterMethod</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFilterMethod</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">query</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> option.label.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toLocaleLowerCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">includes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(query.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">trim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toLocaleLowerCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="思考强度" tabindex="-1">思考强度 <a class="header-anchor" href="#思考强度" aria-label="Permalink to &quot;思考强度&quot;">​</a></h2><p><code>reasoningEfforts</code> 描述模型支持的思考强度，组件会在面板底部显示对应选项。<code>v-model:reasoning-effort</code> 绑定当前值。</p>`,5)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"思考强度",description:"内置选项、自定义选项与不支持思考强度的模型。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{t.value=!1}),vueCode:e(T)},c({_:2},[b.value?{name:"vue",fn:n(()=>[i(e(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[9]||(s[9]=h('<ul><li><code>true</code> 对应内置的 <code>Low</code>、<code>Medium</code>、<code>High</code>。</li><li>选项数组支持自定义 <code>value</code>、<code>label</code> 和 <code>disabled</code>。</li><li><code>false</code>、<code>undefined</code> 或空数组表示不显示思考强度。</li></ul><p>思考强度是独立状态。切换到不支持当前值的模型时，组件会保留该值，但不会在触发器或面板中显示为有效选项；切回支持它的模型后会恢复显示。组件不会自行清空业务状态。</p><div class="tip custom-block"><p class="custom-block-title">切换模型时不会重置</p><p>不同模型具有不同默认思考强度的场景，可由消费层监听模型变化并更新 <code>reasoningEffort</code>。</p></div><h2 id="尺寸与外观" tabindex="-1">尺寸与外观 <a class="header-anchor" href="#尺寸与外观" aria-label="Permalink to &quot;尺寸与外观&quot;">​</a></h2><p><code>size</code> 支持 <code>small</code>、<code>normal</code> 和 <code>large</code>；<code>variant</code> 控制触发器外观，支持 <code>outline</code>、<code>ghost</code> 和 <code>muted</code>。尺寸会改变触发器、字号与间距，不会将面板宽度固定为对应档位。</p>',5)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"尺寸与外观",description:"三种尺寸与三种外观的展示效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[3]||(s[3]=()=>{t.value=!1}),vueCode:e(w)},c({_:2},[u.value?{name:"vue",fn:n(()=>[i(e(u))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[10]||(s[10]=l("h2",{id:"自定义内容",tabindex:"-1"},[A("自定义内容 "),l("a",{class:"header-anchor",href:"#自定义内容","aria-label":'Permalink to "自定义内容"'},"​")],-1)),s[11]||(s[11]=l("p",null,"插槽只替换显示内容，选择、搜索、键盘操作和浮层定位仍由组件处理。",-1)),s[12]||(s[12]=l("h3",{id:"自定义触发器",tabindex:"-1"},[A("自定义触发器 "),l("a",{class:"header-anchor",href:"#自定义触发器","aria-label":'Permalink to "自定义触发器"'},"​")],-1)),s[13]||(s[13]=l("p",null,[l("code",null,"trigger"),A(" 插槽用于调整按钮内容，并提供当前选项、展示文本、展开状态和当前模型支持的思考强度。")],-1)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"自定义触发器",description:"模型标识、展开箭头与窄屏表现的定制效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[4]||(s[4]=()=>{t.value=!1}),vueCode:e(S)},c({_:2},[m.value?{name:"vue",fn:n(()=>[i(e(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[14]||(s[14]=h('<p>插槽会完整替换默认内容，因此图标、文本和展开状态均由插槽渲染。外层已经是真实的 <code>button</code>；内部嵌套按钮、链接或输入框会形成无效的交互元素结构。</p><h3 id="自定义选项面板" tabindex="-1">自定义选项面板 <a class="header-anchor" href="#自定义选项面板" aria-label="Permalink to &quot;自定义选项面板&quot;">​</a></h3><p><code>header</code>、<code>item</code>、<code>empty</code> 和 <code>footer</code> 分别对应面板头部、模型项、空状态和底部区域。</p>',3)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"自定义选项面板",description:"面板标题、模型项、空状态和底部操作区的定制效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[5]||(s[5]=()=>{t.value=!1}),vueCode:e(x)},c({_:2},[E.value?{name:"vue",fn:n(()=>[i(e(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[15]||(s[15]=h(`<p><code>item</code> 位于 <code>role=&quot;option&quot;</code> 内，适合非交互内容。<code>header</code> 和 <code>footer</code> 支持按钮、链接或表单控件；作用域中的 <code>close()</code> 用于请求关闭面板。</p><p><code>footer</code> 插槽会完整替换默认的思考强度区域。自定义 Footer 可通过 <code>reasoningEfforts</code>、<code>reasoningEffortOption</code> 和 <code>setReasoningEffort()</code> 保留思考强度选择能力。</p><h2 id="控制选中值与面板开关" tabindex="-1">控制选中值与面板开关 <a class="header-anchor" href="#控制选中值与面板开关" aria-label="Permalink to &quot;控制选中值与面板开关&quot;">​</a></h2><p>组件既支持初始值模式，也支持由消费层完全控制状态。状态模式在实例创建时确定，生命周期内切换模式会在开发环境触发警告。</p><h3 id="初始状态" tabindex="-1">初始状态 <a class="header-anchor" href="#初始状态" aria-label="Permalink to &quot;初始状态&quot;">​</a></h3><p><code>defaultValue</code>、<code>defaultReasoningEffort</code> 和 <code>defaultOpen</code> 只在初始化时使用。后续交互由组件维护内部状态。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrModelSelector</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  default-value</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;general-model&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  default-reasoning-effort</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;medium&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">default-open</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span></code></pre></div><h3 id="完全控制状态" tabindex="-1">完全控制状态 <a class="header-anchor" href="#完全控制状态" aria-label="Permalink to &quot;完全控制状态&quot;">​</a></h3><p><code>v-model</code> 和 <code>v-model:open</code> 对应完全受控模式，选中值和面板开关由消费层保存。<code>v-model</code> 会自动响应对应的 <code>update:*</code> 事件。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { shallowRef } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> model</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;general-model&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> open</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrModelSelector</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> v-model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">model</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> v-model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">open</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">open</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>未传入初始值时，组件显示 <code>placeholder</code>，不会自动选择第一项。当前值不存在或对应模型被移除时，组件保留原值并显示 <code>placeholder</code>，避免模型列表异步变化时替用户选择其他模型。</p><h2 id="键盘操作与无障碍" tabindex="-1">键盘操作与无障碍 <a class="header-anchor" href="#键盘操作与无障碍" aria-label="Permalink to &quot;键盘操作与无障碍&quot;">​</a></h2><table tabindex="0"><thead><tr><th>位置</th><th>按键</th><th>行为</th></tr></thead><tbody><tr><td>触发器</td><td><code>Enter</code></td><td>打开面板</td></tr><tr><td>触发器</td><td><code>Space</code></td><td>通过按钮原生点击行为打开或关闭面板</td></tr><tr><td>面板</td><td><code>Escape</code></td><td>关闭面板并恢复触发器焦点</td></tr><tr><td>搜索框或列表</td><td><code>ArrowDown</code> / <code>ArrowUp</code></td><td>跳过禁用项移动高亮</td></tr><tr><td>非搜索模式列表</td><td><code>Home</code> / <code>End</code></td><td>跳到首个或末个可用项</td></tr><tr><td>搜索框或列表</td><td><code>Enter</code></td><td>选择高亮项；输入法组合期间不会误选</td></tr><tr><td>非搜索模式列表</td><td><code>Space</code></td><td>选择高亮项</td></tr><tr><td>思考强度按钮</td><td><code>Enter</code> / <code>Space</code></td><td>选择思考强度，不关闭面板</td></tr></tbody></table><p>组件使用真实按钮以及 <code>combobox</code>、<code>listbox</code>、<code>option</code> 等 ARIA 语义。它不会拦截 <code>Tab</code> 或重排焦点；面板 Teleport 后，Tab 顺序由实际 DOM 位置决定。</p><p>自定义 <code>trigger</code> 和 <code>item</code> 适合非交互内容。<code>header</code> 或 <code>footer</code> 中新增控件的可访问名称与键盘行为由消费层提供。</p><h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><h4 id="选中值与开关状态" tabindex="-1">选中值与开关状态 <a class="header-anchor" href="#选中值与开关状态" aria-label="Permalink to &quot;选中值与开关状态&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>models</code></td><td><code>readonly ModelSelectorOption[]</code></td><td><code>[]</code></td><td>模型列表</td></tr><tr><td><code>modelValue</code></td><td><code>string | null</code></td><td><code>undefined</code></td><td>受控选中值；通过 <code>update:modelValue</code> 同步</td></tr><tr><td><code>defaultValue</code></td><td><code>string | null</code></td><td><code>null</code></td><td>非受控初始选中值</td></tr><tr><td><code>reasoningEffort</code></td><td><code>string | null</code></td><td><code>undefined</code></td><td>受控思考强度；通过 <code>update:reasoningEffort</code> 同步</td></tr><tr><td><code>defaultReasoningEffort</code></td><td><code>string | null</code></td><td><code>null</code></td><td>非受控初始思考强度</td></tr><tr><td><code>open</code></td><td><code>boolean</code></td><td><code>undefined</code></td><td>受控面板开关；通过 <code>update:open</code> 同步</td></tr><tr><td><code>defaultOpen</code></td><td><code>boolean</code></td><td><code>false</code></td><td>非受控初始面板开关</td></tr><tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td><td>禁用组件并保持面板关闭</td></tr></tbody></table><h4 id="搜索与文案" tabindex="-1">搜索与文案 <a class="header-anchor" href="#搜索与文案" aria-label="Permalink to &quot;搜索与文案&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>searchable</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否显示搜索框</td></tr><tr><td><code>placeholder</code></td><td><code>string</code></td><td><code>&#39;选择模型&#39;</code></td><td>没有匹配选中项时的触发器文本</td></tr><tr><td><code>searchPlaceholder</code></td><td><code>string</code></td><td><code>&#39;搜索模型&#39;</code></td><td>搜索框占位文本</td></tr><tr><td><code>emptyText</code></td><td><code>string</code></td><td><code>&#39;暂无可用模型&#39;</code></td><td>默认空状态文本</td></tr><tr><td><code>filterMethod</code></td><td><code>ModelSelectorFilterMethod</code></td><td>内置包含匹配</td><td>自定义搜索过滤函数</td></tr><tr><td><code>reasoningEffortLabel</code></td><td><code>string</code></td><td><code>&#39;Thinking&#39;</code></td><td>默认思考强度区域的可见标题</td></tr></tbody></table><h4 id="外观与浮层" tabindex="-1">外观与浮层 <a class="header-anchor" href="#外观与浮层" aria-label="Permalink to &quot;外观与浮层&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>variant</code></td><td><code>ModelSelectorVariant</code></td><td><code>&#39;outline&#39;</code></td><td>触发器外观</td></tr><tr><td><code>size</code></td><td><code>ModelSelectorSize</code></td><td><code>&#39;normal&#39;</code></td><td>触发器和面板尺寸</td></tr><tr><td><code>placement</code></td><td><code>Placement</code></td><td><code>&#39;bottom-start&#39;</code></td><td>Floating UI 浮层位置</td></tr><tr><td><code>offset</code></td><td><code>number</code></td><td><code>8</code></td><td>触发器与浮层的间距</td></tr><tr><td><code>appendTo</code></td><td><code>string | HTMLElement</code></td><td>当前 ShadowRoot 或 <code>document.body</code></td><td>Teleport 目标；选择器未命中时回退到默认目标</td></tr><tr><td><code>panelClass</code></td><td><code>ModelSelectorPanelClass</code></td><td>—</td><td>附加到面板根元素的 class</td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>update:modelValue</code></td><td><code>(value: string | null)</code></td><td>用户选择不同模型时请求更新选中值</td></tr><tr><td><code>change</code></td><td><code>(option: ModelSelectorOption)</code></td><td>用户选择不同模型后触发，返回完整选项</td></tr><tr><td><code>update:reasoningEffort</code></td><td><code>(value: string | null)</code></td><td>用户选择或清空思考强度时请求更新当前值</td></tr><tr><td><code>reasoning-effort-change</code></td><td><code>(option: ModelSelectorReasoningEffortOption | null)</code></td><td>思考强度请求变化后触发</td></tr><tr><td><code>update:open</code></td><td><code>(open: boolean)</code></td><td>请求更新面板开关</td></tr></tbody></table><p>事件只响应用户交互，初始化、外部赋值和更新 <code>models</code> 不会触发 <code>change</code>。选择模型时依次触发 <code>update:modelValue</code>、<code>change</code> 和 <code>update:open(false)</code>；选择思考强度时依次触发 <code>update:reasoningEffort</code> 和 <code>reasoning-effort-change</code>，并保持面板打开。</p><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>作用域参数</th><th>说明</th></tr></thead><tbody><tr><td><code>trigger</code></td><td><code>{ option, label, open, reasoningEffortOption }</code></td><td>替换触发器按钮内容</td></tr><tr><td><code>item</code></td><td><code>{ option, selected, highlighted }</code></td><td>自定义模型项内容</td></tr><tr><td><code>empty</code></td><td><code>{ query }</code></td><td>自定义空状态</td></tr><tr><td><code>header</code></td><td><code>{ option, query, close }</code></td><td>自定义面板头部</td></tr><tr><td><code>footer</code></td><td><code>{ option, query, close, reasoningEfforts, reasoningEffortOption, setReasoningEffort }</code></td><td>完整替换默认思考强度区域</td></tr></tbody></table><p><code>close()</code> 请求关闭面板，成功关闭后恢复触发器焦点。受控 <code>open</code> 未回写为 <code>false</code> 时，组件不会强制关闭。<code>reasoningEffortOption</code> 只返回当前模型真正支持的选项；已保存但不受支持的值会解析为 <code>null</code>。</p><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><p>以下类型均从 <code>@opentiny/tiny-robot</code> 导出：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { Placement } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@floating-ui/dom&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { Component, VNode } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorVariant</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;outline&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;ghost&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;muted&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSize</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;small&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;normal&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;large&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorPanelClass</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  readonly</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  readonly</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  readonly</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEfforts</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  group</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEfforts</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEfforts</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFilterMethod</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">query</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  models</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  modelValue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  defaultValue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEffort</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  defaultReasoningEffort</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  open</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  defaultOpen</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  searchable</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  placeholder</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  searchPlaceholder</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  emptyText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  filterMethod</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFilterMethod</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  variant</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorVariant</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  size</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSize</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  placement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Placement</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  offset</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  appendTo</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HTMLElement</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  panelClass</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorPanelClass</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEffortLabel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorTriggerSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  open</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEffortOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorItemSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  selected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  highlighted</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorEmptySlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  query</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  query</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  close</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFooterSlotProps</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEfforts</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEffortOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  setReasoningEffort</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSlots</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  trigger</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorTriggerSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  item</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorItemSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  empty</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorEmptySlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  header</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  footer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFooterSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorEmits</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;update:modelValue&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;change&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;update:reasoningEffort&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;reasoning-effort-change&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;update:open&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">open</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h3><p>面板默认通过 Teleport 挂载，定义在组件宿主元素上的局部变量不会自动继承到面板。<code>panelClass</code> 附加的类可承载单实例面板变量。</p><table tabindex="0"><thead><tr><th>变量名</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-model-selector-trigger-text-color</code></td><td><code>var(--tr-text-primary)</code></td><td>触发器文本颜色</td></tr><tr><td><code>--tr-model-selector-trigger-icon-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>触发器图标与箭头颜色</td></tr><tr><td><code>--tr-model-selector-trigger-effort-color</code></td><td><code>var(--tr-text-tertiary)</code></td><td>触发器思考强度文本颜色</td></tr><tr><td><code>--tr-model-selector-trigger-outline-bg</code></td><td><code>var(--tr-container-bg-default)</code></td><td>outline 背景</td></tr><tr><td><code>--tr-model-selector-trigger-outline-border</code></td><td><code>var(--tr-border-color-default)</code></td><td>outline 边框</td></tr><tr><td><code>--tr-model-selector-trigger-ghost-bg</code></td><td><code>transparent</code></td><td>ghost 背景</td></tr><tr><td><code>--tr-model-selector-trigger-ghost-border</code></td><td><code>transparent</code></td><td>ghost 边框</td></tr><tr><td><code>--tr-model-selector-trigger-muted-bg</code></td><td><code>var(--tr-container-bg-default-2)</code></td><td>muted 背景</td></tr><tr><td><code>--tr-model-selector-trigger-muted-border</code></td><td><code>transparent</code></td><td>muted 边框</td></tr><tr><td><code>--tr-model-selector-trigger-hover-bg</code></td><td><code>var(--tr-container-bg-hover)</code></td><td>触发器 hover/open 背景</td></tr><tr><td><code>--tr-model-selector-trigger-hover-border</code></td><td><code>var(--tr-border-color-hover)</code></td><td>触发器 hover/open 边框</td></tr><tr><td><code>--tr-model-selector-trigger-disabled-color</code></td><td><code>var(--tr-text-disabled)</code></td><td>触发器禁用颜色</td></tr><tr><td><code>--tr-model-selector-panel-bg</code></td><td><code>var(--tr-dropdown-menu-bg-color)</code></td><td>面板背景</td></tr><tr><td><code>--tr-model-selector-panel-border</code></td><td><code>var(--tr-border-color-default)</code></td><td>面板边框</td></tr><tr><td><code>--tr-model-selector-panel-shadow</code></td><td><code>var(--tr-dropdown-menu-box-shadow)</code></td><td>面板阴影</td></tr><tr><td><code>--tr-model-selector-divider-color</code></td><td><code>var(--tr-border-color-default)</code></td><td>Header、搜索框与 Footer 分隔线</td></tr><tr><td><code>--tr-model-selector-item-color</code></td><td><code>var(--tr-dropdown-menu-item-color)</code></td><td>选项文本颜色</td></tr><tr><td><code>--tr-model-selector-item-description-color</code></td><td><code>var(--tr-text-tertiary)</code></td><td>选项描述颜色</td></tr><tr><td><code>--tr-model-selector-option-text-max-width</code></td><td><code>320px</code></td><td>名称与描述所在文字列的最大宽度</td></tr><tr><td><code>--tr-model-selector-item-hover-bg</code></td><td><code>var(--tr-dropdown-menu-item-hover-bg-color)</code></td><td>选项 hover/highlight 背景</td></tr><tr><td><code>--tr-model-selector-item-selected-color</code></td><td><code>var(--tr-color-primary)</code></td><td>选中项强调色</td></tr><tr><td><code>--tr-model-selector-item-disabled-color</code></td><td><code>var(--tr-text-disabled)</code></td><td>禁用项颜色</td></tr><tr><td><code>--tr-model-selector-group-title-color</code></td><td><code>var(--tr-text-tertiary)</code></td><td>分组标题颜色</td></tr><tr><td><code>--tr-model-selector-empty-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>空状态颜色</td></tr><tr><td><code>--tr-model-selector-scrollbar-color</code></td><td><code>var(--tr-dropdown-menu-scrollbar-thumb-color)</code></td><td>列表滚动条颜色</td></tr><tr><td><code>--tr-model-selector-effort-label-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>思考强度标题颜色</td></tr><tr><td><code>--tr-model-selector-effort-option-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>思考强度选项文字颜色</td></tr><tr><td><code>--tr-model-selector-effort-option-border</code></td><td><code>var(--tr-border-color-default)</code></td><td>思考强度选项边框</td></tr><tr><td><code>--tr-model-selector-effort-option-bg</code></td><td><code>transparent</code></td><td>思考强度选项背景</td></tr><tr><td><code>--tr-model-selector-effort-option-hover-bg</code></td><td><code>var(--tr-container-bg-hover)</code></td><td>思考强度选项 hover 背景</td></tr><tr><td><code>--tr-model-selector-effort-option-active-color</code></td><td><code>var(--tr-color-primary)</code></td><td>思考强度激活文字颜色</td></tr><tr><td><code>--tr-model-selector-effort-option-active-border</code></td><td><code>var(--tr-color-primary)</code></td><td>思考强度激活边框</td></tr><tr><td><code>--tr-model-selector-effort-option-active-bg</code></td><td><code>color-mix(in srgb, var(--tr-color-primary) 12%, transparent)</code></td><td>思考强度激活背景</td></tr><tr><td><code>--tr-model-selector-effort-option-disabled-color</code></td><td><code>var(--tr-text-disabled)</code></td><td>思考强度禁用文字颜色</td></tr></tbody></table>`,35))])}}});export{I as __pageData,V as default};

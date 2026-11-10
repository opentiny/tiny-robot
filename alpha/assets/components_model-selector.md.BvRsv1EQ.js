const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/slots.CcJTImUP.js","assets/chunks/theme.BC57if2I.js","assets/chunks/framework.ByLjY7oa.js","assets/chunks/icon-trigger.DtoranNE.js","assets/chunks/trigger-text.bDZEireQ.js","assets/chunks/variants.CrbkfGIb.js","assets/chunks/reasoning-effort.nK5GuBsB.js","assets/chunks/search-and-group.-nT2NdHr.js","assets/chunks/basic.15S7oYLF.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as h,aZ as B,aL as D,v as _,H as u,bL as p,bB as k,J as e,bk as i,bJ as n,G as c,w as l,I as d,b7 as g,aU as x}from"./chunks/framework.ByLjY7oa.js";import{L as y,N as F}from"./chunks/index.BDdV77h7.js";const S=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'

const model = shallowRef<string | null>('general-pro')

const models = [
  {
    id: 'general-pro',
    label: '通用模型 Pro',
    description: '适合问答、写作和代码生成',
    group: '推荐',
    features: [{ key: 'search', label: '联网搜索', type: 'switch' }],
  },
  {
    id: 'reasoning-pro',
    label: '推理模型 Pro',
    description: '适合数学和复杂分析',
    group: '推荐',
  },
  {
    id: 'lightweight-model',
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
`,w=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('general-model')

const models = [
  { id: 'general-model', label: '通用模型' },
  { id: 'reasoning-model', label: '推理模型' },
  { id: 'lightweight-model', label: '轻量模型' },
] satisfies readonly ModelSelectorOption[]
<\/script>

<template>
  <div class="model-selector-trigger-demo">
    <TrModelSelector v-model="model" :models="models">
      <template #trigger="{ text, open }">
        <span class="model-selector-trigger-demo__content">
          <span class="model-selector-trigger-demo__badge" aria-hidden="true">AI</span>
          <span class="model-selector-trigger-demo__label">{{ text }}</span>
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
`,T=`<script setup lang="ts">
import { TrModelSelector, type ModelSelectorOption, type ModelSelectorTriggerTextContext } from '@opentiny/tiny-robot'

const models: ModelSelectorOption[] = [
  {
    id: 'general-model',
    label: '通用模型',
    features: [{ key: 'search', label: '联网搜索', type: 'switch' }],
  },
]

function renderTriggerText({ model, featureValues }: ModelSelectorTriggerTextContext) {
  return featureValues.search ? \`\${model.label} · 联网\` : model.label
}
<\/script>

<template>
  <TrModelSelector default-value="general-model" :models="models" :render-trigger-text="renderTriggerText" />
</template>
`,M=`<script setup lang="ts">
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'

const models = [
  { id: 'general-model', label: '通用模型' },
  { id: 'reasoning-model', label: '推理模型' },
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
`,V=`<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  TrModelSelector,
  type ModelSelectorSnapshot,
  type ModelSelectorFeatureValues,
  type ModelSelectorOption,
} from '@opentiny/tiny-robot'

const low = { value: 'low', label: '低' }
const high = { value: 'high', label: '高' }
const models: ModelSelectorOption[] = [
  {
    id: 'a',
    label: '模型 A',
    features: [
      {
        key: 'reasoning',
        label: '思考强度',
        type: 'select',
        defaultValue: 'off',
        options: [{ value: 'off', label: '关闭' }, low, high, { value: 'extra-high', label: '超高' }],
      },
      { key: 'search', label: '联网搜索', type: 'switch' },
    ],
  },
  {
    id: 'b',
    label: '模型 B',
    features: [{ key: 'reasoning', label: '思考强度', type: 'select', defaultValue: 'low', options: [low, high] }],
  },
  {
    id: 'c',
    label: '模型 C',
    features: [
      {
        key: 'reasoning',
        label: '思考强度',
        type: 'select',
        options: [{ value: 'blocked', label: '暂不可用', disabled: true }, low, high],
      },
      { key: 'format', label: '输出格式', type: 'select', options: [] },
    ],
  },
]

const initialFeatureValues = { reasoning: 'extra-high', search: true }
const featureValues = shallowRef<ModelSelectorFeatureValues>(initialFeatureValues)
const demoVersion = shallowRef(0)
const panelHost = shallowRef<HTMLElement>()

function handleChange(current: ModelSelectorSnapshot) {
  featureValues.value = current.featureValues
}

function reset() {
  demoVersion.value += 1
  featureValues.value = initialFeatureValues
}
<\/script>

<template>
  <div class="model-selector-feature-demo-container">
    <div class="model-selector-feature-demo">
      <div class="model-selector-feature-demo__result">
        <div>当前模型的有效值 · featureValues</div>
        <pre aria-live="polite">{{ JSON.stringify(featureValues, null, 2) }}</pre>
      </div>
      <div class="model-selector-feature-demo__actions">
        <TrModelSelector
          :key="demoVersion"
          default-value="a"
          :models="models"
          :default-feature-values="initialFeatureValues"
          :close-on-select="false"
          :append-to="panelHost"
          @change="handleChange"
        />
        <button type="button" @click="reset">重置示例</button>
        <div ref="panelHost" class="model-selector-feature-demo__panel" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-selector-feature-demo-container {
  container-type: inline-size;
}

.model-selector-feature-demo {
  display: flex;
  flex-flow: row-reverse wrap;
  align-items: flex-start;
  gap: 16px;
}

.model-selector-feature-demo__actions {
  display: flex;
  flex: 1 1 256px;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.model-selector-feature-demo__result {
  flex: 1 1 200px;
  min-width: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.model-selector-feature-demo__result pre {
  margin: 4px 0 0;
  padding: 8px 12px;
  overflow-wrap: anywhere;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  white-space: pre-wrap;
}

.model-selector-feature-demo__panel:empty {
  display: none;
}

.model-selector-feature-demo__panel {
  position: absolute;
}

@container (width < 472px) {
  .model-selector-feature-demo__panel {
    position: static;
    flex-basis: 100%;
    min-width: 0;
  }

  .model-selector-feature-demo__panel :deep(.tr-model-selector__dropdown-wrapper) {
    position: static;
    max-width: 100% !important;
  }

  .model-selector-feature-demo__panel :deep(.tr-model-selector__panel) {
    --tr-model-selector-available-height: min(480px, 75vh);
    --tr-model-selector-available-width: 100%;
  }
}
</style>
`,q=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconAi, IconAtom, IconThink } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('general-pro')

const models = [
  {
    id: 'general-pro',
    label: '通用模型 Pro',
    description: '适合问答、写作和代码生成',
    group: '通用模型',
    icon: IconAi,
  },
  {
    id: 'general-fast',
    label: '通用模型 Fast',
    description: '低延迟，适合高频交互',
    group: '通用模型',
    icon: IconAtom,
  },
  {
    id: 'reasoning-pro',
    label: '推理模型 Pro',
    description: '适合数学和复杂分析',
    group: '推理模型',
    icon: IconThink,
  },
  {
    id: 'reasoning-preview',
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
`,W=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconAi, IconAtom, IconThink } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('general-model')

const models = [
  { id: 'general-model', label: '通用模型', icon: IconAi },
  { id: 'reasoning-model', label: '推理模型', icon: IconThink },
  { id: 'lightweight-model', label: '轻量模型', icon: IconAtom },
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
`,L=JSON.parse('{"title":"ModelSelector 模型选择器","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/model-selector.md","filePath":"components/model-selector.md"}'),Z={name:"components/model-selector.md"},X=Object.assign(Z,{setup(R){const E=g();r(async()=>{E.value=(await h(async()=>{const{default:a}=await import("./chunks/slots.CcJTImUP.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const m=g();r(async()=>{m.value=(await h(async()=>{const{default:a}=await import("./chunks/icon-trigger.DtoranNE.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const b=g();r(async()=>{b.value=(await h(async()=>{const{default:a}=await import("./chunks/trigger-text.bDZEireQ.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const v=g();r(async()=>{v.value=(await h(async()=>{const{default:a}=await import("./chunks/variants.CrbkfGIb.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const A=g();r(async()=>{A.value=(await h(async()=>{const{default:a}=await import("./chunks/reasoning-effort.nK5GuBsB.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const f=g();r(async()=>{f.value=(await h(async()=>{const{default:a}=await import("./chunks/search-and-group.-nT2NdHr.js");return{default:a}},__vite__mapDeps([7,1,2]))).default});const t=x(!0),C=g();return r(async()=>{C.value=(await h(async()=>{const{default:a}=await import("./chunks/basic.15S7oYLF.js");return{default:a}},__vite__mapDeps([8,1,2]))).default}),(a,s)=>{const o=B("ClientOnly");return D(),_("div",null,[s[7]||(s[7]=u('<h1 id="modelselector-模型选择器" tabindex="-1">ModelSelector 模型选择器 <a class="header-anchor" href="#modelselector-模型选择器" aria-label="Permalink to &quot;ModelSelector 模型选择器&quot;">​</a></h1><p>ModelSelector 用于选择 AI 模型，并根据 <code>features</code> 展示开关和选项。组件支持搜索、分组、禁用状态、浮层定位、键盘操作和自定义插槽。</p><p>适合聊天输入区、模型配置表单或工作流工具栏等场景。模型目录、Provider 路由、价格、上下文长度和请求参数属于应用层业务逻辑。</p><div class="tip custom-block"><p class="custom-block-title">组件边界</p><p>应用提供模型列表和每个模型支持的设置项。ModelSelector 展示这些设置，并在用户操作时通知应用。应用可以根据所选模型和设置值生成请求参数。</p></div><h2 id="基础用法" tabindex="-1">基础用法 <a class="header-anchor" href="#基础用法" aria-label="Permalink to &quot;基础用法&quot;">​</a></h2><p><code>models</code> 提供候选模型，<code>v-model</code> 绑定当前模型。每个模型最少包含唯一的 <code>id</code> 和用于展示的 <code>label</code>。</p>',6)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"基础用法",description:"models 与 v-model 的基础选择。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:i(W)},c({_:2},[C.value?{name:"vue",fn:n(()=>[e(i(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[8]||(s[8]=u('<h3 id="模型选项" tabindex="-1">模型选项 <a class="header-anchor" href="#模型选项" aria-label="Permalink to &quot;模型选项&quot;">​</a></h3><p>模型选项仅承载界面所需字段。价格、密钥和 Provider 参数等数据属于请求层业务逻辑。</p><table tabindex="0"><thead><tr><th>字段</th><th>必需</th><th>说明</th></tr></thead><tbody><tr><td><code>id</code></td><td>是</td><td>模型的稳定且唯一的标识</td></tr><tr><td><code>label</code></td><td>是</td><td>模型名称</td></tr><tr><td><code>description</code></td><td>否</td><td>模型能力、适用场景等辅助说明</td></tr><tr><td><code>icon</code></td><td>否</td><td>Vue 组件或图片 URL</td></tr><tr><td><code>disabled</code></td><td>否</td><td>是否保留展示但禁止选择</td></tr><tr><td><code>group</code></td><td>否</td><td>分组标识和分组标题</td></tr><tr><td><code>features</code></td><td>否</td><td>当前模型的开关和选择字段；空数组不展示字段</td></tr></tbody></table><p>面板会根据选项内容收缩或展开，至少与触发器同宽，并受视口可用宽度限制。名称和描述所在文字列的默认最大宽度为 320px；面板打开期间可随更宽内容增长，不会因搜索过滤而收缩。</p><h2 id="搜索与分组" tabindex="-1">搜索与分组 <a class="header-anchor" href="#搜索与分组" aria-label="Permalink to &quot;搜索与分组&quot;">​</a></h2><p>模型数量较多时，<code>searchable</code> 可显示搜索框，<code>group</code> 可组织模型分组。禁用项仍会显示，但无法被选择。</p>',6)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"搜索与分组",description:"名称、描述、分组搜索与禁用状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{t.value=!1}),vueCode:i(q)},c({_:2},[f.value?{name:"vue",fn:n(()=>[e(i(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[9]||(s[9]=u(`<p>默认搜索不区分大小写，会匹配 <code>label</code>、<code>id</code>、<code>description</code> 和 <code>group</code>。未设置 <code>group</code> 的选项进入无标题分组。</p><p><code>filterMethod(query, option)</code> 可承载拼音、标签或其他业务搜索规则，并会完全替代内置搜索逻辑。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ModelSelectorFilterMethod } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> filterMethod</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFilterMethod</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">query</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> option.label.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toLocaleLowerCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">includes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(query.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">trim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toLocaleLowerCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="模型特性字段" tabindex="-1">模型特性字段 <a class="header-anchor" href="#模型特性字段" aria-label="Permalink to &quot;模型特性字段&quot;">​</a></h2><p>通过 <code>models[].features</code> 声明模型支持的设置，例如思考强度或联网搜索。切换模型时，相同 <code>key</code> 的设置会沿用新模型支持的值。</p>`,5)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"模型特性字段",description:"切换模型或修改设置，查看当前模型的设置值（featureValues）。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{t.value=!1}),vueCode:i(V)},c({_:2},[A.value?{name:"vue",fn:n(()=>[e(i(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[10]||(s[10]=u('<p>由应用将设置值转换为请求参数。<a href="./../suites/chat-runtime.html#模型功能">查看 DeepSeek 和百炼 Qwen3.7 的映射示例</a></p><h2 id="尺寸与外观" tabindex="-1">尺寸与外观 <a class="header-anchor" href="#尺寸与外观" aria-label="Permalink to &quot;尺寸与外观&quot;">​</a></h2><p><code>size</code> 支持 <code>small</code>、<code>normal</code> 和 <code>large</code>；<code>variant</code> 控制触发器外观，支持 <code>outline</code>、<code>ghost</code> 和 <code>muted</code>。尺寸会改变触发器、字号与间距，不会将面板宽度固定为对应档位。</p>',3)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"尺寸与外观",description:"三种尺寸与三种外观的展示效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[3]||(s[3]=()=>{t.value=!1}),vueCode:i(M)},c({_:2},[v.value?{name:"vue",fn:n(()=>[e(i(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[11]||(s[11]=l("h2",{id:"自定义内容",tabindex:"-1"},[d("自定义内容 "),l("a",{class:"header-anchor",href:"#自定义内容","aria-label":'Permalink to "自定义内容"'},"​")],-1)),s[12]||(s[12]=l("p",null,"插槽只替换显示内容，选择、搜索、键盘操作和浮层定位仍由组件处理。",-1)),s[13]||(s[13]=l("h3",{id:"自定义触发器文本",tabindex:"-1"},[d("自定义触发器文本 "),l("a",{class:"header-anchor",href:"#自定义触发器文本","aria-label":'Permalink to "自定义触发器文本"'},"​")],-1)),s[14]||(s[14]=l("p",null,[d("用 "),l("code",null,"renderTriggerText({ model, featureValues })"),d(" 自定义按钮文字。返回的文字也用作悬浮提示和无障碍名称。")],-1)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"自定义触发器文本",description:"打开「联网搜索」，按钮文字会变为「通用模型 · 联网」。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[4]||(s[4]=()=>{t.value=!1}),vueCode:i(T)},c({_:2},[b.value?{name:"vue",fn:n(()=>[e(i(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[15]||(s[15]=l("h3",{id:"自定义触发器",tabindex:"-1"},[d("自定义触发器 "),l("a",{class:"header-anchor",href:"#自定义触发器","aria-label":'Permalink to "自定义触发器"'},"​")],-1)),s[16]||(s[16]=l("p",null,[l("code",null,"trigger"),d(" 插槽提供当前模型、模型名称、展开状态、有效设置值和 "),l("code",null,"text"),d("。自定义按钮内容时，可以用 "),l("code",null,"text"),d(" 显示文字，让它与按钮的悬浮提示和无障碍名称一致。")],-1)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"自定义触发器",description:"模型标识、展开箭头与窄屏表现的定制效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[5]||(s[5]=()=>{t.value=!1}),vueCode:i(w)},c({_:2},[m.value?{name:"vue",fn:n(()=>[e(i(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[17]||(s[17]=u('<p>插槽会完整替换默认内容，因此图标、文本和展开状态均由插槽渲染。外层已经是真实的 <code>button</code>；内部嵌套按钮、链接或输入框会形成无效的交互元素结构。</p><h3 id="自定义选项面板" tabindex="-1">自定义选项面板 <a class="header-anchor" href="#自定义选项面板" aria-label="Permalink to &quot;自定义选项面板&quot;">​</a></h3><p><code>header</code>、<code>item</code>、<code>empty</code> 和 <code>footer</code> 分别对应面板头部、模型项、空状态和底部区域。</p>',3)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"自定义选项面板",description:"面板标题、模型项、空状态和底部操作区的定制效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[6]||(s[6]=()=>{t.value=!1}),vueCode:i(S)},c({_:2},[E.value?{name:"vue",fn:n(()=>[e(i(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[18]||(s[18]=u(`<p><code>item</code> 位于 <code>role=&quot;option&quot;</code> 内，适合非交互内容。<code>header</code> 和 <code>footer</code> 支持按钮、链接或表单控件；作用域中的 <code>close()</code> 用于关闭面板。</p><p><code>footer</code> 完整替换默认字段区，提供 <code>option</code>、<code>values</code>、<code>setFeatureValue(key, value)</code>、<code>disabled</code> 和 <code>close()</code>。字段区位于模型列表之外。</p><h2 id="控制选中值与面板开关" tabindex="-1">控制选中值与面板开关 <a class="header-anchor" href="#控制选中值与面板开关" aria-label="Permalink to &quot;控制选中值与面板开关&quot;">​</a></h2><p>组件既支持初始值模式，也支持由消费层完全控制状态。状态模式在实例创建时确定，生命周期内切换模式会在开发环境触发警告。</p><h3 id="初始状态" tabindex="-1">初始状态 <a class="header-anchor" href="#初始状态" aria-label="Permalink to &quot;初始状态&quot;">​</a></h3><p><code>defaultValue</code> 和 <code>defaultOpen</code> 只在初始化时使用。后续交互由组件维护内部状态。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrModelSelector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> default-value</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;general-model&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">default-open</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><h3 id="完全控制状态" tabindex="-1">完全控制状态 <a class="header-anchor" href="#完全控制状态" aria-label="Permalink to &quot;完全控制状态&quot;">​</a></h3><p><code>v-model</code> 和 <code>v-model:open</code> 对应完全受控模式，选中值和面板开关由消费层保存。<code>v-model</code> 会自动响应对应的 <code>update:*</code> 事件。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { shallowRef } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> model</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;general-model&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> open</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrModelSelector</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> v-model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">model</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> v-model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">open</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">open</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>未传入初始值时，组件显示 <code>placeholder</code>，不会自动选择第一项。当前值不存在或对应模型被移除时，组件保留原值并显示 <code>placeholder</code>，避免模型列表异步变化时替用户选择其他模型。</p><h3 id="设置值" tabindex="-1">设置值 <a class="header-anchor" href="#设置值" aria-label="Permalink to &quot;设置值&quot;">​</a></h3><p>切换模型后，原值不可用时采用该设置项的有效默认值。未配置有效默认值时，开关用 <code>false</code>，选择框用第一个可用选项。不支持或没有可用值的设置项会从 <code>featureValues</code> 中省略。</p><ul><li>由组件管理时，用 <code>defaultFeatureValues</code> 设置初始值。组件会保存用户选择和回退后的值。</li><li>由应用管理时，传入 <code>featureValues</code>，再根据 <code>change</code> 事件更新。若要保留其他模型才支持的设置，将 <code>current.featureValues</code> 合并到原有设置中。</li></ul><h2 id="键盘操作与无障碍" tabindex="-1">键盘操作与无障碍 <a class="header-anchor" href="#键盘操作与无障碍" aria-label="Permalink to &quot;键盘操作与无障碍&quot;">​</a></h2><table tabindex="0"><thead><tr><th>位置</th><th>按键</th><th>行为</th></tr></thead><tbody><tr><td>触发器</td><td><code>Enter</code></td><td>打开面板</td></tr><tr><td>触发器</td><td><code>Space</code></td><td>通过按钮原生点击行为打开或关闭面板</td></tr><tr><td>面板</td><td><code>Escape</code></td><td>关闭面板并恢复触发器焦点</td></tr><tr><td>搜索框或列表</td><td><code>ArrowDown</code> / <code>ArrowUp</code></td><td>跳过禁用项移动高亮</td></tr><tr><td>非搜索模式列表</td><td><code>Home</code> / <code>End</code></td><td>跳到首个或末个可用项</td></tr><tr><td>搜索框或列表</td><td><code>Enter</code></td><td>选择高亮项；是否关闭由 <code>closeOnSelect</code> 决定；输入法组合期间不会误选</td></tr><tr><td>非搜索模式列表</td><td><code>Space</code></td><td>选择高亮项；是否关闭由 <code>closeOnSelect</code> 决定</td></tr><tr><td>字段控件</td><td><code>Enter</code> / <code>Space</code></td><td>修改字段值</td></tr></tbody></table><p>组件使用真实按钮以及 <code>combobox</code>、<code>listbox</code>、<code>option</code> 等 ARIA 语义。它不会拦截 <code>Tab</code> 或重排焦点；面板 Teleport 后，Tab 顺序由实际 DOM 位置决定。</p><p>自定义 <code>trigger</code> 和 <code>item</code> 适合非交互内容。<code>header</code> 或 <code>footer</code> 中新增控件的可访问名称与键盘行为由消费层提供。</p><h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><h4 id="选中值与开关状态" tabindex="-1">选中值与开关状态 <a class="header-anchor" href="#选中值与开关状态" aria-label="Permalink to &quot;选中值与开关状态&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>models</code></td><td><code>readonly ModelSelectorOption[]</code></td><td><code>[]</code></td><td>模型列表</td></tr><tr><td><code>featureValues</code></td><td><code>ModelSelectorFeatureValues</code></td><td><code>undefined</code></td><td>当前模型的受控功能值</td></tr><tr><td><code>defaultFeatureValues</code></td><td><code>ModelSelectorFeatureValues</code></td><td><code>{}</code></td><td>由组件管理时的初始功能值</td></tr><tr><td><code>modelValue</code></td><td><code>string | null</code></td><td><code>undefined</code></td><td>受控选中值；通过 <code>update:modelValue</code> 同步</td></tr><tr><td><code>defaultValue</code></td><td><code>string | null</code></td><td><code>null</code></td><td>非受控初始选中值</td></tr><tr><td><code>open</code></td><td><code>boolean</code></td><td><code>undefined</code></td><td>受控面板开关；通过 <code>update:open</code> 同步</td></tr><tr><td><code>defaultOpen</code></td><td><code>boolean</code></td><td><code>false</code></td><td>非受控初始面板开关</td></tr><tr><td><code>closeOnSelect</code></td><td><code>boolean</code></td><td><code>true</code></td><td>选择模型后是否自动关闭面板</td></tr><tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td><td>禁用组件并保持面板关闭</td></tr></tbody></table><h4 id="搜索与文案" tabindex="-1">搜索与文案 <a class="header-anchor" href="#搜索与文案" aria-label="Permalink to &quot;搜索与文案&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>searchable</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否显示搜索框</td></tr><tr><td><code>placeholder</code></td><td><code>string</code></td><td><code>&#39;选择模型&#39;</code></td><td>没有匹配选中项时的触发器文本</td></tr><tr><td><code>searchPlaceholder</code></td><td><code>string</code></td><td><code>&#39;搜索模型&#39;</code></td><td>搜索框占位文本</td></tr><tr><td><code>emptyText</code></td><td><code>string</code></td><td><code>&#39;暂无可用模型&#39;</code></td><td>默认空状态文本</td></tr><tr><td><code>renderTriggerText</code></td><td><code>(context: ModelSelectorTriggerTextContext) =&gt; string</code></td><td><code>undefined</code></td><td>自定义触发器文字。未传入函数或返回空字符串时显示模型名称</td></tr><tr><td><code>filterMethod</code></td><td><code>ModelSelectorFilterMethod</code></td><td>内置包含匹配</td><td>自定义搜索过滤函数</td></tr></tbody></table><h4 id="外观与浮层" tabindex="-1">外观与浮层 <a class="header-anchor" href="#外观与浮层" aria-label="Permalink to &quot;外观与浮层&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>variant</code></td><td><code>ModelSelectorVariant</code></td><td><code>&#39;outline&#39;</code></td><td>触发器外观</td></tr><tr><td><code>size</code></td><td><code>ModelSelectorSize</code></td><td><code>&#39;normal&#39;</code></td><td>触发器和面板尺寸</td></tr><tr><td><code>placement</code></td><td><code>Placement</code></td><td><code>&#39;bottom-start&#39;</code></td><td>Floating UI 浮层位置</td></tr><tr><td><code>offset</code></td><td><code>number</code></td><td><code>8</code></td><td>触发器与浮层的间距</td></tr><tr><td><code>appendTo</code></td><td><code>string | HTMLElement</code></td><td>当前 ShadowRoot 或 <code>document.body</code></td><td>Teleport 目标；选择器未命中时回退到默认目标</td></tr><tr><td><code>panelClass</code></td><td><code>ModelSelectorPanelClass</code></td><td>—</td><td>附加到面板根元素的 class</td></tr></tbody></table><p>未设置 <code>appendTo</code> 时，floating Layout 中的选择器使用所属窗口的 overlay host；其他场景使用当前 ShadowRoot 或 <code>document.body</code>。</p><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>update:modelValue</code></td><td><code>(value: string | null)</code></td><td>用户选择不同模型时请求更新选中值</td></tr><tr><td><code>change</code></td><td><code>(current: ModelSelectorSnapshot, previous: ModelSelectorSnapshot)</code></td><td>用户切换模型或修改设置时触发，参数依次对应操作后和操作前的选择</td></tr><tr><td><code>update:open</code></td><td><code>(open: boolean)</code></td><td>请求更新面板开关</td></tr></tbody></table><p><code>change</code> 的第一个参数 <code>current</code> 对应操作后的选择，第二个参数 <code>previous</code> 对应操作前的选择。两者都包含模型 ID（<code>modelId</code>）和对应模型的有效设置值（<code>featureValues</code>）。</p><p>初始化、应用直接赋值或更新 <code>models</code> 时，组件不会触发 <code>change</code>。用户切换模型时，组件先触发 <code>update:modelValue</code>，再触发 <code>change</code>。如果 <code>closeOnSelect</code> 为 <code>true</code>，组件随后通过 <code>update:open(false)</code> 请求关闭面板。只修改设置值时，组件触发 <code>change</code>。</p><p>由应用控制选中模型或设置值时，<code>current</code> 表示本次操作请求采用的选择，界面以应用传入的值为准。</p><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>作用域参数</th><th>说明</th></tr></thead><tbody><tr><td><code>trigger</code></td><td><code>{ option, label, open, featureValues, text }</code></td><td>替换触发器按钮内容</td></tr><tr><td><code>item</code></td><td><code>{ option, selected, highlighted }</code></td><td>自定义模型项内容</td></tr><tr><td><code>empty</code></td><td><code>{ query }</code></td><td>自定义空状态</td></tr><tr><td><code>header</code></td><td><code>{ option, query, close }</code></td><td>自定义面板头部</td></tr><tr><td><code>footer</code></td><td><code>{ option, query, close, values, disabled, setFeatureValue }</code></td><td>完整替换默认字段区</td></tr></tbody></table><p><code>close()</code> 关闭面板并恢复触发器焦点。使用受控 <code>open</code> 时，消费层需要同步更新值。</p><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><p>以下类型均从 <code>@opentiny/tiny-robot</code> 导出：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { Placement } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@floating-ui/dom&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { Component, VNode } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorVariant</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;outline&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;ghost&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;muted&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSize</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;small&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;normal&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;large&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorPanelClass</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFeatureValue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFeatureValues</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Readonly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Partial</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ModelSelectorFeatureValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFieldBase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  key</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorField</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFieldBase</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;switch&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">defaultValue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">        type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;select&#39;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">        defaultValue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">        options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">          value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">          label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">          disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }[]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  )</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSnapshot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  modelId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  featureValues</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFeatureValues</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  group</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  features</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorField</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFilterMethod</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">query</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorTriggerTextContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  model</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  featureValues</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFeatureValues</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  models</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  featureValues</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFeatureValues</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  defaultFeatureValues</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFeatureValues</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  renderTriggerText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorTriggerTextContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  modelValue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  defaultValue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  open</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  defaultOpen</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  closeOnSelect</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
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
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorTriggerSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  open</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  featureValues</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFeatureValues</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
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
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  values</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFeatureValues</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  setFeatureValue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">key</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFeatureValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
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
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;change&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">current</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSnapshot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">previous</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSnapshot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;update:open&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">open</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h3><p>面板默认通过 Teleport 挂载，定义在组件宿主元素上的局部变量不会自动继承到面板。<code>panelClass</code> 附加的类可承载单实例面板变量。</p><table tabindex="0"><thead><tr><th>变量名</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-model-selector-trigger-text-color</code></td><td><code>var(--tr-text-primary)</code></td><td>触发器文本颜色</td></tr><tr><td><code>--tr-model-selector-trigger-icon-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>触发器图标与箭头颜色</td></tr><tr><td><code>--tr-model-selector-trigger-outline-bg</code></td><td><code>var(--tr-container-bg-default)</code></td><td>outline 背景</td></tr><tr><td><code>--tr-model-selector-trigger-outline-border</code></td><td><code>var(--tr-border-color-default)</code></td><td>outline 边框</td></tr><tr><td><code>--tr-model-selector-trigger-ghost-bg</code></td><td><code>transparent</code></td><td>ghost 背景</td></tr><tr><td><code>--tr-model-selector-trigger-ghost-border</code></td><td><code>transparent</code></td><td>ghost 边框</td></tr><tr><td><code>--tr-model-selector-trigger-muted-bg</code></td><td><code>var(--tr-container-bg-default-2)</code></td><td>muted 背景</td></tr><tr><td><code>--tr-model-selector-trigger-muted-border</code></td><td><code>transparent</code></td><td>muted 边框</td></tr><tr><td><code>--tr-model-selector-trigger-hover-bg</code></td><td><code>var(--tr-container-bg-hover)</code></td><td>触发器 hover/open 背景</td></tr><tr><td><code>--tr-model-selector-trigger-hover-border</code></td><td><code>var(--tr-border-color-hover)</code></td><td>触发器 hover/open 边框</td></tr><tr><td><code>--tr-model-selector-trigger-disabled-color</code></td><td><code>var(--tr-text-disabled)</code></td><td>触发器禁用颜色</td></tr><tr><td><code>--tr-model-selector-panel-bg</code></td><td><code>var(--tr-dropdown-menu-bg-color)</code></td><td>面板背景</td></tr><tr><td><code>--tr-model-selector-panel-border</code></td><td><code>var(--tr-border-color-default)</code></td><td>面板边框</td></tr><tr><td><code>--tr-model-selector-panel-shadow</code></td><td><code>var(--tr-dropdown-menu-box-shadow)</code></td><td>面板阴影</td></tr><tr><td><code>--tr-model-selector-divider-color</code></td><td><code>var(--tr-border-color-default)</code></td><td>Header、搜索框与 Footer 分隔线</td></tr><tr><td><code>--tr-model-selector-item-color</code></td><td><code>var(--tr-dropdown-menu-item-color)</code></td><td>选项文本颜色</td></tr><tr><td><code>--tr-model-selector-item-description-color</code></td><td><code>var(--tr-text-tertiary)</code></td><td>选项描述颜色</td></tr><tr><td><code>--tr-model-selector-option-text-max-width</code></td><td><code>320px</code></td><td>名称与描述所在文字列的最大宽度</td></tr><tr><td><code>--tr-model-selector-item-hover-bg</code></td><td><code>var(--tr-dropdown-menu-item-hover-bg-color)</code></td><td>选项 hover/highlight 背景</td></tr><tr><td><code>--tr-model-selector-item-selected-color</code></td><td><code>var(--tr-color-primary)</code></td><td>选中项强调色</td></tr><tr><td><code>--tr-model-selector-item-disabled-color</code></td><td><code>var(--tr-text-disabled)</code></td><td>禁用项颜色</td></tr><tr><td><code>--tr-model-selector-group-title-color</code></td><td><code>var(--tr-text-tertiary)</code></td><td>分组标题颜色</td></tr><tr><td><code>--tr-model-selector-empty-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>空状态颜色</td></tr><tr><td><code>--tr-model-selector-scrollbar-color</code></td><td><code>var(--tr-dropdown-menu-scrollbar-thumb-color)</code></td><td>列表滚动条颜色</td></tr><tr><td><code>--tr-model-selector-field-label-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>功能字段标题颜色</td></tr><tr><td><code>--tr-model-selector-field-option-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>功能选项文字颜色</td></tr><tr><td><code>--tr-model-selector-field-option-border</code></td><td><code>var(--tr-border-color-default)</code></td><td>功能选项边框</td></tr><tr><td><code>--tr-model-selector-field-option-bg</code></td><td><code>transparent</code></td><td>功能选项背景</td></tr><tr><td><code>--tr-model-selector-field-option-hover-bg</code></td><td><code>var(--tr-container-bg-hover)</code></td><td>功能选项 hover 背景</td></tr><tr><td><code>--tr-model-selector-field-option-active-color</code></td><td><code>var(--tr-color-primary)</code></td><td>功能选项激活文字颜色</td></tr><tr><td><code>--tr-model-selector-field-option-active-border</code></td><td><code>var(--tr-color-primary)</code></td><td>功能选项激活边框</td></tr><tr><td><code>--tr-model-selector-field-option-active-bg</code></td><td><code>color-mix(in srgb, var(--tr-color-primary) 12%, transparent)</code></td><td>功能选项激活背景</td></tr><tr><td><code>--tr-model-selector-field-option-disabled-color</code></td><td><code>var(--tr-text-disabled)</code></td><td>功能选项禁用文字颜色</td></tr></tbody></table>`,41))])}}});export{L as __pageData,X as default};

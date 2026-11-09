const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/slots.CuE2xxlw.js","assets/chunks/theme.B9gPbNXR.js","assets/chunks/framework.V2e55FFV.js","assets/chunks/icon-trigger.DMy6G8PO.js","assets/chunks/trigger-text.CCwKuGQx.js","assets/chunks/variants.BHLDBIZv.js","assets/chunks/reasoning-effort.8RZoeAO6.js","assets/chunks/search-and-group.mKYA6N7S.js","assets/chunks/basic.CcbpLkk7.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as h,aZ as B,aL as D,v as _,H as u,bL as p,bB as k,J as e,bk as i,bJ as n,G as c,w as l,I as d,b7 as g,aU as x}from"./chunks/framework.V2e55FFV.js";import{L as y,N as F}from"./chunks/index.DsG-mwFo.js";const S=`<script setup lang="ts">
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
`,L=JSON.parse('{"title":"ModelSelector 模型选择器","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/model-selector.md","filePath":"components/model-selector.md"}'),Z={name:"components/model-selector.md"},X=Object.assign(Z,{setup(R){const E=g();r(async()=>{E.value=(await h(async()=>{const{default:a}=await import("./chunks/slots.CuE2xxlw.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const m=g();r(async()=>{m.value=(await h(async()=>{const{default:a}=await import("./chunks/icon-trigger.DMy6G8PO.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const b=g();r(async()=>{b.value=(await h(async()=>{const{default:a}=await import("./chunks/trigger-text.CCwKuGQx.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const v=g();r(async()=>{v.value=(await h(async()=>{const{default:a}=await import("./chunks/variants.BHLDBIZv.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const A=g();r(async()=>{A.value=(await h(async()=>{const{default:a}=await import("./chunks/reasoning-effort.8RZoeAO6.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const f=g();r(async()=>{f.value=(await h(async()=>{const{default:a}=await import("./chunks/search-and-group.mKYA6N7S.js");return{default:a}},__vite__mapDeps([7,1,2]))).default});const t=x(!0),C=g();return r(async()=>{C.value=(await h(async()=>{const{default:a}=await import("./chunks/basic.CcbpLkk7.js");return{default:a}},__vite__mapDeps([8,1,2]))).default}),(a,s)=>{const o=B("ClientOnly");return D(),_("div",null,[s[7]||(s[7]=u("",6)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"基础用法",description:"models 与 v-model 的基础选择。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:i(W)},c({_:2},[C.value?{name:"vue",fn:n(()=>[e(i(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[8]||(s[8]=u("",6)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"搜索与分组",description:"名称、描述、分组搜索与禁用状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{t.value=!1}),vueCode:i(q)},c({_:2},[f.value?{name:"vue",fn:n(()=>[e(i(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[9]||(s[9]=u("",5)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"模型特性字段",description:"切换模型或修改设置，查看当前模型的设置值（featureValues）。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{t.value=!1}),vueCode:i(V)},c({_:2},[A.value?{name:"vue",fn:n(()=>[e(i(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[10]||(s[10]=u("",3)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"尺寸与外观",description:"三种尺寸与三种外观的展示效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[3]||(s[3]=()=>{t.value=!1}),vueCode:i(M)},c({_:2},[v.value?{name:"vue",fn:n(()=>[e(i(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[11]||(s[11]=l("h2",{id:"自定义内容",tabindex:"-1"},[d("自定义内容 "),l("a",{class:"header-anchor",href:"#自定义内容","aria-label":'Permalink to "自定义内容"'},"​")],-1)),s[12]||(s[12]=l("p",null,"插槽只替换显示内容，选择、搜索、键盘操作和浮层定位仍由组件处理。",-1)),s[13]||(s[13]=l("h3",{id:"自定义触发器文本",tabindex:"-1"},[d("自定义触发器文本 "),l("a",{class:"header-anchor",href:"#自定义触发器文本","aria-label":'Permalink to "自定义触发器文本"'},"​")],-1)),s[14]||(s[14]=l("p",null,[d("用 "),l("code",null,"renderTriggerText({ model, featureValues })"),d(" 自定义按钮文字。返回的文字也用作悬浮提示和无障碍名称。")],-1)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"自定义触发器文本",description:"打开「联网搜索」，按钮文字会变为「通用模型 · 联网」。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[4]||(s[4]=()=>{t.value=!1}),vueCode:i(T)},c({_:2},[b.value?{name:"vue",fn:n(()=>[e(i(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[15]||(s[15]=l("h3",{id:"自定义触发器",tabindex:"-1"},[d("自定义触发器 "),l("a",{class:"header-anchor",href:"#自定义触发器","aria-label":'Permalink to "自定义触发器"'},"​")],-1)),s[16]||(s[16]=l("p",null,[l("code",null,"trigger"),d(" 插槽提供当前模型、模型名称、展开状态、有效设置值和 "),l("code",null,"text"),d("。自定义按钮内容时，可以用 "),l("code",null,"text"),d(" 显示文字，让它与按钮的悬浮提示和无障碍名称一致。")],-1)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"自定义触发器",description:"模型标识、展开箭头与窄屏表现的定制效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[5]||(s[5]=()=>{t.value=!1}),vueCode:i(w)},c({_:2},[m.value?{name:"vue",fn:n(()=>[e(i(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[17]||(s[17]=u("",3)),p(e(i(y),null,null,512),[[k,t.value]]),e(o,null,{default:n(()=>[e(i(F),{title:"自定义选项面板",description:"面板标题、模型项、空状态和底部操作区的定制效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[6]||(s[6]=()=>{t.value=!1}),vueCode:i(S)},c({_:2},[E.value?{name:"vue",fn:n(()=>[e(i(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[18]||(s[18]=u("",41))])}}});export{L as __pageData,X as default};

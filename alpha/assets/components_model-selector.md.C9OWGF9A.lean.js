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
`,I=JSON.parse('{"title":"ModelSelector 模型选择器","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/model-selector.md","filePath":"components/model-selector.md"}'),R={name:"components/model-selector.md"},V=Object.assign(R,{setup(P){const E=g();o(async()=>{E.value=(await r(async()=>{const{default:a}=await import("./chunks/slots.CRzP72HT.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const m=g();o(async()=>{m.value=(await r(async()=>{const{default:a}=await import("./chunks/icon-trigger.C1UwrIPo.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const u=g();o(async()=>{u.value=(await r(async()=>{const{default:a}=await import("./chunks/variants.B3g6QXid.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const b=g();o(async()=>{b.value=(await r(async()=>{const{default:a}=await import("./chunks/reasoning-effort.poXdVKEt.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const v=g();o(async()=>{v.value=(await r(async()=>{const{default:a}=await import("./chunks/search-and-group.C2qPwoJN.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const t=_(!0),f=g();return o(async()=>{f.value=(await r(async()=>{const{default:a}=await import("./chunks/basic.C-JJoZ0w.js");return{default:a}},__vite__mapDeps([7,1,2]))).default}),(a,s)=>{const d=C("ClientOnly");return B(),D("div",null,[s[6]||(s[6]=h("",6)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"基础用法",description:"models 与 v-model 的基础选择。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:e(q)},c({_:2},[f.value?{name:"vue",fn:n(()=>[i(e(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[7]||(s[7]=h("",6)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"搜索与分组",description:"名称、描述、分组搜索与禁用状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{t.value=!1}),vueCode:e(M)},c({_:2},[v.value?{name:"vue",fn:n(()=>[i(e(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[8]||(s[8]=h("",5)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"思考强度",description:"内置选项、自定义选项与不支持思考强度的模型。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{t.value=!1}),vueCode:e(T)},c({_:2},[b.value?{name:"vue",fn:n(()=>[i(e(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[9]||(s[9]=h("",5)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"尺寸与外观",description:"三种尺寸与三种外观的展示效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[3]||(s[3]=()=>{t.value=!1}),vueCode:e(w)},c({_:2},[u.value?{name:"vue",fn:n(()=>[i(e(u))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[10]||(s[10]=l("h2",{id:"自定义内容",tabindex:"-1"},[A("自定义内容 "),l("a",{class:"header-anchor",href:"#自定义内容","aria-label":'Permalink to "自定义内容"'},"​")],-1)),s[11]||(s[11]=l("p",null,"插槽只替换显示内容，选择、搜索、键盘操作和浮层定位仍由组件处理。",-1)),s[12]||(s[12]=l("h3",{id:"自定义触发器",tabindex:"-1"},[A("自定义触发器 "),l("a",{class:"header-anchor",href:"#自定义触发器","aria-label":'Permalink to "自定义触发器"'},"​")],-1)),s[13]||(s[13]=l("p",null,[l("code",null,"trigger"),A(" 插槽用于调整按钮内容，并提供当前选项、展示文本、展开状态和当前模型支持的思考强度。")],-1)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"自定义触发器",description:"模型标识、展开箭头与窄屏表现的定制效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[4]||(s[4]=()=>{t.value=!1}),vueCode:e(S)},c({_:2},[m.value?{name:"vue",fn:n(()=>[i(e(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[14]||(s[14]=h("",3)),p(i(e(y),null,null,512),[[k,t.value]]),i(d,null,{default:n(()=>[i(e(F),{title:"自定义选项面板",description:"面板标题、模型项、空状态和底部操作区的定制效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[5]||(s[5]=()=>{t.value=!1}),vueCode:e(x)},c({_:2},[E.value?{name:"vue",fn:n(()=>[i(e(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[15]||(s[15]=h("",35))])}}});export{I as __pageData,V as default};

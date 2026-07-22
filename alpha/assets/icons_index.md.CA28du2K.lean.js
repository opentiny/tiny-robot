const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/IconGallery.CKfR6xSR.js","assets/chunks/framework.CV5uswMq.js","assets/chunks/theme.D0z9_hSQ.js","assets/chunks/VNodeUsage.Cm4YX9p-.js","assets/chunks/PropsUsage.dPr8rT21.js","assets/chunks/DirectRender.Ca5T9loP.js"])))=>i.map(i=>d[i]);
import{aD as c,bQ as d,aZ as k,aL as w,v as I,H as x,bL as p,bB as u,J as e,bk as t,bJ as l,G as m,w as o,I as r,b7 as y,aU as C}from"./chunks/framework.CV5uswMq.js";import{L as g,N as h}from"./chunks/index.UKYjhuGV.js";const T=`<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TinyModal } from '@opentiny/vue'
import * as exportedIcons from '@opentiny/tiny-robot-svgs'
import { hiddenIconNames, iconCategoryGroups, iconMetadataMap, uncategorizedTitle } from './iconMeta'

type IconComponent = (typeof exportedIcons)[keyof typeof exportedIcons]
type IconEntry = {
  name: string
  component: IconComponent
  category: string
  keywords: string[]
  previewLayout: 'regular' | 'illustration'
}

const searchQuery = shallowRef('')
const copiedName = shallowRef('')

let resetTimer: ReturnType<typeof setTimeout> | undefined

const iconEntries = Object.entries(exportedIcons)
  .map(([name, component]) => {
    const metadata = iconMetadataMap.get(name)

    return {
      name,
      component: component as IconComponent,
      category: metadata?.category ?? uncategorizedTitle,
      keywords: metadata?.keywords ?? [],
      previewLayout: metadata?.previewLayout ?? 'regular',
    } satisfies IconEntry
  })
  .filter(({ name }) => !hiddenIconNames.has(name))
  .sort((a, b) => a.name.localeCompare(b.name))

const filteredIcons = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  if (!keyword) {
    return iconEntries
  }

  return iconEntries.filter(({ name, category, keywords }) => {
    const haystack = [name, category, ...keywords].join(' ').toLowerCase()
    return haystack.includes(keyword)
  })
})

const groupedIcons = computed(() => {
  const sections = iconCategoryGroups
    .map(({ title, previewLayout = 'regular' }) => ({
      title,
      previewLayout,
      icons: filteredIcons.value.filter((icon) => icon.category === title),
    }))
    .filter(({ icons }) => icons.length)

  const uncategorizedIcons = filteredIcons.value.filter((icon) => icon.category === uncategorizedTitle)

  if (uncategorizedIcons.length) {
    sections.push({
      title: uncategorizedTitle,
      previewLayout: 'regular',
      icons: uncategorizedIcons,
    })
  }

  return sections
})

const filteredCount = computed(() => groupedIcons.value.reduce((count, section) => count + section.icons.length, 0))

async function copyName(name: string) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(name)
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.value = name
      textarea.setAttribute('readonly', 'true')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    copiedName.value = name
    TinyModal.message({
      message: \`\${name} 图标已复制\`,
      status: 'success',
      duration: 2000,
    })

    if (resetTimer) {
      clearTimeout(resetTimer)
    }

    resetTimer = setTimeout(() => {
      copiedName.value = ''
    }, 1800)
  } catch (error) {
    console.error('Failed to copy icon name:', error)
  }
}
<\/script>

<template>
  <div class="icon-gallery">
    <div class="icon-gallery__toolbar">
      <label class="icon-gallery__search">
        <span class="icon-gallery__search-label">搜索</span>
        <input
          v-model="searchQuery"
          class="icon-gallery__search-input"
          type="text"
          placeholder="输入 Icon 名称，例如 IconSend"
        />
      </label>
      <div class="icon-gallery__meta">
        <span>当前展示 {{ filteredCount }} / {{ iconEntries.length }}</span>
      </div>
    </div>

    <div v-if="groupedIcons.length" class="icon-gallery__sections">
      <section v-for="section in groupedIcons" :key="section.title" class="icon-gallery__section">
        <h3 class="icon-gallery__section-title">{{ section.title }}</h3>
        <div
          :class="[
            'icon-gallery__grid',
            { 'icon-gallery__grid--illustration': section.previewLayout === 'illustration' },
          ]"
        >
          <button
            v-for="icon in section.icons"
            :key="icon.name"
            :class="[
              'icon-gallery__card',
              { 'icon-gallery__card--illustration': section.previewLayout === 'illustration' },
              { 'icon-gallery__card--copied': copiedName === icon.name },
            ]"
            type="button"
            @click="copyName(icon.name)"
          >
            <span
              :class="[
                'icon-gallery__icon-preview',
                { 'icon-gallery__icon-preview--illustration': section.previewLayout === 'illustration' },
              ]"
            >
              <component
                :is="icon.component"
                :class="[
                  'icon-gallery__icon',
                  { 'icon-gallery__icon--illustration': section.previewLayout === 'illustration' },
                ]"
              />
            </span>
            <span class="icon-gallery__name">{{ icon.name }}</span>
          </button>
        </div>
      </section>
    </div>

    <div v-else class="icon-gallery__empty">未找到匹配的图标。</div>
  </div>
</template>

<style scoped>
.icon-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.icon-gallery__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.icon-gallery__search {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: min(100%, 320px);
}

.icon-gallery__search-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.icon-gallery__search-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.icon-gallery__search-input:focus {
  outline: none;
  border-color: #1476ff;
  box-shadow: 0 0 0 3px color-mix(in srgb, #1476ff 18%, transparent);
}

.icon-gallery__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.6;
  text-align: right;
}

.icon-gallery__sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.icon-gallery__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.icon-gallery__section-title {
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.icon-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 12px;
}

.icon-gallery__grid--illustration {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.icon-gallery__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 112px;
  padding: 16px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.icon-gallery__card--illustration {
  align-items: stretch;
  justify-content: flex-start;
  min-height: 220px;
}

.icon-gallery__card--copied {
  border-color: color-mix(in srgb, #1476ff 48%, var(--vp-c-divider));
  background: color-mix(in srgb, #1476ff 7%, var(--vp-c-bg));
  box-shadow: 0 0 0 2px color-mix(in srgb, #1476ff 14%, transparent);
}

.icon-gallery__card:hover {
  background: var(--vp-c-bg-soft);
}

.icon-gallery__card:focus-visible {
  outline: none;
  border-color: #1476ff;
  box-shadow: 0 0 0 3px color-mix(in srgb, #1476ff 18%, transparent);
}

.icon-gallery__icon-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 6px;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.icon-gallery__icon-preview--illustration {
  width: 100%;
  height: 132px;
  padding: 12px;
  overflow: hidden;
}

.icon-gallery__icon {
  font-size: 24px;
  transition: all 0.4s;
  transform-origin: center;
}

.icon-gallery__icon--illustration {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  font-size: 16px;
}

.icon-gallery__icon:hover {
  transform: scale(1.5);
}

.icon-gallery__icon--illustration:hover {
  transform: none;
}

.icon-gallery__name {
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
  word-break: break-word;
}

.icon-gallery__empty {
  padding: 28px 16px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  text-align: center;
  background: var(--vp-c-bg);
}

@media (max-width: 640px) {
  .icon-gallery__meta {
    text-align: left;
  }

  .icon-gallery__section-title {
    font-size: 18px;
  }

  .icon-gallery__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .icon-gallery__grid--illustration {
    grid-template-columns: 1fr;
  }
}
</style>
`,B=`<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { TrHistory } from '@opentiny/tiny-robot'
import { IconCheck, IconCopy, IconDelete } from '@opentiny/tiny-robot-svgs'

const selectedId = shallowRef<string | undefined>('2')

const historyItems = shallowRef([
  { title: '已选中会话', id: '1', icon: h(IconCheck, { style: { fontSize: '16px' } }) },
  { title: '已复制消息', id: '2', icon: h(IconCopy, { style: { fontSize: '16px' } }) },
  { title: '待删除记录', id: '3', icon: h(IconDelete, { style: { fontSize: '16px' } }) },
])

function handleItemClick(item: { id: string }) {
  selectedId.value = item.id
}
<\/script>

<template>
  <TrHistory :data="historyItems" :selected="selectedId" @item-click="handleItemClick" />
</template>
`,A=`<script setup lang="ts">
import { TrIconButton } from '@opentiny/tiny-robot'
import { IconNewSession, IconRefresh, IconSearch } from '@opentiny/tiny-robot-svgs'
<\/script>

<template>
  <div class="icon-demo-row">
    <TrIconButton size="34" svg-size="18" :icon="IconNewSession" />
    <TrIconButton size="34" svg-size="18" :icon="IconRefresh" />
    <TrIconButton size="34" svg-size="18" :icon="IconSearch" />
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
}
</style>
`,S=`<script setup lang="ts">
import { IconAi, IconSearch, IconSparkles } from '@opentiny/tiny-robot-svgs'
<\/script>

<template>
  <div class="icon-demo-row">
    <IconAi class="icon-demo-row__icon icon-demo-row__icon--primary" />
    <IconSparkles class="icon-demo-row__icon icon-demo-row__icon--brand" />
    <IconSearch class="icon-demo-row__icon icon-demo-row__icon--muted" />
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 48px;
}

.icon-demo-row__icon {
  font-size: 22px;
}

.icon-demo-row__icon--primary {
  font-size: 30px;
}

.icon-demo-row__icon--brand {
  color: #1476ff;
}

.icon-demo-row__icon--muted {
  color: #5b6b82;
}
</style>
`,E=JSON.parse('{"title":"SVG 图标","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"icons/index.md","filePath":"icons/index.md"}'),D={name:"icons/index.md"},z=Object.assign(D,{setup(L){const v=y();c(async()=>{v.value=(await d(async()=>{const{default:i}=await import("./chunks/IconGallery.CKfR6xSR.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const f=y();c(async()=>{f.value=(await d(async()=>{const{default:i}=await import("./chunks/VNodeUsage.Cm4YX9p-.js");return{default:i}},__vite__mapDeps([3,2,1]))).default});const _=y();c(async()=>{_.value=(await d(async()=>{const{default:i}=await import("./chunks/PropsUsage.dPr8rT21.js");return{default:i}},__vite__mapDeps([4,2,1]))).default});const a=C(!0),b=y();return c(async()=>{b.value=(await d(async()=>{const{default:i}=await import("./chunks/DirectRender.Ca5T9loP.js");return{default:i}},__vite__mapDeps([5,2,1]))).default}),(i,n)=>{const s=k("ClientOnly");return w(),I("div",null,[n[4]||(n[4]=x("",8)),p(e(t(g),null,null,512),[[u,a.value]]),e(s,null,{default:l(()=>[e(t(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[0]||(n[0]=()=>{a.value=!1}),vueCode:t(S)},m({_:2},[b.value?{name:"vue",fn:l(()=>[e(t(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[5]||(n[5]=o("h3",{id:"作为组件-props-传递",tabindex:"-1"},[r("作为组件 props 传递 "),o("a",{class:"header-anchor",href:"#作为组件-props-传递","aria-label":'Permalink to "作为组件 props 传递"'},"​")],-1)),n[6]||(n[6]=o("p",null,[r("适合 "),o("code",null,"TrIconButton"),r("、"),o("code",null,"TrSender"),r("、"),o("code",null,"TrHistory"),r(" 等支持 "),o("code",null,"icon"),r(" 属性的组件。")],-1)),p(e(t(g),null,null,512),[[u,a.value]]),e(s,null,{default:l(()=>[e(t(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[1]||(n[1]=()=>{a.value=!1}),vueCode:t(A)},m({_:2},[_.value?{name:"vue",fn:l(()=>[e(t(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[7]||(n[7]=o("h3",{id:"作为-vnode-传递",tabindex:"-1"},[r("作为 VNode 传递 "),o("a",{class:"header-anchor",href:"#作为-vnode-传递","aria-label":'Permalink to "作为 VNode 传递"'},"​")],-1)),n[8]||(n[8]=o("p",null,"适合 icon 需要在运行时动态组装，或者第三方/业务组件要求接收 VNode 的场景。",-1)),p(e(t(g),null,null,512),[[u,a.value]]),e(s,null,{default:l(()=>[e(t(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[2]||(n[2]=()=>{a.value=!1}),vueCode:t(B)},m({_:2},[f.value?{name:"vue",fn:l(()=>[e(t(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[9]||(n[9]=o("h2",{id:"图标集合",tabindex:"-1"},[r("图标集合 "),o("a",{class:"header-anchor",href:"#图标集合","aria-label":'Permalink to "图标集合"'},"​")],-1)),n[10]||(n[10]=o("p",null,"图标集合按常用场景分类展示，支持按图标名、分类名和关键词筛选。点击图标卡片可以快速复制图标名称；插画型和场景态图标会单独分组展示。",-1)),p(e(t(g),null,null,512),[[u,a.value]]),e(s,null,{default:l(()=>[e(t(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[3]||(n[3]=()=>{a.value=!1}),vueCode:t(T)},m({_:2},[v.value?{name:"vue",fn:l(()=>[e(t(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[11]||(n[11]=x("",6))])}}});export{E as __pageData,z as default};

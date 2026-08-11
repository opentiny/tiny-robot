const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic-source.B-606B26.js","assets/chunks/framework.CUa_Cx66.js","assets/chunks/theme.7L8HYfI8.js","assets/chunks/controlled-search.BEbwL36p.js"])))=>i.map(i=>d[i]);
import{aD as C,bQ as l,aZ as u,aL as g,v as m,H as c,bL as E,bB as B,J as t,bk as n,bJ as o,G as A,b7 as p,aU as D}from"./chunks/framework.CUa_Cx66.js";import{L as h,N as b}from"./chunks/index.C4PESc4f.js";const v=`<template>
  <section class="demo">
    <div class="controls">
      <span>展开模式</span>

      <label>
        <input v-model="expandTrigger" type="radio" value="hover" />
        hover
      </label>

      <label>
        <input v-model="expandTrigger" type="radio" value="manual" />
        manual
      </label>

      <template v-if="isManualMode">
        <label>
          <input v-model="expanded" type="checkbox" />
          展开目录面板
        </label>

        <button type="button" @click="expanded = false">收起</button>
        <button type="button" @click="expanded = true">展开</button>
      </template>
    </div>

    <p class="tip">
      <template v-if="isManualMode">
        当前为 <code>manual</code> 模式，目录面板不再跟随 hover 自动展开，改由外部 <code>v-model:expanded</code> 控制。
      </template>
      <template v-else> 当前为 <code>hover</code> 模式，鼠标悬浮或聚焦到目录面板时会自动展开。 </template>
    </p>

    <div class="stage">
      <div ref="scrollContainerRef" class="article">
        <section v-for="section in sections" :key="section.id" :data-anchor-id="section.id" class="article-section">
          <h4>{{ section.label }}</h4>
          <p>{{ section.content }}</p>
        </section>
      </div>

      <tr-anchor
        class="nav"
        :items="items"
        :scroll-container="scrollContainerRef"
        :active-offset="20"
        :expand-trigger="expandTrigger"
        v-model:expanded="expanded"
        :search-options="{ placeholder: '搜索章节' }"
        target-feedback-class="article-section--active"
        :target-feedback-duration="1800"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrAnchor } from '@opentiny/tiny-robot'
import { basicSourceMessages } from './basic-source.messages'

function isUserMessage(
  message: (typeof basicSourceMessages)[number],
): message is (typeof basicSourceMessages)[number] & { role: 'user' } {
  return message.role === 'user'
}

const scrollContainerRef = ref<HTMLElement | null>(null)
const expandTrigger = ref<'hover' | 'manual'>('hover')
const expanded = ref(false)
const isManualMode = computed(() => expandTrigger.value === 'manual')
const messages = basicSourceMessages
const userMessages = messages.filter(isUserMessage)
const messageById = new Map(messages.map((message) => [message.id, message]))

const sections = userMessages.map((message) => {
  const assistantReply = messageById.get(\`assistant-\${message.id}\`)

  return {
    id: message.id,
    label: message.content,
    content: String(assistantReply?.content ?? ''),
  }
})

const items = sections.map((section) => ({
  id: section.id,
  label: section.label,
  searchText: \`\${section.label} \${section.content}\`,
}))
<\/script>

<style scoped src="./demo-shell.css"></style>

<style scoped>
.demo {
  --anchor-demo-gap: 14px;
  --anchor-demo-controls-gap: 10px 12px;
}

.tip {
  margin: 0;
  color: var(--tr-text-secondary);
  line-height: 1.5;
}

.article {
  --anchor-section-active-bg: #b9d7ff;
  display: grid;
  gap: 16px;
  height: 100%;
  overflow: auto;
  padding: 24px 28px;
}

:global([data-tr-color-mode='dark'] .article) {
  --anchor-section-active-bg: color-mix(in srgb, #317af7 40%, var(--vp-c-bg));
}

.article-section {
  padding: 20px 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  color: var(--tr-text-secondary);
  scroll-margin-top: 16px;
}

.article-section--active {
  animation: section-active 1.4s ease-out !important;
}

@keyframes section-active {
  0%,
  25% {
    background-color: var(--anchor-section-active-bg);
  }
  45% {
    background-color: var(--vp-c-bg);
  }
  65%,
  85% {
    background-color: var(--anchor-section-active-bg);
  }
  100% {
    background-color: var(--vp-c-bg);
  }
}

.article-section h4,
.article-section p {
  margin: 0;
}

.article-section h4 {
  font-size: 18px;
  line-height: 1.4;
}

.article-section p {
  white-space: pre-line;
}

.nav {
  top: 0;
  right: 16px;
}
</style>
`,f=`<template>
  <section class="demo">
    <div class="controls">
      <div class="placement">
        <span>停靠位置</span>
        <label>
          <input v-model="placement" type="radio" value="left" />
          左侧
        </label>
        <label>
          <input v-model="placement" type="radio" value="right" />
          右侧
        </label>
      </div>

      <label>
        <input v-model="searchEnabled" type="checkbox" />
        显示搜索区
      </label>
    </div>

    <div class="stage">
      <tr-bubble-provider :box-attributes="boxAttributes">
        <tr-bubble-list ref="bubbleListRef" class="conversation-list" :messages="messages" :role-configs="roles" />
      </tr-bubble-provider>

      <tr-anchor
        :class="['nav', \`is-\${placement}\`]"
        :items="anchorItems"
        :scroll-container="scrollContainerRef"
        :active-offset="20"
        :placement="placement"
        :search-options="searchOptions"
        v-model:active-id="activeId"
        v-model:search-query="searchQuery"
        target-feedback-class="user-bubble-active"
        :target-feedback-duration="1800"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import {
  TrBubbleList,
  TrBubbleProvider,
  TrAnchor,
  type BubbleBoxAttributesConfig,
  type BubbleMessage,
  type BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { controlledSearchMessages } from './controlled-search.messages'

const messages = controlledSearchMessages

function isUserMessage(message: BubbleMessage): message is BubbleMessage & { id: string; role: 'user' } {
  return message.role === 'user' && typeof message.id === 'string'
}

const aiAvatar = h(IconAi, { style: { fontSize: '28px' } })
const userAvatar = h(IconUser, { style: { fontSize: '28px' } })

const roles = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
} satisfies Record<string, BubbleRoleConfig>

const userMessages = messages.filter(isUserMessage)
const messageById = new Map(messages.map((message) => [String(message.id), message]))

const bubbleListRef = ref<InstanceType<typeof TrBubbleList> | null>(null)
const scrollContainerRef = computed(() => bubbleListRef.value?.$el ?? null)
const placement = ref<'left' | 'right'>('right')
const activeId = ref(userMessages[0]?.id ?? '')
const searchQuery = ref('')
const searchEnabled = ref(false)

const searchOptions = computed(() => (searchEnabled.value ? { placeholder: '搜索用户问题或回复关键词' } : undefined))

watch(searchEnabled, (enabled) => {
  if (!enabled) {
    searchQuery.value = ''
  }
})

const anchorItems = userMessages.map((message) => {
  const assistantReply = messageById.get(\`assistant-\${message.id}\`)
  const label = String(message.content)

  return {
    id: message.id,
    label,
    searchText: \`\${label} \${String(message.content)} \${String(assistantReply?.content ?? '')}\`,
    tooltipText: label,
  }
})

const boxAttributes: BubbleBoxAttributesConfig = (groupedMessages) => {
  const firstMessage = groupedMessages[0]
  if (firstMessage?.role !== 'user' || typeof firstMessage.id !== 'string') {
    return undefined
  }

  return {
    class: 'user-bubble-target',
    'data-anchor-id': firstMessage.id,
  }
}
<\/script>

<style scoped src="./demo-shell.css"></style>

<style scoped>
.demo {
  --anchor-demo-gap: 16px;
  --anchor-demo-controls-gap: 12px 16px;
  --anchor-demo-stage-height: 480px;
}

.nav {
  top: 0;
}

.placement {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.conversation-list {
  --anchor-bubble-bg: var(--tr-color-primary-light);
  --anchor-bubble-active-bg: #b9d7ff;
  --tr-bubble-list-gap: 16px;
  --tr-bubble-list-padding: 24px 72px 40px;
  --tr-bubble-max-width: 560px;
  height: 100%;
}

:global([data-tr-color-mode='dark'] .conversation-list) {
  --anchor-bubble-bg: color-mix(in srgb, #317af7 30%, var(--tr-container-bg-default));
  --anchor-bubble-active-bg: color-mix(in srgb, #317af7 40%, var(--tr-container-bg-default));
}

.nav.is-right {
  right: 16px;
}

.nav.is-left {
  left: 16px;
}

:deep(.user-bubble-target) {
  --tr-bubble-box-bg: var(--anchor-bubble-bg);
  scroll-margin-top: 20px;
}

:deep(.user-bubble-active) {
  animation: user-bubble-active-flash 1.8s ease-out !important;
}

@keyframes user-bubble-active-flash {
  0%,
  25% {
    background-color: var(--anchor-bubble-active-bg);
  }
  45% {
    background-color: var(--anchor-bubble-bg);
  }
  65%,
  85% {
    background-color: var(--anchor-bubble-active-bg);
  }
  100% {
    background-color: var(--anchor-bubble-bg);
  }
}
</style>
`,M=JSON.parse('{"title":"Anchor 锚点","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/anchor.md","filePath":"components/anchor.md"}'),F={name:"components/anchor.md"},T=Object.assign(F,{setup(y){const r=p();C(async()=>{r.value=(await l(async()=>{const{default:s}=await import("./chunks/basic-source.B-606B26.js");return{default:s}},__vite__mapDeps([0,1,2]))).default});const a=D(!0),d=p();return C(async()=>{d.value=(await l(async()=>{const{default:s}=await import("./chunks/controlled-search.BEbwL36p.js");return{default:s}},__vite__mapDeps([3,1,2]))).default}),(s,e)=>{const i=u("ClientOnly");return g(),m("div",null,[e[2]||(e[2]=c('<h1 id="anchor-锚点" tabindex="-1">Anchor 锚点 <a class="header-anchor" href="#anchor-锚点" aria-label="Permalink to &quot;Anchor 锚点&quot;">​</a></h1><p>用于长内容区域和长对话场景的目录导航。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="bubblelist-场景" tabindex="-1">BubbleList 场景 <a class="header-anchor" href="#bubblelist-场景" aria-label="Permalink to &quot;BubbleList 场景&quot;">​</a></h3>',4)),E(t(n(h),null,null,512),[[B,a.value]]),t(i,null,{default:o(()=>[t(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22controlled-search.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fanchor%2Fcontrolled-search.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22controls%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22placement%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%E5%81%9C%E9%9D%A0%E4%BD%8D%E7%BD%AE%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22placement%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22left%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E5%B7%A6%E4%BE%A7%5Cn%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22placement%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22right%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E5%8F%B3%E4%BE%A7%5Cn%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22searchEnabled%5C%22%20type%3D%5C%22checkbox%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%E6%98%BE%E7%A4%BA%E6%90%9C%E7%B4%A2%E5%8C%BA%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22stage%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-bubble-provider%20%3Abox-attributes%3D%5C%22boxAttributes%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-bubble-list%20ref%3D%5C%22bubbleListRef%5C%22%20class%3D%5C%22conversation-list%5C%22%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Ftr-bubble-provider%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctr-anchor%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%5B'nav'%2C%20%60is-%24%7Bplacement%7D%60%5D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aitems%3D%5C%22anchorItems%5C%22%5Cn%20%20%20%20%20%20%20%20%3Ascroll-container%3D%5C%22scrollContainerRef%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aactive-offset%3D%5C%2220%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aplacement%3D%5C%22placement%5C%22%5Cn%20%20%20%20%20%20%20%20%3Asearch-options%3D%5C%22searchOptions%5C%22%5Cn%20%20%20%20%20%20%20%20v-model%3Aactive-id%3D%5C%22activeId%5C%22%5Cn%20%20%20%20%20%20%20%20v-model%3Asearch-query%3D%5C%22searchQuery%5C%22%5Cn%20%20%20%20%20%20%20%20target-feedback-class%3D%5C%22user-bubble-active%5C%22%5Cn%20%20%20%20%20%20%20%20%3Atarget-feedback-duration%3D%5C%221800%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20h%2C%20ref%2C%20watch%20%7D%20from%20'vue'%5Cnimport%20%7B%5Cn%20%20TrBubbleList%2C%5Cn%20%20TrBubbleProvider%2C%5Cn%20%20TrAnchor%2C%5Cn%20%20type%20BubbleBoxAttributesConfig%2C%5Cn%20%20type%20BubbleMessage%2C%5Cn%20%20type%20BubbleRoleConfig%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20controlledSearchMessages%20%7D%20from%20'.%2Fcontrolled-search.messages'%5Cn%5Cnconst%20messages%20%3D%20controlledSearchMessages%5Cn%5Cnfunction%20isUserMessage(message%3A%20BubbleMessage)%3A%20message%20is%20BubbleMessage%20%26%20%7B%20id%3A%20string%3B%20role%3A%20'user'%20%7D%20%7B%5Cn%20%20return%20message.role%20%3D%3D%3D%20'user'%20%26%26%20typeof%20message.id%20%3D%3D%3D%20'string'%5Cn%7D%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'28px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'28px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%20satisfies%20Record%3Cstring%2C%20BubbleRoleConfig%3E%5Cn%5Cnconst%20userMessages%20%3D%20messages.filter(isUserMessage)%5Cnconst%20messageById%20%3D%20new%20Map(messages.map((message)%20%3D%3E%20%5BString(message.id)%2C%20message%5D))%5Cn%5Cnconst%20bubbleListRef%20%3D%20ref%3CInstanceType%3Ctypeof%20TrBubbleList%3E%20%7C%20null%3E(null)%5Cnconst%20scrollContainerRef%20%3D%20computed(()%20%3D%3E%20bubbleListRef.value%3F.%24el%20%3F%3F%20null)%5Cnconst%20placement%20%3D%20ref%3C'left'%20%7C%20'right'%3E('right')%5Cnconst%20activeId%20%3D%20ref(userMessages%5B0%5D%3F.id%20%3F%3F%20'')%5Cnconst%20searchQuery%20%3D%20ref('')%5Cnconst%20searchEnabled%20%3D%20ref(false)%5Cn%5Cnconst%20searchOptions%20%3D%20computed(()%20%3D%3E%20(searchEnabled.value%20%3F%20%7B%20placeholder%3A%20'%E6%90%9C%E7%B4%A2%E7%94%A8%E6%88%B7%E9%97%AE%E9%A2%98%E6%88%96%E5%9B%9E%E5%A4%8D%E5%85%B3%E9%94%AE%E8%AF%8D'%20%7D%20%3A%20undefined))%5Cn%5Cnwatch(searchEnabled%2C%20(enabled)%20%3D%3E%20%7B%5Cn%20%20if%20(!enabled)%20%7B%5Cn%20%20%20%20searchQuery.value%20%3D%20''%5Cn%20%20%7D%5Cn%7D)%5Cn%5Cnconst%20anchorItems%20%3D%20userMessages.map((message)%20%3D%3E%20%7B%5Cn%20%20const%20assistantReply%20%3D%20messageById.get(%60assistant-%24%7Bmessage.id%7D%60)%5Cn%20%20const%20label%20%3D%20String(message.content)%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20id%3A%20message.id%2C%5Cn%20%20%20%20label%2C%5Cn%20%20%20%20searchText%3A%20%60%24%7Blabel%7D%20%24%7BString(message.content)%7D%20%24%7BString(assistantReply%3F.content%20%3F%3F%20'')%7D%60%2C%5Cn%20%20%20%20tooltipText%3A%20label%2C%5Cn%20%20%7D%5Cn%7D)%5Cn%5Cnconst%20boxAttributes%3A%20BubbleBoxAttributesConfig%20%3D%20(groupedMessages)%20%3D%3E%20%7B%5Cn%20%20const%20firstMessage%20%3D%20groupedMessages%5B0%5D%5Cn%20%20if%20(firstMessage%3F.role%20!%3D%3D%20'user'%20%7C%7C%20typeof%20firstMessage.id%20!%3D%3D%20'string')%20%7B%5Cn%20%20%20%20return%20undefined%5Cn%20%20%7D%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20class%3A%20'user-bubble-target'%2C%5Cn%20%20%20%20'data-anchor-id'%3A%20firstMessage.id%2C%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%20src%3D%5C%22.%2Fdemo-shell.css%5C%22%3E%3C%2Fstyle%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.demo%20%7B%5Cn%20%20--anchor-demo-gap%3A%2016px%3B%5Cn%20%20--anchor-demo-controls-gap%3A%2012px%2016px%3B%5Cn%20%20--anchor-demo-stage-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.nav%20%7B%5Cn%20%20top%3A%200%3B%5Cn%7D%5Cn%5Cn.placement%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%206px%3B%5Cn%7D%5Cn%5Cn.conversation-list%20%7B%5Cn%20%20--anchor-bubble-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%20%20--anchor-bubble-active-bg%3A%20%23b9d7ff%3B%5Cn%20%20--tr-bubble-list-gap%3A%2016px%3B%5Cn%20%20--tr-bubble-list-padding%3A%2024px%2072px%2040px%3B%5Cn%20%20--tr-bubble-max-width%3A%20560px%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%7D%5Cn%5Cn%3Aglobal(%5Bdata-tr-color-mode%3D'dark'%5D%20.conversation-list)%20%7B%5Cn%20%20--anchor-bubble-bg%3A%20color-mix(in%20srgb%2C%20%23317af7%2030%25%2C%20var(--tr-container-bg-default))%3B%5Cn%20%20--anchor-bubble-active-bg%3A%20color-mix(in%20srgb%2C%20%23317af7%2040%25%2C%20var(--tr-container-bg-default))%3B%5Cn%7D%5Cn%5Cn.nav.is-right%20%7B%5Cn%20%20right%3A%2016px%3B%5Cn%7D%5Cn%5Cn.nav.is-left%20%7B%5Cn%20%20left%3A%2016px%3B%5Cn%7D%5Cn%5Cn%3Adeep(.user-bubble-target)%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--anchor-bubble-bg)%3B%5Cn%20%20scroll-margin-top%3A%2020px%3B%5Cn%7D%5Cn%5Cn%3Adeep(.user-bubble-active)%20%7B%5Cn%20%20animation%3A%20user-bubble-active-flash%201.8s%20ease-out%20!important%3B%5Cn%7D%5Cn%5Cn%40keyframes%20user-bubble-active-flash%20%7B%5Cn%20%200%25%2C%5Cn%20%2025%25%20%7B%5Cn%20%20%20%20background-color%3A%20var(--anchor-bubble-active-bg)%3B%5Cn%20%20%7D%5Cn%20%2045%25%20%7B%5Cn%20%20%20%20background-color%3A%20var(--anchor-bubble-bg)%3B%5Cn%20%20%7D%5Cn%20%2065%25%2C%5Cn%20%2085%25%20%7B%5Cn%20%20%20%20background-color%3A%20var(--anchor-bubble-active-bg)%3B%5Cn%20%20%7D%5Cn%20%20100%25%20%7B%5Cn%20%20%20%20background-color%3A%20var(--anchor-bubble-bg)%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22controlled-search.messages.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fanchor%2Fcontrolled-search.messages.ts%22%2C%22code%22%3A%22type%20AnchorDemoMessage%20%3D%20%7B%5Cn%20%20id%3A%20string%5Cn%20%20role%3A%20'user'%20%7C%20'assistant'%5Cn%20%20content%3A%20string%5Cn%7D%5Cn%5Cnexport%20const%20controlledSearchMessages%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'u-discovery'%2C%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'%E6%98%A0%E5%B0%84%E5%85%B3%E7%B3%BB%E5%BA%94%E8%AF%A5%E6%80%8E%E4%B9%88%E8%AE%BE%E8%AE%A1%EF%BC%9F'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'assistant-u-discovery'%2C%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%5Cn%20%20%20%20%20%20'%E5%8F%AF%E4%BB%A5%E6%8A%8A%E6%AF%8F%E4%B8%80%E8%BD%AE%E7%94%A8%E6%88%B7%E6%8F%90%E9%97%AE%E8%A7%86%E4%B8%BA%E4%B8%80%E4%B8%AA%E7%A8%B3%E5%AE%9A%E9%94%9A%E7%82%B9%EF%BC%9A%E7%9B%AE%E5%BD%95%E6%95%B0%E6%8D%AE%E7%9B%B4%E6%8E%A5%E6%9D%A5%E6%BA%90%E4%BA%8E%E7%94%A8%E6%88%B7%E6%B6%88%E6%81%AF%E6%9C%AC%E8%BA%AB%EF%BC%8CBubbleList%20%E8%B4%9F%E8%B4%A3%E6%B8%B2%E6%9F%93%E5%AE%8C%E6%95%B4%E4%B8%8A%E4%B8%8B%E6%96%87%EF%BC%8CAnchor%20%E5%8F%AA%E6%B6%88%E8%B4%B9%5C%22%E7%94%A8%E6%88%B7%E9%97%AE%E9%A2%98%E6%91%98%E8%A6%81%20%2B%20%E5%AF%B9%E5%BA%94%20DOM%20%E9%94%9A%E7%82%B9%5C%22%E3%80%82%E8%BF%99%E6%A0%B7%E7%9B%AE%E5%BD%95%E3%80%81%E6%BB%9A%E5%8A%A8%E5%AE%9A%E4%BD%8D%E5%92%8C%E9%98%85%E8%AF%BB%E4%B8%8A%E4%B8%8B%E6%96%87%E4%BC%9A%E5%A4%A9%E7%84%B6%E4%BF%9D%E6%8C%81%E4%B8%80%E8%87%B4%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'u-feedback'%2C%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'%E7%82%B9%E5%87%BB%E7%9B%AE%E5%BD%95%E4%B9%8B%E5%90%8E%EF%BC%8C%E6%88%91%E4%B8%8D%E6%83%B3%E5%8F%AA%E6%98%AF%E6%BB%9A%E8%BF%87%E5%8E%BB%E8%80%8C%E5%B7%B2%EF%BC%9B%E6%9C%80%E5%A5%BD%E8%AE%A9%E5%AF%B9%E5%BA%94%E7%9A%84%E7%94%A8%E6%88%B7%E6%B0%94%E6%B3%A1%E8%BD%BB%E5%BE%AE%E9%97%AA%E4%B8%80%E4%B8%8B%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'assistant-u-feedback'%2C%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%5Cn%20%20%20%20%20%20'%E8%BF%99%E9%9D%9E%E5%B8%B8%E9%80%82%E5%90%88%20jump%20feedback%E3%80%82%E5%8F%AA%E8%A6%81%E7%9B%AE%E5%BD%95%E9%A1%B9%E5%92%8C%E7%9C%9F%E5%AE%9E%E7%94%A8%E6%88%B7%E6%B0%94%E6%B3%A1%E4%B9%8B%E9%97%B4%E7%9A%84%E5%AE%9A%E4%BD%8D%E9%93%BE%E8%B7%AF%E7%A8%B3%E5%AE%9A%EF%BC%8C%E7%82%B9%E5%87%BB%E7%9B%AE%E5%BD%95%E4%B9%8B%E5%90%8E%E5%B0%B1%E5%8F%AF%E4%BB%A5%E7%9B%B4%E6%8E%A5%E7%BB%99%E5%AF%B9%E5%BA%94%E6%B0%94%E6%B3%A1%E5%8A%A0%E4%B8%80%E5%B1%82%E8%BD%BB%E5%8F%8D%E9%A6%88%EF%BC%8C%E8%AE%A9%E7%94%A8%E6%88%B7%E6%98%8E%E7%A1%AE%E7%9F%A5%E9%81%93%E5%BD%93%E5%89%8D%E8%B7%B3%E5%88%B0%E7%9A%84%E6%98%AF%E5%93%AA%E4%B8%80%E8%BD%AE%E5%AF%B9%E8%AF%9D%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'u-tooltip'%2C%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'%E8%BF%99%E9%87%8C%E6%88%91%E8%BF%98%E6%83%B3%E9%A1%BA%E4%BE%BF%E9%AA%8C%E8%AF%81%E8%B6%85%E9%95%BF%E7%9B%AE%E5%BD%95%E6%96%87%E6%A1%88%E8%A2%AB%E6%88%AA%E6%96%AD%E4%B9%8B%E5%90%8E%EF%BC%8Ctooltip%20%E8%83%BD%E4%B8%8D%E8%83%BD%E5%AE%8C%E6%95%B4%E5%B1%95%E7%A4%BA%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'assistant-u-tooltip'%2C%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%5Cn%20%20%20%20%20%20'%E9%95%BF%E6%96%87%E6%A1%88%E5%BE%88%E9%80%82%E5%90%88%E5%9C%A8%E7%9B%AE%E5%BD%95%E9%87%8C%E5%81%9A%E7%9C%81%E7%95%A5%EF%BC%8C%E5%9C%A8%20tooltip%20%E4%B8%AD%E4%BF%9D%E7%95%99%E5%AE%8C%E6%95%B4%E8%AF%AD%E4%B9%89%E3%80%82%E8%BF%99%E6%A0%B7%E5%AF%BC%E8%88%AA%E6%9C%AC%E8%BA%AB%E4%BE%9D%E7%84%B6%E7%B4%A7%E5%87%91%EF%BC%8C%E4%BD%86%E7%94%A8%E6%88%B7%E5%9C%A8%E9%9C%80%E8%A6%81%E6%97%B6%E5%8F%88%E8%83%BD%E8%8E%B7%E5%8F%96%E5%AE%8C%E6%95%B4%E9%97%AE%E9%A2%98%E6%8F%8F%E8%BF%B0%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'u-search'%2C%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'%E7%A4%BA%E4%BE%8B%E9%87%8C%E5%86%8D%E5%B8%A6%E4%B8%80%E4%B8%AA%20controlled%20search%EF%BC%8C%E4%BC%9A%E4%B8%8D%E4%BC%9A%E6%9B%B4%E8%B4%B4%E8%BF%91%E7%9C%9F%E5%AE%9E%E4%BD%BF%E7%94%A8%E5%9C%BA%E6%99%AF%EF%BC%9F'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'assistant-u-search'%2C%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%5Cn%20%20%20%20%20%20'%E4%BC%9A%E6%9B%B4%E8%B4%B4%E8%BF%91%E3%80%82%E7%9B%AE%E5%BD%95%E7%9A%84%20label%20%E5%8F%AF%E4%BB%A5%E4%BF%9D%E6%8C%81%E9%97%AE%E9%A2%98%E6%91%98%E8%A6%81%EF%BC%8CsearchText%20%E5%86%8D%E6%8A%8A%E7%94%A8%E6%88%B7%E6%8F%90%E9%97%AE%E5%92%8C%E5%8A%A9%E6%89%8B%E5%9B%9E%E5%A4%8D%E9%83%BD%E6%8B%BC%E6%8E%A5%E8%BF%9B%E5%8E%BB%EF%BC%8C%E8%BF%99%E6%A0%B7%E6%97%A2%E4%BF%9D%E7%95%99%E4%BA%86%E7%9B%AE%E5%BD%95%E8%AF%AD%E4%B9%89%EF%BC%8C%E4%B9%9F%E6%8F%90%E9%AB%98%E4%BA%86%E6%90%9C%E7%B4%A2%E5%8F%AC%E5%9B%9E%E7%8E%87%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D%20satisfies%20AnchorDemoMessage%5B%5D%5Cn%22%7D%2C%22demo-shell.css%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fanchor%2Fdemo-shell.css%22%2C%22code%22%3A%22.demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%20var(--anchor-demo-gap%2C%2016px)%3B%5Cn%7D%5Cn%5Cn.controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%20var(--anchor-demo-controls-gap%2C%2012px%2016px)%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.controls%20label%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20color%3A%20inherit%3B%5Cn%20%20font-size%3A%20inherit%3B%5Cn%7D%5Cn%5Cn.controls%20button%20%7B%5Cn%20%20padding%3A%204px%2010px%3B%5Cn%7D%5Cn%5Cn.stage%20%7B%5Cn%20%20position%3A%20relative%3B%5Cn%20%20height%3A%20var(--anchor-demo-stage-height%2C%20420px)%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default)%3B%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{a.value=!1}),vueCode:n(f)},A({_:2},[d.value?{name:"vue",fn:o(()=>[t(n(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[3]||(e[3]=c('<p>使用要点：</p><ol><li>目录项 <code>id</code> 与目标节点上的 <code>data-anchor-id</code> 保持一致。</li><li>如果 <code>BubbleList</code> 本身承担滚动，可直接将它的 ref 作为 <code>scrollContainer</code> 来源。</li><li>目录显示文案和搜索文案通过 <code>label / searchText / tooltipText</code> 配置。</li><li>需要搜索时传入 <code>searchOptions</code>；需要外部同步搜索词时使用 <code>v-model:searchQuery</code>。</li><li>需要点击反馈时，使用 <code>targetFeedbackClass / targetFeedbackDuration</code>。</li><li>紧凑会话场景建议让 <code>activeOffset</code> 与目标节点的 <code>scroll-margin-top</code> 保持一致，避免目录激活项提前切换。</li></ol><h3 id="普通内容场景" tabindex="-1">普通内容场景 <a class="header-anchor" href="#普通内容场景" aria-label="Permalink to &quot;普通内容场景&quot;">​</a></h3>',3)),E(t(n(h),null,null,512),[[B,a.value]]),t(i,null,{default:o(()=>[t(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22basic-source.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fanchor%2Fbasic-source.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22controls%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%E5%B1%95%E5%BC%80%E6%A8%A1%E5%BC%8F%3C%2Fspan%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22expandTrigger%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22hover%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20hover%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22expandTrigger%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22manual%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20manual%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctemplate%20v-if%3D%5C%22isManualMode%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22expanded%5C%22%20type%3D%5C%22checkbox%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E5%B1%95%E5%BC%80%E7%9B%AE%E5%BD%95%E9%9D%A2%E6%9D%BF%5Cn%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22expanded%20%3D%20false%5C%22%3E%E6%94%B6%E8%B5%B7%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22expanded%20%3D%20true%5C%22%3E%E5%B1%95%E5%BC%80%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cp%20class%3D%5C%22tip%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20v-if%3D%5C%22isManualMode%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E5%BD%93%E5%89%8D%E4%B8%BA%20%3Ccode%3Emanual%3C%2Fcode%3E%20%E6%A8%A1%E5%BC%8F%EF%BC%8C%E7%9B%AE%E5%BD%95%E9%9D%A2%E6%9D%BF%E4%B8%8D%E5%86%8D%E8%B7%9F%E9%9A%8F%20hover%20%E8%87%AA%E5%8A%A8%E5%B1%95%E5%BC%80%EF%BC%8C%E6%94%B9%E7%94%B1%E5%A4%96%E9%83%A8%20%3Ccode%3Ev-model%3Aexpanded%3C%2Fcode%3E%20%E6%8E%A7%E5%88%B6%E3%80%82%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20v-else%3E%20%E5%BD%93%E5%89%8D%E4%B8%BA%20%3Ccode%3Ehover%3C%2Fcode%3E%20%E6%A8%A1%E5%BC%8F%EF%BC%8C%E9%BC%A0%E6%A0%87%E6%82%AC%E6%B5%AE%E6%88%96%E8%81%9A%E7%84%A6%E5%88%B0%E7%9B%AE%E5%BD%95%E9%9D%A2%E6%9D%BF%E6%97%B6%E4%BC%9A%E8%87%AA%E5%8A%A8%E5%B1%95%E5%BC%80%E3%80%82%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22stage%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollContainerRef%5C%22%20class%3D%5C%22article%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Csection%20v-for%3D%5C%22section%20in%20sections%5C%22%20%3Akey%3D%5C%22section.id%5C%22%20%3Adata-anchor-id%3D%5C%22section.id%5C%22%20class%3D%5C%22article-section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ch4%3E%7B%7B%20section.label%20%7D%7D%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cp%3E%7B%7B%20section.content%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctr-anchor%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22nav%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aitems%3D%5C%22items%5C%22%5Cn%20%20%20%20%20%20%20%20%3Ascroll-container%3D%5C%22scrollContainerRef%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aactive-offset%3D%5C%2220%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aexpand-trigger%3D%5C%22expandTrigger%5C%22%5Cn%20%20%20%20%20%20%20%20v-model%3Aexpanded%3D%5C%22expanded%5C%22%5Cn%20%20%20%20%20%20%20%20%3Asearch-options%3D%5C%22%7B%20placeholder%3A%20'%E6%90%9C%E7%B4%A2%E7%AB%A0%E8%8A%82'%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20target-feedback-class%3D%5C%22article-section--active%5C%22%5Cn%20%20%20%20%20%20%20%20%3Atarget-feedback-duration%3D%5C%221800%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrAnchor%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20basicSourceMessages%20%7D%20from%20'.%2Fbasic-source.messages'%5Cn%5Cnfunction%20isUserMessage(%5Cn%20%20message%3A%20(typeof%20basicSourceMessages)%5Bnumber%5D%2C%5Cn)%3A%20message%20is%20(typeof%20basicSourceMessages)%5Bnumber%5D%20%26%20%7B%20role%3A%20'user'%20%7D%20%7B%5Cn%20%20return%20message.role%20%3D%3D%3D%20'user'%5Cn%7D%5Cn%5Cnconst%20scrollContainerRef%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cnconst%20expandTrigger%20%3D%20ref%3C'hover'%20%7C%20'manual'%3E('hover')%5Cnconst%20expanded%20%3D%20ref(false)%5Cnconst%20isManualMode%20%3D%20computed(()%20%3D%3E%20expandTrigger.value%20%3D%3D%3D%20'manual')%5Cnconst%20messages%20%3D%20basicSourceMessages%5Cnconst%20userMessages%20%3D%20messages.filter(isUserMessage)%5Cnconst%20messageById%20%3D%20new%20Map(messages.map((message)%20%3D%3E%20%5Bmessage.id%2C%20message%5D))%5Cn%5Cnconst%20sections%20%3D%20userMessages.map((message)%20%3D%3E%20%7B%5Cn%20%20const%20assistantReply%20%3D%20messageById.get(%60assistant-%24%7Bmessage.id%7D%60)%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20id%3A%20message.id%2C%5Cn%20%20%20%20label%3A%20message.content%2C%5Cn%20%20%20%20content%3A%20String(assistantReply%3F.content%20%3F%3F%20'')%2C%5Cn%20%20%7D%5Cn%7D)%5Cn%5Cnconst%20items%20%3D%20sections.map((section)%20%3D%3E%20(%7B%5Cn%20%20id%3A%20section.id%2C%5Cn%20%20label%3A%20section.label%2C%5Cn%20%20searchText%3A%20%60%24%7Bsection.label%7D%20%24%7Bsection.content%7D%60%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%20src%3D%5C%22.%2Fdemo-shell.css%5C%22%3E%3C%2Fstyle%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.demo%20%7B%5Cn%20%20--anchor-demo-gap%3A%2014px%3B%5Cn%20%20--anchor-demo-controls-gap%3A%2010px%2012px%3B%5Cn%7D%5Cn%5Cn.tip%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20line-height%3A%201.5%3B%5Cn%7D%5Cn%5Cn.article%20%7B%5Cn%20%20--anchor-section-active-bg%3A%20%23b9d7ff%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20padding%3A%2024px%2028px%3B%5Cn%7D%5Cn%5Cn%3Aglobal(%5Bdata-tr-color-mode%3D'dark'%5D%20.article)%20%7B%5Cn%20%20--anchor-section-active-bg%3A%20color-mix(in%20srgb%2C%20%23317af7%2040%25%2C%20var(--vp-c-bg))%3B%5Cn%7D%5Cn%5Cn.article-section%20%7B%5Cn%20%20padding%3A%2020px%2024px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20scroll-margin-top%3A%2016px%3B%5Cn%7D%5Cn%5Cn.article-section--active%20%7B%5Cn%20%20animation%3A%20section-active%201.4s%20ease-out%20!important%3B%5Cn%7D%5Cn%5Cn%40keyframes%20section-active%20%7B%5Cn%20%200%25%2C%5Cn%20%2025%25%20%7B%5Cn%20%20%20%20background-color%3A%20var(--anchor-section-active-bg)%3B%5Cn%20%20%7D%5Cn%20%2045%25%20%7B%5Cn%20%20%20%20background-color%3A%20var(--vp-c-bg)%3B%5Cn%20%20%7D%5Cn%20%2065%25%2C%5Cn%20%2085%25%20%7B%5Cn%20%20%20%20background-color%3A%20var(--anchor-section-active-bg)%3B%5Cn%20%20%7D%5Cn%20%20100%25%20%7B%5Cn%20%20%20%20background-color%3A%20var(--vp-c-bg)%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn.article-section%20h4%2C%5Cn.article-section%20p%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%7D%5Cn%5Cn.article-section%20h4%20%7B%5Cn%20%20font-size%3A%2018px%3B%5Cn%20%20line-height%3A%201.4%3B%5Cn%7D%5Cn%5Cn.article-section%20p%20%7B%5Cn%20%20white-space%3A%20pre-line%3B%5Cn%7D%5Cn%5Cn.nav%20%7B%5Cn%20%20top%3A%200%3B%5Cn%20%20right%3A%2016px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22basic-source.messages.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fanchor%2Fbasic-source.messages.ts%22%2C%22code%22%3A%22type%20AnchorDemoMessage%20%3D%20%7B%5Cn%20%20id%3A%20string%5Cn%20%20role%3A%20'user'%20%7C%20'assistant'%5Cn%20%20content%3A%20string%5Cn%7D%5Cn%5Cnexport%20const%20basicSourceMessages%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'overview'%2C%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'Overview'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'assistant-overview'%2C%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E8%BF%99%E4%B8%80%E8%8A%82%E4%BB%8B%E7%BB%8D%E7%9B%AE%E5%BD%95%E5%AF%BC%E8%88%AA%E7%9A%84%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95%EF%BC%8C%E4%BB%A5%E5%8F%8A%E5%9C%A8%E9%95%BF%E5%86%85%E5%AE%B9%E5%9C%BA%E6%99%AF%E4%B8%AD%E7%9A%84%E6%95%B4%E4%BD%93%E6%95%88%E6%9E%9C%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'structure'%2C%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'Structure'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'assistant-structure'%2C%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E7%9B%AE%E5%BD%95%E9%A1%B9%E5%8F%AF%E4%BB%A5%E7%9B%B4%E6%8E%A5%E5%AF%B9%E5%BA%94%E5%88%B0%E9%A1%B5%E9%9D%A2%E7%AB%A0%E8%8A%82%EF%BC%8C%E7%BB%93%E6%9E%84%E6%B8%85%E6%99%B0%E6%97%B6%EF%BC%8C%E8%B7%B3%E8%BD%AC%E5%92%8C%E5%9B%9E%E7%9C%8B%E9%83%BD%E4%BC%9A%E6%9B%B4%E5%BF%AB%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'interaction'%2C%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'Interaction'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'assistant-interaction'%2C%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E7%82%B9%E5%87%BB%E7%9B%AE%E5%BD%95%E9%A1%B9%E5%90%8E%E4%BC%9A%E6%BB%9A%E5%8A%A8%E5%88%B0%E5%AF%B9%E5%BA%94%E7%AB%A0%E8%8A%82%EF%BC%8C%E5%90%8C%E6%97%B6%E4%BF%9D%E7%95%99%E5%BD%93%E5%89%8D%E7%AB%A0%E8%8A%82%E7%9A%84%E5%8F%AF%E8%A7%81%E5%8F%8D%E9%A6%88%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'tips'%2C%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'Tips'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'assistant-tips'%2C%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E9%9C%80%E8%A6%81%E6%90%9C%E7%B4%A2%E6%97%B6%E5%8F%AF%E4%BB%A5%E8%A1%A5%E5%85%85%E6%90%9C%E7%B4%A2%E6%96%87%E6%A1%88%EF%BC%8C%E9%9C%80%E8%A6%81%E7%82%B9%E5%87%BB%E5%8F%8D%E9%A6%88%E6%97%B6%E5%8F%AF%E4%BB%A5%E4%B8%BA%E7%9B%AE%E6%A0%87%E7%AB%A0%E8%8A%82%E6%B7%BB%E5%8A%A0%E9%A2%9D%E5%A4%96%E6%A0%B7%E5%BC%8F%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D%20satisfies%20AnchorDemoMessage%5B%5D%5Cn%22%7D%2C%22demo-shell.css%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fanchor%2Fdemo-shell.css%22%2C%22code%22%3A%22.demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%20var(--anchor-demo-gap%2C%2016px)%3B%5Cn%7D%5Cn%5Cn.controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%20var(--anchor-demo-controls-gap%2C%2012px%2016px)%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.controls%20label%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20color%3A%20inherit%3B%5Cn%20%20font-size%3A%20inherit%3B%5Cn%7D%5Cn%5Cn.controls%20button%20%7B%5Cn%20%20padding%3A%204px%2010px%3B%5Cn%7D%5Cn%5Cn.stage%20%7B%5Cn%20%20position%3A%20relative%3B%5Cn%20%20height%3A%20var(--anchor-demo-stage-height%2C%20420px)%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default)%3B%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{a.value=!1}),vueCode:n(v)},A({_:2},[r.value?{name:"vue",fn:o(()=>[t(n(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=c(`<p>使用要点：</p><ul><li>章节节点直接设置 <code>data-anchor-id</code>。</li><li>容器内滚动场景传入 <code>scrollContainer</code>。</li><li>建议让 <code>activeOffset</code> 与章节节点的 <code>scroll-margin-top</code> 保持一致。</li><li><code>expanded</code> 仅在 <code>expandTrigger=&quot;manual&quot;</code> 时生效。</li></ul><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>items</code></td><td><a href="#anchor-item"><code>AnchorItem[]</code></a></td><td>-</td><td>目录项列表。组件默认使用 <code>item.id</code> 匹配 <code>[data-anchor-id=&quot;&lt;id&gt;&quot;]</code>，并滚动到对应节点</td></tr><tr><td><code>scrollContainer</code></td><td><code>HTMLElement | null</code></td><td><code>null</code></td><td>滚动容器。传入后在该容器内解析目标节点并监听其滚动；未传入时回退到页面文档滚动</td></tr><tr><td><code>activeOffset</code></td><td><code>number</code></td><td><code>120</code></td><td>激活项判定时距离滚动容器顶部的偏移量</td></tr><tr><td><code>searchQuery</code></td><td><code>string</code></td><td>非受控</td><td>搜索词。传入后进入受控模式</td></tr><tr><td><code>searchOptions</code></td><td><a href="#anchor-search-options"><code>AnchorSearchOptions</code></a></td><td>-</td><td>搜索区配置。不传时不显示搜索区</td></tr><tr><td><code>tooltipDelay</code></td><td><code>number</code></td><td><code>260</code></td><td>tooltip 显示延迟，避免展开动画过程中短文本被误判为截断</td></tr><tr><td><code>activeId</code></td><td><code>string</code></td><td>非受控</td><td>当前激活项。传入后进入受控模式</td></tr><tr><td><code>expanded</code></td><td><code>boolean</code></td><td><code>false</code></td><td>展开状态。仅在 <code>expandTrigger=&quot;manual&quot;</code> 时生效</td></tr><tr><td><code>placement</code></td><td><code>&#39;left&#39; | &#39;right&#39;</code></td><td><code>&#39;right&#39;</code></td><td>停靠位置</td></tr><tr><td><code>expandTrigger</code></td><td><code>&#39;hover&#39; | &#39;manual&#39;</code></td><td><code>&#39;hover&#39;</code></td><td>展开方式。<code>hover</code> 为自动展开，<code>manual</code> 为不自动展开</td></tr><tr><td><code>targetFeedbackClass</code></td><td><code>string</code></td><td>-</td><td>点击目录项后追加到目标节点上的样式类名</td></tr><tr><td><code>targetFeedbackDuration</code></td><td><code>number</code></td><td><code>700</code></td><td>目标节点样式类名保留时间，单位为毫秒</td></tr><tr><td><code>emptyText</code></td><td><code>string</code></td><td><code>&#39;No matching items&#39;</code></td><td>搜索无结果文案</td></tr></tbody></table><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><table tabindex="0"><thead><tr><th>插槽</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>item</code></td><td><code>{ item, segments, active, expanded, highlighted }</code></td><td>自定义目录项内容</td></tr><tr><td><code>marker</code></td><td><code>{ item, active }</code></td><td>自定义目录点</td></tr><tr><td><code>search</code></td><td><code>{ searchQuery, setSearchQuery, searchOptions }</code></td><td>自定义搜索区</td></tr><tr><td><code>empty</code></td><td>-</td><td>自定义空结果内容</td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><table tabindex="0"><thead><tr><th>事件</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>update:activeId</code></td><td><code>value: string | undefined</code></td><td>当前激活项变化</td></tr><tr><td><code>update:expanded</code></td><td><code>value: boolean</code></td><td>展开状态变化</td></tr><tr><td><code>update:searchQuery</code></td><td><code>value: string</code></td><td>搜索词变化</td></tr><tr><td><code>select</code></td><td>item: <a href="#anchor-item"><code>AnchorItem</code></a></td><td>目录项被选中时触发</td></tr></tbody></table><h2 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h2><h3 id="anchor-item" tabindex="-1">AnchorItem <a class="header-anchor" href="#anchor-item" aria-label="Permalink to &quot;AnchorItem {#anchor-item}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>id</code></td><td><code>string</code></td><td>唯一标识，同时用于匹配目标节点</td></tr><tr><td><code>label</code></td><td><code>string</code></td><td>目录显示文本</td></tr><tr><td><code>searchText</code></td><td><code>string</code></td><td>搜索时额外匹配的文本</td></tr><tr><td><code>tooltipText</code></td><td><code>string</code></td><td>自定义 tooltip 文案</td></tr><tr><td><code>meta</code></td><td><code>Record&lt;string, unknown&gt;</code></td><td>自定义透传数据</td></tr></tbody></table><h3 id="anchor-search-options" tabindex="-1">AnchorSearchOptions <a class="header-anchor" href="#anchor-search-options" aria-label="Permalink to &quot;AnchorSearchOptions {#anchor-search-options}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>placeholder</code></td><td><code>string</code></td><td>搜索框占位文案</td></tr><tr><td><code>matcher</code></td><td><a href="#anchor-search-matcher"><code>AnchorSearchMatcher</code></a></td><td>自定义搜索匹配逻辑</td></tr><tr><td><code>clearOnCollapse</code></td><td><code>boolean</code></td><td>收起时是否清空搜索词</td></tr></tbody></table><h3 id="anchor-search-matcher" tabindex="-1">AnchorSearchMatcher <a class="header-anchor" href="#anchor-search-matcher" aria-label="Permalink to &quot;AnchorSearchMatcher {#anchor-search-matcher}&quot;">​</a></h3><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AnchorSearchMatcher</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  item</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AnchorItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  searchQuery</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AnchorHighlightSegment</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span></code></pre></div><p>返回 <code>false</code> 表示当前项不匹配；返回高亮片段数组表示匹配成功，并使用返回结果渲染高亮内容。</p><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><table tabindex="0"><thead><tr><th>CSS 变量</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-anchor-width-collapsed</code></td><td>折叠态宽度</td></tr><tr><td><code>--tr-anchor-width-expanded</code></td><td>展开态宽度</td></tr><tr><td><code>--tr-anchor-surface-radius</code></td><td>面板圆角</td></tr><tr><td><code>--tr-anchor-item-radius</code></td><td>目录项圆角</td></tr><tr><td><code>--tr-anchor-marker-width</code></td><td>目录点宽度</td></tr><tr><td><code>--tr-anchor-marker-height</code></td><td>目录点高度</td></tr><tr><td><code>--tr-anchor-marker-radius</code></td><td>目录点圆角</td></tr><tr><td><code>--tr-anchor-marker-track-size</code></td><td>目录点轨道尺寸</td></tr><tr><td><code>--tr-anchor-bg</code></td><td>面板背景色</td></tr><tr><td><code>--tr-anchor-border</code></td><td>面板边框色</td></tr><tr><td><code>--tr-anchor-shadow</code></td><td>面板阴影</td></tr><tr><td><code>--tr-anchor-item-color</code></td><td>目录项文本色</td></tr><tr><td><code>--tr-anchor-item-color-active</code></td><td>激活目录项文本色</td></tr><tr><td><code>--tr-anchor-item-bg-hover</code></td><td>目录项 hover 背景色</td></tr><tr><td><code>--tr-anchor-marker-color</code></td><td>默认目录点颜色</td></tr><tr><td><code>--tr-anchor-marker-color-active</code></td><td>激活目录点颜色</td></tr><tr><td><code>--tr-anchor-tooltip-bg</code></td><td>tooltip 背景色</td></tr><tr><td><code>--tr-anchor-tooltip-color</code></td><td>tooltip 文本色</td></tr><tr><td><code>--tr-anchor-tooltip-shadow</code></td><td>tooltip 阴影</td></tr><tr><td><code>--tr-anchor-search-bg</code></td><td>搜索框背景色</td></tr><tr><td><code>--tr-anchor-search-color</code></td><td>搜索框文本色</td></tr><tr><td><code>--tr-anchor-search-border</code></td><td>搜索框边框色</td></tr><tr><td><code>--tr-anchor-search-border-focus</code></td><td>搜索框聚焦边框色</td></tr><tr><td><code>--tr-anchor-search-focus-ring</code></td><td>搜索框聚焦外环</td></tr><tr><td><code>--tr-anchor-search-radius</code></td><td>搜索框圆角</td></tr><tr><td><code>--tr-anchor-empty-color</code></td><td>空结果文本色</td></tr><tr><td><code>--tr-anchor-focus-ring</code></td><td>目录项聚焦外环</td></tr><tr><td><code>--tr-anchor-highlight-color</code></td><td>搜索高亮色</td></tr></tbody></table>`,18))])}}});export{M as __pageData,T as default};

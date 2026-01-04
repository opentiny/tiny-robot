const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Basic.CE1k-ioH.js","assets/chunks/theme.D7wfWZVO.js","assets/chunks/framework.BuZswkqo.js","assets/chunks/index.DAdSMkUW.js"])))=>i.map(i=>d[i]);
import{r,s as E,A as o,_ as d,H as C,e as g,o as y,q as i,ah as F,J as a,a4 as A,g as e,ai as c,x as n,i as p,ak as B}from"./chunks/framework.BuZswkqo.js";import{L as D,N as u}from"./chunks/index.Clg40gXO.js";const v=`<template>
  <h1>会话</h1>
  <tr-bubble-list :items="messages" :roles="roles"></tr-bubble-list>
  <div class="actions">
    <span><b>切换会话</b></span
    ><tiny-select :modelValue="state.currentId" :options="options" @change="switchConversation($event)"></tiny-select>
    <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { useConversation, AIClient, ConversationStorageStrategy, Conversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinySelect, TinyButton } from '@opentiny/vue'
import { computed, h } from 'vue'

class MockStorageStrategy implements ConversationStorageStrategy {
  mockData: Conversation[] = [
    {
      id: 'm9zfbomexdm9pza',
      title: '安排日程',
      createdAt: 1745744706662,
      updatedAt: 1745744717297,
      messages: [
        {
          role: 'user',
          content: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
        },
        {
          role: 'assistant',
          content: '这是对 "今天需要我帮你安排日程，规划旅行，还是起草一封邮件？" 的模拟回复。',
        },
      ],
      metadata: {},
    },
    {
      id: 'm9zefqta1rihhpj',
      title: '写段文案',
      createdAt: 1745743216510,
      updatedAt: 1745744704671,
      messages: [
        {
          role: 'user',
          content: '想写段文案、起个名字，还是来点灵感？',
        },
        {
          role: 'assistant',
          content: '这是对 "想写段文案、起个名字，还是来点灵感？" 的模拟回复。',
        },
        {
          role: 'user',
          content: 'hello',
        },
        {
          role: 'assistant',
          content: '你好！我是TinyRobot搭建的AI助手。你可以问我任何问题，我会尽力回答。',
        },
      ],
      metadata: {},
    },
  ]

  async saveConversations(conversations: Conversation[]) {
    this.mockData = conversations
  }

  async loadConversations(): Promise<Conversation[]> {
    return this.mockData || []
  }
}

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
    maxWidth: '80%',
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    maxWidth: '80%',
  },
}

const client = new AIClient({
  provider: 'openai',
  // apiKey: 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: window.parent?.location.origin || location.origin + import.meta.env.BASE_URL,
})

const storage = new MockStorageStrategy()
const {
  state,
  messageManager: { messages }, // 与 useMessage 返回一致，具体查看useMessage
  createConversation,
  switchConversation,
} = useConversation({ client, storage })

const options = computed(() =>
  state.conversations.map((conversation) => ({
    label: conversation.title,
    value: conversation.id,
  })),
)

console.log('state: ', state)
<\/script>

<style scoped>
.tiny-select {
  width: 280px;
  margin-left: 4px;
}

.tiny-button {
  margin-left: 10px;
}

.actions {
  display: flex;
  align-items: center;
  margin-top: 10px;
}
</style>
`,x=JSON.parse('{"title":"对话管理 useConversation","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/conversation.md","filePath":"tools/conversation.md"}'),m={name:"tools/conversation.md"},_=Object.assign(m,{setup(b){const l=r(!0),t=E();return o(async()=>{t.value=(await d(async()=>{const{default:h}=await import("./chunks/Basic.CE1k-ioH.js");return{default:h}},__vite__mapDeps([0,1,2,3]))).default}),(h,s)=>{const k=C("ClientOnly");return y(),g("div",null,[s[1]||(s[1]=i("h1",{id:"对话管理-useconversation",tabindex:"-1"},[e("对话管理 useConversation "),i("a",{class:"header-anchor",href:"#对话管理-useconversation","aria-label":'Permalink to "对话管理 useConversation"'},"​")],-1)),s[2]||(s[2]=i("p",null,[i("code",null,"useConversation"),e(" 是一个对话管理工具，它可以帮助你管理对话的状态和历史记录。")],-1)),s[3]||(s[3]=i("h2",{id:"示例",tabindex:"-1"},[e("示例 "),i("a",{class:"header-anchor",href:"#示例","aria-label":'Permalink to "示例"'},"​")],-1)),F(a(n(D),null,null,512),[[c,l.value]]),a(k,null,{default:p(()=>[a(n(u),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FBasic.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ch1%3E%E4%BC%9A%E8%AF%9D%3C%2Fh1%3E%5Cn%20%20%3Ctr-bubble-list%20%3Aitems%3D%5C%22messages%5C%22%20%3Aroles%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%5Cn%20%20%20%20%3E%3Ctiny-select%20%3AmodelValue%3D%5C%22state.currentId%5C%22%20%3Aoptions%3D%5C%22options%5C%22%20%40change%3D%5C%22switchConversation(%24event)%5C%22%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createConversation()%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20useConversation%2C%20AIClient%2C%20ConversationStorageStrategy%2C%20Conversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySelect%2C%20TinyButton%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnclass%20MockStorageStrategy%20implements%20ConversationStorageStrategy%20%7B%5Cn%20%20mockData%3A%20Conversation%5B%5D%20%3D%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20id%3A%20'm9zfbomexdm9pza'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B'%2C%5Cn%20%20%20%20%20%20createdAt%3A%201745744706662%2C%5Cn%20%20%20%20%20%20updatedAt%3A%201745744717297%2C%5Cn%20%20%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E5%AF%B9%20%5C%22%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F%5C%22%20%E7%9A%84%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20metadata%3A%20%7B%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20id%3A%20'm9zefqta1rihhpj'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88'%2C%5Cn%20%20%20%20%20%20createdAt%3A%201745743216510%2C%5Cn%20%20%20%20%20%20updatedAt%3A%201745744704671%2C%5Cn%20%20%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E5%AF%B9%20%5C%22%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F%5C%22%20%E7%9A%84%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'hello'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E4%BD%A0%E5%A5%BD%EF%BC%81%E6%88%91%E6%98%AFTinyRobot%E6%90%AD%E5%BB%BA%E7%9A%84AI%E5%8A%A9%E6%89%8B%E3%80%82%E4%BD%A0%E5%8F%AF%E4%BB%A5%E9%97%AE%E6%88%91%E4%BB%BB%E4%BD%95%E9%97%AE%E9%A2%98%EF%BC%8C%E6%88%91%E4%BC%9A%E5%B0%BD%E5%8A%9B%E5%9B%9E%E7%AD%94%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20metadata%3A%20%7B%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%5Cn%5Cn%20%20async%20saveConversations(conversations%3A%20Conversation%5B%5D)%20%7B%5Cn%20%20%20%20this.mockData%20%3D%20conversations%5Cn%20%20%7D%5Cn%5Cn%20%20async%20loadConversations()%3A%20Promise%3CConversation%5B%5D%3E%20%7B%5Cn%20%20%20%20return%20this.mockData%20%7C%7C%20%5B%5D%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20client%20%3D%20new%20AIClient(%7B%5Cn%20%20provider%3A%20'openai'%2C%5Cn%20%20%2F%2F%20apiKey%3A%20'your-api-key'%2C%5Cn%20%20defaultModel%3A%20'gpt-3.5-turbo'%2C%5Cn%20%20apiUrl%3A%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20'%2Ftiny-robot%2Falpha%2F'%2C%5Cn%7D)%5Cn%5Cnconst%20storage%20%3D%20new%20MockStorageStrategy()%5Cnconst%20%7B%5Cn%20%20state%2C%5Cn%20%20messageManager%3A%20%7B%20messages%20%7D%2C%20%2F%2F%20%E4%B8%8E%20useMessage%20%E8%BF%94%E5%9B%9E%E4%B8%80%E8%87%B4%EF%BC%8C%E5%85%B7%E4%BD%93%E6%9F%A5%E7%9C%8BuseMessage%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%7D%20%3D%20useConversation(%7B%20client%2C%20storage%20%7D)%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20state.conversations.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cnconsole.log('state%3A%20'%2C%20state)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{l.value=!1}),vueCode:n(v)},B({_:2},[t.value?{name:"vue",fn:p(()=>[a(n(t))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[4]||(s[4]=A(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="选项" tabindex="-1">选项 <a class="header-anchor" href="#选项" aria-label="Permalink to &quot;选项&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseConversationOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** AI客户端实例 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  client</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AIClient</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 存储策略 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  storage</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationStorageStrategy</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 是否自动保存 (default: true) */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  autoSave</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 是否允许空会话 (default: false) */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  allowEmpty</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 是否默认使用流式响应 (default: true)*/</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  useStreamByDefault</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 错误消息模板 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  errorMessage</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 事件回调 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  events</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseConversationEvents</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="事件类型" tabindex="-1">事件类型 <a class="header-anchor" href="#事件类型" aria-label="Permalink to &quot;事件类型&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseConversationEvents</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseMessageOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;events&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话加载完成回调 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onLoaded</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">conversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="返回值" tabindex="-1">返回值 <a class="header-anchor" href="#返回值" aria-label="Permalink to &quot;返回值&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseConversationReturn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话状态 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  state</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 消息管理 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  messageManager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseMessageReturn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 创建新会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  createConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">metadata</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 切换会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  switchConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 删除会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  deleteConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 更新会话标题 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  updateTitle</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 更新会话元数据 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  updateMetadata</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">metadata</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 保存会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  saveConversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 加载会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  loadConversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 生成会话标题 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  generateTitle</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 获取当前会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getCurrentConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="会话状态" tabindex="-1">会话状态 <a class="header-anchor" href="#会话状态" aria-label="Permalink to &quot;会话状态&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话列表 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  conversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[];</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 当前会话ID */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  currentId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 是否正在加载 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  loading</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="会话接口" tabindex="-1">会话接口 <a class="header-anchor" href="#会话接口" aria-label="Permalink to &quot;会话接口&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话ID */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话标题 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 创建时间 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  createdAt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 更新时间 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  updatedAt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 自定义元数据 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  metadata</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 消息 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  messages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="自定义存储策略" tabindex="-1">自定义存储策略 <a class="header-anchor" href="#自定义存储策略" aria-label="Permalink to &quot;自定义存储策略&quot;">​</a></h3><p>默认使用 LocalStorage 存储会话数据，你也可以实现自定义的存储策略：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationStorageStrategy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 保存会话列表 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  saveConversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">conversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 加载会话列表 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  loadConversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自定义存储策略示例</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> CustomStorageStrategy</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> implements</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationStorageStrategy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  async</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> saveConversations</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">conversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 实现自定义存储逻辑</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  async</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadConversations</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt; {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 实现自定义加载逻辑</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用自定义存储策略</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> conversationManager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useConversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  client,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  storage: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> CustomStorageStrategy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div>`,14))])}}});export{x as __pageData,_ as default};

const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/popover-other-status.CQkVUEcY.js","assets/chunks/index.CbhXsEHC.js","assets/chunks/framework.kTfunus-.js","assets/chunks/index2.DXNIapAb.js","assets/chunks/tiny-robot-svgs.BaAiG9Fu.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/index.DM95O2dU.js","assets/chunks/popover-grouped.Di0Ovnz3.js","assets/chunks/tiny-robot-svgs.Ct4S-7ct.js","assets/chunks/popover-trigger.BWe7GwJS.js","assets/chunks/popover-basic.H9ryeDo9.js"])))=>i.map(i=>d[i]);
import{p as l,v as c,V as r,C as x,c as y,o as P,ag as m,ah as u,G as e,j as a,ai as p,k as o,w as i,a as b}from"./chunks/framework.kTfunus-.js";import{O as g,E as h}from"./chunks/index.Bs5OpVoR.js";const S=`<template>
  <div style="display: flex; gap: 8px; justify-content: space-around">
    <SuggestionPopover :data="[]" :loading="true">
      <button>加载中状态</button>
    </SuggestionPopover>
    <SuggestionPopover :data="[]">
      <button>空状态</button>
    </SuggestionPopover>
  </div>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'
<\/script>
`,w=`<template>
  <SuggestionPopover
    :data="groups"
    :selectedGroup="selectedGroup"
    @item-click="(item) => console.log(item)"
    @group-click="(group) => console.log(group)"
  >
    <button>分组数据</button>
  </SuggestionPopover>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'
import { IconLike, IconDislike } from '@opentiny/tiny-robot-svgs'
import { ref } from 'vue'

const groups = [
  {
    group: 'basic',
    label: '推荐',
    icon: IconLike,
    items: [
      { id: 'b1', text: '什么是弹性云服务器?' },
      { id: 'b2', text: '如何登录到Windows云服务器?' },
      { id: 'b3', text: '弹性公网IP为什么ping不通?' },
      { id: 'b4', text: '云服务器安全组如何配置?' },
      { id: 'b5', text: '如何查看云服务器密码?' },
      { id: 'b6', text: '什么是弹性云服务器?' },
      { id: 'b7', text: '如何登录到Windows云服务器?' },
      { id: 'b8', text: '弹性公网IP为什么ping不通?' },
      { id: 'b9', text: '云服务器安全组如何配置?' },
      { id: 'b0', text: '如何查看云服务器密码?' },
    ],
  },
  {
    group: 'purchase',
    label: '购买咨询',
    icon: IconDislike,
    items: [
      { id: 'p1', text: '如何购买弹性云服务器?' },
      { id: 'p2', text: '无法登录弹性云服务器怎么办?' },
      { id: 'p3', text: '云服务器价格怎么计算?' },
      { id: 'p4', text: '如何查看账单详情?' },
      { id: 'p5', text: '如何续费云服务器?' },
    ],
  },
  {
    group: 'usage',
    label: '使用咨询',
    icon: IconLike,
    items: [
      { id: 'u1', text: '云服务器使用限制与须知' },
      { id: 'u2', text: '使用RDP文件连接Windows实例' },
      { id: 'u3', text: '多用户登录（Windows2016）' },
      { id: 'u4', text: '如何重置云服务器密码?' },
      { id: 'u5', text: '云服务器如何安装软件?' },
    ],
  },
  { group: '4', label: '推荐', icon: IconLike, items: [] },
  { group: '5', label: '购买咨询', icon: IconLike, items: [] },
  { group: '6', label: '使用咨询', icon: IconLike, items: [] },
  { group: '7', label: '购买咨询', icon: IconLike, items: [] },
  { group: '8', label: '使用咨询', icon: IconLike, items: [] },
  { group: '9', label: '购买咨询', icon: IconLike, items: [] },
  { group: '10', label: '使用咨询', icon: IconLike, items: [] },
]

const selectedGroup = ref(groups[1].group)
<\/script>
`,C=`<template>
  <div style="display: flex; gap: 8px; justify-content: space-around">
    <SuggestionPopover
      :data="data"
      trigger="click"
      @open="console.log('open')"
      @close="console.log('close')"
      @item-click="console.log('item-click')"
      @click-outside="console.log('click-outside')"
    >
      <button>click触发</button>
    </SuggestionPopover>
    <SuggestionPopover
      :data="data"
      :show="show"
      trigger="manual"
      @close="handleClose"
      @item-click="console.log('item-click')"
      @click-outside="console.log('click-outside')"
    >
      <button @click="show = !show">manual触发</button>
    </SuggestionPopover>
  </div>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'
import { ref } from 'vue'

const show = ref(false)

const handleClose = () => {
  console.log('close')
  show.value = false
}

const data = [
  { id: 'b1', text: '什么是弹性云服务器?' },
  { id: 'b2', text: '如何登录到Windows云服务器?' },
  { id: 'b3', text: '弹性公网IP为什么ping不通?' },
  { id: 'b4', text: '云服务器安全组如何配置?' },
  { id: 'b5', text: '如何查看云服务器密码?' },
  { id: 'b6', text: '什么是弹性云服务器?' },
  { id: 'b7', text: '如何登录到Windows云服务器?' },
  { id: 'b8', text: '弹性公网IP为什么ping不通?' },
  { id: 'b9', text: '云服务器安全组如何配置?' },
  { id: 'b0', text: '如何查看云服务器密码?' },
]
<\/script>
`,G=`<template>
  <SuggestionPopover :data="data" @item-click="(item) => console.log(item)">
    <button>点击弹出SuggestionPopover</button>
  </SuggestionPopover>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'

const data = [
  { id: 'b1', text: '什么是弹性云服务器?' },
  { id: 'b2', text: '如何登录到Windows云服务器?' },
  { id: 'b3', text: '弹性公网IP为什么ping不通?' },
  { id: 'b4', text: '云服务器安全组如何配置云服务器安全组如何配置云服务器安全组如何配置?' },
  { id: 'b5', text: '如何查看云服务器密码如何查看云服务器密码如何查看云服务器密码如何查看云服务器密码?' },
  { id: 'b6', text: '什么是弹性云服务器什么是弹性云服务器什么是弹性云服务器什么是弹性云服务器什么是弹性云服务器?' },
  {
    id: 'b7',
    text: '如何登录到Windows云服务器如何登录到Windows云服务器如何登录到Windows云服务器如何登录到Windows云服务器?',
  },
  { id: 'b8', text: '弹性公网IP为什么ping不通?' },
  { id: 'b9', text: '云服务器安全组如何配置?' },
  { id: 'b0', text: '如何查看云服务器密码?' },
]
<\/script>
`,A=JSON.parse('{"title":"SuggestionPopover 建议弹出框","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/suggestion-popover.md","filePath":"components/suggestion-popover.md"}'),D={name:"components/suggestion-popover.md"},R=Object.assign(D,{setup(T){const v=l();c(async()=>{v.value=(await r(async()=>{const{default:n}=await import("./chunks/popover-other-status.CQkVUEcY.js");return{default:n}},__vite__mapDeps([0,1,2,3,4,5,6,7]))).default});const k=l();c(async()=>{k.value=(await r(async()=>{const{default:n}=await import("./chunks/popover-grouped.Di0Ovnz3.js");return{default:n}},__vite__mapDeps([8,1,2,3,4,5,6,7,9]))).default});const _=l();c(async()=>{_.value=(await r(async()=>{const{default:n}=await import("./chunks/popover-trigger.BWe7GwJS.js");return{default:n}},__vite__mapDeps([10,1,2,3,4,5,6,7]))).default});const d=l(!0),f=l();return c(async()=>{f.value=(await r(async()=>{const{default:n}=await import("./chunks/popover-basic.H9ryeDo9.js");return{default:n}},__vite__mapDeps([11,1,2,3,4,5,6,7]))).default}),(n,t)=>{const s=x("ClientOnly");return P(),y("div",null,[t[4]||(t[4]=m("",4)),u(e(o(g),null,null,512),[[p,d.value]]),e(s,null,{default:i(()=>[e(o(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{d.value=!1}),vueCode:o(G)},{vue:i(()=>[e(o(f))]),_:1},8,["vueCode"])]),_:1}),t[5]||(t[5]=m("",2)),u(e(o(g),null,null,512),[[p,d.value]]),e(s,null,{default:i(()=>[e(o(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[1]||(t[1]=()=>{d.value=!1}),vueCode:o(C)},{vue:i(()=>[e(o(_))]),_:1},8,["vueCode"])]),_:1}),t[6]||(t[6]=a("h3",{id:"分组数据",tabindex:"-1"},[b("分组数据 "),a("a",{class:"header-anchor",href:"#分组数据","aria-label":'Permalink to "分组数据"'},"​")],-1)),t[7]||(t[7]=a("p",null,[a("code",null,"data"),b(" 数组中的项，添加 "),a("code",null,"group"),b(" 字段来表示为分组数据。分组数据和普通数据不能混合")],-1)),u(e(o(g),null,null,512),[[p,d.value]]),e(s,null,{default:i(()=>[e(o(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[2]||(t[2]=()=>{d.value=!1}),vueCode:o(w)},{vue:i(()=>[e(o(k))]),_:1},8,["vueCode"])]),_:1}),t[8]||(t[8]=a("h3",{id:"加载中和空数据",tabindex:"-1"},[b("加载中和空数据 "),a("a",{class:"header-anchor",href:"#加载中和空数据","aria-label":'Permalink to "加载中和空数据"'},"​")],-1)),u(e(o(g),null,null,512),[[p,d.value]]),e(s,null,{default:i(()=>[e(o(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[3]||(t[3]=()=>{d.value=!1}),vueCode:o(S)},{vue:i(()=>[e(o(v))]),_:1},8,["vueCode"])]),_:1}),t[9]||(t[9]=m("",25))])}}});export{A as __pageData,R as default};

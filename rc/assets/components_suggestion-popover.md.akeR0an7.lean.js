const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/popover-slots.BciudvY-.js","assets/chunks/theme.DzanhAsN.js","assets/chunks/framework.CHy1OJJB.js","assets/chunks/popover-other-status.D-3nhIMI.js","assets/chunks/popover-custom-item.D9R_8q5T.js","assets/chunks/popover-grouped.Bkdzs5OO.js","assets/chunks/popover-trigger.znHwup4O.js","assets/chunks/popover-basic.BNv01G6w.js"])))=>i.map(i=>d[i]);
import{s as r,A as c,_ as u,r as w,H as Z,e as P,o as X,a4 as _,ah as p,J as e,q as o,ai as g,x as n,i,ak as m,g as s}from"./chunks/framework.CHy1OJJB.js";import{L as h,N as b}from"./chunks/index.BOmotwSW.js";const S=`<template>
  <SuggestionPopover :data="data" @item-click="(item) => console.log(item)" v-model:show="show" trigger="manual">
    <template #trigger>
      <button @click="show = !show">点击弹出SuggestionPopover</button>
    </template>
    <template #header v-if="customHeader">
      <h3 style="font-size: 20px; font-weight: 500">我是自定义头部</h3>
    </template>
    <template #body v-if="customBody">
      <ul>
        <li v-for="item in data" :key="item.id">
          <span style="font-size: 14px">{{ item.text }}</span>
        </li>
      </ul>
    </template>
  </SuggestionPopover>
  <hr />
  <div>
    <div>
      <label>自定义头部</label>
      <tiny-switch v-model="customHeader" />
    </div>
    <div>
      <label>自定义内容</label>
      <tiny-switch v-model="customBody" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'

const show = ref(false)

const customHeader = ref(true)
const customBody = ref(true)

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
`,B=`<template>
  <div style="display: flex; gap: 8px; justify-content: space-around">
    <SuggestionPopover :data="[]" :loading="true">
      <template #trigger>
        <button>加载中状态</button>
      </template>
    </SuggestionPopover>
    <SuggestionPopover :data="[]">
      <template #trigger>
        <button>空状态</button>
      </template>
    </SuggestionPopover>
  </div>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'
<\/script>
`,D=`<template>
  <SuggestionPopover :data="data" @item-click="(item) => console.log(item)">
    <template #trigger>
      <button>点击弹出SuggestionPopover</button>
    </template>
    <template #item="{ item }">
      <span style="color: orange">{{ item.customText }}</span>
    </template>
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
].map((item) => ({ ...item, customText: item.text }))
<\/script>
`,I=`<template>
  <SuggestionPopover
    :data="groups"
    :selectedGroup="selectedGroup"
    @item-click="(item) => console.log(item)"
    @group-click="(group) => console.log(group)"
  >
    <template #trigger>
      <button>分组数据</button>
    </template>
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
`,A=`<template>
  <div style="display: flex; gap: 8px; justify-content: space-around">
    <SuggestionPopover
      :data="data"
      trigger="click"
      @open="console.log('open')"
      @close="console.log('close')"
      @item-click="console.log('item-click')"
      @click-outside="console.log('click-outside')"
    >
      <template #trigger>
        <button>click触发</button>
      </template>
    </SuggestionPopover>
    <SuggestionPopover
      :data="data"
      :show="show"
      trigger="manual"
      @close="handleClose"
      @item-click="console.log('item-click')"
      @click-outside="console.log('click-outside')"
    >
      <template #trigger>
        <button @click="show = !show">manual触发</button>
      </template>
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
`,T=`<template>
  <SuggestionPopover :data="data" @item-click="(item) => console.log(item)">
    <template #trigger>
      <button>点击弹出SuggestionPopover</button>
    </template>
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
`,E=JSON.parse('{"title":"SuggestionPopover 建议弹出框","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/suggestion-popover.md","filePath":"components/suggestion-popover.md"}'),L={name:"components/suggestion-popover.md"},V=Object.assign(L,{setup(C){const v=r();c(async()=>{v.value=(await u(async()=>{const{default:a}=await import("./chunks/popover-slots.BciudvY-.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const y=r();c(async()=>{y.value=(await u(async()=>{const{default:a}=await import("./chunks/popover-other-status.D-3nhIMI.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const f=r();c(async()=>{f.value=(await u(async()=>{const{default:a}=await import("./chunks/popover-custom-item.D9R_8q5T.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const k=r();c(async()=>{k.value=(await u(async()=>{const{default:a}=await import("./chunks/popover-grouped.Bkdzs5OO.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const x=r();c(async()=>{x.value=(await u(async()=>{const{default:a}=await import("./chunks/popover-trigger.znHwup4O.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const d=w(!0),W=r();return c(async()=>{W.value=(await u(async()=>{const{default:a}=await import("./chunks/popover-basic.BNv01G6w.js");return{default:a}},__vite__mapDeps([7,1,2]))).default}),(a,t)=>{const l=Z("ClientOnly");return X(),P("div",null,[t[6]||(t[6]=_("",4)),p(e(n(h),null,null,512),[[g,d.value]]),e(l,null,{default:i(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{d.value=!1}),vueCode:n(T)},m({_:2},[W.value?{name:"vue",fn:i(()=>[e(n(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[7]||(t[7]=_("",2)),p(e(n(h),null,null,512),[[g,d.value]]),e(l,null,{default:i(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{d.value=!1}),vueCode:n(A)},m({_:2},[x.value?{name:"vue",fn:i(()=>[e(n(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[8]||(t[8]=o("h3",{id:"分组数据",tabindex:"-1"},[s("分组数据 "),o("a",{class:"header-anchor",href:"#分组数据","aria-label":'Permalink to "分组数据"'},"​")],-1)),t[9]||(t[9]=o("p",null,[o("code",null,"data"),s(" 数组中的项，添加 "),o("code",null,"group"),s(" 字段来表示为分组数据。分组数据和普通数据不能混合")],-1)),p(e(n(h),null,null,512),[[g,d.value]]),e(l,null,{default:i(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{d.value=!1}),vueCode:n(I)},m({_:2},[k.value?{name:"vue",fn:i(()=>[e(n(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=o("h3",{id:"自定义渲染列表项",tabindex:"-1"},[s("自定义渲染列表项 "),o("a",{class:"header-anchor",href:"#自定义渲染列表项","aria-label":'Permalink to "自定义渲染列表项"'},"​")],-1)),t[11]||(t[11]=o("p",null,[s("使用 "),o("code",null,"item"),s(" 插槽自定义渲染列表项")],-1)),p(e(n(h),null,null,512),[[g,d.value]]),e(l,null,{default:i(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{d.value=!1}),vueCode:n(D)},m({_:2},[f.value?{name:"vue",fn:i(()=>[e(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=o("h3",{id:"加载中和空数据",tabindex:"-1"},[s("加载中和空数据 "),o("a",{class:"header-anchor",href:"#加载中和空数据","aria-label":'Permalink to "加载中和空数据"'},"​")],-1)),p(e(n(h),null,null,512),[[g,d.value]]),e(l,null,{default:i(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{d.value=!1}),vueCode:n(B)},m({_:2},[y.value?{name:"vue",fn:i(()=>[e(n(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[13]||(t[13]=o("h3",{id:"其他插槽",tabindex:"-1"},[s("其他插槽 "),o("a",{class:"header-anchor",href:"#其他插槽","aria-label":'Permalink to "其他插槽"'},"​")],-1)),t[14]||(t[14]=o("p",null,[s("另外还提供了 "),o("code",null,"header"),s(" 和 "),o("code",null,"body"),s(" 插槽，方便开发者扩展")],-1)),p(e(n(h),null,null,512),[[g,d.value]]),e(l,null,{default:i(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{d.value=!1}),vueCode:n(S)},m({_:2},[v.value?{name:"vue",fn:i(()=>[e(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=_("",26))])}}});export{E as __pageData,V as default};

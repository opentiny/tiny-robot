const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/slot-item-title.Cjg8v9ie.js","assets/chunks/theme.COsDHWmB.js","assets/chunks/framework.CANJ19-G.js","assets/chunks/slot-item-prefix.G6y40o35.js","assets/chunks/icon.DZGeRFVa.js","assets/chunks/custom-menu.RyENSGQn.js","assets/chunks/empty.DZDyzhIt.js","assets/chunks/basic.D7ub6Pq4.js"])))=>i.map(i=>d[i]);
import{aD as s,bQ as c,aZ as w,aL as A,v as C,H as _,bL as h,bB as m,J as e,bk as d,bJ as a,G as u,w as o,I as r,b7 as p,aU as x}from"./chunks/framework.CANJ19-G.js";import{L as y,N as b}from"./chunks/index.B4BgU4UV.js";const X=`<template>
  <tr-history
    :data="data"
    :selected="selected"
    :show-rename-controls="isTouchDevice"
    rename-control-on-click-outside="cancel"
    @item-click="(item) => (selected = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(item) => console.log(item)"
  >
    <template #item-title="{ item }">
      <span class="item" :title="item.title">{{ item.title }}</span>
    </template>
  </tr-history>
</template>

<script setup lang="ts">
import { TrHistory, useTouchDevice } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

const { isTouchDevice } = useTouchDevice()

const data = reactive([
  { title: '如何训练一只聪明的小狗', id: '1' },
  { title: 'How to make a perfect soufflé', id: '2' },
  { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
])

const selected = ref<string | undefined>('2')
<\/script>

<style scoped>
.item {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}
</style>
`,B=`<template>
  <div style="display: flex; align-items: center; gap: 4px">
    <label>全选</label>
    <input type="checkbox" v-model="allSelection" :indeterminate="isIndeterminate" />
  </div>
  <hr />
  <tr-history
    :data="data"
    :selected="selected"
    :show-rename-controls="isTouchDevice"
    rename-control-on-click-outside="cancel"
    @item-click="(item) => (selected = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(item) => console.log(item)"
  >
    <template #item-prefix="{ item }">
      <input type="checkbox" v-model="multipleSelection" :value="item.id" @click.stop />
    </template>
  </tr-history>
  <hr />
  <div>
    <div>
      <label>已选：</label>
      <span>{{ multipleSelection.length }} 项</span>
    </div>
    <ul>
      <li v-for="id in multipleSelection" :key="id">
        <span>{{ data.find((item) => item.id === id)?.title }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { TrHistory, useTouchDevice } from '@opentiny/tiny-robot'
import { computed, reactive, ref } from 'vue'

const { isTouchDevice } = useTouchDevice()

const data = reactive([
  { title: '如何训练一只聪明的小狗', id: '1' },
  { title: 'How to make a perfect soufflé', id: '2' },
  { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
])

const selected = ref<string | undefined>('2')

const multipleSelection = ref<string[]>([])

const allSelection = computed({
  get() {
    return data.every((item) => multipleSelection.value.includes(item.id))
  },
  set(value) {
    if (value) {
      multipleSelection.value = data.map((item) => item.id)
    } else {
      multipleSelection.value = []
    }
  },
})

const isIndeterminate = computed(() => {
  const selectedCount = multipleSelection.value.length
  return selectedCount > 0 && selectedCount < data.length
})
<\/script>

<style scoped></style>
`,W=`<template>
  <tr-history
    :data="data"
    :selected="selected"
    :show-rename-controls="isTouchDevice"
    rename-control-on-click-outside="cancel"
    @item-click="(item) => (selected = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(item) => console.log(item)"
  />
</template>

<script setup lang="ts">
import { TrHistory, useTouchDevice } from '@opentiny/tiny-robot'
import { IconCheck, IconCopy, IconDelete } from '@opentiny/tiny-robot-svgs'
import { h, reactive, ref } from 'vue'

const { isTouchDevice } = useTouchDevice()

const data = reactive([
  { title: '如何训练一只聪明的小狗', id: '1', icon: h(IconCheck, { style: { fontSize: '16px' } }) },
  { title: 'How to make a perfect soufflé', id: '2', icon: h(IconCopy, { style: { fontSize: '16px' } }) },
  {
    title: 'The Art of Origami: Advanced Paper Folding',
    id: '3',
    icon: h(IconDelete, { style: { fontSize: '16px' } }),
  },
])

const selected = ref<string | undefined>('2')
<\/script>
`,Z=`<template>
  <tr-history
    :data="data"
    :selected="selected"
    :menu-items="menuItems"
    @item-click="(item) => (selected = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(action, item) => handleAction(action, item)"
  />
</template>

<script setup lang="ts">
import { TrHistory } from '@opentiny/tiny-robot'
import { IconEditPen, IconDelete, IconCopy } from '@opentiny/tiny-robot-svgs'
import { reactive, ref } from 'vue'

const data = reactive([
  { title: '如何训练一只聪明的小狗', id: '1' },
  { title: 'How to make a perfect soufflé', id: '2' },
  { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
  { title: '历史对话4', id: '4' },
  { title: '历史对话5', id: '5' },
])

const selected = ref<string | undefined>('2')

// 自定义菜单项
const menuItems = [
  { id: 'rename', text: '重命名', icon: IconEditPen },
  { id: 'copy', text: '复制', icon: IconCopy },
  { id: 'delete', text: '删除', icon: IconDelete },
]

const handleAction = (action: { id: string; text: string }, item: { id?: string; title: string }) => {
  console.log(\`执行操作: \${action.text}\`, { action, item })

  switch (action.id) {
    case 'rename':
      // 重命名逻辑
      break
    case 'copy':
      // 复制逻辑
      break
    case 'delete':
      // 删除逻辑
      break
  }
}
<\/script>
`,I=`<template>
  <tr-history :data="data" />
</template>

<script setup lang="ts">
import { TrHistory } from '@opentiny/tiny-robot'
import { reactive } from 'vue'

const data = reactive([])
<\/script>
`,E=`<template>
  <tr-history
    :data="data"
    :selected="selected"
    :show-rename-controls="isTouchDevice"
    rename-control-on-click-outside="cancel"
    @item-click="(item) => (selected = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(item) => console.log(item)"
  />
  <hr />
  <p>分组数据</p>
  <tr-history
    :data="groups"
    :selected="selected2"
    @item-click="(item) => (selected2 = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(item) => console.log(item)"
  />
</template>

<script setup lang="ts">
import { TrHistory, useTouchDevice } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

const { isTouchDevice } = useTouchDevice()

const data = reactive([
  { title: '如何训练一只聪明的小狗', id: '1' },
  { title: 'How to make a perfect soufflé', id: '2' },
  { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
  {
    title:
      'This is a very long title that demonstrates how the history component handles lengthy conversation titles and ensures proper text wrapping',
    id: '4',
  },
  { title: '历史对话5', id: '5' },
  { title: '历史对话6', id: '6' },
])

const selected = ref<string | undefined>('2')

const groups = reactive([
  {
    group: '今天',
    items: [{ title: '如何训练一只聪明的小狗', id: '1' }],
  },
  {
    group: '昨天',
    items: [{ title: 'How to make a perfect soufflé', id: '2' }],
  },
])

const selected2 = ref<string | undefined>('2')
<\/script>
`,H=JSON.parse('{"title":"History","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/history.md","filePath":"components/history.md"}'),L={name:"components/history.md"},G=Object.assign(L,{setup(S){const v=p();s(async()=>{v.value=(await c(async()=>{const{default:n}=await import("./chunks/slot-item-title.Cjg8v9ie.js");return{default:n}},__vite__mapDeps([0,1,2]))).default});const f=p();s(async()=>{f.value=(await c(async()=>{const{default:n}=await import("./chunks/slot-item-prefix.G6y40o35.js");return{default:n}},__vite__mapDeps([3,2,1]))).default});const g=p();s(async()=>{g.value=(await c(async()=>{const{default:n}=await import("./chunks/icon.DZGeRFVa.js");return{default:n}},__vite__mapDeps([4,1,2]))).default});const k=p();s(async()=>{k.value=(await c(async()=>{const{default:n}=await import("./chunks/custom-menu.RyENSGQn.js");return{default:n}},__vite__mapDeps([5,1,2]))).default});const T=p();s(async()=>{T.value=(await c(async()=>{const{default:n}=await import("./chunks/empty.DZDyzhIt.js");return{default:n}},__vite__mapDeps([6,1,2]))).default});const i=x(!0),D=p();return s(async()=>{D.value=(await c(async()=>{const{default:n}=await import("./chunks/basic.D7ub6Pq4.js");return{default:n}},__vite__mapDeps([7,1,2]))).default}),(n,t)=>{const l=w("ClientOnly");return A(),C("div",null,[t[6]||(t[6]=_("",4)),h(e(d(y),null,null,512),[[m,i.value]]),e(l,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{i.value=!1}),vueCode:d(E)},u({_:2},[D.value?{name:"vue",fn:a(()=>[e(d(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[7]||(t[7]=o("h3",{id:"空状态",tabindex:"-1"},[r("空状态 "),o("a",{class:"header-anchor",href:"#空状态","aria-label":'Permalink to "空状态"'},"​")],-1)),h(e(d(y),null,null,512),[[m,i.value]]),e(l,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{i.value=!1}),vueCode:d(I)},u({_:2},[T.value?{name:"vue",fn:a(()=>[e(d(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[8]||(t[8]=o("h3",{id:"自定义菜单项",tabindex:"-1"},[r("自定义菜单项 "),o("a",{class:"header-anchor",href:"#自定义菜单项","aria-label":'Permalink to "自定义菜单项"'},"​")],-1)),t[9]||(t[9]=o("p",null,[r("通过 "),o("code",null,"menuItems"),r(" 属性可以自定义历史项的菜单选项。")],-1)),h(e(d(y),null,null,512),[[m,i.value]]),e(l,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{i.value=!1}),vueCode:d(Z)},u({_:2},[k.value?{name:"vue",fn:a(()=>[e(d(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=o("h3",{id:"前置图标",tabindex:"-1"},[r("前置图标 "),o("a",{class:"header-anchor",href:"#前置图标","aria-label":'Permalink to "前置图标"'},"​")],-1)),t[11]||(t[11]=o("p",null,[r("通过 "),o("code",null,"icon"),r(" 属性可以为历史项添加前置图标。")],-1)),h(e(d(y),null,null,512),[[m,i.value]]),e(l,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{i.value=!1}),vueCode:d(W)},u({_:2},[g.value?{name:"vue",fn:a(()=>[e(d(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=o("h3",{id:"插槽",tabindex:"-1"},[r("插槽 "),o("a",{class:"header-anchor",href:"#插槽","aria-label":'Permalink to "插槽"'},"​")],-1)),t[13]||(t[13]=o("p",null,[r("通过 "),o("code",null,"item-prefix"),r(" 插槽可以自定义历史项的前置内容。例如：复选框等。")],-1)),h(e(d(y),null,null,512),[[m,i.value]]),e(l,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{i.value=!1}),vueCode:d(B)},u({_:2},[f.value?{name:"vue",fn:a(()=>[e(d(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[14]||(t[14]=o("p",null,[r("通过 "),o("code",null,"item-title"),r(" 插槽可以自定义历史项的标题显示内容。")],-1)),h(e(d(y),null,null,512),[[m,i.value]]),e(l,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{i.value=!1}),vueCode:d(X)},u({_:2},[v.value?{name:"vue",fn:a(()=>[e(d(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=_("",32))])}}});export{H as __pageData,G as default};

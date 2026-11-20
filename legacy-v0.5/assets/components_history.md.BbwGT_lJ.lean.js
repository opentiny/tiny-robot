const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/slot-item-title.CMsxzNHR.js","assets/chunks/theme.MY0DDsqj.js","assets/chunks/framework.Dw8jt1Jz.js","assets/chunks/slot-item-prefix.DvXaAyOr.js","assets/chunks/icon.BWUIKmWM.js","assets/chunks/custom-menu.yIWIdIPQ.js","assets/chunks/empty.CVfOtKv8.js","assets/chunks/basic.BMxMvk2e.js"])))=>i.map(i=>d[i]);
import{aD as c,aZ as _,aL as A,v as M,H as D,bL as s,bB as h,J as e,bk as d,bJ as a,G as u,w as o,I as l,aU as j,b7 as m,bQ as p}from"./chunks/framework.Dw8jt1Jz.js";import{L as y,N as b}from"./chunks/index.DDu3Iq4c.js";const Z=`<template>
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
`,C=`<template>
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
`,S=`<template>
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
`,W=`<template>
  <tr-history :data="data" />
</template>

<script setup lang="ts">
import { TrHistory } from '@opentiny/tiny-robot'
import { reactive } from 'vue'

const data = reactive([])
<\/script>
`,N=`<template>
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
`,G=JSON.parse('{"title":"History","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/history.md","filePath":"components/history.md"}'),x={name:"components/history.md"},J=Object.assign(x,{setup(L){const v=m();c(async()=>{v.value=(await p(async()=>{const{default:n}=await import("./chunks/slot-item-title.CMsxzNHR.js");return{default:n}},__vite__mapDeps([0,1,2]))).default});const f=m();c(async()=>{f.value=(await p(async()=>{const{default:n}=await import("./chunks/slot-item-prefix.DvXaAyOr.js");return{default:n}},__vite__mapDeps([3,2,1]))).default});const g=m();c(async()=>{g.value=(await p(async()=>{const{default:n}=await import("./chunks/icon.BWUIKmWM.js");return{default:n}},__vite__mapDeps([4,1,2]))).default});const k=m();c(async()=>{k.value=(await p(async()=>{const{default:n}=await import("./chunks/custom-menu.yIWIdIPQ.js");return{default:n}},__vite__mapDeps([5,1,2]))).default});const T=m();c(async()=>{T.value=(await p(async()=>{const{default:n}=await import("./chunks/empty.CVfOtKv8.js");return{default:n}},__vite__mapDeps([6,1,2]))).default});const i=j(!0),w=m();return c(async()=>{w.value=(await p(async()=>{const{default:n}=await import("./chunks/basic.BMxMvk2e.js");return{default:n}},__vite__mapDeps([7,1,2]))).default}),(n,t)=>{const r=_("ClientOnly");return A(),M("div",null,[t[6]||(t[6]=D("",4)),s(e(d(y),null,null,512),[[h,i.value]]),e(r,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{i.value=!1}),vueCode:d(N)},u({_:2},[w.value?{name:"vue",fn:a(()=>[e(d(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[7]||(t[7]=o("h3",{id:"空状态",tabindex:"-1"},[l("空状态 "),o("a",{class:"header-anchor",href:"#空状态","aria-label":'Permalink to "空状态"'},"​")],-1)),s(e(d(y),null,null,512),[[h,i.value]]),e(r,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{i.value=!1}),vueCode:d(W)},u({_:2},[T.value?{name:"vue",fn:a(()=>[e(d(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[8]||(t[8]=o("h3",{id:"自定义菜单项",tabindex:"-1"},[l("自定义菜单项 "),o("a",{class:"header-anchor",href:"#自定义菜单项","aria-label":'Permalink to "自定义菜单项"'},"​")],-1)),t[9]||(t[9]=o("p",null,[l("通过 "),o("code",null,"menuItems"),l(" 属性可以自定义历史项的菜单选项。")],-1)),s(e(d(y),null,null,512),[[h,i.value]]),e(r,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{i.value=!1}),vueCode:d(S)},u({_:2},[k.value?{name:"vue",fn:a(()=>[e(d(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=o("h3",{id:"前置图标",tabindex:"-1"},[l("前置图标 "),o("a",{class:"header-anchor",href:"#前置图标","aria-label":'Permalink to "前置图标"'},"​")],-1)),t[11]||(t[11]=o("p",null,[l("通过 "),o("code",null,"icon"),l(" 属性可以为历史项添加前置图标。")],-1)),s(e(d(y),null,null,512),[[h,i.value]]),e(r,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{i.value=!1}),vueCode:d(E)},u({_:2},[g.value?{name:"vue",fn:a(()=>[e(d(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=o("h3",{id:"插槽",tabindex:"-1"},[l("插槽 "),o("a",{class:"header-anchor",href:"#插槽","aria-label":'Permalink to "插槽"'},"​")],-1)),t[13]||(t[13]=o("p",null,[l("通过 "),o("code",null,"item-prefix"),l(" 插槽可以自定义历史项的前置内容。例如：复选框等。")],-1)),s(e(d(y),null,null,512),[[h,i.value]]),e(r,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{i.value=!1}),vueCode:d(C)},u({_:2},[f.value?{name:"vue",fn:a(()=>[e(d(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[14]||(t[14]=o("p",null,[l("通过 "),o("code",null,"item-title"),l(" 插槽可以自定义历史项的标题显示内容。")],-1)),s(e(d(y),null,null,512),[[h,i.value]]),e(r,null,{default:a(()=>[e(d(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{i.value=!1}),vueCode:d(Z)},u({_:2},[v.value?{name:"vue",fn:a(()=>[e(d(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=D("",32))])}}});export{G as __pageData,J as default};

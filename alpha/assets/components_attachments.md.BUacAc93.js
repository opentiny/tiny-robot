const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/custom-file-type.B6-fJIrc.js","assets/chunks/index.DhvXZacY.js","assets/chunks/framework.Dsng2_7o.js","assets/chunks/tiny-robot-svgs.wPOeRNoc.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index2.BME1Z_Z8.js","assets/chunks/custom-icon.CQhXteP8.js","assets/chunks/download.Buu75qUc.js","assets/chunks/wrap.BHXygI8-.js","assets/chunks/picture-list.CBo5bJvY.js","assets/chunks/status.L6Q7JawY.js","assets/chunks/basic.CqfxNrK6.js"])))=>i.map(i=>d[i]);
import{D as r,v as h,V as c,p as w,C as E,c as C,o as _,j as s,ag as p,G as e,ah as B,a as i,ai as u,k as n,w as o,aj as m}from"./chunks/framework.Dsng2_7o.js";import{O as k,E as y}from"./chunks/index.BxQo2396.js";const T=`<template>
  <div class="demo-container">
    <div class="demo-section">
      <h4>支持自定义文件类型（txt、md、json）</h4>
      <tr-attachments v-model:items="customFiles" :file-matchers="fileMatchers" wrap />

      <h4>添加自定义文件类型</h4>
      <input type="file" @change="handleFileChange" accept=".txt,.md,.json" style="margin-bottom: 16px" />
      <p>选择 .txt、.md 或 .json 文件来测试自定义匹配器</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment, FileTypeMatcher } from '@opentiny/tiny-robot'

// 自定义图标组件
const TextIcon = h('div', { style: { color: '#52c41a', fontSize: '20px' } }, '📄')
const MDIcon = h('div', { style: { color: '#1890ff', fontSize: '20px' } }, '📝')
const JsonIcon = h('div', { style: { color: '#fa8c16', fontSize: '20px' } }, '📊')

// 自定义文件类型匹配器
const fileMatchers: FileTypeMatcher[] = [
  {
    type: 'txt',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return file.type === 'text/plain' || file.name.endsWith('.txt')
      }
      return file.toLowerCase().endsWith('.txt')
    },
    icon: TextIcon,
  },
  {
    type: 'md',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return file.name.endsWith('.md') || file.name.endsWith('.markdown')
      }
      return file.toLowerCase().endsWith('.md') || file.toLowerCase().endsWith('.markdown')
    },
    icon: MDIcon,
  },
  {
    type: 'json',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return file.type === 'application/json' || file.name.endsWith('.json')
      }
      return file.toLowerCase().endsWith('.json')
    },
    icon: JsonIcon,
  },
]

// 自定义文件类型示例
const customFiles = ref<Attachment[]>([
  {
    id: '1',
    name: 'README.md',
    fileType: 'md',
    size: 1024 * 2, // 2KB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.md',
    status: 'success',
  },
  {
    id: '2',
    name: 'config.json',
    fileType: 'json',
    size: 1024 * 1.5, // 1.5KB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.json',
    status: 'success',
  },
  {
    id: '3',
    name: 'notes.txt',
    fileType: 'txt',
    size: 1024 * 3, // 3KB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.txt',
    status: 'success',
  },
])

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    customFiles.value.push({ rawFile: file })
  }

  // 清空输入框
  target.value = ''
}
<\/script>

<style scoped>
.demo-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-section {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.demo-section h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}
</style>
`,x=`<template>
  <tr-attachments v-model:items="items" :file-icons="fileIcons" />
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import type { Component } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment, FileType } from '@opentiny/tiny-robot'

const fileIcons: Record<FileType, Component> = {
  word: h('span', '📄'),
  excel: h('span', '🐼'),
}

const items = ref<Attachment[]>([
  {
    url: 'https://www.demo.com/文档.docx',
    size: 12345,
  },
  {
    url: 'https://www.demo.com/表格.xlsx',
    size: 24576,
  },
])
<\/script>
`,Z=`<template>
  <div class="demo-container">
    <div class="demo-container-body">
      <!-- 网络文件 -->
      <TrAttachments v-model:items="attachments" variant="card" @download="handleDownload" />

      <!-- 本地文件 -->
      <TrAttachments v-model:items="localAttachments" variant="card" />

      <div class="demo-section">
        <h4>添加自定义文件类型</h4>
        <input type="file" @change="handleFileChange" accept="*" style="margin-bottom: 16px" />
        <p>选择图片文件来测试自定义匹配器</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type Attachment, TrAttachments } from '@opentiny/tiny-robot'

const attachments = ref<Attachment[]>([
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])

const localAttachments = ref<Attachment[]>([])

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    localAttachments.value.push({ rawFile: file })

    target.value = ''
  }
}

const handleDownload = (payload: { event: MouseEvent; file: Attachment }) => {
  const { file } = payload
  console.log(file)
}
<\/script>

<style scoped lang="scss"></style>
`,W=`<template>
  <div>
    <div style="margin-bottom: 16px">
      <tiny-radio-group v-model="wrap">
        <tiny-radio :label="false">no-wrap</tiny-radio>
        <tiny-radio :label="true">wrap</tiny-radio>
      </tiny-radio-group>
    </div>

    <tr-attachments v-model:items="files" :wrap="wrap" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

const wrap = ref(false)

const files = ref<Attachment[]>([
  {
    id: '0',
    name: '示例文档.docx',
    status: 'success',
    size: 200,
    fileType: 'word',
    url: '/path/to/preview.docx',
  },
  {
    id: '1',
    name: '示例文档.pdf',
    status: 'success',
    size: 200,
    fileType: 'pdf',
    url: '/path/to/preview.pdf',
  },
  {
    id: '2',
    name: '示例文档.ppt',
    status: 'success',
    size: 200 * 1024,
    fileType: 'ppt',
    url: '/path/to/preview.ppt',
  },
  {
    id: '3',
    name: '示例文档.xlsx',
    status: 'success',
    size: 200,
    fileType: 'excel',
    url: '/path/to/preview.xlsx',
  },
  {
    id: '4',
    name: '示例文档',
    status: 'success',
    size: 200,
    fileType: 'folder',
    url: '/path/to/preview',
  },
])
<\/script>
`,X=`<template>
  <div style="display: flex; flex-direction: column; gap: 10px">
    <div>
      <h4>状态展示</h4>
      <p>图片卡片会根据状态自动显示不同的视觉效果。</p>
    </div>
    <tr-attachments v-model:items="pictureStatusFiles" variant="picture" />

    <div>
      <h4>上传超时文本</h4>
      <p>设置 <code>message</code> 可显示上传超时文本。</p>
    </div>
    <tr-attachments v-model:items="pictureTimeoutFiles" variant="picture" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

const pictureStatusFiles = ref<Attachment[]>([
  {
    status: 'success',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    status: 'uploading',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    status: 'error',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.png',
  },
])

const pictureTimeoutFiles = ref<Attachment[]>([
  {
    status: 'uploading',
    message: '努力中...',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])
<\/script>
`,j=`<template>
  <div class="demo-container">
    <div class="demo-section">
      <h4 style="margin: 10px 0">状态展示</h4>

      <tr-attachments v-model:items="statusFiles" variant="card" wrap />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

const statusFiles = ref<Attachment[]>([
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
    status: 'success',
  },

  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/设计2.jpg',
    status: 'uploading',
  },

  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/设计3.jpg',
    status: 'error',
  },
])
<\/script>
`,L=`<template>
  <div class="demo-container">
    <div class="demo-section">
      <h4>文件列表</h4>
      <tr-attachments v-model:items="infoFiles" variant="card" />
    </div>
    <div class="demo-section">
      <h4>图片列表</h4>
      <tr-attachments v-model:items="pictureFiles" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

// 基本示例 - 显示文件类型和大小
const infoFiles = ref<Attachment[]>([
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://tinyengine-assets.obs.cn-north-4.myhuaweicloud.com/files/images/icons-250711.rar',
  },
])

const pictureFiles = ref<Attachment[]>([
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])
<\/script>
`,P=JSON.parse('{"title":"Attachments 附件卡片","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/attachments.md","filePath":"components/attachments.md"}'),q={name:"components/attachments.md"},z=Object.assign(q,{setup(I){const f=r();h(async()=>{f.value=(await c(async()=>{const{default:l}=await import("./chunks/custom-file-type.B6-fJIrc.js");return{default:l}},__vite__mapDeps([0,1,2,3,4,5]))).default});const v=r();h(async()=>{v.value=(await c(async()=>{const{default:l}=await import("./chunks/custom-icon.CQhXteP8.js");return{default:l}},__vite__mapDeps([6,1,2,3,4,5]))).default});const g=r();h(async()=>{g.value=(await c(async()=>{const{default:l}=await import("./chunks/download.Buu75qUc.js");return{default:l}},__vite__mapDeps([7,1,2,3,4,5]))).default});const b=r();h(async()=>{b.value=(await c(async()=>{const{default:l}=await import("./chunks/wrap.BHXygI8-.js");return{default:l}},__vite__mapDeps([8,1,2,3,4,5]))).default});const A=r();h(async()=>{A.value=(await c(async()=>{const{default:l}=await import("./chunks/picture-list.CBo5bJvY.js");return{default:l}},__vite__mapDeps([9,1,2,3,4,5]))).default});const F=r();h(async()=>{F.value=(await c(async()=>{const{default:l}=await import("./chunks/status.L6Q7JawY.js");return{default:l}},__vite__mapDeps([10,1,2,3,4,5]))).default});const a=w(!0),D=r();return h(async()=>{D.value=(await c(async()=>{const{default:l}=await import("./chunks/basic.CqfxNrK6.js");return{default:l}},__vite__mapDeps([11,1,2,3,4,5]))).default}),(l,t)=>{const d=E("ClientOnly");return _(),C("div",null,[t[7]||(t[7]=s("h1",{id:"attachments-附件卡片",tabindex:"-1"},[i("Attachments 附件卡片 "),s("a",{class:"header-anchor",href:"#attachments-附件卡片","aria-label":'Permalink to "Attachments 附件卡片"'},"​")],-1)),t[8]||(t[8]=s("p",null,"Attachments 组件用于展示文件列表，并支持图片预览、文件下载、状态显示等一系列交互功能。",-1)),t[9]||(t[9]=s("h2",{id:"代码示例",tabindex:"-1"},[i("代码示例 "),s("a",{class:"header-anchor",href:"#代码示例","aria-label":'Permalink to "代码示例"'},"​")],-1)),t[10]||(t[10]=s("p",null,[i("最基本的用法是使用 "),s("code",null,"v-model:items"),i(" 绑定一个附件列表数组。")],-1)),p(e(n(k),null,null,512),[[u,a.value]]),e(d,null,{default:o(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{a.value=!1}),vueCode:n(L)},m({_:2},[D.value?{name:"vue",fn:o(()=>[e(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[11]||(t[11]=B('<h2 id="基本特性" tabindex="-1">基本特性 <a class="header-anchor" href="#基本特性" aria-label="Permalink to &quot;基本特性&quot;">​</a></h2><h3 id="展示形式-variant" tabindex="-1">展示形式（variant） <a class="header-anchor" href="#展示形式-variant" aria-label="Permalink to &quot;展示形式（variant）&quot;">​</a></h3><p>组件通过 <code>variant</code> 属性控制附件列表的展示形式，默认为 <code>&#39;auto&#39;</code>。</p><ul><li><strong><code>&#39;auto&#39;</code> (默认)</strong>: 组件会自动检测 <code>items</code> 列表中的文件类型。如果全部为图片，则渲染为图片墙（<code>picture</code>）；否则，渲染为文件卡片列表（<code>card</code>）。</li><li><strong><code>&#39;picture&#39;</code></strong>: 强制渲染为图片墙。</li><li><strong><code>&#39;card&#39;</code></strong>: 强制渲染为文件卡片列表。</li></ul><h3 id="文件状态" tabindex="-1">文件状态 <a class="header-anchor" href="#文件状态" aria-label="Permalink to &quot;文件状态&quot;">​</a></h3><p>文件卡片会根据 <code>file.status</code> 属性的值自动切换显示内容，直观地展示每个文件的当前状态。</p><ul><li><code>success</code>: 上传成功，显示文件元信息（如大小）。</li><li><code>uploading</code>: 上传中，显示加载状态。</li><li><code>error</code>: 上传失败，显示错误信息和“重试”按钮。</li></ul>',7)),p(e(n(k),null,null,512),[[u,a.value]]),e(d,null,{default:o(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[1]||(t[1]=()=>{a.value=!1}),vueCode:n(j)},m({_:2},[F.value?{name:"vue",fn:o(()=>[e(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=s("p",null,"图片列表同样支持状态展示：",-1)),p(e(n(k),null,null,512),[[u,a.value]]),e(d,null,{default:o(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[2]||(t[2]=()=>{a.value=!1}),vueCode:n(X)},m({_:2},[A.value?{name:"vue",fn:o(()=>[e(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[13]||(t[13]=s("h3",{id:"列表换行",tabindex:"-1"},[i("列表换行 "),s("a",{class:"header-anchor",href:"#列表换行","aria-label":'Permalink to "列表换行"'},"​")],-1)),t[14]||(t[14]=s("p",null,[i("通过设置 "),s("code",null,"wrap"),i(" 属性，可以控制文件列表是否在达到容器宽度时自动换行。")],-1)),p(e(n(k),null,null,512),[[u,a.value]]),e(d,null,{default:o(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[3]||(t[3]=()=>{a.value=!1}),vueCode:n(W)},m({_:2},[b.value?{name:"vue",fn:o(()=>[e(n(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=s("h3",{id:"预览和下载",tabindex:"-1"},[i("预览和下载 "),s("a",{class:"header-anchor",href:"#预览和下载","aria-label":'Permalink to "预览和下载"'},"​")],-1)),t[16]||(t[16]=s("blockquote",null,[s("p",null,"本地文件 和 网络文件 的下载方式不同")],-1)),t[17]||(t[17]=s("ul",null,[s("li",null,[i("本地文件：直接使用 "),s("code",null,"a"),i(" 标签下载")]),s("li",null,[i("网络文件：使用 "),s("code",null,"fetch"),i(" 下载")])],-1)),p(e(n(k),null,null,512),[[u,a.value]]),e(d,null,{default:o(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[4]||(t[4]=()=>{a.value=!1}),vueCode:n(Z)},m({_:2},[g.value?{name:"vue",fn:o(()=>[e(n(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[18]||(t[18]=B('<h3 id="自定义操作按钮-actions" tabindex="-1">自定义操作按钮 (actions) <a class="header-anchor" href="#自定义操作按钮-actions" aria-label="Permalink to &quot;自定义操作按钮 (actions)&quot;">​</a></h3><p>通过 <code>actions</code> 属性可以定义在文件卡片上显示的操作按钮。对于图片类型，组件内置了“预览”和“下载”操作。你可以覆盖或添加新的操作。</p><p>当 <code>actions</code> 中包含 <code>type</code> 为 <code>preview</code> 或 <code>download</code> 的按钮时，会使用组件内置的逻辑。你也可以提供自定义的 <code>handler</code> 函数来覆盖默认行为。</p><h3 id="自定义图标-fileicons" tabindex="-1">自定义图标 (fileIcons) <a class="header-anchor" href="#自定义图标-fileicons" aria-label="Permalink to &quot;自定义图标 (fileIcons)&quot;">​</a></h3><p>如果想替换默认的某个文件类型的图标，可以使用 <code>fileIcons</code> 属性进行覆盖。</p>',5)),p(e(n(k),null,null,512),[[u,a.value]]),e(d,null,{default:o(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[5]||(t[5]=()=>{a.value=!1}),vueCode:n(x)},m({_:2},[v.value?{name:"vue",fn:o(()=>[e(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[19]||(t[19]=s("h3",{id:"自定义文件类型-filematchers",tabindex:"-1"},[i("自定义文件类型 (fileMatchers) "),s("a",{class:"header-anchor",href:"#自定义文件类型-filematchers","aria-label":'Permalink to "自定义文件类型 (fileMatchers)"'},"​")],-1)),t[20]||(t[20]=s("p",null,[i("当内置的文件类型不满足需求时，可以通过 "),s("code",null,"fileMatchers"),i(" 属性定义新的文件类型、匹配逻辑和专属图标。这在需要支持特殊格式或业务特定文件时非常有用。")],-1)),p(e(n(k),null,null,512),[[u,a.value]]),e(d,null,{default:o(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[6]||(t[6]=()=>{a.value=!1}),vueCode:n(T)},m({_:2},[f.value?{name:"vue",fn:o(()=>[e(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[21]||(t[21]=B(`<h2 id="api-参考" tabindex="-1">API 参考 <a class="header-anchor" href="#api-参考" aria-label="Permalink to &quot;API 参考&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td>items</td><td><code>Attachment[]</code></td><td>[]</td><td>附件列表，支持 <code>v-model:items</code> 双向绑定。</td></tr><tr><td>disabled</td><td>boolean</td><td>false</td><td>是否禁用整个组件，禁用后所有交互操作（如删除、下载）将不可用。</td></tr><tr><td>wrap</td><td>boolean</td><td>false</td><td>文件列表是否换行，详见 <a href="#列表换行">列表换行</a>。</td></tr><tr><td>variant</td><td><code>&#39;picture&#39; | &#39;card&#39; | &#39;auto&#39;</code></td><td><code>&#39;auto&#39;</code></td><td>附件列表的展示形式，详见 <a href="#展示形式-variant">展示形式</a>。</td></tr><tr><td>actions</td><td><code>ActionButton[]</code></td><td>图片默认: <code>[&#39;preview&#39;, &#39;download&#39;]</code></td><td>自定义操作按钮，详见 <a href="#自定义操作按钮-actions">自定义操作按钮</a>。</td></tr><tr><td>fileIcons</td><td><code>Record&lt;string, Component&gt;</code></td><td>-</td><td>自定义文件类型图标，详见 <a href="#自定义图标-fileicons">自定义图标</a>。</td></tr><tr><td>fileMatchers</td><td><code>FileTypeMatcher[]</code></td><td>[]</td><td>自定义文件类型匹配器，详见 <a href="#自定义文件类型-filematchers">自定义文件类型</a>。</td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><h4 id="attachment" tabindex="-1">Attachment <a class="header-anchor" href="#attachment" aria-label="Permalink to &quot;Attachment&quot;">​</a></h4><p>这是描述一个附件对象的核心类型。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Attachment</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 唯一标识符</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 文件名</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  status</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;uploading&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;success&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;error&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 文件状态</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  fileType</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 文件类型</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  size</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 文件大小（字节）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  rawFile</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> File</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 原始文件对象</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  url</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 预览URL (仅图片类型)</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  message</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 上传超时文本</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="actionbutton" tabindex="-1">ActionButton <a class="header-anchor" href="#actionbutton" aria-label="Permalink to &quot;ActionButton&quot;">​</a></h4><p>用于定义操作按钮。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ActionButton</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 操作类型，如 &#39;preview&#39;, &#39;download&#39; 等</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 按钮显示文本</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  handler</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">file</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Attachment</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 可选的点击处理函数，用于覆盖默认行为或实现新功能</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="filetypematcher" tabindex="-1">FileTypeMatcher <a class="header-anchor" href="#filetypematcher" aria-label="Permalink to &quot;FileTypeMatcher&quot;">​</a></h4><p>用于自定义文件类型匹配规则。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> FileTypeMatcher</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 唯一类型标识</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  matcher</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">file</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> File</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 匹配函数，返回 true 则表示匹配成功</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 该类型对应的图标</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>参数类型</th><th>说明</th></tr></thead><tbody><tr><td>update:items</td><td><code>Attachment[]</code></td><td>附件列表更新时触发。</td></tr><tr><td>remove</td><td><code>Attachment</code></td><td>文件被移除时触发。</td></tr><tr><td>download</td><td><code>{ event: MouseEvent; file: Attachment }</code></td><td>点击内置下载按钮时触发。</td></tr><tr><td>preview</td><td><code>(file: Attachment) =&gt; void</code></td><td>点击内置预览按钮时触发。</td></tr><tr><td>retry</td><td><code>(file: Attachment) =&gt; void</code></td><td>点击重试按钮时触发。</td></tr><tr><td>action</td><td><code>{ action: ActionButton, file: Attachment }</code></td><td>点击自定义操作按钮时触发。</td></tr></tbody></table><h2 id="内置附件类型" tabindex="-1">内置附件类型 <a class="header-anchor" href="#内置附件类型" aria-label="Permalink to &quot;内置附件类型&quot;">​</a></h2><p>组件内置了以下文件类型，并提供了默认图标。通过 <code>fileMatchers</code> 属性可以扩展或覆盖这些类型。</p><ul><li><code>image</code>: 图片 (png, jpg, jpeg, gif, webp, svg)</li><li><code>pdf</code>: PDF 文档</li><li><code>word</code>: Word 文档 (doc, docx)</li><li><code>excel</code>: Excel 表格 (xls, xlsx)</li><li><code>ppt</code>: 演示文稿 (ppt, pptx)</li><li><code>folder</code>: 文件夹</li><li><code>other</code>: 其他未知类型</li></ul>`,18))])}}});export{P as __pageData,z as default};

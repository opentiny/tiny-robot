const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/disabled.Bw0qhJ0j.js","assets/chunks/theme.Cr2veUHG.js","assets/chunks/framework.DeWfoKqf.js","assets/chunks/custom-overlay.Do9f2ARO.js","assets/chunks/basic._HJEj6PX.js"])))=>i.map(i=>d[i]);
import{D as c,v as h,V as g,p as x,C as E,c as F,o as D,a2 as b,af as u,G as n,j as d,ag as m,k as t,w as s,ai as v,a as f}from"./chunks/framework.DeWfoKqf.js";import{R as k,k as y}from"./chunks/index.DAHaZP3X.js";const C=`<template>
  <div class="demo-section">
    <p>通过指令传递 disabled 标志可以禁用拖拽功能：</p>

    <div
      class="disabled-area"
      v-dropzone="{ onDrop: () => {}, onError: () => {}, disabled: true }"
      :class="{ disabled: true }"
    >
      <div class="disabled-content">
        <div class="disabled-icon">🚫</div>
        <div class="disabled-text">拖拽功能已禁用</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { vDropzone } from '@opentiny/tiny-robot'
<\/script>

<style scoped>
.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.demo-section h3 {
  margin-top: 0;
  color: #333;
}

.demo-section p {
  color: #666;
  margin-bottom: 16px;
}

/* 禁用状态样式 */
.disabled-area {
  border: 2px solid #ccc;
  border-radius: 8px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.disabled-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.disabled-content {
  text-align: center;
  color: #666;
}

.disabled-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.disabled-text {
  font-size: 14px;
}
</style>
`,_=`<template>
  <div class="demo-section">
    <p>浮层组件允许你通过插槽完全自定义内容：</p>

    <div
      class="image-upload-area"
      v-dropzone="{
        accept: '.jpg,.jpeg,.png,.gif',
        multiple: false,
        onDrop: handleImageDropped,
        onError: handleImageError,
        onDraggingChange: handleDraggingChange,
      }"
      :class="{ dragging: isDragging }"
    >
      <div v-if="!uploadedImage" class="upload-placeholder">
        <div class="upload-icon">📷</div>
        <div class="upload-text">点击或拖拽图片到这里</div>
      </div>
      <img v-else :src="uploadedImage" alt="上传的图片" class="uploaded-image" />
    </div>

    <tr-drag-overlay :is-dragging="isDragging" :drag-target="targetElement">
      <template #overlay>
        <div class="custom-overlay">
          <div class="custom-overlay-content">
            <div class="custom-icon">🎨</div>
            <div class="custom-text">释放鼠标上传图片</div>
            <div class="custom-hint">支持 JPG、PNG、GIF 格式</div>
          </div>
        </div>
      </template>
    </tr-drag-overlay>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { TrDragOverlay, vDropzone, type FileRejection } from '@opentiny/tiny-robot'

const isDragging = ref(false)
const targetElement = ref<HTMLElement | null>(null)
const uploadedImage = ref<string>('')

function handleDraggingChange(dragging: boolean, element: HTMLElement | null) {
  isDragging.value = dragging
  targetElement.value = element
}

function handleImageDropped(files: File[]) {
  if (files.length > 0) {
    const file = files[0]
    console.log('上传的文件:', file)

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function handleImageError(rejection: FileRejection) {
  console.error('上传失败:', rejection)
}
<\/script>

<style scoped>
.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.demo-section h3 {
  margin-top: 0;
  color: #333;
}

.demo-section p {
  color: #666;
  margin-bottom: 16px;
}

/* 图片上传区域样式 */
.image-upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.image-upload-area.dragging {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.upload-placeholder {
  text-align: center;
  color: #666;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
}

.uploaded-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}

/* 自定义覆盖层样式 */
.custom-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 0, 150, 0.8), rgba(0, 123, 255, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  pointer-events: none;
}

.custom-overlay-content {
  text-align: center;
  color: white;
  padding: 20px;
  border: 2px dashed white;
  border-radius: 8px;
}

.custom-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.custom-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.custom-hint {
  font-size: 14px;
  opacity: 0.9;
}
</style>
`,B=`<template>
  <div class="demo-section">
    <p>将 v-dropzone 指令应用到任何元素上，就可以获得拖拽上传功能：</p>
    <!-- 目标元素 -->
    <div
      class="chat-container"
      v-dropzone="{
        accept,
        multiple,
        onDrop: handleFilesDropped,
        onError: handleFilesRejected,
        onDraggingChange: handleDraggingChange,
      }"
    >
      <div class="chat-header">
        <h4>聊天窗口</h4>
      </div>
      <div class="chat-content">
        <div class="message">
          <div class="message-content">你好！这是一个聊天界面的演示。</div>
        </div>
        <div class="message">
          <div class="message-content">你可以将文件拖拽到这个区域来上传文件。</div>
        </div>
      </div>
      <div class="chat-input">
        <input type="text" placeholder="输入消息..." />
        <button>发送</button>
      </div>
    </div>

    <!-- 浮层组件 -->
    <tr-drag-overlay
      :overlay-title="overlayTitle"
      :overlay-description="overlayDescription"
      :is-dragging="isDragging"
      :drag-target="targetElement"
    />

    <!-- 事件日志 -->
    <div v-if="events.length > 0" class="demo-section">
      <h3>事件日志</h3>
      <div class="event-log">
        <div v-for="(event, index) in events" :key="index" class="event-item">
          <span class="event-time">{{ event.time }}</span>
          <span class="event-type">{{ event.type }}</span>
          <span class="event-message">{{ event.message }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- accept 和 multiple 属性响应式示例 -->
  <div>
    <h4>accept 和 multiple 属性响应式示例</h4>
    <p>accept 属性用于限制文件类型，multiple 属性用于限制文件数量</p>
    <p>更改属性后，拖拽区域配置会自动更新，无需重新挂载指令</p>
    <div class="demo-section-property">
      <!-- accept 属性 -->
      <div class="demo-section-body">
        <label style="margin-right: 8px">accept:</label>
        <TinyBaseSelect v-model="accept">
          <TinyOption label="图片" value="image/*" />
          <TinyOption label="视频" value="video/*" />
          <TinyOption label="音频" value="audio/*" />
          <TinyOption label="其他" value="application/*" />
        </TinyBaseSelect>
      </div>

      <!-- multiple 属性 radio 示例 -->
      <div class="demo-section-body">
        <label style="margin-right: 8px">multiple:</label>
        <TinySwitch v-model="multiple" :true-value="true" :false-value="false" />
        <p style="font-weight: bold">{{ multiple ? '多选' : '单选' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TinySwitch, TinyBaseSelect, TinyOption } from '@opentiny/vue'
import { TrDragOverlay, vDropzone, type FileRejection } from '@opentiny/tiny-robot'

interface Event {
  time: string
  type: string
  message: string
}

const events = ref<Event[]>([])
const overlayTitle = '将图片拖到此处完成上传'
const overlayDescription = ['总计最多上传3个图片（每个10MB以内）', '支持图片格式 JPG/JPEG/PNG']

const isDragging = ref(false)
const targetElement = ref<HTMLElement | null>(null)
const accept = ref('image/*')
const multiple = ref(true)

function handleDraggingChange(dragging: boolean, element: HTMLElement | null) {
  isDragging.value = dragging
  targetElement.value = element
}

function addEvent(type: string, message: string) {
  const now = new Date().toLocaleTimeString()
  events.value.unshift({
    time: now,
    type,
    message,
  })

  // 只保留最近 10 条事件
  if (events.value.length > 10) {
    events.value = events.value.slice(0, 10)
  }
}

function handleFilesDropped(files: File[]) {
  addEvent('files-dropped', \`上传了 \${files.length} 个文件: \${files.map((f) => f.name).join(', ')}\`)
  console.log('上传的文件:', files)
}

function handleFilesRejected(rejection: FileRejection) {
  addEvent(
    'files-rejected',
    \`文件被拒绝: \${rejection.message} (\${rejection.code}), 文件数量: \${rejection.files.length}\`,
  )
  console.log('被拒绝的文件:', rejection)
}
<\/script>

<style scoped>
.demo-section {
  margin-bottom: 10px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.demo-section-body {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-section-property {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-section h3 {
  margin-top: 0;
  color: #333;
}

.demo-section p {
  color: #666;
  margin-bottom: 16px;
}

/* 聊天容器样式 */
.chat-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.chat-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h4 {
  margin: 0;
  color: #333;
}

.drag-indicator {
  color: #007bff;
  font-weight: bold;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.chat-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.message {
  margin-bottom: 12px;
}

.message-content {
  background: #f1f3f4;
  padding: 8px 12px;
  border-radius: 18px;
  display: inline-block;
  max-width: 70%;
}

.chat-input {
  padding: 12px 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 8px;
}

.chat-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.chat-input button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

/* 事件日志样式 */
.event-log {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
}

.event-item:last-child {
  border-bottom: none;
}

.event-time {
  color: #666;
  min-width: 80px;
}

.event-type {
  color: #007bff;
  font-weight: bold;
  min-width: 120px;
}

.event-message {
  color: #333;
  flex: 1;
}
</style>
`,Z=JSON.parse('{"title":"DragOverlay 拖拽浮层","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/drag-overlay.md","filePath":"components/drag-overlay.md"}'),T={name:"components/drag-overlay.md"},j=Object.assign(T,{setup(A){const o=c();h(async()=>{o.value=(await g(async()=>{const{default:i}=await import("./chunks/disabled.Bw0qhJ0j.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const l=c();h(async()=>{l.value=(await g(async()=>{const{default:i}=await import("./chunks/custom-overlay.Do9f2ARO.js");return{default:i}},__vite__mapDeps([3,1,2]))).default});const a=x(!0),r=c();return h(async()=>{r.value=(await g(async()=>{const{default:i}=await import("./chunks/basic._HJEj6PX.js");return{default:i}},__vite__mapDeps([4,1,2]))).default}),(i,e)=>{const p=E("ClientOnly");return D(),F("div",null,[e[3]||(e[3]=b('<h1 id="dragoverlay-拖拽浮层" tabindex="-1">DragOverlay 拖拽浮层 <a class="header-anchor" href="#dragoverlay-拖拽浮层" aria-label="Permalink to &quot;DragOverlay 拖拽浮层&quot;">​</a></h1><p>一个提供拖拽上传能力的组件，通过自定义指令 <code>v-dropzone</code> 和一个纯展示的浮层组件 <code>&lt;tr-drag-overlay&gt;</code> 协同工作。</p><p>本功能由两部分组成：</p><ul><li><code>v-dropzone</code>: 一个自定义 Vue 指令，负责监听和处理DOM元素的拖拽事件。</li><li><code>&lt;tr-drag-overlay&gt;</code>: 一个纯展示组件，根据传入的 <code>is-dragging</code> prop 显示或隐藏一个全屏的拖拽浮层。</li></ul><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本用法" tabindex="-1">基本用法 <a class="header-anchor" href="#基本用法" aria-label="Permalink to &quot;基本用法&quot;">​</a></h3><p>将 <code>v-dropzone</code> 指令附加到任何你希望响应拖拽的元素上。同时，在页面中放置一个 <code>&lt;tr-drag-overlay&gt;</code> 组件，并通过一个状态变量将其 <code>is-dragging</code> prop 与指令的状态同步。</p>',7)),u(n(t(k),null,null,512),[[m,a.value]]),n(p,null,{default:s(()=>[n(t(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[0]||(e[0]=()=>{a.value=!1}),vueCode:t(B)},v({_:2},[r.value?{name:"vue",fn:s(()=>[n(t(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=d("h3",{id:"自定义拖拽层",tabindex:"-1"},[f("自定义拖拽层 "),d("a",{class:"header-anchor",href:"#自定义拖拽层","aria-label":'Permalink to "自定义拖拽层"'},"​")],-1)),u(n(t(k),null,null,512),[[m,a.value]]),n(p,null,{default:s(()=>[n(t(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[1]||(e[1]=()=>{a.value=!1}),vueCode:t(_)},v({_:2},[l.value?{name:"vue",fn:s(()=>[n(t(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[5]||(e[5]=d("h3",{id:"状态禁用",tabindex:"-1"},[f("状态禁用 "),d("a",{class:"header-anchor",href:"#状态禁用","aria-label":'Permalink to "状态禁用"'},"​")],-1)),u(n(t(k),null,null,512),[[m,a.value]]),n(p,null,{default:s(()=>[n(t(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[2]||(e[2]=()=>{a.value=!1}),vueCode:t(C)},v({_:2},[o.value?{name:"vue",fn:s(()=>[n(t(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=b(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="attributes" tabindex="-1">Attributes <a class="header-anchor" href="#attributes" aria-label="Permalink to &quot;Attributes&quot;">​</a></h3><p><strong>v-dropzone</strong> 指令传递的参数</p><table tabindex="0"><thead><tr><th>名称</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td>accept</td><td><code>string</code></td><td>文件类型过滤规则（如 <code>&#39;.png,.jpg&#39;</code>），默认接收所有类型。</td></tr><tr><td>multiple</td><td><code>boolean</code></td><td>是否允许多文件拖拽，默认 <code>true</code>。</td></tr><tr><td>maxSize</td><td><code>number</code></td><td>最大文件大小（字节），默认 <code>10485760</code>（10 MB）。</td></tr><tr><td>maxFiles</td><td><code>number</code></td><td>最大文件数量，默认 <code>3</code>。</td></tr><tr><td>disabled</td><td><code>boolean</code></td><td>是否禁用拖拽，默认 <code>false</code>。</td></tr><tr><td>onDrop</td><td><code>(files: File[]) =&gt; void</code></td><td><strong>必须</strong>。当符合条件的文件被放下时触发的回调。</td></tr><tr><td>onError</td><td><code>(rejection: FileRejection) =&gt; void</code></td><td><strong>必须</strong>。当文件被拒绝或发生错误时触发的回调。</td></tr><tr><td>onDraggingChange</td><td><code>(dragging: boolean, element: HTMLElement | null) =&gt; void</code></td><td>拖拽状态变化时触发的回调。</td></tr></tbody></table><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>名称</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td>is-dragging</td><td><code>boolean</code></td><td><code>false</code></td><td>是否显示拖拽浮层。</td></tr><tr><td>drag-target</td><td><code>Element | null</code></td><td><code>null</code></td><td>目标元素的 Element，用于定位覆盖层。</td></tr><tr><td>overlay-title</td><td><code>string</code></td><td><code>&#39;&#39;</code></td><td>浮层的主标题。</td></tr><tr><td>overlay-description</td><td><code>string[]</code></td><td><code>[]</code></td><td>浮层的描述文本，数组中的每个元素为一行。</td></tr><tr><td>fullscreen</td><td><code>boolean</code></td><td><code>false</code></td><td>是否全屏模式，控制覆盖层的边框显示。</td></tr></tbody></table><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th>名称</th><th>说明</th></tr></thead><tbody><tr><td>overlay</td><td>自定义浮层内容。</td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><p><strong>FileRejection</strong></p><div class="language-typeScript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typeScript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> RejectionReason</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  code</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DragZoneErrorCode</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  message</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> FileRejection</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> RejectionReason</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  files</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> File</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h3><h4 id="全局变量-root" tabindex="-1">全局变量 (<code>:root</code>) <a class="header-anchor" href="#全局变量-root" aria-label="Permalink to &quot;全局变量 (\`:root\`)&quot;">​</a></h4><table tabindex="0"><thead><tr><th>变量名</th><th>描述</th></tr></thead><tbody><tr><td><code>--tr-drag-overlay-bg-color</code></td><td>背景颜色</td></tr><tr><td><code>--tr-drag-overlay-border-color</code></td><td>边框颜色</td></tr><tr><td><code>--tr-drag-overlay-title-color</code></td><td>标题文字颜色</td></tr><tr><td><code>--tr-drag-overlay-title-font-weight</code></td><td>标题字体粗细</td></tr><tr><td><code>--tr-drag-overlay-description-color</code></td><td>描述文字颜色</td></tr><tr><td><code>--tr-drag-overlay-description-font-weight</code></td><td>描述字体粗细</td></tr><tr><td><code>--tr-drag-overlay-content-padding</code></td><td>内容区域内边距</td></tr><tr><td><code>--tr-drag-overlay-content-border-width</code></td><td>内容边框宽度</td></tr><tr><td><code>--tr-drag-overlay-content-border-radius</code></td><td>内容边框圆角</td></tr><tr><td><code>--tr-drag-overlay-icon-font-size</code></td><td>图标字体大小</td></tr><tr><td><code>--tr-drag-overlay-icon-margin</code></td><td>图标外边距</td></tr><tr><td><code>--tr-drag-overlay-text-gap</code></td><td>文本区域间距</td></tr><tr><td><code>--tr-drag-overlay-title-font-size</code></td><td>标题字体大小</td></tr><tr><td><code>--tr-drag-overlay-title-line-height</code></td><td>标题行高</td></tr><tr><td><code>--tr-drag-overlay-description-font-size</code></td><td>描述字体大小</td></tr><tr><td><code>--tr-drag-overlay-description-line-height</code></td><td>描述行高</td></tr></tbody></table><p>全屏模式下的 CSS 变量：</p><table tabindex="0"><thead><tr><th>变量名</th><th>描述</th></tr></thead><tbody><tr><td><code>--tr-drag-overlay-content-padding-fullscreen</code></td><td>全屏模式内容区域内边距</td></tr><tr><td><code>--tr-drag-overlay-content-border-width-fullscreen</code></td><td>全屏模式内容边框宽度</td></tr></tbody></table><h4 id="变量覆盖" tabindex="-1">变量覆盖 <a class="header-anchor" href="#变量覆盖" aria-label="Permalink to &quot;变量覆盖&quot;">​</a></h4><p><strong>基础样式自定义</strong></p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">:root</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-drag-overlay-bg-color</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">rgba</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-drag-overlay-title-color</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#333</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-drag-overlay-content-padding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">60</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>全屏模式自定义</strong></p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">:root</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-drag-overlay-content-padding-fullscreen</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 200</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-drag-overlay-content-border-width-fullscreen</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,21))])}}});export{Z as __pageData,j as default};

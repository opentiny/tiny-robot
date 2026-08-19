const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/disabled.BQPqSjHk.js","assets/chunks/theme.Be4c-Lda.js","assets/chunks/framework.C4IWSUkS.js","assets/chunks/custom-overlay.CeeJNisI.js","assets/chunks/basic.BjON-1tr.js"])))=>i.map(i=>d[i]);
import{aD as c,bQ as h,aZ as E,aL as x,v as F,H as b,bL as g,bB as u,J as n,bk as t,bJ as s,G as m,w as d,I as f,b7 as v,aU as D}from"./chunks/framework.C4IWSUkS.js";import{L as k,N as y}from"./chunks/index.DR5RmzGn.js";const C=`<template>
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
`,Z=JSON.parse('{"title":"DragOverlay 拖拽浮层","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/drag-overlay.md","filePath":"components/drag-overlay.md"}'),w={name:"components/drag-overlay.md"},j=Object.assign(w,{setup(A){const o=v();c(async()=>{o.value=(await h(async()=>{const{default:i}=await import("./chunks/disabled.BQPqSjHk.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const l=v();c(async()=>{l.value=(await h(async()=>{const{default:i}=await import("./chunks/custom-overlay.CeeJNisI.js");return{default:i}},__vite__mapDeps([3,1,2]))).default});const a=D(!0),r=v();return c(async()=>{r.value=(await h(async()=>{const{default:i}=await import("./chunks/basic.BjON-1tr.js");return{default:i}},__vite__mapDeps([4,1,2]))).default}),(i,e)=>{const p=E("ClientOnly");return x(),F("div",null,[e[3]||(e[3]=b("",7)),g(n(t(k),null,null,512),[[u,a.value]]),n(p,null,{default:s(()=>[n(t(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{a.value=!1}),vueCode:t(B)},m({_:2},[r.value?{name:"vue",fn:s(()=>[n(t(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=d("h3",{id:"自定义拖拽层",tabindex:"-1"},[f("自定义拖拽层 "),d("a",{class:"header-anchor",href:"#自定义拖拽层","aria-label":'Permalink to "自定义拖拽层"'},"​")],-1)),g(n(t(k),null,null,512),[[u,a.value]]),n(p,null,{default:s(()=>[n(t(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{a.value=!1}),vueCode:t(_)},m({_:2},[l.value?{name:"vue",fn:s(()=>[n(t(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[5]||(e[5]=d("h3",{id:"状态禁用",tabindex:"-1"},[f("状态禁用 "),d("a",{class:"header-anchor",href:"#状态禁用","aria-label":'Permalink to "状态禁用"'},"​")],-1)),g(n(t(k),null,null,512),[[u,a.value]]),n(p,null,{default:s(()=>[n(t(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{a.value=!1}),vueCode:t(C)},m({_:2},[o.value?{name:"vue",fn:s(()=>[n(t(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=b("",21))])}}});export{Z as __pageData,j as default};

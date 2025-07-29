const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/popup-config.BLp7_0sG.js","assets/chunks/index.BDVYzVt4.js","assets/chunks/framework.WjEkGhiu.js","assets/chunks/index2.DE8fSCLV.js","assets/chunks/index5.BgPA3y6E.js","assets/chunks/index6.BlLyDml4.js","assets/chunks/tiny-robot-svgs.Dnkbi6us.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index3.BnOquABP.js","assets/chunks/basic-usage.CU4nbJ5f.js","assets/chunks/tiny-robot-svgs.B2XD9sQ_.js","assets/chunks/index.BwkskP7b.js","assets/chunks/index.DTUTkZ-1.js","assets/chunks/loading-shadow.BvaKwsHe.js"])))=>i.map(i=>d[i]);
import{D as h,v as c,V as k,p as f,C as v,c as F,o as C,j as t,ag as g,G as e,ah as D,a as i,ai as u,k as a,w as d,aj as b}from"./chunks/framework.WjEkGhiu.js";import{O as y,E as m}from"./chunks/index.DW9_sJEN.js";const P=`<template>
  <div class="demo-container">
    <h3>弹窗配置示例 - 单实例模式</h3>
    <p class="description">此示例展示了如何确保同时最多只弹出一个弹窗，提供更好的用户体验。</p>

    <div class="button-group">
      <!-- 固定位置-->
      <button class="demo-button" :class="{ active: activeModal === 'fixed' }" @click="openModal('fixed')">
        固定位置
      </button>
      <button class="demo-button" :class="{ active: activeModal === 'leftDrawer' }" @click="openModal('leftDrawer')">
        左侧抽屉
      </button>
      <button class="demo-button" :class="{ active: activeModal === 'rightDrawer' }" @click="openModal('rightDrawer')">
        右侧抽屉
      </button>
      <button class="demo-button close-button" :disabled="!activeModal" @click="closeModal">关闭弹窗</button>
    </div>

    <div v-if="activeModal" class="status-info">当前激活弹窗：{{ getModalDisplayName(activeModal) }}</div>

    <!-- 固定位置 -->
    <McpServerPicker
      v-model:visible="showFixedModal"
      :popup-config="fixedModalConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :market-category-options="marketCategoryOptions"
      title="固定位置"
    />

    <!-- 左侧抽屉 -->
    <McpServerPicker
      v-model:visible="showLeftDrawer"
      :popup-config="leftDrawerConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :market-category-options="marketCategoryOptions"
      title="左侧抽屉"
    />

    <!-- 右侧抽屉 -->
    <McpServerPicker
      v-model:visible="showRightDrawer"
      :popup-config="rightDrawerConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :market-category-options="marketCategoryOptions"
      title="右侧抽屉"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { McpServerPicker, PluginInfo, MarketCategoryOption } from '@opentiny/tiny-robot'

// 弹窗类型枚举
type ModalType = 'fixed' | 'leftDrawer' | 'rightDrawer' | null

// 示例插件数据
const installedPlugins = ref<PluginInfo[]>([
  {
    id: 'plugin-1',
    name: 'GitHub 集成',
    icon: 'https://github.com/favicon.ico',
    description: '与 GitHub 仓库集成，提供代码搜索、PR 管理等功能',
    enabled: true,
    tools: [
      {
        id: 'tool-1',
        name: '搜索代码',
        description: '在 GitHub 仓库中搜索代码',
        enabled: true,
      },
      {
        id: 'tool-2',
        name: '创建 PR',
        description: '创建新的 Pull Request',
        enabled: true,
      },
      {
        id: 'tool-3',
        name: '查看 Issues',
        description: '查看和管理仓库 Issues',
        enabled: false,
      },
    ],
  },
  {
    id: 'plugin-2',
    name: 'Slack 通知',
    icon: 'https://slack.com/favicon.ico',
    description: '发送消息到 Slack 频道',
    enabled: false,
    tools: [
      {
        id: 'tool-4',
        name: '发送消息',
        description: '发送消息到指定频道',
        enabled: false,
      },
      {
        id: 'tool-5',
        name: '文件上传',
        description: '上传文件到 Slack',
        enabled: false,
      },
    ],
  },
])

// 市场插件数据
const marketPlugins = ref<PluginInfo[]>([
  {
    id: 'plugin-1',
    name: 'Jira 集成',
    icon: 'https://ts3.tc.mm.bing.net/th/id/ODLS.2a97aa8b-50c6-4e00-af97-3b563dfa07f4',
    description: 'Jira 任务管理',
    enabled: true,
    added: false,
    tools: [
      { id: 'tool-5', name: '创建任务', description: '创建 Jira 任务', enabled: false },
      { id: 'tool-6', name: '查询任务', description: '查询 Jira 任务', enabled: false },
    ],
  },
  {
    id: 'plugin-2',
    name: 'Notion 集成',
    icon: 'https://www.notion.so/front-static/favicon.ico',
    description: 'Notion 文档管理和协作',
    enabled: false,
    added: false,
    tools: [
      { id: 'tool-7', name: '创建页面', description: '创建 Notion 页面', enabled: false },
      { id: 'tool-8', name: '查询数据库', description: '查询 Notion 数据库', enabled: false },
    ],
  },
  {
    id: 'plugin-3',
    name: 'Telegram 机器人',
    icon: 'https://telegram.org/favicon.ico',
    description: 'Telegram 消息推送和自动化',
    enabled: false,
    added: false,
    tools: [{ id: 'tool-9', name: '发送消息', description: '发送 Telegram 消息', enabled: false }],
  },
])

// 市场分类选项
const marketCategoryOptions = ref<MarketCategoryOption[]>([
  { value: '', label: '全部分类' },
  { value: 'productivity', label: '生产力工具' },
  { value: 'communication', label: '沟通协作' },
  { value: 'development', label: '开发工具' },
  { value: 'ai', label: 'AI 助手' },
])
// 统一的弹窗状态管理
const activeModal = ref<ModalType>(null)

// 计算属性：基于活动弹窗类型控制各个弹窗的显示状态
const showFixedModal = computed({
  get: () => activeModal.value === 'fixed',
  set: (value: boolean) => {
    activeModal.value = value ? 'fixed' : null
  },
})

const showLeftDrawer = computed({
  get: () => activeModal.value === 'leftDrawer',
  set: (value: boolean) => {
    activeModal.value = value ? 'leftDrawer' : null
  },
})

const showRightDrawer = computed({
  get: () => activeModal.value === 'rightDrawer',
  set: (value: boolean) => {
    activeModal.value = value ? 'rightDrawer' : null
  },
})

// 弹窗操作方法
const openModal = (type: ModalType) => {
  activeModal.value = type
}

const closeModal = () => {
  activeModal.value = null
}

// 获取弹窗显示名称
const getModalDisplayName = (type: ModalType): string => {
  const nameMap = {
    leftDrawer: '左侧抽屉',
    rightDrawer: '右侧抽屉',
    fixed: '固定位置',
  }
  return type ? nameMap[type] : ''
}

// 不同的弹出配置
const fixedModalConfig = {
  type: 'fixed',
  position: { top: 0, bottom: 0, right: '20%' },
}

const leftDrawerConfig = {
  type: 'drawer',
  drawer: { direction: 'left' },
}

const rightDrawerConfig = {
  type: 'drawer',
  drawer: { direction: 'right' },
}
<\/script>

<style scoped>
.demo-container {
  padding: 20px;
}

.button-group {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.demo-button {
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  position: relative;
}

.demo-button:hover:not(:disabled) {
  background-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
}

.demo-button:active:not(:disabled) {
  background-color: #096dd9;
  transform: translateY(0);
}

.demo-button.active {
  background-color: #52c41a;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.4);
}

.demo-button.active:hover {
  background-color: #73d13d;
}

.demo-button.close-button {
  background-color: #ff4d4f;
}

.demo-button.close-button:hover:not(:disabled) {
  background-color: #ff7875;
}

.demo-button:disabled {
  background-color: #d9d9d9;
  color: #00000040;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.status-info {
  margin-bottom: 20px;
  padding: 12px 16px;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  color: #52c41a;
  font-size: 14px;
  font-weight: 500;
}

.description {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}
</style>
`,A=`<template>
  <div class="demo-controls">
    <h3>MCP Server Picker 演示</h3>
  </div>

  <!-- 插件面板，默认在页面右侧以抽屉的形式展示，可以点击按钮控制抽屉的显示和隐藏 -->
  <div class="demo-controls">
    <TinyButton
      :class="['plugin-common', { 'plugin-active': activeCount > 0 }]"
      circle
      size="small"
      @click="handleVisibleToggle"
    >
      <!-- 按钮的内容分为两种：激活状态和未激活状态 -->
      <IconPlugin class="plugin-common_icon" />
      <span class="plugin-common_text">扩展</span>
      <span class="plugin-active_count" v-if="activeCount">{{ activeCount }}</span>
    </TinyButton>
  </div>
  <McpServerPicker
    v-model:visible="visible"
    v-model:activeCount="activeCount"
    :popup-config="{
      type: 'drawer',
    }"
    :installed-plugins="installedPlugins"
    :market-plugins="marketPlugins"
    :market-category-options="marketCategoryOptions"
    :loading="loading"
    :market-loading="marketLoading"
    @plugin-toggle="handlePluginToggle"
    @plugin-add="handlePluginAdd"
    @plugin-create="handlePluginCreate"
    @plugin-delete="handlePluginDelete"
    @tool-toggle="handleToolToggle"
    @search="handleSearch"
    @tab-change="handleTabChange"
    @market-category-change="handleMarketCategoryChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  McpServerPicker,
  type PluginInfo,
  type PluginTool,
  type MarketCategoryOption,
  type PluginFormData,
  type PluginCreationData,
} from '@opentiny/tiny-robot'
import { IconPlugin } from '@opentiny/tiny-robot-svgs'
import { TinyButton } from '@opentiny/vue'

// 模拟加载状态
const loading = ref(false)
const marketLoading = ref(false)

// 激活数量 - 通过 v-model:activeCount 自动同步
const activeCount = ref(0)

// 已安装插件数据
const installedPlugins = ref<PluginInfo[]>([
  {
    id: 'plugin-1',
    name: 'GitHub 集成',
    icon: 'https://github.com/favicon.ico',
    description: '与 GitHub 仓库集成，提供代码搜索、PR 管理等功能',
    enabled: true,
    tools: [
      {
        id: 'tool-1',
        name: '搜索代码',
        description: '在 GitHub 仓库中搜索代码',
        enabled: true,
      },
      {
        id: 'tool-2',
        name: '创建 PR',
        description: '创建新的 Pull Request',
        enabled: true,
      },
      {
        id: 'tool-3',
        name: '查看 Issues',
        description: '查看和管理仓库 Issues',
        enabled: false,
      },
    ],
  },
  {
    id: 'plugin-2',
    name: 'Slack 通知',
    icon: 'https://slack.com/favicon.ico',
    description: '发送消息到 Slack 频道',
    enabled: false,
    tools: [
      {
        id: 'tool-4',
        name: '发送消息',
        description: '发送消息到指定频道',
        enabled: false,
      },
      {
        id: 'tool-5',
        name: '文件上传',
        description: '上传文件到 Slack',
        enabled: false,
      },
    ],
  },
])

// 市场插件数据
const marketPlugins = ref<PluginInfo[]>([
  {
    id: 'plugin-1',
    name: 'Jira 集成',
    icon: 'https://ts3.tc.mm.bing.net/th/id/ODLS.2a97aa8b-50c6-4e00-af97-3b563dfa07f4',
    description: 'Jira 任务管理',
    enabled: true,
    added: false,
    tools: [
      { id: 'tool-5', name: '创建任务', description: '创建 Jira 任务', enabled: false },
      { id: 'tool-6', name: '查询任务', description: '查询 Jira 任务', enabled: false },
    ],
  },
  {
    id: 'plugin-2',
    name: 'Notion 集成',
    icon: 'https://www.notion.so/front-static/favicon.ico',
    description: 'Notion 文档管理和协作',
    enabled: false,
    added: false,
    tools: [
      { id: 'tool-7', name: '创建页面', description: '创建 Notion 页面', enabled: false },
      { id: 'tool-8', name: '查询数据库', description: '查询 Notion 数据库', enabled: false },
    ],
  },
  {
    id: 'plugin-3',
    name: 'Telegram 机器人',
    icon: 'https://telegram.org/favicon.ico',
    description: 'Telegram 消息推送和自动化',
    enabled: false,
    added: false,
    tools: [{ id: 'tool-9', name: '发送消息', description: '发送 Telegram 消息', enabled: false }],
  },
])

// 市场分类选项
const marketCategoryOptions = ref<MarketCategoryOption[]>([
  { value: '', label: '全部分类' },
  { value: 'productivity', label: '生产力工具' },
  { value: 'communication', label: '沟通协作' },
  { value: 'development', label: '开发工具' },
  { value: 'ai', label: 'AI 助手' },
])

const visible = ref(false)

const handleVisibleToggle = () => {
  visible.value = true
}

// 事件处理
const handlePluginToggle = (plugin: PluginInfo, enabled: boolean) => {
  console.log('插件状态切换:', plugin.name, enabled)
  plugin.enabled = enabled
}

const handlePluginAdd = (plugin: PluginInfo, added: boolean) => {
  console.log('插件添加状态变化:', plugin, added)

  const targetPlugin = marketPlugins.value.find((p) => p.id === plugin.id)!
  targetPlugin.added = added

  if (added) {
    // 如果是添加操作，创建新的插件副本并添加到已安装列表
    const newPlugin: PluginInfo = {
      ...plugin,
      id: \`\${plugin.id}-installed-\${Date.now()}\`, // 生成新的ID避免冲突
      enabled: false, // 新添加的插件默认不启用
      added: true,
    }
    installedPlugins.value.push(newPlugin)
  } else {
    // 如果是取消添加操作，从已安装列表中移除
    const index = installedPlugins.value.findIndex((p) => p.name === plugin.name)
    if (index > -1) {
      installedPlugins.value.splice(index, 1)
    }
  }
}

const handlePluginDelete = (plugin: PluginInfo) => {
  console.log('删除插件:', plugin.name)
  const index = installedPlugins.value.findIndex((p) => p.id === plugin.id)
  if (index > -1) {
    installedPlugins.value.splice(index, 1)
  }
}

const handleToolToggle = (plugin: PluginInfo, toolId: string, enabled: boolean) => {
  console.log('工具状态切换:', plugin, toolId, enabled)
  const tool = plugin.tools?.find((t: PluginTool) => t.id === toolId)
  if (tool) {
    tool.enabled = enabled
  }
}

const createPluginByForm = (data: PluginFormData) => {
  console.log('表单方式添加插件:', data)
  // 可以在这里处理表单数据，例如发送到服务器
  const newPlugin: PluginInfo = {
    id: \`custom-\${Date.now()}\`,
    name: data.name,
    icon: '', // 如果有缩略图可以处理 data.thumbnail
    description: data.description,
    enabled: false,
    tools: [],
  }
  installedPlugins.value.push(newPlugin)
}

const createPluginByCode = (data: string) => {
  console.log('代码方式添加插件:', data)
}

// 新的插件创建事件处理
const handlePluginCreate = (type: 'form' | 'code', data: PluginCreationData) => {
  if (type === 'form') {
    createPluginByForm(data)
  } else {
    createPluginByCode(data)
  }
}

const handleSearch = (query: string, tab: string) => {
  console.log('搜索:', query, '在', tab)
}

const handleTabChange = (activeTab: string) => {
  console.log('标签页切换:', activeTab)
}

const handleMarketCategoryChange = (category: string) => {
  console.log('市场分类筛选:', category)
}
<\/script>

<style lang="less" scoped>
.demo-controls {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.plugin-common {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  height: 20px;
  min-width: 44px;
  box-sizing: content-box;

  &_text {
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0;
    text-align: left;
  }

  &_icon {
    font-size: 16px;
  }
}

.plugin-active {
  color: #1476ff;
  background-color: #eaf0f8;
  border: 1px solid #1476ff;

  &_count {
    width: 12px;
    height: 12px;
    background: #1476ff;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 9px;
    font-weight: 500;
    line-height: 12px;
    color: #fff;
  }

  &:hover {
    color: #1476ff;
    background-color: #eaf0f8;
    border: 1px solid #1476ff;
  }
}
</style>
`,T=JSON.parse('{"title":"MCP Server Picker 插件选择器","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/mcp-server-picker.md","filePath":"components/mcp-server-picker.md"}'),x={name:"components/mcp-server-picker.md"},M=Object.assign(x,{setup(E){const o=h();c(async()=>{o.value=(await k(async()=>{const{default:l}=await import("./chunks/popup-config.BLp7_0sG.js");return{default:l}},__vite__mapDeps([0,1,2,3,4,5,6,7,8]))).default});const s=f(!0),r=h();return c(async()=>{r.value=(await k(async()=>{const{default:l}=await import("./chunks/basic-usage.CU4nbJ5f.js");return{default:l}},__vite__mapDeps([9,1,2,3,4,5,6,7,8,10,11,12,13]))).default}),(l,n)=>{const p=v("ClientOnly");return C(),F("div",null,[n[2]||(n[2]=t("h1",{id:"mcp-server-picker-插件选择器",tabindex:"-1"},[i("MCP Server Picker 插件选择器 "),t("a",{class:"header-anchor",href:"#mcp-server-picker-插件选择器","aria-label":'Permalink to "MCP Server Picker 插件选择器"'},"​")],-1)),n[3]||(n[3]=t("p",null,"MCP Server Picker 组件是一个用于展示和管理插件的组件，支持已安装插件和插件市场两个标签页，可以进行插件的添加、删除和启用/禁用操作。",-1)),n[4]||(n[4]=t("h2",{id:"基础用法",tabindex:"-1"},[i("基础用法 "),t("a",{class:"header-anchor",href:"#基础用法","aria-label":'Permalink to "基础用法"'},"​")],-1)),g(e(a(y),null,null,512),[[u,s.value]]),e(p,null,{default:d(()=>[e(a(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:n[0]||(n[0]=()=>{s.value=!1}),vueCode:a(A)},b({_:2},[r.value?{name:"vue",fn:d(()=>[e(a(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[5]||(n[5]=t("h2",{id:"弹出方式",tabindex:"-1"},[i("弹出方式 "),t("a",{class:"header-anchor",href:"#弹出方式","aria-label":'Permalink to "弹出方式"'},"​")],-1)),n[6]||(n[6]=t("blockquote",null,[t("p",null,[i("MCP Server Picker 组件支持两种弹出方式， 即 "),t("code",null,"Fixed"),i(" 模式和 "),t("code",null,"Drawer"),i(" 模式，通过 "),t("code",null,"popupConfig"),i(" 配置对象统一管理")])],-1)),g(e(a(y),null,null,512),[[u,s.value]]),e(p,null,{default:d(()=>[e(a(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:n[1]||(n[1]=()=>{s.value=!1}),vueCode:a(P)},b({_:2},[o.value?{name:"vue",fn:d(()=>[e(a(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[7]||(n[7]=D(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><h4 id="数据源配置" tabindex="-1">数据源配置 <a class="header-anchor" href="#数据源配置" aria-label="Permalink to &quot;数据源配置&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>installedPlugins</code></td><td><code>PluginInfo[]</code></td><td><code>[]</code></td><td>已安装插件列表</td></tr><tr><td><code>marketPlugins</code></td><td><code>PluginInfo[]</code></td><td><code>[]</code></td><td>市场插件列表</td></tr></tbody></table><h4 id="搜索与筛选" tabindex="-1">搜索与筛选 <a class="header-anchor" href="#搜索与筛选" aria-label="Permalink to &quot;搜索与筛选&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>enableSearch</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否启用搜索功能</td></tr><tr><td><code>searchPlaceholder</code></td><td><code>string</code></td><td><code>&#39;搜索插件&#39;</code></td><td>搜索框占位符</td></tr><tr><td><code>enableMarketCategoryFilter</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否启用市场分类筛选功能</td></tr><tr><td><code>marketCategoryOptions</code></td><td><code>MarketCategoryOption[]</code></td><td><code>[]</code></td><td>市场分类选项列表</td></tr><tr><td><code>marketCategoryPlaceholder</code></td><td><code>string</code></td><td><code>&#39;按照分类筛选&#39;</code></td><td>分类筛选下拉框占位符</td></tr></tbody></table><h4 id="面板控制" tabindex="-1">面板控制 <a class="header-anchor" href="#面板控制" aria-label="Permalink to &quot;面板控制&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>visible</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否显示整个组件面板（支持 v-model:visible）</td></tr><tr><td><code>activeCount</code></td><td><code>number</code></td><td>-</td><td>激活插件数量（支持 v-model:activeCount）</td></tr><tr><td><code>defaultActiveTab</code></td><td><code>&#39;installed&#39; | &#39;market&#39;</code></td><td><code>&#39;installed&#39;</code></td><td>默认激活的标签页</td></tr><tr><td><code>showInstalledTab</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否显示已安装标签页</td></tr><tr><td><code>showMarketTab</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否显示市场标签页</td></tr><tr><td><code>installedTabTitle</code></td><td><code>string</code></td><td><code>&#39;已安装插件&#39;</code></td><td>已安装标签页标题</td></tr><tr><td><code>marketTabTitle</code></td><td><code>string</code></td><td><code>&#39;市场&#39;</code></td><td>市场标签页标题</td></tr><tr><td><code>popupConfig</code></td><td><code>PopupConfig</code></td><td><code>{ type: &#39;fixed&#39;, position: {}, drawer: { direction: &#39;right&#39; } }</code></td><td>弹出配置对象</td></tr></tbody></table><h4 id="头部配置" tabindex="-1">头部配置 <a class="header-anchor" href="#头部配置" aria-label="Permalink to &quot;头部配置&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>title</code></td><td><code>string</code></td><td><code>&#39;插件&#39;</code></td><td>组件标题</td></tr><tr><td><code>showCustomAddButton</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否显示自定义添加按钮</td></tr><tr><td><code>customAddButtonText</code></td><td><code>string</code></td><td><code>&#39;自定义添加&#39;</code></td><td>自定义添加按钮文本</td></tr></tbody></table><h4 id="行为控制" tabindex="-1">行为控制 <a class="header-anchor" href="#行为控制" aria-label="Permalink to &quot;行为控制&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>allowPluginToggle</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否允许切换插件状态</td></tr><tr><td><code>allowToolToggle</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否允许切换工具状态</td></tr><tr><td><code>allowPluginDelete</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否允许删除插件</td></tr><tr><td><code>allowPluginAdd</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否允许添加插件</td></tr></tbody></table><h4 id="状态控制" tabindex="-1">状态控制 <a class="header-anchor" href="#状态控制" aria-label="Permalink to &quot;状态控制&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>loading</code></td><td><code>boolean</code></td><td><code>false</code></td><td>已安装插件加载状态</td></tr><tr><td><code>marketLoading</code></td><td><code>boolean</code></td><td><code>false</code></td><td>市场插件加载状态</td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><h4 id="搜索与筛选-1" tabindex="-1">搜索与筛选 <a class="header-anchor" href="#搜索与筛选-1" aria-label="Permalink to &quot;搜索与筛选&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>search</code></td><td><code>(query: string, tab: &#39;installed&#39; | &#39;market&#39;)</code></td><td>搜索输入变化</td></tr><tr><td><code>market-category-change</code></td><td><code>(category: string)</code></td><td>市场分类筛选变化</td></tr></tbody></table><h4 id="面板控制-1" tabindex="-1">面板控制 <a class="header-anchor" href="#面板控制-1" aria-label="Permalink to &quot;面板控制&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>update:visible</code></td><td><code>(visible: boolean)</code></td><td>面板显示状态变化</td></tr><tr><td><code>update:activeCount</code></td><td><code>(count: number)</code></td><td>激活插件数量变化</td></tr><tr><td><code>tab-change</code></td><td><code>(activeTab: &#39;installed&#39; | &#39;market&#39;)</code></td><td>标签页切换</td></tr></tbody></table><h4 id="插件操作" tabindex="-1">插件操作 <a class="header-anchor" href="#插件操作" aria-label="Permalink to &quot;插件操作&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>plugin-toggle</code></td><td><code>(plugin: PluginInfo, enabled: boolean)</code></td><td>插件启用/禁用</td></tr><tr><td><code>plugin-delete</code></td><td><code>(plugin: PluginInfo)</code></td><td>删除插件</td></tr><tr><td><code>plugin-add</code></td><td><code>(plugin: PluginInfo, added: boolean)</code></td><td>市场插件添加/取消添加</td></tr><tr><td><code>plugin-create</code></td><td><code>(type: &#39;form&#39; | &#39;code&#39;, data: PluginCreationData)</code></td><td>插件创建</td></tr></tbody></table><h4 id="工具操作" tabindex="-1">工具操作 <a class="header-anchor" href="#工具操作" aria-label="Permalink to &quot;工具操作&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>tool-toggle</code></td><td><code>(plugin: PluginInfo, toolId: string, enabled: boolean)</code></td><td>工具启用/禁用</td></tr></tbody></table><h4 id="其他" tabindex="-1">其他 <a class="header-anchor" href="#其他" aria-label="Permalink to &quot;其他&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>refresh</code></td><td><code>(tab: &#39;installed&#39; | &#39;market&#39;)</code></td><td>刷新请求</td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><h4 id="plugininfo" tabindex="-1">PluginInfo <a class="header-anchor" href="#plugininfo" aria-label="Permalink to &quot;PluginInfo&quot;">​</a></h4><p>插件信息类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              // 插件唯一标识</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 插件名称</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 插件图标URL</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     // 插件描述</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  enabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       // 是否启用</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tools</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginTool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 工具列表</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  added</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         // 市场插件添加状态(可选)</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  category</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       // 插件分类(可选，用于市场分类筛选)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="plugintool" tabindex="-1">PluginTool <a class="header-anchor" href="#plugintool" aria-label="Permalink to &quot;PluginTool&quot;">​</a></h4><p>插件工具类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginTool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              // 工具唯一标识</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 工具名称</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     // 工具描述</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  enabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 是否启用</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="marketcategoryoption" tabindex="-1">MarketCategoryOption <a class="header-anchor" href="#marketcategoryoption" aria-label="Permalink to &quot;MarketCategoryOption&quot;">​</a></h4><p>市场分类选项类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MarketCategoryOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">           // 分类值</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">           // 分类显示名称</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="pluginformdata" tabindex="-1">PluginFormData <a class="header-anchor" href="#pluginformdata" aria-label="Permalink to &quot;PluginFormData&quot;">​</a></h4><p>表单方式添加插件数据类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginFormData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 插件名称</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     // 插件描述</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;sse&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;streamableHttp&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 插件类型, sse 或 streamableHttp</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  url</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">             // 插件 URL</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  headers</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         // 请求头（JSON 格式字符串）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  thumbnail</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> File</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 缩略图文件（可选）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="plugincreationdata" tabindex="-1">PluginCreationData <a class="header-anchor" href="#plugincreationdata" aria-label="Permalink to &quot;PluginCreationData&quot;">​</a></h4><p>PluginCreationData 类型是 PluginFormData 或 string 的联合类型，用于表示插件创建的数据。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginCreationData</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginFormData</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span></code></pre></div><h4 id="popupconfig" tabindex="-1">PopupConfig <a class="header-anchor" href="#popupconfig" aria-label="Permalink to &quot;PopupConfig&quot;">​</a></h4><p>弹窗配置类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PopupConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;fixed&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;drawer&#39;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // fixed模式配置</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  position</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    top</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    left</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    right</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    bottom</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // drawer模式配置</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  drawer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    direction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;left&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;right&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,44))])}}});export{T as __pageData,M as default};

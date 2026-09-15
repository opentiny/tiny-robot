const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.DssiOf1l.js","assets/chunks/theme.D2zKOQoy.js","assets/chunks/framework.B9XM8ZV2.js","assets/chunks/popup-config.BCfZxPO9.js","assets/chunks/basic-usage.CzUB2DX8.js"])))=>i.map(i=>d[i]);
import{aD as h,bQ as c,aZ as F,aL as f,v as E,H as d,bL as k,bB as g,J as n,bk as i,bJ as e,G as u,b7 as y,aU as v}from"./chunks/framework.B9XM8ZV2.js";import{T as A}from"./chunks/basic.BsKX-A1E.js";import{L as m,N as b}from"./chunks/index.E_LeY779.js";const C=`<template>
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
`,D=`<template>
  <div class="demo-controls">
    <h3>MCP Server Picker 演示</h3>
  </div>

  <!-- 插件面板，默认在页面右侧以抽屉的形式展示，可以点击按钮控制抽屉的显示和隐藏 -->
  <div class="demo-controls">
    <TinyButton
      :class="['plugin-common', { 'plugin-active': activeCount > 0 }]"
      round
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
    :installed-search-fn="handleInstalledSearchFn"
    :market-search-fn="handleMarketSearchFn"
    :loading="loading"
    :market-loading="marketLoading"
    @plugin-toggle="handlePluginToggle"
    @plugin-add="handlePluginAdd"
    @plugin-create="handlePluginCreate"
    @plugin-delete="handlePluginDelete"
    @tool-toggle="handleToolToggle"
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
    expanded: true,
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
    expanded: true,
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

// 市场插件数据 - 演示三种不同的添加状态
const marketPlugins = ref<PluginInfo[]>([
  {
    id: 'plugin-1',
    name: 'Jira 集成',
    icon: 'https://ts3.tc.mm.bing.net/th/id/ODLS.2a97aa8b-50c6-4e00-af97-3b563dfa07f4',
    description: 'Jira 任务管理',
    enabled: true,
    addState: 'idle', // 未添加状态，显示"添加"按钮
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
    addState: 'loading', // 添加中状态，显示"添加中"按钮
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
    addState: 'added', // 已添加状态，显示"已添加"按钮
    tools: [{ id: 'tool-9', name: '发送消息', description: '发送 Telegram 消息', enabled: false }],
    category: 'ai',
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
  plugin.enabled = enabled
}

const handlePluginAdd = (plugin: PluginInfo) => {
  const targetPlugin = marketPlugins.value.find((p) => p.id === plugin.id)!

  // 设置为加载状态
  targetPlugin.addState = 'loading'

  // 模拟异步添加过程
  setTimeout(() => {
    // 添加成功后设置为已添加状态
    targetPlugin.addState = 'added'

    const newPlugin: PluginInfo = {
      ...plugin,
      id: \`\${plugin.id}-installed-\${Date.now()}\`, // 生成新的ID避免冲突
      enabled: false, // 新添加的插件默认不启用
      addState: 'added',
    }
    installedPlugins.value.push(newPlugin)
  }, 2000) // 模拟2秒的网络延迟
}

const handlePluginDelete = (plugin: PluginInfo) => {
  const index = installedPlugins.value.findIndex((p) => p.id === plugin.id)
  if (index > -1) {
    installedPlugins.value.splice(index, 1)
  }

  const marketPlugin = marketPlugins.value.find((p) => p.name === plugin.name)
  if (marketPlugin) {
    marketPlugin.addState = 'idle'
  }
}

const handleToolToggle = (plugin: PluginInfo, toolId: string, enabled: boolean) => {
  const tool = plugin.tools?.find((t: PluginTool) => t.id === toolId)
  if (tool) {
    tool.enabled = enabled
  }
}

const createPluginByForm = (data: PluginFormData) => {
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

// 新的插件创建事件处理
const handlePluginCreate = (type: 'form' | 'code', data: PluginCreationData) => {
  if (type === 'form') {
    // 表单 创建插件逻辑
    createPluginByForm(data)
  } else {
    // 代码 创建插件逻辑
  }
}

const handleInstalledSearchFn = (query: string, item: PluginInfo) => {
  return item.name.toLowerCase().includes(query.toLowerCase())
}

const handleMarketSearchFn = (query: string, item: PluginInfo) => {
  return item.name.toLowerCase().includes(query.toLowerCase())
}
<\/script>

<style scoped>
.demo-controls {
  margin-bottom: 20px;
  padding: 16px;
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

  .plugin-common_text {
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0;
    text-align: left;
  }

  .plugin-common_icon {
    font-size: 16px;
  }
}

.plugin-active {
  color: #1476ff;
  background-color: #eaf0f8;
  border: 1px solid #1476ff;

  .plugin-active_count {
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
`,_=JSON.parse('{"title":"MCP Server Picker 插件选择器","description":"","frontmatter":{"outline":[1,3],"badge":"deprecated"},"headers":[],"relativePath":"components/mcp-server-picker.md","filePath":"components/mcp-server-picker.md"}'),P={name:"components/mcp-server-picker.md"},T=Object.assign(P,{setup(B){const l=y();h(async()=>{l.value=(await c(async()=>{const{default:a}=await import("./chunks/basic.DssiOf1l.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const o=y();h(async()=>{o.value=(await c(async()=>{const{default:a}=await import("./chunks/popup-config.BCfZxPO9.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const s=v(!0),r=y();return h(async()=>{r.value=(await c(async()=>{const{default:a}=await import("./chunks/basic-usage.CzUB2DX8.js");return{default:a}},__vite__mapDeps([4,1,2]))).default}),(a,t)=>{const p=F("ClientOnly");return f(),E("div",null,[t[3]||(t[3]=d('<h1 id="mcp-server-picker-插件选择器" tabindex="-1">MCP Server Picker 插件选择器 <a class="header-anchor" href="#mcp-server-picker-插件选择器" aria-label="Permalink to &quot;MCP Server Picker 插件选择器&quot;">​</a></h1><div class="warning custom-block github-alert"><p class="custom-block-title">WARNING</p><p><code>McpServerPicker</code> 已弃用，仅为兼容现有代码而保留，并计划在未来的主版本中移除。新功能请使用 <a href="./extension-manager.html"><code>ExtensionManager</code></a>。两者的 API 并非一一对应，迁移前请先确认下面的数据映射和职责变化。</p></div><p><code>McpServerPicker</code> 将 MCP 列表、弹出容器、自定义添加表单和工具开关集中在一个组件中。<code>ExtensionManager</code> 只负责通用 Extension 的浏览、筛选、分区和操作事件；弹出容器、MCP 表单、工具详情及数据更新由应用实现。</p><h2 id="迁移到-extensionmanager" tabindex="-1">迁移到 ExtensionManager <a class="header-anchor" href="#迁移到-extensionmanager" aria-label="Permalink to &quot;迁移到 ExtensionManager&quot;">​</a></h2><h3 id="数据与操作映射" tabindex="-1">数据与操作映射 <a class="header-anchor" href="#数据与操作映射" aria-label="Permalink to &quot;数据与操作映射&quot;">​</a></h3><table tabindex="0"><thead><tr><th><code>McpServerPicker</code></th><th><code>ExtensionManager</code></th><th>迁移说明</th></tr></thead><tbody><tr><td><code>installedPlugins</code>、<code>marketPlugins</code></td><td>一个或多个 <code>ExtensionManagerTab</code> 的 <code>items</code></td><td>将同类 MCP 合并到同一标签页；使用 <code>item.installed</code> 区分“已安装”和“可安装”，并保证 <code>item.id</code> 唯一。</td></tr><tr><td><code>installedSearchFn</code>、<code>marketSearchFn</code>、搜索开关及占位文案</td><td>内置的名称和描述关键词搜索</td><td>当前公共 API 不能关闭搜索、修改占位文案或替换匹配规则。预过滤 <code>tabs</code> 仍会与内置搜索叠加；必须保留旧搜索体验时，需要先扩展组件 API，或改用应用自己的管理界面。</td></tr><tr><td><code>marketCategoryOptions</code>、分类开关及占位文案</td><td><code>item.tags</code>，或应用自建的分类控件与预过滤层</td><td>内置标签筛选把 tag 值同时用作显示文案。分类值与文案相同时可直接迁移；否则不要传 <code>item.tags</code>，由应用保留 value 与 label 映射并预过滤 <code>tabs</code>。</td></tr><tr><td><code>PluginInfo.enabled</code></td><td><code>ExtensionCardSwitchAction.checked</code></td><td>应用处理 <code>action.id</code> 对应的开关操作，并使用 <code>action.checked</code> 更新外部 MCP 数据。</td></tr><tr><td><code>plugin-add</code>、<code>plugin-delete</code></td><td><code>action</code> 事件中的自定义 action id</td><td>应用完成安装或卸载后更新 <code>item.installed</code> 和 <code>actions</code>，组件随后重新分区。</td></tr><tr><td><code>addState</code>、<code>loading</code></td><td><code>item.progress</code>、action 的 <code>disabled</code>，以及应用自己的请求状态</td><td><code>ExtensionManager</code> 不执行请求，也不自动改变安装状态。</td></tr><tr><td><code>visible</code>、<code>popupConfig</code></td><td>应用提供的页面、Dialog、Drawer 或其他宿主</td><td><code>ExtensionManager</code> 是内容管理面板，不负责遮罩、定位、焦点陷阱和滚动锁定。</td></tr><tr><td><code>plugin-create</code></td><td>应用实现的 MCP 表单；完成后更新 <code>tabs</code></td><td><code>ExtensionManager</code> 不包含 MCP 创建表单。<code>McpAddForm</code> 在当前版本仍是独立的公共入口，未标记弃用。</td></tr><tr><td><code>tools</code>、<code>tool-toggle</code></td><td>应用提供的详情界面或 <code>item</code> 插槽</td><td>通用 Card 不推断 MCP 工具层级；自定义内容需要自行承担事件、键盘和 ARIA 语义。</td></tr></tbody></table><p><code>McpServerPicker</code> 的“已安装”和“市场”是两个固定标签页；<code>ExtensionManager.tabs</code> 表示 Extension 类型或应用定义的分类，每个标签页内部再根据 <code>installed</code> 自动生成“已安装”和“可安装”分区。迁移时不要直接把两组旧列表分别当成两个 <code>ExtensionManagerTab</code>，否则每个标签页仍会额外生成两个分区。</p><p>操作事件也从多个 MCP 专用事件合并为一个通用 <code>action</code> 事件。应用需要为安装、卸载和开关配置稳定的 action id，再根据 <code>tabId</code>、<code>sectionKey</code>、<code>itemId</code> 和 <code>action</code> 更新原始数据。完整的数据和事件示例见 <a href="./extension-manager.html#快速开始">ExtensionManager 快速开始</a>及<a href="./extension-manager.html#处理操作事件">处理操作事件</a>。</p><h3 id="迁移时需要保留的应用职责" tabindex="-1">迁移时需要保留的应用职责 <a class="header-anchor" href="#迁移时需要保留的应用职责" aria-label="Permalink to &quot;迁移时需要保留的应用职责&quot;">​</a></h3><ul><li>使用应用现有的 Dialog、Drawer 或页面承载 <code>ExtensionManager</code>，并处理打开、关闭和焦点返回。</li><li>在 MCP 表单提交成功后，将结果转换为 <code>ExtensionManagerItem</code> 并更新对应标签页。</li><li>将工具列表和工具级开关放入详情界面；若通过 <code>item</code> 插槽直接展示，需要补齐默认 Card 不再提供的交互和可访问性行为。</li><li>在安装、卸载、启用或禁用请求期间更新 <code>progress</code>、action <code>disabled</code> 和最终数据；组件只发出用户操作意图。</li></ul><h2 id="旧组件用法-兼容期" tabindex="-1">旧组件用法（兼容期） <a class="header-anchor" href="#旧组件用法-兼容期" aria-label="Permalink to &quot;旧组件用法（兼容期）&quot;">​</a></h2><p>下面的示例仅用于维护尚未迁移的现有代码，新功能不要继续接入 <code>McpServerPicker</code>。</p>',12)),k(n(i(m),null,null,512),[[g,s.value]]),n(p,null,{default:e(()=>[n(i(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{s.value=!1}),vueCode:i(D)},u({_:2},[r.value?{name:"vue",fn:e(()=>[n(i(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[4]||(t[4]=d(`<h3 id="插件添加状态" tabindex="-1">插件添加状态 <a class="header-anchor" href="#插件添加状态" aria-label="Permalink to &quot;插件添加状态&quot;">​</a></h3><p>市场插件支持三种添加状态，提供更好的用户体验：</p><ul><li><strong>idle</strong>: 未添加状态，显示&quot;添加&quot;按钮，用户可以点击添加</li><li><strong>loading</strong>: 添加中状态，显示&quot;添加中&quot;按钮，按钮不可点击，适用于网络请求等异步操作</li><li><strong>added</strong>: 已添加状态，显示&quot;已添加&quot;按钮，按钮不可点击</li></ul><p>通过 <code>addState</code> 属性控制插件的添加状态，开发者可以在添加插件的异步过程中动态更新状态，提升用户体验。</p><h4 id="状态控制示例" tabindex="-1">状态控制示例 <a class="header-anchor" href="#状态控制示例" aria-label="Permalink to &quot;状态控制示例&quot;">​</a></h4><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> handlePluginAdd</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">plugin</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> targetPlugin</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> marketPlugins.value.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">find</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">p</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> p.id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> plugin.id)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 设置为加载状态</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  targetPlugin.addState </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;loading&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 异步添加插件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  addPluginToServer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(plugin)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">then</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // 添加成功</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      targetPlugin.addState </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;added&#39;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // 添加到已安装列表</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      installedPlugins.value.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(newPlugin)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // 添加失败，重置为idle状态，用户可以重新尝试</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      targetPlugin.addState </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;idle&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="旧组件弹出方式-兼容期" tabindex="-1">旧组件弹出方式（兼容期） <a class="header-anchor" href="#旧组件弹出方式-兼容期" aria-label="Permalink to &quot;旧组件弹出方式（兼容期）&quot;">​</a></h2><blockquote><p>MCP Server Picker 组件支持两种弹出方式， 即 <code>Fixed</code> 模式和 <code>Drawer</code> 模式，通过 <code>popupConfig</code> 配置对象统一管理</p></blockquote>`,8)),k(n(i(m),null,null,512),[[g,s.value]]),n(p,null,{default:e(()=>[n(i(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{s.value=!1}),vueCode:i(C)},u({_:2},[o.value?{name:"vue",fn:e(()=>[n(i(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[5]||(t[5]=d(`<h2 id="旧组件-api-兼容期" tabindex="-1">旧组件 API（兼容期） <a class="header-anchor" href="#旧组件-api-兼容期" aria-label="Permalink to &quot;旧组件 API（兼容期）&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td>installedPlugins</td><td><code>PluginInfo[]</code></td><td><code>[]</code></td><td>已安装插件列表</td></tr><tr><td>marketPlugins</td><td><code>PluginInfo[]</code></td><td><code>[]</code></td><td>市场插件列表</td></tr><tr><td>enableSearch</td><td><code>boolean</code></td><td><code>true</code></td><td>是否启用搜索功能</td></tr><tr><td>searchPlaceholder</td><td><code>string</code></td><td><code>&#39;搜索插件&#39;</code></td><td>搜索框占位符</td></tr><tr><td>installedSearchFn</td><td><code>(query: string, item: PluginInfo) =&gt; boolean</code></td><td>—</td><td>已安装插件的自定义搜索函数</td></tr><tr><td>marketSearchFn</td><td><code>(query: string, item: PluginInfo) =&gt; boolean</code></td><td>—</td><td>市场插件的自定义搜索函数</td></tr><tr><td>enableMarketCategoryFilter</td><td><code>boolean</code></td><td><code>true</code></td><td>是否启用市场分类筛选功能</td></tr><tr><td>marketCategoryOptions</td><td><code>MarketCategoryOption[]</code></td><td><code>[]</code></td><td>市场分类选项列表</td></tr><tr><td>marketCategoryPlaceholder</td><td><code>string</code></td><td><code>&#39;按照分类筛选&#39;</code></td><td>分类筛选下拉框占位符</td></tr><tr><td>visible</td><td><code>boolean</code></td><td><code>false</code></td><td>是否显示整个组件面板（支持 v-model:visible）</td></tr><tr><td>activeCount</td><td><code>number</code></td><td>-</td><td>激活插件数量（支持 v-model:activeCount）</td></tr><tr><td>defaultActiveTab</td><td><code>&#39;installed&#39; | &#39;market&#39;</code></td><td><code>&#39;installed&#39;</code></td><td>默认激活的标签页</td></tr><tr><td>showInstalledTab</td><td><code>boolean</code></td><td><code>true</code></td><td>是否显示已安装标签页</td></tr><tr><td>showMarketTab</td><td><code>boolean</code></td><td><code>true</code></td><td>是否显示市场标签页</td></tr><tr><td>installedTabTitle</td><td><code>string</code></td><td><code>&#39;已安装插件&#39;</code></td><td>已安装标签页标题</td></tr><tr><td>marketTabTitle</td><td><code>string</code></td><td><code>&#39;市场&#39;</code></td><td>市场标签页标题</td></tr><tr><td>popupConfig</td><td><code>PopupConfig</code></td><td><code>{ type: &#39;fixed&#39;, position: {}, drawer: { direction: &#39;right&#39; } }</code></td><td>弹出配置对象</td></tr><tr><td>title</td><td><code>string</code></td><td><code>&#39;插件&#39;</code></td><td>组件标题</td></tr><tr><td>showCustomAddButton</td><td><code>boolean</code></td><td><code>true</code></td><td>是否显示自定义添加按钮</td></tr><tr><td>customAddButtonText</td><td><code>string</code></td><td><code>&#39;自定义添加&#39;</code></td><td>自定义添加按钮文本</td></tr><tr><td>allowPluginToggle</td><td><code>boolean</code></td><td><code>true</code></td><td>是否允许切换插件状态</td></tr><tr><td>allowToolToggle</td><td><code>boolean</code></td><td><code>true</code></td><td>是否允许切换工具状态</td></tr><tr><td>allowPluginDelete</td><td><code>boolean</code></td><td><code>true</code></td><td>是否允许删除插件</td></tr><tr><td>allowPluginAdd</td><td><code>boolean</code></td><td><code>true</code></td><td>是否允许添加插件</td></tr><tr><td>loading</td><td><code>boolean</code></td><td><code>false</code></td><td>已安装插件加载状态</td></tr><tr><td>marketLoading</td><td><code>boolean</code></td><td><code>false</code></td><td>市场插件加载状态</td></tr></tbody></table><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名称</th><th>描述</th><th>默认内容</th></tr></thead><tbody><tr><td><code>header-actions</code></td><td>头部右侧操作区插槽</td><td>无</td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td>market-category-change</td><td>市场分类筛选变化</td><td><code>(category: string)</code></td></tr><tr><td>update:visible</td><td>面板显示状态变化</td><td><code>(visible: boolean)</code></td></tr><tr><td>update:activeCount</td><td>激活插件数量变化</td><td><code>(count: number)</code></td></tr><tr><td>tab-change</td><td>标签页切换</td><td><code>(activeTab: &#39;installed&#39; | &#39;market&#39;)</code></td></tr><tr><td>plugin-toggle</td><td>插件启用/禁用</td><td><code>(plugin: PluginInfo, enabled: boolean)</code></td></tr><tr><td>plugin-delete</td><td>删除插件</td><td><code>(plugin: PluginInfo)</code></td></tr><tr><td>plugin-add</td><td>市场插件添加</td><td><code>(plugin: PluginInfo)</code></td></tr><tr><td>plugin-create</td><td>插件创建</td><td><code>(type: &#39;form&#39; | &#39;code&#39;, data: PluginCreationData)</code></td></tr><tr><td>tool-toggle</td><td>工具启用/禁用</td><td><code>(plugin: PluginInfo, toolId: string, enabled: boolean)</code></td></tr><tr><td>refresh</td><td>刷新请求</td><td><code>(tab: &#39;installed&#39; | &#39;market&#39;)</code></td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><p><strong>PluginInfo</strong></p><p>插件信息类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginAddState</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;idle&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;loading&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;added&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 插件唯一标识</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 插件名称</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 插件图标URL</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 插件描述</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  enabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否启用</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  expanded</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否展开</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tools</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginTool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 工具列表</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  addState</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginAddState</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 市场插件添加状态(可选): &#39;idle&#39; - 未添加, &#39;loading&#39; - 添加中, &#39;added&#39; - 已添加</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  category</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 插件分类(可选，用于市场分类筛选)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>PluginTool</strong></p><p>插件工具类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginTool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 工具唯一标识</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 工具名称</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 工具描述</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  enabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否启用</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>MarketCategoryOption</strong></p><p>市场分类选项类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MarketCategoryOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 分类值</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 分类显示名称</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>PluginFormData</strong></p><p>表单方式添加插件数据类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginFormData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 插件名称</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 插件描述</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;sse&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;streamableHttp&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 插件类型, sse 或 streamableHttp</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  url</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 插件 URL</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  headers</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 请求头（JSON 格式字符串）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  thumbnail</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> File</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 缩略图文件（可选）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>PluginCreationData</strong></p><p>PluginCreationData 类型是 PluginFormData 或 string 的联合类型，用于表示插件创建的数据。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginCreationData</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PluginFormData</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span></code></pre></div><p><strong>PopupConfig</strong></p><p>弹窗配置类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PopupConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
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
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="mcpaddform" tabindex="-1">McpAddForm <a class="header-anchor" href="#mcpaddform" aria-label="Permalink to &quot;McpAddForm&quot;">​</a></h2><p><code>McpAddForm</code> 在当前版本仍是独立的公共入口，未标记弃用。它可以继续用于现有 MCP 添加流程；迁移到 <code>ExtensionManager</code> 后，应用需要在表单确认时把结果转换为 Extension 数据并更新 <code>tabs</code>。</p><h1 id="mcpaddform-插件添加表单" tabindex="-1">McpAddForm 插件添加表单 <a class="header-anchor" href="#mcpaddform-插件添加表单" aria-label="Permalink to &quot;McpAddForm 插件添加表单&quot;">​</a></h1><p>McpAddForm 是一个用于添加插件的表单组件，支持表单添加和代码添加两种方式。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基础用法" tabindex="-1">基础用法 <a class="header-anchor" href="#基础用法" aria-label="Permalink to &quot;基础用法&quot;">​</a></h3>`,32)),k(n(i(m),null,null,512),[[g,s.value]]),n(p,null,{default:e(()=>[n(i(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{s.value=!1}),vueCode:i(A)},u({_:2},[l.value?{name:"vue",fn:e(()=>[n(i(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[6]||(t[6]=d(`<h2 id="props-1" tabindex="-1">Props <a class="header-anchor" href="#props-1" aria-label="Permalink to &quot;Props&quot;">​</a></h2><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td>addType</td><td><code>AddType</code></td><td><code>form</code></td><td>当前添加方式</td></tr><tr><td>formData</td><td><code>McpAddFormData</code></td><td>-</td><td>表单数据</td></tr><tr><td>codeData</td><td><code>string</code></td><td>-</td><td>代码数据</td></tr></tbody></table><h2 id="events-1" tabindex="-1">Events <a class="header-anchor" href="#events-1" aria-label="Permalink to &quot;Events&quot;">​</a></h2><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td>update:addType</td><td>添加方式变化时触发</td><td><code>(value: AddType)</code></td></tr><tr><td>confirm</td><td>确认添加时触发</td><td><code>(type: AddType, data: McpAddFormData | string)</code></td></tr><tr><td>cancel</td><td>取消添加时触发</td><td>-</td></tr></tbody></table><h2 id="types-1" tabindex="-1">Types <a class="header-anchor" href="#types-1" aria-label="Permalink to &quot;Types&quot;">​</a></h2><p><strong>AddType</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AddType</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;form&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;code&#39;</span></span></code></pre></div><p><strong>McpAddFormData</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> McpAddFormData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;sse&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;streamableHttp&#39;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  url</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  headers</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  thumbnail</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> File</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><p>McpAddForm 组件支持以下 CSS 变量来自定义样式：</p><p><strong>全局变量 (<code>:root</code>)</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-mcp-add-form-box-shadow</code></td><td>容器阴影</td></tr><tr><td><code>--tr-mcp-add-form-content-padding</code></td><td>内容区域内边距</td></tr><tr><td><code>--tr-mcp-add-form-add-type-gap</code></td><td>添加类型区域间距</td></tr><tr><td><code>--tr-mcp-add-form-add-type-margin-bottom</code></td><td>添加类型区域下边距</td></tr><tr><td><code>--tr-mcp-add-form-add-type-label-font-size</code></td><td>标签字体大小</td></tr><tr><td><code>--tr-mcp-add-form-add-type-label-font-weight</code></td><td>标签字体粗细</td></tr><tr><td><code>--tr-mcp-add-form-add-type-label-line-height</code></td><td>标签行高</td></tr><tr><td><code>--tr-mcp-add-form-add-type-label-color</code></td><td>标签文字颜色</td></tr><tr><td><code>--tr-mcp-add-form-footer-padding</code></td><td>底部区域内边距</td></tr><tr><td><code>--tr-mcp-add-form-footer-gap</code></td><td>底部按钮间距</td></tr><tr><td><code>--tr-mcp-add-form-button-border-radius</code></td><td>按钮圆角</td></tr><tr><td><code>--tr-mcp-add-form-button-padding</code></td><td>按钮内边距</td></tr><tr><td><code>--tr-mcp-add-form-button-font-size</code></td><td>按钮字体大小</td></tr><tr><td><code>--tr-mcp-add-form-button-height</code></td><td>按钮高度</td></tr><tr><td><code>--tr-mcp-add-form-button-line-height</code></td><td>按钮行高</td></tr><tr><td><code>--tr-mcp-add-form-button-min-width</code></td><td>按钮最小宽度</td></tr><tr><td><code>--tr-mcp-add-form-button-transition</code></td><td>按钮过渡效果</td></tr><tr><td><code>--tr-mcp-add-form-cancel-bg-color</code></td><td>取消按钮背景色</td></tr><tr><td><code>--tr-mcp-add-form-cancel-border-color</code></td><td>取消按钮边框色</td></tr><tr><td><code>--tr-mcp-add-form-cancel-text-color</code></td><td>取消按钮文字颜色</td></tr><tr><td><code>--tr-mcp-add-form-cancel-hover-border-color</code></td><td>取消按钮悬停边框色</td></tr><tr><td><code>--tr-mcp-add-form-confirm-bg-color</code></td><td>确认按钮背景色</td></tr><tr><td><code>--tr-mcp-add-form-confirm-border-color</code></td><td>确认按钮边框色</td></tr><tr><td><code>--tr-mcp-add-form-confirm-text-color</code></td><td>确认按钮文字颜色</td></tr><tr><td><code>--tr-mcp-add-form-confirm-hover-bg-color</code></td><td>确认按钮悬停背景色</td></tr><tr><td><code>--tr-mcp-add-form-confirm-hover-border-color</code></td><td>确认按钮悬停边框色</td></tr></tbody></table><p><strong>响应式变量</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-mcp-add-form-add-type-gap-mobile</code></td><td>移动端添加类型区域间距</td></tr></tbody></table><p><strong>变量覆盖示例</strong></p><p>默认模式</p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">:root</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-mcp-add-form-max-width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>自定义按钮颜色</p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">:root</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-mcp-add-form-confirm-bg-color</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#1890ff</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-mcp-add-form-confirm-border-color</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#1890ff</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-mcp-add-form-confirm-hover-bg-color</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#40a9ff</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,20))])}}});export{_ as __pageData,T as default};

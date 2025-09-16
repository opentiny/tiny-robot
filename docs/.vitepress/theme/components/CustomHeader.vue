<template>
  <header class="custom-header">
    <div class="header-container">
      <!-- 第一行：Logo + 搜索栏 + 工具按钮 -->
      <div class="header-top">
        <!-- Logo 区域 -->
        <div class="logo-section">
          <a href="/" class="logo-link">
            <img src="/logo-mini.svg" alt="TinyRobot" class="logo-icon" />
            <span class="logo-text">{{ site.title }}</span>
          </a>
        </div>

        <!-- 中央搜索栏 -->
        <div class="search-section">
          <div class="search-container">
            <div class="search-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input type="text" placeholder="Search..." class="search-input" @click="openSearch" />
            <div class="search-shortcut">
              <kbd class="kbd">Ctrl K</kbd>
            </div>
          </div>
        </div>

        <!-- 右侧工具栏 -->
        <div class="tools-section">
          <!-- OpenTiny 链接 -->
          <a href="https://opentiny.design" title="OpenTiny" class="home-link">
            <span>OpenTiny</span>
            <svg width="3" height="24" viewBox="0 -9 3 24" class="h-5 rotate-0 overflow-visible text-white/90">
              <path d="M0 0L3 3L0 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            </svg>
          </a>

          <!-- 主题切换 -->
          <button @click="toggleDark" class="tool-button" title="Toggle theme">
            <svg v-if="!isDark" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg v-else width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          <!-- GitHub 链接 -->
          <a
            href="https://github.com/opentiny/tiny-robot"
            target="_blank"
            rel="noopener noreferrer"
            class="tool-button"
            title="GitHub"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
          </a>
        </div>
      </div>

      <!-- 第二行：主导航栏 -->
      <div class="header-bottom" v-if="showNavigation">
        <TabNavigation
          :tabs="navigationTabs"
          :activeTab="activeNavTab"
          @tab-change="handleNavTabChange"
          @tab-click="handleNavTabClick"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useData, useRoute, useRouter } from 'vitepress'
import TabNavigation from './TabNavigation.vue'
import { normalizeLink, isActiveRoute, isHomePage } from '../utils/router'

// 获取 VitePress 数据
const { site, theme } = useData()
const route = useRoute()
const router = useRouter()

// 获取主题配置
const themeConfig = computed(() => theme.value)

interface configNavItem {
  text: string
  link: string
  activeMatch?: string
}

// 转换导航配置为TabNavigation所需格式
const navigationTabs = computed(() => {
  return (
    themeConfig.value.nav?.map((item: configNavItem) => ({
      key: item.link || item.text.toLowerCase().replace(/\s+/g, '-'),
      name: item.text,
      link: item.link,
      disabled: false,
    })) || []
  )
})

interface TabItem {
  key: string
  name: string
  link: string
  disabled?: boolean
}

// 是否显示导航栏: 如果当前路径是首页，则不显示导航栏
const showNavigation = computed(() => {
  return !isHomePage(route.path, site.value.base)
})

// 当前激活的导航标签
const activeNavTab = computed(() => {
  const currentTab = navigationTabs.value.find((tab: TabItem) =>
    isActiveNav({ text: tab.name, link: tab.link, activeMatch: undefined }),
  )
  return currentTab?.key || ''
})

// 处理导航标签变化
const handleNavTabChange = (tabKey: string) => {
  const tab = navigationTabs.value.find((t: TabItem) => t.key === tabKey)
  if (tab?.link) {
    // 使用 VitePress 路由进行 SPA 导航，确保使用正确的路径
    const targetPath = normalizeLink(tab.link, site.value.base)
    router.go(targetPath)
  }
}

// 处理导航标签点击
const handleNavTabClick = (tab: TabItem) => {
  if (tab.link) {
    // 使用 VitePress 路由进行 SPA 导航，确保使用正确的路径
    const targetPath = normalizeLink(tab.link, site.value.base)
    router.go(targetPath)
  }
}

// 暗色模式状态
const isDark = ref(false)

// 初始化暗色模式状态
onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

// 切换暗色模式
const toggleDark = () => {
  const html = document.documentElement
  const isDarkMode = html.classList.contains('dark')

  if (isDarkMode) {
    html.classList.remove('dark')
    localStorage.setItem('vitepress-theme-appearance', 'light')
    isDark.value = false
  } else {
    html.classList.add('dark')
    localStorage.setItem('vitepress-theme-appearance', 'dark')
    isDark.value = true
  }
}

interface NavItem {
  text: string
  link: string
  activeMatch?: string
}

// 判断导航项是否激活
const isActiveNav = (navItem: NavItem) => {
  return isActiveRoute(route.path, navItem.link, navItem.activeMatch, site.value.base)
}

// 打开搜索
const openSearch = () => {
  // 触发 VitePress 默认搜索
  const event = new KeyboardEvent('keydown', {
    key: 'k',
    ctrlKey: true,
    bubbles: true,
  })
  document.dispatchEvent(event)
}
</script>

<style scoped>
.custom-header {
  --vp-c-divider: #f9f9f9;
  --search-border-color: #dfdfdf;

  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  border-bottom: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dark .custom-header {
  --vp-c-divider: #282c34;
  --search-border-color: #a8b1ff;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 第一行样式 */
.header-top {
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
}

/* 搜索栏样式 */
.search-section {
  display: flex;
  flex: 1;
  max-width: 512px;
  margin: 0 32px;
}

.search-container {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--vp-c-text-2);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 64px 0 40px;
  border: 1px solid var(--search-border-color);
  border-radius: 12px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
  background-color: var(--vp-c-bg);
}

.search-input::placeholder {
  color: var(--vp-c-text-2);
}

.search-shortcut {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.kbd {
  padding: 4px 8px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Monaco, Consolas, monospace;
  color: var(--vp-c-text-2);
}

/* 工具栏样式 */
.tools-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-link {
  --home-link-bg-color: #191919;
  --home-link-text-color: #ffffff;

  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--home-link-text-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  padding: 4px 16px;
  border-radius: 25px;
  background-color: var(--home-link-bg-color);
}

.dark .home-link {
  --home-link-bg-color: #ffffff;
  --home-link-text-color: #191919;
}

.tool-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: 8px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.tool-button:hover {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

/* 第二行样式 */
.header-bottom {
  height: var(--vp-nav-bottom-height);
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (min-width: 1024px) {
  .header-bottom {
    display: flex;
  }
}

@media (max-width: 768px) {
  .search-section {
    display: none;
  }

  .header-top {
    height: 56px;
  }

  .logo-text {
    font-size: 18px;
  }
}

@media (max-width: 640px) {
  .header-top {
    padding: 0 12px;
  }

  .tools-section {
    gap: 4px;
  }

  .tool-button {
    width: 36px;
    height: 36px;
  }
}

/* 可访问性支持 */
@media (prefers-contrast: high) {
  .custom-header {
    border-bottom: 2px solid var(--vp-c-divider);
  }

  .nav-item-active::before {
    height: 3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-item-active::after,
  .nav-item,
  .tool-button,
  .search-input {
    animation: none;
    transition: none;
  }
}
</style>

<script lang="ts" setup>
import { Dropdown, DropdownMenu, Modal, TabItem, Tabs } from '@opentiny/vue'
import locale from '@opentiny/vue-locale'
import TinyThemeTool from '@opentiny/vue-theme/theme-tool'
import { computed, nextTick, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Footer from '@/components/footer/index.vue'
import Menu from '@/components/menu/index.vue'
import NavBar from '@/components/navbar/index.vue'
import { useTheme } from '@/hooks/useTheme'
import { useAppStore, useTabStore } from '@/store'
import TinyRobotChat from '@/tiny-robot-chat/TinyRobotChat.vue'
import PageLayout from './page-layout.vue'

// 动态切换
const router = useRouter()
const appStore = useAppStore()
const footerColor = ref('#fff')

const { t } = useI18n()
const tabStore = useTabStore()

const tabsHistory = computed(() => tabStore.data)
const currentTabName = ref()

const { isMenuCollapsed } = appStore

const reloadKey = ref('')
function reloadMenu() {
  reloadKey.value = 'menu'
  nextTick(() => {
    reloadKey.value = ''
  })
}
const tabsRefreshKey = ref('')
provide('RELOAD', {
  reloadMenu,
})

watch(
  () => tabStore.current,
  () => {
    currentTabName.value = tabStore.current?.link
  },
  { deep: true, immediate: true },
)

function onClick(tab: { name: string, link: string }) {
  const routePaths = router.getRoutes().map(routeItem => routeItem.path)
  if (!routePaths.includes(tab.name)) {
    Modal.message({
      message: locale.t('exception.result.404.description'),
      status: 'error',
    })
    const curName = tabStore.delByLink(tab.name)
    tabStore.set(curName)
    tabStore.$patch({
      current: tabStore.getByName(curName)[0],
    })
    currentTabName.value = tabStore.current?.link
    tabsRefreshKey.value = '1'
    nextTick(() => {
      tabsRefreshKey.value = ''
    })
  }
  else {
    router.replace(tab.name)
  }
}
function onClose(name: string) {
  if (tabStore.data.length === 1) {
    return
  }
  const routerPaths = router.getRoutes().map(r => r.path)
  const deleteItemIndex = tabStore.data.findIndex(
    item => item.link === name,
  )
  let rightIdx = deleteItemIndex + 1
  let leftIdx = deleteItemIndex - 1
  let path = ''
  const deleteSelf = deleteItemIndex >= 0 && tabStore.current?.link === name
  if (!deleteSelf) {
    tabStore.delByLink(name)
    return
  }
  let curName = ''
  // 向右找到一个最近的路由项
  while (rightIdx < tabStore.data.length && !path) {
    const item = tabStore.data[rightIdx]
    if (routerPaths.includes(item.link)) {
      path = item.link
      curName = item.name
      break
    }
    rightIdx += 1
  }
  // 向左找到一个最近的路由
  while (leftIdx >= 0 && !path) {
    const item = tabStore.data[leftIdx]
    if (routerPaths.includes(item.link)) {
      path = item.link
      curName = item.name
      break
    }
    leftIdx -= 1
  }
  // 找不到存在的路由则不删除当前路由也不跳转
  if (leftIdx < 0 && rightIdx >= tabStore.data.length && !path) {
    return
  }
  tabStore.delByLink(name)
  // 跳转到最近的一个合法路由
  tabStore.set(curName)
  router.push({ path })
}

type TabMenuAction = 'close' | 'closeOthers' | 'closeLeft' | 'closeRight' | 'closeAll'

interface TabRecord {
  name: string
  link: string
}

interface TabMenuOption {
  label: string
  action: TabMenuAction
  disabled?: boolean
  divided?: boolean
}

const tabMenuList = computed(() => {
  const total = tabsHistory.value.length
  return tabsHistory.value.map<TabMenuOption[]>((_, index) => [
    {
      label: t('tabs.close'),
      action: 'close',
      disabled: total <= 1,
    },
    {
      label: t('tabs.closeOthers'),
      action: 'closeOthers',
      disabled: total <= 1,
    },
    {
      label: t('tabs.closeLeft'),
      action: 'closeLeft',
      disabled: index <= 0,
    },
    {
      label: t('tabs.closeRight'),
      action: 'closeRight',
      disabled: index >= total - 1,
    },
    {
      label: t('tabs.closeAll'),
      action: 'closeAll',
      disabled: total <= 1,
      divided: true,
    },
  ])
})

function openKeptTab(tab: TabRecord) {
  tabStore.set(tab.name)
  const currentRoute = router.currentRoute.value
  if (currentRoute.fullPath !== tab.link && currentRoute.path !== tab.link) {
    router.push(tab.link)
  }
}

function onTabMenuClick(
  data: { itemData?: TabMenuOption },
  history: TabRecord,
) {
  const action = data?.itemData?.action
  if (!action || data.itemData?.disabled) {
    return
  }
  const tabs = tabStore.data.slice()
  const index = tabs.findIndex(tab => tab.link === history.link)
  if (index < 0) {
    return
  }
  if (action === 'close') {
    onClose(history.link)
    return
  }
  const currentLink = tabStore.current?.link
  let removeLinks: string[] = []
  let nextTab: TabRecord | undefined
  if (action === 'closeOthers') {
    removeLinks = tabs.filter(tab => tab.link !== history.link).map(tab => tab.link)
    nextTab = history
  }
  else if (action === 'closeLeft') {
    removeLinks = tabs.slice(0, index).map(tab => tab.link)
    nextTab = history
  }
  else if (action === 'closeRight') {
    removeLinks = tabs.slice(index + 1).map(tab => tab.link)
    nextTab = history
  }
  else if (action === 'closeAll') {
    nextTab = tabs[0]
    removeLinks = tabs.slice(1).map(tab => tab.link)
  }
  if (!removeLinks.length || !nextTab) {
    return
  }
  removeLinks
    .filter(link => link !== currentLink)
    .forEach(link => tabStore.delByLink(link))
  if (currentLink && removeLinks.includes(currentLink)) {
    tabStore.delByLink(currentLink)
    openKeptTab(nextTab)
  }
}

// 切换简约模式，图标按钮
const top = ref('10px')

// 判断是否显示设置图标
function switchSet() {
  appStore.updateSettings({ Settings: true })
}

// 是否显示切换框架结构
const myPattern = ref('legend')

const layoutMode = {
  // 传奇布局
  legend: {
    navbar: true,
    menu: true,
    footer: true,
  },
  // 简约布局
  simple: {
    navbar: false,
    menu: true,
    footer: false,
  },
  // 时尚布局
  fashion: {
    navbar: true,
    menu: true,
    footer: false,
  },
  // 经典布局
  classic: {
    navbar: true,
    menu: false,
    footer: true,
  },
  // 默认布局
  default: {
    navbar: true,
    menu: true,
    footer: false,
  },
}

// 主题配置
const theme = new TinyThemeTool()
useTheme(theme)
provide('THEME', theme)

watch(appStore.$state, (newValue) => {
  if (!newValue.navbar) {
    myPattern.value = 'simple'
  }
  else if (!newValue.footer) {
    myPattern.value = 'fashion'
  }
  else if (!newValue.menu) {
    myPattern.value = 'classic'
  }
  else {
    myPattern.value = 'legend'
  }
  appStore.footer ? (top.value = '10px') : (top.value = '60px')
})

watch(appStore.$state, (newValue) => {
  if (newValue.theme === 'dark') {
    footerColor.value = '#262323;'
  }
  else {
    footerColor.value = '#fff;'
  }
})
// 初始化默认主题
</script>

<template>
  <div class="layout">
    <div>
      <div class="relative z-[999]">
        <NavBar v-if="layoutMode[myPattern].navbar" />
      </div>
      <div class="flex">
        <Suspense>
          <Menu
            v-if="reloadKey !== 'menu' && layoutMode[myPattern].menu"
            class="z-[100]"
          />
        </Suspense>
        <div
          class="h-[calc(100vh-60px)] flex-1 bg-[#f5f6f7] text-[#ccc]"
          :style="{ width: isMenuCollapsed ? '100%' : 'calc(100% - 220px)' }"
        >
          <Tabs
            :key="tabsRefreshKey"
            v-model="currentTabName"
            with-close
            class="px-4"
            @click="onClick"
            @close="onClose"
          >
            <TabItem
              v-for="(history, idx) of tabsHistory"
              :key="history.link"
              :name="history.link"
            >
              <template #title>
                <Dropdown
                  trigger="hover"
                  :show-icon="false"
                  :show-timeout="300"
                  :hide-timeout="400"
                  lazy-show-popper
                  class="tab-action-dropdown"
                  :title="t(history.name)"
                  @item-click="onTabMenuClick($event, history)"
                >
                  <template #dropdown>
                    <DropdownMenu
                      :options="tabMenuList[idx]"
                      placement="bottom-start"
                      :popper-append-to-body="true"
                    />
                  </template>
                </Dropdown>
              </template>
            </TabItem>
          </Tabs>
          <PageLayout class="!h-[calc(100%-100px)]" style="padding: 0 24px;" />
          <Footer v-if="layoutMode[myPattern].footer" class="h-[60px]" />
        </div>
      </div>
    </div>
    <img v-if="!appStore.navbar" src="@/assets/images/global.png" class="global-setting" @click="switchSet">
    <TinyRobotChat />
  </div>
</template>

<style scoped lang="less">
.layout {
  width: 100%;
  height: 100%;
}

.global-setting {
  position: fixed;
  top: 280px;
  right: 0;
  z-index: 99;
  width: 30px;
  height: 30px;
}

:deep(.tiny-tabs__content) {
  margin: 0;
}

:deep(.tiny-tree-node__children > .tree-node-body) {
  padding-left: 50px;
}

:deep(.tiny-container__main > .tiny-layout > .tiny-tabs > .tiny-tabs__content) {
  display: none;
}

:deep(.tiny-tabs--top) {
  padding: 0 22px;
  background-color: #fff;
}

.tab-action-dropdown {
  max-width: 100%;
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}

:deep(.tiny-tree-menu .tiny-tree) {
  height: 100%;
  overflow: auto;
  border-right: 1px solid #dbdbdb;
}
</style>

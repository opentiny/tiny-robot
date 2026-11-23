<script lang="ts" setup>
import type { Component } from 'vue'
import type { ITreeNodeData } from '@/router/guard/menu'
import { TreeMenu as tinyTreeMenu } from '@opentiny/vue'
import * as icons from '@opentiny/vue-icon'
import { computed, defineComponent, h, onMounted, ref, unref, watch } from 'vue'
import BoardIcon from '@/assets/images/boardIcon.svg'
import ExceptionIcon from '@/assets/images/exceptionIcon.svg'
import FormIcon from '@/assets/images/formIcon.svg'
import ListIcon from '@/assets/images/listIcon.svg'
import ProfileIcon from '@/assets/images/profileIcon.svg'
import ResultIcon from '@/assets/images/resultIcon.svg'
import SystemIcon from '@/assets/images/systemIcon.svg'
import UserIcon from '@/assets/images/userIcon.svg'
import { useDeepClone } from '@/hooks/useDeepClone'
import router from '@/router'
import { useAppStore, useTabStore } from '@/store'
import { useMenuStore } from '@/store/modules/router'

type SideMenuData = (ITreeNodeData & { meta: { url: string } })[]

let routerTitle = [] as any
const appStore = useAppStore()

const localMenuIcons: Record<string, Component> = {
  IconApplication: BoardIcon,
  IconCueL: ExceptionIcon,
  IconFiletext: ProfileIcon,
  IconFiles: ListIcon,
  IconSetting: FormIcon,
  IconSuccessful: ResultIcon,
  IconTotal: SystemIcon,
  IconUser: UserIcon,
}

function createLocalMenuIcon(icon: Component, name: string) {
  return defineComponent({
    name,
    setup() {
      return () => h(icon, { class: 'menu-local-icon' })
    },
  })
}

const localMenuIconComponents = Object.fromEntries(
  Object.entries(localMenuIcons).map(([name, icon]) => [
    name,
    createLocalMenuIcon(icon, `${name}Local`),
  ]),
)

function resolveMenuIcon(name: string) {
  if (Object.prototype.hasOwnProperty.call(localMenuIconComponents, name)) {
    return localMenuIconComponents[name]
  }
  try {
    return icons[name]()
  }
  catch {
    return h('i', {
      class: `ci-${name} tiny-svg`,
      style: { marginRight: 'var(--tv-TreeMenu-prefix-icon-margin-right)' },
    })
  }
}

function filtter(treeNodeDatas: ITreeNodeData[]) {
  const menus: SideMenuData = []
  for (let i = 0; i < treeNodeDatas.length; i += 1) {
    const treeNodeData = treeNodeDatas[i]
    const url = treeNodeData.url!
    delete treeNodeData.url
    const temp = {} as any
    temp.label = treeNodeData.label
    temp.locale = treeNodeData.locale
    if (treeNodeData.customIcon) {
      temp.customIcon = resolveMenuIcon(treeNodeData.customIcon)
    }
    routerTitle.push(temp)
    menus.push({
      ...treeNodeData,
      meta: {
        url,
      },
      children: [...filtter(treeNodeData.children ?? [])],
    })
  }
  return menus
}

const menuStore = useMenuStore()
menuStore.getMenuList()
const rawMenuData = computed(() => useDeepClone(unref(menuStore.menuList)))

const MenuData = computed(() => {
  if (routerTitle.length) {
    routerTitle = []
  }
  return filtter(rawMenuData.value)
})

function currentChange(data: any, node) {
  if (!node.isLeaf) {
    return
  }
  router.replace({ name: data.label })
}

function collapseChange(value) {
  appStore.isMenuCollapsed = value
}

function findId(name: string, path: string) {
  const dfs = (item, url: string[]) => {
    if (url.join('/') === path) {
      return item.id
    }

    const len = item.children.length ?? 0

    for (let i = 0; i < len; i += 1) {
      if (item.children?.[i]) {
        const id = dfs(
          item.children[i],
          [...url, item.children[i].meta.url].filter(p => p.length),
        )
        if (id !== undefined) {
          return id
        }
      }
    }
    return undefined
  }

  for (let i = 0; i < MenuData.value.length; i += 1) {
    const menu = MenuData.value[i]
    const data = dfs(menu, [
      import.meta.env.VITE_CONTEXT.replace(/\/$/, ''),
      menu.meta.url.replace(/\/$/, ''),
    ])
    if (data !== undefined) {
      return data
    }
  }
  return -1
}

const tree = ref()
const expandeArr = ref<(string | number)[]>([])
const tabStore = useTabStore()

onMounted(() => {
  if (window.innerWidth <= 768) {
    const collapseBtn = document.querySelector('.tiny-tree-menu__toggle-button')
    collapseBtn?.dispatchEvent(new Event('click'))
  }
  watch(
    () => tabStore.current,
    () => {
      if (!tabStore.current) {
        return
      }
      const key = findId(tabStore.current.name, tabStore.current.link)
      tree.value.setCurrentKey(key)
      const { parentId = null } = tree.value.getCurrentNode() ?? {}
      if (parentId && !expandeArr.value.includes(parentId)) {
        expandeArr.value = expandeArr.value.concat(parentId)
      }
    },
    { deep: true, immediate: true },
  )
})
</script>

<template>
  <div class="menu-router">
    <tiny-tree-menu
      ref="tree"
      :data="MenuData"
      :show-filter="false"
      node-key="id"
      :default-expanded-keys="expandeArr"
      only-check-children
      check-strictly
      menu-collapsible
      class="h-[calc(100vh-60px)]"
      @current-change="currentChange"
      @collapse-change="collapseChange"
    >
      <template #default="slotScope">
        <template v-for="(item, index) in routerTitle" :key="index">
          <span v-if="slotScope.label === item.label" class="menu-title">
            <component :is="item.customIcon" />
            <span>{{ $t(item.locale) }}</span>
          </span>
        </template>
      </template>
    </tiny-tree-menu>
  </div>
</template>

<style lang="less">
.menu-router .menu-local-icon {
  width: 16px;
  height: 16px;
  margin-right: var(--tv-TreeMenu-prefix-icon-margin-right);
  vertical-align: middle;
  color: var(--tv-color-text-control);
}

.menu-router .tree-node-name:hover .menu-local-icon {
  color: var(--tv-color-border-hover);
}

.menu-router .tiny-tree-node.is-current > .tiny-tree-node__content .menu-local-icon {
  color: var(--tv-color-border-active);
}

.menu-router .tiny-tree-menu .tiny-tree .tiny-tree-node .tiny-tree-node__content .tree-node-name svg.menu-local-icon,
.menu-router .tiny-tree-menu .tiny-tree .tiny-tree-node .tiny-tree-node__content .tree-node-name:hover svg.menu-local-icon,
.menu-router .tiny-tree-menu .tiny-tree .tiny-tree-node.is-current > .tiny-tree-node__content svg.menu-local-icon {
  fill: none;
  background-color: transparent;
}

.menu-router .tiny-tree-menu .tiny-tree .tiny-tree-node .tiny-tree-node__content .tree-node-name svg.menu-local-icon > rect,
.menu-router .tiny-tree-menu .tiny-tree .tiny-tree-node .tiny-tree-node__content .tree-node-name:hover svg.menu-local-icon > rect,
.menu-router .tiny-tree-menu .tiny-tree .tiny-tree-node.is-current > .tiny-tree-node__content svg.menu-local-icon > rect {
  fill: none;
  stroke: none;
}

.menu-router .menu-local-icon path[stroke] {
  stroke: currentColor;
}

.menu-router .menu-local-icon path[fill]:not([fill='none']) {
  fill: currentColor;
}

.menu-router .tiny-tree-menu .tiny-tree .tiny-tree-node .tiny-tree-node__content .tree-node-name svg {
  margin-right: 16px;
}

.menu-router .tiny-tree-menu .tiny-tree .tiny-tree-node .tiny-tree-node__children .tiny-tree-node__content {
  margin-left: 16px;
}

.menu-router .tiny-tree-menu {
  padding-left: 6px;
  width: 276px;
  overflow-y: auto;

  &.is-collapsed {
    width: 0;
  }

  &::before {
    display: none;
  }

  .tiny-tree {
    padding-bottom: 30px;

    .tiny-tree-node__wrapper {
      padding-right: 10px;
    }

    .tiny-tree-node {
      &.is-current > .tiny-tree-node__content,
      .tiny-tree-node__content:hover {
        border-radius: 20px;
      }

      .tiny-tree-node__content {
        height: 40px;
        line-height: 40px;

        .tiny-tree-node__content-left {
          padding-left: 16px;
        }

        &::before {
          display: none;
        }
      }
    }

    .node-float-tip {
      border-radius: 0;
      margin-right: 8px;
    }
  }

  .tiny-tree-menu__toggle-button {
    transform: translateX(100%) translateY(-50%);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;

    .tiny-svg {
      margin-left: 0;
    }
  }

  .tiny-input {
    margin: 0 10px 16px;
    width: auto;
    max-width: unset;
  }

  .tiny-tree-node__content-box {
    min-width: 0;
  }

  .tiny-tree-node__content {
    position: relative;
  }

  .absolute-tag {
    position: absolute;
    right: 8px;
    top: 13px;
  }

  .tiny-tree {
    height: calc(100% - var(--layout-tree-menu-input-height));
    overflow-y: auto;
  }

  .tree-node-name {
    line-height: 1.5;

    .node-name-container {
      color: var(--tv-color-text-control);
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 6px;

      .node-name-label {
        flex-grow: 0;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      svg.menu-type-icon {
        width: 12px;
        height: 12px;
        display: inline-block;
        fill: var(--tv-color-icon-control, #5f6774);
      }
    }
  }

  & > .tiny-input .tiny-input__inner {
    height: var(--layout-tree-menu-input-height);
    font-size: 14px;
  }

  .tiny-tree-node__content {
    margin-top: 8px;
  }
}
</style>

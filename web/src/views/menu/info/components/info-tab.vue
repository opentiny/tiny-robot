<script lang="ts" setup>
import type { ComponentInstance } from 'vue'
import type { Node } from './menu-tree.vue'
import type { ITreeNodeData } from '@/router/guard/menu'
import {
  Loading,
  Button as TinyButton,
  Modal as TinyModal,
} from '@opentiny/vue'
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getAllLocalItems } from '@/api/local'
import { createMenu, deleteMenu, getAllMenu, updateMenu } from '@/api/menu'
import useLoading from '@/hooks/loading'
import { useResponsiveSize } from '@/hooks/responsive'
import { useDeepClone } from '@/hooks/useDeepClone'
import { useI18nMenu } from '@/hooks/useI18nMenu'
import { flushRouter } from '@/router/guard/menu'
import { useTabStore } from '@/store'
import { useMenuStore } from '@/store/modules/router'
import { sleep } from '@/utils/base-utils'
import { getIdByLabel } from '@/utils/tree'
import AddMenu from './add-menu.vue'
import menuTree from './menu-tree.vue'
import UpdateForm from './update-form.vue'

const { modalSize } = useResponsiveSize()

const { t, te } = useI18n()
const vLoading = Loading.directive
const rawMenuData = ref<ITreeNodeData[]>([])
const localeData = ref<{ value: string, label: string }[]>([])
const i18nMenuData = computed(() => useI18nMenu(rawMenuData.value, t))

const readonly = ref(false)
const updateModal = ref(false)
const DEFAULT_NODE = {
  id: '',
  label: '',
  url: '',
  component: '',
  customIcon: '',
  menuType: '',
  parentId: 0,
  order: 0,
  locale: '',
}
const activeNode = ref<ITreeNodeData>()
const form = ref<ComponentInstance<typeof UpdateForm>>()
const addMenu = ref<ComponentInstance<typeof AddMenu>>()
const { loading, setLoading } = useLoading(false)
const { loading: treeLoading, setLoading: setTreeLoading } = useLoading(true)
const { loading: addLoading, setLoading: setAddLoading } = useLoading()
const addModal = ref(false)
const router = useRouter()
const tabStore = useTabStore()

function handleAddMenu() {
  addModal.value = true
}
function onAddMenuClose() {
  addModal.value = false
}
async function onClickAdd() {
  await addMenu.value.valid()
  setAddLoading(true)
  try {
    const menuInfo = addMenu.value.getMenuInfo()
    await createMenu(menuInfo)
    TinyModal.message({
      message: t('menuInfo.modal.add.success'),
      status: 'success',
    })
    addModal.value = false
    await updateUserMenu()
    await fetchMenu()
  }
  catch (error: any) {
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.message || '未知错误'
      TinyModal.message({
        message: errorMessage,
        status: 'error',
      })
    }
  }
  finally {
    setAddLoading(false)
  }
}
function onClose() {
  activeNode.value = DEFAULT_NODE
}
function onUpdate(data: Node) {
  updateModal.value = true
  activeNode.value = data
  readonly.value = false
}
function onCheck(data: Node) {
  activeNode.value = data
  updateModal.value = true
  readonly.value = true
}
function onCancel() {
  activeNode.value = DEFAULT_NODE
  updateModal.value = false
}
function flushTabs() {
  const routePaths = router.getRoutes().map(routeItem => routeItem.path)
  const removeTabs = tabStore.data.filter(
    ({ link }) => !routePaths.includes(link),
  )
  removeTabs.forEach(({ link }) => tabStore.delByLink(link))
  if (!tabStore.data.includes(tabStore.current)) {
    tabStore.$patch({
      current: tabStore.data[0],
    })
  }
}
function onDelete(data: Node) {
  setTreeLoading(true)
  const node = useDeepClone(data)
  if (node.parentId === null) {
    node.parentId = -1
  }

  deleteMenu(Number(node.id.toString()), node.parentId)
    .then(() => {
      TinyModal.message({
        message: '删除成功',
        status: 'success',
      })
      return fetchMenu()
    })
    .then(() => {
      return updateUserMenu()
    })
    .then(() => {
      flushTabs()
    })
    .catch((reason) => {
      const error = reason
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || '未知错误'
        TinyModal.message({
          message: errorMessage,
          status: 'error',
        })
      }
    })
    .finally(() => {
      setTreeLoading(false)
    })
}
function onConfirm() {
  setLoading(true)
  form.value
    .valid()
    .then(() => {
      const menuInfo = form.value.getMenuInfo()
      activeNode.value = {
        ...DEFAULT_NODE,
      }
      if (menuInfo.id === menuInfo.parentId) {
        TinyModal.message({
          message: t('menuInfo.modal.message.error'),
          status: 'error',
        })
        return
      }
      updateMenu({
        ...menuInfo,
        path: menuInfo.url,
        url: undefined,
        name: menuInfo.oldLabel,
      })
        .then(() => {
          TinyModal.message({
            message: t('menuInfo.modal.edit.success'),
            status: 'success',
          })
          setTimeout(() => {
            router.go(0)
          }, 200)
          setTreeLoading(true)
          return fetchMenu()
        })
        .then(() => updateUserMenu())
        .catch((error) => {
          if (error.response && error.response.data) {
            const errorMessage = error.response.data.message || '未知错误'
            TinyModal.message({
              message: errorMessage,
              status: 'error',
            })
          }
        })
        .finally(() => {
          setLoading(false)
          setTreeLoading(false)
        })
      updateModal.value = false
    })
    .catch(() => {})
    .finally(() => {
      setLoading(false)
    })
}
async function fetchMenu() {
  const { data } = await getAllMenu()
  rawMenuData.value = data
}
const menuStore = useMenuStore()
const { reloadMenu } = inject<{ reloadMenu: () => void }>('RELOAD')
async function updateUserMenu() {
  await flushRouter(router)
  reloadMenu()
  return menuStore.getMenuList()
}
function fetchLocalItems() {
  getAllLocalItems(1, 0, 1).then(({ data }) => {
    localeData.value = data.items.map((item) => {
      return {
        value: item.key,
        label: te(item.key) ? t(item.key) : item.key,
      }
    })
  })
}

const { locale } = useI18n()
watch(locale, () => {
  fetchLocalItems()
})

const toolAbortController = new AbortController()

onMounted(async () => {
  Promise.all([fetchMenu(), fetchLocalItems()]).finally(() => {
    treeLoading.value = false
  })
  document.modelContext.registerTool({
    name: 'add-menu',
    title: '添加菜单',
    description: '添加菜单',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '名称' },
        order: { type: 'number', description: '优先级，默认 0' },
        parentMenu: { type: 'string', description: '父菜单' },
        icon: { type: 'string', description: '图标' },
        component: { type: 'string', description: '组件' },
        path: { type: 'string', description: '路径' },
        locale: { type: 'string', description: '国际化' },
      },
      required: ['name', 'component', 'path', 'locale'],
    },
    execute: async ({
      name,
      order,
      parentMenu,
      icon,
      component,
      path,
      locale: menuLocale,
    }) => {
      handleAddMenu()
      await sleep(1000)
      const parentId = getIdByLabel(i18nMenuData.value, parentMenu)
      addMenu.value.setMenuInfo({
        name,
        order: order ?? 0,
        parentId,
        icon,
        component,
        menuType: '/',
        path,
        locale: menuLocale,
      })
      await sleep(1000)
      await onClickAdd()
      return { content: [{ type: 'text', text: `收到: ${name}` }] }
    },
  }, { signal: toolAbortController.signal })
})

onUnmounted(() => {
  toolAbortController.abort()
})
</script>

<template>
  <div class="tiny-fullscreen-scroll">
    <div class="tiny-fullscreen-wrapper">
      <div class="menu-add-btn">
        <TinyButton
          v-permission="'menu::add'"
          type="primary"
          @click="handleAddMenu"
        >
          {{ $t('menuInfo.modal.title.add') }}
        </TinyButton>
      </div>
      <menu-tree
        v-loading="treeLoading"
        :data="i18nMenuData"
        :locale-data="localeData"
        @update="onUpdate"
        @check="onCheck"
        @delete="onDelete"
      />
      <TinyModal
        v-model="addModal"
        show-footer
        resize
        :width="modalSize"
        height="auto"
        :title="$t('menuInfo.modal.title.add')"
        @close="onAddMenuClose"
      >
        <AddMenu
          v-if="addModal"
          ref="addMenu"
          :menus="i18nMenuData"
          :locales="localeData"
        />
        <template #footer>
          <TinyButton round @click="onAddMenuClose">
            {{ $t('menu.btn.cancel') }}
          </TinyButton>
          <TinyButton
            type="primary"
            round
            :loading="addLoading"
            @click="onClickAdd"
          >
            {{ $t('menu.btn.confirm') }}
          </TinyButton>
        </template>
      </TinyModal>
      <TinyModal
        v-if="!readonly"
        v-model="updateModal"
        show-footer
        :mask-closable="true"
        :width="modalSize"
        height="auto"
        resize
        :title="$t('menuInfo.modal.title.update')"
        @close="onClose"
      >
        <UpdateForm
          v-if="updateModal"
          ref="form"
          :node="activeNode"
          :menus="i18nMenuData"
          :locale-data="localeData"
          :readonly="readonly"
        />

        <template #footer>
          <TinyButton
            v-if="!readonly"
            type="primary"
            :loading="loading"
            @click="onConfirm"
          >
            {{ $t('menu.btn.confirm') }}
          </TinyButton>
          <TinyButton v-if="!readonly" @click="onCancel">
            {{ $t('menu.btn.cancel') }}
          </TinyButton>
        </template>
      </TinyModal>
      <TinyModal
        v-if="readonly"
        v-model="updateModal"
        show-footer
        :mask-closable="true"
        resize
        :title="$t('menuInfo.modal.title.info')"
        @close="onClose"
      >
        <UpdateForm
          v-if="updateModal"
          ref="form"
          :node="activeNode"
          :menus="i18nMenuData"
          :locale-data="localeData"
          :readonly="readonly"
        />
      </TinyModal>
    </div>
  </div>
</template>

<style scoped lang="less">
#contain {
  height: 100%;
  padding: 15px;
  overflow: hidden;
}

.menu-add-btn {
  padding: 0px 0 24px 0;
}

.table {
  padding-bottom: 20px;
  background-color: #fff;
}

.operation {
  &-delete {
    padding-right: 10px;
    color: red;
  }

  &-update {
    padding-right: 5px;
    color: #1890ff;
  }

  &-info {
    padding-right: 10px;
    color: orange;
  }
}
</style>

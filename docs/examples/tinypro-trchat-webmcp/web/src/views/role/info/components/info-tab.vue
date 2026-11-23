<script lang="ts" setup>
import type { RoleAddData } from './add-role.vue'
import type { Permission } from '@/api/permission'
import type { ITreeNodeData } from '@/router/guard/menu'
import type { FilterType, InputFilterValue, Pager } from '@/types/global'
import {
  Modal,
  Button as TinyButton,
  Loading as TinyLoading,
  TinyModal,
  Pager as TinyPager,
} from '@opentiny/vue'
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getAllMenu } from '@/api/menu'
import { getAllPermission } from '@/api/permission'
import { createRole, getAllRoleDetail, updateRole } from '@/api/role'
import useLoading from '@/hooks/loading'
import { useResponsive } from '@/hooks/responsive'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useI18nMenu } from '@/hooks/useI18nMenu'
import { useMenuId } from '@/hooks/useMenuId'
import constant from '@/router/constant'
import { registerHiddenSubRoutes, toRoutes } from '@/router/guard/menu'
import { useTabStore } from '@/store'
import { useMenuStore } from '@/store/modules/router'
import { sleep } from '@/utils/base-utils'
import { getIdByLabel } from '@/utils/tree'
import addRole from './add-role.vue'
import menuDrawer from './menu-drawer.vue'
import roleTable from './role-table.vue'

const { sm } = useResponsive()
const { t } = useI18n()
const tableData = ref<any[]>([])
const menus = ref<ITreeNodeData[]>([])
const { open, onOpen, onClose } = useDisclosure()
const { open: addModalVisible, onOpen: onAdd, onClose: onAddHide } = useDisclosure()
const { loading, setLoading } = useLoading()
const i18MenuDatas = computed(() => useI18nMenu(menus.value, t))
const selectedId = ref<number[]>([])
const router = useRouter()
const menuStore = useMenuStore()
const tabStore = useTabStore()
const roleId = ref(-1)
const permissions = ref<Permission[]>([])
const vLoading = TinyLoading.directive

const { reloadMenu } = inject<{ reloadMenu: () => void }>('RELOAD')

setLoading(true)
getAllMenu()
  .then((res) => {
    menus.value = res.data
  })
  .finally(() => {
    setLoading(false)
  })
getAllPermission().then(({ data }) => {
  permissions.value = data
})
const pagerConfigSm = {
  component: TinyPager,
  attrs: { currentPage: 1, pageSize: 10, pageSizes: [10, 20, 50, 100], total: 10, layout: 'total, prev, pager, next' },
}
const pagerConfigLg = {
  component: TinyPager,
  attrs: { currentPage: 1, pageSize: 10, pageSizes: [10, 20, 50, 100], total: 10, layout: 'sizes, total, prev, pager, next, jumper' },
}
const roleTableRef = ref()
const menuDrawerRef = ref()
const addRoleFormRef = ref()
const allFilter = {
  inputFilter: {
    inputFilter: true,
  },
}
const fetchOption = {
  filter: true,
  api: ({ page, filters }: { page: Pager, filters: FilterType }) => {
    let str = ''
    if (filters.name) {
      const condition = (filters.name.value as InputFilterValue).relation
      if (condition === 'contains') {
        str += '%'
      }
      str += (filters.name.value as InputFilterValue).text
      if (condition === 'startwith' || condition === 'contains') {
        str += '%'
      }
    }
    return new Promise((resolve) => {
      getAllRoleDetail(page.currentPage, page.pageSize, str).then(
        ({ data }) => {
          tableData.value = data.roleInfo.items
          data.roleInfo.items.forEach((item, index) => {
            tableData.value[index].permissionIds = []
            item.permission.forEach((item1) => {
              tableData.value[index].permissionIds.push(item1.id)
            })
          })
          resolve({
            result: data.roleInfo.items,
            page: {
              total: data.roleInfo.meta.totalItems,
            },
          })
        },
      )
    })
  },
}
function onMenuDrawerClose() {
  onClose()
}
function onMenuUpdate(menuTree: ITreeNodeData[], id: number, row) {
  roleId.value = id
  selectedId.value = useMenuId(row.menus)
  onOpen()
}
async function flushRouter() {
  router.clearRoutes()
  constant.forEach(staticRoute => router.addRoute(staticRoute))
  await menuStore.getMenuList()
  const routes = toRoutes(menuStore.menuList)
  routes.forEach((route) => {
    router.addRoute('root', route)
  })
  registerHiddenSubRoutes(router)
}
function flushTabs() {
  const routePaths = router.getRoutes().map(routeItem => routeItem.path)
  const removeTabs = tabStore.data.filter(
    ({ link }) => !routePaths.includes(link),
  )
  removeTabs.forEach(({ link }) => tabStore.delByLink(link))
}
async function onConfirm(ids: number[]) {
  try {
    const { data } = await updateRole({
      id: roleId.value,
      menuIds: ids,
    })
    selectedId.value = ids
    const itemIdx = tableData.value.findIndex(
      item => item.id === roleId.value,
    )
    tableData.value.splice(itemIdx, 1, {
      ...tableData.value[itemIdx],
      menus: data.menus,
    })
    await flushRouter()
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
    roleTableRef.value.reload()
    flushTabs()
    reloadMenu()
    open.value = false
  }
}
function onAddRole(role: RoleAddData) {
  createRole(role)
    .then(({ data }) => {
      Modal.message({
        message: t('roleInfo.modal.add.success'),
        status: 'success',
      })
      tableData.value.push({
        id: data.id,
        permission: data.permission,
        menus: [],
        name: data.name,
      })
      roleTableRef.value.reload()
    })
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
      onAddHide()
    })
}
function onRoleUpdateSuccess() {
  roleTableRef.value.reload()
}
function onRoleDelete() {
  roleTableRef.value.reload()
}

const toolAbortController = new AbortController()

onMounted(async () => {
  document.modelContext.registerTool({
    name: 'add-role',
    title: '添加角色',
    description: '添加角色，不需要生成角色卡片',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '角色名称' },
        permissions: { type: 'array', items: { type: 'number' }, description: '角色拥有的权限' },
      },
      required: ['name', 'permissions'],
    },
    execute: async ({ name, permissions }) => {
      await onAdd()
      await sleep(1000)
      await addRoleFormRef.value.setRoleInfo({
        name,
        permissionIds: permissions,
      })
      await sleep(1000)
      await addRoleFormRef.value.onConfirm()
      return { content: [{ type: 'text', text: `收到: ${name}` }] }
    },
  }, { signal: toolAbortController.signal })

  document.modelContext.registerTool({
    name: 'bind-menu-for-role',
    title: '绑定菜单',
    description: '给某个角色绑定菜单',
    inputSchema: {
      type: 'object',
      properties: {
        role: { type: 'string', description: '需要绑定菜单的角色名称' },
        menu: { type: 'string', description: '需要绑定的菜单名称' },
      },
      required: ['role', 'menu'],
    },
    execute: async ({ role, menu }) => {
      const { data } = await getAllRoleDetail()
      const rowData = data.roleInfo.items.find(item => item.name === role)
      if (!rowData) {
        return { content: [{ type: 'text', text: `角色未找到: ${role}` }] }
      }
      await roleTableRef.value.openMenuModal(rowData.menus, rowData.id, rowData)
      await sleep(1000)

      // 先从菜单名称获取菜单 ID，再勾选菜单
      const menuId = getIdByLabel(i18MenuDatas.value, menu)
      await menuDrawerRef.value.treeRef.setChecked(menuId, true, false)
      await sleep(1000)

      await menuDrawerRef.value.onConfirm()
      return { content: [{ type: 'text', text: `收到: ${role}` }] }
    },
  }, { signal: toolAbortController.signal })
})

onUnmounted(() => {
  toolAbortController.abort()
})
</script>

<template>
  <div>
    <div class="tiny-fullscreen-scroll">
      <div class="tiny-full-screen-wrapper">
        <div class="role-add-btn">
          <TinyButton v-permission="'role::add'" type="primary" round @click="onAdd">
            {{ $t('roleInfo.modal.title.add') }}
          </TinyButton>
        </div>
        <div class="table">
          <role-table
            :key="sm ? 'sm' : 'lg'"
            ref="roleTableRef"
            :table-data="tableData"
            :fetch-option="fetchOption"
            :pager-config="sm ? pagerConfigSm : pagerConfigLg"
            :permissions="permissions"
            :filter="allFilter"
            @menu-update="onMenuUpdate"
            @update-role-close="onRoleUpdateSuccess"
            @role-delete="onRoleDelete"
          />
        </div>
      </div>
    </div>
    <menu-drawer
      v-if="open"
      ref="menuDrawerRef"
      v-loading="loading"
      :visible="open"
      :menus="i18MenuDatas"
      :selected-id="selectedId"
      @close="onMenuDrawerClose"
      @confirm="onConfirm"
    />
    <add-role
      ref="addRoleFormRef"
      :visible="addModalVisible"
      :permissions="permissions"
      @hide="onAddHide"
      @confirm="onAddRole"
      @cancel="onAddHide"
    />
  </div>
</template>

<style scoped lang="less">
#contain {
  height: 100%;
  padding: 16px;
  overflow: hidden;
}

.role-add-btn {
  padding: 0 0 24px 0;
}

.table {
  padding-bottom: 20px;
  background-color: #fff;
}
</style>

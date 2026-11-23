import { defineStore } from 'pinia'
import { getRoleMenu } from '@/api/menu'
import useUserStore from './user'

// 富文本栏目开关：VITE_TINY_EDITOR_ENABLED=false 时隐藏「表单页 -> 富文本」菜单
const EDITOR_MENU_LOCALE = 'menu.form.editor'

function filterDisabledMenus(menus: any[]): any[] {
  if (import.meta.env.VITE_TINY_EDITOR_ENABLED === 'true') {
    return menus
  }
  return menus
    .filter(menu => menu.locale !== EDITOR_MENU_LOCALE)
    .map(menu => ({ ...menu, children: filterDisabledMenus(menu.children ?? []) }))
}

export const useMenuStore = defineStore('menu', {
  state() {
    return {
      menuList: [] as any[],
      flatMenuList: [] as any[],
    }
  },
  actions: {
    async getMenuList() {
      const userStore = useUserStore()
      if (!userStore.email) {
        return []
      }
      const { data } = await getRoleMenu(userStore.email)
      this.menuList = filterDisabledMenus(data)
      this.menuListFlat()
      return this.menuList
    },
    menuListFlat() {
      this.flatMenuList = []
      const dfs = (item: any) => {
        this.flatMenuList.push(item)
        const children = item.children ?? []
        for (let i = 0; i < children.length; i += 1) {
          dfs(children[i])
        }
      }
      for (let i = 0; i < this.menuList.length; i += 1) {
        dfs(this.menuList[i])
      }
    },
  },
})

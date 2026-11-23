import type { ITreeNodeData } from '@/router/guard/menu'
import { useDeepClone } from './useDeepClone'

export function useI18nMenu(data: ITreeNodeData[], t: (key: string) => string) {
  const menus: ITreeNodeData[] = useDeepClone(data)
  const dfs = (menu: ITreeNodeData) => {
    menu.oldLabel = menu.label
    menu.label = t(menu.locale).toString()
    const children = menu.children ?? []
    for (let i = 0; i < children.length; i += 1) {
      const item = children[i]
      dfs(item)
    }
  }
  for (let i = 0; i < menus.length; i += 1) {
    const menu = menus[i]
    dfs(menu)
  }
  return menus
}

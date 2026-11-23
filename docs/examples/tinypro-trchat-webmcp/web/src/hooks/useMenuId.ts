import type { ITreeNodeData } from '@/router/guard/menu'

export function useMenuId(datas: ITreeNodeData[]) {
  const ids: any[] = []
  const dfs = (menu: ITreeNodeData) => {
    ids.push(menu.id)
    for (let i = 0; i < menu.children?.length; i += 1) {
      const child = menu.children[i]
      dfs(child)
    }
  }
  for (let i = 0; i < datas.length; i += 1) {
    const data = datas[i]
    dfs(data)
  }
  return ids
}

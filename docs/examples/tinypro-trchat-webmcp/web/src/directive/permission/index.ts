import { useUserStore } from '@/store'

async function checkPermission(el: HTMLElement, binding: { value: string }) {
  const { value } = binding
  // // 获取role的permission
  const userStore = useUserStore()
  const { rolePermission } = userStore
  const permissionList: string[] = rolePermission
  const hasPermission
    = permissionList.includes(value) || permissionList.includes('*')
  if (!hasPermission) {
    el.remove()
  }
}

export default {
  mounted(el: HTMLElement, binding: any) {
    checkPermission(el, binding)
  },
  updated(el: HTMLElement, binding: any) {
    checkPermission(el, binding)
  },
}

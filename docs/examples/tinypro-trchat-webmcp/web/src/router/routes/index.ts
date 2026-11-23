import type { RouteRecordRaw } from 'vue-router'

const modules = BUILD_TOOLS === 'WEBPACK'
  ? import.meta.webpackContext('./modules', { recursive: false, regExp: /\.ts$/, mode: 'sync' })
  : import.meta.glob('./modules/*.ts', { eager: true })
const appRoutes: RouteRecordRaw[] = []

Object.keys(modules).forEach((key) => {
  const defaultModule = modules[key].default
  if (!defaultModule)
    return
  const moduleList = Array.isArray(defaultModule)
    ? [...defaultModule]
    : [defaultModule]
  appRoutes.push(...moduleList)
})

export default appRoutes

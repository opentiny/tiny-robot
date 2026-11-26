import type { Router } from 'vue-router'
import setupInfoGuard from './info'
import { setupMenuGuard } from './menu'
import setupPermissionGuard from './permission'
import { setupTabsGuard } from './tabs'

function setupPageGuard(router: Router) {
  setupPermissionGuard(router)
  setupInfoGuard(router)
  setupMenuGuard(router)
  setupTabsGuard(router)
}

export default function createRouteGuard(router: Router) {
  setupPageGuard(router)
  // if(import.meta.env.VITE_USE_MOCK) setupPermissionGuard(router);
}

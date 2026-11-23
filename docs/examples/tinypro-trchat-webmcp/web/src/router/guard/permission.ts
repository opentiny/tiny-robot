import type { Router } from 'vue-router'
import { Modal } from '@opentiny/vue'
import { t } from '@opentiny/vue-locale'
import NProgress from 'nprogress' // progress bar
import { nextTick } from 'vue'
import { unauthorizedLoginLocation } from '@/utils/app-location'
import { isLogin } from '@/utils/auth'

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to) => {
    NProgress.start()
    if (!isLogin()) {
      if (to.name === 'login') {
        NProgress.done()
        return
      }
      await nextTick()
      Modal.message({
        message: t('http.error.TokenExpire'),
        status: 'error',
      })
      await nextTick()
      NProgress.done()
      return unauthorizedLoginLocation(to)
    }
    NProgress.done()
  })
}

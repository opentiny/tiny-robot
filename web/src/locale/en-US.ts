import { enUS } from '@opentiny/vue-search-box'
import localeLogin from '@/views/login/locale/en-US'
import localeHttpError from './en-US/httpError'

export default {
  ...localeLogin,
  ...localeHttpError,
  ...enUS,
  'router.not-exists-valid-route':
    'Route encountered an exception, please contact the administrator',
}

import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { Modal } from '@opentiny/vue'
import locale from '@opentiny/vue-locale'
import axios from 'axios'
import router from '@/router'
import { clearToken, getToken } from '@/utils/auth'

export interface HttpResponse<T = unknown> {
  errMsg: string
  code: string | number
  data: T
}

interface MockRequestConfig extends AxiosRequestConfig {
  isMockApi?: boolean
}

const { VITE_API_BASE_URL, VITE_BASE_API, VITE_MOCK_IGNORE, VITE_MOCK_SERVER_HOST } = import.meta
  .env || { VITE_BASE_API: '', VITE_MOCK_IGNORE: '' }

// 演示接口的标记前缀取自 VITE_MOCK_SERVER_HOST（默认 /mock），而非硬编码 /mock：
// 配置成其他前缀（如 /demo-mock）时这里会同步识别
const mockServerHost = (VITE_MOCK_SERVER_HOST || '/mock').replace(/\/$/, '')
const MOCK_API_PREFIX = `${mockServerHost}/api`

if (VITE_API_BASE_URL) {
  axios.defaults.baseURL = VITE_API_BASE_URL
}

const ignoreMockApiList = VITE_MOCK_IGNORE?.split(',') || []
axios.interceptors.request.use(
  (config: MockRequestConfig): any => {
    const isProxy = ignoreMockApiList.includes(config.url)
    if (isProxy) {
      config.url = config.url?.replace(VITE_BASE_API, '/api/v1')
    }

    // 统一将演示接口前缀（${VITE_MOCK_SERVER_HOST}/api）改写为 /api 发出，
    // mock 路由由后端或 dev proxy 按 /api 提供；
    // 同时打上标记，供响应拦截器识别 mock 响应，不再依赖 URL 中的 /mock
    if (config.url?.includes(MOCK_API_PREFIX)) {
      config.url = config.url.replace(MOCK_API_PREFIX, '/api')
      config.isMockApi = true
    }

    const token = getToken()
    if (token) {
      if (!config.headers) {
        config.headers = {}
      }
      config.headers.Authorization = `Bearer ${token}`
    }

    config.headers = { ...config.headers }
    config.headers['x-lang'] = localStorage.getItem('tiny-locale') ?? 'zhCN'

    return config
  },
  (error) => {
    // do something
    return Promise.reject(error)
  },
)
// add response interceptors
axios.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const res = response
    const requestConfig = res.config as MockRequestConfig | undefined
    // editor 接口需要完整的 Axios 响应信封（api/editor.ts 按 res.data 取值），
    // 即便响应 URL 里带有 mock 字样（如经 mock 服务转发）也不做解包
    const isEditorRequest = typeof res.config?.url === 'string' && res.config.url.includes('/editor/')
    const responseBody = res.data as unknown as { code?: number, data?: unknown }
    const isRealResponse = !requestConfig?.isMockApi && !res.request.responseURL.includes('mock')
    if (isRealResponse && res.config?.url?.includes('/i18/format') && responseBody?.code === 200) {
      res.data = Object.fromEntries(
        Object.entries(responseBody).filter(([key]) => key !== 'code'),
      ) as any
    }
    else if (
      isRealResponse
      && responseBody?.code === 200
      && Array.isArray(responseBody.data)
      && Object.keys(responseBody).every(key => ['data', 'errMsg', 'code'].includes(key))
    ) {
      res.data = responseBody.data as any
    }
    else if (isEditorRequest && responseBody?.code === 200 && 'data' in responseBody) {
      res.data = responseBody.data as any
    }
    if (!isEditorRequest && (requestConfig?.isMockApi || res.request.responseURL.includes('mock'))) {
      return res.data
    }
    return res
  },
  (error) => {
    if (!error.response) {
      return Promise.reject(error)
    }
    const { status, data } = error.response
    if (status === 403 && error.config.method.toLowerCase() === 'get') {
      Modal.message({
        message: data.message,
        status: 'error',
      })
    }
    if (status === 401) {
      Modal.message({
        message: locale.t('http.error.TokenExpire'),
        status: 'error',
      })
      clearToken()
      router.replace({ name: 'login' })
    }
    if (status === 400) {
      data.message = error.response.data.errors?.[0] ?? data.message
    }

    return Promise.reject(error)
  },
)

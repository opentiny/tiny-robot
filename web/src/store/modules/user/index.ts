import type { UserInfo, UserState } from './types'
import type {
  LoginData,
  LoginDataMail,
} from '@/api/user'
import { defineStore } from 'pinia'
import { getRoleInfo } from '@/api/role'
import {
  flushToken,
  getUserInfo,
  updateUserInfo,
  login as userLogin,
  loginMail as userLoginMail,
  logout as userLogout,
} from '@/api/user'
import { clearToken, getRefreshToken, getToken, setRefreshToken, setToken } from '@/utils/auth'
import { removeRouteListener } from '@/utils/route-listener'

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: '10000',
    name: 'admin',
    email: 'admin@no-reply.com',
    department: 'Tiny-Vue-Pro',
    employeeType: 'social recruitment',
    job: 'Front end',
    probationStart: '2021-04-19',
    probationEnd: '2021-10-15',
    probationDuration: '180',
    protocolStart: '2021-04-19',
    protocolEnd: '2024-04-19',
    address: '',
    status: '',
    role: [],
    sort: 1,
    startTime: '',
    endTime: '',
    filterStatus: [],
    filterType: [],
    submit: false,
    reset: false,
    roleId: 0,
    rolePermission: [],
    refreshToken: getRefreshToken(),
    accessToken: getToken(),
  }),

  getters: {
    userInfo(state: UserState): UserState {
      return state
    },
  },

  actions: {
    switchRoles() {
      return new Promise((resolve) => {
        this.role = this.role === 'user' ? 'admin' : 'user'
        resolve(this.role)
      })
    },
    // Set user's information
    setInfo(partial: Partial<UserState>) {
      this.$patch(partial)
    },

    // Reset user's information
    resetInfo() {
      this.$reset()
    },
    flushToken() {
      const refreshToken = this.refreshToken as string
      flushToken({ token: refreshToken })
        .then((tokenPair) => {
          return tokenPair.data
        })
        .then((data) => {
          this.refreshToken = data.refreshToken
          this.accessToken = data.accessToken
          setRefreshToken(data.refreshToken)
          setToken(data.accessToken)
        })
    },

    // Reset filter information
    resetFilterInfo() {
      this.startTime = ''
      this.endTime = ''
      this.filterStatus = []
      this.filterType = []
    },

    async updateInfo(data: Partial<UserInfo>) {
      const res = await updateUserInfo(data)
      this.setInfo(res.data)
    },

    // Login
    async login(loginForm: LoginData) {
      // 仅前端项目（VITE_MOCK_LOGIN_ENABLED=true）：不请求后端接口，模拟登录成功
      if (import.meta.env.VITE_MOCK_LOGIN_ENABLED === 'true') {
        // 刻意使用 mock-local-access-token 前缀：服务端 mock 登录签发的是
        // mock-access-token，登出后会被吊销；本地签发的 token 只在前端 mock 模式使用
        const accessToken = `mock-local-access-token:${loginForm.email}`
        const refreshToken = `mock-local-refresh-token:${loginForm.email}`
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        setToken(accessToken)
        setRefreshToken(refreshToken)
        // 权限指令支持 '*' 通配，授予全部权限；mock 模式无后端用户档案，
        // 账号名取登录邮箱，保证多人协同等场景能区分不同登录者
        this.setInfo({
          name: loginForm.email,
          role: 'admin',
          roleId: 1,
          rolePermission: ['*'],
        } as Partial<UserState>)
        return
      }

      try {
        const res = await userLogin(loginForm)
        const { accessToken, refreshToken } = res.data
        this.refreshToken = refreshToken
        this.accessToken = accessToken
        setToken(accessToken)
        setRefreshToken(refreshToken)
        const userRes = await getUserInfo(loginForm.email)
        const userInfo = {
          id: userRes.data.id,
          name: userRes.data.name,
          email: userRes.data.email,
          role: '',
          department: userRes.data.department,
          employeeType: userRes.data.employeeType,
          job: '',
          probationStart: userRes.data.probationStart,
          probationEnd: userRes.data.probationEnd,
          probationDuration: userRes.data.probationDuration,
          protocolStart: userRes.data.protocolStart,
          protocolEnd: userRes.data.protocolEnd,
          address: userRes.data.address,
          status: userRes.data.status,
          roleId: 0,
          rolePermission: [],
        }
        if (userRes.data.role) {
          userInfo.role = userRes.data.role[0].name
          userInfo.job = userRes.data.role[0].name
          userInfo.roleId = userRes.data.role[0].id
        }
        const { data } = await getRoleInfo(userInfo.roleId)
        const permissions = data.permission
        for (let i = 0; i < permissions.length; i += 1) {
          userInfo.rolePermission.push(permissions[i].name)
        }
        this.setInfo(userInfo)
      }
      catch (err) {
        clearToken()
        throw err
      }
    },

    async loginMail(loginForm: LoginDataMail) {
      try {
        const res = await userLoginMail(loginForm)
        setToken(res.data.token)
      }
      catch (err) {
        clearToken()
        throw err
      }
    },

    // Logout
    async logout() {
      const data = {
        token: getToken(),
      }
      await userLogout(data)
      this.resetInfo()
      clearToken()
      removeRouteListener()
    },
  },
})

export default useUserStore

import type { UserInfo } from '@/store/modules/user/types'
import type { FilterType } from '@/types/global'
import axios from 'axios'

export interface LoginData {
  email: string
  password: string
}

export interface LogoutData {
  token: string | null
}

export interface RegisterData {
  username: string
  email: string
  password: string
  roleIds: number[]
}

export interface LoginDataMail {
  mailname: string
  mailpassword: string
}
export interface LoginResponse {
  accessToken: string
  accessTokenTTL: number
  refreshToken: string
  refreshTokenTTL: number
}

export interface LoginRes {
  token: string
  userInfo: UserInfo
}
export interface UserRes {
  chartData: []
  tableData: []
  taskSummary?: { status: string, value: number }[]
}
export interface UserData {
  sort?: number | undefined
  startTime?: string
  endTime?: string
  filterStatus?: string[]
  filterType?: string[]
}
export interface RefreshToken {
  token: string
}

export function flushToken(data: RefreshToken) {
  return axios.post<LoginResponse>(`${import.meta.env.VITE_BASE_API}/auth/token/refresh`, data)
}
export function login(data: LoginData) {
  return axios.post<LoginResponse>(`${import.meta.env.VITE_BASE_API}/auth/login`, data)
}
export function loginMail(data: LoginDataMail) {
  return axios.post<LoginRes>(`${import.meta.env.VITE_BASE_API}/mail/login`, data)
}

export function logout(data: LogoutData) {
  return axios.post<LoginRes>(`${import.meta.env.VITE_BASE_API}/auth/logout`, data)
}

// 获取全部用户
export function getAllUser(page?: number, limit?: number, filter?: FilterType) {
  const keys = Object.keys(filter ?? {})
  const params = new URLSearchParams()
  params.set('page', page.toString())
  params.set('limit', limit.toString())
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]
    const value = filter[key]
    if (value === undefined) {
      continue
    }
    if (value.type === 'enum') {
      if (Array.isArray(value.value) && value.value.length) {
        params.set(key, value.value.toString())
      }
    }
    if (value.type === 'input' && !Array.isArray(value.value)) {
      const sql = `${value.value.relation === 'contains' ? '%' : ''}${value.value.text}${value.value.relation === 'startwith' || value.value.relation === 'contains' ? '%' : ''}`
      params.set(key, sql)
    }
  }
  return axios.get<UserInfo>(`${import.meta.env.VITE_BASE_API}/user?${params.toString()}`)
}

// 获取单个用户
export function getUserInfo(email?: string) {
  return axios.get<UserInfo>(`${import.meta.env.VITE_BASE_API}/user/info/${email ?? ''}`)
}

export function deleteUser(email: string) {
  return axios.delete<UserInfo>(`${import.meta.env.VITE_BASE_API}/user/${email}`)
}

export function updateUserInfo(data: any) {
  return axios.patch(`${import.meta.env.VITE_BASE_API}/user/update`, data)
}

function readUserCenterPayload(result: unknown): UserRes {
  const body = (result as { data?: unknown })?.data ?? result
  if (body && typeof body === 'object' && 'chartData' in body) {
    return body as UserRes
  }
  if (body && typeof body === 'object' && 'data' in body) {
    const nested = (body as { data?: UserRes }).data
    if (nested && typeof nested === 'object' && 'chartData' in nested) {
      return nested
    }
  }
  return { chartData: [], tableData: [] }
}

export async function getUserData(data?: UserData) {
  const result = await axios.post(`${import.meta.env.VITE_BASE_API}/user/data`, data)
  return { data: readUserCenterPayload(result) }
}

export function registerUser(data: any) {
  return axios.post<UserInfo>(`${import.meta.env.VITE_BASE_API}/user/reg`, data)
}

export function updatePwdAdmin(data: any) {
  return axios.patch(`${import.meta.env.VITE_BASE_API}/user/admin/updatePwd`, data)
}

export function updatePwdUser(data: any) {
  return axios.patch(`${import.meta.env.VITE_BASE_API}/user/updatePwd`, data)
}

export function batchDeleteUsers(emails: string[]) {
  return axios.post(`${import.meta.env.VITE_BASE_API}/user/batch`, emails)
}

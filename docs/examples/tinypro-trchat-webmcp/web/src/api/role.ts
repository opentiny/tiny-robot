import type { IPaginationMeta } from '@/types/global'
import axios from 'axios'

export interface Role {
  id: number
  name: string
  permission: {
    name: string
    desc: string
    id: number
  }[]
}
export interface GetAllRoleDetailRet {
  roleInfo: {
    meta: IPaginationMeta
    items: Role[]
  }
  menuTree: any[]
}

export function getAllRole() {
  return axios.get(`${import.meta.env.VITE_BASE_API}/role`)
}

export function getAllRoleDetail(page = 1, limit = 10, name?: string) {
  return axios.get<GetAllRoleDetailRet>(`${import.meta.env.VITE_BASE_API}/role/detail`, {
    params: { page, limit, name },
  })
}

export function updateRole(data: any) {
  return axios.patch(`${import.meta.env.VITE_BASE_API}/role`, data)
}

export function deleteRole(id: number) {
  return axios.delete(`${import.meta.env.VITE_BASE_API}/role/${id}`)
}

export function createRole(data: any) {
  return axios.post(`${import.meta.env.VITE_BASE_API}/role`, data)
}

export function getRoleInfo(id: number) {
  return axios.get(`${import.meta.env.VITE_BASE_API}/role/info/${id}`)
}

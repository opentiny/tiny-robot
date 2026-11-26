import axios from 'axios'

export interface Permission {
  desc: string
  id: number
  name: string
}

export function getAllPermission(page?: number, limit?: number, name?: string) {
  return axios.get(`${import.meta.env.VITE_BASE_API}/permission`, {
    params: { page, limit, name },
  })
}

export function updatePermission(data: any) {
  return axios.patch(`${import.meta.env.VITE_BASE_API}/permission`, data)
}

export function deletePermission(id: number) {
  return axios.delete(`${import.meta.env.VITE_BASE_API}/permission/${id}`)
}

export function createPermission(data: any) {
  return axios.post(`${import.meta.env.VITE_BASE_API}/permission`, data)
}

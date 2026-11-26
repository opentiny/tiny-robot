import axios from 'axios'

export interface Lang {
  id: number
  name: string
}
export interface CreateLangDTO {
  name: string
}

export function getAllLang() {
  return axios.get<Lang[]>(`${import.meta.env.VITE_BASE_API}/lang`)
}
export function createLang(data: CreateLangDTO) {
  return axios.post<Lang>(`${import.meta.env.VITE_BASE_API}/lang`, data)
}

export function patchLang(data: Partial<CreateLangDTO>, id: number) {
  return axios.patch<Lang>(`${import.meta.env.VITE_BASE_API}/lang/${id}`, data)
}

export function deleteLang(id: number) {
  return axios.delete<{ name: string }>(`${import.meta.env.VITE_BASE_API}/lang/${id}`)
}

import axios from 'axios'

export interface QueryTaskParams {
  page: number
  limit: number
  [key: string]: any
}

export function getServicesList(params: QueryTaskParams) {
  return axios.get(`${import.meta.env.VITE_BASE_API}/application`, {
    params,
  })
}

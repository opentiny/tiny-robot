import axios from 'axios'

export interface DetailTableData {
  id: string
  version: string
  operation: string
  updated: string
  time: string // YYYY-MM-DD
}

// 获取 detail 表单的初始数据选项
export function getDetailData() {
  return axios.get(`${import.meta.env.VITE_MOCK_SERVER_HOST}/api/detail/getdata`)
}

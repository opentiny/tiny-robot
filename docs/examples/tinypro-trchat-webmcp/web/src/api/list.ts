import axios from 'axios'

export interface EmployeeSearchFilter {
  field: string
  values?: string[]
  start?: string
  end?: string
}

export interface EmployeeSearchInfo {
  keyword?: string
  filters?: EmployeeSearchFilter[]
}

export interface EmployeeFilterOptions {
  name: string[]
  employeeNo: string[]
  departmentLevel: string[]
  department: string[]
  status: string[]
  workbenchName: string[]
  project: string[]
  type: string[]
  address: string[]
  roles: string[]
  lastUpdateUser: string[]
  createTime: {
    min: string
    max: string
  }
}

export interface QueryTaskParmas {
  pageIndex: number
  pageSize: number
  searchInfo?: EmployeeSearchInfo
  [key: string]: any
}

export interface BaseEmployeeInfo {
  name: string
  status: string
  type: string
  roles: string
  employeeNo: string
  department: string
  departmentLevel: string
  workbenchName: string
  project: string
  address: string
  createTime: string
  lastUpdateUser: string
}

export interface EmployeeInfo extends BaseEmployeeInfo {
  id: string
  rank: string
  description: string
}

export interface UpdateEmployeeInfo extends BaseEmployeeInfo {
  id: string
}

export function queryEmployeeList(params: QueryTaskParmas) {
  return axios.post(
    `${import.meta.env.VITE_MOCK_SERVER_HOST}/api/employee/getEmployee`,
    params,
  )
}
export function deleteEmployee(id: string) {
  return axios.delete(`${import.meta.env.VITE_MOCK_SERVER_HOST}/api/employee/delete?id=${id}`)
}

// 新增获取员工信息的方法
export function getEmployeeInfo(id: string) {
  return axios.post(
    `${import.meta.env.VITE_MOCK_SERVER_HOST}/api/employee/getEmployeeInfo`,
    { id },
  )
}

export function updateEmployeeInfo(data: any) {
  return axios.post(
    `${import.meta.env.VITE_MOCK_SERVER_HOST}/api/employee/updateEmployeeInfo`,
    { data },
  )
}

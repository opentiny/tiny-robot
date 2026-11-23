import axios from 'axios'

export interface ProjectVersion {
  id: string
  version: string
  date: string
  content: string
  status: string
  owner: string
}

export interface ProjectInfo {
  id: string
  projectName: string
  projectCode: string
  projectStatus: string
  taskStatus: string
  department: string
  startTime: string
  endTime: string
  priority: string
  owner: string
  progress: number
  manHours: number
  budget: number
  teamSize: number
  goal: string
  technology: string
  partner: string
  riskLevel: string
  quality: string
  remark: string
  versions: ProjectVersion[] | null
}

export function queryProjectList() {
  return axios.post(`${import.meta.env.VITE_MOCK_SERVER_HOST}/api/project/getProjectList`)
}

export function createProject(data: Partial<ProjectInfo>) {
  return axios.post(`${import.meta.env.VITE_MOCK_SERVER_HOST}/api/project/create`, { data })
}

export function updateProject(data: Partial<ProjectInfo> & Pick<ProjectInfo, 'id'>) {
  return axios.post(`${import.meta.env.VITE_MOCK_SERVER_HOST}/api/project/update`, { data })
}

export function deleteProject(id: string) {
  return axios.delete(`${import.meta.env.VITE_MOCK_SERVER_HOST}/api/project/delete?id=${id}`)
}

import { successResponseWrap } from '../utils/setup-mock'
import { mockHttpResponse } from './dispatch'

export interface ProjectVersion {
  id: string
  version: string
  date: string
  content: string
  status: string
  owner: string
}

export interface ProjectRecord {
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
  versions: ProjectVersion[]
}

const projectNames = [
  '智慧园区管理平台',
  '统一支付结算中心',
  '数据中台建设',
  '移动办公门户',
  '客户关系管理系统',
  '供应链协同平台',
  '智能客服机器人',
  '大数据分析平台',
  'DevOps 流水线改造',
  '云原生迁移项目',
  '风控决策引擎',
  '电子合同签署平台',
  '会员营销系统',
  'IoT 设备接入平台',
  '可视化报表中心',
]

const departments = [
  '平台技术部',
  '金融事业部',
  '企业应用部',
  '数据智能部',
  '创新业务部',
]

const owners = [
  '张伟',
  '李娜',
  '王强',
  '赵敏',
  '陈杰',
  '杨柳',
  '周涛',
  '吴倩',
  '郑浩',
  '孙丽',
]

const projectStatuses = ['0', '1', '2', '3']
const taskStatuses = ['0', '1', '2']
const priorities = ['0', '1', '2']

function pad(num: number) {
  return String(num).padStart(2, '0')
}

function randomDate(startYear: number, endYear: number) {
  const start = new Date(startYear, 0, 1).getTime()
  const end = new Date(endYear, 11, 31).getTime()
  const date = new Date(start + Math.random() * (end - start))
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function pick<T>(list: T[], index: number): T {
  return list[index % list.length]
}

const technologies = [
  'Vue3 + TypeScript + TinyVue / NestJS / MySQL',
  'Vue3 + TinyVue / SpringBoot / MySQL',
  'Vue3 + TypeScript + TinyVue / Vite / Redis',
]

function createVersions(projectIndex: number, projectStatus: string, owner: string): ProjectVersion[] {
  const id = String(projectIndex + 1)
  const active = projectStatus === '1' || projectStatus === '3'
  return [
    {
      id: `${id}-1`,
      version: 'V1.0.0',
      date: projectStatus === '0' ? '-' : '2025-07-15',
      content: '项目基础能力、权限管理和工作台',
      status: projectStatus === '0' ? '2' : '0',
      owner,
    },
    {
      id: `${id}-2`,
      version: 'V1.1.0-beta',
      date: active ? '2026-01-10' : '-',
      content: '流程协同、消息提醒与移动端适配',
      status: active ? '1' : '2',
      owner,
    },
    {
      id: `${id}-3`,
      version: 'V2.0.0',
      date: '-',
      content: '多项目组合管理与资源负荷视图',
      status: '2',
      owner,
    },
  ]
}

function createProjectList(count: number): ProjectRecord[] {
  const list: ProjectRecord[] = []
  for (let i = 0; i < count; i += 1) {
    const [startTime, endTime] = [randomDate(2023, 2025), randomDate(2025, 2027)].sort()
    const projectName = pick(projectNames, i)
    const projectStatus = pick(projectStatuses, i)
    const owner = pick(owners, i * 7 + 3)
    list.push({
      id: String(i + 1),
      projectName,
      projectCode: `PRJ-${2024 + (i % 2)}-${pad((i % 60) + 1)}`,
      projectStatus,
      taskStatus: pick(taskStatuses, i * 2 + 1),
      department: pick(departments, i * 3 + 2),
      startTime,
      endTime,
      priority: pick(priorities, i * 5 + 1),
      owner,
      progress: [10, 65, 100, 40][i % 4],
      manHours: 80 + (i % 6) * 40,
      budget: 50 + (i % 5) * 30,
      teamSize: 5 + (i % 8),
      goal: `完成${projectName}建设，形成可复用的企业级业务能力。`,
      technology: pick(technologies, i),
      partner: '质量管理部、运维中心、用户体验部',
      riskLevel: pick(['低', '中', '高'], i),
      quality: '核心接口自动化测试覆盖率不低于 80%，关键流程具备完整审计记录。',
      remark: `${projectName}按当前计划推进，持续跟踪关键依赖和交付风险。`,
      versions: createVersions(i, projectStatus, owner),
    })
  }
  return list
}

const projects: ProjectRecord[] = createProjectList(60)

let nextProjectId = projects.length + 1

export default [
  {
    url: '/api/project/getProjectList',
    method: 'post',
    response: () => {
      return successResponseWrap(structuredClone(projects))
    },
  },
  {
    url: '/api/project/create',
    method: 'post',
    response: ({ body }: { body?: { data?: Partial<ProjectRecord> } }) => {
      const data = body?.data ?? {}
      const requiredFields: (keyof ProjectRecord)[] = ['projectName', 'projectCode', 'owner']
      const missing = requiredFields.filter(field => !String(data[field] ?? '').trim())
      if (missing.length)
        return mockHttpResponse(400, { message: `Missing required fields: ${missing.join(', ')}` })
      const record: ProjectRecord = {
        projectName: '',
        projectCode: '',
        projectStatus: '',
        taskStatus: '',
        department: '',
        startTime: '',
        endTime: '',
        priority: '',
        owner: '',
        progress: 0,
        manHours: 0,
        budget: 0,
        teamSize: 0,
        goal: '',
        technology: '',
        partner: '',
        riskLevel: '',
        quality: '',
        remark: '',
        versions: [],
        ...data,
        id: String(nextProjectId++),
      }
      const index = projects.findIndex(item => item.id === String(body?.data?.id ?? ''))
      if (index > -1)
        projects[index] = record
      else
        projects.unshift(record)
      return successResponseWrap(record)
    },
  },
  {
    url: '/api/project/update',
    method: 'post',
    response: ({ body }: { body?: { data?: Partial<ProjectRecord> } }) => {
      const index = projects.findIndex(item => item.id === String(body?.data?.id ?? ''))
      if (index === -1)
        return mockHttpResponse(404, { message: 'Project not found' })
      projects[index] = { ...projects[index], ...body?.data } as ProjectRecord
      return successResponseWrap(true)
    },
  },
  {
    url: '/api/project/delete',
    method: 'delete',
    response: ({ query }: { query: URLSearchParams }) => {
      const id = query.get('id')
      const index = projects.findIndex(item => item.id === id)
      if (index > -1)
        projects.splice(index, 1)
      return successResponseWrap(true)
    },
  },
] as any

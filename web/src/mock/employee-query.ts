export interface EmployeeRecord {
  id: string
  name: string
  rank: string
  description: string
  createTime: string
  status: string
  type: string
  roles: string
  employeeNo: string
  department: string
  departmentLevel: string
  workbenchName: string
  project: string
  address: string
  lastUpdateUser: string
}

export interface EmployeeSearchFilter {
  field?: string
  values?: Array<string | number>
  start?: string
  end?: string
}

export interface EmployeeSearchInfo {
  keyword?: string
  filters?: EmployeeSearchFilter[]
}

export interface EmployeeQueryBody {
  pageIndex?: number | string
  pageSize?: number | string
  searchInfo?: EmployeeSearchInfo
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

const NAMES = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨帆', '赵敏', '黄磊', '周杰', '吴婷', '孙悦', '郑凯']
const RANKS = ['初级', '中级', '高级', '专家', '资深']
const TYPES = ['Tiny Design', 'UI Design', 'UX Design', 'Frontend', 'Backend', 'Fullstack']
const ROLES = ['前端', '后端', '全栈', '测试', '产品', '设计']
const DEPARTMENTS = ['公共服务', '技术部', '产品部', '设计部', '测试部', '运营部']
const LEVELS = ['一级', '二级', '三级', '四级']
const WORKBENCHES = ['work', 'design', 'develop', 'test', 'ops', 'manage']
const PROJECTS = ['TinyDesign', 'BigProject', 'MiniApp', 'MicroService', 'CloudPlatform', 'AIEngine']
const ADDRESSES = ['西安研究所', '北京总部', '上海分部', '深圳中心', '广州办事处', '成都研发中心']
const USERS = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
const STATUSES = ['0', '1', '2']

const FILTER_FIELDS = [
  'name',
  'employeeNo',
  'departmentLevel',
  'department',
  'status',
  'workbenchName',
  'project',
  'type',
  'address',
  'roles',
  'lastUpdateUser',
] as const

const FUZZY_FIELDS = new Set(['name', 'employeeNo'])

const STATUS_KEYWORDS: Record<string, string[]> = {
  0: ['已下线', 'Offline'],
  1: ['已上线', 'Online'],
  2: ['进行中', 'Ongoing'],
}

const TEXT_FIELDS: Array<keyof EmployeeRecord> = [
  'name',
  'employeeNo',
  'department',
  'departmentLevel',
  'workbenchName',
  'project',
  'type',
  'address',
  'roles',
  'lastUpdateUser',
  'createTime',
]

function pick<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function randomCreateTime() {
  const start = new Date('2024-01-01T00:00:00').getTime()
  const end = new Date('2026-10-01T00:00:00').getTime()
  const date = new Date(start + Math.floor(Math.random() * (end - start)))
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function randomEmployeeNo(used: Set<string>) {
  let value = ''
  do {
    value = `101${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`
  } while (used.has(value))
  used.add(value)
  return value
}

export function createEmployeeList(count = 60): EmployeeRecord[] {
  const usedNos = new Set<string>()

  return Array.from({ length: count }, (_, index) => {
    const name = pick(NAMES)
    const department = pick(DEPARTMENTS)
    const rank = pick(RANKS)
    return {
      id: String(index + 1),
      name,
      rank,
      description: `${name}，${rank}，当前在${department}参与交付`,
      createTime: randomCreateTime(),
      status: pick(STATUSES),
      type: pick(TYPES),
      roles: pick(ROLES),
      employeeNo: randomEmployeeNo(usedNos),
      department,
      departmentLevel: pick(LEVELS),
      workbenchName: pick(WORKBENCHES),
      project: pick(PROJECTS),
      address: pick(ADDRESSES),
      lastUpdateUser: pick(USERS),
    }
  })
}

function parseDateTime(value?: string) {
  if (!value)
    return Number.NaN
  const text = value.trim().replace(/\//g, '-').replace(' ', 'T')
  const time = new Date(text).getTime()
  return Number.isNaN(time) ? Number.NaN : time
}

function matchKeyword(row: EmployeeRecord, keyword: string) {
  const tokens = keyword.split(/\s+/).filter(Boolean)
  if (!tokens.length)
    return true

  const haystack = [
    ...TEXT_FIELDS.map(field => row[field]),
    row.status,
    ...(STATUS_KEYWORDS[row.status] || []),
  ].join('\n').toLowerCase()

  return tokens.every(token => haystack.includes(token.toLowerCase()))
}

function matchFilter(row: EmployeeRecord, filter: EmployeeSearchFilter) {
  const field = filter.field
  if (!field || !(field in row))
    return true

  if (filter.start || filter.end) {
    const current = parseDateTime(String(row[field as keyof EmployeeRecord] ?? ''))
    if (Number.isNaN(current))
      return false
    const start = parseDateTime(filter.start)
    const end = parseDateTime(filter.end)
    if (!Number.isNaN(start) && current < start)
      return false
    if (!Number.isNaN(end) && current > end)
      return false
    return true
  }

  const values = (filter.values || [])
    .map(value => String(value).trim())
    .filter(Boolean)
  if (!values.length)
    return true

  const current = String(row[field as keyof EmployeeRecord] ?? '').trim().toLowerCase()
  if (FUZZY_FIELDS.has(field))
    return values.some(value => current.includes(value.toLowerCase()))

  return values.some(value => current === value.toLowerCase())
}

export function filterEmployees(list: EmployeeRecord[], searchInfo?: EmployeeSearchInfo) {
  const keyword = searchInfo?.keyword?.trim() ?? ''
  const filters = searchInfo?.filters ?? []
  return list.filter(row => matchKeyword(row, keyword) && filters.every(filter => matchFilter(row, filter)))
}

function buildEmployeeFilters(list: EmployeeRecord[]): EmployeeFilterOptions {
  const grouped = Object.fromEntries(FILTER_FIELDS.map(field => [field, new Set<string>()])) as Record<typeof FILTER_FIELDS[number], Set<string>>
  let min = ''
  let max = ''

  list.forEach((row) => {
    FILTER_FIELDS.forEach((field) => {
      grouped[field].add(String(row[field]))
    })
    if (!min || row.createTime < min)
      min = row.createTime
    if (!max || row.createTime > max)
      max = row.createTime
  })

  const filters = Object.fromEntries(
    FILTER_FIELDS.map(field => [field, [...grouped[field]].sort((a, b) => a.localeCompare(b, 'zh'))]),
  ) as Omit<EmployeeFilterOptions, 'createTime'>

  return {
    ...filters,
    createTime: { min, max },
  }
}

export function queryEmployeePage(list: EmployeeRecord[], body: EmployeeQueryBody = {}) {
  const pageIndex = Math.max(1, Number(body.pageIndex) || 1)
  const pageSize = Math.max(1, Number(body.pageSize) || 10)
  const filtered = filterEmployees(list, body.searchInfo)
  const offset = (pageIndex - 1) * pageSize

  return {
    total: filtered.length,
    data: filtered.slice(offset, offset + pageSize),
    filters: buildEmployeeFilters(list),
  }
}

export function updateEmployeeRecord(list: EmployeeRecord[], data: Partial<EmployeeRecord>) {
  const employee = list.find(item => item.id === String(data.id ?? ''))
  if (!employee) {
    return false
  }

  ;(Object.keys(employee) as Array<keyof EmployeeRecord>).forEach((key) => {
    if (key === 'id') {
      return
    }
    const value = data[key]
    if (typeof value === 'string') {
      employee[key] = value
    }
  })
  return true
}

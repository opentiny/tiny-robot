import type { EmployeeRecord } from './employee-query'
import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import {
  createEmployeeList,
  filterEmployees,
  queryEmployeePage,
} from './employee-query'
import list from './list'

const baseRecord: EmployeeRecord = {
  id: '1',
  name: '张伟',
  rank: '初级',
  description: '描述',
  createTime: '2024-01-01 08:00:00',
  status: '0',
  type: 'Frontend',
  roles: '前端',
  employeeNo: '10000001',
  department: '技术部',
  departmentLevel: '一级',
  workbenchName: 'work',
  project: 'TinyDesign',
  address: '西安研究所',
  lastUpdateUser: '张三',
}

function record(partial: Partial<EmployeeRecord>): EmployeeRecord {
  return { ...baseRecord, ...partial }
}

test('generated employees vary across filterable columns', () => {
  const employees = createEmployeeList(60)
  assert.equal(employees.length, 60)
  assert.ok(new Set(employees.map(item => item.name)).size > 1)
  assert.ok(new Set(employees.map(item => item.department)).size > 1)
  assert.ok(new Set(employees.map(item => item.address)).size > 1)
  assert.ok(new Set(employees.map(item => item.employeeNo)).size === 60)
  assert.ok(employees.every(item => /^101\d{6}$/.test(item.employeeNo)))
  assert.deepEqual([...new Set(employees.map(item => item.status))].sort(), ['0', '1', '2'])
})

test('department filter paginates matches and keeps the full option list', () => {
  const employees = [
    record({ id: '1', department: '技术部', name: '张伟' }),
    record({ id: '2', department: '设计部', name: '李娜', createTime: '2024-06-01 08:00:00' }),
    record({ id: '3', department: '技术部', name: '王芳', createTime: '2025-01-01 08:00:00' }),
  ]
  const page = queryEmployeePage(employees, {
    pageIndex: 1,
    pageSize: 1,
    searchInfo: { filters: [{ field: 'department', values: ['技术部'] }] },
  })

  assert.equal(page.total, 2)
  assert.equal(page.data.length, 1)
  assert.equal(page.data[0].department, '技术部')
  assert.deepEqual(page.filters.department.sort(), ['技术部', '设计部'].sort())
})

test('keyword, status code, and create time range can be combined', () => {
  const employees = [
    record({ id: '1', name: '张伟', status: '1', createTime: '2024-03-01 10:00:00', address: '西安研究所' }),
    record({ id: '2', name: '张伟', status: '0', createTime: '2025-03-01 10:00:00', address: '北京总部' }),
    record({ id: '3', name: '李娜', status: '1', createTime: '2024-03-02 10:00:00', address: '西安研究所' }),
  ]

  const matched = filterEmployees(employees, {
    keyword: '张伟 已上线',
    filters: [{
      field: 'createTime',
      start: '2024-01-01 00:00:00',
      end: '2024-12-31 23:59:59',
    }],
  })

  assert.deepEqual(matched.map(item => item.id), ['1'])
})

test('name and employee number filters match partial text', () => {
  const employees = [
    record({ id: '1', name: '张伟', employeeNo: '10008601' }),
    record({ id: '2', name: '李娜', employeeNo: '20008602' }),
  ]
  const matched = filterEmployees(employees, {
    filters: [
      { field: 'name', values: ['张'] },
      { field: 'employeeNo', values: ['8601'] },
    ],
  })

  assert.deepEqual(matched.map(item => item.id), ['1'])
})

test('same field matches any value and different fields must all match', () => {
  const employees = [
    record({ id: '1', department: '技术部', roles: '前端' }),
    record({ id: '2', department: '设计部', roles: '设计' }),
    record({ id: '3', department: '技术部', roles: '后端' }),
  ]

  const matched = filterEmployees(employees, {
    filters: [
      { field: 'department', values: ['技术部', '设计部'] },
      { field: 'roles', values: ['前端'] },
    ],
  })

  assert.deepEqual(matched.map(item => item.id), ['1'])
})

test('employee list handler applies search and still exposes every filter option', async () => {
  const handler = list.find(item => item.url === '/api/employee/getEmployee')
  const all = await handler.response({ body: { pageIndex: 1, pageSize: 10 } })
  const department = all.data.filters.department[0]
  const filtered = await handler.response({
    body: {
      pageIndex: 1,
      pageSize: 5,
      searchInfo: { filters: [{ field: 'department', values: [department] }] },
    },
  })

  assert.equal(all.code, '0')
  assert.equal(all.data.total, 60)
  assert.ok(filtered.data.total > 0 && filtered.data.total < 60)
  assert.equal(filtered.data.data.length, Math.min(5, filtered.data.total))
  assert.ok(filtered.data.data.every(item => item.department === department))
  assert.ok(filtered.data.filters.department.length > 1)
})

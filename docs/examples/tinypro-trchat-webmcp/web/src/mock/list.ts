import type { EmployeeQueryBody, EmployeeRecord } from './employee-query'
import { successResponseWrap } from '../utils/setup-mock'
import { createEmployeeList, queryEmployeePage, updateEmployeeRecord } from './employee-query'

const employees: EmployeeRecord[] = createEmployeeList(60)

export default [
  {
    url: '/api/employee/getEmployee',
    method: 'post',
    response: ({ body }: { body?: EmployeeQueryBody }) => {
      return successResponseWrap(queryEmployeePage(employees, body ?? {}))
    },
  },
  {
    url: '/api/employee/getEmployeeInfo',
    method: 'post',
    response: ({ body }: { body?: { id?: string } }) => {
      const employee = employees.find(item => item.id === String(body?.id ?? '')) || null
      return successResponseWrap(employee)
    },
  },
  {
    url: '/api/employee/updateEmployeeInfo',
    method: 'post',
    response: ({ body }: { body?: { data?: Partial<EmployeeRecord> } }) => {
      return successResponseWrap(updateEmployeeRecord(employees, body?.data ?? {}))
    },
  },
  {
    url: '/api/employee/delete',
    method: 'delete',
    response: ({ query }: { query: URLSearchParams }) => {
      const id = query.get('id')
      const index = employees.findIndex(item => item.id === id)
      if (index > -1)
        employees.splice(index, 1)
      return successResponseWrap(true)
    },
  },
] as any

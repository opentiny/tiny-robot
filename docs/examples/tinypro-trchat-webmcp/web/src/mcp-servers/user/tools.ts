import type { PageAwareServer } from '@opentiny/next-sdk'
import { z } from '@opentiny/next-sdk'

function registerUserManagementTools(server: PageAwareServer) {
  server.registerTool(
    'add-user',
    {
      title: '添加用户',
      description: '添加用户，可选参数不需要用户提供，也不用创建表单卡片，直接根据用户提供的信息添加用户即可',
      inputSchema: {
        email: z.string().describe('邮箱'),
        password: z.string().describe('密码'),
        name: z.string().describe('用户名'),
        address: z.string().describe('地址').optional(),
        department: z.string().describe('所属部门').optional(),
        roleIds: z.array(z.number()).describe('职位').optional(),
        employeeType: z.string().describe('招聘类型').optional(),
        probationDate: z.array(z.date()).describe('试用期起止时间').optional(),
        probationDuration: z.string().describe('试用期时长').optional(),
        protocolStart: z.date().describe('劳动合同开始日期').optional(),
        protocolEnd: z.date().describe('劳动合同结束日期').optional(),
        status: z.string().describe('状态').optional(),
      },
    },
    { route: '/vue-pro/userManager/allInfo' },
  )
}

export default registerUserManagementTools

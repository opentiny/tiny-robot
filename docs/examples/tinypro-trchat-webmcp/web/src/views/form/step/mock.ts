import Mock from 'mockjs'
import { successResponseWrap } from '../../../utils/setup-mock'

const initBase = Mock.mock({
  position: [
    {
      value: '1',
      label: 'position1',
    },
    {
      value: '2',
      label: 'position2',
    },
    {
      value: '3',
      label: 'position3',
    },
    {
      value: '4',
      label: 'position4',
    },
  ],
  HR: [
    {
      value: '1',
      label: 'test01',
    },
    {
      value: '2',
      label: 'test01',
    },
    {
      value: '3',
      label: 'test03',
    },
  ],
  mentor: ['Teacher1', 'Teacher2', 'Teacher3', 'Teacher4'],
  director: ['Director1', 'Director2', 'Director3', 'Director4'],
  status: ['running', 'finished', 'delayed'],
  department: [
    {
      value: '1',
      label: 'department01',
    },
    {
      value: '2',
      label: 'department02',
    },
    {
      value: '3',
      label: 'department03',
    },
  ],
})

export default [
  // init-base：基础表单为教练表单布局，与 step/advance 共用同一套选项数据
  {
    url: '/api/base/getdata',
    method: 'get',
    response: () => {
      return successResponseWrap(initBase)
    },
  },

  // init-step
  {
    url: '/api/step/getdata',
    method: 'get',
    response: () => {
      return successResponseWrap(initBase)
    },
  },

  // submit
  {
    url: '/api/channel-form/submit',
    method: 'post',
    response: () => {
      return successResponseWrap('ok')
    },
  },

  // init-advance
  {
    url: '/api/advance/getdata',
    method: 'get',
    response: () => {
      return successResponseWrap(initBase)
    },
  },
] as any

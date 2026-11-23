import { initData, successResponseWrap } from '../utils/setup-mock'

const positive = JSON.parse(JSON.stringify(initData.tableData))
const negative = JSON.parse(JSON.stringify(initData.tableData.reverse()))
const initlist = JSON.parse(JSON.stringify(initData.chartData[0].list))

function userDataResponse() {
  const taskSummary = ['A', 'B', 'C', 'D'].map(status => ({
    status,
    value: initData.tableData.filter((item: any) => item.pid === status).length,
  }))
  return successResponseWrap({ ...initData, taskSummary })
}

export default [
  // 用户中心数据
  {
    url: '/api/user/data',
    method: 'post',
    response: (params: any) => {
      const { sort, startTime, endTime, filterStatus, filterType } = JSON.parse(
        JSON.stringify(params.body),
      )
      initData.tableData = positive
      initData.chartData[0].list = initlist
      if (sort === 1 || sort === 3) {
        initData.chartData[0].list.reverse()
        initData.tableData = positive
        return userDataResponse()
      }
      if (sort === 2 || sort === 4) {
        initData.chartData[0].list.reverse()
        initData.tableData = negative
        return userDataResponse()
      }
      if (
        startTime !== ''
        || endTime !== ''
        || filterStatus.length !== 0
        || (filterType.length !== 0 && sort === undefined)
      ) {
        const start = new Date(JSON.parse(JSON.stringify(startTime))).getTime()
        const end = new Date(JSON.parse(JSON.stringify(endTime))).getTime()

        const table = initData.tableData.filter((item: any) => {
          return (
            filterType.includes(item.bid)
            && filterStatus.includes(item.pid)
            && new Date(JSON.parse(JSON.stringify(item.time))).getTime() - start
            > 0
            && new Date(JSON.parse(JSON.stringify(item.time))).getTime() - end < 0
          )
        })

        const chart = initData.chartData[0].list.filter((item: any) => {
          return (
            filterType.includes(item.bid) && filterStatus.includes(item.pid)
          )
        })
        initData.tableData = table
        initData.chartData[0].list = chart
        return userDataResponse()
      }
      return userDataResponse()
    },
  },
] as any

import type { MockMethod } from './dispatch'

/**
 * 监控页（board/home）的纯前端 mock 数据。
 * 保证纯前端 mock 模式下监控页同样有数据。
 */

const homeCards = {
  week: [
    { value: '3.23', trend: 'up', change: '5.2%', type: 'success', percent: 76 },
    { value: '1.56', trend: 'down', change: '2.1%', type: 'danger', percent: 48 },
    { value: '3.69', trend: 'up', change: '0.88%', type: 'success', percent: 82 },
    { value: '0.69', trend: 'down', change: '1.4%', type: 'danger', percent: 35 },
  ],
  day: [
    { value: '2.87', trend: 'up', change: '3.6%', type: 'success', percent: 71 },
    { value: '1.42', trend: 'up', change: '0.9%', type: 'success', percent: 54 },
    { value: '3.15', trend: 'down', change: '1.8%', type: 'danger', percent: 68 },
    { value: '0.74', trend: 'up', change: '2.4%', type: 'success', percent: 42 },
  ],
  hour: [
    { value: '2.41', trend: 'down', change: '0.6%', type: 'danger', percent: 64 },
    { value: '1.08', trend: 'down', change: '1.2%', type: 'danger', percent: 47 },
    { value: '2.96', trend: 'up', change: '1.1%', type: 'success', percent: 79 },
    { value: '0.52', trend: 'up', change: '4.3%', type: 'success', percent: 58 },
  ],
}

const homeCurve = {
  pv: [18, 20, 22, 25, 24, 22, 19, 17, 18, 20, 23, 26, 28, 27, 24, 21, 19, 18, 20, 22, 24, 23, 21, 19],
  play: [25, 24, 26, 28, 30, 29, 27, 25, 24, 26, 28, 30, 31, 30, 28, 26, 25, 24, 25, 27, 29, 28, 26, 25],
  page: [30, 32, 31, 29, 27, 26, 28, 30, 32, 33, 31, 29, 27, 26, 28, 30, 32, 33, 32, 30, 28, 27, 29, 31],
}

const homeFalls = {
  pv: [8, 18, 14, 26, 12, 20],
  play: [12, 22, 10, 18, 25, 14],
  page: [20, 15, 26, 22, 18, 24],
}

const homeRound = {
  ring: [
    { value: 300, name: '5G' },
    { value: 1048, name: '4G' },
    { value: 735, name: 'home.round.unknow' },
    { value: 580, name: '3G' },
  ],
  stations: [
    { key: 'home.round.station1', percentage: 70, color: '#5cb87a' },
    { key: 'home.round.station2', percentage: 45, color: '#1989fa' },
    { key: 'home.round.station3', percentage: 85, color: '#e6a23c' },
    { key: 'home.round.station4', percentage: 60, color: '#f56c6c' },
  ],
}

const homeRegion = [
  { name: '北京市', value: 350000 },
  { name: '天津市', value: 120000 },
  { name: '上海市', value: 300000 },
  { name: '重庆市', value: 92000 },
  { name: '河北省', value: 25000 },
  { name: '河南省', value: 20000 },
  { name: '云南省', value: 500 },
  { name: '辽宁省', value: 3050 },
  { name: '黑龙江省', value: 80000 },
  { name: '湖南省', value: 2000 },
  { name: '安徽省', value: 24580 },
  { name: '山东省', value: 40629 },
  { name: '新疆维吾尔自治区', value: 36981 },
  { name: '江苏省', value: 13569 },
  { name: '浙江省', value: 24956 },
  { name: '江西省', value: 15194 },
  { name: '湖北省', value: 41398 },
  { name: '广西壮族自治区', value: 41150 },
  { name: '甘肃省', value: 17630 },
  { name: '山西省', value: 27370 },
  { name: '内蒙古自治区', value: 27370 },
  { name: '陕西省', value: 97208 },
  { name: '吉林省', value: 88290 },
  { name: '福建省', value: 19978 },
  { name: '贵州省', value: 94485 },
  { name: '广东省', value: 89426 },
  { name: '青海省', value: 35484 },
  { name: '西藏自治区', value: 97413 },
  { name: '四川省', value: 54161 },
  { name: '宁夏回族自治区', value: 56515 },
  { name: '海南省', value: 54871 },
  { name: '台湾省', value: 48544 },
  { name: '香港省', value: 49474 },
  { name: '澳门特别行政区', value: 34594 },
]

const homeRegionTable = [
  { id: '1', space: '上海', pv: '1767(97.77%)', play: '0.44s', page: '2.7s' },
  { id: '2', space: '香港', pv: '22(1.77%)', play: '0.43s', page: '1.1s' },
  { id: '3', space: '北京', pv: '32(1.77%)', play: '0.44s', page: '1.7s' },
  { id: '4', space: '广东', pv: '32(1.77%)', play: '0.44s', page: '1.7s' },
  { id: '5', space: '江苏', pv: '16(0.88%)', play: '0.66s', page: '3.12s' },
  { id: '6', space: '福建', pv: '1765(97.35%)', play: '0.44s', page: '1.7s' },
  { id: '7', space: '四川', pv: '32(1.77%)', play: '0.65s', page: '2.92s' },
]

export const boardHomeData = {
  cards: homeCards,
  curve: homeCurve,
  falls: homeFalls,
  round: homeRound,
  region: homeRegion,
  regionTable: homeRegionTable,
}

export default [
  {
    url: '/api/board/home',
    method: 'get',
    response: () => boardHomeData,
  },
] as MockMethod[]

import axios from 'axios'

export interface ContentDataRecord {
  x: string
  y: number
}

export function queryContentData() {
  return axios.get<ContentDataRecord[]>(`${import.meta.env.VITE_BASE_API}/content-data`)
}

export interface PopularRecord {
  key: number
  clickNumber: string
  title: string
  increases: number
}

export interface DataOverviewRecord {
  total: number
  growth: number
  list: {
    date: string
    value: number
  }[]
}

export interface VisitRecord {
  list: {
    date: string
    pv: number
    growth: number
  }[]
}

export interface PeriodVisitsRecord {
  time: string
  pv: number
  uv: number
}

export interface QueryVisitDetailParmas {
  pageIndex: number
  pageSize: number
}

export function queryPopularList(params: { type: string }) {
  return axios.get<PopularRecord[]>(`${import.meta.env.VITE_BASE_API}/popular/list`, { params })
}

export function queryDataOverview(key: string) {
  return axios.get<DataOverviewRecord>(`${import.meta.env.VITE_BASE_API}/dashboard/data-overview/${key}`)
}

export function queryVisitData(params: { days: string }) {
  return axios.get<VisitRecord>(`${import.meta.env.VITE_BASE_API}/dashboard/visit`, { params })
}

export function queryPeriodVisits() {
  return axios.get<PeriodVisitsRecord[]>(`${import.meta.env.VITE_BASE_API}/dashboard/period-visits`)
}

export function queryVisitsDetail(params: QueryVisitDetailParmas) {
  return axios.get(`${import.meta.env.VITE_BASE_API}/dashboard/visits-detail`, {
    params,
  })
}

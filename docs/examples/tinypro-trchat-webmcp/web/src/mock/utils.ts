export interface requestParam {
  body: string | null
  type: string
  url: string
}

export function successResponseWrapper(data: unknown) {
  return {
    data,
    status: 'ok',
    msg: '请求成功',
    code: 20000,
  }
}

export function failResponseWrapper(data: unknown, msg: string, code = 50000) {
  return {
    data,
    status: 'fail',
    msg,
    code,
  }
}

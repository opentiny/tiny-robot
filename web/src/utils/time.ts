export function getSimpleDate(standardTime: any) {
  const d = new Date(standardTime)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

// 按时间正序
export function sortTime(property: string | number | any) {
  return function (a: { [x: string]: any }, b: { [x: string]: any }) {
    const value1 = a[property]

    const value2 = b[property]
    return (
      new Date(JSON.parse(JSON.stringify(value2))).getTime()
        - new Date(JSON.parse(JSON.stringify(value1))).getTime()
    )
  }
}

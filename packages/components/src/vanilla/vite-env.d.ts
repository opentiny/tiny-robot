declare module '*.css?inline' {
  const cssText: string
  export default cssText
}

declare module '*.svg?inline' {
  const url: string
  export default url
}

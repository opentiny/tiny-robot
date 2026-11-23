// 获取assets静态资源
function getAssetsFile(url: string) {
  return new URL(`../assets/images/${url}`, import.meta.url).href
}

export default getAssetsFile

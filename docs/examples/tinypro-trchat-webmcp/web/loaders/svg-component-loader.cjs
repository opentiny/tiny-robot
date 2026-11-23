const { compileTemplate } = require('vue/compiler-sfc')

// 与 vite-svg-loader 的默认产物一致：导出带 render 的 Vue 组件。
module.exports = function svgComponentLoader(source) {
  this.cacheable()
  const svg = Buffer.isBuffer(source) ? source.toString('utf8') : String(source)
  const { code, errors } = compileTemplate({
    id: JSON.stringify(this.resourcePath),
    source: svg,
    filename: this.resourcePath,
    transformAssetUrls: false,
  })
  if (errors && errors.length) {
    const message = errors.map(error => error.message || String(error)).join('\n')
    throw new Error(message)
  }
  return `${code}\nexport default { render }\n`
}

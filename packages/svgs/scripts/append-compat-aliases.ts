import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const indexFile = path.join(__dirname, '..', 'src/components', 'index.ts')
const compatibilityAliasMap = {
  IconAccessory: 'IconUpload',
  IconCancelFullScreen: 'IconExitFullScreen',
  IconClear: 'IconClose',
  IconFullScreen: 'IconEnterFullScreen',
  IconImageLoading: 'IconUploadLoading',
  IconMenu: 'IconMoreCircle',
  IconMenu2: 'IconMore',
} as const

if (!fs.existsSync(indexFile)) {
  console.error('未找到组件导出文件，请先执行 convert.ts')
  process.exit(1)
}

const indexContent = fs.readFileSync(indexFile, 'utf8')
const compatibilityExportLines = Object.entries(compatibilityAliasMap)
  .filter(
    ([aliasName, targetName]) =>
      !indexContent.includes(`export { default as ${aliasName} }`) &&
      indexContent.includes(`export { default as ${targetName} }`),
  )
  .map(([aliasName, targetName]) => `export { default as ${aliasName} } from './${targetName}.vue';`)

if (compatibilityExportLines.length === 0) {
  console.log('没有需要追加的兼容别名')
  process.exit(0)
}

const compatibilitySection = `\n// 兼容旧版导出名（下个版本移除）\n${compatibilityExportLines.join('\n')}\n`

fs.appendFileSync(indexFile, compatibilitySection)

console.log(`追加兼容别名 ${compatibilityExportLines.length} 个`)

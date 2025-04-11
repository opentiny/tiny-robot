/**
 * 自动转化svg为vue组件
 */

import fs from 'node:fs'
import path from 'node:path'
import { transform } from '@svgr/core'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const svgDir = path.join(__dirname, '..', 'src/assets')
const outputDir = path.join(__dirname, '..', 'src/components')

/**
 * 将短横线分隔的名称转换为大写驼峰格式
 * 例如: full-screen -> FullScreen
 */
function toCamelCase(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// 默认跳过已存在的组件，-F 参数强制覆盖
const forceOverwrite = process.argv.includes('--force') || process.argv.includes('-F')

// 存储所有生成的组件名，用于后续生成index.ts
const generatedComponents: string[] = []

// 转换SVG文件为Vue组件
async function convertSvgFiles() {
  const svgFiles = fs.readdirSync(svgDir).filter((file) => path.extname(file) === '.svg')

  for (const file of svgFiles) {
    const baseName = path.basename(file, '.svg')
    const componentName = `Icon${toCamelCase(baseName)}`
    const outputFile = path.join(outputDir, `${componentName}.vue`)

    // 检查组件是否已存在，如果存在且不强制覆盖则跳过
    if (fs.existsSync(outputFile) && !forceOverwrite) {
      console.log(`组件 ${componentName} 已存在，跳过生成`)
      generatedComponents.push(componentName)
      continue
    }

    const svgCode = fs
      .readFileSync(path.join(svgDir, file), 'utf8')
      .replace('<?xml version="1.0" encoding="utf-8"?>', '')
    const componentCode = await transform(
      svgCode,
      {
        icon: true,
      },
      { componentName },
    )

    // 创建Vue单文件组件
    //     const vueComponent = `<template>
    // ${componentCode.trim()}
    // </template>`
    const vueComponent = `<template>
${componentCode.trim()}
</template>

<script lang="ts">
export default {
  name: '${componentName}'
};
</script>
`
    fs.writeFileSync(outputFile, vueComponent)
    console.log(`生成组件: ${componentName}`)
    generatedComponents.push(componentName)
  }

  // 生成index.ts文件，导出所有组件
  generateIndexFile()
}

// 生成index.ts文件，导出所有组件
function generateIndexFile() {
  const indexContent = generatedComponents
    .map((name) => `export { default as ${name} } from './${name}.vue';`)
    .join('\n')

  fs.writeFileSync(
    path.join(outputDir, 'index.ts'),
    `// 此文件由convert.ts脚本自动生成\n// 导出所有SVG图标组件\n\n${indexContent}\n`,
  )

  console.log(`生成index.ts文件，共导出 ${generatedComponents.length} 个组件`)
}

// 运行转换脚本
convertSvgFiles().catch((err) => {
  console.error('转换SVG文件时出错:', err)
  process.exit(1)
})

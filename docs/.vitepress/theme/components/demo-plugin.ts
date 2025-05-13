import { readFileSync } from 'fs'
import path from 'path'
import { createHighlighter } from 'shiki'
import type { Plugin } from 'vite'

const highlighter = await createHighlighter({
  langs: ['vue'],
  themes: ['github-light', 'github-dark'],
})

function toTitleCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

export default async function demoPlugin(): Promise<Plugin> {
  return {
    name: 'vitepress-demo-plugin',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.md$/.test(id)) return

      const pathToNameMap = new Map<string, string>()

      const demoRegex = /<\s*demo-plugin\s+[^>]*?\bvue\s*=\s*["']([^"']+)["'][^>]*?(\/>|>(.*?)<\/\s*demo-plugin\s*>)/g
      const result = code.replace(demoRegex, (_match, vuePath) => {
        try {
          const absPath = path.join(path.dirname(id), vuePath)
          const sourceCode = readFileSync(absPath, 'utf-8')

          const getComponentName = () => {
            if (pathToNameMap.has(vuePath)) {
              return pathToNameMap.get(vuePath) as string
            }

            const generateComponentName = () => {
              const baseDemoName = `Demo${toTitleCase(path.basename(vuePath).split('.')[0])}`
              const componentNameList = Array.from(pathToNameMap.values())

              let name = baseDemoName
              let count = 1

              while (componentNameList.includes(name)) {
                name = `${baseDemoName}${count}`
                count += 1
              }

              return name
            }

            const name = generateComponentName()
            pathToNameMap.set(vuePath, name)
            return name
          }

          const componentName = getComponentName()

          return `
<div class="demo-plugin-wrapper">
<${componentName} />
</div>

:::details 点我查看代码
<div class="language-vue demo-plugin-code">
${highlighter.codeToHtml(sourceCode, { lang: 'vue', themes: { light: 'github-light', dark: 'github-dark' } })}
</div>
:::
`
        } catch (error) {
          console.error(error)
          return `
::: danger DemoPlugin Error
Error loading vue file: ${vuePath}
:::
`
        }
      })

      if (pathToNameMap.size === 0) {
        return result
      }

      const dynamicComponentImports = Array.from(pathToNameMap.entries()).map(([vuePath, componentName]) => {
        return `const ${componentName} = defineClientComponent(() => {
  return import('${vuePath}')
})`
      })

      const scriptSetupTemplate = `
<script setup>
import { defineClientComponent } from 'vitepress'

${dynamicComponentImports.join('\n')}
</script>
`

      const lastIndexOfFrontmatter = result.lastIndexOf('---')
      const insertPosition = lastIndexOfFrontmatter === -1 ? 0 : lastIndexOfFrontmatter + 3

      return `${result.slice(0, insertPosition)}\n${scriptSetupTemplate}\n${result.slice(insertPosition)}`
    },
  }
}

import { File, useStore, useVueImportMap } from '@vue/repl'
import { generateImportMap } from './import-map'

interface GenerateStoreOptions {
  tinyRobotVersion?: string
  vueVersion?: string
  files?: (File | { filename: string; code: string })[]
  extraImports?: Record<string, string>
}

export const generateStore = (options: GenerateStoreOptions) => {
  const { files, tinyRobotVersion = 'latest', vueVersion: vueVersion_ = 'latest', extraImports } = options

  const { importMap: builtinImportMap, vueVersion, productionMode } = useVueImportMap()

  vueVersion.value = vueVersion_
  productionMode.value = true

  const store = useStore({
    // pre-set import map
    builtinImportMap,
    vueVersion,
  })

  if (files && files.length > 0) {
    for (const file of files) {
      // Package CSS is loaded by src/index.css; browser import maps only resolve JavaScript.
      const code = file.code.replace(
        /^\s*import\s+['"]@opentiny\/tiny-robot(?:-chat)?\/dist\/style\.css['"];?\s*$/gm,
        '',
      )
      store.addFile(new File(file.filename, code))
    }
    store.setActive(files[0].filename)
  }

  const importMap = generateImportMap({
    tinyRobotVersion,
    builtinImportMap: builtinImportMap.value,
    extraImports,
  })
  store.setImportMap(importMap)

  return {
    store,
    builtinImportMap,
    vueVersion,
  }
}

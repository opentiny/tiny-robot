import { File, useStore, useVueImportMap } from '@vue/repl'
import { generateImportMap } from './import-map'

interface GenerateStoreOptions {
  tinyRobotVersion: string
  vueVersion?: string
  files?: (File | { filename: string; code: string })[]
}

export const generateStore = (options: GenerateStoreOptions) => {
  const { files, tinyRobotVersion, vueVersion: vueVersion_ = 'latest' } = options

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
      store.addFile(file instanceof File ? file : new File(file.filename, file.code))
    }
    store.setActive(files[0].filename)
  }

  const importMap = generateImportMap({
    tinyRobotVersion,
    builtinImportMap: builtinImportMap.value,
  })
  store.setImportMap(importMap)

  return {
    store,
    builtinImportMap,
    vueVersion,
  }
}

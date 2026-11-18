// Match Vue's defaults so non-Vue hosts need no framework-specific build definitions.
const flags = globalThis as typeof globalThis & {
  __VUE_OPTIONS_API__?: boolean
  __VUE_PROD_DEVTOOLS__?: boolean
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__?: boolean
}
flags.__VUE_OPTIONS_API__ ??= true
flags.__VUE_PROD_DEVTOOLS__ ??= false
flags.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ ??= false

export {}

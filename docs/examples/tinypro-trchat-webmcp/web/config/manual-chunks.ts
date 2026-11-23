const VUE_CHUNK_PACKAGES = new Set([
  'vue',
  'vue-router',
  'pinia',
  '@vueuse/core',
  'vue-i18n',
])

export function vueManualChunk(id: string) {
  const normalized = id.replaceAll('\\', '/')
  const marker = '/node_modules/'
  const index = normalized.lastIndexOf(marker)
  if (index === -1)
    return

  const rest = normalized.slice(index + marker.length)
  const name = rest.startsWith('@')
    ? rest.split('/').slice(0, 2).join('/')
    : rest.split('/')[0]
  if (VUE_CHUNK_PACKAGES.has(name))
    return 'vue'
}

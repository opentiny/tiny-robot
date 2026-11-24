import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch, type ComputedRef } from 'vue'
import type { SkillDefinition, SkillResourceDescriptor } from '../skill-import-form/index.type'
import { getMarkdownItAndDompurify } from '../bubble/utils'

export type SkillContentKind = 'markdown' | 'text' | 'binary'

interface UseSkillContentOptions {
  currentDefinition: ComputedRef<SkillDefinition>
  selectedResource: ComputedRef<SkillResourceDescriptor | undefined>
}

export function useSkillContent(options: UseSkillContentOptions) {
  const contentKind = ref<SkillContentKind>('markdown')
  const textContent = ref('')
  const contentLoading = ref(false)
  const contentError = ref(false)
  const resourceUrl = ref('')
  const markdownRuntime = shallowRef<Awaited<ReturnType<typeof getMarkdownItAndDompurify>>>(null)
  let readGeneration = 0

  const renderedMarkdown = computed(() => {
    if (!markdownRuntime.value || contentKind.value !== 'markdown') return ''
    const rendered = markdownRuntime.value.markdown({ html: false, linkify: true }).render(textContent.value)
    return markdownRuntime.value.dompurify.sanitize(rendered)
  })

  const isMarkdownFile = (path: string) => /\.(md|markdown|mdx)$/i.test(path)

  const releaseResourceUrl = () => {
    if (!resourceUrl.value) return
    URL.revokeObjectURL(resourceUrl.value)
    resourceUrl.value = ''
  }

  watch(
    [options.selectedResource, () => options.currentDefinition.value.instructions],
    async ([resource, instructions]) => {
      const generation = ++readGeneration
      releaseResourceUrl()
      contentError.value = false
      contentLoading.value = Boolean(resource)
      contentKind.value =
        resource?.kind === 'binary' ? 'binary' : resource && !isMarkdownFile(resource.path) ? 'text' : 'markdown'
      textContent.value = resource ? '' : instructions

      if (!resource) return

      try {
        if (resource.kind === 'text') {
          const content = resource.text ?? (resource.readText ? await resource.readText() : '')
          if (generation !== readGeneration) return
          textContent.value = content
        } else {
          const binary = resource.binary ?? (resource.readBinary ? await resource.readBinary() : new Uint8Array())
          if (generation !== readGeneration) return
          const ownedBytes = new Uint8Array(binary.byteLength)
          ownedBytes.set(binary)
          const blob = new Blob([ownedBytes.buffer], { type: resource.mimeType || 'application/octet-stream' })
          resourceUrl.value = URL.createObjectURL(blob)
        }
      } catch {
        if (generation === readGeneration) contentError.value = true
      } finally {
        if (generation === readGeneration) contentLoading.value = false
      }
    },
    { immediate: true },
  )

  onMounted(async () => {
    markdownRuntime.value = await getMarkdownItAndDompurify()
  })

  onBeforeUnmount(() => {
    readGeneration += 1
    releaseResourceUrl()
  })

  return {
    contentKind,
    textContent,
    contentLoading,
    contentError,
    resourceUrl,
    renderedMarkdown,
  }
}

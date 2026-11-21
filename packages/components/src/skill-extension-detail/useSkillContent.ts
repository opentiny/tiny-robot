import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch, type ComputedRef } from 'vue'
import type { SkillDefinition, SkillResourceDescriptor } from '../skill-import-form/index.type'
import { getMarkdownItAndDompurify } from '../bubble/utils'

type SkillContentKind = 'markdown' | 'text' | 'binary'
type SkillEditingMode = 'visual' | 'source'

interface UseSkillContentOptions {
  currentDefinition: ComputedRef<SkillDefinition>
  selectedResource: ComputedRef<SkillResourceDescriptor | undefined>
  mode: ComputedRef<'view' | 'edit' | undefined>
  onSave: (definition: SkillDefinition) => void
}

export function useSkillContent(options: UseSkillContentOptions) {
  const draftContent = ref('')
  const isEditing = ref(false)
  const contentKind = ref<SkillContentKind>('markdown')
  const editingMode = ref<SkillEditingMode>('visual')
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

  const canEditSelectedFile = computed(() => options.mode.value === 'edit')
  const hasUnsavedChanges = computed(() => isEditing.value && draftContent.value !== textContent.value)

  const isMarkdownFile = (path: string) => /\.(md|markdown|mdx)$/i.test(path)

  const releaseResourceUrl = () => {
    if (!resourceUrl.value) return
    URL.revokeObjectURL(resourceUrl.value)
    resourceUrl.value = ''
  }

  const startEditing = () => {
    if (
      !canEditSelectedFile.value ||
      contentLoading.value ||
      contentError.value ||
      options.selectedResource.value?.kind === 'binary'
    )
      return
    draftContent.value = textContent.value
    editingMode.value = contentKind.value === 'markdown' ? 'visual' : 'source'
    isEditing.value = true
  }

  const updateDraftContent = (content: string) => {
    draftContent.value = content
  }

  const cancelEditing = () => {
    draftContent.value = textContent.value
    isEditing.value = false
  }

  const saveEditing = () => {
    if (!canEditSelectedFile.value || options.selectedResource.value?.kind === 'binary') return

    const content = draftContent.value
    const selectedResource = options.selectedResource.value
    const resources = options.currentDefinition.value.resources ?? []
    const definition = selectedResource
      ? {
          ...options.currentDefinition.value,
          resources: resources.map((resource) =>
            resource.resourceId === selectedResource.resourceId
              ? {
                  ...resource,
                  text: content,
                  readText: async () => content,
                  size: new Blob([content]).size,
                  lastModified: Date.now(),
                }
              : resource,
          ),
        }
      : { ...options.currentDefinition.value, instructions: content }

    draftContent.value = content
    textContent.value = content
    options.onSave(definition)
    isEditing.value = false
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
    draftContent,
    isEditing,
    contentKind,
    editingMode,
    textContent,
    contentLoading,
    contentError,
    resourceUrl,
    renderedMarkdown,
    canEditSelectedFile,
    hasUnsavedChanges,
    startEditing,
    updateDraftContent,
    cancelEditing,
    saveEditing,
  }
}

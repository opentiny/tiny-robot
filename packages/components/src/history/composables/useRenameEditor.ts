import { onClickOutside } from '@vueuse/core'
import { computed, nextTick, ref, shallowRef, watch, type Ref } from 'vue'

export interface UseRenameEditorProps<T extends { title: string }> {
  renameControlOnClickOutside?: 'confirm' | 'cancel' | 'none'
  onItemTitleChange: (newTitle: string, item: T) => void
  resolveItem?: (item: T) => T | undefined
}

export interface UseRenameEditorReturn<T extends { title: string }> {
  editingItem: Ref<T | undefined>
  editorRefList: Ref<HTMLInputElement[] | null>
  editorConfirmRefList: Ref<HTMLButtonElement[] | null>
  editorCancelRefList: Ref<HTMLButtonElement[] | null>
  editorValue: Ref<string>
  handleEdit: (item: T) => void
  handleEditCancel: () => void
  handleEditConfirm: () => void
}

export const useRenameEditor = <T extends { title: string }>({
  renameControlOnClickOutside,
  onItemTitleChange,
  resolveItem,
}: UseRenameEditorProps<T>): UseRenameEditorReturn<T> => {
  const editingTarget = shallowRef<T | undefined>(undefined)
  const editingItem = computed(() => {
    const target = editingTarget.value
    if (!target) return undefined

    return resolveItem ? resolveItem(target) : target
  })
  const editorRefList = ref<HTMLInputElement[] | null>(null)
  const editorRef = computed(() => editorRefList.value?.at(0))
  const editorConfirmRefList = ref<HTMLButtonElement[] | null>(null)
  const editorConfirmRef = computed(() => editorConfirmRefList.value?.at(0))
  const editorCancelRefList = ref<HTMLButtonElement[] | null>(null)
  const editorCancelRef = computed(() => editorCancelRefList.value?.at(0))
  const editorValue = ref<string>('')

  const handleEdit = (item: T) => {
    editingTarget.value = item
    editorValue.value = item.title
    nextTick(() => {
      const input = editorRef.value
      if (input) {
        input.focus()
        input.select() // 全选文本
      }
    })
  }

  const handleEditCancel = () => {
    editingTarget.value = undefined
    editorValue.value = ''
  }

  const handleEditConfirm = () => {
    const item = editingItem.value
    if (item) {
      onItemTitleChange(editorValue.value, item)
    }
    handleEditCancel()
  }

  watch(
    editingItem,
    (item, previousItem) => {
      if (previousItem && !item) {
        handleEditCancel()
      }
    },
    { flush: 'sync' },
  )

  if (renameControlOnClickOutside === 'confirm' || renameControlOnClickOutside === 'cancel') {
    onClickOutside(
      editorRef,
      () => {
        if (renameControlOnClickOutside === 'confirm') {
          handleEditConfirm()
        } else {
          handleEditCancel()
        }
      },
      { ignore: [editorConfirmRef, editorCancelRef] },
    )
  }

  return {
    editingItem,
    editorRefList,
    editorConfirmRefList,
    editorCancelRefList,
    editorValue,
    handleEdit,
    handleEditCancel,
    handleEditConfirm,
  }
}

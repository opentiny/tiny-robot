import { onClickOutside } from '@vueuse/core'
import { computed, nextTick, ref, type Ref } from 'vue'

export interface UseRenameEditorProps<T extends { title: string }> {
  renameControlOnClickOutside?: 'confirm' | 'cancel' | 'none'
  onItemTitleChange: (newTitle: string, item: T) => void
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
}: UseRenameEditorProps<T>): UseRenameEditorReturn<T> => {
  const editingItem = ref<T | undefined>(undefined) as Ref<T | undefined>
  const editorRefList = ref<HTMLInputElement[] | null>(null)
  const editorRef = computed(() => editorRefList.value?.at(0))
  const editorConfirmRefList = ref<HTMLButtonElement[] | null>(null)
  const editorConfirmRef = computed(() => editorConfirmRefList.value?.at(0))
  const editorCancelRefList = ref<HTMLButtonElement[] | null>(null)
  const editorCancelRef = computed(() => editorCancelRefList.value?.at(0))
  const editorValue = ref<string>('')

  const handleEdit = (item: T) => {
    editingItem.value = item
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
    editingItem.value = undefined
    editorValue.value = ''
  }

  const handleEditConfirm = () => {
    if (editingItem.value) {
      onItemTitleChange(editorValue.value, editingItem.value)
    }
    editingItem.value = undefined
    editorValue.value = ''
  }

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

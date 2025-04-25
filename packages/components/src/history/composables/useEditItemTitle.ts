import { onClickOutside } from '@vueuse/core'
import { ComponentPublicInstance, nextTick, ref, watchEffect } from 'vue'
import { HistoryEvents, HistoryItem } from '../index.type'

export const useEditItemTitle = (emit: HistoryEvents) => {
  const editingItem = ref<Pick<HistoryItem, 'id' | 'title'> & { rawData: HistoryItem }>()

  const handleEdit = (item: HistoryItem) => {
    editingItem.value = {
      id: item.id,
      title: item.title,
      rawData: item,
    }
  }

  const inputRef = ref<HTMLInputElement | null>(null)

  const handleEditorInputRef = (el: Element | ComponentPublicInstance | null) => {
    if (!el) {
      return
    }

    nextTick(() => {
      inputRef.value = el as HTMLInputElement
      inputRef.value.focus()
    })
  }

  let stopFn: (() => void) | undefined = undefined

  const handleConfirm = () => {
    if (editingItem.value) {
      if (editingItem.value.title !== editingItem.value.rawData.title) {
        const { title, rawData } = editingItem.value
        emit('item-title-change', title, rawData)
      }
      editingItem.value = undefined
    }

    stopFn?.()
    stopFn = undefined
  }

  const handleCancel = () => {
    editingItem.value = undefined
    stopFn?.()
    stopFn = undefined
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  watchEffect(() => {
    if (!inputRef.value) {
      return
    }

    stopFn?.()
    stopFn = onClickOutside(inputRef, () => {
      handleConfirm()
    })
  })

  return {
    editingItem,
    handleEdit,
    handleEditorInputRef,
    handleKeyDown,
  }
}

import { ref } from 'vue'

export function useHistoryState() {
  const isManagementMode = ref(false)
  const searchQuery = ref('')
  const selectedItems = ref<string[]>([])

  function toggleItemSelection(id: string) {
    const idx = selectedItems.value.indexOf(id)
    if (idx === -1) selectedItems.value.push(id)
    else selectedItems.value.splice(idx, 1)
  }

  function selectAll(ids: string[]) {
    selectedItems.value = [...ids]
  }

  function clearSelection() {
    selectedItems.value = []
    searchQuery.value = ''
  }

  return {
    isManagementMode,
    searchQuery,
    selectedItems,
    toggleItemSelection,
    selectAll,
    clearSelection,
  }
}

export type UseHistoryStateReturn = ReturnType<typeof useHistoryState>

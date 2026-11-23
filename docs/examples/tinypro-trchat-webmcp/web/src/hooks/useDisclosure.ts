import { ref } from 'vue'

export function useDisclosure() {
  const open = ref(false)
  const onClose = () => {
    open.value = false
  }
  const onOpen = () => {
    open.value = true
  }
  return {
    open,
    onClose,
    onOpen,
  }
}

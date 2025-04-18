import { nextTick, Ref } from 'vue'

export const useElementScroll = (elemRef: Ref<HTMLElement | null | undefined>) => {
  const scrollToBottom = () => {
    nextTick(() => {
      elemRef.value?.scrollTo({
        top: elemRef.value.scrollHeight,
        behavior: 'smooth',
      })
    })
  }

  return { scrollToBottom }
}

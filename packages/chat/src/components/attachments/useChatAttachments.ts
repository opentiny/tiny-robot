import { getCurrentScope, onScopeDispose, ref, type Ref } from 'vue'
import type { Attachment } from '@opentiny/tiny-robot'
import { detectFileType } from '@/shared/attachments'
import type { UseChatAttachmentsOptions } from '@/types'

function normalizeAttachment(file: File): Attachment {
  return {
    rawFile: file,
    url: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    fileType: detectFileType(file),
    status: 'success',
  }
}

export function useChatAttachments(options: UseChatAttachmentsOptions = {}) {
  const items = ref<Attachment[]>([...(options.initialItems ?? [])])
  const ownedObjectUrls = new Set<string>()

  function registerOwnedObjectUrl(item: Attachment) {
    if (typeof item.url === 'string' && item.url) {
      ownedObjectUrls.add(item.url)
    }
  }

  function revokeOwnedObjectUrl(item: Attachment) {
    if (typeof item.url !== 'string' || !ownedObjectUrls.has(item.url)) {
      return
    }

    URL.revokeObjectURL(item.url)
    ownedObjectUrls.delete(item.url)
  }

  function revokeRemovedItems(nextItems: Attachment[]) {
    const nextUrls = new Set(
      nextItems.map((item) => item.url).filter((url): url is string => typeof url === 'string' && url.length > 0),
    )

    for (const item of items.value) {
      if (typeof item.url === 'string' && !nextUrls.has(item.url)) {
        revokeOwnedObjectUrl(item)
      }
    }
  }

  function addFiles(files: File[]) {
    const nextItems = files.map(normalizeAttachment)
    nextItems.forEach(registerOwnedObjectUrl)
    items.value.push(...nextItems)
  }

  function setItems(nextItems: Attachment[]) {
    revokeRemovedItems(nextItems)
    items.value = [...nextItems]
  }

  function removeItem(target: Attachment) {
    revokeOwnedObjectUrl(target)
    items.value = items.value.filter((item) => item !== target)
  }

  function clear() {
    items.value.forEach(revokeOwnedObjectUrl)
    items.value = []
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      clear()
    })
  }

  return {
    items,
    addFiles,
    setItems,
    removeItem,
    clear,
  }
}

export interface UseChatAttachmentsReturn {
  items: Ref<Attachment[]>
  addFiles: (files: File[]) => void
  setItems: (items: Attachment[]) => void
  removeItem: (item: Attachment) => void
  clear: () => void
}

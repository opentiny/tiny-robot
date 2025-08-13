<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useUndoRedo } from '../composables/useUndoRedo'
import type { UserItem } from '../index.type'
import type {
  CreateItem,
  EditorRange,
  ExtendedTextItem,
  SelectedItem,
  StructuredDataItem,
  TemplateItem,
  TextItem,
} from '../types/editor.type'
import Block from './Block.vue'

const SUPPORTS_SHADOW_SELECTION = typeof window.ShadowRoot.prototype.getSelection === 'function'
const SUPPORTS_COMPOSED_RANGES = typeof window.Selection.prototype.getComposedRanges === 'function'

function isSafari() {
  const ua = navigator.userAgent
  const isSafari = ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Chromium') && !ua.includes('CriOS')
  return isSafari
}

const isSafariBrowser = isSafari()

const randomId = () => Math.random().toString(36).substring(2, 15)

const ZERO_WIDTH_CHAR = '\u200B'
const PLACEHOLDER = ZERO_WIDTH_CHAR
const PREFIX = ZERO_WIDTH_CHAR
const SUFFIX = ZERO_WIDTH_CHAR

const model = defineModel<UserItem[]>({ default: () => [] })

const emit = defineEmits<{
  (e: 'submit'): void
}>()

const forceRerender = ref(0)

/**
 * 将用户数据结构转换为内部数据结构
 * @param items 用户数据结构
 * @returns 内部数据结构
 */
const transformUserToInternal = (items: UserItem[]): (TextItem | TemplateItem)[] => {
  return items.map((item) => {
    return {
      id: item.id || randomId(),
      ...(item.type === 'template' ? { ...item, prefix: PREFIX, suffix: SUFFIX } : item),
    } as TextItem | TemplateItem
  })
}

/**
 * 将内部数据结构转换为用户数据结构
 * @param items 内部数据结构
 * @returns 用户数据结构
 */
const transformInternalToUser = (items: (TextItem | TemplateItem)[]): UserItem[] => {
  return items.map((item) => ({ id: item.id, type: item.type, content: item.content }))
}

const originalData = ref<(TextItem | TemplateItem)[]>(transformUserToInternal(model.value || []))

// 设置originalData实际上是3个步骤
// 1. 记录旧值的 selectionRange (rangeMap.set)
// 2. 设置originalData (setOriginalData)
// 3. 提交历史记录 (history.commit)
// 特殊情况: 在 history undo redo 中，不需要3步骤。否则历史记录会重复
const setOriginalData = (items: (TextItem | TemplateItem)[]) => {
  originalData.value = items
}

const originalDataForUI = computed(() => {
  const first: (TextItem | TemplateItem)[] = []
  const last: (TextItem | TemplateItem)[] = []
  const items = originalData.value

  // 首尾的空text如果和template相邻，则将空text转换成PLACEHOLDER
  if (items.length >= 2) {
    const originalDataFirstItem = items[0]
    const second = items[1]
    if (
      originalDataFirstItem.type === 'text' &&
      originalDataFirstItem.content.length === 0 &&
      second.type === 'template'
    ) {
      first.push({ ...originalDataFirstItem, content: PLACEHOLDER })
    }

    const originalDataLastItem = items[items.length - 1]
    const secondLast = items[items.length - 2]
    if (
      originalDataLastItem.type === 'text' &&
      originalDataLastItem.content.length === 0 &&
      secondLast.type === 'template'
    ) {
      last.push({ ...originalDataLastItem, content: PLACEHOLDER })
    }
  }

  // 如果第一个元素是template，则添加一个空text
  if (items.length > 0 && items[0].type === 'template') {
    first.push({ type: 'text', content: PLACEHOLDER, id: randomId() })
  }

  // 如果最后一个元素是template，则添加一个空text
  if (items.length > 0 && items[items.length - 1].type === 'template') {
    last.push({ type: 'text', content: PLACEHOLDER, id: randomId() })
  }

  // 如果首尾text有实际内容，则删除placeholder
  const regex = new RegExp(PLACEHOLDER, 'g')
  if (items.length > 0) {
    if (items[0].content !== PLACEHOLDER) {
      items[0].content = items[0].content.replace(regex, '')
    }
    if (items[items.length - 1].content !== PLACEHOLDER) {
      items[items.length - 1].content = items[items.length - 1].content.replace(regex, '')
    }
  }

  return first.concat(items).concat(last)
})

const flattenedData = computed<ExtendedTextItem[]>(() => {
  return originalData.value
    .map((item) => {
      if (item.type === 'template') {
        return [
          { id: item.id, type: 'prefix', content: item.prefix },
          { id: item.id, type: 'template', content: item.content },
          { id: item.id, type: 'suffix', content: item.suffix },
        ] satisfies ExtendedTextItem[]
      }
      return [item]
    })
    .flat()
})

const structuredData = computed<StructuredDataItem[]>(() => {
  return originalDataForUI.value.map((item) => {
    if (item.type === 'text') {
      return item
    }

    if (isSafariBrowser) {
      return {
        id: item.id,
        type: 'block',
        asChild: true,
        content: [
          { id: item.id, type: 'prefix', content: item.prefix },
          {
            id: item.id,
            type: 'block',
            content: [
              { id: item.id, type: 'template', content: item.content },
              { id: item.id, type: 'suffix', content: item.suffix },
            ],
          },
        ],
      }
    }

    return {
      id: item.id,
      type: 'block',
      asChild: true,
      content: [
        {
          id: item.id,
          type: 'block',
          content: [
            { id: item.id, type: 'prefix', content: item.prefix },
            { id: item.id, type: 'template', content: item.content },
          ],
        },
        { id: item.id, type: 'suffix', content: item.suffix },
      ],
    }
  })
})

const editorRef = ref<HTMLDivElement | null>(null)

const serializeWithTimestamp = (obj: unknown) => {
  const timestamp = Date.now()
  const data = JSON.stringify(obj)
  return `${timestamp}:${data}`
}

const parseSerializedData = (serialized: string) => {
  const timestamp = parseInt(serialized.slice(0, 13))
  const data = JSON.parse(serialized.slice(14))
  return {
    timestamp,
    data,
  }
}

const rangeMap = new Map<string, EditorRange>()
const history = useUndoRedo<string>(serializeWithTimestamp(originalData.value), {
  onRemoveHistory: (list) => {
    for (const item of list) {
      rangeMap.delete(item)
    }
  },
})

watch(
  () => model.value,
  (newModel) => {
    // 将新的 model 转换为内部数据格式
    const newInternalData = transformUserToInternal(newModel || [])

    // TODO 有没有其他更好的方法来判断是否是内部更新？
    // 比较新数据与当前内部数据是否相同，如果相同说明是内部更新触发的
    // 这里比较的是转换后的内部数据，因为内部更新时 model.value 是从 originalData.value 转换而来的
    const isInternalUpdate = JSON.stringify(newInternalData) === JSON.stringify(originalData.value)

    if (isInternalUpdate) {
      return
    }

    // 外部更新
    if (editorRef.value) {
      const selectionRange = getSelectionRange(editorRef.value)
      if (selectionRange) {
        rangeMap.set(history.get(), transformRange(selectionRange))
      }
    }
    setOriginalData(newInternalData)
    history.commit(serializeWithTimestamp(originalData.value))
  },
  { deep: true },
)

// 查找祖先节点中有 data-id 的元素
const findAncestorWithDataId = (node: Node, topElement: HTMLElement = document.body): HTMLElement | null => {
  if (!topElement.contains(node)) {
    return null
  }

  if (node instanceof HTMLElement && node.dataset.id) {
    return node
  }
  return node.parentElement ? findAncestorWithDataId(node.parentElement, topElement) : null
}

const isEditor = (node: Node) => {
  return node === editorRef.value
}

interface CompatibleSelection extends Omit<Selection, 'getComposedRanges'> {
  getComposedRanges?: (options?: { shadowRoots: ShadowRoot[] } | ShadowRoot) => StaticRange[]
}

const getSelectionRange = (el: Element) => {
  const selection = window.getSelection() as CompatibleSelection | null

  if (!selection) {
    return null
  }

  const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null
  const rootNode = el.getRootNode()

  // 非 shadow dom，直接使用 selection.getRangeAt(0)
  if (!(rootNode instanceof ShadowRoot)) {
    return range
  }

  // 下面是 shadow dom 的逻辑

  // chrome 和 safari 都支持 getComposedRanges，可以穿透 shadow dom。不过参数结构稍有不同
  // MDN 文档中描述的参数结构在 chrome 中可行。https://developer.mozilla.org/en-US/docs/Web/API/Selection/getComposedRanges
  // safari 使用是直接传入 shadowRoot。来源：https://github.com/WebKit/WebKit/blob/main/LayoutTests/fast/shadow-dom/selection-getComposedRanges.html
  if (SUPPORTS_COMPOSED_RANGES) {
    const composedRanges = selection.getComposedRanges!(isSafariBrowser ? rootNode : { shadowRoots: [rootNode] })
    return composedRanges?.[0] ?? null
  }

  if (SUPPORTS_SHADOW_SELECTION) {
    const shadowSelection = rootNode.getSelection!()
    return shadowSelection.rangeCount > 0 ? shadowSelection.getRangeAt(0) : null
  }

  return range
}

const getNodeAndOffset = (el: Element, offset: number) => {
  if (!el.firstChild || el.firstChild.nodeType !== Node.TEXT_NODE) {
    // el.firstChild is not a text node. set anchor and focus to the element with offset 0
    return { node: el, offset: 0 }
  }

  const contentLength = el.firstChild.textContent?.length ?? 0

  return { node: el.firstChild, offset: Math.min(offset, contentLength) }
}

const setCaretPosition = (startEl: Element, startOffset: number, endEl?: Element | null, endOffset?: number) => {
  const selection = window.getSelection()
  if (!selection) {
    return
  }

  const { node: startNode, offset: startNodeOffset } = getNodeAndOffset(startEl, startOffset)

  // TODO firefox 设置光标位置可能报错
  // 英文文档中描述了此方法可以穿透 shadow dom，中文文档没有这些描述。https://developer.mozilla.org/en-US/docs/Web/API/Selection/setBaseAndExtent

  if (!endEl) {
    selection.setBaseAndExtent(startNode, startNodeOffset, startNode, startNodeOffset)
    return
  }

  const { node: endNode, offset: endNodeOffset } = getNodeAndOffset(endEl, endOffset ?? 0)

  selection.setBaseAndExtent(startNode, startNodeOffset, endNode, endNodeOffset)
}

const insertNewTextAndSetCaretPosition = (content: string, insertAfter?: string) => {
  const id = randomId()
  const textItem: TextItem = { id, type: 'text', content }

  if (insertAfter) {
    const index = originalData.value.findIndex((item) => item.id === insertAfter)
    if (index !== -1) {
      setOriginalData(
        originalData.value
          .slice(0, index + 1)
          .concat(textItem)
          .concat(originalData.value.slice(index + 1)),
      )
      history.commit(serializeWithTimestamp(originalData.value))
    } else {
      console.warn(`can not find item with id: ${insertAfter}`)
    }
  } else {
    setOriginalData([textItem as TextItem | TemplateItem].concat(originalData.value))
    history.commit(serializeWithTimestamp(originalData.value))
  }

  nextTick(() => {
    const el = editorRef.value?.querySelector(`[data-id="${id}"][data-type="text"]`)
    if (el) {
      setCaretPosition(el, content.length)
    }
  })

  model.value = transformInternalToUser(originalData.value)
}

const compositionContext = ref<{ hasStarted: boolean; range: EditorRange | null }>({
  hasStarted: false,
  range: null,
})

const handleBeforeInput = (e: Event) => {
  const ev = e as InputEvent
  e.preventDefault()

  const { inputType } = ev
  // inputData 过滤掉分隔符
  const inputData = (ev.data || ev.dataTransfer?.getData('text/plain') || '').replace(PREFIX, '').replace(SUFFIX, '')

  const range = ev.getTargetRanges()[0] as StaticRange | undefined

  // https://w3c.github.io/input-events/#overview
  // 1. isnert. 有 data 或者 dataTransfer 的 inputType
  // - ✅ insertText 插入文本。TODO 两个分隔符中间插入文本
  // - ✅ insertCompositionText 无法 preventDefault 拦截
  // - ✅ insertFromPaste
  // - ❌ insertFromPasteAsQuotation 粘贴为引用，很少见的功能。不处理
  // - ❌ insertFromDrop 不处理
  // - ✅ insertReplacementText 通常出现在：自动更正、输入建议（autocomplete）、拼写纠错、操作系统层面的文字替换
  // - ❌ insertFromYank 剪贴板中粘贴最近剪切的内容，很少见。不处理

  // 2. delete
  // - ✅ deleteContentBackward
  // - ✅ deleteContentForward
  // - ✅ deleteWordBackward
  // - ✅ deleteWordForward
  // - ✅ deleteSoftLineBackward
  // - ✅ deleteSoftLineForward
  // - ✅ deleteByCut

  // 3. ✅ history 使用 keydown 快捷键处理
  // - historyUndo
  // - historyRedo

  if (!range) {
    console.warn('range is null', range)
    return
  }

  const inputTypes = [
    'insertText',
    'insertFromPaste',
    'insertReplacementText',
    'deleteContentBackward',
    'deleteContentForward',
    'deleteWordBackward',
    'deleteWordForward',
    'deleteSoftLineBackward',
    'deleteSoftLineForward',
    'deleteByCut',
  ]
  // 在没有选中文本的情况下，delete 也可能有 range（collapsed 为 false），
  // 但是我撤销这次 delete 后，不想因为这个 range 而导致有文本被选中。所以使用 getSelectionRange
  const selectionRange = getSelectionRange(editorRef.value!)

  if (inputTypes.includes(inputType)) {
    if (inputData && isEditor(range.startContainer) && isEditor(range.endContainer)) {
      if (selectionRange) {
        rangeMap.set(history.get(), transformRange(selectionRange))
      }

      // 输入框为空，直接插入
      insertNewTextAndSetCaretPosition(inputData)
      return
    }

    const transformedRange = transformRange(range)
    if (transformedRange.startId && transformedRange.endId) {
      if (selectionRange) {
        rangeMap.set(history.get(), transformRange(selectionRange))
      }

      processInput(transformedRange, inputType, inputData)
    } else {
      console.warn('range is not valid, range:', transformedRange)
    }
  } else if (inputType === 'insertCompositionText' && compositionContext.value.hasStarted) {
    // 合成输入已启动
    compositionContext.value = { hasStarted: false, range: transformRange(range) }
  }
}

const transformRange = (range: StaticRange): EditorRange => {
  const startEl = findAncestorWithDataId(range.startContainer, editorRef.value!)
  const endEl = findAncestorWithDataId(range.endContainer, editorRef.value!)

  return {
    collapsed: range.collapsed,
    endContainer: range.endContainer,
    endId: endEl?.dataset.id,
    endEl,
    endOffset: range.endOffset,
    endType: endEl?.dataset.type,
    startContainer: range.startContainer,
    startId: startEl?.dataset.id,
    startEl,
    startOffset: range.startOffset,
    startType: startEl?.dataset.type,
  }
}

const insertToText = (text: string, insertedText: string, startOffset: number, endOffset: number) => {
  return text.slice(0, startOffset) + insertedText + text.slice(endOffset)
}

const processInput = (range: EditorRange, inputType: string, inputData: string) => {
  const selected = getSelected(range)

  if (!Array.isArray(selected) || selected.length === 0) {
    return
  }

  const selectedOrCreateItems = transformSelected(selected, range, inputType, inputData)

  if (selectedOrCreateItems.some((item) => (item as CreateItem).tag === 'new')) {
    const { afterId, content } = selectedOrCreateItems[0] as CreateItem
    insertNewTextAndSetCaretPosition(content, afterId)
    return
  }

  const selectedItems = selectedOrCreateItems as SelectedItem[]

  const toDeletedTemplate: string[] = []

  for (const [index, item] of selectedItems.entries()) {
    const dataItem = originalData.value.find((i) => i.id === item.id)

    const insertedText = index === 0 ? inputData : ''

    if (dataItem) {
      if (dataItem.type === 'text') {
        dataItem.content = insertToText(dataItem.content, insertedText, item.startOffset, item.endOffset)
      } else if (dataItem.type === 'template') {
        if (item.type === 'prefix' || item.type === 'suffix') {
          if (item.startOffset === 0 && item.endOffset === 1 && insertedText.length === 0) {
            dataItem[item.type] = ''
          } else {
            console.warn(`${item.type} can not be inserted text. it only can be deleted`, item)
          }
        } else {
          if (item.startOffset < 0 || item.endOffset > dataItem.content.length) {
            toDeletedTemplate.push(dataItem.id)
          } else {
            dataItem.content = insertToText(dataItem.content, insertedText, item.startOffset, item.endOffset)
          }
        }
      } else {
        console.warn('dataItem.type is not text or template', dataItem)
      }
    } else {
      console.warn('can not find dataItem', item)
    }
  }

  // 删除template
  let newOriginalData = originalData.value.filter((item) => !toDeletedTemplate.includes(item.id))

  // 下面的逻辑是为了不让template位于首尾
  // 先删除空template
  newOriginalData = newOriginalData.filter((item) => {
    return !(item.type === 'template' && [item.prefix, item.suffix, item.content].join('').length === 0)
  })

  const toDeletedText = new Set<string>()

  newOriginalData.forEach((item, index, arr) => {
    if (arr.length >= 2) {
      if (index === 0 || index === 1) {
        const first = arr[0]
        const second = arr[1]

        if (first.type === 'text' && first.content.length === 0 && second.type === 'template') {
          return
        }
      }

      if (index === arr.length - 2 || index === arr.length - 1) {
        const last = arr[arr.length - 1]
        const secondLast = arr[arr.length - 2]

        if (last.type === 'text' && last.content.length === 0 && secondLast.type === 'template') {
          return
        }
      }
    }

    if (item.type === 'text' && item.content.length === 0) {
      toDeletedText.add(item.id)
    }
  })

  // 再删除空text
  newOriginalData = newOriginalData.filter((item) => !toDeletedText.has(item.id))

  // 恢复分隔符
  for (const dataItem of newOriginalData.filter((item): item is TemplateItem => item.type === 'template')) {
    if (dataItem.prefix.length === 0) {
      dataItem.prefix = PREFIX
    }
    if (dataItem.suffix.length === 0) {
      dataItem.suffix = SUFFIX
    }
  }

  setOriginalData(newOriginalData)
  history.commit(serializeWithTimestamp(originalData.value))

  if (selectedItems.length > 0) {
    // 光标定位
    setCaretPositionBySelected(selectedItems, inputData)
  }

  model.value = transformInternalToUser(originalData.value)
}

// 光标定位
const setCaretPositionBySelected = (selectedItems: SelectedItem[], inputData: string) => {
  const firstItem = selectedItems[0]
  const firstSelector = `[data-id="${firstItem.id}"][data-type="${firstItem.type}"]`
  const restSelectors = selectedItems.slice(1).map((item) => `[data-id="${item.id}"][data-type="${item.type}"]`)
  nextTick(() => {
    const el = editorRef.value?.querySelector(firstSelector)
    if (el) {
      // 如果 firstItem 没有完全被删除
      setCaretPosition(el, firstItem.startOffset + inputData.length)
    } else if (inputData.length === 0) {
      for (const selector of restSelectors) {
        const el = editorRef.value?.querySelector(selector)
        if (el) {
          setCaretPosition(el, 0)
          break
        }
      }
    } else {
      console.warn(`can not find el with selector: ${firstSelector}`)
    }
  })
}

const getSelected = (range: EditorRange): SelectedItem[] | null => {
  const startIndex = flattenedData.value.findIndex((item) => item.id === range.startId && item.type === range.startType)
  const endIndex = flattenedData.value.findIndex((item) => item.id === range.endId && item.type === range.endType)

  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    console.warn('startIndex or endIndex is -1, or startIndex > endIndex. ', { range })
    return null
  }

  const startItem = flattenedData.value[startIndex]
  const endItem = flattenedData.value[endIndex]

  if (startIndex === endIndex) {
    return [
      {
        id: startItem.id,
        type: startItem.type,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
      },
    ]
  }

  const selected = [
    {
      id: startItem.id,
      type: startItem.type,
      startOffset: range.startOffset,
      endOffset: startItem.content.length,
    },
  ]

  for (let i = startIndex + 1; i < endIndex; i++) {
    const item = flattenedData.value[i]
    selected.push({
      id: item.id,
      type: item.type,
      startOffset: 0,
      endOffset: item.content.length,
    })
  }

  selected.push({
    id: endItem.id,
    type: endItem.type,
    startOffset: 0,
    endOffset: range.endOffset,
  })

  return selected
}

const transformSelected = (
  selectedItems: SelectedItem[],
  range: EditorRange,
  inputType: string,
  inputData: string,
): (SelectedItem | CreateItem)[] => {
  const first = selectedItems[0]

  if (first.type !== 'prefix' && first.type !== 'suffix') {
    return selectedItems
  }

  // 下面处理第一个是分隔符的情况

  if (selectedItems.length === 1) {
    // 特例1：如果未选择文本，并且光标在分隔符左侧或右侧，则将光标移动到分隔符前或后
    if (range.collapsed) {
      // 判断分隔符前后位置

      if (range.startOffset === 0) {
        // 往前移，将光标放在前一个文本的末尾
        const previous = moveToPrevious(first, inputData)
        return previous ? [previous] : []
      } else {
        // 往后移，将光标放在后一个文本的开头
        const next = moveToNext(first, inputData)
        return next ? [next] : []
      }
    }

    // 特例2：如果选中文本，并且长度为1且是分隔符。分以下情况：
    // 2.1. inputType 为 input。根据浏览器平台来决定光标往前移还是往后移
    if (inputType.startsWith('insert')) {
      if (isSafariBrowser) {
        const previous = moveToPrevious(first, inputData)
        return previous ? [previous] : []
      } else {
        const next = moveToNext(first, inputData)
        return next ? [next] : []
      }
    }
    // 2.2. inputType 为 delete。如果是 backward，则将光标移动到分隔符前。如果是 forward，则将光标移动到分隔符后
    if (inputType.startsWith('delete')) {
      if (inputType.includes('Backward')) {
        const previous = moveToPrevious(first, inputData, 1)
        return previous ? [previous] : []
      } else if (inputType.includes('Forward')) {
        const next = moveToNext(first, inputData, 1)
        return next ? [next] : []
      } else {
        // 其他情况不处理。目前有 deleteByCut
      }
    }
  }

  // 特例3：如果第一个是分隔符，并且 inputData 不为空，则将光标后移
  if (inputData.length > 0) {
    return selectedItems.slice(1)
  }

  return selectedItems
}

const moveToPrevious = (
  selectedItem: SelectedItem,
  inputData: string,
  deleteCount = 0,
): SelectedItem | CreateItem | null => {
  const index = flattenedData.value.findIndex((item) => item.id === selectedItem.id && item.type === selectedItem.type)
  if (index > 0) {
    const previous = flattenedData.value[index - 1]
    const { id, type, content } = previous
    if (type === 'text' || type === 'template') {
      return {
        id,
        type,
        startOffset: content.length - deleteCount,
        endOffset: content.length,
      }
    } else if (inputData.length > 0) {
      // 光标在两个分隔符中间，需要新建文本
      return { tag: 'new', afterId: id, type: 'text', content: inputData } satisfies CreateItem
    } else {
      console.warn('the previous item is not text or template', { current: selectedItem, previous })
      if (deleteCount === 1) {
        // 光标移动到分隔符左侧
        return { ...selectedItem, endOffset: selectedItem.startOffset }
      }
    }
  } else if (inputData.length > 0) {
    // 移动到了最前端，需要新建文本
    return { tag: 'new', type: 'text', content: inputData } satisfies CreateItem
  } else {
    // 移动到了最前端，没有文本需要删除
    console.warn('the previous item of current is not found', { current: selectedItem })
    return null
  }

  return selectedItem
}

const moveToNext = (
  selectedItem: SelectedItem,
  inputData: string,
  deleteCount = 0,
): SelectedItem | CreateItem | null => {
  const index = flattenedData.value.findIndex((item) => item.id === selectedItem.id && item.type === selectedItem.type)
  if (index < flattenedData.value.length - 1) {
    const next = flattenedData.value[index + 1]
    const { id, type } = next
    if (type === 'text' || type === 'template') {
      return {
        id,
        type,
        startOffset: 0,
        endOffset: 0 + deleteCount,
      }
    } else if (inputData.length > 0) {
      // 光标在两个分隔符中间，需要新建文本
      return { tag: 'new', afterId: selectedItem.id, type: 'text', content: inputData } satisfies CreateItem
    } else {
      console.warn('the next item is not text or template', { current: selectedItem, next })
      if (deleteCount === 1) {
        // 光标移动到分隔符右侧
        return { ...selectedItem, startOffset: selectedItem.endOffset }
      }
    }
  } else if (inputData.length > 0) {
    // 移动到了最末端，需要新建文本
    return { tag: 'new', afterId: selectedItem.id, type: 'text', content: inputData } satisfies CreateItem
  } else {
    // 移动到了最末端，没有文本需要删除
    console.warn('the next item of current is not found', { current: selectedItem })
    return null
  }

  return selectedItem
}

const handleCompositionStart = () => {
  compositionContext.value = { hasStarted: true, range: null }
}

const handleCompositionEnd = (e: CompositionEvent) => {
  const range = compositionContext.value.range
  if (range) {
    if (e.data && isEditor(range.startContainer) && isEditor(range.endContainer)) {
      rangeMap.set(history.get(), transformRange(range))
      // 输入框为空，直接插入
      insertNewTextAndSetCaretPosition(e.data)
    } else if (range.startId && range.endId) {
      rangeMap.set(history.get(), transformRange(range))
      processInput(range, 'insertCompositionText', e.data)
    } else {
      console.warn('range is not valid, range:', range)
    }

    // 由于 composition 事件导致 dom 结构变化，Vue 无法控制，需要强制重新渲染
    forceRerender.value++
  } else {
    console.warn('range is null, compositionEnd:', e)
  }

  compositionContext.value = { hasStarted: false, range: null }
}

const checkIsAppleDevice = () => {
  const ua = navigator.userAgent.toLowerCase()
  return /macintosh|mac os x|iphone|ipad|ipod/.test(ua)
}

const isAppleDevice = checkIsAppleDevice()

const handleKeyDown = (e: KeyboardEvent) => {
  const isUndo =
    (isAppleDevice && e.metaKey && !e.shiftKey && e.key.toLowerCase() === 'z') || // Cmd+Z
    (!isAppleDevice && e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') // Ctrl+Z

  const isRedo =
    (isAppleDevice && e.metaKey && e.shiftKey && e.key.toLowerCase() === 'z') || // Cmd+Shift+z
    (!isAppleDevice && e.ctrlKey && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) // Ctrl+y or Ctrl+Shift+z

  const isSubmit = e.key.toLowerCase() === 'enter'

  if (isUndo) {
    e.preventDefault()

    // 记录当前光标位置，用于恢复时设置光标位置
    const selectionRange = getSelectionRange(editorRef.value!)

    if (selectionRange) {
      rangeMap.set(history.get(), transformRange(selectionRange))
    }

    const historyItem = history.undo()
    if (historyItem) {
      restoreDataAndCaretPosition(historyItem)
    }
  }

  if (isRedo) {
    e.preventDefault()
    const historyItem = history.redo()
    if (historyItem) {
      restoreDataAndCaretPosition(historyItem)
    }
  }

  if (isSubmit) {
    e.preventDefault()
    emit('submit')
  }
}

const restoreDataAndCaretPosition = (historyItem: string) => {
  const { data } = parseSerializedData(historyItem)
  setOriginalData(data)
  if (rangeMap.has(historyItem)) {
    const range = rangeMap.get(historyItem)!
    nextTick(() => {
      const startEl = editorRef.value!.querySelector(`[data-id="${range.startId}"][data-type="${range.startType}"]`)
      const endEl = editorRef.value!.querySelector(`[data-id="${range.endId}"][data-type="${range.endType}"]`)
      if (startEl) {
        setCaretPosition(startEl, range.startOffset, endEl, range.endOffset)
      }
    })
  }

  model.value = transformInternalToUser(originalData.value)
}

/**
 * 将光标移动到指定元素的末尾
 * @param id 元素id
 * @param type 元素类型
 */
const setCaretToElementEnd = (id: string, type: 'text' | 'template') => {
  // 查找目标元素
  const el = editorRef.value?.querySelector(`[data-id="${id}"][data-type="${type}"]`)
  if (!el) return // 元素不存在则直接返回

  // 计算文本长度（作为光标偏移量），设置光标位置
  const offset = el.textContent?.length || 0
  setCaretPosition(el, offset)
}

const activateFirstField = () => {
  if (!editorRef.value) {
    return
  }

  nextTick(() => {
    const data = originalData.value

    // 场景1：存在template类型的项，定位到第一个template元素后面
    const firstTemplateItem = data.find((item) => item.type === 'template')
    if (firstTemplateItem) {
      setCaretToElementEnd(firstTemplateItem.id, 'template')
    }

    // 场景2：仅存在一个text类型的项，定位到该text元素后面
    const onlyTextItem = data.every((item) => item.type === 'text')
    if (onlyTextItem && data.length === 1) {
      setCaretToElementEnd(data[0].id, 'text')
    }
  })
}

const handleClearHistory = () => {
  history.clear()
  rangeMap.clear()
}

// 处理光标移动到首尾空text时的特殊情况
const handleSelectionChange = () => {
  // 如果正在进行合成输入，则不处理
  if (!editorRef.value || compositionContext.value.range) {
    return
  }

  const range = getSelectionRange(editorRef.value!)

  if (range?.collapsed && originalDataForUI.value.length > 0) {
    const editorRange = transformRange(range)

    // 如果选中的是开头的空text，则将光标移动到空text后
    const first = originalDataForUI.value[0]
    if (
      editorRange.startEl &&
      editorRange.startId === first.id &&
      editorRange.startOffset === 0 &&
      first.content === PLACEHOLDER &&
      first.type === 'text'
    ) {
      setCaretPosition(editorRange.startEl, 1)
      return
    }

    // 如果选中的是末尾的空text，则将光标移动到空text前
    const last = originalDataForUI.value[originalDataForUI.value.length - 1]
    if (
      editorRange.endEl &&
      editorRange.endId === last.id &&
      editorRange.endOffset === 1 &&
      last.content === PLACEHOLDER &&
      last.type === 'text'
    ) {
      setCaretPosition(editorRange.endEl, 0)
      return
    }
  }
}

onMounted(() => {
  document.addEventListener('selectionchange', handleSelectionChange)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', handleSelectionChange)
})

defineExpose({
  clearHistory: handleClearHistory,
  activateFirstField,
})
</script>

<template>
  <div class="editor-container">
    <div
      contenteditable="true"
      ref="editorRef"
      :key="forceRerender"
      class="editor"
      @beforeinput="handleBeforeInput"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
      @keydown="handleKeyDown"
    >
      <Block v-for="item in structuredData" :key="`${item.id}-${item.type}`" v-bind="item" />
    </div>
  </div>
</template>

<style lang="less">
:root {
  --tr-sender-template-editor-font-size: 16px;
  --tr-sender-template-block-color: #1476ff;
  --tr-sender-template-block-bg-color: rgba(20, 118, 255, 0.1);
  --tr-sender-template-block-caret-color: #191919;
}
</style>

<style lang="less" scoped>
.editor-container {
  [contenteditable] {
    display: block;
    width: 100%;
    min-height: 26px;
    font-size: var(--tr-sender-template-editor-font-size);
    line-height: 2.5;
    border-radius: 4px;
    word-break: break-word;
    word-wrap: break-word;
    white-space: pre-wrap;
    box-sizing: border-box;
    overflow-wrap: break-word;
    text-align: left;

    &:focus {
      outline: none;
      border: none;
    }
  }
}
</style>

<style lang="less">
.tr-sender-compact {
  --tr-sender-template-editor-font-size: 14px;
}
</style>

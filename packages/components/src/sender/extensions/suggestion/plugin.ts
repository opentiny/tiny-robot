/**
 * Suggestion ProseMirror 插件
 *
 * 实现建议列表的显示、过滤、选中等核心逻辑
 */

import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { VueRenderer } from '@tiptap/vue-3'
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom'
import type { Editor } from '@tiptap/core'
import SuggestionList from './suggestion-list.vue'
import { syncAutoComplete } from './utils/filter'
import type { SuggestionOptions, SuggestionState, SenderSuggestionItem } from './types'
import { PLUGIN_KEY_NAMES, EXTENSION_NAMES } from '../constants'
import { isKey, isAnyKey } from '../utils'

/**
 * 插件 Key，用于访问插件状态
 */
export const SuggestionPluginKey = new PluginKey<SuggestionState>(PLUGIN_KEY_NAMES.SUGGESTION)

/**
 * 插件配置接口
 */
interface PluginOptions extends SuggestionOptions {
  editor: Editor
}

/**
 * 创建 Suggestion 插件
 *
 * @param options - 插件配置
 * @returns ProseMirror 插件
 */
export function createSuggestionPlugin(options: PluginOptions): Plugin {
  const {
    editor,
    activeSuggestionKeys = ['Enter'],
    popupWidth = 400,
    showAutoComplete = true,
    filterFn,
    onSelect,
  } = options

  let component: VueRenderer | null = null
  let popup: HTMLElement | null = null
  let cleanup: (() => void) | null = null
  let justClosed = false

  /**
   * 获取当前的 suggestions（动态从 editor 的 extensionManager 中获取）
   */
  function getCurrentSuggestions(): SenderSuggestionItem[] {
    const suggestionExtension = editor.extensionManager.extensions.find(
      (ext) => ext.name === EXTENSION_NAMES.SUGGESTION,
    )
    const options = suggestionExtension?.options
    const items = options?.items || options?.suggestions || []

    // 处理 Ref (简单的 value 检查，避免引入 vue 依赖导致类型问题)
    if (items && typeof items === 'object' && 'value' in items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (items as any).value
    }

    return items as SenderSuggestionItem[]
  }

  /**
   * 过滤建议项
   */
  function doFilterSuggestions(query: string): SenderSuggestionItem[] {
    const suggestions = getCurrentSuggestions()

    // 如果提供了 filterFn，使用自定义过滤
    // 否则不过滤，直接返回所有项
    return filterFn ? filterFn(suggestions, query) : suggestions
  }

  /**
   * 获取当前查询文本
   */
  function getCurrentQuery(docQuery: string): string {
    return docQuery
  }

  /**
   * 计算补全文本
   */
  function getAutoComplete(
    selectedIndex: number,
    query: string,
    filteredSuggestions: SenderSuggestionItem[],
  ): { text: string; show: boolean; showTab: boolean } {
    if (selectedIndex === -1 || !filteredSuggestions[selectedIndex]) {
      return { text: '', show: false, showTab: false }
    }

    const selectedItem = filteredSuggestions[selectedIndex]
    return syncAutoComplete(selectedItem.content, query)
  }

  /**
   * 插入建议内容
   */
  function insertSuggestion(_view: EditorView, range: { from: number; to: number } | null, item: SenderSuggestionItem) {
    if (!range) return

    // 触发回调，返回 false 可阻止默认回填
    const shouldInsert = onSelect?.(item) !== false

    if (shouldInsert) {
      editor.commands.setContent(item.content)
    }

    editor.commands.focus()
  }

  /**
   * 选中并关闭建议列表
   */
  function selectAndClose(view: EditorView, state: SuggestionState) {
    const selectedItem = state.filteredSuggestions[state.selectedIndex]
    if (selectedItem) {
      insertSuggestion(view, state.range, selectedItem)
    }

    // 关闭建议列表
    const tr = view.state.tr
    tr.setMeta(SuggestionPluginKey, { type: 'close' })
    view.dispatch(tr)
  }

  /**
   * 定位弹窗
   */
  function positionPopup(view: EditorView, popup: HTMLElement) {
    // 清理旧的自动更新
    cleanup?.()

    // 查找编辑器包装容器（tr-sender-editor-wrapper）
    const editorWrapper = view.dom.closest('.tr-sender')
    const referenceElement = (editorWrapper as HTMLElement) || view.dom

    // 计算弹窗宽度（基于输入框宽度）
    const calculatePopupWidth = (): string => {
      if (typeof popupWidth === 'number') {
        return `${popupWidth}px`
      }

      // 如果是百分比或 '100%'，基于 referenceElement 的宽度计算
      if (typeof popupWidth === 'string') {
        if (popupWidth.endsWith('%')) {
          const percentage = parseFloat(popupWidth) / 100
          const referenceWidth = referenceElement.offsetWidth
          return `${referenceWidth * percentage}px`
        }
        return popupWidth
      }

      return '400px' // 默认值
    }

    // 设置自动更新
    cleanup = autoUpdate(referenceElement, popup, () => {
      computePosition(referenceElement, popup, {
        placement: 'top-start',
        middleware: [
          offset(8),
          flip({
            fallbackPlacements: ['bottom-start', 'top-start'],
          }),
          shift({ padding: 8 }),
        ],
      }).then(({ x, y }) => {
        // 设置定位和宽度样式
        popup.style.position = 'absolute'
        popup.style.left = `${x}px`
        popup.style.top = `${y}px`
        popup.style.zIndex = '2000'
        popup.style.width = calculatePopupWidth() // 基于输入框宽度计算
      })
    })
  }

  /**
   * 创建自动补全装饰器
   */
  function createAutoCompleteDecorations(state: SuggestionState): DecorationSet {
    if (!showAutoComplete || !state.active || !state.autoCompleteText || !state.range) {
      return DecorationSet.empty
    }

    const doc = editor.state.doc
    const { selection } = editor.state
    const cursorPos = selection.$head.pos

    // 在全局模式下，只有当光标在文档末尾时才显示补全提示
    // 这样可以避免用户移动光标时出现补全文本插入到中间的问题
    const isAtEnd = cursorPos >= doc.content.size - 1
    if (!isAtEnd) {
      return DecorationSet.empty
    }

    // 创建补全提示元素
    const widget = Decoration.widget(
      cursorPos,
      () => {
        const container = document.createElement('span')
        container.className = 'suggestion-autocomplete'
        container.contentEditable = 'false'

        // 补全文本
        const complete = document.createElement('span')
        complete.className = 'autocomplete-text'
        complete.textContent = state.autoCompleteText
        container.appendChild(complete)

        // Tab 提示
        if (state.showTabIndicator) {
          const tabHint = document.createElement('span')
          tabHint.className = 'tab-hint'
          tabHint.textContent = 'TAB'
          container.appendChild(tabHint)
        }

        return container
      },
      {
        side: 1, // 显示在光标右侧
      },
    )

    return DecorationSet.create(doc, [widget])
  }

  return new Plugin({
    key: SuggestionPluginKey,

    state: {
      init(): SuggestionState {
        return {
          active: false,
          range: null,
          query: '',
          filteredSuggestions: [],
          selectedIndex: -1,
          autoCompleteText: '',
          showTabIndicator: false,
        }
      },

      apply(tr: Transaction, state: SuggestionState): SuggestionState {
        // 检查是否有 meta 更新
        const meta = tr.getMeta(SuggestionPluginKey)

        if (meta) {
          // 关闭建议列表
          if (meta.type === 'close') {
            justClosed = true
            setTimeout(() => {
              justClosed = false
            }, 0)
            return {
              active: false,
              range: null,
              query: '',
              filteredSuggestions: [],
              selectedIndex: -1,
              autoCompleteText: '',
              showTabIndicator: false,
            }
          }

          // 更新选中索引
          if (meta.type === 'updateIndex') {
            const newState = { ...state, selectedIndex: meta.index }
            const autoComplete = getAutoComplete(meta.index, state.query, state.filteredSuggestions)
            return {
              ...newState,
              autoCompleteText: autoComplete.text,
              showTabIndicator: autoComplete.showTab,
            }
          }
        }

        // 保持关闭状态，防止立即重新打开
        if (justClosed) {
          return state
        }

        // 如果文档没有变化，保持状态
        if (!tr.docChanged && !tr.selectionSet) {
          return state
        }

        // 全局模式：提取完整文本
        const docQuery = tr.doc.textContent.trim()

        // 获取当前查询文本
        const query = getCurrentQuery(docQuery)

        // ✅ 如果输入框为空，关闭建议列表（所有模式都适用）
        if (!docQuery) {
          return {
            active: false,
            range: null,
            query: '',
            filteredSuggestions: [],
            selectedIndex: -1,
            autoCompleteText: '',
            showTabIndicator: false,
          }
        }

        // 过滤建议项
        const filteredSuggestions = doFilterSuggestions(query)

        // 如果没有匹配项，关闭建议列表
        if (filteredSuggestions.length === 0) {
          return {
            active: false,
            range: null,
            query: '',
            filteredSuggestions: [],
            selectedIndex: -1,
            autoCompleteText: '',
            showTabIndicator: false,
          }
        }

        // 计算补全文本
        const autoComplete = getAutoComplete(0, query, filteredSuggestions)

        return {
          active: true,
          range: { from: 0, to: tr.doc.content.size },
          query,
          filteredSuggestions,
          selectedIndex: 0,
          autoCompleteText: autoComplete.text,
          showTabIndicator: autoComplete.showTab,
        }
      },
    },

    props: {
      decorations(state) {
        const pluginState = this.getState(state)
        return createAutoCompleteDecorations(
          pluginState || {
            active: false,
            range: null,
            query: '',
            filteredSuggestions: [],
            selectedIndex: -1,
            autoCompleteText: '',
            showTabIndicator: false,
          },
        )
      },

      handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
        const state = SuggestionPluginKey.getState(view.state)

        if (!state?.active) {
          return false
        }

        // Tab 键：应用自动补全
        if (isKey(event, 'TAB') && state.autoCompleteText) {
          event.preventDefault()
          selectAndClose(view, state)
          return true
        }

        // ↑↓ 键：导航
        if (isAnyKey(event, ['ARROW_UP', 'ARROW_DOWN'])) {
          event.preventDefault()

          const direction = isKey(event, 'ARROW_DOWN') ? 1 : -1
          const length = state.filteredSuggestions.length

          // 计算新索引（循环）
          let newIndex = state.selectedIndex + direction
          if (newIndex < 0) {
            newIndex = length - 1
          } else if (newIndex >= length) {
            newIndex = 0
          }

          // 更新状态
          const tr = view.state.tr
          tr.setMeta(SuggestionPluginKey, {
            type: 'updateIndex',
            index: newIndex,
          })
          view.dispatch(tr)

          return true
        }

        // 快捷键选中建议项
        if (activeSuggestionKeys.includes(event.key)) {
          event.preventDefault()
          selectAndClose(view, state)
          return true
        }

        // Esc 键：关闭
        if (isKey(event, 'ESCAPE')) {
          event.preventDefault()

          const tr = view.state.tr
          tr.setMeta(SuggestionPluginKey, { type: 'close' })
          view.dispatch(tr)

          return true
        }

        return false
      },
    },

    view() {
      return {
        update(view: EditorView) {
          const state = SuggestionPluginKey.getState(view.state)

          if (state?.active && state.filteredSuggestions.length > 0) {
            // 创建或更新弹窗
            if (!component) {
              component = new VueRenderer(SuggestionList, {
                props: {
                  show: state.active && state.filteredSuggestions.length > 0,
                  suggestions: state.filteredSuggestions,
                  popupStyle: {
                    // 宽度在 computePosition 回调中动态设置，这里只设置 maxWidth
                    maxWidth: '100%',
                  },
                  activeKeyboardIndex: state.selectedIndex,
                  activeMouseIndex: -1,
                  inputValue: state.query,
                  onSelect: (content: string) => {
                    const selectedItem = state.filteredSuggestions.find((item) => item.content === content)
                    if (selectedItem) {
                      insertSuggestion(view, state.range, selectedItem)

                      // 关闭建议列表
                      const tr = view.state.tr
                      tr.setMeta(SuggestionPluginKey, { type: 'close' })
                      view.dispatch(tr)
                    }
                  },
                  onMouseEnter: (index: number) => {
                    const tr = view.state.tr
                    tr.setMeta(SuggestionPluginKey, { type: 'updateIndex', index })
                    view.dispatch(tr)
                  },
                },
                editor,
              })

              popup = component.element as HTMLElement
              document.body.appendChild(popup)
            } else {
              // 更新 props
              component.updateProps({
                show: state.active && state.filteredSuggestions.length > 0,
                suggestions: state.filteredSuggestions,
                popupStyle: {
                  // 宽度在 computePosition 回调中动态设置，这里只设置 maxWidth
                  maxWidth: '100%',
                },
                activeKeyboardIndex: state.selectedIndex,
                inputValue: state.query,
              })
            }

            // 定位弹窗
            if (popup) {
              positionPopup(view, popup)
            }
          } else {
            // 销毁弹窗
            if (component) {
              cleanup?.()
              cleanup = null
              component.destroy()
              component = null
            }
            if (popup) {
              popup.remove()
              popup = null
            }
          }
        },

        destroy() {
          cleanup?.()
          component?.destroy()
          popup?.remove()
        },
      }
    },
  })
}

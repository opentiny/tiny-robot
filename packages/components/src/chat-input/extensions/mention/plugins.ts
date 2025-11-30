/**
 * Mention Suggestion 插件
 *
 * 基于 ProseMirror 插件实现
 * - 监听 @ 字符输入
 * - 过滤匹配的提及项列表
 * - 使用 @floating-ui/dom 定位弹窗
 * - 处理键盘导航和选择
 */

import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import type { EditorState, Selection, Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom'
import { VueRenderer } from '@tiptap/vue-3'
import type { Editor } from '@tiptap/core'
import { isRef } from 'vue'
import type { Ref } from 'vue'
import MentionList from './mention-list.vue'
import type { MentionItem, MentionSuggestionState } from './types'

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `mention_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export const MentionPluginKey = new PluginKey<MentionSuggestionState>('mention')

interface PluginOptions {
  editor: Editor
  char: string
  items: MentionItem[] | Ref<MentionItem[]>
  allowSpaces: boolean
}

/**
 * 查找触发位置和查询文本
 *
 * @param selection 当前光标位置
 * @param char 触发字符
 * @param allowSpaces 是否允许空格
 */
function findSuggestion(selection: Selection, char: string, allowSpaces: boolean) {
  const { $from } = selection

  // 光标不在文本节点或选区不为空时，不触发
  if (!selection.empty || !$from.parent.isTextblock) {
    return null
  }

  // 获取光标前的文本内容（从当前文本块开始到光标位置）
  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')

  // 查找最后一个触发字符的位置
  const lastCharIndex = textBefore.lastIndexOf(char)

  // 未找到触发字符
  if (lastCharIndex === -1) {
    return null
  }

  // 提取查询文本（触发字符之后的内容）
  const query = textBefore.slice(lastCharIndex + char.length)

  // 如果不允许空格且查询包含空格，则不触发
  if (!allowSpaces && query.includes(' ')) {
    return null
  }

  // 计算绝对位置范围
  const from = $from.start() + lastCharIndex
  const to = $from.pos

  return {
    range: { from, to },
    query,
  }
}

/**
 * 过滤提及项列表
 */
function filterItems(items: MentionItem[], query: string): MentionItem[] {
  if (!query) {
    return items
  }

  const lowerQuery = query.toLowerCase()

  return items.filter((item) => {
    // 匹配标签
    if (item.label.toLowerCase().includes(lowerQuery)) {
      return true
    }

    // 匹配预设内容
    if (item.preset?.toLowerCase().includes(lowerQuery)) {
      return true
    }

    return false
  })
}

/**
 * 创建 Suggestion 插件
 */
export function createSuggestionPlugin(options: PluginOptions): Plugin {
  const { editor, char, items, allowSpaces } = options

  let component: VueRenderer | null = null
  let popup: HTMLElement | null = null
  let cleanup: (() => void) | null = null

  return new Plugin({
    key: MentionPluginKey,

    state: {
      init(): MentionSuggestionState {
        return {
          active: false,
          range: null,
          query: '',
          filteredItems: [],
        }
      },

      apply(tr: Transaction, state: MentionSuggestionState): MentionSuggestionState {
        // 检查是否有 meta 更新
        const meta = tr.getMeta(MentionPluginKey)

        if (meta) {
          // 关闭弹窗
          if (meta.type === 'close') {
            return {
              active: false,
              range: null,
              query: '',
              filteredItems: [],
            }
          }
        }

        // 如果文档没有变化，保持状态
        if (!tr.docChanged && !tr.selectionSet) {
          return state
        }

        // 查找触发
        const suggestion = findSuggestion(tr.selection, char, allowSpaces)

        if (!suggestion) {
          return {
            active: false,
            range: null,
            query: '',
            filteredItems: [],
          }
        }

        // 过滤提及项
        const currentItems = isRef(items) ? items.value : items
        const filteredItems = filterItems(currentItems, suggestion.query)

        return {
          active: filteredItems.length > 0,
          range: suggestion.range,
          query: suggestion.query,
          filteredItems,
        }
      },
    },

    props: {
      // 装饰器：高亮触发区域
      decorations(state: EditorState): DecorationSet {
        const pluginState = this.getState(state)

        if (!pluginState?.active || !pluginState.range) {
          return DecorationSet.empty
        }

        const decoration = Decoration.inline(pluginState.range.from, pluginState.range.to, {
          class: 'mention-trigger',
        })

        return DecorationSet.create(state.doc, [decoration])
      },

      // 键盘处理
      handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
        const pluginState = MentionPluginKey.getState(view.state)

        // 处理 Backspace：检测是否在 mention 节点右侧
        if (event.key === 'Backspace') {
          const { selection } = view.state
          const { $from } = selection

          // 检查光标前面是否是 mention 节点
          if ($from.nodeBefore && $from.nodeBefore.type.name === 'mention') {
            event.preventDefault()

            const { tr } = view.state
            const nodePos = $from.pos - $from.nodeBefore.nodeSize

            // 删除 mention 节点
            tr.delete(nodePos, $from.pos)

            // 插入 @ 字符
            tr.insertText(char, nodePos)

            // 设置光标位置到 @ 后面
            tr.setSelection(TextSelection.create(tr.doc, nodePos + 1))

            view.dispatch(tr)

            // 聚焦编辑器
            view.focus()

            return true
          }
        }

        // 如果建议面板未激活，不处理其他键盘事件
        if (!pluginState?.active) {
          return false
        }

        // Esc 关闭
        if (event.key === 'Escape') {
          event.preventDefault()

          const tr = view.state.tr
          tr.setMeta(MentionPluginKey, {
            type: 'close',
          })
          view.dispatch(tr)

          // 销毁组件
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

          return true
        }

        // Enter 或 Tab：选择当前高亮的提及项
        if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault()

          // 尝试通过组件方法选择
          const handled = component?.ref?.onKeyDown?.({ event })
          if (handled) {
            return true
          }

          // 如果组件方法不可用，直接选择第一个提及项（fallback）
          if (pluginState.filteredItems.length > 0 && pluginState.range) {
            const firstItem = pluginState.filteredItems[0]
            insertMention(view, pluginState.range, firstItem)
            return true
          }

          return true
        }

        // ArrowUp 和 ArrowDown：交给组件处理
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          const handled = component?.ref?.onKeyDown?.({ event })
          return handled || false
        }

        // 其他键不处理
        return false
      },
    },

    view() {
      return {
        update(view: EditorView) {
          const state = MentionPluginKey.getState(view.state)

          if (state?.active && state.filteredItems.length > 0) {
            // 创建或更新弹窗
            if (!component) {
              component = new VueRenderer(MentionList, {
                props: {
                  items: state.filteredItems,
                  command: (props: { id: string; label: string; preset?: string }) => {
                    const item: MentionItem = {
                      id: props.id,
                      label: props.label,
                      preset: props.preset || '',
                    }
                    if (state.range) {
                      insertMention(view, state.range, item)
                    }
                  },
                },
                editor,
              })

              popup = component.element as HTMLElement
              popup.style.position = 'absolute'
              popup.style.zIndex = '1000'
              document.body.appendChild(popup)
            } else {
              // 更新 props
              component.updateProps({
                items: state.filteredItems,
              })
            }

            // 使用 floating-ui 定位
            const referenceElement = view.dom.querySelector('.mention-trigger')
            if (referenceElement && popup) {
              // 清理旧的自动更新
              cleanup?.()

              // 设置自动更新
              cleanup = autoUpdate(referenceElement, popup, () => {
                computePosition(referenceElement, popup!, {
                  placement: 'bottom-start',
                  middleware: [offset(8), flip(), shift({ padding: 8 })],
                }).then((result: { x: number; y: number }) => {
                  if (popup) {
                    Object.assign(popup.style, {
                      left: `${result.x}px`,
                      top: `${result.y}px`,
                    })
                  }
                })
              })
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

/**
 * 插入 mention
 */
function insertMention(view: EditorView, range: { from: number; to: number }, item: MentionItem) {
  const { state, dispatch } = view
  const { tr } = state

  // 删除触发文本（包括 @ 字符）
  tr.delete(range.from, range.to)

  // 插入 mention 节点
  const node = state.schema.nodes.mention.create({
    id: item.id || generateId(),
    label: item.label,
    preset: item.preset || '',
  })

  tr.insert(range.from, node)

  // 在 mention 后添加空格
  tr.insertText(' ', range.from + 1)

  // 设置光标位置
  tr.setSelection(TextSelection.create(tr.doc, range.from + 2))

  dispatch(tr)

  // 聚焦编辑器
  view.focus()
}

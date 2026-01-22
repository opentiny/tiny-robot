/**
 * Mention Suggestion 插件
 *
 * 基于 ProseMirror 插件实现
 * - 监听触发字符输入（可配置，默认为 @）
 * - 过滤匹配的提及项列表
 * - 使用 @floating-ui/dom 定位弹窗
 * - 处理键盘导航和选择
 */

import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom'
import { VueRenderer } from '@tiptap/vue-3'
import type { Editor } from '@tiptap/core'
import { isRef } from 'vue'
import type { Ref } from 'vue'
import MentionList from './components/mention-list.vue'
import { findTextRange, generateId, isKey, isAnyKey } from '../utils'
import type { MentionItem, MentionSuggestionState } from './types'
import { PLUGIN_KEY_NAMES, NODE_TYPE_NAMES } from '../constants'

export const MentionPluginKey = new PluginKey<MentionSuggestionState>(PLUGIN_KEY_NAMES.MENTION)

interface PluginOptions {
  editor: Editor
  char: string
  items: MentionItem[] | Ref<MentionItem[]>
  allowSpaces: boolean
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

    // 匹配关联值
    if (item.value?.toLowerCase().includes(lowerQuery)) {
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
        const suggestion = findTextRange(tr.selection, char, allowSpaces)

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
        if (isKey(event, 'BACKSPACE')) {
          const { selection } = view.state
          const { $from } = selection

          // 检查光标前面是否是 mention 节点
          if ($from.nodeBefore && $from.nodeBefore.type.name === NODE_TYPE_NAMES.MENTION) {
            event.preventDefault()

            const { tr } = view.state
            const nodePos = $from.pos - $from.nodeBefore.nodeSize

            // 删除 mention 节点
            tr.delete(nodePos, $from.pos)

            // 插入触发字符（统一行为：第一次删除转换为 @，第二次删除才删除 @）
            tr.insertText(char, nodePos)

            // 设置光标位置到触发字符后面
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
        if (isKey(event, 'ESCAPE')) {
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
        if (isAnyKey(event, ['ENTER', 'TAB'])) {
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
        if (isAnyKey(event, ['ARROW_UP', 'ARROW_DOWN'])) {
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
                  command: (props: { id: string; label: string; value?: string }) => {
                    const item: MentionItem = {
                      id: props.id,
                      label: props.label,
                      value: props.value || '',
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
  view.focus()

  const { state, dispatch } = view
  const { tr } = state

  const mentionNode = state.schema.nodes.mention.create({
    id: item.id || generateId('mention'),
    label: item.label,
    value: item.value || '',
  })

  // 创建空格文本节点
  const spaceNode = state.schema.text(' ')

  // 删除触发文本（包括触发字符）
  tr.delete(range.from, range.to)

  // 插入 mention 节点和空格
  tr.insert(range.from, [mentionNode, spaceNode])

  // 设置光标到空格之后（mention 节点 + 空格 = +2）
  const cursorPos = range.from + 2
  tr.setSelection(TextSelection.create(tr.doc, cursorPos))

  // 滚动到视图
  tr.scrollIntoView()

  dispatch(tr)
}

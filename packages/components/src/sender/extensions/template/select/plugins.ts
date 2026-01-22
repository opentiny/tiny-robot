/**
 * TemplateSelect 插件
 */

import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'
import { ZERO_WIDTH_CHAR } from '../utils'
import { NODE_TYPE_NAMES, PLUGIN_KEY_NAMES } from '../../constants'
import { isAnyKey, isKey } from '../../utils'

/**
 * Template Select 下拉菜单状态
 */
interface TemplateSelectDropdownState {
  /**
   * 是否有下拉菜单打开
   */
  isOpen: boolean
  /**
   * 当前打开的下拉菜单 ID
   */
  selectId: string | null
}

/**
 * Template Select 下拉菜单状态插件 Key
 */
export const TemplateSelectDropdownPluginKey = new PluginKey<TemplateSelectDropdownState>(
  PLUGIN_KEY_NAMES.TEMPLATE_SELECT_DROPDOWN,
)

/**
 * 下拉菜单状态管理插件
 * 用于在 ProseMirror 插件状态中跟踪下拉菜单的打开/关闭状态
 */
export function selectDropdownStatePlugin() {
  return new Plugin({
    key: TemplateSelectDropdownPluginKey,

    state: {
      init(): TemplateSelectDropdownState {
        return {
          isOpen: false,
          selectId: null,
        }
      },

      apply(tr: Transaction, state: TemplateSelectDropdownState): TemplateSelectDropdownState {
        const meta = tr.getMeta(TemplateSelectDropdownPluginKey)

        if (meta) {
          if (meta.type === 'open') {
            return {
              isOpen: true,
              selectId: meta.selectId,
            }
          }

          if (meta.type === 'close') {
            return {
              isOpen: false,
              selectId: null,
            }
          }
        }

        return state
      },
    },
  })
}

/**
 * 零宽字符管理插件
 * 注意：零宽字符现在由 Vue 组件直接渲染，不需要插件动态插入
 * 这个插件保留用于清理孤立的零宽字符
 */
export function selectZeroWidthPlugin() {
  return new Plugin({
    key: new PluginKey(PLUGIN_KEY_NAMES.TEMPLATE_SELECT_ZERO_WIDTH),

    appendTransaction(transactions: readonly Transaction[], _oldState: EditorState, newState: EditorState) {
      // 只在内容发生变化时修正
      const docChanged = transactions.some((tr) => tr.docChanged)
      if (!docChanged) return null

      // 清理孤立的零宽字符（段落中只有一个零宽字符的情况）
      const todoPositions: Array<['remove', number]> = []
      let { tr } = newState

      newState.doc.descendants((node: PMNode, pos: number) => {
        if (node.type.name === NODE_TYPE_NAMES.PARAGRAPH && node.childCount > 0) {
          const { lastChild, firstChild } = node
          // 如果段落只有一个零宽字符，删除它
          if (lastChild === firstChild && lastChild && lastChild.isText && lastChild.text === ZERO_WIDTH_CHAR) {
            todoPositions.push(['remove', pos + 1])
          }
        }
      })

      if (todoPositions.length > 0) {
        todoPositions.forEach(([, pos]) => {
          tr = tr.delete(pos, pos + 1)
        })
        return tr
      }

      return null
    },
  })
}

/**
 * 键盘导航插件
 */
export function selectKeyboardPlugin() {
  return new Plugin({
    key: new PluginKey(PLUGIN_KEY_NAMES.TEMPLATE_SELECT_KEYBOARD),

    props: {
      handleKeyDown(view: EditorView, event: KeyboardEvent) {
        const { state, dispatch } = view
        const { selection } = state
        const { $from } = selection

        // 如果有下拉菜单打开，拦截键盘事件让 Vue 组件处理
        const dropdownState = TemplateSelectDropdownPluginKey.getState(view.state)
        if (dropdownState?.isOpen) {
          if (isAnyKey(event, ['ENTER', 'ARROW_UP', 'ARROW_DOWN', 'ESCAPE'])) {
            // 返回 true 表示"已处理"，阻止事件继续传播到 useSenderCore
            return true
          }
        }

        // 处理 Backspace 删除选择器
        // 注意：零宽字符现在由 Vue 组件渲染，总是存在于 templateSelect 前后
        if (isKey(event, 'BACKSPACE') && selection.empty) {
          const beforeNode = $from.nodeBefore
          const afterNode = $from.nodeAfter

          // 场景1：光标前面直接是 templateSelect 节点
          // 删除整个选择器（包括内置的零宽字符）
          if (beforeNode?.type.name === NODE_TYPE_NAMES.TEMPLATE_SELECT) {
            dispatch(state.tr.delete($from.pos - beforeNode.nodeSize, $from.pos))
            event.preventDefault()
            return true
          }

          // 场景2：光标前面是零宽字符（templateSelect 的 suffix）
          // 需要找到并删除前面的 templateSelect 节点
          if (beforeNode?.isText && beforeNode.text === ZERO_WIDTH_CHAR) {
            // 查找零宽字符前面的节点
            const posBeforeZeroWidth = $from.pos - 1
            const $posBeforeZeroWidth = state.doc.resolve(posBeforeZeroWidth)
            const nodeBeforeZeroWidth = $posBeforeZeroWidth.nodeBefore

            // 如果零宽字符前面是 templateSelect，删除 templateSelect + 零宽字符
            if (nodeBeforeZeroWidth?.type.name === NODE_TYPE_NAMES.TEMPLATE_SELECT) {
              const deleteFrom = posBeforeZeroWidth - nodeBeforeZeroWidth.nodeSize
              const deleteTo = $from.pos // 包括零宽字符
              dispatch(state.tr.delete(deleteFrom, deleteTo))
              event.preventDefault()
              return true
            }
          }

          // 场景3：光标后面是 templateSelect，前面是普通文本
          // 删除文本的最后一个字符
          if (afterNode?.type.name === NODE_TYPE_NAMES.TEMPLATE_SELECT) {
            // 如果前面是普通文本（非零宽字符）
            if (beforeNode?.isText && beforeNode.text !== ZERO_WIDTH_CHAR) {
              dispatch(state.tr.delete($from.pos - 1, $from.pos))
              event.preventDefault()
              return true
            }
            // 如果前面是 template 节点，不处理，让 TemplateBlock 插件处理
            if (beforeNode?.type.name === NODE_TYPE_NAMES.TEMPLATE_BLOCK) {
              return false
            }
          }

          // 场景4：光标在段落末尾（afterNode 为 null），前面是普通文本
          // 这种情况通常发生在删除了段落末尾的 templateSelect 之后
          if (!afterNode && beforeNode?.isText && beforeNode.text !== ZERO_WIDTH_CHAR) {
            dispatch(state.tr.delete($from.pos - 1, $from.pos))
            event.preventDefault()
            return true
          }
        }

        // 处理 Delete 删除选择器
        // 注意：零宽字符现在由 Vue 组件渲染，总是存在于 templateSelect 前后
        if (isKey(event, 'DELETE') && selection.empty) {
          const afterNode = $from.nodeAfter
          const beforeNode = $from.nodeBefore

          // 场景1：光标后面直接是 templateSelect 节点
          // 删除整个选择器（包括内置的零宽字符）
          if (afterNode?.type.name === NODE_TYPE_NAMES.TEMPLATE_SELECT) {
            dispatch(state.tr.delete($from.pos, $from.pos + afterNode.nodeSize))
            event.preventDefault()
            return true
          }

          // 场景2：光标后面是零宽字符（templateSelect 的 prefix）
          // 需要找到并删除后面的 templateSelect 节点
          if (afterNode?.isText && afterNode.text === ZERO_WIDTH_CHAR) {
            // 查找零宽字符后面的节点
            const posAfterZeroWidth = $from.pos + 1
            const $posAfterZeroWidth = state.doc.resolve(posAfterZeroWidth)
            const nodeAfterZeroWidth = $posAfterZeroWidth.nodeAfter

            // 如果零宽字符后面是 templateSelect，删除零宽字符 + templateSelect
            if (nodeAfterZeroWidth?.type.name === NODE_TYPE_NAMES.TEMPLATE_SELECT) {
              const deleteTo = posAfterZeroWidth + nodeAfterZeroWidth.nodeSize
              dispatch(state.tr.delete($from.pos, deleteTo))
              event.preventDefault()
              return true
            }
          }

          // 场景3：光标前面是 templateSelect，后面是普通文本
          // 删除文本的第一个字符
          if (beforeNode?.type.name === NODE_TYPE_NAMES.TEMPLATE_SELECT) {
            // 如果后面是普通文本（非零宽字符）
            if (afterNode?.isText && afterNode.text !== ZERO_WIDTH_CHAR) {
              dispatch(state.tr.delete($from.pos, $from.pos + 1))
              event.preventDefault()
              return true
            }
            // 如果后面是 template 节点，不处理，让 TemplateBlock 插件处理
            if (afterNode?.type.name === NODE_TYPE_NAMES.TEMPLATE_BLOCK) {
              return false
            }
          }

          // 场景4：光标在段落开头（beforeNode 为 null），后面是普通文本
          // 这种情况通常发生在删除了段落开头的 templateSelect 之后
          if (!beforeNode && afterNode?.isText && afterNode.text !== ZERO_WIDTH_CHAR) {
            dispatch(state.tr.delete($from.pos, $from.pos + 1))
            event.preventDefault()
            return true
          }
        }

        return false
      },
    },
  })
}

/**
 * Template 插件
 * 管理零宽字符和光标行为
 */

import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'

// 零宽字符常量
const ZERO_WIDTH_CHAR = '\u200B'

/**
 * 处理零宽字符逻辑
 * 确保模板块前后有零宽字符，保证光标可以正确定位
 */
function handleZeroWidthCharLogic(newState: EditorState): Transaction | null {
  const todoPositions: Array<number | ['remove', number]> = []
  let { tr } = newState

  newState.doc.descendants((node: PMNode, pos: number, parent: PMNode | null) => {
    if (node.type.name === 'paragraph' && node.childCount > 0) {
      const { lastChild, firstChild } = node

      // 如果第一个 child 是模板块，在其前添加零宽字符
      if (firstChild && firstChild.type.name === 'template') {
        todoPositions.push(pos + 1)
      }

      // 如果最后一个 child 是模板块，在其后添加零宽字符
      if (lastChild && lastChild.type.name === 'template') {
        const paragraphEndPos = pos + node.nodeSize - 1
        const prevChar = tr.doc.textBetween(paragraphEndPos - 1, paragraphEndPos, '', '')
        if (prevChar !== ZERO_WIDTH_CHAR) {
          todoPositions.push(paragraphEndPos)
        }
      }

      // 如果段落只有一个零宽字符，删除它
      if (lastChild === firstChild && lastChild && lastChild.isText && lastChild.text === ZERO_WIDTH_CHAR) {
        todoPositions.push(['remove', pos + 1])
      }
    }

    // 如果模板块内容为空，插入零宽字符占位
    if (node.type.name === 'template' && node.content.size === 0) {
      todoPositions.push(pos + 1)
    }

    // 如果模板块后面有其他节点，在中间插入零宽字符
    if (node.type.name === 'template' && parent) {
      let nodeIndex = -1
      parent.forEach((child: PMNode, _offset: number, i: number) => {
        if (child === node) {
          nodeIndex = i
        }
      })

      if (nodeIndex > -1 && nodeIndex < parent.childCount - 1) {
        const nextSibling = parent.child(nodeIndex + 1)
        // 只在连续两个模板块之间插入零宽字符
        // 不在模板块和文本之间插入，避免零宽字符被合并到文本节点
        if (nextSibling.type.name === 'template') {
          const nextPos = pos + node.nodeSize
          // 检查是否已经有零宽字符
          const existingChar = tr.doc.textBetween(nextPos, nextPos + 1, '', '')
          if (existingChar !== ZERO_WIDTH_CHAR) {
            todoPositions.push(nextPos)
          }
        }
      }
    }
  })

  if (todoPositions.length > 0) {
    // 从后往前处理，避免位置偏移
    todoPositions
      .sort((a, b) => {
        const aOrder = Array.isArray(a) ? a[1] : a
        const bOrder = Array.isArray(b) ? b[1] : b
        return bOrder - aOrder
      })
      .forEach((insertPos) => {
        if (Array.isArray(insertPos) && insertPos[0] === 'remove') {
          tr = tr.delete(insertPos[1], insertPos[1] + 1)
        } else if (typeof insertPos === 'number') {
          tr = tr.insertText(ZERO_WIDTH_CHAR, insertPos, insertPos)
        }
      })
    return tr
  }

  return null
}

/**
 * 零宽字符管理插件
 */
export function ensureZeroWidthChars() {
  return new Plugin({
    key: new PluginKey('template-zero-width'),
    appendTransaction(transactions: readonly Transaction[], _oldState: EditorState, newState: EditorState) {
      // 只在内容发生变化时修正
      const docChanged = transactions.some((tr) => tr.docChanged)
      if (!docChanged) return null

      return handleZeroWidthCharLogic(newState)
    },
  })
}

/**
 * 键盘导航插件
 */
export function keyboardNavigationPlugin() {
  return new Plugin({
    key: new PluginKey('template-keyboard'),
    props: {
      handleKeyDown(view: EditorView, event: KeyboardEvent) {
        const { state, dispatch } = view
        const { selection } = state
        const { $from } = selection

        // 处理左箭头
        if (event.key === 'ArrowLeft') {
          if ($from.nodeBefore && $from.nodeBefore.isText && $from.nodeBefore.text) {
            if ($from.nodeBefore.text === ZERO_WIDTH_CHAR) {
              const parent = $from.parent
              const index = $from.index()

              if (index >= 2) {
                const secondBeforeCursorNode = parent.child(index - 2)
                if (secondBeforeCursorNode.type.name === 'template') {
                  // 进入模板块末尾（跳过零宽字符，进入节点内部）
                  const nextCursorPos = $from.pos - 2
                  dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)))
                  event.preventDefault()
                  return true
                }
              } else if (index === 1 && $from.pos !== 0) {
                // 跳到上一个段落
                const nextCursorPos = $from.before() - 1
                // 防止位置越界
                if (nextCursorPos >= 0) {
                  dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)))
                  event.preventDefault()
                  return true
                }
              }
            }
          }
        }

        // 处理右箭头
        if (event.key === 'ArrowRight') {
          if ($from.nodeAfter && $from.nodeAfter.isText) {
            if ($from.nodeAfter.text === ZERO_WIDTH_CHAR) {
              const parent = $from.parent
              const index = $from.index()

              if (index < parent.childCount - 1) {
                const secondAfterCursorNode = parent.child(index + 1)
                if (secondAfterCursorNode.type.name === 'template') {
                  // 进入模板块开头（跳过零宽字符，进入节点内部）
                  const newPos = $from.pos + 2
                  dispatch(state.tr.setSelection(TextSelection.create(state.doc, newPos)))
                  event.preventDefault()
                  return true
                }
              } else if (index === parent.childCount - 1 && state.doc.lastChild !== $from.node()) {
                // 跳到下一个段落
                const nextCursorPos = $from.after() + 1
                dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)))
                event.preventDefault()
                return true
              }
            }
          }
        }

        // 处理光标在模板块内部时的方向键导航
        const currentNode = $from.node()
        if (currentNode.type.name === 'template') {
          const content = currentNode.textContent || ''

          // 场景1: 模板块为空或只有零宽字符时，按左右箭头键直接跳出节点
          if (content === '' || content === ZERO_WIDTH_CHAR) {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              const pos = event.key === 'ArrowLeft' ? $from.before() : $from.after()
              // 检查是否需要跳转（避免重复跳转）
              if (selection.from !== pos) {
                dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos)))
                event.preventDefault()
                return true
              }
            }
          }
          // 场景2: 模板块有内容时，处理边界的箭头键导航
          else {
            // 光标在模板块最左侧，按左箭头，跳出到模板块前
            if (event.key === 'ArrowLeft' && $from.pos === $from.start()) {
              const pos = $from.before()
              dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos)))
              event.preventDefault()
              return true
            }
            // 光标在模板块最右侧，按右箭头，跳出到模板块后
            if (event.key === 'ArrowRight' && $from.pos === $from.end()) {
              const pos = $from.after()
              dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos)))
              event.preventDefault()
              return true
            }
          }
        }

        // 处理 Backspace
        if (event.key === 'Backspace' && selection.empty) {
          const currentNode = $from.node()
          const beforeNode = $from.nodeBefore

          // 如果光标在模板块内部
          if (currentNode.type.name === 'template') {
            const content = currentNode.textContent || ''

            // 删除最后一个字符时，插入零宽字符（保留模板块）
            if (
              $from.pos === $from.end() &&
              content.length === 1 &&
              content !== ZERO_WIDTH_CHAR &&
              event.key === 'Backspace'
            ) {
              const pos = $from.pos - 1
              dispatch(state.tr.insertText(ZERO_WIDTH_CHAR, pos, pos + 1))
              event.preventDefault()
              return true
            }

            // 如果内容只剩零宽字符，再次删除时跳出到模板块前（保留模板块）
            if (content === ZERO_WIDTH_CHAR && event.key === 'Backspace') {
              const nodePos = $from.before()
              const tr = state.tr.setSelection(TextSelection.create(state.doc, nodePos))
              dispatch(tr)
              event.preventDefault()
              return true
            }

            // 如果模板块为空，首次按 Backspace 时跳出到模板块前
            // 注意：此时零宽字符可能还未插入，需要单独处理
            if (content === '' && event.key === 'Backspace') {
              const nodePos = $from.before()
              const tr = state.tr.setSelection(TextSelection.create(state.doc, nodePos))
              dispatch(tr)
              event.preventDefault()
              return true
            }

            // 如果光标在模板块开头，且有内容，跳出到模板块前
            // 防止 ProseMirror 默认行为导致前面的文本被吸入模板块
            if ($from.pos === $from.start() && content.length > 0 && content !== ZERO_WIDTH_CHAR) {
              const nodePos = $from.before()
              dispatch(state.tr.setSelection(TextSelection.create(state.doc, nodePos)))
              event.preventDefault()
              return true
            }

            // 其他情况：让 ProseMirror 默认处理（光标在模板块中间，正常删除字符）
            return false
          }

          // 删除模板块前的单个字符时，保留零宽字符
          if (
            beforeNode &&
            beforeNode.isText &&
            beforeNode.text?.length === 1 &&
            beforeNode.text !== ZERO_WIDTH_CHAR &&
            $from.nodeAfter &&
            $from.nodeAfter.type.name === 'template'
          ) {
            const begin = $from.pos - beforeNode.nodeSize
            const end = $from.pos
            let tr = state.tr.delete(begin, end)
            tr = tr.insertText(ZERO_WIDTH_CHAR, begin, begin)
            dispatch(tr)
            event.preventDefault()
            return true
          }

          // 从右侧删除模板块
          if (beforeNode && beforeNode.type.name === 'template') {
            const content = beforeNode.textContent || ''
            // 判断是否为空：排除零宽字符
            const isEmpty = content.length === 0 || content === ZERO_WIDTH_CHAR

            // 如果模板块无内容，删除整个模板块
            if (isEmpty) {
              const parent = $from.parent
              const index = $from.index()
              const afterNode = $from.nodeAfter
              let deleteStart = $from.pos - beforeNode.nodeSize
              let deleteEnd = $from.pos

              // 检查前面是否有零宽字符
              if (index > 1) {
                const prevPrevNode = parent.child(index - 2)
                if (prevPrevNode && prevPrevNode.isText && prevPrevNode.text?.endsWith(ZERO_WIDTH_CHAR)) {
                  deleteStart = deleteStart - 1
                }
              }

              // 检查后面是否有零宽字符
              if (afterNode && afterNode.isText && afterNode.text?.startsWith(ZERO_WIDTH_CHAR)) {
                deleteEnd = deleteEnd + 1
              }

              dispatch(state.tr.delete(deleteStart, deleteEnd))
              event.preventDefault()
              return true
            }
            // 如果有内容，将光标移动到模板块末尾（进入模板块）
            else {
              const targetPos = $from.pos - 1 // 模板块末尾位置
              dispatch(state.tr.setSelection(TextSelection.create(state.doc, targetPos)))
              event.preventDefault()
              return true
            }
          }

          // 删除零宽字符前的模板块
          if (beforeNode && beforeNode.isText) {
            const parent = $from.parent
            const index = $from.index()

            // 检查前面是否有模板块（可能隔着零宽字符）
            if (index > 1) {
              const prevPrevNode = parent.child(index - 2)
              if (prevPrevNode.type.name === 'template') {
                const content = prevPrevNode.textContent || ''
                const isEmpty = content.length === 0 || content === ZERO_WIDTH_CHAR

                // 如果模板块无内容，删除整个模板块和中间的文本节点
                if (isEmpty) {
                  const deleteStart = $from.pos - beforeNode.nodeSize - prevPrevNode.nodeSize
                  const afterNode = $from.nodeAfter
                  let deleteEnd = $from.pos

                  // 检查后面是否有零宽字符
                  if (afterNode && afterNode.isText && afterNode.text?.startsWith(ZERO_WIDTH_CHAR)) {
                    deleteEnd = deleteEnd + 1
                  }

                  dispatch(state.tr.delete(deleteStart, deleteEnd))
                  event.preventDefault()
                  return true
                }
                // 如果有内容且前面是零宽字符，跳过零宽字符进入模板块
                if (beforeNode.text === ZERO_WIDTH_CHAR || beforeNode.text?.endsWith(ZERO_WIDTH_CHAR)) {
                  const nextCursorPos = $from.pos - 2
                  // 防止位置越界
                  if (nextCursorPos >= 0) {
                    dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)))
                    event.preventDefault()
                    return true
                  }
                }
              }
            } else if (index === 1 && $from.pos !== 1 && beforeNode.text === ZERO_WIDTH_CHAR) {
              // 删除换行和零宽字符
              const startPos = selection.from - 1 - 2
              // 防止位置越界
              if (startPos >= 0) {
                dispatch(state.tr.delete(startPos, selection.to))
                event.preventDefault()
                return true
              }
            }
          }
        }

        // 处理选区删除
        if (event.key === 'Backspace' && !selection.empty) {
          let startPos = selection.from
          let endPos = selection.to
          const nodeBefore = $from.nodeBefore
          const nodeAfter = $from.nodeAfter

          // 扩展选区以包含零宽字符
          if (nodeBefore && nodeBefore.isText && nodeBefore.text?.endsWith(ZERO_WIDTH_CHAR)) {
            startPos -= 1
          }
          if (nodeAfter && nodeAfter.isText && nodeAfter.text?.startsWith(ZERO_WIDTH_CHAR)) {
            endPos += 1
          }

          if (startPos !== selection.from || endPos !== selection.to) {
            const tr = state.tr.delete(startPos, endPos)
            dispatch(tr)
            event.preventDefault()
            return true
          }
        }

        // 处理 Delete 键
        if (event.key === 'Delete' && selection.empty) {
          const currentNode = $from.node()
          const afterNode = $from.nodeAfter

          // 如果光标在模板块内部
          if (currentNode.type.name === 'template') {
            const content = currentNode.textContent || ''

            // 删除第一个字符时，插入零宽字符（保留模板块）
            if (
              $from.pos === $from.start() &&
              content.length === 1 &&
              content !== ZERO_WIDTH_CHAR &&
              event.key === 'Delete'
            ) {
              const pos = $from.pos
              dispatch(state.tr.insertText(ZERO_WIDTH_CHAR, pos, pos + 1))
              event.preventDefault()
              return true
            }

            // 如果内容只剩零宽字符，再次删除时跳出到模板块后（保留模板块）
            if (content === ZERO_WIDTH_CHAR && event.key === 'Delete') {
              const nodePos = $from.after()
              const tr = state.tr.setSelection(TextSelection.create(state.doc, nodePos))
              dispatch(tr)
              event.preventDefault()
              return true
            }

            // 如果模板块为空，首次按 Delete 时跳出到模板块后
            // 注意：此时零宽字符可能还未插入，需要单独处理
            if (content === '' && event.key === 'Delete') {
              const nodePos = $from.after()
              const tr = state.tr.setSelection(TextSelection.create(state.doc, nodePos))
              dispatch(tr)
              event.preventDefault()
              return true
            }

            // 如果光标在模板块末尾，且有内容，跳出到模板块后
            // 防止 ProseMirror 默认行为导致后面的文本被吸入模板块
            if ($from.pos === $from.end() && content.length > 0 && content !== ZERO_WIDTH_CHAR) {
              const nodePos = $from.after()
              dispatch(state.tr.setSelection(TextSelection.create(state.doc, nodePos)))
              event.preventDefault()
              return true
            }

            // 其他情况：让 ProseMirror 默认处理（光标在模板块中间，正常删除字符）
            return false
          }

          // 删除模板块后的单个字符时，保留零宽字符
          if (
            afterNode &&
            afterNode.isText &&
            afterNode.text?.length === 1 &&
            afterNode.text !== ZERO_WIDTH_CHAR &&
            $from.nodeBefore &&
            $from.nodeBefore.type.name === 'template'
          ) {
            const begin = $from.pos
            const end = $from.pos + afterNode.nodeSize
            let tr = state.tr.delete(begin, end)
            tr = tr.insertText(ZERO_WIDTH_CHAR, begin, begin)
            dispatch(tr)
            event.preventDefault()
            return true
          }

          // 从左侧删除模板块
          if (afterNode && afterNode.type.name === 'template') {
            const content = afterNode.textContent || ''
            // 判断是否为空：排除零宽字符
            const isEmpty = content.length === 0 || content === ZERO_WIDTH_CHAR

            // 如果模板块无内容，删除整个模板块
            if (isEmpty) {
              const parent = $from.parent
              const index = $from.index()
              const beforeNode = $from.nodeBefore
              let deleteStart = $from.pos
              let deleteEnd = $from.pos + afterNode.nodeSize

              // 检查前面是否有零宽字符
              if (beforeNode && beforeNode.isText && beforeNode.text?.endsWith(ZERO_WIDTH_CHAR)) {
                deleteStart = deleteStart - 1
              }

              // 检查后面是否有零宽字符
              if (index < parent.childCount - 1) {
                const nextNextNode = parent.child(index + 1)
                if (nextNextNode && nextNextNode.isText && nextNextNode.text?.startsWith(ZERO_WIDTH_CHAR)) {
                  deleteEnd = deleteEnd + 1
                }
              }

              dispatch(state.tr.delete(deleteStart, deleteEnd))
              event.preventDefault()
              return true
            }
            // 如果有内容，将光标移动到模板块开头（进入模板块）
            else {
              const targetPos = $from.pos + 1 // 模板块开头位置
              dispatch(state.tr.setSelection(TextSelection.create(state.doc, targetPos)))
              event.preventDefault()
              return true
            }
          }

          // 删除零宽字符后的模板块
          if (afterNode && afterNode.isText) {
            const parent = $from.parent
            const index = $from.index()

            // 检查后面是否有模板块（可能隔着零宽字符）
            if (index < parent.childCount - 1) {
              const nextNextNode = parent.child(index + 1)
              if (nextNextNode.type.name === 'template') {
                const content = nextNextNode.textContent || ''
                const isEmpty = content.length === 0 || content === ZERO_WIDTH_CHAR

                // 如果模板块无内容，删除整个模板块和中间的文本节点
                if (isEmpty) {
                  let deleteStart = $from.pos
                  const deleteEnd = $from.pos + afterNode.nodeSize + nextNextNode.nodeSize
                  const beforeNode = $from.nodeBefore

                  // 检查前面是否有零宽字符
                  if (beforeNode && beforeNode.isText && beforeNode.text?.endsWith(ZERO_WIDTH_CHAR)) {
                    deleteStart = deleteStart - 1
                  }

                  dispatch(state.tr.delete(deleteStart, deleteEnd))
                  event.preventDefault()
                  return true
                }
                // 如果有内容且后面是零宽字符，跳过零宽字符进入模板块
                if (afterNode.text === ZERO_WIDTH_CHAR || afterNode.text?.startsWith(ZERO_WIDTH_CHAR)) {
                  const nextCursorPos = $from.pos + 2
                  dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)))
                  event.preventDefault()
                  return true
                }
              }
            }
          }
        }

        // 处理选区删除（Delete 键）
        if (event.key === 'Delete' && !selection.empty) {
          let startPos = selection.from
          let endPos = selection.to
          const nodeBefore = $from.nodeBefore
          const nodeAfter = $from.nodeAfter

          // 扩展选区以包含零宽字符
          if (nodeBefore && nodeBefore.isText && nodeBefore.text?.endsWith(ZERO_WIDTH_CHAR)) {
            startPos -= 1
          }
          if (nodeAfter && nodeAfter.isText && nodeAfter.text?.startsWith(ZERO_WIDTH_CHAR)) {
            endPos += 1
          }

          if (startPos !== selection.from || endPos !== selection.to) {
            const tr = state.tr.delete(startPos, endPos)
            dispatch(tr)
            event.preventDefault()
            return true
          }
        }

        return false
      },
    },
  })
}

/**
 * 粘贴处理插件
 */
export function pasteHandlerPlugin() {
  return new Plugin({
    key: new PluginKey('template-paste'),
    props: {
      handlePaste(view: EditorView, event: ClipboardEvent) {
        const types = event.clipboardData?.types || []
        const html = event.clipboardData?.getData('text/html')

        // 如果包含模板块的 HTML，让 Tiptap 默认处理
        if (
          (types.includes('text/html') && html?.includes('data-template')) ||
          types.includes('application/x-prosemirror-slice')
        ) {
          return false
        }

        const text = event.clipboardData?.getData('text/plain')
        if (text) {
          const { state, dispatch } = view
          const $from = state.selection.$from
          let tr = state.tr

          // 移除光标周围的零宽字符
          if ($from.nodeBefore && $from.nodeBefore.isText && $from.nodeBefore.text === ZERO_WIDTH_CHAR) {
            tr = tr.delete($from.pos - $from.nodeBefore.nodeSize, $from.pos)
          }
          if ($from.nodeAfter && $from.nodeAfter.isText && $from.nodeAfter.text === ZERO_WIDTH_CHAR) {
            tr = tr.delete($from.pos, $from.pos + $from.nodeAfter.nodeSize)
          }

          // 处理多行粘贴
          const lines = text.split('\n')
          let finalCursorPos: number

          if (lines.length === 1) {
            tr = tr.insertText(lines[0], tr.selection.from, tr.selection.to)
            finalCursorPos = tr.selection.$to.pos
          } else {
            tr = tr.insertText(lines[0], tr.selection.from, tr.selection.to)
            let pos = tr.selection.$to.pos

            for (let i = 1; i < lines.length; i++) {
              const paragraph = state.schema.nodes.paragraph.create({}, lines[i] ? state.schema.text(lines[i]) : null)
              tr = tr.insert(pos, paragraph)
              pos += paragraph.nodeSize
            }
            finalCursorPos = pos
          }

          tr = tr.setSelection(TextSelection.create(tr.doc, finalCursorPos))
          tr = tr.scrollIntoView()
          dispatch(tr)
          event.preventDefault()
          return true
        }

        return false
      },
    },
  })
}

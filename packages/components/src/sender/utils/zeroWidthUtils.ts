// 零宽字符常量，用于空字段的光标定位
export const ZERO_WIDTH_SPACE = '\u200B'

/**
 * 检查文本是否只包含零宽字符
 */
export const isOnlyZeroWidthSpace = (text: string): boolean => {
  return text.split('').every((char) => char === ZERO_WIDTH_SPACE)
}

/**
 * 清理文本中的零宽字符
 */
export const cleanZeroWidthSpaces = (text: string): string => {
  return text.replace(/\u200B/g, '')
}

/**
 * 创建零宽字符文本节点，用于字段后的定位
 */
export const createZeroWidthTextNode = (): Text => {
  return document.createTextNode(ZERO_WIDTH_SPACE)
}

/**
 * 检查字段是否为空（清理零宽字符后）
 */
export const isFieldEmpty = (element: HTMLElement): boolean => {
  const textContent = element.textContent || ''
  const cleanContent = cleanZeroWidthSpaces(textContent)
  return !cleanContent || cleanContent.trim() === ''
}

/**
 * 为字段在其后添加零宽字符文本节点（始终添加，不管字段是否为空）
 */
export const ensureZeroWidthAfterField = (fieldElement: HTMLElement): void => {
  // 检查字段后面是否已经有零宽字符节点
  const nextSibling = fieldElement.nextSibling
  if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && isOnlyZeroWidthSpace(nextSibling.textContent || '')) {
    return // 已经存在零宽字符节点
  }

  // 在字段后面插入零宽字符文本节点
  const zeroWidthNode = createZeroWidthTextNode()
  if (fieldElement.parentNode) {
    fieldElement.parentNode.insertBefore(zeroWidthNode, fieldElement.nextSibling)
  }
}

/**
 * 清理多余的零宽字符文本节点
 */
export const cleanupZeroWidthNodes = (editor: HTMLElement): void => {
  const allNodes = Array.from(editor.childNodes)

  allNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && isOnlyZeroWidthSpace(node.textContent || '')) {
      const prevSibling = node.previousSibling

      // 只保留紧跟在模板字段后面的零宽字符节点
      if (
        !(
          prevSibling &&
          prevSibling.nodeType === Node.ELEMENT_NODE &&
          (prevSibling as HTMLElement).classList.contains('template-field')
        )
      ) {
        // 移除多余的零宽字符节点
        if (node.parentNode) {
          node.parentNode.removeChild(node)
        }
      }
    }
  })
}

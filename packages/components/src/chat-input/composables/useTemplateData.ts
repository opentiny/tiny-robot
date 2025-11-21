/**
 * useTemplateData Composable
 *
 * 管理模板数据的双向绑定和操作
 * - 外部数据 → 内部编辑器
 * - 内部编辑器 → 外部数据
 * - 提供模板操作的便捷方法
 */

import { watch, ref, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { Editor } from '@tiptap/core'
import type { TemplateItem, ChatInputEmits } from '../index.type'

export interface UseTemplateDataOptions {
  templateData?: Ref<TemplateItem[] | undefined>
  editor: Ref<Editor | undefined>
  emit: ChatInputEmits
}

export interface UseTemplateDataReturn {
  /**
   * 设置模板数据
   */
  setTemplateData: (items: TemplateItem[]) => void

  /**
   * 清空模板数据
   */
  clearTemplateData: () => void

  /**
   * 聚焦第一个模板块
   */
  focusFirstTemplateBlock: () => void

  /**
   * 获取模板数据
   */
  getTemplateData: () => TemplateItem[]
}

/**
 * 提取模板数据
 */
function extractTemplateData(editor: Editor): TemplateItem[] {
  const items: TemplateItem[] = []
  let currentText = ''

  editor.state.doc.descendants((node) => {
    if (node.type.name === 'templateBlock') {
      // 先保存之前累积的文本
      if (currentText) {
        items.push({
          type: 'text',
          content: currentText,
        })
        currentText = ''
      }

      // 添加模板块
      items.push({
        id: node.attrs.id,
        type: 'template',
        content: node.attrs.content || '',
      })
    } else if (node.isText && node.text) {
      // 累积文本内容
      currentText += node.text
    }
  })

  // 保存最后的文本
  if (currentText) {
    items.push({
      type: 'text',
      content: currentText,
    })
  }

  return items
}

/**
 * useTemplateData
 */
export function useTemplateData(options: UseTemplateDataOptions): UseTemplateDataReturn {
  const { templateData, editor, emit } = options

  // 标志位：避免循环更新
  const isInternalUpdate = ref(false)

  /**
   * 设置模板数据
   */
  const setTemplateData = (items: TemplateItem[]) => {
    if (!editor.value) {
      return
    }

    isInternalUpdate.value = true

    try {
      // 使用命令设置模板数据
      editor.value.commands.setTemplateData(items)

      // 聚焦到第一个模板块
      nextTick(() => {
        focusFirstTemplateBlock()
      })
    } finally {
      // 延迟重置标志位，确保 update 事件处理完成
      setTimeout(() => {
        isInternalUpdate.value = false
      }, 50)
    }
  }

  /**
   * 清空模板数据
   */
  const clearTemplateData = () => {
    if (!editor.value) {
      return
    }

    isInternalUpdate.value = true

    try {
      editor.value.commands.clearContent()
      // 触发 emit 更新外部数据
      emit('update:templateData', [])
    } finally {
      setTimeout(() => {
        isInternalUpdate.value = false
      }, 50)
    }
  }

  /**
   * 聚焦第一个模板块
   */
  const focusFirstTemplateBlock = () => {
    if (!editor.value) {
      return
    }

    editor.value.commands.focusFirstTemplateBlock()
  }

  /**
   * 获取模板数据
   */
  const getTemplateData = (): TemplateItem[] => {
    if (!editor.value) {
      return []
    }

    return extractTemplateData(editor.value)
  }

  // 监听外部模板数据变化
  if (templateData) {
    watch(
      templateData,
      (newData) => {
        if (!newData || newData.length === 0 || !editor.value || isInternalUpdate.value) {
          return
        }

        // 比较新数据与当前数据是否相同
        const currentData = getTemplateData()
        const isSame = JSON.stringify(newData) === JSON.stringify(currentData)

        if (isSame) {
          return
        }

        // 外部更新
        setTemplateData(newData)
      },
      { deep: true },
    )
  }

  // 监听编辑器内容变化
  watch(
    editor,
    (newEditor) => {
      if (!newEditor) return

      newEditor.on('update', () => {
        if (isInternalUpdate.value) {
          return
        }

        // 提取模板数据并 emit
        const data = getTemplateData()
        emit('update:templateData', data)
      })
    },
    { immediate: true },
  )

  return {
    setTemplateData,
    clearTemplateData,
    focusFirstTemplateBlock,
    getTemplateData,
  }
}

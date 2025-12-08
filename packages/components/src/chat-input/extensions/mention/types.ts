/**
 * Mention 扩展类型定义
 */

import type { Ref } from 'vue'
import '@tiptap/core'

// ===== 类型定义 =====

/**
 * 提及项数据结构（用户侧）
 *
 * 用户传入的数据格式，id 可选，插件会自动生成
 */
export interface MentionItem {
  /**
   * 唯一标识（可选）
   *
   * 如果不提供，插件会自动生成
   */
  id?: string

  /**
   * 显示名称，如 "小小画家"（必传）
   */
  label: string

  /**
   * 预设内容（必传）
   */
  preset: string

  /**
   * 图标（可选）
   */
  icon?: string
}

/**
 * 结构化数据项（提交时返回）
 *
 * 用于表示文本和 mention 的混合结构
 */
export type MentionStructuredItem =
  | {
      type: 'text'
      content: string
    }
  | {
      type: 'mention'
      content: string // 显示名称
      preset: string // 预设内容
    }

/**
 * Mention 节点属性（内部使用）
 *
 * ProseMirror 节点的属性，id 必填（由插件保证）
 */
export interface MentionAttrs {
  /**
   * 唯一标识（必填）
   *
   * 由插件自动生成或使用用户提供的值
   */
  id: string

  /**
   * 显示名称
   */
  label: string

  /**
   * 预设内容（可选）
   */
  preset?: string
}

/**
 * Mention 配置选项
 */
export interface MentionOptions {
  /**
   * 提及项列表
   */
  items: MentionItem[] | Ref<MentionItem[]>

  /**
   * 触发字符，默认 '@'
   */
  char: string

  /**
   * 是否允许空格
   */
  allowSpaces: boolean

  /**
   * HTML 属性
   */
  HTMLAttributes: Record<string, unknown>
}

/**
 * Mention Suggestion 插件状态
 */
export interface MentionSuggestionState {
  /**
   * 是否激活
   */
  active: boolean

  /**
   * 触发范围
   */
  range: { from: number; to: number } | null

  /**
   * 查询文本
   */
  query: string

  /**
   * 过滤后的提及项列表
   */
  filteredItems: MentionItem[]
}

// ===== 模块扩展声明 =====

/**
 * 扩展 Tiptap Commands 接口
 *
 * 使 TypeScript 能够识别自定义命令
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mention: {
      /**
       * 插入 mention 节点
       */
      insertMention: (attrs: Partial<MentionAttrs>) => ReturnType

      /**
       * 删除 mention 节点
       */
      deleteMention: (id: string) => ReturnType
    }
  }
}

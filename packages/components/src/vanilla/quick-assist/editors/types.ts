/**
 * Phase 0 structural editor interfaces retained for future bridge work.
 * Public activation contracts live in ../types.ts and are re-exported below
 * for the existing compatibility spike. No editor bridge is shipped here.
 * This file has no editor runtime dependencies; CM6's future independent
 * entry will use formal extensions with optional peers (see spike-notes.md).
 */

// Public contracts now live in ../types.ts; no editor bridge is shipped yet.
export type {
  QuickAssistActivationView,
  QuickAssistActivationInput,
  QuickAssistSelectionSource,
  QuickAssistAnchorShortcut,
} from '../types'

/* ------------------------------------------------------------------ *
 * 桥接器选项
 * ------------------------------------------------------------------ */

export interface EditorSourceOptions {
  /** nearbyText 取选区前后各 N 行，默认 5。emit 时冻结。 */
  contextLines?: number
  /** CM6 无稳定语言 API，由宿主传入；Monaco 用 model.getLanguageId()。 */
  language?: string
}

/* ------------------------------------------------------------------ *
 * Monaco 结构化最小接口（仅实例成员）
 * ------------------------------------------------------------------ */

export interface MonacoPosition {
  lineNumber: number
  column: number
}

export interface MonacoRange {
  startLineNumber: number
  startColumn: number
  endLineNumber: number
  endColumn: number
}

/**
 * Monaco Selection 的结构化子集。getDirection 以 number 声明
 * （0 = LTR/forward，其余为 backward），避免对库枚举的依赖。
 */
export interface MonacoSelection extends MonacoRange {
  selectionStartLineNumber: number
  selectionStartColumn: number
  positionLineNumber: number
  positionColumn: number
  getDirection(): number
}

export interface MonacoTextModel {
  getValueInRange(range: MonacoRange): string
  getVersionId(): number
  getLanguageId?(): string
  uri?: { toString(): string }
}

/** Monaco 0.57 EditorLayoutInfo 子集（无 contentTop/contentHeight，已随版本移除）。 */
export interface MonacoLayoutInfo {
  width: number
  height: number
  contentLeft: number
  contentWidth: number
}

export interface MonacoDisposable {
  dispose(): void
}

/**
 * 桥接器所需的 Monaco 编辑器实例成员。真实类型
 * monaco.editor.IStandaloneCodeEditor 必须可赋值给本接口
 * （type-compat.ts 编译期断言）。注意事件名是 onDidDispose，无 "Editor" 后缀。
 */
export interface MonacoLikeEditor {
  /** dispose 后返回 null；桥接器须判空。 */
  getDomNode(): HTMLElement | null
  getModel(): MonacoTextModel | null
  getSelection(): MonacoSelection | null
  /** 返回相对编辑器 DOM 节点的坐标；编辑器视口外位置官方明确不准确。 */
  getScrolledVisiblePosition(position: MonacoPosition): { left: number; top: number; height: number } | null
  getTopForLineNumber(lineNumber: number): number
  getLayoutInfo(): MonacoLayoutInfo
  onDidChangeCursorSelection(listener: (e: { selection: MonacoSelection }) => void): MonacoDisposable
  onDidDispose(listener: () => void): MonacoDisposable
  onDidChangeModel(listener: () => void): MonacoDisposable
  onDidChangeModelContent(listener: (e: unknown) => void): MonacoDisposable
}

/* ------------------------------------------------------------------ *
 * CodeMirror 6 结构化最小接口（仅实例成员）
 * ------------------------------------------------------------------ */

export interface CmLine {
  from: number
  to: number
  number: number
  text: string
}

export interface CmDoc {
  readonly length: number
  /** Text 的方法是 sliceString；sliceDoc 在 EditorState 上（见 CmState）。 */
  sliceString(from?: number, to?: number, lineSeparator?: string): string
  lineAt(pos: number): CmLine
}

export interface CmSelectionRange {
  readonly from: number
  readonly to: number
  readonly anchor: number
  readonly head: number
  readonly empty: boolean
}

export interface CmState {
  readonly doc: CmDoc
  readonly selection: { readonly main: CmSelectionRange }
  sliceDoc(from?: number, to?: number): string
}

export interface CmRect {
  left: number
  right: number
  top: number
  bottom: number
}

/**
 * 桥接器所需的 CM6 EditorView 实例成员。真实 EditorView 必须可赋值给
 * 本接口（type-compat.ts 编译期断言）。这里只描述选区与几何读取能力；
 * 事件订阅必须由 CM6 独立入口的正式扩展提供，不能靠 DOM 事件/observer
 * 保证模型更新通知（见 Phase 0 spike-notes.md）。
 */
export interface EditorViewLike {
  readonly dom: HTMLElement
  readonly scrollDOM: HTMLElement
  readonly state: CmState
  /** 返回屏幕坐标；非 null 不保证在 scrollDOM 可视区内。 */
  coordsAtPos(pos: number, side?: -1 | 1): CmRect | null
}

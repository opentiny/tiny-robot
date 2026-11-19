/**
 * Phase 0 类型兼容性断言：真实编辑器类型必须可赋值给
 * quick-assist/editors/types.ts 的结构化最小接口（零依赖契约）。
 *
 * 赋值方向：真实类型 → Like 接口（桥接器按 Like 接口收参，宿主传入真实实例）。
 * 若真实库升级破坏兼容，本文件的赋值语句在编译期报错。
 *
 * 运行：pnpm run type-check:quick-assist
 */
import type * as Monaco from 'monaco-editor'
import type { EditorView } from '@codemirror/view'
import type { EditorViewLike, MonacoLikeEditor } from '../../components/src/vanilla/quick-assist/editors/types'

/** monaco.editor.IStandaloneCodeEditor → MonacoLikeEditor（方法参数依赖 bivariance）。 */
export const monacoEditorIsCompatible: MonacoLikeEditor = null as unknown as Monaco.editor.IStandaloneCodeEditor

/** EditorView → EditorViewLike。 */
export const cmViewIsCompatible: EditorViewLike = null as unknown as EditorView

/** 便捷成员级钉子：桥接器实际调用的 API 在真实类型上存在且形状一致。 */
export const monacoGetDirectionIsNumeric: number = null as unknown as ReturnType<Monaco.Selection['getDirection']>

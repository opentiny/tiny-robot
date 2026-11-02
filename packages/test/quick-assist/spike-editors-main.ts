/**
 * Phase 0 spike 脚本（一次性，Phase 2/3 将重写为正式 editors fixture）。
 *
 * 验证目标（plan.md Phase 0-3）：
 *  - S1 CM6 DOM 事件触发可行性：聚焦状态下程序化选区 → document selectionchange
 *  - S2 失焦状态下程序化选区 → selectionchange 是否仍触发（预期不触发，驱动 observer 策略）
 *  - S3 observer 重检查策略：纯渲染噪声 vs 等长原地替换（doc 引用重比）
 *  - S4/S5 横向滚动下 coordsAtPos 非 null 但在 scrollDOM 可视区外 + caret 零宽
 *  - S6 虚拟滚动（远端位置）coordsAtPos 行为
 *  - M1-M5 Monaco getScrolledVisiblePosition 基线（坐标语义/横向/纵向/wrap/lineHeight）
 *  - M6 Monaco 事件时序（setSelection/edit/dispose ↔ document selectionchange）
 *  - M7 容器移除（未 dispose）无编辑器事件 → observeElementLiveness 必要性
 */
import * as monaco from 'monaco-editor'
import { basicSetup } from 'codemirror'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'

type SpikeCheck = () => Promise<Record<string, unknown>>

declare global {
  interface Window {
    __spike: Record<string, SpikeCheck>
    __spikeReady: boolean
  }
}

const settle = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

/* ------------------------------ 计数器 ------------------------------ */

let selectionChangeCount = 0
document.addEventListener('selectionchange', () => {
  selectionChangeCount += 1
})

/* ------------------------------ CodeMirror 6 ------------------------------ */

const MARK = 'TARGET_TEXT' // 11 chars
const SAME_LENGTH_REPLACEMENT = 'REPLACED!!!' // 11 chars
if (MARK.length !== SAME_LENGTH_REPLACEMENT.length) throw new Error('Spike replacement must have equal length')
const cmDocText = [
  `const longLine = "${'A'.repeat(400)}"; // LONG_LINE_END`,
  `const target = "${MARK}";`,
  ...Array.from({ length: 480 }, (_, i) => `// filler line ${i + 3}`),
].join('\n')

// 对照组使用真实 updateListener，验证 DOM-only 通路有缺口时正式扩展能通知。
const cmUpdateChecks = new Set<() => void>()
const cmView = new EditorView({
  state: EditorState.create({
    doc: cmDocText,
    extensions: [
      basicSetup,
      EditorView.updateListener.of(() => {
        for (const check of cmUpdateChecks) check()
      }),
    ],
  }),
  parent: document.querySelector<HTMLElement>('#cm1')!,
})

let cmMutationCount = 0
new MutationObserver(() => {
  cmMutationCount += 1
}).observe(cmView.dom, { childList: true, subtree: true })

let cmMutationWithCharDataCount = 0
new MutationObserver(() => {
  cmMutationWithCharDataCount += 1
}).observe(cmView.dom, { childList: true, subtree: true, characterData: true })

const markOffset = cmDocText.indexOf(MARK)
const farLineOffset = cmDocText.indexOf('// filler line 400')
const longLineStartOffset = cmDocText.indexOf('const longLine')

function cmMainSelection() {
  const main = cmView.state.selection.main
  return { from: main.from, to: main.to, anchor: main.anchor, head: main.head, empty: main.empty }
}

const S1: SpikeCheck = async () => {
  document.querySelector<HTMLButtonElement>('#focus-btn')!.focus()
  await settle(30)
  const before = { selectionChangeCount, ...cmMainSelection() }
  cmView.focus()
  await settle(30)
  // 排除 focus 自身触发的 selectionchange，只测下面的选区更新。
  before.selectionChangeCount = selectionChangeCount
  cmView.dispatch({ selection: { anchor: markOffset, head: markOffset + MARK.length } })
  await settle()
  const after = { selectionChangeCount, ...cmMainSelection() }
  const domSelection = document.getSelection()
  return {
    basicSetupInstalled: !!cmView.dom.querySelector('.cm-gutters'),
    drawSelectionInstalled: !!cmView.dom.querySelector('.cm-selectionLayer'),
    selectionChangeFired: after.selectionChangeCount > before.selectionChangeCount,
    selectionChangeDelta: after.selectionChangeCount - before.selectionChangeCount,
    stateMatches: after.from === markOffset && after.to === markOffset + MARK.length,
    domSelectionInsideEditor: !!domSelection?.anchorNode && cmView.dom.contains(domSelection.anchorNode),
    before,
    after,
  }
}

/** 在真实通知回调内比较快照，不能用 action 后主动读 state 冒充通知成功。 */
async function probeCmSignals(action: () => void) {
  await settle()
  let capturedDoc = cmView.state.doc
  let capturedSelection = cmMainSelection()
  let armed = false
  const signals = { mutation: 0, resize: 0, selectionchange: 0, pointerup: 0, keyup: 0, extension: 0 }
  let domInvalidated = false
  let extensionInvalidated = false
  const changed = () => {
    const current = cmMainSelection()
    return (
      cmView.state.doc !== capturedDoc ||
      current.anchor !== capturedSelection.anchor ||
      current.head !== capturedSelection.head ||
      !cmView.dom.isConnected
    )
  }
  const check = (signal: keyof typeof signals) => {
    if (!armed) return
    signals[signal]++
    if (changed()) {
      if (signal === 'extension') extensionInvalidated = true
      else domInvalidated = true
    }
  }
  const observer = new MutationObserver(() => check('mutation'))
  observer.observe(cmView.dom, { childList: true, subtree: true, characterData: true })
  const resizeObserver = new ResizeObserver(() => check('resize'))
  resizeObserver.observe(cmView.dom)
  const onSelection = () => {
    const selection = document.getSelection()
    if (selection?.anchorNode && cmView.dom.contains(selection.anchorNode)) check('selectionchange')
  }
  const onPointerUp = (event: PointerEvent) => {
    if (cmView.dom.contains(event.target as Node)) check('pointerup')
  }
  const onKeyUp = (event: KeyboardEvent) => {
    if (cmView.dom.contains(event.target as Node)) check('keyup')
  }
  const onUpdate = () => check('extension')
  document.addEventListener('selectionchange', onSelection)
  document.addEventListener('pointerup', onPointerUp, true)
  document.addEventListener('keyup', onKeyUp, true)
  cmUpdateChecks.add(onUpdate)
  try {
    // 排除 ResizeObserver 的首次通知和前一步残留渲染。
    await settle()
    observer.takeRecords()
    capturedDoc = cmView.state.doc
    capturedSelection = cmMainSelection()
    armed = true
    action()
    await settle()
    return { signals, stateChanged: changed(), domInvalidated, extensionInvalidated }
  } finally {
    armed = false
    observer.disconnect()
    resizeObserver.disconnect()
    cmUpdateChecks.delete(onUpdate)
    document.removeEventListener('selectionchange', onSelection)
    document.removeEventListener('pointerup', onPointerUp, true)
    document.removeEventListener('keyup', onKeyUp, true)
  }
}

const S2: SpikeCheck = async () => {
  document.querySelector<HTMLButtonElement>('#focus-btn')!.focus()
  await settle(30)
  const before = { selectionChangeCount, selection: cmMainSelection() }
  // 失焦状态下程序化修改选区（无 pointer/keyup）
  const selectionChange = await probeCmSignals(() => {
    cmView.dispatch({ selection: { anchor: markOffset + 3, head: markOffset + 9 } })
  })
  const after = { selectionChangeCount, selection: cmMainSelection() }
  const domSelection = document.getSelection()
  const domSelectionText = domSelection?.toString() ?? null
  const selectionClear = await probeCmSignals(() => {
    cmView.dispatch({ selection: { anchor: markOffset + 3 } })
  })
  // 修改视口外文档，选区和已渲染文本不变，检查 DOM-only 通路是否漏通知。
  const offscreenEdit = await probeCmSignals(() => {
    cmView.dispatch({ changes: { from: farLineOffset + 3, to: farLineOffset + 9, insert: 'HIDDEN' } })
  })
  return {
    selectionChange,
    selectionClear,
    offscreenEdit,
    domOnlyMeetsRequirements: [selectionChange, selectionClear, offscreenEdit].every((r) => r.domInvalidated),
    extensionMeetsRequirements: [selectionChange, selectionClear, offscreenEdit].every((r) => r.extensionInvalidated),
    selectionChangeFired: after.selectionChangeCount > before.selectionChangeCount,
    selectionChangeDelta: after.selectionChangeCount - before.selectionChangeCount,
    stateChanged: after.selection.from !== before.selection.from,
    domSelectionInsideEditor: !!domSelection?.anchorNode && cmView.dom.contains(domSelection.anchorNode),
    // DOM 选区文本是否同步到新选区（失焦时 CM6 不保证同步原生选区）
    domSelectionText,
    expectedStateText: cmView.state.sliceDoc(after.selection.from, after.selection.to),
    before,
    after,
  }
}

const S3: SpikeCheck = async () => {
  cmView.dispatch({ selection: { anchor: markOffset, head: markOffset + MARK.length } })
  document.querySelector<HTMLButtonElement>('#focus-btn')!.focus()
  await settle()
  // S3a: 等长原地替换（无选区位移、失焦、无 DOM 事件）
  const capturedDocBefore = cmView.state.doc
  const selectionBefore = cmMainSelection()
  const mutationsBeforeS3a = cmMutationCount
  const charDataMutationsBeforeS3a = cmMutationWithCharDataCount
  const s3aNotification = await probeCmSignals(() => {
    cmView.dispatch({
      changes: { from: markOffset, to: markOffset + MARK.length, insert: SAME_LENGTH_REPLACEMENT },
      selection: { anchor: selectionBefore.from, head: selectionBefore.to },
    })
  })
  const s3a = {
    notification: s3aNotification,
    equalLength: MARK.length === SAME_LENGTH_REPLACEMENT.length,
    docLengthUnchanged: cmView.state.doc.length === capturedDocBefore.length,
    docRefChanged: cmView.state.doc !== capturedDocBefore,
    selectionUnchanged: cmMainSelection().from === selectionBefore.from && cmMainSelection().to === selectionBefore.to,
    mutationCountDelta: cmMutationCount - mutationsBeforeS3a,
    mutationWithCharDataCountDelta: cmMutationWithCharDataCount - charDataMutationsBeforeS3a,
    selectionChangeCountAtS3a: selectionChangeCount,
  }
  // S3b: 纯渲染噪声（重新聚焦触发渲染，无 doc/selection 变化）
  const mutationsBeforeS3b = cmMutationCount
  const charDataMutationsBeforeS3b = cmMutationWithCharDataCount
  const selectionBeforeS3b = cmMainSelection()
  const docBeforeS3b = cmView.state.doc
  const selectionChangeBeforeS3b = selectionChangeCount
  const s3bNotification = await probeCmSignals(() => cmView.focus())
  const s3b = {
    notification: s3bNotification,
    docRefUnchanged: cmView.state.doc === docBeforeS3b,
    selectionUnchanged:
      cmMainSelection().from === selectionBeforeS3b.from && cmMainSelection().to === selectionBeforeS3b.to,
    mutationCountDelta: cmMutationCount - mutationsBeforeS3b,
    mutationWithCharDataCountDelta: cmMutationWithCharDataCount - charDataMutationsBeforeS3b,
    selectionChangeDelta: selectionChangeCount - selectionChangeBeforeS3b,
  }
  return { s3a, s3b }
}

const S4: SpikeCheck = async () => {
  cmView.focus()
  // 选中长行开头，随后右滚 → 行首滚出 scrollDOM 可视区
  cmView.dispatch({ selection: { anchor: longLineStartOffset, head: longLineStartOffset + 12 } })
  await settle(30)
  cmView.scrollDOM.scrollLeft = 9999
  await settle(60)
  const rect = cmView.coordsAtPos(cmView.state.selection.main.from)
  const scrollRect = cmView.scrollDOM.getBoundingClientRect()
  const inView = rect ? rect.left >= scrollRect.left && rect.right <= scrollRect.right : null
  return {
    coordNonNull: !!rect,
    coordLeft: rect?.left ?? null,
    scrollDomLeft: scrollRect.left,
    scrollDomRight: scrollRect.right,
    visibleInsideScrollDom: inView,
    caretWidth: rect ? rect.right - rect.left : null,
    scrollLeftAfter: cmView.scrollDOM.scrollLeft,
  }
}

const S5: SpikeCheck = async () => {
  // caret 零宽（独立测量，恢复滚动后）
  cmView.scrollDOM.scrollLeft = 0
  await settle(30)
  const rect = cmView.coordsAtPos(markOffset)
  return {
    coordNonNull: !!rect,
    caretWidth: rect ? rect.right - rect.left : null,
    caretHeight: rect ? rect.bottom - rect.top : null,
  }
}

const S6: SpikeCheck = async () => {
  cmView.dispatch({ selection: { anchor: farLineOffset, head: farLineOffset + 10 } })
  cmView.scrollDOM.scrollTop = 0
  await settle(60)
  const rect = cmView.coordsAtPos(cmView.state.selection.main.to)
  const scrollRect = cmView.scrollDOM.getBoundingClientRect()
  return {
    coordNonNull: !!rect,
    coordTop: rect?.top ?? null,
    scrollDomTop: scrollRect.top,
    scrollDomBottom: scrollRect.bottom,
    scrollDomClientHeight: cmView.scrollDOM.clientHeight,
    scrollDomRectHeight: scrollRect.height,
    visibleInsideScrollDom: rect ? rect.top >= scrollRect.top && rect.bottom <= scrollRect.bottom : null,
    renderedLineCount: cmView.dom.querySelectorAll('.cm-line').length,
    totalLineCount: cmView.state.doc.lines,
  }
}

/* ------------------------------ Monaco ------------------------------ */

function makeMonacoEditor(
  parent: HTMLElement,
  value: string,
  options: monaco.editor.IStandaloneEditorConstructionOptions = {},
) {
  const model = monaco.editor.createModel(value, 'plaintext')
  return monaco.editor.create(parent, {
    model,
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    ...options,
  })
}

const monacoMainDoc = [
  `const longLine = "${'B'.repeat(400)}"; // MONACO_LONG_LINE_END`,
  ...Array.from({ length: 299 }, (_, i) => `// monaco filler line ${i + 2}`),
].join('\n')

const monacoMain = makeMonacoEditor(document.querySelector<HTMLElement>('#monaco1')!, monacoMainDoc)
let monacoCursorSelectionCount = 0
let monacoModelContentCount = 0
monacoMain.onDidChangeCursorSelection(() => {
  monacoCursorSelectionCount += 1
})
monacoMain.onDidChangeModelContent(() => {
  monacoModelContentCount += 1
})

const M1: SpikeCheck = async () => {
  await settle(50)
  const pos = monacoMain.getScrolledVisiblePosition({ lineNumber: 1, column: 1 })
  const layout = monacoMain.getLayoutInfo()
  const domRect = monacoMain.getDomNode()!.getBoundingClientRect()
  const firstLineEl = monacoMain.getDomNode()!.querySelector('.view-line')
  const firstLineRect = firstLineEl?.getBoundingClientRect()
  return {
    pos,
    layoutContentLeft: layout.contentLeft,
    layoutContentWidth: layout.contentWidth,
    layoutWidth: layout.width,
    layoutHeight: layout.height,
    domRectLeft: domRect.left,
    domRectTop: domRect.top,
    firstLineRectLeft: firstLineRect?.left ?? null,
    firstLineRectTop: firstLineRect?.top ?? null,
    // 假设验证：pos 相对 domNode 左上角 → 绝对坐标 = domRect + pos
    hypothesisAbsoluteLeft: domRect.left + (pos?.left ?? 0),
    hypothesisAbsoluteTop: domRect.top + (pos?.top ?? 0),
  }
}

const M2: SpikeCheck = async () => {
  monacoMain.setScrollPosition({ scrollLeft: 600, scrollTop: 0 })
  await settle(60)
  const inViewPos = monacoMain.getScrolledVisiblePosition({ lineNumber: 1, column: 380 })
  const outPos = monacoMain.getScrolledVisiblePosition({ lineNumber: 1, column: 5 })
  const layout = monacoMain.getLayoutInfo()
  return {
    scrollLeft: monacoMain.getScrollLeft(),
    inViewPos,
    outPos,
    contentLeft: layout.contentLeft,
    contentWidth: layout.contentWidth,
    outPosDetectable: !!outPos && (outPos.left < 0 || outPos.left < layout.contentLeft),
  }
}

const M3: SpikeCheck = async () => {
  monacoMain.setScrollPosition({ scrollLeft: 0, scrollTop: 3000 })
  await settle(60)
  const abovePos = monacoMain.getScrolledVisiblePosition({ lineNumber: 1, column: 1 })
  const inViewPos = monacoMain.getScrolledVisiblePosition({ lineNumber: 120, column: 1 })
  return {
    scrollTop: monacoMain.getScrollTop(),
    abovePos,
    inViewPos,
    aboveDetectable: !!abovePos && abovePos.top < 0,
  }
}

const M4: SpikeCheck = async () => {
  const wrapEditor = makeMonacoEditor(
    document.querySelector<HTMLElement>('#monaco-wrap')!,
    ['W'.repeat(200), 'second line'].join('\n'),
    { wordWrap: 'on' },
  )
  await settle(80)
  const line1Top = wrapEditor.getTopForLineNumber(1)
  const line2Top = wrapEditor.getTopForLineNumber(2)
  const posCol5 = wrapEditor.getScrolledVisiblePosition({ lineNumber: 1, column: 5 })
  const posCol150 = wrapEditor.getScrolledVisiblePosition({ lineNumber: 1, column: 150 })
  const posCol5Top = posCol5?.top ?? null
  const posCol150Top = posCol150?.top ?? null
  wrapEditor.dispose()
  return {
    line1Top,
    line2Top,
    posCol5,
    posCol150,
    posCol150NonNull: !!posCol150,
    // 假设验证：col150 在第 2 视觉行 → top 应显著大于 col5 的 top
    wrappedPositionReflected: posCol150Top !== null && posCol5Top !== null && posCol150Top > posCol5Top,
    lineHeightFromTops: line2Top - line1Top,
  }
}

const M5: SpikeCheck = async () => {
  const line1Top = monacoMain.getTopForLineNumber(1)
  const line2Top = monacoMain.getTopForLineNumber(2)
  const line3Top = monacoMain.getTopForLineNumber(3)
  return { line1Top, line2Top, line3Top, lineHeight: line2Top - line1Top, lineHeightAlt: line3Top - line2Top }
}

const M6: SpikeCheck = async () => {
  monacoMain.setScrollPosition({ scrollLeft: 0, scrollTop: 0 })
  monacoMain.setSelection(new monaco.Selection(1, 1, 1, 6))
  await settle()
  const afterSelection = {
    cursorSelectionCount: monacoCursorSelectionCount,
    modelContentCount: monacoModelContentCount,
    selectionChangeCount,
  }
  monacoMain.executeEdits('spike', [{ range: new monaco.Range(2, 1, 2, 10), text: 'EDITED!!' }])
  await settle()
  const afterEdit = {
    cursorSelectionCount: monacoCursorSelectionCount,
    modelContentCount: monacoModelContentCount,
    selectionChangeCount,
  }
  return { afterSelection, afterEdit }
}

const M7: SpikeCheck = async () => {
  const block = document.querySelector<HTMLElement>('#monaco-throwaway-block')!
  const container = document.querySelector<HTMLElement>('#monaco-throwaway')!
  const throwaway = makeMonacoEditor(container.querySelector<HTMLElement>('.editor')!, 'throwaway\ncode')
  let disposeCount = 0
  throwaway.onDidDispose(() => {
    disposeCount += 1
  })
  let cursorCount = 0
  throwaway.onDidChangeCursorSelection(() => {
    cursorCount += 1
  })
  await settle(50)
  container.remove()
  await settle(150)
  const afterRemove = {
    disposeCount,
    cursorCount,
    domConnected: throwaway.getDomNode()?.isConnected ?? null,
    modelAlive: !throwaway.getModel()?.isDisposed(),
  }
  // 对照：显式 dispose 触发 onDidDispose
  throwaway.dispose()
  await settle(50)
  const afterDispose = { disposeCount, domConnected: throwaway.getDomNode()?.isConnected ?? null }
  block.remove()
  return { afterRemove, afterDispose }
}

/* ------------------------------ 挂载 ------------------------------ */

window.__spike = { S1, S2, S3, S4, S5, S6, M1, M2, M3, M4, M5, M6, M7 }
window.__spikeReady = true
const status = document.querySelector('#status')
if (status) status.textContent = 'spike ready'

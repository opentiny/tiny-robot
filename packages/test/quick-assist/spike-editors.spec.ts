/**
 * Phase 0 spike spec：运行 spike-editors.html 的检查项并输出结果。
 * 手动运行：QUICK_ASSIST_SPIKE=1 pnpm -F tiny-robot-test exec playwright test quick-assist/spike-editors.spec.ts
 *
 * 断言只钉住“方案可行性”的判定性布尔值；详细数值通过 console 输出，
 * 由开发者整理进 spike-notes.md。本文件是一次性产物（Phase 0），
 * Phase 2/3 的正式用例在 quick-assist.spec.ts 扩展。
 */
import { expect, test } from '@playwright/test'

type CheckResult = Record<string, unknown>
type NotificationResult = {
  signals: Record<string, number>
  stateChanged: boolean
  domInvalidated: boolean
  extensionInvalidated: boolean
}

declare global {
  interface Window {
    __spike: Record<string, () => Promise<CheckResult>>
    __spikeReady: boolean
  }
}

const NAMES = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'] as const

test('editor spike', async ({ page }) => {
  test.skip(process.env.QUICK_ASSIST_SPIKE !== '1', 'Phase 0 editor spike; set QUICK_ASSIST_SPIKE=1 to run manually')
  await page.goto('/quick-assist/spike-editors.html')
  await page.waitForFunction(() => window.__spikeReady === true)
  const results: Record<string, CheckResult> = {}
  for (const name of NAMES) {
    results[name] = await page.evaluate((check) => window.__spike[check](), name)
  }
  console.log('[spike-results]', JSON.stringify(results, null, 2))

  const s1 = results.S1
  expect(s1.basicSetupInstalled, 'S1: basicSetup 的行号扩展实际生效').toBe(true)
  expect(s1.drawSelectionInstalled, 'S1: drawSelection 图层实际安装').toBe(true)
  expect(s1.selectionChangeFired, 'S1: 聚焦状态程序化选区触发 selectionchange').toBe(true)
  expect(s1.stateMatches, 'S1: view.state.selection 与 dispatch 一致').toBe(true)

  const s2 = results.S2 as {
    selectionChange: NotificationResult
    selectionClear: NotificationResult
    offscreenEdit: NotificationResult
    domOnlyMeetsRequirements: boolean
    extensionMeetsRequirements: boolean
  }
  for (const name of ['selectionChange', 'selectionClear', 'offscreenEdit'] as const) {
    expect(s2[name].stateChanged, `S2 ${name}: 实验确实修改了状态`).toBe(true)
    expect(s2[name].signals.extension, `S2 ${name}: updateListener 实际通知`).toBeGreaterThan(0)
    expect(s2[name].extensionInvalidated, `S2 ${name}: 扩展回调内识别失效`).toBe(true)
  }
  // 判定性回归：DOM-only 有缺口时测试仍通过，但结论必须走正式扩展回退。
  expect(s2.offscreenEdit.domInvalidated, 'S2: 视口外等长编辑无法靠 DOM-only 通路可靠发现').toBe(false)
  expect(s2.domOnlyMeetsRequirements, 'S2: DOM-only 不满足全部必要条件').toBe(false)
  expect(s2.extensionMeetsRequirements, 'S2: 正式扩展覆盖全部必要条件').toBe(true)

  const s3 = results.S3 as { s3a: Record<string, unknown>; s3b: Record<string, unknown> }
  expect(s3.s3a.equalLength, 'S3a: 替换文本长度相同').toBe(true)
  expect(s3.s3a.docLengthUnchanged, 'S3a: 文档长度不变').toBe(true)
  expect(s3.s3a.selectionUnchanged, 'S3a: 选区边界不变').toBe(true)
  expect(s3.s3a.docRefChanged, 'S3a: 等长原地替换后 doc 引用变化（重检查可捕获）').toBe(true)
  expect(s3.s3a.mutationWithCharDataCountDelta, 'S3a: observer 真实收到通知').toBeGreaterThan(0)
  expect(
    (s3.s3a.notification as NotificationResult).signals.mutation,
    'S3a: 本次 observer 通知触发快照复检',
  ).toBeGreaterThan(0)
  expect((s3.s3a.notification as NotificationResult).domInvalidated, 'S3a: DOM 回调内识别可见文本编辑').toBe(true)
  expect(s3.s3b.docRefUnchanged, 'S3b: 纯渲染后 doc 引用不变').toBe(true)
  expect(s3.s3b.selectionUnchanged, 'S3b: 纯渲染后选区不变（可区分噪声）').toBe(true)
  expect((s3.s3b.notification as NotificationResult).domInvalidated, 'S3b: 纯渲染回调不误判失效').toBe(false)
  expect((s3.s3b.notification as NotificationResult).extensionInvalidated, 'S3b: 焦点更新不误判失效').toBe(false)

  const s4 = results.S4
  expect(s4.coordNonNull, 'S4: 横向滚出后 coordsAtPos 仍返回坐标').toBe(true)
  expect(s4.visibleInsideScrollDom, 'S4: 非 null 坐标在 scrollDOM 可视区外').toBe(false)

  const m2 = results.M2
  expect(m2.outPosDetectable, 'M2: 横向滚出位置可检测（left 越界）').toBe(true)

  const m3 = results.M3
  expect(m3.aboveDetectable, 'M3: 纵向滚出位置可检测（top 为负）').toBe(true)

  const m4 = results.M4
  expect(m4.posCol150NonNull, 'M4: wordWrap 下第 2 视觉行位置坐标非 null').toBe(true)
  expect(m4.wrappedPositionReflected, 'M4: wordWrap 坐标反映视觉行位置').toBe(true)

  const m6 = results.M6 as {
    afterSelection: { cursorSelectionCount: number }
    afterEdit: { modelContentCount: number }
  }
  // M6 计数为累计值，断言“发生过”
  expect(m6.afterSelection.cursorSelectionCount).toBeGreaterThan(0)
  expect(m6.afterEdit.modelContentCount).toBeGreaterThan(0)

  const m7 = results.M7 as {
    afterRemove: { disposeCount: number; domConnected: boolean | null }
    afterDispose: { disposeCount: number }
  }
  expect(m7.afterRemove.disposeCount, 'M7: 容器移除（未 dispose）不触发 onDidDispose').toBe(0)
  expect(m7.afterDispose.disposeCount, 'M7: 显式 dispose 触发 onDidDispose').toBeGreaterThan(0)
})

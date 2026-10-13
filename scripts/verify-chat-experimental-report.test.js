import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const matrix = JSON.parse(readFileSync(resolve(root, 'docs/experiments/tr-chat-web-component-matrix.json'), 'utf8'))
const reportPath = resolve(root, 'docs/experiments/tr-chat-web-component-report.md')

test('report totals and per-example rows agree with the matrix', () => {
  const report = readFileSync(reportPath, 'utf8')
  const counts = Object.fromEntries(
    ['direct', 'adapted', 'partial', 'blocked', 'not-applicable', 'not-run'].map((status) => [
      status,
      matrix.examples.filter((entry) => entry.behavior.status === status).length,
    ]),
  )

  for (const entry of matrix.examples) assert.match(report, new RegExp(`\\|\\s+\`${entry.id}\`\\s+\\|`))
  for (const [status, count] of Object.entries(counts)) {
    assert.match(report, new RegExp(`\\| ${status}\\s+\\|\\s+${count} \\|`))
  }
  assert.match(report, /18\s*\/\s*18/)
  assert.match(report, /100%/)
})

test('report records baseline, measurements, browsers, limitations, and justified conclusion', () => {
  const report = readFileSync(reportPath, 'utf8')

  assert.match(report, /c855826eba33f1d151514c9469b56fd09e679ae0/)
  assert.match(report, /@opentiny\/tiny-robot-chat\/experimental/)
  assert.match(report, /607[,.]?215|607\.2\s*KB/i)
  assert.match(report, /Chromium.*18\/18/is)
  assert.match(report, /Firefox.*WebKit/is)
  assert.match(report, /real.*not-run|真实服务.*not-run/is)
  assert.match(report, /Light DOM/)
  assert.match(report, /Shadow DOM/)
  assert.match(report, /SSR/)
  assert.match(report, /结论：GO/)
  assert.doesNotMatch(report, /18\/18 示例完整行为/)
  assert.equal(
    matrix.examples.some(({ browsers }) => /full 18-example behavior/i.test(browsers.chromium.evidence)),
    false,
  )
  assert.match(report, /适配映射覆盖率/)
  assert.match(report, /通用 readiness.*布局.*专项交互/is)

  for (const entry of matrix.examples.filter(({ behavior }) =>
    ['partial', 'blocked', 'not-run'].includes(behavior.status),
  )) {
    assert.ok(entry.behavior.evidence.length > 0, `${entry.id} needs a reason`)
  }
  assert.equal(
    matrix.examples.some(({ behavior }) => behavior.status === 'blocked'),
    false,
  )
})

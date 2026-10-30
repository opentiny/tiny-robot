import { expect, test } from '@playwright/test'
import { EXAMPLE_IDS, calculateCoverage, readCompatibilityMatrix } from './matrix'

test('matrix schema covers every example and uses only normalized statuses', () => {
  const matrix = readCompatibilityMatrix()
  const statuses = new Set(['direct', 'adapted', 'partial', 'blocked', 'not-applicable', 'not-run'])

  expect(matrix.examples.map(({ id }) => id)).toEqual(EXAMPLE_IDS)
  for (const result of matrix.examples) {
    expect(statuses.has(result.behavior.status)).toBe(true)
    expect(statuses.has(result.visual.status)).toBe(true)
    expect(result.behavior.evidence.length).toBeGreaterThan(0)
    expect(result.visual.evidence.length).toBeGreaterThan(0)
    expect(Object.keys(result.browsers).sort()).toEqual(['chromium', 'firefox', 'webkit'])
  }

  expect(calculateCoverage(matrix.examples)).toEqual(matrix.summary.behaviorCoverage)
  expect(matrix.summary.browserValidation).toEqual({
    chromiumExamplesPassed: EXAMPLE_IDS.length,
    chromiumExamplesTotal: EXAMPLE_IDS.length,
    percent: 100,
    uiAssertions: true,
    interactionAssertions: true,
    pixelDiff: false,
  })
})

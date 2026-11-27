import { expect, test } from '@playwright/test'
import { DEFAULT_LABEL_STYLES, normalizeTrajectory } from '../components/src/vanilla/trace/core/time'
import type { TrajectoryItem } from '../components/src/vanilla'

test.describe('Trace time normalization', () => {
  test('normalizes large item collections without spreading arguments', () => {
    const items: TrajectoryItem[] = Array.from({ length: 100_000 }, (_, index) => ({
      id: `item-${index}`,
      type: 'info',
      message: 'item',
      startTime: index,
      endTime: index + 1,
    }))

    const model = normalizeTrajectory(items, undefined, DEFAULT_LABEL_STYLES)

    expect(model.items).toHaveLength(100_000)
  })

  test('normalizes heavily overlapping collections with one lane per overlap', () => {
    const items: TrajectoryItem[] = Array.from({ length: 10_000 }, (_, index) => ({
      id: `overlap-${index}`,
      type: 'info',
      message: 'overlap',
      startTime: 0,
      endTime: 1,
    }))

    const model = normalizeTrajectory(items, undefined, DEFAULT_LABEL_STYLES)

    expect(model.items).toHaveLength(10_000)
    expect(model.laneCount).toBe(10_000)
  })
})

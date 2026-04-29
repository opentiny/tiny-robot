import { countGraphemes as countGraphemesFallback } from 'unicode-segmenter/grapheme'

const graphemeSegmenter =
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null

export function countGraphemes(text: string): number {
  if (!text) return 0

  if (graphemeSegmenter) {
    let count = 0

    for (const _segment of graphemeSegmenter.segment(text)) {
      count++
    }

    return count
  }

  return countGraphemesFallback(text)
}

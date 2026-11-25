import { isVNode } from 'vue'
import { Schema } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import { expect, test } from '@playwright/experimental-ct-vue'
import { findTextRange } from '../../../components/src/sender/extensions/utils/position'
import { syncAutoComplete } from '../../../components/src/sender/extensions/suggestion/utils/filter'
import { processHighlights } from '../../../components/src/sender/extensions/suggestion/utils/highlight'
import { countGraphemes } from '../../../components/src/sender/utils/countGraphemes'
import { normalizeTooltipContent } from '../../../components/src/sender-actions/utils/tooltip'

const schema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: { content: 'text*', group: 'block' },
    text: { group: 'inline' },
  },
})

function selectionFor(text: string, offset = text.length) {
  const paragraph = schema.nodes.paragraph.create(null, text ? schema.text(text) : undefined)
  const doc = schema.nodes.doc.create(null, paragraph)
  return TextSelection.create(doc, 1 + offset)
}

test.describe('Sender pure utilities', () => {
  test('UTIL-01 counts an empty grapheme string as zero', () => {
    expect(countGraphemes('')).toBe(0)
  })

  test('UTIL-02 counts emoji and combining sequences as visible graphemes', () => {
    expect(countGraphemes('👨‍👩‍👧‍👦é')).toBe(2)
  })

  test('UTIL-03 finds the final trigger and its query range', () => {
    expect(findTextRange(selectionFor('hello @user'), '@')).toEqual({
      range: { from: 7, to: 12 },
      query: 'user',
    })
  })

  test('UTIL-04 returns no range when the trigger is absent', () => {
    expect(findTextRange(selectionFor('ordinary text'), '@')).toBeNull()
  })

  test('UTIL-05 returns no range for a non-empty legal selection', () => {
    const text = 'hello @user'
    const paragraph = schema.nodes.paragraph.create(null, schema.text(text))
    const doc = schema.nodes.doc.create(null, paragraph)
    const selection = TextSelection.create(doc, 2, 3)

    expect(selection.empty).toBe(false)
    expect(findTextRange(selection, '@')).toBeNull()
  })

  test('UTIL-06 rejects a space in the query when allowSpaces is false', () => {
    expect(findTextRange(selectionFor('say @two words'), '@', false)).toBeNull()
  })

  test('UTIL-07 keeps a legal spaced query when allowSpaces is true', () => {
    expect(findTextRange(selectionFor('say @two words'), '@', true)).toEqual({
      range: { from: 5, to: 15 },
      query: 'two words',
    })
  })

  test('UTIL-08 computes a case-insensitive autocomplete suffix', () => {
    expect(syncAutoComplete('JavaScript', 'ja')).toEqual({ text: 'vaScript', show: true, showTab: true })
  })

  test('UTIL-09 hides autocomplete for a mismatch or complete prefix', () => {
    expect(syncAutoComplete('JavaScript', 'py')).toEqual({ text: '', show: false, showTab: false })
    expect(syncAutoComplete('JavaScript', 'JavaScript')).toEqual({ text: '', show: false, showTab: false })
  })

  test('UTIL-10 handles automatic, overlapping, and custom highlights and wraps tooltip content', () => {
    expect(processHighlights({ content: 'ECS-云服务器' }, 'ecs')).toEqual([
      { text: 'ECS', isMatch: true },
      { text: '-云服务器', isMatch: false },
    ])
    expect(processHighlights({ content: 'aaaa', highlights: ['aa', 'aaa'] }, 'a')).toEqual([
      { text: 'aaaa', isMatch: true },
    ])
    expect(processHighlights({ content: 'custom', highlights: (text) => [{ text, isMatch: true }] }, 'query')).toEqual([
      { text: 'custom', isMatch: true },
    ])

    const render = normalizeTooltipContent('提示')
    const vnode = render?.()
    expect(isVNode(vnode)).toBe(true)
    expect(vnode?.props?.class).toBe('tr-sender-tooltip-inner')
  })
})

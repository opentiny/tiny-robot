import { describe, expect, it } from 'vitest'
import { useChatDraft } from './useChatDraft'

describe('external input updates during a pending send', () => {
  it.each(['', 'host prompt'])('preserves the newer input %j when a send is rejected', async (value) => {
    let complete!: (accepted: boolean) => void
    const draft = useChatDraft({
      send: () =>
        new Promise<boolean>((resolve) => {
          complete = resolve
        }),
    })
    draft.setInputValue('original')
    const pending = draft.send({ text: 'original' })
    await Promise.resolve()
    draft.setInputValue(value)
    complete(false)
    await pending
    expect(draft.inputValue.value).toBe(value)
  })

  it('restores the previous draft only when it has not been edited', async () => {
    const draft = useChatDraft({ send: async () => false })
    draft.setInputValue('original')
    await draft.send({ text: 'original' })
    expect(draft.inputValue.value).toBe('original')
  })
})

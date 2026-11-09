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

  it('restores rejected and failed drafts but leaves accepted sends cleared', async () => {
    const rejected = useChatDraft({ send: async () => false })
    rejected.setInputValue('retry')
    await rejected.send({ text: 'retry' })
    expect(rejected.inputValue.value).toBe('retry')

    const failed = useChatDraft({
      send: async () => {
        throw new Error('failed')
      },
    })
    failed.setInputValue('retry failed')
    await expect(failed.send({ text: 'retry failed' })).rejects.toThrow('failed')
    expect(failed.inputValue.value).toBe('retry failed')

    const accepted = useChatDraft({ send: async () => true })
    accepted.setInputValue('sent')
    await accepted.send({ text: 'sent' })
    expect(accepted.inputValue.value).toBe('')
  })

  it('does not let a later rejection revoke an earlier send restoration', async () => {
    let finishFirst!: (accepted: boolean) => void
    let finishSecond!: (accepted: boolean) => void
    let call = 0
    const draft = useChatDraft({
      send: () =>
        new Promise<boolean>((resolve) => {
          if (call++ === 0) finishFirst = resolve
          else finishSecond = resolve
        }),
    })
    draft.setInputValue('original')
    const first = draft.send({ text: 'original' })
    await Promise.resolve()
    const second = draft.send({ text: 'duplicate' })
    await Promise.resolve()
    finishSecond(false)
    await second
    finishFirst(false)
    await first
    expect(draft.inputValue.value).toBe('original')
  })

  it('keeps the draft cleared when a concurrent send is accepted', async () => {
    let finishFirst!: (accepted: boolean) => void
    let finishSecond!: (accepted: boolean) => void
    let call = 0
    const draft = useChatDraft({
      send: () =>
        new Promise<boolean>((resolve) => {
          if (call++ === 0) finishFirst = resolve
          else finishSecond = resolve
        }),
    })
    draft.setInputValue('original')
    const first = draft.send({ text: 'original' })
    await Promise.resolve()
    const second = draft.send({ text: 'newer' })
    await Promise.resolve()
    finishFirst(false)
    await first
    expect(draft.inputValue.value).toBe('')
    finishSecond(true)
    await second
    expect(draft.inputValue.value).toBe('')
  })

  it('keeps the draft cleared when a later send accepts before an earlier rejection', async () => {
    let finishFirst!: (accepted: boolean) => void
    let finishSecond!: (accepted: boolean) => void
    let call = 0
    const draft = useChatDraft({
      send: () =>
        new Promise<boolean>((resolve) => {
          if (call++ === 0) finishFirst = resolve
          else finishSecond = resolve
        }),
    })
    draft.setInputValue('original')
    const first = draft.send({ text: 'original' })
    await Promise.resolve()
    const second = draft.send({ text: 'newer' })
    await Promise.resolve()
    finishSecond(true)
    await second
    finishFirst(false)
    await first
    expect(draft.inputValue.value).toBe('')
  })

  it('restores after concurrent rejection and failure', async () => {
    let failFirst!: (error: Error) => void
    let finishSecond!: (accepted: boolean) => void
    let call = 0
    const failure = new Error('failed')
    const draft = useChatDraft({
      send: () =>
        new Promise<boolean>((resolve, reject) => {
          if (call++ === 0) failFirst = reject
          else finishSecond = resolve
        }),
    })
    draft.setInputValue('original')
    const first = draft.send({ text: 'original' })
    await Promise.resolve()
    const second = draft.send({ text: 'duplicate' })
    await Promise.resolve()
    failFirst(failure)
    await expect(first).rejects.toBe(failure)
    expect(draft.inputValue.value).toBe('')
    finishSecond(false)
    await second
    expect(draft.inputValue.value).toBe('original')
  })

  it('does not restore after the user clears the input or a host writes a new draft', async () => {
    let finish!: (accepted: boolean) => void
    const draft = useChatDraft({
      send: () =>
        new Promise<boolean>((resolve) => {
          finish = resolve
        }),
    })
    draft.setInputValue('original')
    const pending = draft.send({ text: 'original' })
    await Promise.resolve()
    draft.setInputValue('')
    finish(false)
    await pending
    expect(draft.inputValue.value).toBe('')

    draft.setInputValue('original again')
    const next = draft.send({ text: 'original again' })
    await Promise.resolve()
    draft.setInputValue('host draft')
    finish(false)
    await next
    expect(draft.inputValue.value).toBe('host draft')
  })
})

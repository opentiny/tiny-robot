import { describe, expect, it, vi } from 'vitest'
import { useChatDraft } from '../../src/composables/useChatDraft'
import { createDeferred } from '../fixtures/deferred'

describe('useChatDraft', () => {
  it('does not send blank text', async () => {
    const send = vi.fn(async () => true)
    const draft = useChatDraft({ send })
    draft.setInputValue('  ')

    await expect(draft.send({ text: '   ' })).resolves.toBe(false)
    expect(send).not.toHaveBeenCalled()
    expect(draft.inputValue.value).toBe('  ')
  })

  it('trims sent text and clears the draft after acceptance', async () => {
    const send = vi.fn(async () => true)
    const draft = useChatDraft({ send })

    await expect(draft.send({ text: '  hello  ' })).resolves.toBe(true)
    expect(send).toHaveBeenCalledWith({ text: 'hello' })
    expect(draft.inputValue.value).toBe('')
  })

  it('restores the original draft when send returns false', async () => {
    const draft = useChatDraft({ send: async () => false })

    await expect(draft.send({ text: '  hello  ' })).resolves.toBe(false)
    expect(draft.inputValue.value).toBe('  hello  ')
  })

  it('restores the original draft and rethrows send errors', async () => {
    const error = new Error('send failed')
    const draft = useChatDraft({
      send: async () => {
        throw error
      },
    })

    await expect(draft.send({ text: 'hello' })).rejects.toBe(error)
    expect(draft.inputValue.value).toBe('hello')
  })

  it('does not overwrite a new draft entered during a request', async () => {
    const deferred = createDeferred<boolean>()
    const draft = useChatDraft({ send: () => deferred.promise })
    const request = draft.send({ text: 'old' })
    draft.setInputValue('new')

    deferred.resolve(false)
    await expect(request).resolves.toBe(false)
    expect(draft.inputValue.value).toBe('new')
  })

  it('forwards structured data unchanged', async () => {
    const send = vi.fn(async () => true)
    const structuredData = [{ type: 'citation', value: 'one' }]
    const draft = useChatDraft({ send })

    await draft.send({ text: 'hello', structuredData })
    expect(send).toHaveBeenCalledWith({ text: 'hello', structuredData })
  })
})

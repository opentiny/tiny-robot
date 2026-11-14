import { expect, test } from '@playwright/experimental-ct-vue'
import type { Locator } from '@playwright/test'
import SenderExtensionsFixture from './fixtures/SenderExtensions.fixture.vue'

const expectSelection = async (component: Locator, state: RegExp) => {
  await expect(component.getByTestId('selection-state')).toHaveText(state)
}

test.describe('Sender TemplateBlock deletion matrix', () => {
  test('BS-01 deletes only the target ordinary character inside a block', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-end').click()
    await expectSelection(component, /^empty\|templateBlock\|/)
    await editor.press('Backspace')
    await expect(component.getByTestId('block-texts')).toHaveText('["张"]')
    await expect(component.locator('.template-block')).toHaveCount(1)
  })

  test('BS-02 preserves an empty block after its last visible character is deleted', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'single' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-end').click()
    await expectSelection(component, /^empty\|templateBlock\|/)
    await editor.press('Backspace')
    await expect(component.locator('.template-block')).toHaveCount(1)
    await expect(component.getByTestId('block-texts')).toHaveText('[""]')

    await expectSelection(component, /^empty\|templateBlock\|/)
    await editor.pressSequentially('重填')
    await expect(component.getByTestId('block-texts')).toHaveText('["重填"]')
  })

  test('BS-03 moves out of an empty block on Backspace and keeps the block', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'empty' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-start').click()
    await expectSelection(component, /^empty\|templateBlock\|none\|text$/)
    await editor.press('Backspace')
    await expectSelection(component, /^empty\|paragraph\|text\|templateBlock$/)
    await expect(component.locator('.template-block')).toHaveCount(1)
    await expect(component.getByTestId('block-texts')).toHaveText('[""]')
    await editor.pressSequentially('X')
    await expect(component.getByTestId('editor-text')).toHaveText('左侧X右侧')
  })

  test('BS-04 exits a non-empty block at its start without absorbing preceding text', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-start').click()
    await expectSelection(component, /^empty\|templateBlock\|none\|text$/)
    await editor.press('Backspace')
    await expectSelection(component, /^empty\|paragraph\|text\|templateBlock$/)
    await expect(component.getByTestId('block-texts')).toHaveText('["张三"]')
    await editor.pressSequentially('X')
    await expect(component.getByTestId('editor-text')).toHaveText('我是X张三，来自')
  })

  test('BS-05 enters a non-empty block from its right side instead of deleting content', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-after-block').click()
    await expectSelection(component, /^empty\|paragraph\|templateBlock\|[^|]+$/)
    await editor.press('Backspace')
    await expectSelection(component, /^empty\|templateBlock\|/)
    await expect(component.getByTestId('editor-text')).toHaveText('我是张三，来自')
    await editor.pressSequentially('X')
    await expect(component.getByTestId('block-texts')).toHaveText('["张三X"]')
  })

  test('BS-06 deletes an empty block from its right while preserving surrounding text', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'empty' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-after-block').click()
    await expectSelection(component, /^empty\|paragraph\|templateBlock\|[^|]+$/)
    await editor.press('Backspace')
    await expect(component.locator('.template-block')).toHaveCount(0)
    await expect(component.getByTestId('editor-text')).toHaveText('左侧右侧')
  })

  test('BS-07 deletes the ordinary character before a block without damaging the boundary', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'single' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-before-block').click()
    await expectSelection(component, /^empty\|paragraph\|[^|]+\|templateBlock$/)
    await editor.press('Backspace')
    await expect(component.getByTestId('editor-text')).toHaveText('块右')
    await expect(component.locator('.template-block')).toHaveCount(1)
  })

  test('BS-08 enters the previous non-empty block between adjacent blocks', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'adjacent' },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-between-after-zero').click()
    await expectSelection(component, /^empty\|paragraph\|[^|]+\|templateBlock$/)
    await editor.press('Backspace')
    await editor.pressSequentially('X')
    await expect(component.getByTestId('block-texts')).toHaveText('["甲X","乙"]')
  })

  test('BS-09 removes the previous empty block between adjacent blocks and keeps the next block', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'empty-adjacent' },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-between-after-zero').click()
    await expectSelection(component, /^empty\|paragraph\|[^|]+\|templateBlock$/)
    await editor.press('Backspace')
    await expect(component.getByTestId('block-texts')).toHaveText('["乙"]')
    await expect(component.locator('.template-block')).toHaveCount(1)
  })

  test('BS-10 deletes a legal selection containing the whole block', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-range').click()
    await expectSelection(component, /^range\|paragraph\|/)
    await editor.press('Backspace')
    await expect(component.locator('.template-block')).toHaveCount(0)
    await expect(component.getByTestId('editor-text')).toHaveText('我是，来自')
  })

  test('DL-01 deletes only the target ordinary character inside a block', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-start').click()
    await expectSelection(component, /^empty\|templateBlock\|/)
    await editor.press('Delete')
    await expect(component.getByTestId('block-texts')).toHaveText('["三"]')
    await expect(component.locator('.template-block')).toHaveCount(1)
  })

  test('DL-02 preserves an empty block after its last visible character is deleted', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'single' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-start').click()
    await expectSelection(component, /^empty\|templateBlock\|/)
    await editor.press('Delete')
    await expect(component.locator('.template-block')).toHaveCount(1)
    await expect(component.getByTestId('block-texts')).toHaveText('[""]')

    await expectSelection(component, /^empty\|templateBlock\|/)
    await editor.pressSequentially('重填')
    await expect(component.getByTestId('block-texts')).toHaveText('["重填"]')
  })

  test('DL-03 moves out of an empty block on Delete and keeps the block', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'empty' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-start').click()
    await expectSelection(component, /^empty\|templateBlock\|none\|text$/)
    await editor.press('Delete')
    await expectSelection(component, /^empty\|paragraph\|templateBlock\|text$/)
    await expect(component.locator('.template-block')).toHaveCount(1)
    await expect(component.getByTestId('block-texts')).toHaveText('[""]')
    await editor.pressSequentially('X')
    await expect(component.getByTestId('editor-text')).toHaveText('左侧X右侧')
  })

  test('DL-04 exits a non-empty block at its end without absorbing following text', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-end').click()
    await expectSelection(component, /^empty\|templateBlock\|text\|none$/)
    await editor.press('Delete')
    await expectSelection(component, /^empty\|paragraph\|templateBlock\|text$/)
    await expect(component.getByTestId('block-texts')).toHaveText('["张三"]')
    await editor.pressSequentially('X')
    await expect(component.getByTestId('editor-text')).toHaveText('我是张三X，来自')
  })

  test('DL-05 enters a non-empty block from its left side instead of deleting content', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-before-block').click()
    await expectSelection(component, /^empty\|paragraph\|[^|]+\|templateBlock$/)
    await editor.press('Delete')
    await editor.pressSequentially('X')
    await expect(component.getByTestId('block-texts')).toHaveText('["X张三"]')
  })

  test('DL-06 deletes an empty block from its left while preserving surrounding text', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'empty' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-before-block').click()
    await expectSelection(component, /^empty\|paragraph\|[^|]+\|templateBlock$/)
    await editor.press('Delete')
    await expect(component.locator('.template-block')).toHaveCount(0)
    await expect(component.getByTestId('editor-text')).toHaveText('左侧右侧')
  })

  test('DL-07 deletes the ordinary character after a block without damaging the boundary', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'single' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-after-block').click()
    await expectSelection(component, /^empty\|paragraph\|templateBlock\|/)
    await editor.press('Delete')
    await expect(component.getByTestId('editor-text')).toHaveText('左块')
    await expect(component.getByTestId('block-texts')).toHaveText('["块"]')
    await expect(component.locator('.template-block')).toHaveCount(1)
  })

  test('DL-08 enters the next non-empty block between adjacent blocks', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'adjacent' },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-between-before-zero').click()
    await expectSelection(component, /^empty\|paragraph\|templateBlock\|text$/)
    await editor.press('Delete')
    await editor.pressSequentially('X')
    await expect(component.getByTestId('block-texts')).toHaveText('["甲","X乙"]')
  })

  test('DL-09 removes the next empty block between adjacent blocks and keeps the previous block', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'nonempty-empty' },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-between-before-zero').click()
    await expectSelection(component, /^empty\|paragraph\|templateBlock\|text$/)
    await editor.press('Delete')
    await expect(component.getByTestId('block-texts')).toHaveText('["甲"]')
    await expect(component.locator('.template-block')).toHaveCount(1)
  })

  test('DL-10 deletes a legal selection containing the whole block', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-range').click()
    await expectSelection(component, /^range\|paragraph\|/)
    await editor.press('Delete')
    await expect(component.locator('.template-block')).toHaveCount(0)
    await expect(component.getByTestId('editor-text')).toHaveText('我是，来自')
  })

  test('BS-11 clears the entire editor after a real Control+A selection', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.click()
    await editor.press('ControlOrMeta+A')
    await expectSelection(component, /^range\|/)
    await editor.press('Backspace')
    await expect(component.locator('.template-block')).toHaveCount(0)
    await expect(component.getByTestId('editor-text')).toHaveText('')
  })

  test('DL-11 clears the entire editor after a real Control+A selection', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.click()
    await editor.press('ControlOrMeta+A')
    await expectSelection(component, /^range\|/)
    await editor.press('Delete')
    await expect(component.locator('.template-block')).toHaveCount(0)
    await expect(component.getByTestId('editor-text')).toHaveText('')
  })

  test('BS-12 deletes a legal partial selection inside a block', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-partial').click()
    await expectSelection(component, /^range\|templateBlock\|/)
    await editor.press('Backspace')
    await expect(component.locator('.template-block')).toHaveCount(1)
    await expect(component.getByTestId('block-texts')).toHaveText('["三"]')
    await expect(component.getByTestId('editor-text')).toHaveText('我是三，来自')
  })

  test('DL-12 merges a legal cross-block selection and preserves the unselected suffix', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'adjacent' },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-cross-block').click()
    await expectSelection(component, /^range\|templateBlock\|/)
    await editor.press('Delete')
    await expect(component.locator('.template-block')).toHaveCount(1)
    await expect(component.getByTestId('block-texts')).toHaveText('["乙"]')
    await expect(component.getByTestId('editor-text')).toHaveText('乙')
  })
})

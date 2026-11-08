import { expect, test } from '@playwright/experimental-ct-vue'
import type { Locator } from '@playwright/test'
import SenderExtensionsFixture from './fixtures/SenderExtensions.fixture.vue'

async function dispatchPaste(editor: import('@playwright/test').Locator, text: string) {
  await editor.evaluate((element, value) => {
    const transfer = new DataTransfer()
    transfer.setData('text/plain', value)
    element.dispatchEvent(
      new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: transfer,
      }),
    )
  }, text)
}

const blocks = (component: { locator: (selector: string) => import('@playwright/test').Locator }) =>
  component.locator('.template-block')

const expectMultipleBlockState = async (
  component: Locator,
  texts: string[],
  activeBlock: number | 'none',
  selectionState: RegExp,
) => {
  await expect(blocks(component)).toHaveCount(texts.length)
  await expect(component.getByTestId('block-texts')).toHaveText(JSON.stringify(texts))
  await expect(component.getByTestId('selection-block-index')).toHaveText(String(activeBlock))
  await expect(component.getByTestId('selection-state')).toHaveText(selectionState)
}

test.describe('Sender TemplateBlock', () => {
  test('TEMPLATE-02 replaces the old structure when the template Ref changes', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'mixed' } })

    await component.getByTestId('set-template-empty').click()
    await expect(blocks(component)).toHaveCount(1)
    await expect(blocks(component).first()).toHaveText('')
    await expect(component.locator('.template-select')).toHaveCount(0)
    await expect(component.locator('.template-block').first()).toHaveClass(/is-empty/)
  })

  test('TEMPLATE-03 focuses the first block through the public template command', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('focus-first-template').click()
    await editor.pressSequentially('追加')
    await expect(blocks(component).first()).toHaveText('张三追加')
  })

  test('TEMPLATE-04 preserves a legal empty block and allows editing it', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'empty' } })
    const block = blocks(component).first()
    const content = block.locator('.template-block__content')

    await expect(block).toHaveClass(/is-empty/)
    await expect.poll(() => content.evaluate((element) => (element as HTMLElement).isContentEditable)).toBe(true)
    await component.getByTestId('select-block-start').click()
    await component.getByTestId('sender-root').locator('.ProseMirror').pressSequentially('填充')
    await expect(block).toHaveText('填充')
    await expect(block).not.toHaveClass(/is-empty/)
  })

  test('TEMPLATE-05 edits block content through the real node view', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-block-end').click()
    await expect(component.getByTestId('selection-state')).toHaveText('empty|templateBlock|text|none')
    await editor.press('Backspace')
    await expect(component.getByTestId('block-texts')).toHaveText('["张"]')
    await editor.press('Backspace')
    await expect(component.getByTestId('block-texts')).toHaveText('[""]')
    await editor.pressSequentially('李四')
    await expect(component.getByTestId('block-texts')).toHaveText('["李四"]')
    await expect(component.getByTestId('editor-text')).toHaveText('我是李四，来自')
  })

  test('TEMPLATE-06 accepts legal plain-text paste through Sender', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'simple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('focus-first-template').click()
    await dispatchPaste(editor, '粘贴')
    await expect(blocks(component).first()).toHaveText('张三粘贴')
  })

  test('TEMPLATE-07 follows each legal Backspace transition across continuous blocks', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'multiple' },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-last-block-end').click()
    await expectMultipleBlockState(component, ['姓名', '年龄', '城市'], 2, /^empty\|templateBlock\|text\|none$/)
    await editor.press('Backspace')
    await expectMultipleBlockState(component, ['姓名', '年龄', '城'], 2, /^empty\|templateBlock\|text\|none$/)

    await editor.press('Backspace')
    await expectMultipleBlockState(component, ['姓名', '年龄', ''], 2, /^empty\|templateBlock\|text\|none$/)
    await expect(component.getByTestId('raw-editor-text')).toContainText('\u200b')
    await editor.press('Backspace')
    await expectMultipleBlockState(component, ['姓名', '年龄', ''], 'none', /^empty\|paragraph\|text\|templateBlock$/)

    await editor.press('Backspace')
    await expectMultipleBlockState(component, ['姓名', '年龄', ''], 1, /^empty\|templateBlock\|text\|none$/)

    await editor.press('Backspace')
    await expectMultipleBlockState(component, ['姓名', '年', ''], 1, /^empty\|templateBlock\|text\|none$/)

    await editor.press('Backspace')
    await expectMultipleBlockState(component, ['姓名', '', ''], 1, /^empty\|templateBlock\|text\|none$/)

    await editor.press('Backspace')
    await expectMultipleBlockState(component, ['姓名', '', ''], 'none', /^empty\|paragraph\|text\|templateBlock$/)

    await editor.press('Backspace')
    await expectMultipleBlockState(component, ['姓名', '', ''], 0, /^empty\|templateBlock\|text\|none$/)

    await editor.press('Backspace')
    await expectMultipleBlockState(component, ['姓', '', ''], 0, /^empty\|templateBlock\|text\|none$/)

    await editor.press('Backspace')
    await expectMultipleBlockState(component, ['', '', ''], 0, /^empty\|templateBlock\|text\|none$/)

    await editor.press('Backspace')
    await expectMultipleBlockState(component, ['', '', ''], 'none', /^empty\|paragraph\|text\|templateBlock$/)
    await expect(component.getByTestId('raw-editor-text')).toContainText('\u200b')
  })

  test('COMPACT-TEMPLATE-SUBMIT renders mixed Ref nodes then submits exact structured content', async ({
    mount,
    page,
  }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'template', templateScenario: 'mixed' } })
    const select = component.locator('.template-select__trigger')

    await expect(blocks(component)).toHaveCount(1)
    await expect(component.locator('.template-select')).toHaveCount(1)
    await expect(blocks(component).first()).toHaveText('原值')
    await expect(component.locator('.template-select__text')).toHaveText('请选择')
    await select.click()
    await page.locator('.template-select__option').first().click()
    await component.getByTestId('sender-root').locator('.tr-sender-submit-button').click()

    await expect(component.getByTestId('last-submit')).toHaveText(
      '["前缀 原值 中间 first 后缀",[{"type":"text","content":"前缀 "},{"type":"block","content":"原值"},{"type":"text","content":" 中间 "},{"type":"select","content":"first"},{"type":"text","content":" 后缀"}]]',
    )
    await expect(component.getByTestId('last-submit')).not.toContainText('\\u200b')
  })
})

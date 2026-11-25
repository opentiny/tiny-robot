import { expect, test } from '@playwright/experimental-ct-vue'
import SenderModeAndAutoSizeFixture from './fixtures/SenderModeAndAutoSize.fixture.vue'

test.describe('Sender mode and autoSize', () => {
  test('MODE-01 starts in single mode', async ({ mount }) => {
    const component = await mount(SenderModeAndAutoSizeFixture, { props: { mode: 'single' } })

    await expect(component.getByTestId('sender-root')).toHaveClass(/tr-sender--single/)
    await expect(component.getByTestId('sender-root')).toHaveClass(/tr-sender--normal/)
    await expect(component.getByTestId('mode-output')).toHaveText('single')
    await component.getByTestId('toggle-mode').click()
    await expect(component.getByTestId('sender-root')).toHaveClass(/tr-sender--multiple/)
    await expect(component.getByTestId('mode-output')).toHaveText('multiple')
    await component.getByTestId('toggle-mode').click()
    await expect(component.getByTestId('sender-root')).toHaveClass(/tr-sender--single/)
    await expect(component.getByTestId('mode-output')).toHaveText('single')
    await component.getByTestId('toggle-size').click()
    await expect(component.getByTestId('sender-root')).toHaveClass(/tr-sender--small/)
  })

  test('COMPACT-MODE-OVERFLOW expands on overflow and returns to single after clearing', async ({ mount }) => {
    const component = await mount(SenderModeAndAutoSizeFixture, { props: { mode: 'single', width: '160px' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('a'.repeat(120))
    await expect.poll(() => component.getByTestId('sender-root').getAttribute('class')).toMatch(/tr-sender--multiple/)
    await expect(component.getByTestId('sender-root')).not.toHaveClass(/is-auto-switching/)
    await component.getByTestId('clear-value').click()
    await expect.poll(() => component.getByTestId('sender-root').getAttribute('class')).toMatch(/tr-sender--single/)
  })

  test('COMPACT-MODE-MULTIPLE starts multiple and stays multiple after clearing', async ({ mount }) => {
    const component = await mount(SenderModeAndAutoSizeFixture, { props: { mode: 'multiple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await expect(component.getByTestId('sender-root')).toHaveClass(/tr-sender--multiple/)
    await expect(component.getByTestId('mode-output')).toHaveText('multiple')
    await editor.pressSequentially('content')
    await component.getByTestId('clear-value').click()
    await expect(component.getByTestId('sender-root')).toHaveClass(/tr-sender--multiple/)
  })

  test('MODE-07 disables autoSize when configured false', async ({ mount }) => {
    const component = await mount(SenderModeAndAutoSizeFixture, { props: { mode: 'multiple', autoSize: false } })
    const scroll = component.getByTestId('sender-root').locator('.tr-sender-editor-scroll')

    await expect
      .poll(() =>
        scroll.evaluate((element) => ({
          min: element.style.minHeight,
          max: element.style.maxHeight,
          overflow: element.style.overflowY,
        })),
      )
      .toEqual({
        min: '',
        max: '',
        overflow: 'auto',
      })
  })

  test('MODE-08 configures default autoSize rows and scrolling', async ({ mount }) => {
    const component = await mount(SenderModeAndAutoSizeFixture, { props: { mode: 'multiple', autoSize: true } })
    const scroll = component.getByTestId('sender-root').locator('.tr-sender-editor-scroll')
    await expect
      .poll(() =>
        scroll.evaluate((element) => [element.style.minHeight, element.style.maxHeight, element.style.overflowY]),
      )
      .toEqual(['26px', '130px', 'auto'])
  })

  test('MODE-09 configures custom autoSize rows', async ({ mount }) => {
    const component = await mount(SenderModeAndAutoSizeFixture, {
      props: { mode: 'multiple', autoSize: { minRows: 2, maxRows: 4 } },
    })
    const scroll = component.getByTestId('sender-root').locator('.tr-sender-editor-scroll')
    await expect
      .poll(() => scroll.evaluate((element) => [element.style.minHeight, element.style.maxHeight]))
      .toEqual(['52px', '104px'])
  })
})

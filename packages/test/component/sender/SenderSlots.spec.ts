import { expect, test } from '@playwright/experimental-ct-vue'
import SenderSlotsFixture from './fixtures/SenderSlots.fixture.vue'

test.describe('Sender public slots', () => {
  test('SLOT-01 renders header and prefix in single mode', async ({ mount }) => {
    const component = await mount(SenderSlotsFixture, { props: { mode: 'single' } })

    await expect(component.getByTestId('header-slot')).toHaveText('header')
    await expect(component.getByTestId('prefix-slot')).toHaveText('prefix')
  })

  test('SLOT-02 uses the public content slot for the real editor', async ({ mount }) => {
    const component = await mount(SenderSlotsFixture, { props: { mode: 'single' } })
    const slot = component.getByTestId('content-slot')

    await expect(slot).toBeVisible()
    await expect(slot.locator('.ProseMirror')).toHaveAttribute('contenteditable', 'true')
    await slot.locator('.ProseMirror').pressSequentially('slot content')
    await expect(slot.locator('.ProseMirror')).toHaveText('slot content')
  })

  test('SLOT-03 renders actions-inline with scoped state in single mode', async ({ mount }) => {
    const component = await mount(SenderSlotsFixture, { props: { mode: 'single' } })

    await expect(component.getByTestId('actions-inline-slot')).toBeVisible()
    await expect(component.getByTestId('scope-state')).toHaveText('false|false|false')
  })

  test('SLOT-04 renders header, prefix, content, and migrated actions-inline slots in multiple mode', async ({
    mount,
  }) => {
    const component = await mount(SenderSlotsFixture, { props: { mode: 'multiple' } })

    await expect(component.getByTestId('header-slot')).toBeVisible()
    await expect(component.getByTestId('prefix-slot')).toBeVisible()
    const editor = component.getByTestId('content-slot').locator('.ProseMirror')
    await expect(editor).toBeVisible()
    await editor.pressSequentially('multiple slot content')
    await expect(editor).toHaveText('multiple slot content')
    await expect(component.getByTestId('actions-inline-slot')).toBeVisible()
  })

  test('SLOT-05 renders the scoped footer slot in multiple mode', async ({ mount }) => {
    const component = await mount(SenderSlotsFixture, { props: { mode: 'multiple' } })

    await expect(component.getByTestId('footer-slot')).toBeVisible()
    await expect(component.getByTestId('footer-scope-state')).toHaveText('false|false|false')
    const editor = component.getByTestId('content-slot').locator('.ProseMirror')

    await component.getByTestId('footer-insert').click()
    await expect.poll(() => editor.textContent()).toBe('footer-insert ')
    await expect(component.getByTestId('footer-scope-state')).toHaveText('false|false|true')
    await expect(component.getByTestId('scope-state')).toHaveText('false|false|true')
    await component.getByTestId('insert-action').click()
    await expect.poll(() => editor.textContent()).toBe('footer-insert inserted ')
    await component.getByTestId('footer-append').click()
    await expect.poll(() => editor.textContent()).toBe('footer-insert inserted footer-append')
    await component.getByTestId('footer-replace').click()
    await expect(editor).toHaveText('footer-replace')
    await component.getByTestId('footer-focus').click()
    await expect(editor).toBeFocused()
    await component.getByTestId('footer-blur').dispatchEvent('click')
    await expect(editor).not.toBeFocused()
  })

  test('SLOT-06 renders footer-right in the public multiple layout', async ({ mount }) => {
    const component = await mount(SenderSlotsFixture, { props: { mode: 'multiple' } })

    await expect(component.getByTestId('footer-right-slot')).toBeVisible()
    await component.getByTestId('footer-right-slot').click()
    await expect(component.getByTestId('action-log')).toHaveText('false')
  })

  test('SLOT-07 exposes insert, append, replace, focus, blur, and scoped state', async ({ mount }) => {
    const component = await mount(SenderSlotsFixture, { props: { mode: 'single' } })
    const editor = component.getByTestId('content-slot').locator('.ProseMirror')

    await editor.pressSequentially('base')
    await expect(component.getByTestId('scope-state')).toHaveText('false|false|true')
    await component.getByTestId('insert-action').click()
    await expect(editor).toHaveText('baseinserted ')
    await component.getByTestId('append-action').click()
    await expect(editor).toHaveText('baseinserted appended')
    await component.getByTestId('replace-action').click()
    await expect(editor).toHaveText('replaced')
    await component.getByTestId('focus-action').click()
    await expect(editor).toBeFocused()
    await component.getByTestId('blur-action').dispatchEvent('click')
    await expect(editor).not.toBeFocused()
  })
})

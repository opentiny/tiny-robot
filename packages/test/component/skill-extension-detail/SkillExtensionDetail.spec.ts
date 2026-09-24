import { expect, test } from '@playwright/experimental-ct-vue'
import SkillExtensionDetailFixture from './SkillExtensionDetail.fixture.vue'

test.describe('SkillExtensionDetail', () => {
  test('renders the Skill definition as read-only detail content', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('detail')

    await expect(detail).toContainText('名称：tiny-genui-skill')
    await expect(detail).toContainText('描述：生成 OpenTiny GenUI schema.json 时使用的 Skill。')
    await expect(detail).toContainText('2 个资源')
    await expect(detail).toContainText('更新于 2026-07-10')
    await expect(detail.getByRole('tab', { name: 'SKILL.md' })).toHaveAttribute('aria-selected', 'true')
    await expect(detail.getByRole('tabpanel', { name: 'SKILL.md' }).getByRole('textbox')).toHaveValue(
      /# 使用说明\n\n仅输出符合约束的 GenUI schema。/,
    )

    await detail.getByRole('tab', { name: '资源文件' }).click()
    const resources = detail.getByRole('tabpanel', { name: '资源文件' })
    await expect(resources.getByRole('listitem')).toHaveText(['references/schema.md1.5 KB', 'assets/example.png2 KB'])
  })

  test('renders useful defaults when description and resources are empty', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('empty-detail')

    await expect(detail).toContainText('名称：empty-skill')
    await expect(detail).toContainText('描述：暂无描述')
    await expect(detail).toContainText('0 个资源')
    await detail.getByRole('tab', { name: '资源文件' }).click()
    await expect(detail.getByRole('tabpanel', { name: '资源文件' })).toContainText('暂无资源文件')
  })

  test('focuses and selects all SKILL.md text while keeping it read-only', async ({ mount, page }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('detail')
    const editor = detail.getByRole('textbox', { name: 'SKILL.md' })
    const instructions = await editor.inputValue()

    await expect(editor).toHaveJSProperty('readOnly', true)
    expect(await editor.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)

    await detail.getByRole('tab', { name: 'SKILL.md' }).focus()
    await page.keyboard.press('Tab')
    await expect(editor).toBeFocused()

    await editor.press('ControlOrMeta+A')
    await expect(editor).toHaveJSProperty('selectionStart', 0)
    await expect(editor).toHaveJSProperty('selectionEnd', instructions.length)

    await editor.press('Backspace')
    await expect(editor).toHaveValue(instructions)
  })

  test('switches tabs from the keyboard and scrolls long resource lists within a fixed height', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('many-resources-detail')
    const skillTab = detail.getByRole('tab', { name: 'SKILL.md' })
    const resourcesTab = detail.getByRole('tab', { name: '资源文件' })
    const editor = detail.getByRole('textbox', { name: 'SKILL.md' })

    await expect(editor).toHaveCSS('max-height', '320px')
    expect(await editor.evaluate((element) => element.clientHeight)).toBeGreaterThan(240)
    expect(await editor.evaluate((element) => element.clientHeight)).toBeLessThanOrEqual(320)

    await skillTab.focus()
    await skillTab.press('ArrowRight')
    await expect(resourcesTab).toBeFocused()
    await expect(resourcesTab).toHaveAttribute('aria-selected', 'true')

    const resources = detail.getByRole('tabpanel', { name: '资源文件' })
    await expect(resources.getByRole('listitem').first()).toHaveText('references/file-1.md')
    await expect(resources).toContainText('references/file-12.md')
    await expect(resources).toHaveCSS('max-height', '320px')
    expect(await resources.evaluate((element) => element.clientHeight)).toBeGreaterThan(240)
    expect(await resources.evaluate((element) => element.clientHeight)).toBeLessThanOrEqual(320)
    expect(await resources.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)

    await resourcesTab.press('ArrowLeft')
    await expect(skillTab).toBeFocused()
    await expect(skillTab).toHaveAttribute('aria-selected', 'true')
    await expect(editor).toBeVisible()
  })

  test('uses a 240px content height limit by default', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('detail')

    await expect(detail.getByRole('textbox', { name: 'SKILL.md' })).toHaveCSS('max-height', '240px')
    await detail.getByRole('tab', { name: '资源文件' }).click()
    await expect(detail.getByRole('tabpanel', { name: '资源文件' })).toHaveCSS('max-height', '240px')
  })
})

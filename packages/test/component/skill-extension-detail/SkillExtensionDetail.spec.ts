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
    await expect(detail.getByRole('heading', { name: '技能说明' })).toBeVisible()
    await expect(detail).toContainText('仅输出符合约束的 GenUI schema。')
    await expect(detail.getByRole('heading', { name: '资源文件' })).toBeVisible()
    await expect(detail).toContainText('references/schema.md')
    await expect(detail).toContainText('文本 · 1.5 KB')
    await expect(detail).toContainText('assets/example.png')
    await expect(detail).toContainText('二进制 · 2 KB')
  })

  test('renders useful defaults when description and resources are empty', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('empty-detail')

    await expect(detail).toContainText('名称：empty-skill')
    await expect(detail).toContainText('描述：暂无描述')
    await expect(detail).toContainText('0 个资源')
    await expect(detail).toContainText('暂无资源文件')
  })

  test('keeps overflowing instructions reachable from the keyboard', async ({ mount, page }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const instructions = component.getByTestId('detail').getByRole('region', { name: '技能说明' })

    expect(await instructions.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)

    await page.keyboard.press('Tab')
    await expect(instructions).toBeFocused()
  })
})

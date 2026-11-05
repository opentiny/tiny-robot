import { expect, test } from '@playwright/experimental-ct-vue'
import ToolTitleFixture from './ToolTitle.fixture.vue'

const names = [
  'mcp__analytics_workspace__fetch_quarterly_report_breakdown_by_region_and_business_unit',
  '根据时间范围查询不同地区和业务线的季度报告并汇总同比变化',
  'Fetch the quarterly report and group revenue by region and business unit',
  '📊 Analytics 查询季度报告 🌏 Group revenue by region',
  'search',
]

test('aligns tool headers on one line and truncates only long names', async ({ mount }) => {
  const component = await mount(ToolTitleFixture, { props: { names } })
  const bubble = component.locator('.tr-bubble')
  const tools = bubble.locator('[data-type="tool-call"]')
  await expect(tools).toHaveCount(names.length)

  for (const [index, name] of names.entries()) {
    const tool = tools.nth(index)
    const title = tool.getByText(name, { exact: true })
    const status = tool.getByText(index === 0 ? '等待确认' : '已调用', { exact: true })
    const icon = tool.locator('.header-icon')
    const arrow = tool.locator('.expand-icon')
    await expect(icon).toBeVisible()
    await expect(arrow).toBeVisible()

    const nameLayout = await title.evaluate((el) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      const textBounds = range.getBoundingClientRect()
      const { lineHeight, textOverflow } = getComputedStyle(el)
      return {
        singleLine: textBounds.height <= Number.parseFloat(lineHeight),
        clipped: el.scrollWidth > el.clientWidth && textOverflow === 'ellipsis',
      }
    })
    expect(nameLayout, name).toEqual({ singleLine: true, clipped: name !== 'search' })

    const [nameBox, statusBox, iconBox, arrowBox, bubbleBox] = await Promise.all([
      title.boundingBox(),
      status.boundingBox(),
      icon.boundingBox(),
      arrow.boundingBox(),
      bubble.boundingBox(),
    ])
    const titleCenter = nameBox!.y + nameBox!.height / 2
    expect(Math.abs(titleCenter - (statusBox!.y + statusBox!.height / 2))).toBeLessThan(2)
    expect.soft(iconBox!.y + iconBox!.height / 2, `${name}: status icon`).toBeCloseTo(titleCenter, 0)
    expect.soft(arrowBox!.y + arrowBox!.height / 2, `${name}: expand arrow`).toBeCloseTo(titleCenter, 0)
    expect(nameBox!.x + nameBox!.width).toBeLessThanOrEqual(arrowBox!.x)
    expect(arrowBox!.x + arrowBox!.width).toBeLessThanOrEqual(bubbleBox!.x + bubbleBox!.width)
  }
})

test('keeps the full name available in the title without repeating it in call details', async ({ mount }) => {
  const component = await mount(ToolTitleFixture, { props: { names } })
  const tool = component.locator('[data-type="tool-call"]').first()
  const title = tool.getByText(names[0], { exact: true })
  await expect(title).toHaveAttribute('title', names[0])

  const expand = tool.locator('.expand-icon')
  await expand.click()
  const callArguments = tool.getByText(/"query":\s*"quarterly report"/)
  await expect(callArguments).toBeVisible()
  await expect(title).toHaveCount(1)

  await tool.getByRole('button', { name: '允许' }).click({ trial: true })
  await tool.getByRole('button', { name: '拒绝' }).click({ trial: true })

  await expand.click()
  await expect(callArguments).toBeHidden()
})

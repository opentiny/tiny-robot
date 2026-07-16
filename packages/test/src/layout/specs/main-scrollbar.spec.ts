import { expect, test } from '../helpers'

test.describe('Layout 组件测试 - Main Scrollbar', () => {
  test('Props: scrollTarget - 应解析真实滚动宿主', async ({ layout }) => {
    await expect(layout.scrollTarget).toBeVisible()
  })

  test('虚拟滚动条 - 长列表时应显示并随滚动同步', async ({ layout }) => {
    const { scrollTarget, scrollbarThumb: thumb, scrollbar } = layout

    await scrollTarget.hover()
    await expect(scrollbar).toBeVisible()

    const before = await thumb.evaluate((node) => window.getComputedStyle(node).transform)
    await scrollTarget.evaluate((node) => {
      node.scrollTop = 320
      node.dispatchEvent(new Event('scroll'))
    })

    await expect.poll(async () => thumb.evaluate((node) => window.getComputedStyle(node).transform)).not.toBe(before)
  })

  test('thumb 拖拽 - 应驱动 scrollTarget 滚动', async ({ layout }) => {
    await layout.scrollTarget.hover()
    await layout.dragBy(layout.scrollbarThumb, 0, 120)

    await expect.poll(async () => layout.scrollTarget.evaluate((node) => node.scrollTop)).toBeGreaterThan(0)
  })

  test('thumb 拖拽 - 应锁定并恢复 body 交互', async ({ layout }) => {
    await layout.scrollTarget.hover()
    const thumb = layout.scrollbarThumb
    const box = await thumb.boundingBox()

    if (!box) {
      throw new Error('Missing scrollbar thumb')
    }

    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2

    await layout.page.mouse.move(startX, startY)
    await layout.page.mouse.down()

    await expect
      .poll(async () => layout.page.evaluate(() => `${document.body.style.cursor}|${document.body.style.userSelect}`))
      .toBe('grabbing|none')

    await layout.page.mouse.up()

    await expect
      .poll(async () => layout.page.evaluate(() => `${document.body.style.cursor}|${document.body.style.userSelect}`))
      .toBe('|')
  })

  test('内容追加后 - metrics 应同步更新', async ({ layout }) => {
    const thumb = layout.scrollbarThumb
    const before = await thumb.evaluate((node) => node.getBoundingClientRect().height)

    await layout.appendMessages()
    await expect.poll(async () => (await layout.readHarness()).messagesCount).toBe(60)

    await expect.poll(async () => thumb.evaluate((node) => node.getBoundingClientRect().height)).toBeLessThan(before)
  })

  test('内容从不可滚动变为可滚动后 - 应自动显示代理滚动条', async ({ layout }) => {
    await layout.resetMessagesToShortList()
    await expect.poll(async () => (await layout.readHarness()).messagesCount).toBe(2)
    await expect(layout.scrollbar).toHaveCount(0)

    await layout.appendMessages()
    await expect.poll(async () => (await layout.readHarness()).messagesCount).toBe(22)
    await layout.scrollTarget.hover()

    await expect(layout.scrollbar).toBeVisible()
  })

  test('滚动条下边界 - thumb 不应越出轨道', async ({ layout }) => {
    const { scrollTarget, scrollbar: track, scrollbarThumb: thumb } = layout

    await scrollTarget.evaluate((node) => {
      node.scrollTop = node.scrollHeight
      node.dispatchEvent(new Event('scroll'))
    })

    await expect
      .poll(async () => {
        const trackBox = await track.boundingBox()
        const thumbBox = await thumb.boundingBox()

        if (!trackBox || !thumbBox) {
          return false
        }

        return thumbBox.y + thumbBox.height <= trackBox.y + trackBox.height + 1
      })
      .toBe(true)
  })
})

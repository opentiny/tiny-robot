import { test, type Page } from '@playwright/test'
import { createMentionHelper } from '../../helpers/mention-helper'
import { createSenderTestHelper } from '../../helpers'

test.describe('Mention 功能 - Atom 节点行为', () => {
  test.describe.configure({ mode: 'serial' })

  let page: Page | undefined
  let mentionHelper: ReturnType<typeof createMentionHelper> | undefined
  let basicHelper: ReturnType<typeof createSenderTestHelper> | undefined

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
    await page.click('text=Sender 组件')
    mentionHelper = createMentionHelper(page)
    basicHelper = createSenderTestHelper(page)

    await basicHelper.toggleMention()
    await basicHelper.wait(300)
  })

  test.afterAll(async () => {
    if (basicHelper) {
      await basicHelper.toggleMention()
    }
    await page?.close()
  })

  test.beforeEach(async () => {
    await basicHelper!.clearContent()
  })

  test('TC-09: 选中提及项后应该插入 Atom 节点', async () => {
    await mentionHelper!.typeAtSymbol()
    await mentionHelper!.pressKey('Enter')
    await mentionHelper!.expectMentionExists('小小画家')
    await mentionHelper!.expectMentionListVisible(false)
  })

  test('TC-10: 鼠标点击选中提及项应该插入 Atom 节点', async () => {
    await mentionHelper!.typeAtSymbol()
    await mentionHelper!.clickItem(1)

    await mentionHelper!.expectMentionExists('代码助手')
    await mentionHelper!.expectMentionListVisible(false)
  })

  test('TC-11: Backspace 应该删除整个 Atom 节点', async () => {
    await mentionHelper!.typeAtSymbol()
    await mentionHelper!.pressKey('Enter')
    await mentionHelper!.expectMentionExists('小小画家')

    await mentionHelper!.deleteMention()
    await mentionHelper!.expectMentionCount(0)
  })

  test('TC-12: 可以在 Atom 节点后继续输入', async () => {
    await mentionHelper!.typeAtSymbol()
    await mentionHelper!.pressKey('Enter')

    await page!.keyboard.type(' 帮我画画')
    await basicHelper!.expectEditorContent('小小画家 帮我画画')
  })
})

import { test, type Page } from '@playwright/test'
import { createMentionHelper } from '../../helpers/mention-helper'
import { createChatInputTestHelper } from '../../helpers/index'

test.describe('Mention 功能 - 触发机制', () => {
  let mentionHelper: ReturnType<typeof createMentionHelper>
  let basicHelper: ReturnType<typeof createChatInputTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.click('text=ChatInput 组件')
    mentionHelper = createMentionHelper(page)
    basicHelper = createChatInputTestHelper(page)
  })

  test('TC-01: 输入 @ 符号应该触发技能选择面板', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.expectMentionListVisible(true)
    await mentionHelper.expectSkillCount(4) // 默认有4个技能
  })

  test('TC-02: 输入非 @ 字符不应该触发面板', async () => {
    await basicHelper.typeContent('Hello')
    await mentionHelper.expectMentionListVisible(false)
  })

  test('TC-03: 在已有文本后输入 @ 应该触发面板', async () => {
    await basicHelper.typeContent('Hello ')
    await mentionHelper.typeAtSymbol()
    await mentionHelper.expectMentionListVisible(true)
  })

  test('TC-04: 删除 @ 符号应该关闭面板', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.expectMentionListVisible(true)

    await mentionHelper.deleteSkillMention() // 这里其实是删除字符
    await mentionHelper.expectMentionListVisible(false)
  })
})

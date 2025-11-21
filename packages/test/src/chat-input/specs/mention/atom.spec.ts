import { test, type Page } from '@playwright/test'
import { createMentionHelper } from '../../helpers/mention-helper'
import { createChatInputTestHelper } from '../../helpers/index'

test.describe('Mention 功能 - Atom 节点行为', () => {
  let mentionHelper: ReturnType<typeof createMentionHelper>
  let basicHelper: ReturnType<typeof createChatInputTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.click('text=ChatInput 组件')
    mentionHelper = createMentionHelper(page)
    basicHelper = createChatInputTestHelper(page)
  })

  test('TC-09: 选中技能后应该插入 Atom 节点', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.pressKey('Enter') // 选中第一个

    await mentionHelper.expectSkillMentionExists('小小画家')
    await mentionHelper.expectMentionListVisible(false)
  })

  test('TC-10: 鼠标点击选中技能应该插入 Atom 节点', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.clickSkill(1) // 点击第二个 "代码助手"

    await mentionHelper.expectSkillMentionExists('代码助手')
    await mentionHelper.expectMentionListVisible(false)
  })

  test('TC-11: Backspace 应该删除整个 Atom 节点', async () => {
    // 插入节点
    await mentionHelper.typeAtSymbol()
    await mentionHelper.pressKey('Enter')
    await mentionHelper.expectSkillMentionExists('小小画家')

    // 删除
    await mentionHelper.deleteSkillMention()
    await mentionHelper.expectSkillMentionCount(0)
  })

  test('TC-12: 可以在 Atom 节点后继续输入', async ({ page }) => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.pressKey('Enter')

    // 使用 keyboard.type 追加内容，而不是 setContent/fill (会清空)
    await page.keyboard.type(' 帮我画画')
    await basicHelper.expectEditorContent('小小画家 帮我画画')
  })
})

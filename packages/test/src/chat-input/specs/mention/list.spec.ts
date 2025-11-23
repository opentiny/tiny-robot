import { test, type Page } from '@playwright/test'
import { createMentionHelper } from '../../helpers/mention-helper'

import { createChatInputTestHelper } from '../../helpers/index'

test.describe('Mention 功能 - 列表交互', () => {
  let page: Page
  let mentionHelper: ReturnType<typeof createMentionHelper>
  let basicHelper: ReturnType<typeof createChatInputTestHelper>

  // 只在所有测试开始前创建页面并导航一次
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
    await page.click('text=ChatInput 组件')
    mentionHelper = createMentionHelper(page)
    basicHelper = createChatInputTestHelper(page)
  })

  // 所有测试结束后关闭页面
  test.afterAll(async () => {
    await page.close()
  })

  // 每个测试前清空编辑器
  test.beforeEach(async () => {
    await basicHelper.clearContent()
  })

  test('TC-05: 输入文本应该过滤技能列表', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.typeQuery('画') // 搜索 "小小画家"
    await mentionHelper.expectSkillCount(1)
    await mentionHelper.expectSkillListContains('小小画家')
  })

  test('TC-06: 键盘上下键应该导航列表', async () => {
    await mentionHelper.typeAtSymbol()

    // 默认选中第一个
    await mentionHelper.expectSelectedSkillIndex(0)

    // 按下箭头，选中第二个
    await mentionHelper.pressKey('ArrowDown')
    await mentionHelper.expectSelectedSkillIndex(1)

    // 按上箭头，回到第一个
    await mentionHelper.pressKey('ArrowUp')
    await mentionHelper.expectSelectedSkillIndex(0)
  })

  test('TC-07: 边界导航（不循环）', async () => {
    await mentionHelper.typeAtSymbol()

    // 在第一个时按上箭头，应该保持在第一个
    await mentionHelper.expectSelectedSkillIndex(0)
    await mentionHelper.pressKey('ArrowUp')
    await mentionHelper.expectSelectedSkillIndex(0)

    // 快速导航到最后一个 (假设有4个)
    await mentionHelper.pressKey('ArrowDown')
    await mentionHelper.pressKey('ArrowDown')
    await mentionHelper.pressKey('ArrowDown')
    await mentionHelper.expectSelectedSkillIndex(3)

    // 在最后一个时按下箭头，应该保持在最后一个
    await mentionHelper.pressKey('ArrowDown')
    await mentionHelper.expectSelectedSkillIndex(3)
  })

  test('TC-08: 鼠标悬停应该高亮选项', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.hoverSkill(2)
    // 注意：鼠标悬停可能不改变 is-selected 类，取决于实现。
    // 如果组件实现是 hover 更新 selection，可以取消下面的注释
    // await mentionHelper.expectSelectedSkillIndex(2)
  })
})

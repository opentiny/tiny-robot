import { expect, test, type Locator, type Page } from '@playwright/test'

function getTrigger(page: Page, testId: string) {
  return page.getByTestId(testId).getByRole('button')
}

async function getListbox(page: Page, testId: string) {
  const listboxId = await getTrigger(page, testId).getAttribute('aria-controls')
  expect(listboxId).toBeTruthy()
  return page.locator(`[id="${listboxId}"]`)
}

async function getSearch(page: Page, testId: string) {
  return (await getListbox(page, testId)).locator('..').getByRole('combobox')
}

async function getActiveOption(page: Page, focusOwner: Locator) {
  const activeDescendantId = await focusOwner.getAttribute('aria-activedescendant')
  expect(activeDescendantId).toBeTruthy()
  return page.locator(`[id="${activeDescendantId}"]`)
}

test.describe('ModelSelector 组件测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'ModelSelector 组件' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'ModelSelector 组件测试' })).toBeVisible()
  })

  test.describe('状态契约', () => {
    test('初始化和异步 models 更新不应隐式选择或触发 change', async ({ page }) => {
      await expect(getTrigger(page, 'init-selector')).toContainText('选择模型')
      await expect(page.getByTestId('init-updates')).toHaveText('0')
      await expect(page.getByTestId('init-changes')).toHaveText('0')

      await expect(getTrigger(page, 'async-selector')).toContainText('选择模型')
      await page.getByTestId('load-async-models').click()
      await expect(getTrigger(page, 'async-selector')).toContainText('选择模型')
      await expect(page.getByTestId('async-updates')).toHaveText('0')
      await expect(page.getByTestId('async-changes')).toHaveText('0')
    })

    test('非受控 value/open 应内部更新，重复选择只关闭不重复发事件', async ({ page }) => {
      const trigger = getTrigger(page, 'uncontrolled-selector')

      await expect(trigger).toContainText('Claude Sonnet')
      await expect(page.getByTestId('uncontrolled-updates')).toHaveText('0')
      await expect(page.getByTestId('uncontrolled-changes')).toHaveText('0')

      await trigger.click()
      const listbox = await getListbox(page, 'uncontrolled-selector')
      await listbox.getByRole('option', { name: /Claude Sonnet/ }).click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(page.getByTestId('uncontrolled-updates')).toHaveText('0')
      await expect(page.getByTestId('uncontrolled-changes')).toHaveText('0')

      await trigger.click()
      await listbox.getByRole('option', { name: /GPT-4o/ }).click()
      await expect(trigger).toContainText('GPT-4o')
      await expect(page.getByTestId('uncontrolled-updates')).toHaveText('1')
      await expect(page.getByTestId('uncontrolled-changes')).toHaveText('1')
      await expect(page.getByTestId('uncontrolled-last-value')).toHaveText('gpt-4o')
      await expect(page.getByTestId('uncontrolled-open-updates')).toHaveText('4')
    })

    test('受控 value/open 应由父级回写，外部打开不产生 update:open', async ({ page }) => {
      const trigger = getTrigger(page, 'controlled-selector')

      await page.getByTestId('controlled-open').click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      const listbox = await getListbox(page, 'controlled-selector')
      await expect(listbox).toBeVisible()
      await expect(page.getByTestId('controlled-open-updates')).toHaveText('0')

      await listbox.getByRole('option', { name: /Claude Sonnet/ }).click()
      await expect(page.getByTestId('controlled-value')).toHaveText('claude-sonnet')
      await expect(page.getByTestId('controlled-updates')).toHaveText('1')
      await expect(page.getByTestId('controlled-changes')).toHaveText('1')
      await expect(page.getByTestId('controlled-open-updates')).toHaveText('1')
      await expect(trigger).toContainText('Claude Sonnet')

      await page.getByTestId('controlled-open').click()
      await (await getSearch(page, 'controlled-selector')).press('Escape')
      await expect(page.getByTestId('controlled-open-state')).toHaveText('false')
      await expect(page.getByTestId('controlled-open-updates')).toHaveText('2')
    })

    test('受控父级不回写时，组件应只发请求且保持 prop 状态', async ({ page }) => {
      const trigger = getTrigger(page, 'blocked-selector')

      await trigger.click()
      await expect(page.getByTestId('blocked-open-updates')).toHaveText('1')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await page.getByTestId('blocked-force-open').click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      const listbox = await getListbox(page, 'blocked-selector')
      await listbox.getByRole('option', { name: /Claude Sonnet/ }).click()

      await expect(page.getByTestId('blocked-value')).toHaveText('gpt-4o')
      await expect(page.getByTestId('blocked-updates')).toHaveText('1')
      await expect(page.getByTestId('blocked-changes')).toHaveText('1')
      await expect(page.getByTestId('blocked-open-state')).toHaveText('true')
      await expect(page.getByTestId('blocked-open-updates')).toHaveText('2')
      await expect(trigger).toContainText('GPT-4o')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    test('受控父级拒绝关闭时，同一次 outside pointer 只应发一次关闭请求', async ({ page }) => {
      const trigger = getTrigger(page, 'blocked-selector')

      await page.getByTestId('blocked-force-open').click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(await getSearch(page, 'blocked-selector')).toBeFocused()

      await page.getByTestId('outside-action').click()
      await expect(page.getByTestId('blocked-open-state')).toHaveText('true')
      await expect(page.getByTestId('blocked-open-updates')).toHaveText('1')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    test('无效或被移除的受控值应显示 placeholder，恢复后重新显示且不发 change', async ({ page }) => {
      const trigger = getTrigger(page, 'controlled-selector')

      await expect(trigger).toContainText('GPT-4o')
      await page.getByTestId('controlled-remove').click()
      await expect(trigger).toContainText('选择模型')
      await expect(page.getByTestId('controlled-updates')).toHaveText('0')
      await expect(page.getByTestId('controlled-changes')).toHaveText('0')

      await page.getByTestId('controlled-restore').click()
      await expect(trigger).toContainText('GPT-4o')
      await page.getByTestId('controlled-invalid').click()
      await expect(trigger).toContainText('选择模型')
      await expect(page.getByTestId('controlled-updates')).toHaveText('0')
      await expect(page.getByTestId('controlled-changes')).toHaveText('0')
    })

    test('defaultOpen 应仅初始打开，不产生 update:open', async ({ page }) => {
      await page.getByTestId('mount-default-open').click()

      const trigger = getTrigger(page, 'default-open-selector')
      const search = await getSearch(page, 'default-open-selector')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(search).toBeFocused()
      await expect(page.getByTestId('default-open-updates')).toHaveText('0')
    })
  })

  test.describe('最小用法与公开 helper', () => {
    test('只有 value/label 的模型可渲染，ARIA 文案使用对应可见文案', async ({ page }) => {
      const fallbackTrigger = page.getByTestId('minimal-fallback-selector').getByRole('button')
      await expect(fallbackTrigger).toHaveAttribute('aria-label', 'Minimal Reasoning · Medium')

      await fallbackTrigger.click()
      await expect(await getSearch(page, 'minimal-fallback-selector')).toHaveCount(0)
      const fallbackListbox = await getListbox(page, 'minimal-fallback-selector')
      await expect(fallbackListbox).toBeVisible()
      await expect(fallbackListbox.locator('..').getByRole('group', { name: 'Thinking level' })).toBeVisible()
      await fallbackListbox.press('Escape')

      const explicitTrigger = page.getByTestId('minimal-explicit-selector').getByRole('button')
      await expect(explicitTrigger).toHaveAttribute('aria-label', 'Minimal Reasoning · Medium')

      await explicitTrigger.click()
      await expect(await getSearch(page, 'minimal-explicit-selector')).toBeVisible()
      const explicitListbox = await getListbox(page, 'minimal-explicit-selector')
      await expect(explicitListbox).toBeVisible()
      await expect(explicitListbox.locator('..').getByRole('group', { name: 'Ignored effort fallback' })).toBeVisible()
    })

    test('icon 支持 Vue 组件和 URL', async ({ page }) => {
      const selector = page.getByTestId('controlled-selector')
      await expect(selector.locator('img.tr-model-selector__trigger-icon')).toHaveAttribute(
        'src',
        'https://example.com/model.svg',
      )

      await selector.getByRole('button').click()
      const listbox = await getListbox(page, 'controlled-selector')
      await expect(listbox.locator('img.tr-model-selector__option-icon')).toHaveCount(1)
      await expect(listbox.locator('svg.tr-model-selector__option-icon')).toHaveCount(1)
    })
  })

  test.describe('Reasoning effort', () => {
    test('closeOnSelect=false 时鼠标和键盘选择模型应保持面板、焦点与高亮', async ({ page }) => {
      const trigger = getTrigger(page, 'keep-open-selector')

      await trigger.click()
      const listbox = await getListbox(page, 'keep-open-selector')
      await expect(listbox).toBeFocused()

      await listbox.getByRole('option', { name: /Reasoning Custom/ }).click()
      await expect(trigger).toContainText('Reasoning Custom')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(listbox).toBeFocused()
      await expect(await getActiveOption(page, listbox)).toContainText('Reasoning Custom')

      await listbox.press('End')
      await listbox.press('Enter')
      await expect(trigger).toContainText('Plain Model')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(listbox).toBeFocused()
      await expect(await getActiveOption(page, listbox)).toContainText('Plain Model')

      await listbox.press('Home')
      await listbox.press('Space')
      await listbox.press('Space')
      await expect(trigger).toContainText('Reasoning Default')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(listbox).toBeFocused()
      await expect(await getActiveOption(page, listbox)).toContainText('Reasoning Default')
      await expect(page.getByTestId('keep-open-updates')).toHaveText('3')
      await expect(page.getByTestId('keep-open-changes')).toHaveText('3')
      await expect(page.getByTestId('keep-open-open-updates')).toHaveText('1')
      await expect(page.getByTestId('keep-open-last-open')).toHaveText('true')
    })

    test('reasoningEfforts:true 与 defaultReasoningEffort 应渲染默认档位，点击和键盘选择不关闭且事件有序去重', async ({
      page,
    }) => {
      const trigger = getTrigger(page, 'effort-uncontrolled-selector')

      await expect(trigger).toContainText('Reasoning Default')
      await expect(trigger).toContainText('Medium')
      await trigger.click()

      const effortGroup = (await getListbox(page, 'effort-uncontrolled-selector'))
        .locator('..')
        .getByRole('group', { name: 'Thinking' })
      const low = effortGroup.getByRole('button', { name: 'Low', exact: true })
      const medium = effortGroup.getByRole('button', { name: 'Medium', exact: true })
      const high = effortGroup.getByRole('button', { name: 'High', exact: true })

      await expect(effortGroup.getByRole('button')).toHaveCount(3)
      await expect(medium).toHaveAttribute('aria-pressed', 'true')

      await high.focus()
      await high.press('Enter')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(high).toHaveAttribute('aria-pressed', 'true')
      await expect(page.getByTestId('effort-uncontrolled-updates')).toHaveText('1')
      await expect(page.getByTestId('effort-uncontrolled-changes')).toHaveText('1')

      await high.press('Space')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByTestId('effort-uncontrolled-updates')).toHaveText('1')
      await expect(page.getByTestId('effort-uncontrolled-changes')).toHaveText('1')

      await low.focus()
      await low.press('Space')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(low).toHaveAttribute('aria-pressed', 'true')

      await medium.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(medium).toHaveAttribute('aria-pressed', 'true')
      await expect(page.getByTestId('effort-uncontrolled-updates')).toHaveText('3')
      await expect(page.getByTestId('effort-uncontrolled-changes')).toHaveText('3')
      await expect(page.getByTestId('effort-uncontrolled-value')).toHaveText('medium')
      await expect(page.getByTestId('effort-uncontrolled-sequence')).toHaveText(
        'update:high > change:high > update:low > change:low > update:medium > change:medium',
      )
    })

    test('自定义 effort 应去除重复值并保留 disabled 语义', async ({ page }) => {
      const trigger = getTrigger(page, 'effort-uncontrolled-selector')

      await trigger.click()
      const listbox = await getListbox(page, 'effort-uncontrolled-selector')
      await listbox.getByRole('option', { name: /Reasoning Custom/ }).click()
      await trigger.click()

      const effortGroup = (await getListbox(page, 'effort-uncontrolled-selector'))
        .locator('..')
        .getByRole('group', { name: 'Thinking' })
      await expect(effortGroup.getByRole('button')).toHaveCount(3)
      await expect(effortGroup.getByRole('button', { name: 'Minimal', exact: true })).toBeEnabled()
      await expect(effortGroup.getByRole('button', { name: 'Medium', exact: true })).toHaveCount(1)
      await expect(effortGroup.getByRole('button', { name: 'Duplicate Medium', exact: true })).toHaveCount(0)
      await expect(effortGroup.getByRole('button', { name: 'Maximum', exact: true })).toBeDisabled()
      await expect(effortGroup.getByRole('button', { name: 'Medium', exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(page.getByTestId('effort-uncontrolled-updates')).toHaveText('0')
      await expect(page.getByTestId('effort-uncontrolled-changes')).toHaveText('0')
    })

    test('受控父级拒绝 effort 回写时应只发送请求并保持 prop 状态', async ({ page }) => {
      const trigger = getTrigger(page, 'effort-blocked-selector')

      await expect(trigger).toContainText('Medium')
      await trigger.click()

      const effortGroup = (await getListbox(page, 'effort-blocked-selector'))
        .locator('..')
        .getByRole('group', { name: 'Thinking' })
      const low = effortGroup.getByRole('button', { name: 'Low', exact: true })
      const medium = effortGroup.getByRole('button', { name: 'Medium', exact: true })
      await low.click()

      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(trigger).toContainText('Medium')
      await expect(medium).toHaveAttribute('aria-pressed', 'true')
      await expect(low).toHaveAttribute('aria-pressed', 'false')
      await expect(page.getByTestId('effort-blocked-raw')).toHaveText('medium')
      await expect(page.getByTestId('effort-blocked-updates')).toHaveText('1')
      await expect(page.getByTestId('effort-blocked-changes')).toHaveText('1')
      await expect(page.getByTestId('effort-blocked-sequence')).toHaveText('update:low > change:low')
    })

    test('初始 undefined 的受控 v-model 应接受外部回写，自定义 footer 完整覆盖并可更新和关闭', async ({ page }) => {
      const trigger = getTrigger(page, 'effort-controlled-selector')

      await expect(page.getByTestId('effort-controlled-model')).toHaveText('undefined')
      await expect(page.getByTestId('effort-controlled-open')).toHaveText('undefined')
      await expect(page.getByTestId('effort-controlled-raw')).toHaveText('undefined')
      await expect(page.getByTestId('effort-controlled-trigger-slot')).toHaveText(/选择模型\|null\|null/)

      await page.getByTestId('undefined-controlled-prime').click()
      await expect(page.getByTestId('effort-controlled-model')).toHaveText('reasoning-default')
      await expect(page.getByTestId('effort-controlled-open')).toHaveText('true')
      await expect(page.getByTestId('effort-controlled-raw')).toHaveText('high')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByTestId('effort-controlled-trigger-slot')).toHaveText(/Reasoning Default\|high\|High/)

      const listbox = await getListbox(page, 'effort-controlled-selector')
      const panel = listbox.locator('..')
      await expect(page.getByTestId('effort-custom-footer')).toBeVisible()
      await expect(page.getByTestId('effort-footer-count')).toHaveText('3')
      await expect(page.getByTestId('effort-footer-value')).toHaveText('high')
      await expect(page.getByTestId('effort-footer-option')).toHaveText('High')
      await expect(panel.locator('.tr-model-selector__effort')).toHaveCount(0)
      await expect(panel.locator('[data-model-selector-effort-value]')).toHaveCount(0)

      await page.getByTestId('effort-footer-medium').click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByTestId('effort-controlled-raw')).toHaveText('medium')
      await expect(page.getByTestId('effort-controlled-trigger-slot')).toHaveText(/Reasoning Default\|medium\|Medium/)
      await expect(page.getByTestId('effort-controlled-updates')).toHaveText('1')
      await expect(page.getByTestId('effort-controlled-changes')).toHaveText('1')
      await expect(page.getByTestId('effort-controlled-sequence')).toHaveText('update:medium > change:medium')

      await page.getByTestId('effort-footer-close').click()
      await expect(page.getByTestId('effort-controlled-open')).toHaveText('false')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()
    })

    test('effort 应跨模型 sticky，unsupported 时 slot 解析为 null，模型切换不发 effort 事件', async ({ page }) => {
      const trigger = getTrigger(page, 'effort-controlled-selector')

      await page.getByTestId('undefined-controlled-prime').click()
      const listbox = await getListbox(page, 'effort-controlled-selector')
      await listbox.getByRole('option', { name: /Plain Model/ }).click()

      await expect(page.getByTestId('effort-controlled-model')).toHaveText('plain-model')
      await expect(page.getByTestId('effort-controlled-open')).toHaveText('false')
      await expect(page.getByTestId('effort-controlled-raw')).toHaveText('high')
      await expect(page.getByTestId('effort-controlled-trigger-slot')).toHaveText(/Plain Model\|null\|null/)
      await expect(page.getByTestId('effort-controlled-updates')).toHaveText('0')
      await expect(page.getByTestId('effort-controlled-changes')).toHaveText('0')

      await trigger.click()
      await expect(page.getByTestId('effort-custom-footer')).toBeVisible()
      await expect(page.getByTestId('effort-footer-count')).toHaveText('0')
      await expect(page.getByTestId('effort-footer-value')).toHaveText('null')
      await expect(page.getByTestId('effort-footer-option')).toHaveText('null')
      await listbox.getByRole('option', { name: /Reasoning Default/ }).click()

      await expect(page.getByTestId('effort-controlled-model')).toHaveText('reasoning-default')
      await expect(page.getByTestId('effort-controlled-raw')).toHaveText('high')
      await expect(page.getByTestId('effort-controlled-trigger-slot')).toHaveText(/Reasoning Default\|high\|High/)
      await expect(page.getByTestId('effort-controlled-updates')).toHaveText('0')
      await expect(page.getByTestId('effort-controlled-changes')).toHaveText('0')

      await page.getByTestId('undefined-controlled-disabled').click()
      await expect(page.getByTestId('effort-controlled-model')).toHaveText('disabled-reasoning')
      await expect(page.getByTestId('effort-footer-value')).toHaveText('high')
      await page.getByTestId('effort-footer-low').click()
      await expect(page.getByTestId('effort-controlled-raw')).toHaveText('high')
      await expect(page.getByTestId('effort-controlled-updates')).toHaveText('0')
      await expect(page.getByTestId('effort-controlled-changes')).toHaveText('0')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
  })

  test.describe('搜索、分组与选项', () => {
    test('默认搜索应覆盖 description 和 group', async ({ page }) => {
      await getTrigger(page, 'init-selector').click()
      const search = await getSearch(page, 'init-selector')
      const listbox = await getListbox(page, 'init-selector')

      await search.fill('coding')
      await expect(listbox.getByRole('option')).toHaveCount(1)
      await expect(listbox.getByRole('option', { name: /GPT-4.1/ })).toContainText('Precise coding model')

      await search.fill('anthropic')
      await expect(listbox.getByRole('group', { name: 'Anthropic' })).toBeVisible()
      await expect(listbox.getByRole('option')).toHaveCount(2)

      await search.fill('multimodal')
      await expect(listbox.getByRole('option')).toHaveCount(1)
      await expect(listbox.getByRole('option', { name: /GPT-4o/ })).toBeVisible()
    })

    test('禁用项应可被搜索和读取，但不可选择', async ({ page }) => {
      const trigger = getTrigger(page, 'init-selector')
      await trigger.click()
      const search = await getSearch(page, 'init-selector')

      await search.fill('Haiku')
      const disabledOption = (await getListbox(page, 'init-selector')).getByRole('option', { name: /Claude Haiku/ })
      await expect(disabledOption).toHaveAttribute('aria-disabled', 'true')
      await disabledOption.dispatchEvent('click')

      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByTestId('init-updates')).toHaveText('0')
      await expect(page.getByTestId('init-changes')).toHaveText('0')
    })

    test('自定义 filterMethod 应替换默认匹配规则', async ({ page }) => {
      await getTrigger(page, 'custom-filter-selector').click()
      const search = await getSearch(page, 'custom-filter-selector')
      const listbox = await getListbox(page, 'custom-filter-selector')

      await search.fill('featured')
      await expect(listbox.getByRole('option')).toHaveCount(1)
      await expect(listbox.getByRole('option', { name: /Second Model/ })).toBeVisible()

      await search.fill('First Model')
      await expect(listbox.getByRole('option')).toHaveCount(0)
      await expect(page.locator('.tr-model-selector__empty[role="status"]')).toContainText('暂无可用模型')
    })
  })

  test.describe('键盘、焦点与 ARIA', () => {
    test('Arrow/Home/End 应跳过 disabled，Enter 选择后关闭并恢复焦点', async ({ page }) => {
      const trigger = getTrigger(page, 'keyboard-selector')
      await trigger.focus()
      await trigger.click()

      const listbox = await getListbox(page, 'keyboard-selector')
      await expect(listbox).toBeFocused()
      await expect(await getActiveOption(page, listbox)).toContainText('GPT-4o')

      await listbox.press('ArrowDown')
      await expect(await getActiveOption(page, listbox)).toContainText('GPT-4.1')
      await listbox.press('ArrowDown')
      await expect(await getActiveOption(page, listbox)).toContainText('Claude Sonnet')
      await listbox.press('ArrowDown')
      await expect(await getActiveOption(page, listbox)).toContainText('DeepSeek R1')

      await listbox.press('Home')
      await expect(await getActiveOption(page, listbox)).toContainText('GPT-4o')
      await listbox.press('End')
      await expect(await getActiveOption(page, listbox)).toContainText('DeepSeek R1')
      await listbox.press('Enter')

      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()
      await expect(trigger).toContainText('DeepSeek R1')
      await expect(page.getByTestId('keyboard-updates')).toHaveText('1')
      await expect(page.getByTestId('keyboard-changes')).toHaveText('1')
      await expect(page.getByTestId('keyboard-last-value')).toHaveText('deepseek-r1')
    })

    test('Enter 应打开面板，Escape 只关闭不选择', async ({ page }) => {
      const trigger = getTrigger(page, 'keyboard-selector')
      await trigger.focus()
      await trigger.press('Enter')

      const listbox = await getListbox(page, 'keyboard-selector')
      await expect(await getActiveOption(page, listbox)).toContainText('GPT-4o')
      await listbox.press('Escape')

      await expect(trigger).toBeFocused()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(page.getByTestId('keyboard-updates')).toHaveText('0')
      await expect(page.getByTestId('keyboard-changes')).toHaveText('0')
    })

    test('搜索框 Home/End 保留文本编辑语义，输入法组合期间不接管候选导航', async ({ page }) => {
      await getTrigger(page, 'init-selector').click()
      const search = await getSearch(page, 'init-selector')

      await search.fill('GPT-4.1')
      await search.evaluate((element: HTMLInputElement) => {
        element.setSelectionRange(4, 4)
      })

      const activeBeforeHome = await search.getAttribute('aria-activedescendant')
      const editingKeyResult = await search.evaluate((element) => {
        return Object.fromEntries(
          ['Home', 'End'].map((key) => {
            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
            element.dispatchEvent(event)
            return [key, event.defaultPrevented]
          }),
        )
      })

      expect(editingKeyResult).toEqual({ Home: false, End: false })
      await expect(search).toHaveValue('GPT-4.1')
      await expect(search).toHaveAttribute('aria-activedescendant', activeBeforeHome!)

      const compositionResult = await search.evaluate((element) => {
        const event = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
          isComposing: true,
        })
        element.dispatchEvent(event)
        return event.defaultPrevented
      })

      expect(compositionResult).toBe(false)
      await expect(search).toHaveAttribute('aria-activedescendant', activeBeforeHome!)
    })

    test('header/footer 中的 Enter 应触发自身控件，Tab 不接管面板状态', async ({ page }) => {
      const trigger = getTrigger(page, 'slot-selector')
      await trigger.click()
      const search = await getSearch(page, 'slot-selector')
      await expect(search).toBeFocused()

      const headerAction = page.getByTestId('slot-header-action')
      await headerAction.focus()
      await headerAction.press('Enter')
      await expect(page.getByTestId('slot-header-activations')).toHaveText('1')
      await expect(page.getByTestId('slot-changes')).toHaveText('0')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      const footerAction = page.getByTestId('slot-footer-action')
      await footerAction.focus()
      await footerAction.press('Enter')
      await expect(page.getByTestId('slot-footer-activations')).toHaveText('1')
      await expect(page.getByTestId('slot-changes')).toHaveText('0')

      await search.focus()
      await search.press('Tab')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    test('trigger、combobox、listbox、option 和 group 应建立完整 ARIA 关联', async ({ page }) => {
      const trigger = getTrigger(page, 'uncontrolled-selector')
      const listboxId = await trigger.getAttribute('aria-controls')
      expect(listboxId).toBeTruthy()
      await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await trigger.click()
      const search = await getSearch(page, 'uncontrolled-selector')
      const listbox = await getListbox(page, 'uncontrolled-selector')
      await expect(search).toHaveAttribute('aria-controls', listboxId!)
      await expect(search).toHaveAttribute('aria-autocomplete', 'list')
      await expect(search).toHaveAttribute('aria-expanded', 'true')
      await expect(listbox).toHaveAttribute('id', listboxId!)
      await expect(await getActiveOption(page, search)).toContainText('Claude Sonnet')

      const selectedOption = listbox.getByRole('option', { name: /Claude Sonnet/ })
      await expect(selectedOption).toHaveAttribute('aria-selected', 'true')
      const descriptionId = await selectedOption.getAttribute('aria-describedby')
      expect(descriptionId).toBeTruthy()
      await expect(page.locator(`[id="${descriptionId}"]`)).toHaveText('Balanced reasoning model')
      await expect(listbox.getByRole('option', { name: /Claude Haiku/ })).toHaveAttribute('aria-disabled', 'true')
      await expect(listbox.getByRole('group', { name: 'OpenAI' })).toBeVisible()
      await expect(listbox.getByRole('group', { name: 'Anthropic' })).toBeVisible()

      await search.fill('no-such-model')
      await expect(page.locator('.tr-model-selector__empty[role="status"]')).toContainText('暂无可用模型')
      await expect(listbox.getByRole('option')).toHaveCount(0)
    })
  })

  test.describe('浮层、多实例与样式', () => {
    test('仅短名称的面板应按内容收缩且不窄于触发器', async ({ page }) => {
      const trigger = getTrigger(page, 'short-selector')
      await trigger.click()

      const panel = (await getListbox(page, 'short-selector')).locator('..')
      const [triggerBox, panelBox] = await Promise.all([trigger.boundingBox(), panel.boundingBox()])

      expect(triggerBox).toBeTruthy()
      expect(panelBox).toBeTruthy()
      expect(panelBox!.width).toBeGreaterThanOrEqual(triggerBox!.width - 1)
      expect(panelBox!.width).toBeLessThan(200)
    })

    test('移动端的短选项面板不应被强制铺满视口', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 720 })
      await getTrigger(page, 'short-selector').click()

      const panelBox = await (await getListbox(page, 'short-selector')).locator('..').boundingBox()

      expect(panelBox).toBeTruthy()
      expect(panelBox!.width).toBeLessThan(240)
    })

    test('三种 size 的短选项面板都应按内容收缩', async ({ page }) => {
      const widths: number[] = []

      for (const testId of ['short-small-selector', 'short-selector', 'short-large-selector']) {
        const trigger = getTrigger(page, testId)
        await trigger.click()
        const panelBox = await (await getListbox(page, testId)).locator('..').boundingBox()
        expect(panelBox).toBeTruthy()
        widths.push(panelBox!.width)
        await trigger.click()
      }

      for (const width of widths) {
        expect(width).toBeLessThan(200)
      }
    })

    test('选项文字列应支持通过 panelClass 覆盖最大宽度', async ({ page }) => {
      const defaultTrigger = getTrigger(page, 'rich-width-selector')
      await defaultTrigger.click()
      const defaultPanel = (await getListbox(page, 'rich-width-selector')).locator('..')
      const defaultText = defaultPanel.locator('.tr-model-selector__option-text').first()
      await expect(defaultText).toHaveCSS('max-width', '320px')
      const defaultPanelBox = await defaultPanel.boundingBox()
      await defaultTrigger.click()

      const narrowTrigger = getTrigger(page, 'narrow-rich-width-selector')
      await narrowTrigger.click()
      const narrowPanel = (await getListbox(page, 'narrow-rich-width-selector')).locator('..')
      const narrowText = narrowPanel.locator('.tr-model-selector__option-text').first()
      await expect(narrowText).toHaveCSS('max-width', '160px')
      const narrowPanelBox = await narrowPanel.boundingBox()

      expect(defaultPanelBox).toBeTruthy()
      expect(narrowPanelBox).toBeTruthy()
      expect(defaultPanelBox!.width - narrowPanelBox!.width).toBeGreaterThan(100)
    })

    test('选中状态不应改变相同选项集合的面板宽度', async ({ page }) => {
      const selectedTrigger = getTrigger(page, 'short-selector')
      await selectedTrigger.click()
      const selectedPanelBox = await (await getListbox(page, 'short-selector')).locator('..').boundingBox()
      await selectedTrigger.click()

      const unselectedTrigger = getTrigger(page, 'short-unselected-selector')
      await unselectedTrigger.click()
      const unselectedPanelBox = await (await getListbox(page, 'short-unselected-selector')).locator('..').boundingBox()

      expect(selectedPanelBox).toBeTruthy()
      expect(unselectedPanelBox).toBeTruthy()
      expect(Math.abs(selectedPanelBox!.width - unselectedPanelBox!.width)).toBeLessThanOrEqual(1)
    })

    test('搜索框应为面板提供局部最小宽度', async ({ page }) => {
      await getTrigger(page, 'short-search-selector').click()
      const panelBox = await (await getListbox(page, 'short-search-selector')).locator('..').boundingBox()

      expect(panelBox).toBeTruthy()
      expect(panelBox!.width).toBeGreaterThanOrEqual(240)
    })

    test('极窄视口下搜索区域应完整显示在面板内', async ({ page }) => {
      await page.setViewportSize({ width: 220, height: 720 })
      await getTrigger(page, 'short-search-selector').click()

      const panel = (await getListbox(page, 'short-search-selector')).locator('..')
      const [panelBox, searchBox] = await Promise.all([
        panel.boundingBox(),
        panel.locator('.tr-model-selector__search').boundingBox(),
      ])

      expect(panelBox).toBeTruthy()
      expect(searchBox).toBeTruthy()
      expect(searchBox!.x + searchBox!.width).toBeLessThanOrEqual(panelBox!.x + panelBox!.width + 1)
    })

    test('思考强度应为面板提供局部最小宽度', async ({ page }) => {
      await getTrigger(page, 'short-effort-selector').click()
      const panelBox = await (await getListbox(page, 'short-effort-selector')).locator('..').boundingBox()

      expect(panelBox).toBeTruthy()
      expect(panelBox!.width).toBeGreaterThanOrEqual(240)
    })

    test('空状态应为面板提供局部最小宽度', async ({ page }) => {
      await getTrigger(page, 'empty-selector').click()
      const panelBox = await (await getListbox(page, 'empty-selector')).locator('..').boundingBox()

      expect(panelBox).toBeTruthy()
      expect(panelBox!.width).toBeGreaterThanOrEqual(240)
    })

    test('搜索过滤不应让已打开的面板宽度收缩', async ({ page }) => {
      await getTrigger(page, 'stable-search-selector').click()
      const panel = (await getListbox(page, 'stable-search-selector')).locator('..')
      const initialBox = await panel.boundingBox()

      await (await getSearch(page, 'stable-search-selector')).fill('Ω')
      await expect((await getListbox(page, 'stable-search-selector')).getByRole('option')).toHaveCount(1)
      const filteredBox = await panel.boundingBox()

      expect(initialBox).toBeTruthy()
      expect(filteredBox).toBeTruthy()
      expect(filteredBox!.width).toBeGreaterThanOrEqual(initialBox!.width - 1)
    })

    test('打开期间新增更宽选项时面板可以增长', async ({ page }) => {
      await getTrigger(page, 'dynamic-width-selector').click()
      const panel = (await getListbox(page, 'dynamic-width-selector')).locator('..')
      const initialBox = await panel.boundingBox()

      await page.getByTestId('add-rich-width-models').click()
      await expect((await getListbox(page, 'dynamic-width-selector')).getByRole('option')).toHaveCount(2)

      expect(initialBox).toBeTruthy()
      await expect.poll(async () => (await panel.boundingBox())?.width ?? 0).toBeGreaterThan(initialBox!.width + 100)
    })

    test('多实例 ARIA id 应唯一，打开第二个应通过 outside pointer 关闭第一个', async ({ page }) => {
      const primary = getTrigger(page, 'primary-selector')
      const secondary = getTrigger(page, 'secondary-selector')
      expect(await primary.getAttribute('aria-controls')).not.toBe(await secondary.getAttribute('aria-controls'))

      await primary.click()
      await expect(primary).toHaveAttribute('aria-expanded', 'true')
      await secondary.click()
      await expect(primary).toHaveAttribute('aria-expanded', 'false')
      await expect(secondary).toHaveAttribute('aria-expanded', 'true')
      await expect(await getListbox(page, 'secondary-selector')).toBeVisible()
    })

    test('outside click 应关闭面板且不把焦点抢回 trigger', async ({ page }) => {
      const trigger = getTrigger(page, 'primary-selector')
      const outsideAction = page.getByTestId('outside-action')

      await trigger.click()
      await outsideAction.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(outsideAction).toBeFocused()
    })

    test('非法 appendTo 选择器应回退到默认挂载节点', async ({ page }) => {
      const trigger = page.getByTestId('invalid-append-to-selector').getByRole('button')

      await trigger.click()
      const listbox = await getListbox(page, 'invalid-append-to-selector')
      await expect(listbox).toBeVisible()
      await listbox.press('Escape')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    test('快速 open/close 不应留下过期浮层', async ({ page }) => {
      await page.getByTestId('rapid-open-close').click()
      await expect(page.getByTestId('rapid-open-state')).toHaveText('false')
      await expect(getTrigger(page, 'rapid-selector')).toHaveAttribute('aria-expanded', 'false')
      await expect(await getListbox(page, 'rapid-selector')).toHaveCount(0)
      await expect(page.locator('.tr-model-selector__dropdown-wrapper.is-positioned')).toHaveCount(0)
    })

    test('slots 应保留语义 wrapper，并应支持 panelClass 和 empty slot', async ({ page }) => {
      const trigger = getTrigger(page, 'slot-selector')
      await expect(page.getByTestId('slot-trigger-content')).toContainText('Closed: GPT-4o')
      await trigger.click()

      await expect(page.getByTestId('slot-trigger-content')).toContainText('Opened: GPT-4o')
      const listbox = await getListbox(page, 'slot-selector')
      await expect(listbox.getByRole('group', { name: 'OpenAI' })).toBeVisible()
      await expect(page.getByTestId('slot-item-gpt-4o')).toContainText('Custom GPT-4o selected')

      const panel = page.locator('.tr-model-selector__panel.model-selector-test__custom-content')
      await expect(panel).toBeVisible()
      await expect(panel).toHaveCSS('border-top-width', '2px')

      await (await getSearch(page, 'slot-selector')).fill('missing-value')
      await expect(page.getByTestId('slot-empty')).toHaveText('Nothing matches missing-value')
      await expect(listbox.getByRole('option')).toHaveCount(0)
      await page.getByTestId('slot-footer-close').click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()
    })

    test('variant/size/disabled 应输出对应状态，三个 size 高度递增', async ({ page }) => {
      const small = page.getByTestId('outline-small-selector').getByRole('button')
      const normal = page.getByTestId('ghost-normal-selector').getByRole('button')
      const large = page.getByTestId('muted-large-selector').getByRole('button')
      const disabled = page.getByTestId('disabled-selector').getByRole('button')

      await expect(small).toHaveClass(/tr-model-selector__trigger--outline/)
      await expect(small).toHaveClass(/tr-model-selector__trigger--small/)
      await expect(normal).toHaveClass(/tr-model-selector__trigger--ghost/)
      await expect(normal).toHaveClass(/tr-model-selector__trigger--normal/)
      await expect(large).toHaveClass(/tr-model-selector__trigger--muted/)
      await expect(large).toHaveClass(/tr-model-selector__trigger--large/)
      await expect(disabled).toBeDisabled()
      await expect(small).toHaveCSS('border-top-style', 'solid')
      await expect(small).toHaveCSS('border-top-width', '1px')

      const [smallBox, normalBox, largeBox] = await Promise.all([
        small.boundingBox(),
        normal.boundingBox(),
        large.boundingBox(),
      ])
      expect(smallBox).toBeTruthy()
      expect(normalBox).toBeTruthy()
      expect(largeBox).toBeTruthy()
      expect(normalBox!.height).toBeGreaterThan(smallBox!.height)
      expect(largeBox!.height).toBeGreaterThan(normalBox!.height)
    })

    test('暗色 token 应生效，窄屏下面板不超出视口', async ({ page }) => {
      const trigger = page.getByTestId('outline-small-selector').getByRole('button')
      const lightBackground = await trigger.evaluate((element) => getComputedStyle(element).backgroundColor)

      await page.getByTestId('dark-mode-toggle').click()
      await expect(page.locator('html')).toHaveAttribute('data-tr-color-mode', 'dark')
      await expect
        .poll(() => trigger.evaluate((element) => getComputedStyle(element).backgroundColor))
        .not.toBe(lightBackground)

      await page.setViewportSize({ width: 360, height: 720 })
      await getTrigger(page, 'muted-large-selector').click()
      const panelBox = await (await getListbox(page, 'muted-large-selector')).locator('..').boundingBox()
      expect(panelBox).toBeTruthy()
      expect(panelBox!.x).toBeGreaterThanOrEqual(7)
      expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(353)

      await getTrigger(page, 'effort-uncontrolled-selector').click()
      const effortGroup = (await getListbox(page, 'effort-uncontrolled-selector'))
        .locator('..')
        .getByRole('group', { name: 'Thinking' })
      const effortGroupBox = await effortGroup.boundingBox()
      expect(effortGroupBox).toBeTruthy()
      expect(effortGroupBox!.x).toBeGreaterThanOrEqual(7)
      expect(effortGroupBox!.x + effortGroupBox!.width).toBeLessThanOrEqual(353)
    })
  })
})

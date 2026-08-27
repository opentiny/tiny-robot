import { expect, test, type Locator, type Page } from '@playwright/test'

function getTrigger(page: Page, ariaLabel: string) {
  return page.getByRole('button', { name: new RegExp(`^${ariaLabel}:`) })
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
      await expect(getTrigger(page, 'Init selector')).toContainText('Select model')
      await expect(page.getByTestId('init-updates')).toHaveText('0')
      await expect(page.getByTestId('init-changes')).toHaveText('0')

      await expect(getTrigger(page, 'Async selector')).toContainText('Select model')
      await page.getByTestId('load-async-models').click()
      await expect(getTrigger(page, 'Async selector')).toContainText('Select model')
      await expect(page.getByTestId('async-updates')).toHaveText('0')
      await expect(page.getByTestId('async-changes')).toHaveText('0')
    })

    test('非受控 value/open 应内部更新，重复选择只关闭不重复发事件', async ({ page }) => {
      const trigger = getTrigger(page, 'Uncontrolled selector')

      await expect(trigger).toContainText('Claude Sonnet')
      await expect(page.getByTestId('uncontrolled-updates')).toHaveText('0')
      await expect(page.getByTestId('uncontrolled-changes')).toHaveText('0')

      await trigger.click()
      await page.getByRole('option', { name: /Claude Sonnet/ }).click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(page.getByTestId('uncontrolled-updates')).toHaveText('0')
      await expect(page.getByTestId('uncontrolled-changes')).toHaveText('0')

      await trigger.click()
      await page.getByRole('option', { name: /GPT-4o/ }).click()
      await expect(trigger).toContainText('GPT-4o')
      await expect(page.getByTestId('uncontrolled-updates')).toHaveText('1')
      await expect(page.getByTestId('uncontrolled-changes')).toHaveText('1')
      await expect(page.getByTestId('uncontrolled-last-value')).toHaveText('gpt-4o')
      await expect(page.getByTestId('uncontrolled-open-updates')).toHaveText('4')
    })

    test('受控 value/open 应由父级回写，外部打开不产生 update:open', async ({ page }) => {
      const trigger = getTrigger(page, 'Controlled selector')

      await page.getByTestId('controlled-open').click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByRole('listbox', { name: 'Controlled selector' })).toBeVisible()
      await expect(page.getByTestId('controlled-open-updates')).toHaveText('0')

      await page.getByRole('option', { name: /Claude Sonnet/ }).click()
      await expect(page.getByTestId('controlled-value')).toHaveText('claude-sonnet')
      await expect(page.getByTestId('controlled-updates')).toHaveText('1')
      await expect(page.getByTestId('controlled-changes')).toHaveText('1')
      await expect(page.getByTestId('controlled-open-updates')).toHaveText('1')
      await expect(trigger).toContainText('Claude Sonnet')

      await page.getByTestId('controlled-open').click()
      await page.getByRole('combobox', { name: 'Controlled search' }).press('Escape')
      await expect(page.getByTestId('controlled-open-state')).toHaveText('false')
      await expect(page.getByTestId('controlled-open-updates')).toHaveText('2')
    })

    test('受控父级不回写时，组件应只发请求且保持 prop 状态', async ({ page }) => {
      const trigger = getTrigger(page, 'Blocked selector')

      await trigger.click()
      await expect(page.getByTestId('blocked-open-updates')).toHaveText('1')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await page.getByTestId('blocked-force-open').click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await page.getByRole('option', { name: /Claude Sonnet/ }).click()

      await expect(page.getByTestId('blocked-value')).toHaveText('gpt-4o')
      await expect(page.getByTestId('blocked-updates')).toHaveText('1')
      await expect(page.getByTestId('blocked-changes')).toHaveText('1')
      await expect(page.getByTestId('blocked-open-state')).toHaveText('true')
      await expect(page.getByTestId('blocked-open-updates')).toHaveText('2')
      await expect(trigger).toContainText('GPT-4o')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    test('受控父级拒绝关闭时，同一次 outside pointer 只应发一次关闭请求', async ({ page }) => {
      const trigger = getTrigger(page, 'Blocked selector')

      await page.getByTestId('blocked-force-open').click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByRole('combobox', { name: 'Blocked search' })).toBeFocused()

      await page.getByTestId('outside-action').click()
      await expect(page.getByTestId('blocked-open-state')).toHaveText('true')
      await expect(page.getByTestId('blocked-open-updates')).toHaveText('1')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    test('无效或被移除的受控值应显示 placeholder，恢复后重新显示且不发 change', async ({ page }) => {
      const trigger = getTrigger(page, 'Controlled selector')

      await expect(trigger).toContainText('GPT-4o')
      await page.getByTestId('controlled-remove').click()
      await expect(trigger).toContainText('Select model')
      await expect(page.getByTestId('controlled-updates')).toHaveText('0')
      await expect(page.getByTestId('controlled-changes')).toHaveText('0')

      await page.getByTestId('controlled-restore').click()
      await expect(trigger).toContainText('GPT-4o')
      await page.getByTestId('controlled-invalid').click()
      await expect(trigger).toContainText('Select model')
      await expect(page.getByTestId('controlled-updates')).toHaveText('0')
      await expect(page.getByTestId('controlled-changes')).toHaveText('0')
    })

    test('defaultOpen 应仅初始打开，不产生 update:open', async ({ page }) => {
      await page.getByTestId('mount-default-open').click()

      const trigger = getTrigger(page, 'Default open selector')
      const search = page.getByRole('combobox', { name: 'Default open search' })
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(search).toBeFocused()
      await expect(page.getByTestId('default-open-updates')).toHaveText('0')
    })
  })

  test.describe('最小用法与公开 helper', () => {
    test('只有 value/label 的模型可渲染，ARIA 文案应回退到对应可见文案且允许显式覆盖', async ({ page }) => {
      const fallbackTrigger = page.getByTestId('minimal-fallback-selector').getByRole('button')
      await expect(fallbackTrigger).toHaveAttribute(
        'aria-label',
        'Choose compact model: Minimal Reasoning, Thinking level: Medium',
      )

      await fallbackTrigger.click()
      await expect(page.getByRole('combobox', { name: 'Find compact model' })).toHaveCount(0)
      const fallbackListbox = page.getByRole('listbox', { name: 'Choose compact model' })
      await expect(fallbackListbox).toBeVisible()
      await expect(page.getByRole('group', { name: 'Thinking level' })).toBeVisible()
      await fallbackListbox.press('Escape')

      const explicitTrigger = page.getByTestId('minimal-explicit-selector').getByRole('button')
      await expect(explicitTrigger).toHaveAttribute(
        'aria-label',
        'Explicit selector: Minimal Reasoning, Ignored effort fallback: Medium',
      )

      await explicitTrigger.click()
      await expect(page.getByRole('combobox', { name: 'Explicit search' })).toBeVisible()
      await expect(page.getByRole('listbox', { name: 'Explicit selector' })).toBeVisible()
      await expect(page.getByRole('group', { name: 'Ignored effort fallback' })).toBeVisible()
    })

    test('icon 支持 Vue 组件和 URL', async ({ page }) => {
      const selector = page.getByTestId('controlled-selector')
      await expect(selector.locator('img.tr-model-selector__trigger-icon')).toHaveAttribute(
        'src',
        'https://example.com/model.svg',
      )

      await selector.getByRole('button').click()
      const listbox = page.getByRole('listbox', { name: 'Controlled selector' })
      await expect(listbox.locator('img.tr-model-selector__option-icon')).toHaveCount(1)
      await expect(listbox.locator('svg.tr-model-selector__option-icon')).toHaveCount(1)
    })
  })

  test.describe('Reasoning effort', () => {
    test('reasoningEfforts:true 与 defaultReasoningEffort 应渲染默认档位，点击和键盘选择不关闭且事件有序去重', async ({
      page,
    }) => {
      const trigger = getTrigger(page, 'Default effort selector')

      await expect(trigger).toContainText('Reasoning Default')
      await expect(trigger).toContainText('Medium')
      await trigger.click()

      const effortGroup = page.getByRole('group', { name: 'Thinking' })
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
      const trigger = getTrigger(page, 'Default effort selector')

      await trigger.click()
      await page.getByRole('option', { name: /Reasoning Custom/ }).click()
      await trigger.click()

      const effortGroup = page.getByRole('group', { name: 'Thinking' })
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
      const trigger = getTrigger(page, 'Blocked effort selector')

      await expect(trigger).toContainText('Medium')
      await trigger.click()

      const effortGroup = page.getByRole('group', { name: 'Thinking' })
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
      const trigger = getTrigger(page, 'Controlled effort selector')

      await expect(page.getByTestId('effort-controlled-model')).toHaveText('undefined')
      await expect(page.getByTestId('effort-controlled-open')).toHaveText('undefined')
      await expect(page.getByTestId('effort-controlled-raw')).toHaveText('undefined')
      await expect(page.getByTestId('effort-controlled-trigger-slot')).toHaveText(/Select model\|null\|null/)

      await page.getByTestId('undefined-controlled-prime').click()
      await expect(page.getByTestId('effort-controlled-model')).toHaveText('reasoning-default')
      await expect(page.getByTestId('effort-controlled-open')).toHaveText('true')
      await expect(page.getByTestId('effort-controlled-raw')).toHaveText('high')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByTestId('effort-controlled-trigger-slot')).toHaveText(/Reasoning Default\|high\|High/)

      const listbox = page.getByRole('listbox', { name: 'Controlled effort selector' })
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
      const trigger = getTrigger(page, 'Controlled effort selector')

      await page.getByTestId('undefined-controlled-prime').click()
      await page.getByRole('option', { name: /Plain Model/ }).click()

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
      await page.getByRole('option', { name: /Reasoning Default/ }).click()

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
      await getTrigger(page, 'Init selector').click()
      const search = page.getByRole('combobox', { name: 'Search models' })
      const listbox = page.getByRole('listbox', { name: 'Init selector' })

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
      const trigger = getTrigger(page, 'Init selector')
      await trigger.click()
      const search = page.getByRole('combobox', { name: 'Search models' })

      await search.fill('Haiku')
      const disabledOption = page.getByRole('option', { name: /Claude Haiku/ })
      await expect(disabledOption).toHaveAttribute('aria-disabled', 'true')
      await disabledOption.dispatchEvent('click')

      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByTestId('init-updates')).toHaveText('0')
      await expect(page.getByTestId('init-changes')).toHaveText('0')
    })

    test('自定义 filterMethod 应替换默认匹配规则', async ({ page }) => {
      await getTrigger(page, 'Custom filter selector').click()
      const search = page.getByRole('combobox', { name: 'Custom filter search' })
      const listbox = page.getByRole('listbox', { name: 'Custom filter selector' })

      await search.fill('featured')
      await expect(listbox.getByRole('option')).toHaveCount(1)
      await expect(listbox.getByRole('option', { name: /Second Model/ })).toBeVisible()

      await search.fill('First Model')
      await expect(listbox.getByRole('option')).toHaveCount(0)
      await expect(page.locator('.tr-model-selector__empty[role="status"]')).toContainText('No models found.')
    })
  })

  test.describe('键盘、焦点与 ARIA', () => {
    test('Arrow/Home/End 应跳过 disabled，Enter 选择后关闭并恢复焦点', async ({ page }) => {
      const trigger = getTrigger(page, 'Keyboard selector')
      await trigger.focus()
      await trigger.click()

      const listbox = page.getByRole('listbox', { name: 'Keyboard selector' })
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
      const trigger = getTrigger(page, 'Keyboard selector')
      await trigger.focus()
      await trigger.press('Enter')

      const listbox = page.getByRole('listbox', { name: 'Keyboard selector' })
      await expect(await getActiveOption(page, listbox)).toContainText('GPT-4o')
      await listbox.press('Escape')

      await expect(trigger).toBeFocused()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(page.getByTestId('keyboard-updates')).toHaveText('0')
      await expect(page.getByTestId('keyboard-changes')).toHaveText('0')
    })

    test('搜索框 Home/End 保留文本编辑语义，输入法组合期间不接管候选导航', async ({ page }) => {
      await getTrigger(page, 'Init selector').click()
      const search = page.getByRole('combobox', { name: 'Search models' })

      await search.fill('GPT-4.1')
      await search.evaluate((element: HTMLInputElement) => {
        element.setSelectionRange(4, 4)
      })

      const activeBeforeHome = await search.getAttribute('aria-activedescendant')
      await search.press('Home')
      await expect.poll(() => search.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(0)
      await expect(search).toHaveAttribute('aria-activedescendant', activeBeforeHome!)

      await search.press('End')
      await expect
        .poll(() => search.evaluate((element: HTMLInputElement) => element.selectionStart))
        .toBe('GPT-4.1'.length)

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
      const trigger = getTrigger(page, 'Slot selector')
      await trigger.click()
      const search = page.getByRole('combobox', { name: 'Slot search' })
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
      const trigger = getTrigger(page, 'Uncontrolled selector')
      const listboxId = await trigger.getAttribute('aria-controls')
      expect(listboxId).toBeTruthy()
      await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await trigger.click()
      const search = page.getByRole('combobox', { name: 'Uncontrolled search' })
      const listbox = page.getByRole('listbox', { name: 'Uncontrolled selector' })
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
      await expect(page.locator('.tr-model-selector__empty[role="status"]')).toContainText('No models found.')
      await expect(listbox.getByRole('option')).toHaveCount(0)
    })
  })

  test.describe('浮层、多实例与样式', () => {
    test('多实例 ARIA id 应唯一，打开第二个应通过 outside pointer 关闭第一个', async ({ page }) => {
      const primary = getTrigger(page, 'Primary selector')
      const secondary = getTrigger(page, 'Secondary selector')
      expect(await primary.getAttribute('aria-controls')).not.toBe(await secondary.getAttribute('aria-controls'))

      await primary.click()
      await expect(primary).toHaveAttribute('aria-expanded', 'true')
      await secondary.click()
      await expect(primary).toHaveAttribute('aria-expanded', 'false')
      await expect(secondary).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByRole('listbox', { name: 'Secondary selector' })).toBeVisible()
    })

    test('outside click 应关闭面板且不把焦点抢回 trigger', async ({ page }) => {
      const trigger = getTrigger(page, 'Primary selector')
      const outsideAction = page.getByTestId('outside-action')

      await trigger.click()
      await outsideAction.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(outsideAction).toBeFocused()
    })

    test('非法 appendTo 选择器应回退到默认挂载节点', async ({ page }) => {
      const trigger = page.getByTestId('invalid-append-to-selector').getByRole('button')

      await trigger.click()
      const listbox = page.getByRole('listbox', { name: 'Invalid append target selector' })
      await expect(listbox).toBeVisible()
      await listbox.press('Escape')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    test('快速 open/close 不应留下过期浮层', async ({ page }) => {
      await page.getByTestId('rapid-open-close').click()
      await expect(page.getByTestId('rapid-open-state')).toHaveText('false')
      await expect(getTrigger(page, 'Rapid selector')).toHaveAttribute('aria-expanded', 'false')
      await expect(page.getByRole('listbox', { name: 'Rapid selector' })).toHaveCount(0)
      await expect(page.locator('.tr-model-selector__dropdown-wrapper.is-positioned')).toHaveCount(0)
    })

    test('slots 应保留语义 wrapper，并应支持 contentClass/contentStyle 和 empty slot', async ({ page }) => {
      const trigger = getTrigger(page, 'Slot selector')
      await expect(page.getByTestId('slot-trigger-content')).toContainText('Closed: GPT-4o')
      await trigger.click()

      await expect(page.getByTestId('slot-trigger-content')).toContainText('Opened: GPT-4o')
      await expect(page.getByRole('group', { name: 'OpenAI' })).toBeVisible()
      await expect(page.getByTestId('slot-item-gpt-4o')).toContainText('Custom GPT-4o selected')

      const panel = page.locator('.tr-model-selector__panel.model-selector-test__custom-content')
      await expect(panel).toBeVisible()
      await expect(panel).toHaveCSS('border-top-width', '2px')

      await page.getByRole('combobox', { name: 'Slot search' }).fill('missing-value')
      await expect(page.getByTestId('slot-empty')).toHaveText('Nothing matches missing-value')
      await expect(page.getByRole('listbox', { name: 'Slot selector' }).getByRole('option')).toHaveCount(0)
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
      await getTrigger(page, 'Muted large selector').click()
      const panelBox = await page.locator('.tr-model-selector__panel').boundingBox()
      expect(panelBox).toBeTruthy()
      expect(panelBox!.x).toBeGreaterThanOrEqual(7)
      expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(353)

      await getTrigger(page, 'Default effort selector').click()
      const effortGroup = page.getByRole('group', { name: 'Thinking' })
      const effortGroupBox = await effortGroup.boundingBox()
      expect(effortGroupBox).toBeTruthy()
      expect(effortGroupBox!.x).toBeGreaterThanOrEqual(7)
      expect(effortGroupBox!.x + effortGroupBox!.width).toBeLessThanOrEqual(353)
    })
  })
})

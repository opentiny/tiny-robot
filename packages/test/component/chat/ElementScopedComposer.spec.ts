import { expect, test } from '@playwright/experimental-ct-vue'
import Baseline from './ElementBaseline.fixture.vue'
import type {
  ChatEmptyStateRendererContext,
  ChatSenderContentRendererContext,
  ChatSenderRendererContext,
} from '../../../chat/src/experimental/elementRenderers'

for (const kind of ['chat', 'ui'] as const) {
  test(`${kind} Sender Renderer 提供安全文本操作与有效期`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind } })
    const host = page.locator('[data-baseline]')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    await host.evaluate((element) => {
      Reflect.set(element, 'renderers', {
        'sender-footer': (context: ChatSenderRendererContext) => {
          const group = document.createElement('div')
          group.dataset.senderRenderer = ''
          group.dataset.editorExposed = String('editor' in context)
          const replace = document.createElement('button')
          replace.textContent = '填入字面文本'
          replace.onclick = () => context.replace('<b>原样文字</b>')
          const append = document.createElement('button')
          append.textContent = '追加后缀'
          append.onclick = () => context.append(' & 后缀')
          const focus = document.createElement('button')
          focus.textContent = '聚焦原生输入'
          focus.onclick = async () => group.setAttribute('data-focused', String(await context.focus()))
          group.append(replace, append, focus)
          return group
        },
      })
    })
    const actions = host.locator('[data-sender-renderer]')
    await expect(actions).toHaveAttribute('data-editor-exposed', 'false')
    await actions.getByRole('button', { name: '填入字面文本' }).click()
    await expect(host.locator('[contenteditable=true]')).toHaveText('<b>原样文字</b>')
    await actions.getByRole('button', { name: '追加后缀' }).click()
    await expect(host.locator('[contenteditable=true]')).toHaveText('<b>原样文字</b> & 后缀')
    await actions.getByRole('button', { name: '聚焦原生输入' }).click()
    await expect(actions).toHaveAttribute('data-focused', 'true')
    await expect(host.locator('[contenteditable=true]')).toBeFocused()
    const stale = await actions.getByRole('button', { name: '填入字面文本' }).elementHandle()
    await host.evaluate((element) => Reflect.set(element, 'renderers', {}))
    await stale!.evaluate((button) => button.dispatchEvent(new MouseEvent('click')))
    await expect(host.locator('[contenteditable=true]')).toHaveText('<b>原样文字</b> & 后缀')
  })

  test(`${kind} 自定义输入视图订阅草稿并保持焦点`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind } })
    const host = page.locator('[data-baseline]')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    await host.evaluate((element) => {
      Reflect.get(element, 'setInputValue')('预置草稿')
      Reflect.set(element, 'renderers', {
        'sender-content': (context: ChatSenderContentRendererContext, { signal }: { signal: AbortSignal }) => {
          const input = document.createElement('textarea')
          input.placeholder = '宿主自定义输入'
          const unsubscribe = context.subscribe(({ value, disabled }) => {
            if (input.value !== value) input.value = value
            input.disabled = disabled
          })
          input.addEventListener('input', () => context.setInputValue(input.value), { signal })
          input.ondblclick = () => context.setInputValue('过期输入')
          signal.addEventListener(
            'abort',
            () => {
              unsubscribe()
              input.dataset.disposed = 'true'
            },
            { once: true },
          )
          return input
        },
        'sender-footer': (context: ChatSenderRendererContext) => {
          const button = document.createElement('button')
          button.textContent = '聚焦宿主输入'
          button.onclick = async () => element.setAttribute('data-host-focused', String(await context.focus()))
          button.ondblclick = () => context.blur()
          return button
        },
      })
    })
    const input = host.getByPlaceholder('宿主自定义输入', { exact: true })
    await expect(input).toHaveValue('预置草稿')
    await input.fill('<b>原样输入</b>\n第二行')
    await host.evaluate((element) => Reflect.get(element, 'setInputValue')('外部更新'))
    await expect(input).toHaveValue('外部更新')
    await expect(input).toBeFocused()
    await input.blur()
    expect(await host.evaluate((element) => Reflect.get(element, 'focusInput')())).toBe(true)
    await expect(input).toBeFocused()
    await host.getByRole('button', { name: '聚焦宿主输入', exact: true }).click()
    await expect(host).toHaveAttribute('data-host-focused', 'true')
    await expect(input).toBeFocused()
    await host
      .getByRole('button', { name: '聚焦宿主输入', exact: true })
      .evaluate((button) => button.dispatchEvent(new MouseEvent('dblclick')))
    await expect(input).not.toBeFocused()
    const old = await input.elementHandle()
    await host.evaluate((element) => Reflect.set(element, 'renderers', {}))
    await expect(host.locator('[contenteditable=true]')).toHaveText('外部更新')
    await expect.poll(() => old!.getAttribute('data-disposed')).toBe('true')
    await old!.evaluate((node) => node.dispatchEvent(new MouseEvent('dblclick')))
    await expect(host.locator('[contenteditable=true]')).toHaveText('外部更新')
  })

  test(`${kind} 欢迎 Renderer 组合原生输入并保留草稿`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind } })
    const host = page.locator('[data-baseline]')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    await host.evaluate((element) => {
      Reflect.set(element, 'isEmpty', true)
      Reflect.get(element, 'setInputValue')('欢迎草稿')
      Reflect.set(element, 'renderers', {
        'layout-empty-state': (context: ChatEmptyStateRendererContext) => {
          const section = document.createElement('section')
          section.dataset.customWelcome = ''
          const composer = context.renderComposer()
          section.dataset.sameComposer = String(composer === context.renderComposer())
          const title = document.createElement('h2')
          title.textContent = '自定义欢迎区'
          if (composer) section.append(title, composer)
          const late = document.createElement('button')
          late.textContent = '检查欢迎上下文'
          late.onclick = () => section.setAttribute('data-late-empty', String(context.renderComposer() === null))
          section.append(late)
          return section
        },
      })
    })
    const welcome = host.locator('[data-custom-welcome]')
    await expect(welcome.getByRole('heading', { name: '自定义欢迎区' })).toBeVisible()
    await expect(welcome).toHaveAttribute('data-same-composer', 'true')
    const editor = welcome.locator('[contenteditable=true]')
    await expect(editor).toHaveText('欢迎草稿')
    await editor.fill('<b>欢迎区草稿</b> & 原样文字')
    await host.evaluate((element) => {
      const ui = Reflect.get(element, 'ui')
      Reflect.set(element, 'ui', { ...ui, welcome: { title: '无关的默认欢迎标题' } })
    })
    await expect(editor).toHaveText('<b>欢迎区草稿</b> & 原样文字')
    await expect(editor).toBeFocused()
    await welcome.getByRole('button', { name: '检查欢迎上下文' }).click()
    await expect(welcome).toHaveAttribute('data-late-empty', 'true')
    await host.evaluate((element) => Reflect.set(element, 'renderers', {}))
    await expect(host.locator('[contenteditable=true]')).toHaveText('<b>欢迎区草稿</b> & 原样文字')
  })
}

test('禁用的宿主输入视图接收状态且不接受编辑命令', async ({ mount, page }) => {
  await mount(Baseline, { props: { variant: 'adapted', kind: 'ui' } })
  const host = page.locator('[data-baseline]')
  await expect(host.locator('[contenteditable=true]')).toBeVisible()
  await host.evaluate((element) => {
    Reflect.set(element, 'renderers', {
      'sender-content': (context: ChatSenderContentRendererContext) => {
        const input = document.createElement('textarea')
        input.placeholder = '受控宿主输入'
        context.subscribe(({ value, disabled }) => {
          input.value = value
          input.disabled = disabled
        })
        input.ondblclick = () => context.setInputValue('禁用时的修改')
        return input
      },
    })
  })
  const input = host.getByPlaceholder('受控宿主输入', { exact: true })
  await expect(input).toHaveValue('初始草稿')
  await host.evaluate((element) => {
    const data = Reflect.get(element, 'data')
    Reflect.set(element, 'data', { ...data, sender: { disabled: true } })
  })
  await expect(input).toBeDisabled()
  await input.evaluate((node) => node.dispatchEvent(new MouseEvent('dblclick')))
  await expect(input).toHaveValue('初始草稿')
})

test('欢迎输入容器可由宿主框架在提交视图时挂入', async ({ mount, page }) => {
  await mount(Baseline, { props: { variant: 'adapted', kind: 'ui' } })
  const host = page.locator('[data-baseline]')
  await expect(host.locator('[contenteditable=true]')).toBeVisible()
  await host.evaluate((element) => {
    Reflect.set(element, 'isEmpty', true)
    Reflect.set(element, 'renderers', {
      'layout-empty-state': (scope: ChatEmptyStateRendererContext) => {
        const section = document.createElement('section')
        section.dataset.deferredComposer = ''
        const composer = scope.renderComposer()
        queueMicrotask(() => {
          if (composer) section.append(composer)
        })
        return section
      },
    })
  })
  await expect(host.locator('[data-deferred-composer] [contenteditable=true]')).toBeVisible()
})

test('欢迎 Renderer 在输入区开关变化后更新容器', async ({ mount, page }) => {
  await mount(Baseline, { props: { variant: 'adapted', kind: 'ui' } })
  const host = page.locator('[data-baseline]')
  await expect(host.locator('[contenteditable=true]')).toBeVisible()
  await host.evaluate((element) => {
    Reflect.set(element, 'isEmpty', true)
    Reflect.set(element, 'ui', { ...Reflect.get(element, 'ui'), sender: false })
    Reflect.set(element, 'renderers', {
      'layout-empty-state': (scope: ChatEmptyStateRendererContext) => {
        const section = document.createElement('section')
        section.dataset.switchableWelcome = ''
        const composer = scope.renderComposer()
        if (composer) section.append(composer)
        else section.textContent = '暂未开启输入'
        return section
      },
    })
  })
  await expect(host.getByText('暂未开启输入', { exact: true })).toBeVisible()
  await host.evaluate((element) =>
    Reflect.set(element, 'ui', { ...Reflect.get(element, 'ui'), sender: { mode: 'multiple' } }),
  )
  await expect(host.locator('[data-switchable-welcome] [contenteditable=true]')).toBeVisible()
  await host.locator('[contenteditable=true]').fill('开关前的草稿')
  await host.evaluate((element) => Reflect.set(element, 'ui', { ...Reflect.get(element, 'ui'), sender: false }))
  await expect(host.getByText('暂未开启输入', { exact: true })).toBeVisible()
  await host.evaluate((element) =>
    Reflect.set(element, 'ui', { ...Reflect.get(element, 'ui'), sender: { mode: 'multiple' } }),
  )
  await expect(host.locator('[contenteditable=true]')).toHaveText('开关前的草稿')
})

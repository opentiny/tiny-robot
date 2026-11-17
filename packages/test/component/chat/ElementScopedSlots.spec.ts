import { expect, test } from '@playwright/experimental-ct-vue'
import Baseline from './ElementBaseline.fixture.vue'

for (const kind of ['chat', 'ui'] as const) {
  test(`${kind} Scoped Slot 接收页头上下文并释放旧调用`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind } })
    const host = page.locator('[data-baseline]')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    await host.evaluate((element, kind) => {
      if (kind === 'chat') {
        Reflect.get(element, 'runtime').actions.clearActiveConversation = async () =>
          element.setAttribute('data-created', 'true')
      } else element.addEventListener('create-conversation', () => element.setAttribute('data-created', 'true'))
      Reflect.set(element, 'renderers', {
        'layout-header': (
          context: { title: string; createConversation(): void },
          { signal }: { signal: AbortSignal },
        ) => {
          const header = document.createElement('header')
          header.dataset.renderedHeader = ''
          const title = document.createElement('strong')
          title.textContent = context.title
          const button = document.createElement('button')
          button.textContent = '自定义新建会话'
          button.addEventListener('click', () => context.createConversation(), { signal })
          signal.addEventListener('abort', () => header.setAttribute('data-disposed', 'true'), { once: true })
          const note = document.createElement('input')
          note.placeholder = '页头便签'
          header.append(title, note, button)
          return header
        },
      })
    }, kind)
    const header = host.locator('[data-rendered-header]')
    await expect(header.locator('strong')).toHaveText(kind === 'chat' ? '基线标题' : '界面标题')
    await header.getByPlaceholder('页头便签').fill('宿主未提交的便签')
    await host.evaluate((element) => Reflect.get(element, 'setInputValue')('聊天草稿'))
    await expect(host.locator('[contenteditable=true]')).toHaveText('聊天草稿')
    await expect(header.getByPlaceholder('页头便签')).toHaveValue('宿主未提交的便签')
    const first = await header.elementHandle()
    await host.evaluate((element, kind) => {
      if (kind === 'chat') Reflect.set(element, 'title', '更新后的标题')
      else Reflect.set(element, 'data', { conversation: { title: '更新后的标题' } })
    }, kind)
    await expect(header.locator('strong')).toHaveText('更新后的标题')
    await expect.poll(() => first!.getAttribute('data-disposed')).toBe('true')
    await header.getByRole('button', { name: '自定义新建会话' }).click()
    await expect(host).toHaveAttribute('data-created', 'true')
    const previous = await header.elementHandle()
    await page.getByRole('button', { name: '重连同一元素' }).click()
    await expect(header).toBeVisible()
    await expect.poll(() => previous!.getAttribute('data-disposed')).toBe('true')
    const last = await header.elementHandle()
    await host.evaluate((element) => Reflect.set(element, 'renderers', {}))
    await expect(host.locator('.chat-header__title')).toHaveText('更新后的标题')
    await expect.poll(() => last!.getAttribute('data-disposed')).toBe('true')
  })

  test(`${kind} Renderer 异常清理并可替换为字面文本`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind } })
    const host = page.locator('[data-baseline]')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    await host.evaluate((element) => {
      element.addEventListener('renderer-error', (event) => {
        const [{ name, error }] = (event as CustomEvent).detail
        element.setAttribute('data-renderer-error', `${name}: ${error.message}`)
      })
      Reflect.set(element, 'renderers', {
        'layout-header': (_context: unknown, { signal }: { signal: AbortSignal }) => {
          signal.addEventListener('abort', () => element.setAttribute('data-cleaned', 'true'), { once: true })
          throw new Error('无法生成页头')
        },
      })
    })
    await expect(host).toHaveAttribute('data-renderer-error', 'layout-header: 无法生成页头')
    await expect(host).toHaveAttribute('data-cleaned', 'true')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    await host.evaluate((element) =>
      Reflect.set(element, 'renderers', { 'layout-header': () => '<img src=x>字面文本' }),
    )
    await expect(host.getByText('<img src=x>字面文本', { exact: true })).toBeVisible()
    await expect(host.locator('img[src=x]')).toHaveCount(0)
  })
}

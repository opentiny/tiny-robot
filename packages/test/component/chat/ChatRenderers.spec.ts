import { expect, test } from '@playwright/experimental-ct-vue'
import ChatRenderersFixture from './ChatRenderers.fixture.vue'
import ChatRendererCategoriesFixture from './ChatRendererCategories.fixture.vue'

test.describe('native Chat DOM renderers', () => {
  test('renders live layout-main context and aborts the previous lifecycle before replacement', async ({ mount }) => {
    const component = await mount(ChatRenderersFixture)
    const main = component.getByTestId('layout-main-renderer')

    await expect(main).toHaveText('Initial conversation|idle|1|aborts:0')
    await component.getByTestId('replace-data').click()

    await expect(main).toHaveText('Updated conversation|processing|2|aborts:1')
    await expect(component.getByTestId('renderer-calls')).toHaveText('2')
    await expect(component.getByTestId('renderer-aborts')).toHaveText('1')
  })

  test('prefers a Vue scoped slot without invoking the matching renderer', async ({ mount }) => {
    const component = await mount(ChatRenderersFixture, { props: { useVueSlot: true } })

    await expect(component.getByTestId('layout-main-slot')).toHaveText('Initial conversation|idle|1')
    await expect(component.getByTestId('renderer-calls')).toHaveText('0')
    await expect(component.getByTestId('layout-main-renderer')).toHaveCount(0)
  })

  test('makes a renderer-only right panel available and renders it when opened', async ({ mount }) => {
    const component = await mount(ChatRenderersFixture)

    await component.getByTestId('open-details').click()

    await expect(component.getByTestId('right-aside-renderer')).toHaveText('panel:details')
  })

  test('aborts the active renderer lifecycle when the component unmounts', async ({ mount, page }) => {
    const component = await mount(ChatRenderersFixture)
    await expect(component.getByTestId('layout-main-renderer')).toBeVisible()

    await component.unmount()

    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as typeof window & { __chatRendererLifecycle?: { aborts: number } }).__chatRendererLifecycle
              ?.aborts,
        ),
      )
      .toBeGreaterThan(0)
  })

  test('reports renderer errors and recovers on a later context update', async ({ mount }) => {
    const component = await mount(ChatRenderersFixture, { props: { throwRenderer: true } })

    await expect(component.getByTestId('renderer-error')).toHaveText('native renderer failed')
    await expect(component.getByTestId('layout-main-renderer')).toHaveCount(0)

    await component.getByTestId('recover-renderer').click()

    await expect(component.getByTestId('layout-main-renderer')).toHaveText('Updated conversation|processing|2|aborts:1')
  })
})

test.describe('native Chat DOM renderer categories', () => {
  test('renders header context', async ({ mount }) => {
    const component = await mount(ChatRendererCategoriesFixture, { props: { scenario: 'header' } })
    await expect(component.getByTestId('layout-header-renderer')).toHaveText('Renderer categories|empty:false')
  })

  test('preserves legacy left-aside precedence over granular customizations', async ({ mount }) => {
    const component = await mount(ChatRendererCategoriesFixture, { props: { scenario: 'left-legacy' } })
    await expect(component.getByTestId('layout-left-aside-renderer')).toHaveText('Renderer categories')
    await expect(component.getByTestId('layout-left-aside-brand-renderer')).toHaveCount(0)
  })

  test('renders every granular left-aside customization', async ({ mount }) => {
    const component = await mount(ChatRendererCategoriesFixture, { props: { scenario: 'left-granular' } })
    await expect(component.getByTestId('layout-left-aside-brand-renderer')).toHaveText('brand')
    await expect(component.getByTestId('layout-left-aside-actions-renderer')).toHaveText('actions')
    await expect(component.getByTestId('layout-left-aside-content-renderer')).toHaveText('history:0')
    await expect(component.getByTestId('layout-left-aside-footer-renderer')).toHaveText('footer')
    await expect(component.getByTestId('layout-left-aside-rail-renderer')).toHaveText('rail')
  })

  test('renders history item prefixes when the default history content remains active', async ({ mount }) => {
    const component = await mount(ChatRendererCategoriesFixture, { props: { scenario: 'left-history-prefix' } })
    await expect(component.getByTestId('layout-left-aside-history-prefix-renderer')).toHaveText('conversation-1')
  })

  test('activates a renderer-only empty state without exposing renderComposer', async ({ mount }) => {
    const component = await mount(ChatRendererCategoriesFixture, { props: { scenario: 'empty' } })
    await expect(component.getByTestId('layout-empty-state-renderer')).toHaveText('empty:true|composer:false')
  })

  test('uses composer renderers inside a Vue empty-state renderComposer result', async ({ mount }) => {
    const component = await mount(ChatRendererCategoriesFixture, { props: { scenario: 'empty-vue-composer' } })
    await expect(component.getByTestId('composer-before-renderer')).toHaveText('before:')
    await expect(component.getByTestId('layout-footer-renderer')).toHaveText('loading:false')
    await expect(component.getByTestId('composer-after-renderer')).toHaveText('disabled:false')
  })

  test('renders composer customizations with sender context', async ({ mount }) => {
    const component = await mount(ChatRendererCategoriesFixture, { props: { scenario: 'composer' } })
    await expect(component.getByTestId('composer-before-renderer')).toHaveText('before:')
    await expect(component.getByTestId('layout-footer-renderer')).toHaveText('loading:false')
    await expect(component.getByTestId('composer-after-renderer')).toHaveText('disabled:false')
  })

  test('preserves bubble message and content indexes', async ({ mount }) => {
    const component = await mount(ChatRendererCategoriesFixture, { props: { scenario: 'bubbles' } })
    await expect(component.getByTestId('bubble-prefix-renderer')).toHaveText('assistant:0')
    await expect(component.getByTestId('bubble-suffix-renderer')).toHaveText('assistant:0')
    await expect(component.getByTestId('bubble-after-renderer')).toHaveText('assistant:0')
    await expect(component.getByTestId('bubble-content-footer-renderer')).toHaveText('assistant:0:undefined')
  })

  test('renders right-aside title and panel contexts', async ({ mount }) => {
    const component = await mount(ChatRendererCategoriesFixture, { props: { scenario: 'right-parts' } })
    await expect(component.getByTestId('layout-right-aside-title-renderer')).toHaveText('title:details')
    await expect(component.getByTestId('layout-right-aside-panel-renderer')).toHaveText('panel:details|open:true')
  })

  test('lets the full right-aside renderer suppress panel renderers', async ({ mount }) => {
    const component = await mount(ChatRendererCategoriesFixture, { props: { scenario: 'right-full' } })
    await expect(component.getByTestId('layout-right-aside-renderer')).toHaveText('full:details|open:true')
    await expect(component.getByTestId('layout-right-aside-panel-renderer')).toHaveCount(0)
  })
})

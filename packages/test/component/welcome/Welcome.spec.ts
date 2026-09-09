import { expect, test } from '@playwright/experimental-ct-vue'
import WelcomeFixture from './Welcome.fixture.vue'

test.describe('Welcome', () => {
  test('renders required copy with the default centered alignment', async ({ mount }) => {
    const component = await mount(WelcomeFixture)
    const welcome = component.getByTestId('default-welcome')

    await expect(welcome.getByRole('heading', { name: 'Start here' })).toBeVisible()
    await expect(welcome).toContainText('Ask anything')
    await expect(welcome).toHaveCSS('text-align', 'center')
  })

  test('applies a custom alignment', async ({ mount }) => {
    const component = await mount(WelcomeFixture)

    await expect(component.getByTestId('aligned-welcome')).toHaveCSS('text-align', 'right')
  })

  test('renders the optional icon and footer slot', async ({ mount }) => {
    const component = await mount(WelcomeFixture)
    const welcome = component.getByTestId('slotted-welcome')

    await expect(welcome.getByTestId('welcome-icon')).toHaveText('AI')
    await expect(welcome.getByRole('button', { name: 'Try prompt' })).toBeVisible()
  })
})

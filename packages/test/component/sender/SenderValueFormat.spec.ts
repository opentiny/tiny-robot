import { expect, test } from '@playwright/experimental-ct-vue'
import Sender from './SenderValueFormat.fixture.vue'

test('文本绑定模式按字面内容初始化和更新草稿', async ({ mount }) => {
  const component = await mount(Sender, { props: { format: 'text', value: '<b>原样文字</b>\n第二行' } })
  const editor = component.locator('[contenteditable=true]')
  await expect(editor).toHaveText('<b>原样文字</b>\n第二行')
  await component.update({ props: { value: '<i>外部更新</i> & 原样文字' } })
  await expect(editor).toHaveText('<i>外部更新</i> & 原样文字')
  await component.update({ props: { format: 'html' } })
  await expect(editor).toHaveText('外部更新 & 原样文字')
  await component.update({ props: { format: 'text' } })
  await expect(editor).toHaveText('<i>外部更新</i> & 原样文字')
})

test('默认绑定格式保留既有 HTML 内容解释', async ({ mount }) => {
  const component = await mount(Sender, { props: { value: '<p>兼容内容</p>' } })
  await expect(component.locator('[contenteditable=true]')).toHaveText('兼容内容')
})

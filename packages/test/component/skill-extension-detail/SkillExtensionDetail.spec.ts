import { expect, test } from '@playwright/experimental-ct-vue'
import SkillExtensionDetailFixture from './SkillExtensionDetail.fixture.vue'

test.describe('SkillExtensionDetail', () => {
  test('renders a file browser and previews Markdown files', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('detail')

    await expect(detail.getByRole('heading', { name: 'tiny-genui-skill' })).toBeVisible()
    await expect(detail).toContainText('描述：生成 OpenTiny GenUI schema.json 时使用的 Skill。')
    await expect(detail).toContainText('更新时间：2026-07-10')
    await expect(detail.getByRole('navigation', { name: 'tiny-genui-skill 文件' })).toBeVisible()
    await expect(detail.getByRole('button', { name: 'SKILL.md' })).toHaveAttribute('aria-current', 'page')
    await expect(detail.getByRole('heading', { name: '使用说明' })).toBeVisible()
    await expect(detail.locator('.skill-extension-detail__content')).toHaveAttribute('tabindex', '0')
    await expect(detail.getByRole('button', { name: '编辑' })).toHaveCount(0)
    await expect(detail.locator('.skill-extension-detail__tree-action-trigger')).toHaveCount(0)

    await detail.getByRole('button', { name: 'schema.md', exact: true }).click()
    await expect(detail.getByRole('heading', { name: 'Schema' })).toBeVisible()
    await expect(detail.getByRole('region', { name: 'references/schema.md' })).toContainText('references/schema.md')
    await detail.getByRole('button', { name: 'references' }).click()
    await expect(detail.getByRole('button', { name: 'schema.md', exact: true })).toBeHidden()
  })

  test('renders useful defaults when description and resources are empty', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('empty-detail')

    await expect(detail.getByRole('heading', { name: 'empty-skill' })).toBeVisible()
    await expect(detail).toContainText('描述：暂无描述')
    await expect(detail.getByText('暂无资源文件')).toBeVisible()
  })

  test('loads lazy text resources and provides binary downloads', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('detail')

    await detail.getByRole('button', { name: /lazy\.md/ }).click()
    await expect(detail.getByRole('heading', { name: 'Lazy resource' })).toBeVisible()

    await detail.getByRole('button', { name: 'example.png', exact: true }).click()
    await expect(detail.getByRole('link', { name: '下载', exact: true })).toHaveAttribute('download', 'example.png')
    await expect(detail).toContainText('此二进制文件无法直接预览')
  })

  test('edits Markdown source', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: '编辑' }).click()
    await expect(detail.getByRole('tab', { name: '可视化编辑' })).toHaveAttribute('aria-selected', 'true')
    await detail.getByRole('tab', { name: '源码编辑' }).click()
    const sourceEditor = detail.getByRole('textbox', { name: '源码编辑 SKILL.md' })
    await expect(sourceEditor).toHaveValue(/^# 使用说明\n\n/)
    await expect(sourceEditor).toHaveCSS('outline-style', 'none')
    const draft = '# Updated skill\n\nEdited from source mode.\n'
    await sourceEditor.fill(draft)
    await detail.getByRole('button', { name: '保存' }).click()

    await expect(detail.getByRole('heading', { name: 'Updated skill' })).toBeVisible()
    await expect(detail).toContainText('Edited from source mode.')
    await detail.getByRole('button', { name: '编辑' }).click()
    await detail.getByRole('tab', { name: '源码编辑' }).click()
    await expect(sourceEditor).toHaveValue(draft)
  })

  test('edits Markdown in visual mode and shares its draft with source mode', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: '编辑' }).click()
    const visualEditor = detail.locator('.tiptap[contenteditable="true"]')
    await expect(visualEditor).toBeFocused()
    await visualEditor.press('ControlOrMeta+A')
    await visualEditor.press('Backspace')
    await visualEditor.pressSequentially('Edited visually')
    await visualEditor.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    })
    await detail.getByRole('button', { name: '加粗' }).click()
    await detail.getByRole('tab', { name: '源码编辑' }).click()
    await expect(detail.getByRole('textbox', { name: '源码编辑 SKILL.md' })).toHaveValue('**Edited visually**')
    await detail.getByRole('tab', { name: '可视化编辑' }).click()
    await expect(visualEditor).toContainText('Edited visually')
    await detail.getByRole('button', { name: '保存' }).click()

    await expect(detail).toContainText('Edited visually')
  })

  test('cancels edits without changing the displayed content', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: '编辑' }).click()
    await detail.getByRole('tab', { name: '源码编辑' }).click()
    const editor = detail.getByRole('textbox', { name: '源码编辑 SKILL.md' })
    await editor.fill('# Unsaved changes')
    await detail.getByRole('button', { name: '取消' }).click()

    await expect(detail.getByRole('heading', { name: '使用说明' })).toBeVisible()
    await expect(detail.getByText('# Unsaved changes')).toHaveCount(0)
  })

  test('manages folder and file actions while protecting SKILL.md', async ({ mount, page }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await expect(detail.getByRole('button', { name: 'SKILL.md 操作' })).toHaveCount(0)

    await expect(detail.getByRole('button', { name: '新增文件夹' })).toBeVisible()
    await expect(detail.getByRole('button', { name: '新增文件', exact: true })).toBeVisible()
    await detail.getByRole('button', { name: '新增文件夹' }).click()
    const duplicateFolderDialog = page.getByRole('dialog')
    await duplicateFolderDialog.getByRole('textbox').fill('references')
    await duplicateFolderDialog.getByRole('button', { name: '确定' }).click()
    await expect(duplicateFolderDialog).toContainText('该名称已存在。')
    await duplicateFolderDialog.getByRole('button', { name: '取消' }).click()

    await detail.getByRole('button', { name: '新增文件夹' }).click()
    await page.getByRole('dialog').getByRole('textbox').fill('root-folder')
    await page.getByRole('dialog').getByRole('button', { name: '确定' }).click()
    await expect(detail.getByRole('button', { name: 'root-folder 操作' })).toBeVisible()

    await detail.getByRole('button', { name: '新增文件', exact: true }).click()
    await page.getByRole('dialog').getByRole('textbox').fill('root.md')
    await page.getByRole('dialog').getByRole('button', { name: '确定' }).click()
    await expect(detail.getByRole('button', { name: 'root.md 操作' })).toBeVisible()

    await detail.getByRole('button', { name: 'references 操作' }).click()
    await detail.getByRole('menuitem', { name: '新增文件夹', exact: true }).click()
    const folderDialog = page.getByRole('dialog')
    await folderDialog.getByRole('textbox').fill('草稿')
    await folderDialog.getByRole('button', { name: '确定' }).click()
    await expect(folderDialog).toContainText('名称只能包含英文字母、数字、下划线、中划线和点号。')
    await folderDialog.getByRole('textbox').fill('drafts')
    await folderDialog.getByRole('button', { name: '确定' }).click()
    await expect(detail.getByRole('button', { name: 'drafts 操作' })).toBeVisible()

    await detail.getByRole('button', { name: 'drafts 操作' }).click()
    await detail.getByRole('menuitem', { name: '新增文件', exact: true }).click()
    const nameDialog = page.getByRole('dialog')
    await nameDialog.getByRole('textbox').fill('notes.exe')
    await nameDialog.getByRole('button', { name: '确定' }).click()
    await expect(nameDialog).toContainText('仅支持 .md、.txt、.json 文件。')
    await nameDialog.getByRole('textbox').fill('notes.md')
    await nameDialog.getByRole('button', { name: '确定' }).click()
    await expect(detail.getByRole('button', { name: 'notes.md 操作' })).toBeVisible()

    await detail.getByRole('button', { name: 'notes.md 操作' }).click()
    await detail.getByRole('menuitem', { name: '重命名' }).click()
    await page.getByRole('dialog').getByRole('textbox').fill('renamed.md')
    await page.getByRole('dialog').getByRole('button', { name: '确定' }).click()
    await expect(detail.getByRole('button', { name: 'renamed.md 操作' })).toBeVisible()
    await expect(component.getByTestId('resource-identity-log')).toContainText(
      'references/drafts/renamed.md|references/drafts/notes.md',
    )

    await detail.getByRole('button', { name: 'renamed.md 操作' }).click()
    const deleteAction = detail.getByRole('menuitem', { name: '删除文件', exact: true })
    await expect(deleteAction).toHaveClass(/danger/)
    await deleteAction.click()
    const deleteFileDialog = page.getByRole('dialog')
    await expect(deleteFileDialog).toContainText('确定删除文件“renamed.md”吗？')
    await deleteFileDialog.getByRole('button', { name: '取消' }).click()
    await expect(detail.getByRole('button', { name: 'renamed.md 操作' })).toBeVisible()

    await detail.getByRole('button', { name: 'renamed.md 操作' }).click()
    await detail.getByRole('menuitem', { name: '删除文件', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: '确定' }).click()
    await expect(detail.getByRole('button', { name: 'renamed.md 操作' })).toHaveCount(0)
    await expect(component.getByTestId('file-action-log')).toContainText('create-folder|references/drafts||')
    await expect(component.getByTestId('file-action-log')).toContainText('create-file|references/drafts/notes.md|')
    await expect(component.getByTestId('file-action-log')).toContainText(
      'rename|references/drafts/notes.md|references/drafts/renamed.md',
    )
    await expect(component.getByTestId('file-action-log')).toContainText('delete-file|references/drafts/renamed.md|')

    await detail.getByRole('button', { name: 'drafts 操作' }).click()
    await detail.getByRole('menuitem', { name: '重命名' }).click()
    await page.getByRole('dialog').getByRole('textbox').fill('archive')
    await page.getByRole('dialog').getByRole('button', { name: '确定' }).click()
    await expect(detail.getByRole('button', { name: 'archive 操作' })).toBeVisible()
    await expect(component.getByTestId('file-action-log')).toContainText('rename|references/drafts|references/archive')

    await detail.getByRole('button', { name: 'archive 操作' }).click()
    await detail.getByRole('menuitem', { name: '删除文件夹', exact: true }).click()
    await expect(page.getByRole('dialog')).toContainText('确定删除文件夹“archive”及其中的所有文件吗？')
    await page.getByRole('dialog').getByRole('button', { name: '确定' }).click()
    await expect(detail.getByRole('button', { name: 'archive 操作' })).toHaveCount(0)
    await expect(component.getByTestId('file-action-log')).toContainText('delete-folder|references/archive|')
  })

  test('shows a newly created resource immediately when the parent does not handle save', async ({ mount, page }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('uncontrolled-detail')

    await detail.getByRole('button', { name: 'references 操作' }).click()
    await detail.getByRole('menuitem', { name: '新增文件', exact: true }).click()
    await page.getByRole('dialog').getByRole('textbox').fill('instant.md')
    await page.getByRole('dialog').getByRole('button', { name: '确定' }).click()

    await expect(detail.getByRole('button', { name: 'instant.md 操作' })).toBeVisible()
  })

  test('preserves empty folders when the same Skill definition is saved', async ({ mount, page }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: '新增文件夹' }).click()
    await page.getByRole('dialog').getByRole('textbox').fill('empty-folder')
    await page.getByRole('dialog').getByRole('button', { name: '确定' }).click()
    await expect(detail.getByRole('button', { name: 'empty-folder 操作' })).toBeVisible()

    await detail.getByRole('button', { name: 'schema.md', exact: true }).click()
    await detail.getByRole('button', { name: '编辑' }).click()
    await detail.getByRole('tab', { name: '源码编辑' }).click()
    await detail.getByRole('textbox', { name: '源码编辑 references/schema.md' }).fill('Updated schema')
    await detail.getByRole('button', { name: '保存' }).click()

    await expect(detail.getByRole('button', { name: 'empty-folder 操作' })).toBeVisible()
  })

  test('clears temporary folder state when the Skill definition changes', async ({ mount, page }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('switchable-detail')

    await detail.getByRole('button', { name: 'references 操作' }).click()
    await detail.getByRole('menuitem', { name: '新增文件夹', exact: true }).click()
    await page.getByRole('dialog').getByRole('textbox').fill('drafts')
    await page.getByRole('dialog').getByRole('button', { name: '确定' }).click()
    await expect(detail.getByRole('button', { name: 'drafts 操作' })).toBeVisible()

    await component.getByTestId('switch-definition').click()
    await expect(detail.getByRole('button', { name: 'drafts 操作' })).toHaveCount(0)
    await expect(detail.getByRole('button', { name: 'guide.md 操作' })).toBeVisible()
  })

  test('prompts before switching files when unsaved edits have no business guard', async ({ mount, page }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('uncontrolled-detail')

    await detail.getByRole('button', { name: '编辑' }).click()
    await detail.getByRole('tab', { name: '源码编辑' }).click()
    await detail.getByRole('textbox', { name: '源码编辑 SKILL.md' }).fill('Unsaved content')
    await detail.getByRole('button', { name: 'schema.md', exact: true }).click()

    const switchDialog = page.getByRole('dialog')
    await expect(switchDialog).toContainText('执行“references/schema.md”前是否保存？')
    await expect(detail.getByRole('button', { name: 'SKILL.md' })).toHaveAttribute('aria-current', 'page')
    await expect(detail.getByRole('textbox', { name: '源码编辑 SKILL.md' })).toBeVisible()

    await switchDialog.getByRole('button', { name: '取消' }).click()
    await detail.getByRole('button', { name: 'schema.md', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: '保存并切换' }).click()

    await expect(detail.getByRole('heading', { name: 'Schema', exact: true })).toBeVisible()
    await detail.getByRole('button', { name: 'SKILL.md' }).click()
    await expect(detail).toContainText('Unsaved content')
  })

  test('discards unsaved edits before switching files', async ({ mount, page }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: '编辑' }).click()
    await detail.getByRole('tab', { name: '源码编辑' }).click()
    await detail.getByRole('textbox', { name: '源码编辑 SKILL.md' }).fill('Unsaved content')
    await detail.getByRole('button', { name: 'schema.md', exact: true }).click()

    await page.getByRole('dialog').getByRole('button', { name: '放弃修改' }).click()
    await expect(detail.getByRole('heading', { name: 'Schema', exact: true })).toBeVisible()
    await detail.getByRole('button', { name: 'SKILL.md' }).click()
    await expect(detail).not.toContainText('Unsaved content')
  })

  test('saves through the built-in prompt before switching files', async ({ mount, page }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: '编辑' }).click()
    await detail.getByRole('tab', { name: '源码编辑' }).click()
    await detail.getByRole('textbox', { name: '源码编辑 SKILL.md' }).fill('Saved before switch')
    await detail.getByRole('button', { name: 'schema.md', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: '保存并切换' }).click()

    await expect(detail.getByRole('heading', { name: 'Schema', exact: true })).toBeVisible()
    await expect(detail.getByRole('button', { name: '编辑' })).toBeEnabled()

    await detail.getByRole('button', { name: 'SKILL.md' }).click()
    await expect(detail).toContainText('Saved before switch')
    await expect(detail.getByRole('button', { name: '编辑' })).toBeEnabled()
  })

  test('edits selected text resources and keeps binary resources read-only', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: 'schema.md', exact: true }).click()
    await detail.getByRole('button', { name: '编辑' }).click()
    await detail.getByRole('tab', { name: '源码编辑' }).click()
    await detail.getByRole('textbox', { name: '源码编辑 references/schema.md' }).fill('Updated schema')
    await detail.getByRole('button', { name: '保存' }).click()
    await expect(detail).toContainText('Updated schema')

    await detail.getByRole('button', { name: 'example.png', exact: true }).click()
    await expect(detail.getByRole('button', { name: '编辑' })).toBeDisabled()
  })

  test('keeps the file browser within its configured maximum height', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('many-resources-detail')
    const browser = detail.locator('.skill-extension-detail__browser')
    const sidebar = detail.locator('.skill-extension-detail__sidebar')

    await expect(browser).toHaveCSS('max-height', '320px')
    expect(await sidebar.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)
    await expect(detail.getByRole('button', { name: /file-12\.md/ })).toHaveCount(1)
  })

  test('uses a 520px browser height limit by default', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('detail')

    await expect(detail.locator('.skill-extension-detail__browser')).toHaveCSS('max-height', '520px')
  })
})

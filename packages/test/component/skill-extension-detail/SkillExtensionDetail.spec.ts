import { expect, test } from '@playwright/experimental-ct-vue'
import SkillExtensionDetailFixture from './SkillExtensionDetail.fixture.vue'
import { markdownToHtml, serializeMarkdown } from '../../../components/src/skill-extension-detail/markdown-editor'
import { isSkillPathTaken } from '../../../components/src/skill-extension-detail/skillFileOperations'

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

  test('closes a tree action menu when clicking outside it', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: /references 操作/ }).click()
    const menu = detail.getByRole('menu')
    await expect(menu).toBeVisible()

    await detail.locator('.skill-extension-detail__viewer-heading').click()
    await expect(menu).toBeHidden()
  })

  test('exits inline rename mode when clicking outside the editor', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: 'schema.md 操作' }).click()
    await detail.getByRole('menuitem', { name: '重命名' }).click()
    const input = detail.getByRole('textbox', { name: '重命名 schema.md' })
    await input.fill('renamed-schema.md')
    await detail.locator('.skill-extension-detail__viewer-heading').click()

    await expect(input).toHaveCount(0)
    await expect(detail.getByRole('button', { name: 'renamed-schema.md 操作' })).toBeVisible()
  })

  test('renders useful defaults when description and resources are empty', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('empty-detail')

    await expect(detail.getByRole('heading', { name: 'empty-skill' })).toBeVisible()
    await expect(detail).toContainText('描述：暂无描述')
    await expect(detail.getByRole('button', { name: 'SKILL.md' })).toBeVisible()
    await expect(detail.getByText('暂无资源文件')).toHaveCount(0)
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

  test('keeps edit actions visible and naturally wraps them when needed', async ({ mount, page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: '编辑' }).click()

    const heading = detail.locator('.skill-extension-detail__viewer-heading')
    const measure = () =>
      heading.evaluate((element) => {
        const headingRect = element.getBoundingClientRect()
        const fileNameRect = element.querySelector<HTMLElement>(':scope > span')?.getBoundingClientRect()
        const actionsRect = element
          .querySelector<HTMLElement>('.skill-extension-detail__edit-actions')
          ?.getBoundingClientRect()
        const buttons = Array.from(element.querySelectorAll('button')).map((button) => {
          const rect = button.getBoundingClientRect()
          return { label: (button.textContent ?? '').trim(), left: rect.left, right: rect.right }
        })
        return {
          left: headingRect.left,
          right: headingRect.right,
          bottom: headingRect.bottom,
          fileNameBottom: fileNameRect?.bottom ?? 0,
          actionsTop: actionsRect?.top ?? 0,
          actionsBottom: actionsRect?.bottom ?? 0,
          buttons,
        }
      })

    const layout = await measure()

    expect(layout.buttons).toHaveLength(2)
    expect(layout.buttons.every((button) => button.left >= layout.left && button.right <= layout.right)).toBe(true)
    const save = layout.buttons.find((button) => button.label === '保存')
    const cancel = layout.buttons.find((button) => button.label === '取消')
    const initiallyWrapped = layout.actionsTop > layout.fileNameBottom + 1
    expect(initiallyWrapped ? save?.left : cancel?.left).toBeLessThan(
      initiallyWrapped ? (cancel?.left ?? Infinity) : (save?.left ?? Infinity),
    )

    await heading.evaluate((element) => {
      element.style.width = '200px'
    })
    await expect
      .poll(async () => {
        const next = await measure()
        return next.actionsTop > next.fileNameBottom + 1
      })
      .toBe(true)
    await expect(heading.locator('.skill-extension-detail__edit-actions')).toHaveClass(/is-actions-wrapped/)
    const wrapped = await measure()
    const wrappedSave = wrapped.buttons.find((button) => button.label === '保存')
    const wrappedCancel = wrapped.buttons.find((button) => button.label === '取消')
    expect(wrappedSave?.left).toBeLessThan(wrappedCancel?.left ?? Infinity)
    expect(wrapped.bottom - wrapped.actionsBottom).toBeGreaterThanOrEqual(8)
    await expect(heading.getByRole('button', { name: '取消' })).toBeVisible()
    await expect(heading.getByRole('button', { name: '保存' })).toBeVisible()
  })

  test('resets the wrapped action layout after cancelling and editing again', async ({ mount, page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')
    const heading = detail.locator('.skill-extension-detail__viewer-heading')

    await detail.getByRole('button', { name: '编辑' }).click()
    await detail.getByRole('button', { name: '取消' }).click()
    await expect(detail.getByRole('button', { name: '编辑' })).toBeVisible()
    await detail.getByRole('button', { name: '编辑' }).click()

    const layout = await heading.evaluate((element) => {
      const fileName = element.querySelector<HTMLElement>(':scope > span')?.getBoundingClientRect()
      const actions = element
        .querySelector<HTMLElement>('.skill-extension-detail__edit-actions')
        ?.getBoundingClientRect()
      return {
        wrapped: element.classList.contains('is-actions-wrapped'),
        naturallyWrapped: Boolean(fileName && actions && actions.top > fileName.bottom + 1),
      }
    })

    expect(layout.wrapped).toBe(layout.naturallyWrapped)
  })

  test('keeps every visual editor toolbar action reachable on a narrow viewport', async ({ mount, page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: '编辑' }).click()

    const toolbar = detail.getByRole('toolbar', { name: 'Markdown 格式工具' })
    const layout = await toolbar.evaluate((element) => {
      const toolbarRect = element.getBoundingClientRect()
      const buttons = Array.from(element.querySelectorAll('button')).map((button) => {
        const rect = button.getBoundingClientRect()
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
      })
      return {
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        height: toolbarRect.height,
        buttons,
        right: toolbarRect.right,
      }
    })

    expect(layout.buttons).toHaveLength(11)
    expect(layout.scrollWidth).toBe(layout.clientWidth)
    expect(layout.height).toBeGreaterThan(40)
    expect(layout.buttons.every((button) => button.left >= 0 && button.right <= layout.right + 1)).toBe(true)
    await expect(toolbar.getByRole('button', { name: '撤销' })).toBeVisible()
    await expect(toolbar.getByRole('button', { name: '重做' })).toBeVisible()
  })

  test('keeps the unsaved switch dialog and actions inside a narrow viewport', async ({ mount, page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: '编辑' }).click()
    await detail.getByRole('tab', { name: '源码编辑' }).click()
    await detail.getByRole('textbox', { name: '源码编辑 SKILL.md' }).fill('Unsaved content')
    await detail.getByRole('button', { name: 'schema.md', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const rect = await dialog.evaluate((element) => {
      const bounds = element.getBoundingClientRect()
      return { left: bounds.left, right: bounds.right }
    })
    expect(rect.left).toBeGreaterThanOrEqual(0)
    expect(rect.right).toBeLessThanOrEqual(390)
    await expect(dialog.getByRole('button', { name: '取消' })).toHaveCount(0)
    await expect(dialog.getByRole('button', { name: '放弃修改' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: '保存并切换' })).toBeVisible()
  })

  test('creates a new list item when pressing Enter in visual mode', async ({ mount }) => {
    const component = await mount(SkillExtensionDetailFixture)
    const detail = component.getByTestId('editable-detail')

    await detail.getByRole('button', { name: '编辑' }).click()
    const visualEditor = detail.locator('.tiptap[contenteditable="true"]')
    await visualEditor.press('ControlOrMeta+A')
    await visualEditor.press('Backspace')
    await detail.getByRole('button', { name: '无序列表' }).click()
    await visualEditor.pressSequentially('第一项')
    await visualEditor.press('Enter')
    await visualEditor.pressSequentially('第二项')

    const items = visualEditor.locator('ul > li')
    await expect(items).toHaveCount(2)
    await expect(items.nth(0)).toHaveText('第一项')
    await expect(items.nth(1)).toHaveText('第二项')
  })

  test('preserves table code and list paragraph boundaries when serializing Markdown', () => {
    const markdown = serializeMarkdown({
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableHeader',
                  attrs: { align: null },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'a | b', marks: [{ type: 'code' }] }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  attrs: { align: null },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'a \\| b', marks: [{ type: 'code' }] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'first paragraph' }] },
                { type: 'paragraph', content: [{ type: 'text', text: 'second paragraph' }] },
              ],
            },
          ],
        },
      ],
    })

    expect(markdown).toContain('| `a \\| b` |')
    expect(markdown).toContain('| `a \\\\| b` |')
    expect(markdownToHtml(markdown)).toContain('<code>a | b</code>')
    expect(markdownToHtml(markdown)).toContain('<code>a \\| b</code>')
    expect(markdown).toContain('- first paragraph\n\n  second paragraph')
  })

  test('treats explicit directory ancestors as occupied paths', () => {
    expect(isSkillPathTaken('drafts.md', [], ['drafts.md/empty'])).toBe(true)
    expect(isSkillPathTaken('drafts.md/other', [], ['drafts.md/empty'])).toBe(false)
    expect(isSkillPathTaken('Drafts.md', [], ['drafts.md/empty'], 'drafts.md')).toBe(false)
    expect(isSkillPathTaken('archive', [], ['archive/empty'], 'drafts.md')).toBe(true)
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

    await detail.getByRole('button', { name: '新增文件', exact: true }).click()
    const duplicateEntryDialog = page.getByRole('dialog')
    await duplicateEntryDialog.getByRole('textbox').fill('SKILL.md')
    await duplicateEntryDialog.getByRole('button', { name: '确定' }).click()
    await expect(duplicateEntryDialog).toContainText('该名称已存在。')
    await duplicateEntryDialog.getByRole('button', { name: '取消' }).click()
    await expect(detail.getByRole('button', { name: 'SKILL.md', exact: true })).toHaveCount(1)

    await detail.getByRole('button', { name: '新增文件夹' }).click()
    const hiddenFolderDialog = page.getByRole('dialog')
    await hiddenFolderDialog.getByRole('textbox').fill('.drafts')
    await hiddenFolderDialog.getByRole('button', { name: '确定' }).click()
    await expect(hiddenFolderDialog).toContainText('名称不能以点号开头。')
    await hiddenFolderDialog.getByRole('button', { name: '取消' }).click()

    await detail.getByRole('button', { name: '新增文件夹' }).click()
    const duplicateFolderDialog = page.getByRole('dialog')
    await duplicateFolderDialog.getByRole('textbox').fill('references')
    await duplicateFolderDialog.getByRole('button', { name: '确定' }).click()
    await expect(duplicateFolderDialog).toContainText('该名称已存在。')
    await duplicateFolderDialog.getByRole('button', { name: '取消' }).click()

    await detail.getByRole('button', { name: 'references 操作' }).click()
    await detail.getByRole('menuitem', { name: '新增文件', exact: true }).click()
    const caseInsensitiveFileDialog = page.getByRole('dialog')
    await caseInsensitiveFileDialog.getByRole('textbox').fill('SCHEMA.MD')
    await caseInsensitiveFileDialog.getByRole('button', { name: '确定' }).click()
    await expect(caseInsensitiveFileDialog).toContainText('该名称已存在。')
    await caseInsensitiveFileDialog.getByRole('button', { name: '取消' }).click()

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
    const fileRenameInput = detail.getByRole('textbox', { name: '重命名 notes.md' })
    await fileRenameInput.fill('renamed.md')
    await fileRenameInput.press('Enter')
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
    const folderRenameInput = detail.getByRole('textbox', { name: '重命名 drafts' })
    await folderRenameInput.fill('archive')
    await folderRenameInput.press('Enter')
    await expect(detail.getByRole('button', { name: 'archive 操作' })).toBeVisible()
    await expect(component.getByTestId('file-action-log')).toContainText('rename|references/drafts|references/archive')

    await detail.getByRole('button', { name: 'archive 操作' }).click()
    await detail.getByRole('menuitem', { name: '删除文件夹', exact: true }).click()
    await expect(page.getByRole('dialog')).toContainText('确定删除文件夹“archive”及其中的所有文件吗？')
    await page.getByRole('dialog').getByRole('button', { name: '确定' }).click()
    await expect(detail.getByRole('button', { name: 'archive 操作' })).toHaveCount(0)
    await expect(component.getByTestId('file-action-log')).toContainText('delete-folder|references/archive|')

    await detail.getByRole('button', { name: 'example.png', exact: true }).click()
    await detail.getByRole('button', { name: 'example.png 操作' }).click()
    await detail.getByRole('menuitem', { name: '重命名' }).click()
    const binaryRenameInput = detail.getByRole('textbox', { name: '重命名 example.png' })
    await binaryRenameInput.fill('example.txt')
    await binaryRenameInput.press('Enter')
    await expect(binaryRenameInput).toHaveAttribute('aria-invalid', 'true')
    await expect(binaryRenameInput).toHaveAttribute('title', '二进制文件不能重命名为文本文件。')
    await binaryRenameInput.press('Escape')
  })
})

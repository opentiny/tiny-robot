import { expect, test } from '@playwright/experimental-ct-vue'
import type { Locator } from '@playwright/test'
import path from 'node:path'
import SkillImportFormFixture from './SkillImportForm.fixture.vue'

const validSkillDirectory = path.join(import.meta.dirname, 'fixtures/valid-skill')
const missingEntryDirectory = path.join(import.meta.dirname, 'fixtures/missing-skill')
const githubUrl = 'https://github.com/opentiny/tiny-robot/tree/main/skills/demo'
const githubContentsUrl = 'https://api.github.com/repos/opentiny/tiny-robot/contents/skills/demo?ref=main'
const githubDownloadUrl = 'https://raw.githubusercontent.com/opentiny/tiny-robot/main/skills/demo/SKILL.md'

const dropFile = async (dropzone: Locator, name: string, size: number) => {
  await dropzone.evaluate(
    (element, file) => {
      const transfer = new DataTransfer()
      transfer.items.add(new File([new Uint8Array(file.size)], file.name, { type: 'text/markdown' }))
      element.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }))
    },
    { name, size },
  )
}

const dropDirectory = async (dropzone: Locator, name: string) => {
  await dropzone.evaluate((element, rootName) => {
    const file = new File(['---\nname: demo\n---\n\n# Demo'], 'SKILL.md', { type: 'text/markdown' })
    let readCount = 0
    const entry = {
      isFile: false,
      isDirectory: true,
      name: rootName,
      createReader: () => ({
        readEntries: (resolve: (entries: FileSystemEntry[]) => void) =>
          resolve(
            readCount++ === 0
              ? [
                  {
                    isFile: true,
                    isDirectory: false,
                    name: file.name,
                    file: (resolveFile: (value: File) => void) => resolveFile(file),
                  } as FileSystemFileEntry,
                ]
              : [],
          ),
      }),
    }
    const event = new Event('drop', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'dataTransfer', {
      value: { files: [], items: [{ webkitGetAsEntry: () => entry }] },
    })
    element.dispatchEvent(event)
  }, name)
}

const dropDirectoryWithSize = async (dropzone: Locator, name: string, size: number) => {
  await dropzone.evaluate(
    (element, directory) => {
      const file = new File([new Uint8Array(directory.size)], 'SKILL.md', { type: 'text/markdown' })
      let readCount = 0
      const entry = {
        isFile: false,
        isDirectory: true,
        name: directory.name,
        createReader: () => ({
          readEntries: (resolve: (entries: FileSystemEntry[]) => void) =>
            resolve(
              readCount++ === 0
                ? [
                    {
                      isFile: true,
                      isDirectory: false,
                      name: file.name,
                      file: (resolveFile: (value: File) => void) => resolveFile(file),
                    } as FileSystemFileEntry,
                  ]
                : [],
            ),
        }),
      }
      const event = new Event('drop', { bubbles: true, cancelable: true })
      Object.defineProperty(event, 'dataTransfer', {
        value: { files: [], items: [{ webkitGetAsEntry: () => entry }] },
      })
      element.dispatchEvent(event)
    },
    { name, size },
  )
}

const dropUnreadableDirectory = async (dropzone: Locator) => {
  await dropzone.evaluate((element) => {
    const entry = {
      isFile: false,
      isDirectory: true,
      name: 'unreadable-skill',
      createReader: () => ({
        readEntries: (_resolve: (entries: FileSystemEntry[]) => void, reject: (error: unknown) => void) =>
          reject(new Error('读取 Skill 文件夹失败')),
      }),
    }
    const event = new Event('drop', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'dataTransfer', {
      value: { files: [], items: [{ webkitGetAsEntry: () => entry }] },
    })
    element.dispatchEvent(event)
  })
}

const dropDirectoryWhenReleased = async (dropzone: Locator, name: string) => {
  await dropzone.evaluate((element, rootName) => {
    const file = new File(['---\nname: demo\n---\n\n# Demo'], 'SKILL.md', { type: 'text/markdown' })
    const fileEntry = {
      isFile: true,
      isDirectory: false,
      name: file.name,
      file: (resolveFile: (value: File) => void) => resolveFile(file),
    } as FileSystemFileEntry
    let pending: ((entries: FileSystemEntry[]) => void) | undefined
    let released = false
    const scope = window as unknown as { releaseSkillDrop?: () => void }
    scope.releaseSkillDrop = () => {
      released = true
      const resolve = pending
      pending = undefined
      resolve?.([fileEntry])
    }
    const entry = {
      isFile: false,
      isDirectory: true,
      name: rootName,
      createReader: () => ({
        readEntries: (resolve: (entries: FileSystemEntry[]) => void) => {
          if (released) {
            resolve([])
            return
          }
          pending = resolve
        },
      }),
    }
    const event = new Event('drop', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'dataTransfer', {
      value: { files: [], items: [{ webkitGetAsEntry: () => entry }] },
    })
    element.dispatchEvent(event)
  }, name)
}

test.describe('SkillImportForm', () => {
  test('uses the injected resolver and emits the resolved SkillDefinition', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)

    await component.locator('input[type="file"]').setInputFiles(validSkillDirectory)

    await expect(component.getByTestId('resolver-call-count')).toHaveText('1')
    await expect(component.getByTestId('resolver-input')).toContainText('"source":"local"')
    await expect(component.getByTestId('resolver-input')).toContainText('"name":"SKILL.md"')
    await expect(component.getByText('valid-skill', { exact: true })).toBeVisible()

    await component.getByRole('button', { name: '确定' }).click()
    await expect(component.getByTestId('submit-output')).toContainText('"name":"resolved-local"')
    await expect(component.getByTestId('submit-output')).toContainText('"instructions":"# Resolved"')
  })

  test('uses the dynamically imported kit resolver by default', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('use-default-resolver').click()

    await component.locator('input[type="file"]').setInputFiles(validSkillDirectory)
    await expect(component.getByText('valid-skill', { exact: true })).toBeVisible()
    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')

    await component.getByRole('button', { name: '确定' }).click()
    await expect(component.getByTestId('submit-output')).toContainText('"name":"valid-skill"')
    await expect(component.getByTestId('submit-output')).toContainText('"description":"Skill package used')
  })

  test('rejects invalid local selections before calling the resolver', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    const dropzone = component.getByTestId('skill-dropzone')

    await dropFile(dropzone, 'SKILL.md', 8)
    await expect(component.getByRole('alert')).toHaveText('请拖入一个 Skill 文件夹')
    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')

    await component.locator('input[type="file"]').setInputFiles(missingEntryDirectory)
    await expect(component.getByRole('alert')).toHaveText('Skill 包必须包含 SKILL.md 文件')
    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')
  })

  test('derives the upload limit hint and error message from maxUploadSize', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture, { props: { maxUploadSize: 1.5 * 1024 * 1024 } })
    const dropzone = component.getByTestId('skill-dropzone')

    await expect(dropzone).toContainText('1.5M以内')

    await dropDirectoryWithSize(dropzone, 'big-skill', 2 * 1024 * 1024)
    await expect(component.getByRole('alert')).toHaveText('Skill 包大小不能超过 1.5 MB')
  })

  test('reports a dropped directory read failure without keeping the stale selection', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    const dropzone = component.getByTestId('skill-dropzone')

    await component.locator('input[type="file"]').setInputFiles(validSkillDirectory)
    await expect(component.getByText('valid-skill', { exact: true })).toBeVisible()

    await dropUnreadableDirectory(dropzone)

    await expect(component.getByRole('alert')).toHaveText('读取 Skill 文件夹失败')
    await expect(component.getByRole('button', { name: '确定' })).toBeDisabled()
    await expect(component.getByTestId('submit-output')).toBeEmpty()
  })

  test('blocks submitting the previous Skill while a replacement drop is still read', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    const dropzone = component.getByTestId('skill-dropzone')
    const confirm = component.getByRole('button', { name: '确定' })

    await component.locator('input[type="file"]').setInputFiles(validSkillDirectory)
    await expect(component.getByText('valid-skill', { exact: true })).toBeVisible()
    await expect(confirm).toBeEnabled()

    await dropDirectoryWhenReleased(dropzone, 'replacement-skill')
    await expect(confirm).toBeDisabled()

    await dropzone.evaluate(() => (window as unknown as { releaseSkillDrop?: () => void }).releaseSkillDrop?.())
    await expect(component.getByText('replacement-skill', { exact: true })).toBeVisible()
    await expect(confirm).toBeEnabled()
  })

  test('keeps the upload box size while resolving and shows resolver errors internally', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    const dropzone = component.getByTestId('skill-dropzone')
    const initialBox = await dropzone.boundingBox()

    await component.getByTestId('set-resolver-pending').click()
    await component.locator('input[type="file"]').setInputFiles(validSkillDirectory)

    await expect(component.getByText('正在校验…')).toBeVisible()
    await expect(component.getByRole('button', { name: '确定' })).toBeDisabled()
    expect((await dropzone.boundingBox())?.height).toBe(initialBox?.height)

    await component.getByTestId('release-resolver').click()
    await expect(component.getByText('valid-skill', { exact: true })).toBeVisible()

    await component.getByTestId('set-resolver-error').click()
    await component.locator('input[type="file"]').setInputFiles(validSkillDirectory)
    await expect(component.getByRole('alert')).toHaveText('SKILL.md 的 YAML 格式不正确')
    await expect(component.getByText('点击或拖拽上传Skill包')).toBeVisible()
    await expect(component.getByRole('button', { name: '确定' })).toBeDisabled()
  })

  test('removes a resolved selection and allows the same folder to be selected again', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    const input = component.locator('input[type="file"]')

    await input.setInputFiles(validSkillDirectory)
    await expect(component.getByText('valid-skill', { exact: true })).toBeVisible()

    await component.getByRole('button', { name: '移除 valid-skill' }).click()
    await expect(component.getByText('点击或拖拽上传Skill包')).toBeVisible()

    await input.setInputFiles(validSkillDirectory)
    await expect(component.getByText('valid-skill', { exact: true })).toBeVisible()
    await expect(component.getByTestId('resolver-call-count')).toHaveText('2')
  })

  test('keeps the latest definition when an earlier resolver finishes later', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    const dropzone = component.getByTestId('skill-dropzone')
    await component.getByTestId('set-resolver-race').click()

    await dropDirectory(dropzone, 'slow-skill')
    await dropDirectory(dropzone, 'fast-skill')
    await expect(component.getByText('fast-skill', { exact: true })).toBeVisible()
    await dropzone.evaluate(() => new Promise((resolve) => setTimeout(resolve, 150)))

    await component.getByRole('button', { name: '确定' }).click()
    await expect(component.getByTestId('submit-output')).toContainText('"name":"fast-skill"')
  })

  test('resolves a trimmed GitHub URL and emits the resulting definition', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-github').click()

    const url = component.getByRole('textbox', { name: 'URL' })
    await url.fill('  https://github.com/opentiny/tiny-robot/tree/main/skills/demo  ')
    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByTestId('resolver-input')).toHaveText(
      JSON.stringify({
        source: 'github',
        url: 'https://github.com/opentiny/tiny-robot/tree/main/skills/demo',
        repo: 'opentiny/tiny-robot',
        ref: 'main',
        path: 'skills/demo',
      }),
    )
    await expect(component.getByTestId('submit-output')).toContainText('"name":"resolved-github"')
  })

  test('uses the default kit resolver for GitHub imports', async ({ mount, page }) => {
    await page.route(githubContentsUrl, (route) =>
      route.fulfill({
        json: [
          {
            name: 'SKILL.md',
            path: 'skills/demo/SKILL.md',
            type: 'file',
            size: 80,
            download_url: githubDownloadUrl,
          },
        ],
      }),
    )
    await page.route(githubDownloadUrl, (route) =>
      route.fulfill({
        body: ['---', 'name: github-demo', 'description: GitHub demo', '---', '', '# GitHub Demo'].join('\n'),
      }),
    )

    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('use-default-resolver').click()
    await component.getByTestId('show-github').click()
    await component.getByRole('textbox', { name: 'URL' }).fill(githubUrl)
    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')
    await expect(component.getByTestId('submit-output')).toContainText('"name":"github-demo"')
    await expect(component.getByTestId('submit-output')).toContainText('"instructions":"# GitHub Demo"')
  })

  test('loads a GitHub URL whose branch name contains a slash', async ({ mount, page }) => {
    await page.route(/https:\/\/api\.github\.com\/repos\//, async (route) => {
      const requestUrl = new URL(route.request().url())
      const matchesSkillRoot =
        requestUrl.searchParams.get('ref') === 'feature/demo' &&
        requestUrl.pathname === '/repos/opentiny/tiny-robot/contents/skills/example'

      if (!matchesSkillRoot) {
        await route.fulfill({ status: 404, json: { message: 'Not Found' } })
        return
      }

      await route.fulfill({
        json: [
          {
            name: 'SKILL.md',
            path: 'skills/example/SKILL.md',
            type: 'file',
            size: 80,
            download_url: githubDownloadUrl,
          },
        ],
      })
    })
    await page.route(githubDownloadUrl, (route) =>
      route.fulfill({
        body: ['---', 'name: slash-branch-demo', 'description: Slash branch demo', '---', '', '# Slash Demo'].join(
          '\n',
        ),
      }),
    )

    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('use-default-resolver').click()
    await component.getByTestId('show-github').click()
    await component
      .getByRole('textbox', { name: 'URL' })
      .fill('https://github.com/opentiny/tiny-robot/tree/feature/demo/skills/example')
    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')
    await expect(component.getByTestId('submit-output')).toContainText('"name":"slash-branch-demo"')
  })

  test('decodes percent-encoded GitHub paths and rejects broken encodings', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-github').click()
    const url = component.getByRole('textbox', { name: 'URL' })

    await url.fill('https://github.com/opentiny/tiny-robot/tree/main/my%20skill')
    await component.getByRole('button', { name: '导入' }).click()
    await expect(component.getByTestId('resolver-input')).toHaveText(
      JSON.stringify({
        source: 'github',
        url: 'https://github.com/opentiny/tiny-robot/tree/main/my%20skill',
        repo: 'opentiny/tiny-robot',
        ref: 'main',
        path: 'my skill',
      }),
    )

    await url.fill(`https://github.com/opentiny/tiny-robot/tree/main/${encodeURIComponent('技能目录')}`)
    await component.getByRole('button', { name: '导入' }).click()
    await expect(component.getByTestId('resolver-input')).toContainText('"path":"技能目录"')

    await url.fill('https://github.com/opentiny/tiny-robot/tree/main/%E0%A4%A')
    await component.getByRole('button', { name: '导入' }).click()
    await expect(component.getByRole('alert')).toHaveText('请输入有效的 GitHub Skill 地址')
  })

  test('keeps GitHub loading and resolver errors inside the component', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-github').click()
    await component
      .getByRole('textbox', { name: 'URL' })
      .fill('https://github.com/opentiny/tiny-robot/tree/main/skills/demo')
    await component.getByTestId('set-resolver-pending').click()
    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByRole('button', { name: '导入中…' })).toBeDisabled()
    await component.getByTestId('release-resolver').click()
    await expect(component.getByTestId('submit-output')).toContainText('"name":"resolved-github"')

    await component.getByTestId('set-resolver-error').click()
    await component.getByRole('button', { name: '导入' }).click()
    await expect(component.getByRole('alert')).toHaveText('SKILL.md 的 YAML 格式不正确')
  })

  test('rejects invalid GitHub URLs before calling the resolver', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-github').click()
    const url = component.getByRole('textbox', { name: 'URL' })
    await url.fill('https://github.com/opentiny/tiny-robot/blob/main/skills/demo/SKILL.md')

    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByRole('alert')).toHaveText('请输入有效的 GitHub Skill 地址')
    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')
    await expect(url).toBeFocused()
  })

  test('guides GitHub imports with an https placeholder', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-github').click()

    await expect(component.getByRole('textbox', { name: 'URL' })).toHaveAttribute(
      'placeholder',
      'https://github.com/username/repo/tree/main/skills',
    )
  })

  test('resets internal drafts and errors when the source changes', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('set-resolver-error').click()
    await component.locator('input[type="file"]').setInputFiles(validSkillDirectory)
    await expect(component.getByRole('alert')).toBeVisible()

    await component.getByTestId('show-github').click()
    await expect(component.getByRole('alert')).toHaveCount(0)
    await component.getByRole('textbox', { name: 'URL' }).fill('https://github.com/opentiny/tiny-robot')

    await component.getByTestId('show-local').click()
    await component.getByTestId('show-github').click()
    await expect(component.getByRole('textbox', { name: 'URL' })).toHaveValue('')
  })

  test('emits cancel while keeping transient state internal', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.locator('input[type="file"]').setInputFiles(validSkillDirectory)

    await component.getByRole('button', { name: '取消' }).click()

    await expect(component.getByTestId('cancel-count')).toHaveText('1')
    await expect(component.getByText('valid-skill', { exact: true })).toBeVisible()
  })
})

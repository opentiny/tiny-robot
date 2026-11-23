import { expect, test } from '@playwright/experimental-ct-vue'
import { readFile } from 'node:fs/promises'
import type { Locator, Page } from '@playwright/test'
import path from 'node:path'
import SkillImportFormFixture from './SkillImportForm.fixture.vue'

const validSkillDirectory = path.join(import.meta.dirname, 'fixtures/valid-skill')
const missingEntryDirectory = path.join(import.meta.dirname, 'fixtures/missing-skill')
const archiveFixtureDirectory = path.join(import.meta.dirname, '../../../kit/src/skills/test/fixtures/archives')
const githubUrl = 'https://github.com/opentiny/tiny-robot/tree/main/skills/demo'
const githubDownloadUrl = 'https://raw.githubusercontent.com/opentiny/tiny-robot/main/skills/demo/SKILL.md'
const readArchiveFixture = (name: string) =>
  readFile(new URL(`../../../kit/src/skills/test/fixtures/archives/${name}`, import.meta.url))

const skillEntry = (path: string) => ({
  name: 'SKILL.md',
  path,
  type: 'file',
  size: 80,
  download_url: githubDownloadUrl,
})

type GithubRepositoryMock = {
  heads?: string[]
  tags?: string[]
  /** contents 响应，键为 `<ref>:<path>`，例如 `main:skills/demo` */
  contents?: Record<string, unknown>
}

const mockGithubRepository = async (page: Page, mock: GithubRepositoryMock) => {
  const requests: string[] = []

  await page.route(/https:\/\/api\.github\.com\/repos\//, async (route) => {
    const requestUrl = new URL(route.request().url())
    requests.push(`${requestUrl.pathname}${requestUrl.search}`)

    const matchingRefs = /^\/repos\/[^/]+\/[^/]+\/git\/matching-refs\/(heads|tags)\/(.*)$/.exec(requestUrl.pathname)

    if (matchingRefs) {
      const [, namespace, rawPrefix] = matchingRefs
      const names = (namespace === 'heads' ? mock.heads : mock.tags) ?? []
      const prefix = decodeURIComponent(rawPrefix)

      await route.fulfill({
        json: names
          .filter((name) => name.startsWith(prefix))
          .map((name) => ({ ref: `refs/${namespace}/${name}`, object: { sha: '0'.repeat(40), type: 'commit' } })),
      })
      return
    }

    const contents = /^\/repos\/[^/]+\/[^/]+\/contents\/(.*)$/.exec(requestUrl.pathname)
    const entry = contents
      ? mock.contents?.[`${requestUrl.searchParams.get('ref') ?? ''}:${decodeURIComponent(contents[1])}`]
      : undefined

    if (!entry) {
      await route.fulfill({ status: 404, json: { message: 'Not Found' } })
      return
    }

    await route.fulfill({ json: entry })
  })

  return requests
}

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
  for (const name of ['root-deflate.zip', 'wrapped-deflate.zip']) {
    test(`imports ${name} through the default Kit resolver`, async ({ mount }) => {
      const component = await mount(SkillImportFormFixture)
      await component.getByTestId('show-archive').click()
      await component.getByTestId('use-default-resolver').click()
      await component.locator('input[type="file"]').setInputFiles(path.join(archiveFixtureDirectory, name))
      await expect(component.getByRole('button', { name: '确定' })).toBeEnabled()
      await component.getByRole('button', { name: '确定' }).click()
      const output = component.getByTestId('submit-output')
      await expect(output).toContainText('"name":"archive-skill"')
      const definition = JSON.parse((await output.textContent())!)
      expect(definition.instructions).toBe('# Archive skill')
      expect(definition.resources).toHaveLength(3)
      expect(definition.resources).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'references/说明.md', text: '# 使用说明' }),
          expect.objectContaining({ path: 'assets/icon.bin', binary: { 0: 0, 1: 128, 2: 255, 3: 1 } }),
        ]),
      )
      await expect(component.getByTestId('resolver-call-count')).toHaveText('0')
    })
  }

  test('reports a damaged ZIP from the default Kit resolver without submitting', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-archive').click()
    await component.getByTestId('use-default-resolver').click()
    await component.locator('input[type="file"]').setInputFiles({
      name: 'damaged.zip',
      mimeType: 'application/zip',
      buffer: Buffer.from('damaged archive'),
    })
    await expect(component.getByRole('alert')).toContainText('压缩包已损坏或无法读取，请重新打包后重试')
    await expect(component.getByTestId('submit-output')).toHaveText('')
    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')
  })

  test('maps archive structure failures to a recoverable error', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-archive').click()
    await component.getByTestId('use-default-resolver').click()
    const archive = await readArchiveFixture('root-deflate.zip')
    const invalid = Buffer.from(archive)
    const skillName = Buffer.from('SKILL.md')
    let entryOffset = invalid.indexOf(skillName)
    while (entryOffset !== -1) {
      invalid.write('OTHER.md', entryOffset, 'ascii')
      entryOffset = invalid.indexOf(skillName, entryOffset + skillName.length)
    }
    await component.locator('input[type="file"]').setInputFiles({
      name: 'no-entry.zip',
      mimeType: 'application/zip',
      buffer: invalid,
    })
    await expect(component.getByRole('alert')).toHaveText('压缩包中未找到有效的 Skill 入口，请检查目录结构后重试')
    await expect(component.getByTestId('submit-output')).toHaveText('')
    await expect(component.getByRole('button', { name: '确定' })).toBeDisabled()
    await component.locator('input[type="file"]').setInputFiles(path.join(archiveFixtureDirectory, 'macos.zip'))
    await expect(component.getByRole('button', { name: '确定' })).toBeEnabled()
    await expect(component.getByTestId('submit-output')).toHaveText('')
    await component.getByRole('button', { name: '确定' }).click()
    await expect(component.getByTestId('submit-output')).toContainText('archive-fixture')
  })

  test('reports unsafe archive paths in Chinese', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-archive').click()
    await component.getByTestId('use-default-resolver').click()
    const invalid = Buffer.from(await readArchiveFixture('root-deflate.zip'))
    let offset = invalid.indexOf(Buffer.from('SKILL.md'))
    while (offset !== -1) {
      invalid.write('../bad.m', offset, 'ascii')
      offset = invalid.indexOf(Buffer.from('SKILL.md'), offset + 8)
    }
    await component.locator('input[type="file"]').setInputFiles({
      name: 'unsafe.zip',
      mimeType: 'application/zip',
      buffer: invalid,
    })
    await expect(component.getByRole('alert')).toHaveText('压缩包包含不安全的文件路径，无法导入')
    await expect(component.getByTestId('submit-output')).toHaveText('')
  })

  test('limits expanded content through the default resolver', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture, { props: { maxUploadSize: 1200 } })
    await component.getByTestId('show-archive').click()
    await component.getByTestId('use-default-resolver').click()
    await component.locator('input[type="file"]').setInputFiles({
      name: 'expanded.zip',
      mimeType: 'application/zip',
      buffer: await readArchiveFixture('expanded.zip'),
    })
    await expect(component.getByRole('alert')).toHaveText('压缩包解包后的内容过大，请减少文件后重试')
    await expect(component.getByTestId('submit-output')).toHaveText('')
  })

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

  test('preserves custom archive resolver errors', async ({ mount }) => {
    const resolverError = 'Invalid ZIP archive: custom service rejected this upload'
    const component = await mount(SkillImportFormFixture, { props: { resolverError } })
    await component.getByTestId('show-archive').click()
    await component.getByTestId('set-resolver-error').click()
    await component.locator('input[type="file"]').setInputFiles(path.join(archiveFixtureDirectory, 'root-deflate.zip'))
    await expect(component.getByRole('alert')).toHaveText(resolverError)
    await expect(component.getByTestId('submit-output')).toHaveText('')
  })

  test('imports the downloadable documentation example after explicit confirmation', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-archive').click()
    await component.getByTestId('use-default-resolver').click()
    await component
      .locator('input[type="file"]')
      .setInputFiles(path.join(import.meta.dirname, '../../../../docs/src/public/skill-import-example.zip'))
    await expect(component.getByRole('button', { name: '确定' })).toBeEnabled()
    await expect(component.getByTestId('submit-output')).toHaveText('')
    await component.getByRole('button', { name: '取消' }).click()
    await expect(component.getByTestId('cancel-count')).toHaveText('1')
    await expect(component.getByTestId('submit-output')).toHaveText('')
    await component.getByRole('button', { name: '确定' }).click()
    await expect(component.getByTestId('submit-output')).toContainText('example-skill')
    await expect(component.getByTestId('submit-output')).toContainText('references/说明.md')
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

  test('selects a ZIP archive, resolves it, and emits the resulting skill', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-archive').click()
    await component.locator('input[type="file"]').setInputFiles({
      name: 'weather.zip',
      mimeType: 'application/zip',
      buffer: Buffer.from('zip contents'),
    })

    await expect(component.getByTestId('resolver-input')).toContainText('"source":"archive"')
    await expect(component.getByTestId('resolver-input')).toContainText('"file":"weather.zip"')
    await expect(component.getByTestId('resolver-input')).toContainText('"maxUncompressedSize":10485760')
    await expect(component.getByText('weather.zip', { exact: true })).toBeVisible()
    await component.getByRole('button', { name: '确定' }).click()
    await expect(component.getByTestId('submit-output')).toContainText('"name":"resolved-archive"')
  })

  test('imports real ZIP and TAR fixtures through the default Kit resolver in the browser', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-archive').click()
    await component.getByTestId('use-default-resolver').click()

    for (const name of ['deflate.zip', 'stored.zip', 'ustar.tar', 'skill.tar.gz', 'pax.tar', 'gnu.tar']) {
      await component.locator('input[type="file"]').setInputFiles({
        name,
        mimeType: name.endsWith('.zip') ? 'application/zip' : 'application/gzip',
        buffer: await readArchiveFixture(name),
      })
      await expect(component.getByText(name, { exact: true })).toBeVisible()
      await expect(component.getByRole('button', { name: '确定' })).toBeEnabled()
      await component.getByRole('button', { name: '确定' }).click()
      await expect(component.getByTestId('submit-output')).toContainText('"name":"archive-fixture"')
      await expect(component.getByTestId('submit-output')).toContainText('"description":"Real archive fixture"')
      await expect(component.getByTestId('submit-output')).toContainText('"path":"references/guide.md"')
    }
  })

  test('imports ZIP and TGZ files dropped onto the upload area', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-archive').click()
    await component.getByTestId('use-default-resolver').click()
    const dropzone = component.getByTestId('skill-dropzone')

    for (const name of ['deflate.zip', 'skill.tar.gz']) {
      const bytes = Array.from(await readArchiveFixture(name))
      await dropzone.evaluate(
        (element, payload) => {
          const transfer = new DataTransfer()
          transfer.items.add(
            new File([new Uint8Array(payload.bytes)], payload.name, {
              type: payload.name.endsWith('.zip') ? 'application/zip' : 'application/gzip',
            }),
          )
          element.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }))
        },
        { name, bytes },
      )
      await expect(component.getByText(name, { exact: true })).toBeVisible()
      await expect(component.getByRole('button', { name: '确定' })).toBeEnabled()
      await component.getByRole('button', { name: '确定' }).click()
      await expect(component.getByTestId('submit-output')).toContainText('"name":"archive-fixture"')
    }
  })

  test('rejects unsupported archive types and oversized ZIPs before resolving', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture, { props: { maxUploadSize: 4 * 1024 * 1024 } })
    await component.getByTestId('show-archive').click()
    const input = component.locator('input[type="file"]')

    await input.setInputFiles({
      name: 'skill.rar',
      mimeType: 'application/x-rar-compressed',
      buffer: Buffer.from('rar'),
    })
    await expect(component.getByRole('alert')).toHaveText('目前仅支持 ZIP、TAR、TAR.GZ 和 TGZ 格式压缩包')
    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')

    await input.setInputFiles({
      name: 'skill.zip',
      mimeType: 'application/zip',
      buffer: Buffer.alloc(4 * 1024 * 1024 + 1),
    })
    await expect(component.getByRole('alert')).toHaveText('Skill 压缩包大小不能超过 4 MB')
    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')
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
      }),
    )
    await expect(component.getByTestId('submit-output')).toContainText('"name":"resolved-github"')
  })

  test('uses the default kit resolver for GitHub imports', async ({ mount, page }) => {
    await mockGithubRepository(page, {
      heads: ['main'],
      contents: {
        'main:skills/demo': [
          {
            name: 'SKILL.md',
            path: 'skills/demo/SKILL.md',
            type: 'file',
            size: 80,
            download_url: githubDownloadUrl,
          },
        ],
      },
    })
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
    const requests = await mockGithubRepository(page, {
      heads: ['feature/demo', 'feature/other'],
      contents: {
        'feature/demo:skills/example': [
          {
            name: 'SKILL.md',
            path: 'skills/example/SKILL.md',
            type: 'file',
            size: 80,
            download_url: githubDownloadUrl,
          },
        ],
      },
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
    expect(requests.filter((request) => request.includes('/contents/'))).toEqual([
      '/repos/opentiny/tiny-robot/contents/skills/example?ref=feature%2Fdemo',
    ])
  })

  test('prefers the longest ref that prefixes the URL path', async ({ mount, page }) => {
    const requests = await mockGithubRepository(page, {
      heads: ['probe', 'probe/other'],
      tags: ['probe/deep'],
      contents: {
        'probe/deep:packages': [
          {
            name: 'SKILL.md',
            path: 'packages/SKILL.md',
            type: 'file',
            size: 80,
            download_url: githubDownloadUrl,
          },
        ],
      },
    })
    await page.route(githubDownloadUrl, (route) =>
      route.fulfill({
        body: ['---', 'name: longest-ref-demo', 'description: Longest ref demo', '---', '', '# Longest Ref'].join('\n'),
      }),
    )

    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('use-default-resolver').click()
    await component.getByTestId('show-github').click()
    await component
      .getByRole('textbox', { name: 'URL' })
      .fill('https://github.com/opentiny/tiny-robot/tree/probe/deep/packages')
    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByTestId('submit-output')).toContainText('"name":"longest-ref-demo"')
    expect(requests.filter((request) => request.includes('/contents/'))).toEqual([
      '/repos/opentiny/tiny-robot/contents/packages?ref=probe%2Fdeep',
    ])
  })

  test('uses a commit SHA ref without querying refs', async ({ mount, page }) => {
    const commitSha = '0123456789abcdef0123456789abcdef01234567'
    const requests = await mockGithubRepository(page, {
      heads: ['main'],
      contents: {
        [`${commitSha}:skills/demo`]: [
          {
            name: 'SKILL.md',
            path: 'skills/demo/SKILL.md',
            type: 'file',
            size: 80,
            download_url: githubDownloadUrl,
          },
        ],
      },
    })
    await page.route(githubDownloadUrl, (route) =>
      route.fulfill({
        body: ['---', 'name: commit-ref-demo', 'description: Commit ref demo', '---', '', '# Commit Ref'].join('\n'),
      }),
    )

    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('use-default-resolver').click()
    await component.getByTestId('show-github').click()
    await component
      .getByRole('textbox', { name: 'URL' })
      .fill(`https://github.com/opentiny/tiny-robot/tree/${commitSha}/skills/demo`)
    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByTestId('submit-output')).toContainText('"name":"commit-ref-demo"')
    expect(requests.filter((request) => request.includes('/matching-refs/'))).toEqual([])
    expect(requests.filter((request) => request.includes('/contents/'))).toEqual([
      `/repos/opentiny/tiny-robot/contents/skills/demo?ref=${commitSha}`,
    ])
  })

  test('reports a missing branch or tag without loading the path', async ({ mount, page }) => {
    const requests = await mockGithubRepository(page, { heads: ['feature/other'] })

    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('use-default-resolver').click()
    await component.getByTestId('show-github').click()
    await component
      .getByRole('textbox', { name: 'URL' })
      .fill('https://github.com/opentiny/tiny-robot/tree/feature/demo/skills/example')
    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByRole('alert')).toHaveText('未找到与该链接匹配的分支或标签，请检查链接是否正确')
    expect(requests.filter((request) => request.includes('/contents/'))).toEqual([])
  })

  test('decodes percent-encoded GitHub paths and rejects broken encodings', async ({ mount, page }) => {
    const requests = await mockGithubRepository(page, {
      heads: ['main'],
      contents: {
        'main:my skill': [skillEntry('my skill/SKILL.md')],
        'main:技能目录': [skillEntry('技能目录/SKILL.md')],
      },
    })
    await page.route(githubDownloadUrl, (route) =>
      route.fulfill({
        body: ['---', 'name: decoded-skill', 'description: Decoded path demo', '---', '', '# Decoded'].join('\n'),
      }),
    )

    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('use-default-resolver').click()
    await component.getByTestId('show-github').click()
    const url = component.getByRole('textbox', { name: 'URL' })

    await url.fill('https://github.com/opentiny/tiny-robot/tree/main/my%20skill')
    await component.getByRole('button', { name: '导入' }).click()
    await expect(component.getByTestId('submit-output')).toContainText('"name":"decoded-skill"')

    await url.fill(`https://github.com/opentiny/tiny-robot/tree/main/${encodeURIComponent('技能目录')}`)
    await component.getByRole('button', { name: '导入' }).click()
    await expect(component.getByTestId('submit-output')).toContainText('"name":"decoded-skill"')

    await url.fill('https://github.com/opentiny/tiny-robot/tree/main/%E0%A4%A')
    await component.getByRole('button', { name: '导入' }).click()
    await expect(component.getByRole('alert')).toHaveText('请输入有效的 GitHub Skill 地址')

    expect(requests.filter((request) => request.includes('/contents/'))).toEqual([
      '/repos/opentiny/tiny-robot/contents/my%20skill?ref=main',
      `/repos/opentiny/tiny-robot/contents/${encodeURIComponent('技能目录')}?ref=main`,
    ])
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
    await url.fill('https://github.com/opentiny/tiny-robot/tree/main')

    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByRole('alert')).toHaveText('请输入有效的 GitHub Skill 地址')
    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')
    await expect(url).toBeFocused()

    await url.fill('https://gitlab.com/opentiny/tiny-robot/tree/main/skills/demo')
    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByRole('alert')).toHaveText('请输入有效的 GitHub Skill 地址')
    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')
  })

  test('guides GitHub imports with an https placeholder', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-github').click()

    await expect(component.getByRole('textbox', { name: 'URL' })).toHaveAttribute(
      'placeholder',
      'https://github.com/username/repo/tree/main/skills',
    )
  })

  test('imports a Skill from a blob link that points at SKILL.md', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-github').click()
    await component
      .getByRole('textbox', { name: 'URL' })
      .fill('https://github.com/opentiny/tiny-robot/blob/main/skills/demo/SKILL.md')

    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByTestId('resolver-input')).toHaveText(
      JSON.stringify({
        source: 'github',
        url: 'https://github.com/opentiny/tiny-robot/blob/main/skills/demo/SKILL.md',
        repo: 'opentiny/tiny-robot',
      }),
    )
    await expect(component.getByTestId('submit-output')).toContainText('"name":"resolved-github"')
  })

  test('rejects a blob link that does not point at SKILL.md', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('show-github').click()
    await component
      .getByRole('textbox', { name: 'URL' })
      .fill('https://github.com/opentiny/tiny-robot/blob/main/skills/demo/README.md')

    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByRole('alert')).toHaveText('请粘贴 Skill 目录链接，或指向 SKILL.md 的文件链接')
    await expect(component.getByTestId('resolver-call-count')).toHaveText('0')
  })

  test('explains a missing GitHub repository path instead of showing the raw fetch error', async ({ mount, page }) => {
    await page.route(/https:\/\/api\.github\.com\/repos\//, (route) =>
      route.fulfill({ status: 404, json: { message: 'Not Found' } }),
    )

    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('use-default-resolver').click()
    await component.getByTestId('show-github').click()
    await component.getByRole('textbox', { name: 'URL' }).fill(githubUrl)
    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByRole('alert')).toHaveText(
      '未找到对应的仓库、分支或目录，请检查链接是否正确，或确认仓库是否可公开访问',
    )
  })

  test('explains a rejected GitHub request', async ({ mount, page }) => {
    await page.route(/https:\/\/api\.github\.com\/repos\//, (route) =>
      route.fulfill({ status: 403, json: { message: 'API rate limit exceeded' } }),
    )

    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('use-default-resolver').click()
    await component.getByTestId('show-github').click()
    await component.getByRole('textbox', { name: 'URL' }).fill(githubUrl)
    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByRole('alert')).toHaveText(
      'GitHub 拒绝了本次访问，可能是权限不足或触发了访问频率限制，请稍后重试',
    )
  })

  test('explains a network failure', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture)
    await component.getByTestId('set-resolver-network-error').click()
    await component.getByTestId('show-github').click()
    await component.getByRole('textbox', { name: 'URL' }).fill(githubUrl)
    await component.getByRole('button', { name: '导入' }).click()

    await expect(component.getByRole('alert')).toHaveText('网络请求失败，请检查网络连接后重试')
  })

  test('stops waiting for a slow resolver after resolveTimeout', async ({ mount }) => {
    const component = await mount(SkillImportFormFixture, { props: { resolveTimeout: 100 } })
    await component.getByTestId('set-resolver-pending').click()
    await component.locator('input[type="file"]').setInputFiles(validSkillDirectory)

    await expect(component.getByRole('alert')).toHaveText('导入超时，请稍后重试')
    await expect(component.getByText('正在校验…')).toHaveCount(0)

    await component.getByTestId('release-resolver').click()
    await expect(component.getByTestId('submit-output')).toBeEmpty()
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

import assert from 'node:assert/strict'
import test from 'node:test'
import MarkdownIt from '../docs/node_modules/markdown-it/index.mjs'
import {
  installPackageTagPlugin,
  resolveDocsDistTag,
  tagTinyRobotPackages,
} from '../docs/.vitepress/plugins/install-tag.mjs'

test('prerelease docs tag TinyRobot install commands for the selected release channel', () => {
  const source = [
    'pnpm add @opentiny/tiny-robot-chat @opentiny/tiny-robot',
    'yarn add @opentiny/tiny-robot-kit @opentiny/tiny-robot-svgs',
    'npm install @opentiny/tiny-robot-chat',
    'npx @opentiny/tiny-robot-cli create my-app --template basic',
  ].join('\n')

  assert.equal(
    tagTinyRobotPackages(source, 'rc'),
    [
      'pnpm add @opentiny/tiny-robot-chat@rc @opentiny/tiny-robot@rc',
      'yarn add @opentiny/tiny-robot-kit@rc @opentiny/tiny-robot-svgs@rc',
      'npm install @opentiny/tiny-robot-chat@rc',
      'npx @opentiny/tiny-robot-cli@rc create my-app --template basic',
    ].join('\n'),
  )
})

test('stable docs and unrelated dependencies keep their original install commands', () => {
  assert.equal(
    tagTinyRobotPackages('pnpm add @opentiny/tiny-robot markdown-it dompurify', 'latest'),
    'pnpm add @opentiny/tiny-robot markdown-it dompurify',
  )
  assert.equal(
    tagTinyRobotPackages('pnpm add @opentiny/tiny-robot-style markdown-it', 'beta'),
    'pnpm add @opentiny/tiny-robot-style markdown-it',
  )
  assert.equal(tagTinyRobotPackages('npm ls @opentiny/tiny-robot', 'beta'), 'npm ls @opentiny/tiny-robot')
})

test('the docs release channel is derived from the published VitePress base path', () => {
  assert.equal(resolveDocsDistTag({ VITEPRESS_BASE: '/tiny-robot/beta/' }), 'beta')
  assert.equal(resolveDocsDistTag({ VITEPRESS_BASE: '/tiny-robot/latest/' }), 'latest')
  assert.equal(resolveDocsDistTag({}), 'latest')
})

test('the Markdown plugin changes shell fences without changing source-code fences', () => {
  const markdown = new MarkdownIt().use(installPackageTagPlugin, { distTag: 'alpha' })
  const rendered = markdown.render(
    [
      '```bash [pnpm]',
      'pnpm add @opentiny/tiny-robot-chat',
      '```',
      '',
      '```ts',
      "import { TrChat } from '@opentiny/tiny-robot-chat'",
      '```',
    ].join('\n'),
  )

  assert.match(rendered, /pnpm add @opentiny\/tiny-robot-chat@alpha/)
  assert.match(rendered, /from '@opentiny\/tiny-robot-chat'/)
})

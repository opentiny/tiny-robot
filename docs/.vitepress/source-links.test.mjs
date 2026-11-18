import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveSourceLinks } from './source-links.ts'

test('显式配置优先于 Actions 上下文，目录与文件链接指向同一个源码分支', () => {
  const source = resolveSourceLinks({
    env: {
      DOCS_SOURCE_REPOSITORY: 'gene9831/tiny-robot',
      DOCS_SOURCE_REF: 'codex/tr-chat-angular-slots',
      GITHUB_REPOSITORY: 'opentiny/tiny-robot',
      GITHUB_REF_NAME: 'main',
    },
  })
  assert.equal(source.treeBase, 'https://github.com/gene9831/tiny-robot/tree/codex/tr-chat-angular-slots')
  assert.equal(source.blobBase, 'https://github.com/gene9831/tiny-robot/blob/codex/tr-chat-angular-slots')
})

test('Actions 构建自动使用执行构建的 fork 和分支', () => {
  const source = resolveSourceLinks({ env: { GITHUB_REPOSITORY: 'gene9831/tiny-robot', GITHUB_REF_NAME: 'docs/demo' } })
  assert.equal(source.treeBase, 'https://github.com/gene9831/tiny-robot/tree/docs/demo')
})

test('本地构建使用 origin 仓库和当前分支', () => {
  const readGit = (args) => (args[0] === 'remote' ? 'git@github.com:gene9831/tiny-robot.git' : 'feature/docs')
  const source = resolveSourceLinks({ env: {}, readGit })
  assert.equal(source.treeBase, 'https://github.com/gene9831/tiny-robot/tree/feature/docs')
})

test('detached HEAD 使用实际检出的提交，PR 合并引用不会成为分支链接', () => {
  const source = resolveSourceLinks({
    env: { GITHUB_REPOSITORY: 'gene9831/tiny-robot', GITHUB_REF_NAME: '42/merge', GITHUB_REF: 'refs/pull/42/merge' },
    readGit: (args) => (args[0] === 'rev-parse' ? 'abc123' : ''),
  })
  assert.equal(source.treeBase, 'https://github.com/gene9831/tiny-robot/tree/abc123')
})

test('分支名中的 URL 特殊字符按路径段编码', () => {
  const source = resolveSourceLinks({
    env: { DOCS_SOURCE_REPOSITORY: 'gene9831/tiny-robot', DOCS_SOURCE_REF: 'feature/示例#1' },
  })
  assert.equal(source.treeBase, 'https://github.com/gene9831/tiny-robot/tree/feature/%E7%A4%BA%E4%BE%8B%231')
})

test('无法确定仓库时给出配置错误，避免生成错误目标', () => {
  assert.throws(() => resolveSourceLinks({ env: {}, readGit: () => '' }), /DOCS_SOURCE_REPOSITORY/)
})

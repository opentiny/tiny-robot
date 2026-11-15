import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import ts from 'typescript'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const packageDir = path.join(rootDir, 'packages/chat')
const distDir = path.join(packageDir, 'dist')

test('builds every published chat export target', () => {
  for (const target of [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/experimental.js',
    'dist/experimental-node.js',
    'dist/experimental.d.ts',
    'dist/web-component.css',
  ]) {
    assert.equal(fs.existsSync(path.join(packageDir, target)), true, `missing built export target: ${target}`)
  }
})

test('keeps experimental declarations framework-neutral and internally resolvable', () => {
  const declarationFiles = fs
    .readdirSync(distDir, { recursive: true })
    .filter((name) => name.endsWith('.d.ts') && name !== 'index.d.ts')

  for (const name of declarationFiles) {
    assert.doesNotMatch(name, /\.test\.d\.ts$/, `test declaration was published: ${name}`)
    const file = path.join(distDir, name)
    const source = fs.readFileSync(file, 'utf8')
    assert.doesNotMatch(source, /from\s+['"]vue['"]|import\(['"]vue['"]\)/, `${name} exposes Vue types`)

    for (const [, specifier] of source.matchAll(/from\s+['"](\.{1,2}\/[^'"]*|\.{1,2})['"]/g)) {
      const target = path.resolve(path.dirname(file), specifier)
      const packageFile = path.join(target, 'package.json')
      const packageTypes = fs.existsSync(packageFile)
        ? path.resolve(target, JSON.parse(fs.readFileSync(packageFile, 'utf8')).types ?? '')
        : undefined
      const resolves = [`${target}.d.ts`, path.join(target, 'index.d.ts'), packageTypes].some(
        (candidate) => candidate && fs.existsSync(candidate),
      )

      assert.equal(resolves, true, `${name} has an unresolved declaration import: ${specifier}`)
    }
  }
})

test('types custom elements as normal DOM nodes with native and custom event listeners', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'trchat-dom-types-'))
  try {
    const file = path.join(temporary, 'consumer.ts')
    fs.writeFileSync(
      file,
      `
      import type { TrChatHTMLElement, TrChatUIHTMLElement, TrChatRenderers, ChatSenderRendererContext, ChatEmptyStateRendererContext } from ${JSON.stringify(path.join(distDir, 'experimental'))}
      declare const chat: TrChatHTMLElement
      declare const ui: TrChatUIHTMLElement
      document.body.append(chat, ui)
      const sender = (context: ChatSenderRendererContext) => {
        const disabled: boolean = context.disabled
        const loading: boolean = context.loading
        const hasContent: boolean = context.hasContent
        const focused: Promise<boolean> = context.focus()
        context.blur(); context.insert('text'); context.append('text'); context.replace('text')
        // @ts-expect-error DOM sender contexts deliberately omit the editor instance.
        context.editor
        return document.createElement('button')
      }
      const empty = (context: ChatEmptyStateRendererContext) => {
        const container: HTMLElement | null = context.renderComposer()
        return container
      }
      const renderers: TrChatRenderers = {
        'sender-actions-inline': sender, 'sender-footer': sender, 'sender-footer-right': sender,
        'layout-empty-state': empty,
      }
      chat.renderers = renderers; ui.renderers = renderers

      const native: HTMLElement[] = [chat, ui]
      for (const element of native) element.addEventListener('click', event => { const button: number = event.button })
      chat.addEventListener('click', event => { const button: number = event.button })
      ui.addEventListener('keydown', event => { const key: string = event.key })
      const clipboard = (event: CustomEvent<ClipboardEvent>) => event.detail.preventDefault()
      chat.addEventListener('sender-paste', clipboard)
      chat.removeEventListener('sender-paste', clipboard)
      ui.addEventListener('input-value-update', event => { const draft: string = event.detail; ui.inputValue = draft })
      chat.addEventListener('sender-drop', event => event.detail.event.dataTransfer?.files)
      ui.addEventListener('sender-paste', clipboard)
      ui.removeEventListener('sender-paste', clipboard)
      for (const element of [chat, ui]) {
        element.setInputValue('Draft')
        element.clearInput()
        const focused: Promise<boolean> = element.focusInput()
        element.isEmpty = undefined
        element.addEventListener('host-event', { handleEvent(event: Event) {} })
        element.removeEventListener('host-event', null)
      }
    `,
    )
    const program = ts.createProgram([file], {
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    })
    const diagnostics = ts.getPreEmitDiagnostics(program)
    assert.equal(
      diagnostics.length,
      0,
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (file) => file,
        getCurrentDirectory: () => rootDir,
        getNewLine: () => '\n',
      }),
    )
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
})

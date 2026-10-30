import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { Transaction } from '@tiptap/pm/state'
import type { EditorProps, EditorView } from '@tiptap/pm/view'

export function isImeKeyEvent(event: KeyboardEvent, view?: EditorView): boolean {
  return Boolean(view?.composing || event.isComposing || event.keyCode === 229)
}

export function hasCompositionTransaction(transactions: readonly Transaction[]): boolean {
  return transactions.some((tr) => tr.getMeta('composition') !== undefined)
}

export const ImeGuard = Extension.create({
  name: 'senderImeGuard',
  priority: 1000,

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('senderImeGuard'),
        props: {
          handleDOMEvents: {
            // 只跳过编辑器快捷键，保留输入法的原生按键行为。
            keydown: (view, event) => isImeKeyEvent(event, view),
          },
        },
        view(view) {
          const originalSomeProp = view.someProp
          const someProp = originalSomeProp.bind(view)
          // 组合期间的合成 Backspace 仍会进入快捷键链，空事务会破坏输入法维护的文本范围。
          view.someProp = (<PropName extends keyof EditorProps, Result>(
            propName: PropName,
            callback?: (value: NonNullable<EditorProps[PropName]>) => Result,
          ) => {
            if (propName === 'handleKeyDown' && callback && view.composing) return undefined
            return callback ? someProp(propName, callback) : someProp(propName)
          }) as typeof view.someProp

          return {
            destroy() {
              view.someProp = originalSomeProp
            },
          }
        },
      }),
    ]
  },
})

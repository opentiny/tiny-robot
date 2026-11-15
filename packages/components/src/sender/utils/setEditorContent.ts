import { createDocument, type Editor } from '@tiptap/core'

/** Preserve typed whitespace without changing native HTML/schema parsing or setContent transaction behavior. */
export function setEditorContent(editor: Editor, content: string, emitUpdate = true): void {
  const document = createDocument(
    content,
    editor.schema,
    { preserveWhitespace: 'full' },
    {
      errorOnInvalidContent: editor.options.enableContentCheck,
    },
  )
  editor.commands.setContent(document.toJSON(), { emitUpdate })
}

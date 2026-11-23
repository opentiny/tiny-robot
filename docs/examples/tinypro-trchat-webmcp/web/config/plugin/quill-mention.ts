import type { Plugin } from 'vite'

// Mention.register() 调用 Quill.register(MentionLink) 时没有传覆盖标记。
// formats/mention 已经注册过，Quill 会打印 Overwriting。
const MENTION_REGISTER = /(?:Quill|quill_default)\.register\(MentionLink\)(?!\s*,)/g

export function rewriteMentionRegister(code: string) {
  if (!code.includes('register(MentionLink)'))
    return
  return code.replace(MENTION_REGISTER, match => match.replace(/\)$/, ', true)'))
}

export function quillMentionRegisterPlugin(): Plugin {
  return {
    name: 'quill-mention-register',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replaceAll('\\', '/')
      if (!normalized.includes('fluent-editor') || !normalized.includes('mention'))
        return
      return rewriteMentionRegister(code)
    },
  }
}

export function quillMentionOptimizePlugin() {
  return {
    name: 'quill-mention-register-optimize',
    transform(code: string, id: string) {
      if (!id.replaceAll('\\', '/').includes('mention'))
        return
      return rewriteMentionRegister(code)
    },
  }
}

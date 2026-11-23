import type { WebMcpContext } from '@opentiny/tiny-robot-chat'

const TRAILING_SLASH_PATTERN = /\/$/

const pageToolsByRoute: Record<string, string[]> = {
  '/menu/allMenu': ['add-menu'],
  '/permission/allPermission': ['add-permission'],
  '/role/allRole': ['add-role', 'bind-menu-for-role'],
  '/userManager/allInfo': ['add-user'],
  '/locale': ['add-i18n-entry'],
}

export function listPageTools(context: WebMcpContext) {
  if (!context.getTools)
    throw new Error('WebMCP Context 不支持工具查询')
  return context.getTools()
}

export function waitForPageTools(context: WebMcpContext, route: string, timeoutMs = 10_000): Promise<string[]> {
  const path = route.replace(TRAILING_SLASH_PATTERN, '')
  const suffix = Object.keys(pageToolsByRoute).find(item => path.endsWith(item))
  const expectedTools = suffix ? pageToolsByRoute[suffix] : []
  if (expectedTools.length === 0)
    return Promise.resolve([])
  if (!context.getTools || !context.addEventListener || !context.removeEventListener)
    return Promise.reject(new Error('WebMCP Context 不支持工具查询或变化通知'))

  return new Promise((resolve, reject) => {
    let settled = false
    let checking = false
    let checkAgain = false
    const timeout = setTimeout(() => finish(new Error(`页面工具尚未就绪：${expectedTools.join(', ')}`)), timeoutMs)

    function finish(error?: Error) {
      if (settled)
        return
      settled = true
      clearTimeout(timeout)
      context.removeEventListener?.('toolchange', checkTools)
      if (error)
        reject(error)
      else resolve(expectedTools)
    }

    async function checkTools() {
      if (settled)
        return
      if (checking) {
        checkAgain = true
        return
      }
      checking = true
      try {
        const names = new Set((await context.getTools?.() ?? []).map(tool => tool.name))
        if (expectedTools.every(name => names.has(name)))
          finish()
      }
      catch (error) {
        finish(error instanceof Error ? error : new Error(String(error)))
      }
      finally {
        checking = false
        if (checkAgain && !settled) {
          checkAgain = false
          void checkTools()
        }
      }
    }

    context.addEventListener?.('toolchange', checkTools)
    void checkTools()
  })
}

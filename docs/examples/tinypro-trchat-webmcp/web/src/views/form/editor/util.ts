// 同房间本地缓存（IndexedDB）的清理工具：
// 删除协同文档必须先清掉本地房间数据（否则同 id 重建文档会复活旧内容），
// 清理完成后再调用 deleteCollaborationDocument 删除服务端记录。

// 清理本地 IndexedDB 中的协同房间数据；返回是否清理成功
export async function clearCollabRoomData(id: number): Promise<boolean> {
  try {
    const { clearDocument } = await import('y-indexeddb')
    // 其他页面或标签页仍打开该房间连接时 deleteDatabase 会被阻塞，超时按失败处理
    await Promise.race([
      clearDocument(`tiny-pro-collab-${id}`),
      new Promise((_resolve, reject) => setTimeout(() => reject(new Error('clear collab room data timeout')), 3000)),
    ])
    return true
  }
  catch (error) {
    console.error('清理协同文档本地缓存失败', error)
    return false
  }
}

// 等待未完成的房间数据删除落定：主动发起一次 deleteDatabase，
// onsuccess 表示数据库已删除（此前的 pending 删除已落定）；onblocked 表示仍有连接持有该房间，
// 轮询直至删除完成或超时。用于删除失败后恢复编辑器前，避免新连接排在 pending 删除之后、
// 房间数据在编辑器使用过程中被清掉
export function waitCollabRoomDataSettled(room: string, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now()
    const attempt = () => {
      const request = indexedDB.deleteDatabase(room)
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
      request.onblocked = () => {
        if (Date.now() - start > timeoutMs) {
          resolve()
          return
        }
        setTimeout(attempt, 300)
      }
    }
    attempt()
  })
}

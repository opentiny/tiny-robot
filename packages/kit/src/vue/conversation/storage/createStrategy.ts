import { LocalStorageStrategy } from './LocalStorageStrategy'
import { IndexedDBStrategy } from './IndexedDBStrategy'
import type { ConversationStorageStrategy, StorageConfig, StorageType } from './types'

/**
 * 创建存储策略
 */
export function createStorageStrategy(
  type: StorageType = 'localStorage',
  config: StorageConfig = {},
): ConversationStorageStrategy {
  if (type === 'indexedDB') {
    return new IndexedDBStrategy(config.dbName || 'tiny-robot-ai-db', config.dbVersion || 1)
  }
  return new LocalStorageStrategy(config.key || 'tiny-robot-ai-conversations')
}

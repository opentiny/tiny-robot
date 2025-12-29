import { LocalStorageStrategy } from './localStorageStrategy'
import { IndexedDBStrategy } from './indexedDBStrategy'
import type { ConversationStorageStrategy } from './types'

export interface LocalStorageConfig {
  /** 存储键名 (default: 'tiny-robot-ai-conversations') */
  key?: string
}

export interface IndexedDBConfig {
  /** 数据库名称 (default: 'tiny-robot-ai-db') */
  dbName?: string
  /** 数据库版本 (default: 1) */
  dbVersion?: number
}

/**
 * LocalStorage 策略工厂函数
 */
export function localStorageStrategyFactory(config: LocalStorageConfig = {}): ConversationStorageStrategy {
  return new LocalStorageStrategy(config.key || 'tiny-robot-ai-conversations')
}

/**
 * IndexedDB 策略工厂函数
 */
export function indexedDBStorageStrategyFactory(config: IndexedDBConfig = {}): ConversationStorageStrategy {
  return new IndexedDBStrategy(config.dbName || 'tiny-robot-ai-db', config.dbVersion || 1)
}

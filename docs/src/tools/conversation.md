---
outline: [1, 4]
---

# useConversation 会话数据管理

## 概览

`useConversation` 管理多个对话的元数据、当前会话和各会话对应的 `useMessage` 引擎，并通过存储策略加载或持久化消息。它适合需要创建、切换、删除和恢复多个 AI 会话的 Vue 应用。

### 适用场景

- 应用需要维护多个相互独立的消息历史；
- 切换会话后，后台请求仍需继续运行；
- 会话元数据和消息需要保存到 LocalStorage、IndexedDB 或自定义存储；
- 所有会话共享一组 `useMessage` 基础配置，但允许在创建会话时局部覆盖。

如果只管理单个消息流，直接使用 [`useMessage`](./message) 即可。`useConversation` 不负责渲染会话列表、消息气泡或输入框，这些界面仍由应用组合。

## 用法示例

### 管理多个会话

传入消息引擎配置和存储策略后，可以创建、切换和删除会话。示例使用确定性的内存存储与本地模拟响应；切换会话不会中止仍在运行的后台请求。

<demo
  vue="../../demos/tools/conversation/Basic.vue"
  :vueFiles="['../../demos/tools/conversation/Basic.vue', '../../demos/tools/conversation/mockResponseProvider.ts', '../../demos/tools/conversation/mockStorageStrategy.ts']"
  title="多会话管理"
  description="使用本地 mock 演示会话切换、创建、删除和独立消息引擎。"
/>

`activeConversation` 只有在当前会话的消息引擎已经创建后才有值。初始存储加载只恢复 `conversations`；应用需要调用 `switchConversation(id)`，才能按需加载该会话的消息并创建引擎。

### 选择存储策略

未传入 `storage` 时，`useConversation` 默认使用 LocalStorage。存储策略拥有会话元数据和消息的持久化责任；Composable 只协调加载、保存和删除时机。

#### LocalStorage

LocalStorage 适合数据量较小、只需保存在当前浏览器中的会话。默认存储键为 `tiny-robot-ai-conversations`。

<demo
  vue="../../demos/tools/conversation/LocalStorage.vue"
  :vueFiles="['../../demos/tools/conversation/LocalStorage.vue', '../../demos/tools/conversation/mockResponseProvider.ts']"
  title="LocalStorage 持久化"
  description="在浏览器本地保存会话和消息，刷新页面后仍可恢复。"
/>

#### IndexedDB

IndexedDB 适合消息较多或单条内容较大的会话。默认数据库名为 `tiny-robot-ai-db`，版本为 `1`。

<demo
  vue="../../demos/tools/conversation/IndexedDB.vue"
  :vueFiles="['../../demos/tools/conversation/IndexedDB.vue', '../../demos/tools/conversation/mockResponseProvider.ts']"
  title="IndexedDB 持久化"
  description="使用 IndexedDB 保存容量较大的会话数据。"
/>

#### 自定义存储

实现 `ConversationStorageStrategy` 可以接入远程服务或应用自己的数据层。远程实现需要自行处理鉴权、冲突、离线状态和重试；存储方法抛出的错误会按对应动作的规则传播或记录。

<demo
  vue="../../demos/tools/storage/Custom.vue"
  :vueFiles="['../../demos/tools/storage/Custom.vue', '../../demos/tools/storage/mockResponseProvider.ts']"
  title="自定义存储策略"
  description="使用内存实现展示存储接口；刷新页面后数据会丢失。"
/>

### 自动保存消息

设置 `autoSaveMessages: true` 后，已加载引擎的 `messages` 变化会触发节流保存。默认节流时间为 `1000ms`，节流窗口的开始和结束都可能执行保存。工具调用让回合进入暂停状态时，也会执行一次保存，以便后续恢复。

自动保存只监听当前仍保留在内存中的引擎。对于尚未打开、已经回收或仅存在于存储中的会话，调用 `saveMessages(id)` 不会重新加载引擎，也不会写入数据。

## API

`useConversation` 及本页列出的类型和存储工厂均从 `@opentiny/tiny-robot-kit` 导入。

```typescript
const conversation = useConversation(options: UseConversationOptions): UseConversationReturn
```

### 配置

| 配置项              | 类型                                  | 必填 | 默认值                          | 说明                                                                                             |
| ------------------- | ------------------------------------- | ---- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `useMessageOptions` | `UseMessageOptions`                   | 是   | —                               | 所有会话共享的消息引擎基础配置。`createConversation` 的同名配置会在其上做浅合并。                |
| `storage`           | `ConversationStorageStrategy`         | 否   | `localStorageStrategyFactory()` | 加载和持久化会话元数据与消息。                                                                   |
| `autoSaveMessages`  | `boolean`                             | 否   | `false`                         | 是否监听已加载引擎的消息变化并自动保存。                                                         |
| `autoSaveThrottle`  | `number`                              | 否   | `1000`                          | 自动保存节流时间，单位为毫秒；仅在开启自动保存后生效。                                           |
| `onLoad`            | `(items: ConversationInfo[]) => void` | 否   | —                               | 初始会话列表成功加载并与同步创建的会话合并后调用。没有可加载列表时传入空数组；加载失败时不调用。 |

`useMessageOptions` 和创建单个会话时的覆盖项都只在该引擎创建时读取。覆盖采用浅合并；例如传入新的 `plugins` 数组会替换基础配置中的整个数组，而不是自动拼接。

### 状态

| 返回字段               | 类型                                | 更新方            | 说明                                                                                                      |
| ---------------------- | ----------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| `conversations`        | `Ref<ConversationInfo[]>`           | Composable        | 当前会话元数据列表。创建会话时插入列表开头；初始存储加载完成后与已创建的内存会话合并，内存数据优先。      |
| `activeConversationId` | `Ref<string \| null>`               | Composable / 应用 | 当前会话 ID。应用可以读取；应优先通过 `switchConversation`、`createConversation` 和删除动作改变当前会话。 |
| `activeConversation`   | `ComputedRef<Conversation \| null>` | Composable        | 当前会话元数据与消息引擎。ID 不存在或引擎尚未加载时为 `null`。                                            |

虽然这些字段以 Vue Ref 暴露，应用不应直接改写 `conversations` 的结构，否则存储、引擎缓存和当前会话可能失去同步。

### 动作

| 动作                      | 签名                                            | 结果与副作用                                                                                                                                    |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `createConversation`      | `(params?) => Conversation`                     | 同步创建元数据和消息引擎、设为当前会话，并异步保存初始数据。未传 `id` 时生成 ID；异步初始保存失败会记录到控制台，不会让本方法抛错。             |
| `switchConversation`      | `(id: string) => Promise<Conversation \| null>` | 找到会话时按需加载消息并切换；空 ID 或未知 ID 返回 `null`。存储加载消息向外抛错时记录错误，并使用基础配置中的初始消息创建引擎。                 |
| `deleteConversation`      | `(id: string) => Promise<void>`                 | 先中止该会话请求、移除内存状态，再等待存储删除。未知 ID 直接完成；存储删除失败会拒绝 Promise。删除当前会话后不会自动选择另一个会话。            |
| `clear`                   | `() => void`                                    | 清空内存中的全部会话、中止所有已加载引擎，并触发各会话的存储删除。它不等待异步删除完成，也不汇总删除错误。                                      |
| `updateConversationTitle` | `(id: string, title?: string) => void`          | 更新内存标题和 `updatedAt`，随后异步保存元数据。未知 ID 无操作；保存失败记录到控制台。                                                          |
| `saveMessages`            | `(id?: string) => Promise<void>`                | 保存指定会话或当前会话中已加载引擎的消息，同时更新元数据时间。没有目标 ID、引擎未加载或存储不支持保存时直接完成；策略向外抛错时会拒绝 Promise。 |
| `sendMessage`             | `(content: string) => Promise<void>`            | 通过当前会话引擎发送文本；没有当前会话时直接完成。请求错误按 `useMessage.sendMessage` 的规则传播。                                              |
| `abortActiveRequest`      | `() => Promise<void>`                           | 中止当前会话正在处理或暂停的回合；没有当前会话时直接完成。                                                                                      |

#### 创建参数

| 参数                | 类型                         | 必填 | 默认值   | 说明                                                           |
| ------------------- | ---------------------------- | ---- | -------- | -------------------------------------------------------------- |
| `id`                | `string`                     | 否   | 自动生成 | 会话唯一标识。调用方提供 ID 时，需要自行保证当前列表中不重复。 |
| `title`             | `string`                     | 否   | —        | 会话标题。                                                     |
| `metadata`          | `Record<string, unknown>`    | 否   | —        | 应用自定义元数据。                                             |
| `useMessageOptions` | `Partial<UseMessageOptions>` | 否   | —        | 当前会话的消息引擎覆盖配置，与基础配置浅合并。                 |

### 引擎生命周期与并发

每个会话拥有独立的 `useMessage` 引擎。切换会话时：

- 正在处理或暂停的后台引擎会保留，因此多个会话可以并行处理请求；
- 可以开始新回合的非活动引擎会被回收；再次切回时，从存储重新加载消息并创建新引擎；
- 存储未及时保存的内存状态可能在引擎回收后丢失。需要保证恢复一致性时，应开启自动保存或在切换前等待 `saveMessages`；
- 同一会话的保存、改名和删除会按调用顺序串行进入持久化队列，避免较早的写入在删除后才完成。

### 存储策略

以下是 `ConversationStorageStrategy` 的完整定义：

```typescript
interface ConversationStorageStrategy {
  loadConversations: () => MaybePromise<ConversationInfo[]>
  loadMessages: (conversationId: string) => MaybePromise<ChatMessage[]>
  saveConversation: (conversation: ConversationInfo) => MaybePromise<void>
  saveMessages: (conversationId: string, messages: ChatMessage[]) => MaybePromise<void>
  deleteConversation?: (conversationId: string) => MaybePromise<void>
}
```

`deleteConversation` 是可选方法。策略未实现它时，Composable 仍会删除内存状态，但无法删除持久化数据。

#### 存储工厂

```typescript
localStorageStrategyFactory(config?: LocalStorageConfig): ConversationStorageStrategy
indexedDBStorageStrategyFactory(config?: IndexedDBConfig): ConversationStorageStrategy
```

| 配置                 | 字段        | 类型     | 默认值                          | 说明                   |
| -------------------- | ----------- | -------- | ------------------------------- | ---------------------- |
| `LocalStorageConfig` | `key`       | `string` | `'tiny-robot-ai-conversations'` | LocalStorage 存储键。  |
| `IndexedDBConfig`    | `dbName`    | `string` | `'tiny-robot-ai-db'`            | IndexedDB 数据库名。   |
| `IndexedDBConfig`    | `dbVersion` | `number` | `1`                             | IndexedDB 数据库版本。 |

#### 直接创建策略实例

工厂是推荐入口。包根还导出两个策略类，适合已经在应用中集中管理实例的场景：

| 入口                   | 构造签名                                     | 构造函数默认值                                 |
| ---------------------- | -------------------------------------------- | ---------------------------------------------- |
| `LocalStorageStrategy` | `new LocalStorageStrategy(storageKey?)`      | `storageKey = 'tiny-robot-ai-conversations'`   |
| `IndexedDBStrategy`    | `new IndexedDBStrategy(dbName?, dbVersion?)` | `dbName = 'tiny-robot-ai-db'`、`dbVersion = 3` |

注意：`indexedDBStorageStrategyFactory()` 当前传入的默认版本是 `1`，而直接调用 `new IndexedDBStrategy()` 的默认版本是 `3`。已有数据库升级前应明确指定版本，避免依赖两个入口不同的默认值。

### Types

| 类型名                        | 类别 / 用途 | 说明                                                                     |
| ----------------------------- | ----------- | ------------------------------------------------------------------------ |
| `UseConversationOptions`      | 配置        | `useConversation` 的初始化配置。                                         |
| `UseConversationReturn`       | 返回值      | 响应式状态和会话动作集合。                                               |
| `ConversationInfo`            | 数据模型    | 可持久化的会话元数据，包含 `id`、可选 `title`、时间戳和可选 `metadata`。 |
| `Conversation`                | 运行时对象  | `ConversationInfo` 加上当前内存中的 `UseMessageReturn` 引擎。            |
| `ConversationStorageStrategy` | 扩展接口    | 会话和消息的加载、保存与删除协议。                                       |
| `LocalStorageConfig`          | 存储配置    | LocalStorage 工厂配置。                                                  |
| `IndexedDBConfig`             | 存储配置    | IndexedDB 工厂配置。                                                     |
| `MaybePromise<T>`             | 工具类型    | `T \| Promise<T>`，允许存储方法同步或异步实现。                          |
| `UseMessageOptions`           | 关联配置    | 每个会话消息引擎的配置，详见 [`useMessage`](./message#配置)。            |
| `UseMessageReturn`            | 关联返回值  | `Conversation.engine` 的类型，详见 [`useMessage`](./message#状态)。      |

`ConversationInfo.createdAt` 和 `updatedAt` 都是毫秒时间戳。`useConversation` 创建或保存会话时会更新这些字段；自定义存储不应擅自改变会话 ID。

## 迁移与弃用

本页描述当前公开 API。仍在使用 `client`、`state` 或单一 `messageManager` 的项目，可参考 [useConversation 迁移](../migration/use-conversation-migration) 进入以 `useMessageOptions`、独立会话引擎和存储策略为核心的当前架构；迁移后请以本页 API 为准。

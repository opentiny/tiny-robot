import { genPrompt } from '@opentiny/genui-sdk-core'
import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import { components } from './schema'

const systemPrompt = genPrompt(
  {},
  {
    materials: [
      {
        data: {
          framework: 'Vue',
          materials: {
            components: components.map((component) => ({
              component,
              description: component === 'Page' ? '根节点' : '静态 HTML 元素',
              schema: { properties: [] },
            })),
          },
        },
      },
    ],
    examples: [],
    whiteList: components,
    rules: [
      '使用中文回答。需要生成界面时，在说明文字后输出独立的 ```schemaJson 围栏，内容为 JSON；普通问答不必生成界面。',
      '根节点 componentName 为 Page，节点只能包含 componentName、props、children。children 为字符串或节点/字符串数组。',
      '仅使用白名单组件与静态属性；禁止 state、methods、JSExpression、JSFunction、css、事件、链接和外部资源。',
      'props 仅允许 type、name、value、placeholder、required、disabled、maxLength、title、data-action，值只能为字符串、数字或布尔值。',
      'type 仅允许 text、number、date、submit、button。',
      '订单查询表单使用 form，设置 data-action="order-query"，字段 keyword（maxLength 为 80）和 status（空字符串、pending、completed），button type="submit"。',
      'label 的 children 同时包含字段名称和输入元素；select 的 children 使用 option，设置 value 和中文文本。',
      '表单提交由宿主转换为下一轮用户消息。收到查询条件后仅确认条件；未接入真实订单查询工具时，不得编造订单数据或声称查询已执行。',
    ],
  },
  undefined,
  {
    includeJsonSchema: false,
    includeSnippets: false,
    includeExamples: false,
    includeActions: false,
    includeAboutThis: false,
    includeBaseRules: false,
  },
)

const plainTextPrompt =
  '当前未开启生成式 UI。请使用普通文本或 Markdown 回答，不要生成 schemaJson、界面 Schema 或交互卡片；历史中的界面不代表本轮已开启此能力。'

export function createGenuiPlugin(isEnabled: () => boolean): UseMessagePlugin {
  return {
    name: 'genui-prompt',
    onTurnStart({ setCustomContext }) {
      // 固定本轮能力，避免切换会话或工具续请求时读取到新的开关状态。
      setCustomContext({ genuiEnabled: isEnabled() })
    },
    onBeforeRequest({ requestBody, customContext }) {
      // 只补充当前请求，避免提示词进入会话历史或替换原有模型请求链路。
      requestBody.messages = [
        { role: 'system', content: customContext.genuiEnabled === true ? systemPrompt : plainTextPrompt },
        ...requestBody.messages.filter(
          (message) =>
            message.role !== 'system' || (message.content !== systemPrompt && message.content !== plainTextPrompt),
        ),
      ]
    },
    onCompletionChunk({ currentMessage, customContext }) {
      // 标记随消息保存，使历史卡片不受当前开关状态影响。
      currentMessage.metadata = { ...currentMessage.metadata, genuiEnabled: customContext.genuiEnabled === true }
    },
  }
}

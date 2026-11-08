<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Node as PMNode } from '@tiptap/pm/model'
import Sender from '../../../../components/src/sender/index.vue'
import { Mention, Suggestion, Template } from '../../../../components/src/sender/extensions'
import { SuggestionPluginKey } from '../../../../components/src/sender/extensions/suggestion/plugin'
import type {
  MentionItem,
  SenderSuggestionItem,
  SenderSubmitExtra,
  StructuredData,
  TemplateItem,
} from '../../../../components/src/sender/index.type'

type ExtensionKind = 'mention' | 'suggestion' | 'template'
type TemplateScenario =
  | 'mixed'
  | 'simple'
  | 'empty'
  | 'single'
  | 'adjacent'
  | 'empty-adjacent'
  | 'nonempty-empty'
  | 'multiple'
  | 'two-selects'

interface Props {
  kind: ExtensionKind
  templateScenario?: TemplateScenario
  appendTarget?: 'body' | 'explicit-body' | 'selector' | 'element' | 'shadow'
  senderLocation?: 'document' | 'shadow'
  mentionChar?: string
  allowSpaces?: boolean
  mentionItemsWithSpaces?: boolean
  suggestionMode?: 'all' | 'filter' | 'space' | 'no-fill'
  highlightMode?: 'auto' | 'array' | 'function'
  showAutoComplete?: boolean
  popupWidth?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  templateScenario: 'mixed',
  appendTarget: 'body',
  senderLocation: 'document',
  mentionChar: '@',
  allowSpaces: false,
  mentionItemsWithSpaces: false,
  suggestionMode: 'all',
  highlightMode: 'auto',
  showAutoComplete: true,
  popupWidth: 400,
})

const selectorTarget = document.createElement('div')
selectorTarget.id = 'sender-template-selector-target'
selectorTarget.dataset.testid = 'selector-target'
document.body.appendChild(selectorTarget)

const elementTarget = document.createElement('div')
elementTarget.id = 'sender-template-element-target'
elementTarget.dataset.testid = 'element-target'
document.body.appendChild(elementTarget)

const shadowHost = document.createElement('div')
shadowHost.id = 'sender-template-shadow-host'
const shadowRoot = shadowHost.attachShadow({ mode: 'open' })
const shadowTarget = document.createElement('div')
shadowTarget.dataset.testid = 'shadow-target'
shadowRoot.appendChild(shadowTarget)
const shadowSenderTarget = document.createElement('div')
shadowSenderTarget.dataset.testid = 'shadow-sender-target'
shadowRoot.appendChild(shadowSenderTarget)
document.body.appendChild(shadowHost)

const appendTo =
  props.appendTarget === 'explicit-body'
    ? 'body'
    : props.appendTarget === 'selector'
      ? '#sender-template-selector-target'
      : props.appendTarget === 'element'
        ? elementTarget
        : props.appendTarget === 'shadow'
          ? shadowTarget
          : undefined

const mentionItems = ref<MentionItem[]>([
  { id: 'artist', label: '小小画家', value: 'artist-value' },
  { id: 'coder', label: '代码助手', value: 'coder-value' },
  { id: 'copywriter', label: '文案大师', value: 'copywriter-value' },
  { id: 'analyst', label: '数据分析', value: 'analytics-value' },
  ...(props.mentionItemsWithSpaces ? [{ id: 'artist-space', label: '小小 画家', value: 'artist-space-value' }] : []),
])

function resolveSuggestionItems(mode: Props['highlightMode']): SenderSuggestionItem[] {
  if (mode === 'array') {
    return [
      { content: 'ECS-云服务器', highlights: ['ECS', '云服务器'] },
      { content: 'RDS-数据库', highlights: ['RDS'] },
    ]
  }

  if (mode === 'function') {
    return [
      {
        content: '自定义高亮',
        highlights: () => [
          { text: '自定义', isMatch: true },
          { text: '高亮', isMatch: false },
        ],
      },
    ]
  }

  return [
    { content: 'Java', data: { language: 'java' } },
    { content: 'JavaScript', data: { language: 'javascript' } },
    { content: 'TypeScript', data: { language: 'typescript' } },
    { content: 'Python', data: { language: 'python' } },
    { content: 'C++', data: { language: 'cpp' } },
    { content: 'Golang', data: { language: 'go' } },
  ]
}

const suggestionItems = ref<SenderSuggestionItem[]>(resolveSuggestionItems(props.highlightMode))

const templateItems = ref<TemplateItem[]>(resolveTemplateItems(props.templateScenario))
const senderRef = ref()
const modelValue = ref('')
const submitCount = ref(0)
const lastSubmit = ref('[]')
const revision = ref(0)
const suggestionSyncSteps = ref<Array<{ step: string; text: string; active: boolean; itemCount: number }>>([])

function resolveTemplateItems(scenario: TemplateScenario): TemplateItem[] {
  const options = [
    { label: '第一个', value: 'first' },
    { label: '第二个', value: 'second' },
  ]

  switch (scenario) {
    case 'simple':
      return [
        { type: 'text', content: '我是' },
        { type: 'block', content: '张三' },
        { type: 'text', content: '，来自' },
      ]
    case 'empty':
      return [
        { type: 'text', content: '左侧' },
        { type: 'block', content: '' },
        { type: 'text', content: '右侧' },
      ]
    case 'single':
      return [
        { type: 'text', content: '左' },
        { type: 'block', content: '块' },
        { type: 'text', content: '右' },
      ]
    case 'adjacent':
      return [
        { type: 'block', content: '甲' },
        { type: 'block', content: '乙' },
      ]
    case 'empty-adjacent':
      return [
        { type: 'block', content: '' },
        { type: 'block', content: '乙' },
      ]
    case 'nonempty-empty':
      return [
        { type: 'block', content: '甲' },
        { type: 'block', content: '' },
      ]
    case 'multiple':
      return [
        { type: 'block', content: '姓名' },
        { type: 'block', content: '年龄' },
        { type: 'block', content: '城市' },
      ]
    case 'two-selects':
      return [
        { type: 'text', content: '模型 ' },
        { type: 'select', content: '', placeholder: '选择一', options },
        { type: 'text', content: ' / ' },
        { type: 'select', content: '', placeholder: '选择二', options },
      ]
    case 'mixed':
    default:
      return [
        { type: 'text', content: '前缀 ' },
        { type: 'block', content: '原值' },
        { type: 'text', content: ' 中间 ' },
        { type: 'select', content: '', placeholder: '请选择', options },
        { type: 'text', content: ' 后缀' },
      ]
  }
}

const mentionExtension = Mention.configure({
  items: mentionItems,
  char: props.mentionChar,
  allowSpaces: props.allowSpaces,
})

const suggestionExtension = Suggestion.configure({
  items: suggestionItems,
  filterFn:
    props.suggestionMode === 'filter'
      ? (items, query) => items.filter((item) => item.content.toLowerCase().startsWith(query.toLowerCase()))
      : undefined,
  activeSuggestionKeys: props.suggestionMode === 'space' ? [' '] : ['Enter'],
  popupWidth: props.popupWidth,
  showAutoComplete: props.showAutoComplete,
  onSelect: props.suggestionMode === 'no-fill' ? () => false : undefined,
})

const templateExtension = Template.configure({ items: templateItems, appendTo })

const extensions = computed(() => {
  if (props.kind === 'mention') return [mentionExtension]
  if (props.kind === 'suggestion') return [suggestionExtension]
  return [templateExtension]
})

const cleanText = (value: string) => value.replace(/\u200b/g, '')

const getEditor = () => senderRef.value?.editor?.value ?? senderRef.value?.editor

let observedEditor: ReturnType<typeof getEditor> | undefined

const handleSelectionUpdate = () => {
  revision.value += 1
}

onMounted(() => {
  observedEditor = getEditor()
  observedEditor?.on('selectionUpdate', handleSelectionUpdate)
})

const handleUpdate = (value: string) => {
  modelValue.value = value
  revision.value += 1
}

const handleSubmit = (...args: [string, StructuredData?, SenderSubmitExtra?]) => {
  submitCount.value += 1
  lastSubmit.value = JSON.stringify(args.map((value) => value ?? null))
}

const getTemplateNodes = () => {
  const editor = getEditor()
  const blocks: Array<{ node: PMNode; pos: number }> = []
  const selects: Array<{ node: PMNode; pos: number }> = []
  editor?.state.doc.descendants((node: PMNode, pos: number) => {
    if (node.type.name === 'templateBlock') blocks.push({ node, pos })
    if (node.type.name === 'templateSelect') selects.push({ node, pos })
  })
  return { blocks, selects }
}

const prepareSelection = (
  kind:
    | 'block-start'
    | 'block-end'
    | 'last-block-end'
    | 'before-block'
    | 'after-block'
    | 'between-before-zero'
    | 'between-after-zero'
    | 'block-middle'
    | 'block-range',
) => {
  const editor = getEditor()
  if (!editor) return
  const { blocks } = getTemplateNodes()
  const first = blocks[0]
  const second = blocks[1]
  if (!first) return

  let from = first.pos + 1
  let to = from
  if (kind === 'last-block-end') {
    const last = blocks[blocks.length - 1]
    if (!last) return
    from = last.pos + last.node.nodeSize - 1
  } else if (kind === 'block-start') {
    from = first.pos + 1
  } else if (kind === 'block-end') {
    from = first.pos + first.node.nodeSize - 1
  } else if (kind === 'before-block') {
    from = first.pos
  } else if (kind === 'after-block') {
    from = first.pos + first.node.nodeSize
  } else if (kind === 'between-before-zero' && second) {
    from = first.pos + first.node.nodeSize
  } else if (kind === 'between-after-zero' && second) {
    from = first.pos + first.node.nodeSize + 1
  } else if (kind === 'block-middle') {
    from = first.pos + 1 + Math.min(1, first.node.content.size)
  } else if (kind === 'block-range') {
    from = first.pos
    to = first.pos + first.node.nodeSize
  }

  if (kind !== 'block-range') {
    to = from
  }

  editor.commands.setTextSelection({ from, to })
  editor.view.focus()
  revision.value += 1
}

const prepareRangeSelection = (kind: 'block-partial' | 'cross-block') => {
  const editor = getEditor()
  if (!editor) return
  const { blocks } = getTemplateNodes()
  const first = blocks[0]
  const second = blocks[1]
  if (!first) return

  const from = first.pos + 1
  const to =
    kind === 'block-partial'
      ? Math.min(from + 1, first.pos + 1 + first.node.content.size)
      : second
        ? second.pos + 1
        : from

  editor.commands.setTextSelection({ from, to })
  editor.commands.focus()
  revision.value += 1
}

const prepareSelectBoundary = (side: 'before' | 'after') => {
  const editor = getEditor()
  const select = getTemplateNodes().selects[0]
  if (!editor || !select) return

  const position = side === 'before' ? select.pos : select.pos + select.node.nodeSize
  editor.commands.setTextSelection({ from: position, to: position })
  editor.commands.focus()
  revision.value += 1
}

const prepareMentionEnd = () => {
  const editor = getEditor()
  if (!editor) return
  let position: number | undefined
  editor.state.doc.descendants((node: PMNode, pos: number) => {
    if (node.type.name === 'mention' && position === undefined) position = pos + node.nodeSize
  })
  if (position === undefined) return
  editor.commands.setTextSelection(position)
  editor.commands.focus()
  revision.value += 1
}

const updateTemplate = (scenario: TemplateScenario) => {
  templateItems.value = resolveTemplateItems(scenario)
}

const updateMentionItems = () => {
  mentionItems.value = [{ id: 'new', label: '新项目', value: 'new-value' }]
}

const updateSuggestionItems = () => {
  suggestionItems.value = [{ content: '新建议', data: { source: 'ref-update' } }]
}

const recordSuggestionSyncStep = (step: string) => {
  const editor = getEditor()
  const suggestionState = editor ? SuggestionPluginKey.getState(editor.state) : undefined
  suggestionSyncSteps.value = [
    ...suggestionSyncSteps.value,
    {
      step,
      text: editor?.state.doc.textContent ?? '',
      active: suggestionState?.active ?? false,
      itemCount: suggestionState?.filteredSuggestions.length ?? 0,
    },
  ]
}

const runSuggestionSyncSequence = () => {
  const editor = getEditor()
  if (!editor) return

  suggestionSyncSteps.value = []
  editor.view.dom.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }),
  )
  recordSuggestionSyncStep('close')
  editor.commands.clearContent()
  recordSuggestionSyncStep('clear')
  editor.commands.insertContent('P')
  recordSuggestionSyncStep('input')
}

const getBlockTexts = () => getTemplateNodes().blocks.map(({ node }) => cleanText(node.textContent || ''))

const getSelectionState = () => {
  // Keep the selection context observable without exposing editor internals to the test process.
  void revision.value
  const selection = getEditor()?.state.selection
  if (!selection) return ''

  const resolved = selection.$from
  return [
    selection.empty ? 'empty' : 'range',
    resolved.parent.type.name === 'templateBlock' ? 'templateBlock' : resolved.parent.type.name,
    resolved.nodeBefore?.type.name ?? 'none',
    resolved.nodeAfter?.type.name ?? 'none',
  ].join('|')
}

const getSelectionBlockIndex = () => {
  void revision.value
  const editor = getEditor()
  const selection = editor?.state.selection
  if (!selection) return ''

  const blocks = getTemplateNodes().blocks
  for (let depth = selection.$from.depth; depth > 0; depth -= 1) {
    if (selection.$from.node(depth).type.name === 'templateBlock') {
      const position = selection.$from.before(depth)
      return String(blocks.findIndex(({ pos }) => pos === position))
    }
  }

  return 'none'
}

onBeforeUnmount(() => {
  observedEditor?.off('selectionUpdate', handleSelectionUpdate)
  selectorTarget.remove()
  elementTarget.remove()
  shadowHost.remove()
})
</script>

<template>
  <main>
    <section class="fixture-controls">
      <button
        v-if="props.kind === 'template'"
        data-testid="set-template-mixed"
        type="button"
        @click="updateTemplate('mixed')"
      >
        mixed
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="set-template-empty"
        type="button"
        @click="updateTemplate('empty')"
      >
        empty
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="set-template-simple"
        type="button"
        @click="updateTemplate('simple')"
      >
        simple
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="set-template-adjacent"
        type="button"
        @click="updateTemplate('adjacent')"
      >
        adjacent
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="set-template-multiple"
        type="button"
        @click="updateTemplate('multiple')"
      >
        multiple
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="focus-first-template"
        type="button"
        @click="getEditor()?.commands.focusFirstTemplate?.()"
      >
        focus first
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-block-start"
        type="button"
        @click="prepareSelection('block-start')"
      >
        block start
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-block-end"
        type="button"
        @click="prepareSelection('block-end')"
      >
        block end
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-last-block-end"
        type="button"
        @click="prepareSelection('last-block-end')"
      >
        last block end
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-before-block"
        type="button"
        @click="prepareSelection('before-block')"
      >
        before block
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-after-block"
        type="button"
        @click="prepareSelection('after-block')"
      >
        after block
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-between-before-zero"
        type="button"
        @click="prepareSelection('between-before-zero')"
      >
        between before zero
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-between-after-zero"
        type="button"
        @click="prepareSelection('between-after-zero')"
      >
        between after zero
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-block-middle"
        type="button"
        @click="prepareSelection('block-middle')"
      >
        block middle
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-block-partial"
        type="button"
        @click="prepareRangeSelection('block-partial')"
      >
        block partial
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-cross-block"
        type="button"
        @click="prepareRangeSelection('cross-block')"
      >
        cross block
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-block-range"
        type="button"
        @click="prepareSelection('block-range')"
      >
        block range
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-before-select"
        type="button"
        @click="prepareSelectBoundary('before')"
      >
        before select
      </button>
      <button
        v-if="props.kind === 'template'"
        data-testid="select-after-select"
        type="button"
        @click="prepareSelectBoundary('after')"
      >
        after select
      </button>
      <button
        v-if="props.kind === 'mention'"
        data-testid="update-mention-ref"
        type="button"
        @click="updateMentionItems"
      >
        update mention
      </button>
      <button v-if="props.kind === 'mention'" data-testid="select-mention-end" type="button" @click="prepareMentionEnd">
        mention end
      </button>
      <button
        v-if="props.kind === 'suggestion'"
        data-testid="update-suggestion-ref"
        type="button"
        @click="updateSuggestionItems"
      >
        update suggestion
      </button>
      <button
        v-if="props.kind === 'suggestion'"
        data-testid="run-suggestion-sync-sequence"
        type="button"
        @click="runSuggestionSyncSequence"
      >
        run suggestion sync sequence
      </button>
    </section>

    <output data-testid="submit-count">{{ submitCount }}</output>
    <output data-testid="last-submit">{{ lastSubmit }}</output>
    <output data-testid="editor-text">{{ cleanText(modelValue) }}</output>
    <output data-testid="raw-editor-text">{{ modelValue }}</output>
    <output data-testid="selection">
      {{ revision }}:{{ getEditor()?.state.selection.from ?? '' }}:{{ getEditor()?.state.selection.to ?? '' }}
    </output>
    <output data-testid="selection-state">{{ getSelectionState() }}</output>
    <output data-testid="selection-block-index">{{ getSelectionBlockIndex() }}</output>
    <output data-testid="node-summary">
      {{ JSON.stringify(getEditor()?.getJSON?.() ?? null) }}
    </output>
    <output data-testid="block-texts">{{ JSON.stringify(getBlockTexts()) }}</output>
    <output data-testid="suggestion-sync-steps">{{ JSON.stringify(suggestionSyncSteps) }}</output>

    <Teleport :to="shadowSenderTarget" :disabled="props.senderLocation !== 'shadow'">
      <Sender
        ref="senderRef"
        data-testid="sender-root"
        v-model="modelValue"
        :extensions="extensions"
        @update:model-value="handleUpdate"
        @submit="handleSubmit"
      />
    </Teleport>
  </main>
</template>

<style scoped>
.fixture-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>

<script setup lang="ts">
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { BubbleMessage } from '../../../components/src/bubble/index.type'
import FallbackContentRenderer from './FallbackContentRenderer.vue'

const props = defineProps<{
  malformed?: boolean
  malformedOptions?: boolean
  emptyStepId?: boolean
  duplicateStepIds?: boolean
  emptyContentId?: boolean
  duplicateContentIds?: boolean
  emptySteps?: boolean
}>()
const invalidContent: BubbleMessage['content'] = [{ type: 'ask_user' }]
const malformedContent: BubbleMessage['content'] = [{ type: 'ask_user', id: 'malformed-ask-user', steps: [null] }]
const malformedOptionsContent: BubbleMessage['content'] = [
  {
    type: 'ask_user',
    id: 'malformed-options-ask-user',
    steps: [{ id: 'framework', title: '框架', type: 'single', options: {} }],
  },
]
const emptyStepIdContent: BubbleMessage['content'] = [
  { type: 'ask_user', id: 'empty-step-id-ask-user', steps: [{ id: '', title: '项目名称', type: 'text' }] },
]
const duplicateStepIdsContent: BubbleMessage['content'] = [
  {
    type: 'ask_user',
    id: 'duplicate-step-id-ask-user',
    steps: [
      { id: 'duplicate', title: '项目名称', type: 'text' },
      { id: 'duplicate', title: '项目描述', type: 'text' },
    ],
  },
]
const emptyContentIdContent: BubbleMessage['content'] = [
  { type: 'ask_user', id: '', steps: [{ id: 'project-name', title: '项目名称', type: 'text' }] },
]
const duplicateContentIdsContent: BubbleMessage['content'] = [
  { type: 'ask_user', id: 'duplicate-ask-user', steps: [{ id: 'first-step', title: '第一个问题', type: 'text' }] },
  { type: 'ask_user', id: 'duplicate-ask-user', steps: [{ id: 'second-step', title: '第二个问题', type: 'text' }] },
]
const emptyStepsContent: BubbleMessage['content'] = [{ type: 'ask_user', id: 'empty-steps-ask-user', steps: [] }]
</script>

<template>
  <Bubble
    role="assistant"
    :content="
      props.malformed
        ? malformedContent
        : props.malformedOptions
          ? malformedOptionsContent
          : props.emptyStepId
            ? emptyStepIdContent
            : props.duplicateStepIds
              ? duplicateStepIdsContent
              : props.emptyContentId
                ? emptyContentIdContent
                : props.duplicateContentIds
                  ? duplicateContentIdsContent
                  : props.emptySteps
                    ? emptyStepsContent
                    : invalidContent
    "
    :fallback-content-renderer="FallbackContentRenderer"
  />
</template>

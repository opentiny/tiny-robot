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
const malformedContent: BubbleMessage['content'] = [{ type: 'ask_user', id: 'malformed-ask-user', questions: [null] }]
const malformedOptionsContent: BubbleMessage['content'] = [
  {
    type: 'ask_user',
    id: 'malformed-options-ask-user',
    questions: [{ id: 'framework', question: '框架', options: {} }],
  },
]
const emptyStepIdContent: BubbleMessage['content'] = [
  { type: 'ask_user', id: 'empty-step-id-ask-user', questions: [{ id: '', question: '项目名称' }] },
]
const duplicateStepIdsContent: BubbleMessage['content'] = [
  {
    type: 'ask_user',
    id: 'duplicate-step-id-ask-user',
    questions: [
      { id: 'duplicate', question: '项目名称' },
      { id: 'duplicate', question: '项目描述' },
    ],
  },
]
const emptyContentIdContent: BubbleMessage['content'] = [
  { type: 'ask_user', id: '', questions: [{ id: 'project-name', question: '项目名称' }] },
]
const duplicateContentIdsContent: BubbleMessage['content'] = [
  { type: 'ask_user', id: 'duplicate-ask-user', questions: [{ id: 'first-step', question: '第一个问题' }] },
  { type: 'ask_user', id: 'duplicate-ask-user', questions: [{ id: 'second-step', question: '第二个问题' }] },
]
const emptyStepsContent: BubbleMessage['content'] = [{ type: 'ask_user', id: 'empty-steps-ask-user', questions: [] }]
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

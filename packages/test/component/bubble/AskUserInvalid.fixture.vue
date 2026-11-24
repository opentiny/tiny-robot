<script setup lang="ts">
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { BubbleMessage } from '../../../components/src/bubble/index.type'
import FallbackContentRenderer from './FallbackContentRenderer.vue'

const props = defineProps<{
  malformed?: boolean
  malformedOptions?: boolean
  duplicateOptionLabels?: boolean
  unsafeQuestionId?: boolean
  emptyStepId?: boolean
  duplicateStepIds?: boolean
  emptyContentId?: boolean
  duplicateContentIds?: boolean
  generatedIdCollision?: boolean
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
const duplicateOptionLabelsContent: BubbleMessage['content'] = [
  {
    type: 'ask_user',
    id: 'duplicate-option-labels-ask-user',
    questions: [
      {
        id: 'framework',
        question: '框架',
        options: [{ label: 'Vue' }, { label: ' Vue ' }],
        multiSelect: false,
        allowCustom: false,
      },
    ],
  },
]
const unsafeQuestionIdContent: BubbleMessage['content'] = [
  {
    type: 'ask_user',
    id: 'unsafe-question-id-ask-user',
    questions: [{ id: '__proto__', question: '项目名称' }],
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
const generatedIdCollisionContent: BubbleMessage['content'] = [
  { type: 'ask_user', questions: [{ id: 'generated-step', question: '自动生成 ID' }] },
  {
    type: 'ask_user',
    id: 'ask-user-message-0',
    questions: [{ id: 'explicit-step', question: '显式 ID' }],
  },
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
          : props.duplicateOptionLabels
            ? duplicateOptionLabelsContent
            : props.unsafeQuestionId
              ? unsafeQuestionIdContent
              : props.emptyStepId
                ? emptyStepIdContent
                : props.duplicateStepIds
                  ? duplicateStepIdsContent
                  : props.emptyContentId
                    ? emptyContentIdContent
                    : props.duplicateContentIds
                      ? duplicateContentIdsContent
                      : props.generatedIdCollision
                        ? generatedIdCollisionContent
                        : props.emptySteps
                          ? emptyStepsContent
                          : invalidContent
    "
    :fallback-content-renderer="FallbackContentRenderer"
  />
</template>

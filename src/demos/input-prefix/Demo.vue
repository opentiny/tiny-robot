<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const tasks = [
  { id: 'reply', entry: '起草客户回复', label: '客户回复' },
  { id: 'handoff', entry: '生成交接摘要', label: '交接摘要' },
] as const
type Task = (typeof tasks)[number]

const task = ref<Task | null>(null)
const draft = ref('')
const submitted = ref<{ task: Task; text: string } | null>(null)

function submit(text: string) {
  if (!task.value) return

  submitted.value = { task: task.value, text }
  draft.value = ''
}
</script>

<template>
  <section class="feature-scene task-composer-scene">
    <div class="task-composer">
      <h2>客服工作台</h2>
      <div class="task-entries">
        <button
          v-for="entry in tasks"
          :key="entry.id"
          type="button"
          class="utility-button"
          :aria-pressed="task?.id === entry.id"
          @click="task = entry"
        >
          {{ entry.entry }}
        </button>
      </div>
      <TrSender
        v-model="draft"
        mode="multiple"
        submit-type="ctrlEnter"
        :placeholder="task ? '输入客户反馈和处理进展…' : '选择一项任务后输入…'"
        :disabled="!task"
        @submit="submit"
      >
        <template v-if="task" #input-prefix>
          <span class="input-prefix">{{ task.label }}</span>
        </template>
      </TrSender>
      <div v-if="submitted" class="task-receipt" role="status">
        <div>
          已提交 · <strong>{{ submitted.task.label }}</strong>
        </div>
        <div v-if="!draft" class="task-receipt-body">
          <p v-for="(paragraph, index) in submitted.text.split('\n\n')" :key="index">{{ paragraph }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.task-composer {
  max-width: 722px;
  margin: 0 auto;
}
.task-composer h2 {
  margin: 0 0 12px;
  font-size: 19px;
}
.task-entries {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.task-entries [aria-pressed='true'] {
  color: #195abd;
  background: #e6efff;
  border-color: #bdd4fc;
}
.task-receipt {
  margin-top: 17px;
  color: #52647d;
  font-size: 15px;
  line-height: 1.5;
}
.task-receipt strong {
  color: #243855;
}
.task-receipt-body {
  margin: 5px 0 0;
}
.task-receipt-body p {
  margin: 0;
  white-space: pre-line;
}
</style>

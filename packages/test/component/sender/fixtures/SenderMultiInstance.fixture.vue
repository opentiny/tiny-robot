<script setup lang="ts">
import { ref } from 'vue'
import Sender from '../../../../components/src/sender/index.vue'
import Attachments from '../../../../components/src/attachments/index.vue'
import { Template } from '../../../../components/src/sender/extensions'
import type { Attachment } from '../../../../components/src/attachments/index.type'
import type { SenderSubmitExtra, StructuredData, TemplateItem } from '../../../../components/src/sender/index.type'

interface Props {
  scenario: 'content' | 'events' | 'select' | 'extension' | 'clear' | 'external' | 'unmount'
}

const props = defineProps<Props>()
const valueA = ref('')
const valueB = ref('')
const submitA = ref(0)
const submitB = ref(0)
const lastSubmitA = ref('[]')
const lastSubmitB = ref('[]')
const clearA = ref(0)
const clearB = ref(0)
const showB = ref(true)

const selectOptions = [
  { label: '第一项', value: 'first' },
  { label: '第二项', value: 'second' },
]

const twoSelectItems = ref<TemplateItem[]>([
  { type: 'select', content: '', placeholder: '选择 A', options: selectOptions },
  { type: 'text', content: ' / ' },
  { type: 'select', content: '', placeholder: '选择 B', options: selectOptions },
])
const oneSelectItems = ref<TemplateItem[]>([
  { type: 'text', content: 'A ' },
  { type: 'select', content: '', placeholder: '选择', options: selectOptions },
])
const attachmentsA = ref<Attachment[]>([
  { id: 'a-file', name: 'a.txt', url: 'https://example.com/a.txt', status: 'success' },
])
const attachmentsB = ref<Attachment[]>([
  { id: 'b-file', name: 'b.txt', url: 'https://example.com/b.txt', status: 'success' },
])
const templateA = Template.configure({ items: twoSelectItems })
const templateB = Template.configure({ items: oneSelectItems })

type SubmitArgs = [string, StructuredData?, SenderSubmitExtra?]

const recordSubmit = (target: 'a' | 'b', args: SubmitArgs) => {
  if (target === 'a') {
    submitA.value += 1
    lastSubmitA.value = JSON.stringify(args)
  } else {
    submitB.value += 1
    lastSubmitB.value = JSON.stringify(args)
  }
}

const handleSubmitA = (...args: SubmitArgs) => recordSubmit('a', args)
const handleSubmitB = (...args: SubmitArgs) => recordSubmit('b', args)
</script>

<template>
  <main>
    <button v-if="props.scenario === 'unmount'" data-testid="unmount-second" type="button" @click="showB = false">
      unmount B
    </button>

    <section v-if="props.scenario === 'select'" data-testid="same-sender">
      <Sender data-testid="sender-a" v-model="valueA" :extensions="[templateA]" />
    </section>

    <section v-else data-testid="sender-pair">
      <div data-testid="sender-a-container">
        <Sender
          data-testid="sender-a"
          v-model="valueA"
          :extensions="props.scenario === 'extension' || props.scenario === 'unmount' ? [templateA] : []"
          :clearable="props.scenario === 'clear'"
          @submit="handleSubmitA"
          @clear="clearA++"
        >
          <template v-if="props.scenario === 'external'" #header>
            <Attachments v-model:items="attachmentsA" variant="card" />
          </template>
        </Sender>
      </div>
      <div v-if="showB" data-testid="sender-b-container">
        <Sender
          data-testid="sender-b"
          v-model="valueB"
          :extensions="props.scenario === 'extension' || props.scenario === 'unmount' ? [templateB] : []"
          :clearable="props.scenario === 'clear'"
          @submit="handleSubmitB"
          @clear="clearB++"
        >
          <template v-if="props.scenario === 'external'" #header>
            <Attachments v-model:items="attachmentsB" variant="card" />
          </template>
        </Sender>
      </div>
    </section>

    <output data-testid="value-a">{{ valueA }}</output>
    <output data-testid="value-b">{{ valueB }}</output>
    <output data-testid="submit-a">{{ submitA }}</output>
    <output data-testid="submit-b">{{ submitB }}</output>
    <output data-testid="last-submit-a">{{ lastSubmitA }}</output>
    <output data-testid="last-submit-b">{{ lastSubmitB }}</output>
    <output data-testid="clear-a">{{ clearA }}</output>
    <output data-testid="clear-b">{{ clearB }}</output>
  </main>
</template>

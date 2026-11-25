<script setup lang="ts">
import { defineComponent, h, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import Sender from '../../../../components/src/sender/index.vue'
import Attachments from '../../../../components/src/attachments/index.vue'
import { useSenderContentRegistration } from '../../../../components/src/shared/composables'
import type { Attachment } from '../../../../components/src/attachments/index.type'
import type { SenderSubmitExtra, StructuredData } from '../../../../components/src/sender/index.type'

type PayloadMode = 'empty-string' | 'string' | 'array-empty' | 'array' | 'object-empty' | 'object' | 'zero' | 'number'

const resolvePayload = (mode: PayloadMode): unknown => {
  switch (mode) {
    case 'empty-string':
      return ''
    case 'array-empty':
      return []
    case 'array':
      return ['item']
    case 'object-empty':
      return {}
    case 'object':
      return { id: 'object' }
    case 'zero':
      return 0
    case 'number':
      return 42
    case 'string':
    default:
      return 'registered'
  }
}

const RegistrationConsumer = defineComponent({
  props: {
    id: { type: String, required: true },
    source: { type: String, required: true },
    mode: { type: String as PropType<PayloadMode>, required: true },
  },
  setup(props) {
    const register = useSenderContentRegistration()
    const payload = ref(resolvePayload(props.mode))
    let unregister = register?.(props.source, payload)

    const registerSource = (source: string) => {
      unregister?.()
      unregister = register?.(source, payload)
    }

    watch(
      () => props.mode,
      (mode) => {
        payload.value = resolvePayload(mode)
      },
    )
    watch(() => props.source, registerSource)

    const unregisterNow = () => {
      unregister?.()
      unregister = undefined
    }

    onBeforeUnmount(() => unregisterNow())

    return () =>
      h('div', { 'data-testid': `registration-${props.id}` }, [
        h('button', { 'data-testid': `unregister-${props.id}`, type: 'button', onClick: unregisterNow }, 'unregister'),
      ])
  },
})

const value = ref('')
const hasExternalContent = ref(false)
const registrationA = ref(true)
const registrationB = ref(false)
const sourceA = ref('source-a')
const sourceB = ref('source-b')
const modeA = ref<PayloadMode>('string')
const modeB = ref<PayloadMode>('string')
const attachmentsMounted = ref(true)
const attachmentItems = ref<Attachment[]>([
  {
    id: 'attachment-1',
    name: 'note.txt',
    url: 'https://example.com/note.txt',
    status: 'success',
  },
])
const submitCount = ref(0)
const lastSubmit = ref('[]')

const handleSubmit = (...args: [string, StructuredData?, SenderSubmitExtra?]) => {
  submitCount.value += 1
  lastSubmit.value = JSON.stringify(args.map((valueToSerialize) => valueToSerialize ?? null))
}

const removeAttachment = () => {
  attachmentItems.value = []
}
</script>

<template>
  <main>
    <div class="fixture-controls">
      <button data-testid="toggle-has-external" type="button" @click="hasExternalContent = !hasExternalContent">
        external
      </button>
      <button data-testid="toggle-registration-a" type="button" @click="registrationA = !registrationA">
        registration A
      </button>
      <button data-testid="toggle-registration-b" type="button" @click="registrationB = !registrationB">
        registration B
      </button>
      <button data-testid="set-source-b-same" type="button" @click="sourceB = sourceA">same source</button>
      <button data-testid="set-mode-a-empty" type="button" @click="modeA = 'empty-string'">A empty</button>
      <button data-testid="set-mode-a-array-empty" type="button" @click="modeA = 'array-empty'">A empty array</button>
      <button data-testid="set-mode-a-array" type="button" @click="modeA = 'array'">A array</button>
      <button data-testid="set-mode-a-object-empty" type="button" @click="modeA = 'object-empty'">
        A empty object
      </button>
      <button data-testid="set-mode-a-object" type="button" @click="modeA = 'object'">A object</button>
      <button data-testid="set-mode-a-zero" type="button" @click="modeA = 'zero'">A zero</button>
      <button data-testid="set-mode-b-number" type="button" @click="modeB = 'number'">B number</button>
      <button data-testid="toggle-attachments" type="button" @click="attachmentsMounted = !attachmentsMounted">
        attachments
      </button>
      <button data-testid="clear-attachments" type="button" @click="removeAttachment">clear attachments</button>
    </div>
    <output data-testid="submit-count">{{ submitCount }}</output>
    <output data-testid="last-submit">{{ lastSubmit }}</output>

    <Sender
      data-testid="sender-root"
      v-model="value"
      mode="multiple"
      clearable
      :has-external-content="hasExternalContent"
      @submit="handleSubmit"
    >
      <template #header>
        <Attachments v-if="attachmentsMounted" v-model:items="attachmentItems" variant="card" />
      </template>
      <template #footer>
        <RegistrationConsumer v-if="registrationA" id="a" :source="sourceA" :mode="modeA" />
        <RegistrationConsumer v-if="registrationB" id="b" :source="sourceB" :mode="modeB" />
      </template>
    </Sender>
  </main>
</template>

<style scoped>
.fixture-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>

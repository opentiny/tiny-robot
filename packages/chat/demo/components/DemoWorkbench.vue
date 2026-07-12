<script setup lang="ts">
import { computed } from 'vue'
import { TrChat, type ChatRuntime, type ChatUi } from '../../src'
import type { DemoPathInfo } from '../demoPaths'
import { demoScenarioOptions, type DemoEvent, type DemoScenario } from '../scenario'

const props = defineProps<{
  info: DemoPathInfo
  runtime: ChatRuntime
  ui: ChatUi
  isMobile: boolean
  scenario: DemoScenario
  events: readonly DemoEvent[]
  clearEvents: () => void
}>()

const emit = defineEmits<{
  'update:scenario': [value: DemoScenario]
}>()

const conversations = computed(() => props.runtime.conversations?.items.value ?? [])
const currentId = computed(() => props.runtime.conversations?.currentId.value ?? null)
const messages = computed(() => props.runtime.messages.items.value)
const requestState = computed(() => props.runtime.messages.requestState.value)
const processingState = computed(() => props.runtime.messages.processingState.value ?? '—')
const lastError = computed(() => {
  const error = props.runtime.messages.lastError?.value

  if (error instanceof Error) {
    return error.message
  }

  return error ? String(error) : '—'
})
const activeScenario = computed(() => demoScenarioOptions.find((item) => item.value === props.scenario))

function updateScenario(event: Event) {
  emit('update:scenario', (event.target as HTMLSelectElement).value as DemoScenario)
}

function formatDetail(detail: unknown) {
  if (detail === undefined) {
    return ''
  }

  if (detail instanceof Error) {
    return detail.message
  }

  try {
    return JSON.stringify(detail)
  } catch {
    return String(detail)
  }
}
</script>

<template>
  <section class="demo-workbench">
    <header class="demo-workbench__toolbar">
      <div class="demo-workbench__summary">
        <div class="demo-workbench__eyebrow">Path {{ info.index }} · {{ info.ownership }}</div>
        <h1 class="demo-workbench__title">{{ info.title }}</h1>
        <p class="demo-workbench__description">{{ info.description }}</p>
        <code class="demo-workbench__api">{{ info.api }}</code>
      </div>

      <label class="demo-workbench__scenario">
        <span class="demo-workbench__scenario-label">Response scenario</span>
        <select :value="scenario" :disabled="runtime.sender.loading.value" @change="updateScenario">
          <option v-for="option in demoScenarioOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <span class="demo-workbench__scenario-help">{{ activeScenario?.description }}</span>
      </label>
    </header>

    <div class="demo-workbench__body">
      <div class="demo-workbench__chat">
        <TrChat :key="isMobile ? 'mobile' : 'desktop'" :runtime="runtime" :ui="ui" />
      </div>

      <aside class="demo-inspector" aria-label="Runtime Inspector">
        <div class="demo-inspector__header">
          <div>
            <div class="demo-inspector__eyebrow">Deterministic Mock</div>
            <h2 class="demo-inspector__title">Runtime Inspector</h2>
          </div>
          <button type="button" class="demo-inspector__clear" @click="clearEvents">清空日志</button>
        </div>

        <dl class="demo-inspector__state">
          <div>
            <dt>Runtime path</dt>
            <dd>{{ info.id }}</dd>
          </div>
          <div>
            <dt>Scenario</dt>
            <dd>{{ scenario }}</dd>
          </div>
          <div>
            <dt>Viewport</dt>
            <dd>{{ isMobile ? 'mobile / drawer' : 'desktop / dock' }}</dd>
          </div>
          <div>
            <dt>Request</dt>
            <dd>{{ requestState }}</dd>
          </div>
          <div>
            <dt>Processing</dt>
            <dd>{{ processingState }}</dd>
          </div>
          <div>
            <dt>Loading</dt>
            <dd>{{ runtime.sender.loading.value }}</dd>
          </div>
          <div>
            <dt>Disabled</dt>
            <dd>{{ runtime.sender.disabled.value }}</dd>
          </div>
          <div>
            <dt>Conversation</dt>
            <dd :title="currentId ?? undefined">{{ currentId ?? '—' }}</dd>
          </div>
          <div>
            <dt>Conversations</dt>
            <dd>{{ conversations.length }}</dd>
          </div>
          <div>
            <dt>Messages</dt>
            <dd>{{ messages.length }}</dd>
          </div>
          <div class="demo-inspector__error">
            <dt>Last error</dt>
            <dd>{{ lastError }}</dd>
          </div>
        </dl>

        <div class="demo-inspector__events">
          <div v-if="events.length === 0" class="demo-inspector__empty">执行操作后，这里会记录 action 与请求状态。</div>
          <ol v-else>
            <li v-for="event in [...events].reverse()" :key="event.id" :data-event-type="event.type">
              <div class="demo-inspector__event-heading">
                <span>{{ event.label }}</span>
                <time>{{ event.time }}</time>
              </div>
              <code v-if="event.detail !== undefined">{{ formatDetail(event.detail) }}</code>
            </li>
          </ol>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.demo-workbench {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.demo-workbench__toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 18px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.demo-workbench__summary {
  min-width: 0;
}

.demo-workbench__eyebrow,
.demo-inspector__eyebrow {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.demo-workbench__title,
.demo-inspector__title {
  margin: 3px 0 0;
  color: #0f172a;
}

.demo-workbench__title {
  font-size: 20px;
}

.demo-workbench__description {
  margin: 4px 0 6px;
  color: #475569;
  font-size: 13px;
}

.demo-workbench__api {
  color: #4f46e5;
  font-size: 12px;
}

.demo-workbench__scenario {
  display: grid;
  flex: 0 0 220px;
  gap: 4px;
}

.demo-workbench__scenario-label {
  color: #334155;
  font-size: 12px;
  font-weight: 600;
}

.demo-workbench__scenario select {
  width: 100%;
  height: 34px;
  border: 1px solid #cbd5e1;
  padding: 0 10px;
  border-radius: 7px;
  color: #0f172a;
  background: #fff;
}

.demo-workbench__scenario-help {
  color: #64748b;
  font-size: 11px;
}

.demo-workbench__body {
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1fr) 320px;
  min-width: 0;
  min-height: 0;
}

.demo-workbench__chat {
  min-width: 0;
  min-height: 0;
  padding: 8px;
  background: #f1f5f9;
}

.demo-inspector {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  border-left: 1px solid #e5e7eb;
  background: #0f172a;
  color: #e2e8f0;
}

.demo-inspector__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #273449;
}

.demo-inspector__eyebrow {
  color: #94a3b8;
}

.demo-inspector__title {
  color: #f8fafc;
  font-size: 16px;
}

.demo-inspector__clear {
  border: 1px solid #475569;
  padding: 5px 8px;
  border-radius: 6px;
  color: #cbd5e1;
  background: transparent;
  cursor: pointer;
}

.demo-inspector__state {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  background: #273449;
}

.demo-inspector__state > div {
  min-width: 0;
  padding: 9px 12px;
  background: #172033;
}

.demo-inspector__state dt {
  color: #94a3b8;
  font-size: 10px;
  text-transform: uppercase;
}

.demo-inspector__state dd {
  overflow: hidden;
  margin: 3px 0 0;
  color: #f8fafc;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demo-inspector__error {
  grid-column: 1 / -1;
}

.demo-inspector__events {
  min-height: 0;
  flex: 1;
  overflow: auto;
}

.demo-inspector__events ol {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 12px;
  list-style: none;
}

.demo-inspector__events li {
  border-left: 3px solid #64748b;
  padding: 8px 10px;
  border-radius: 4px;
  background: #172033;
}

.demo-inspector__events li[data-event-type='action'] {
  border-left-color: #818cf8;
}

.demo-inspector__events li[data-event-type='response'] {
  border-left-color: #34d399;
}

.demo-inspector__events li[data-event-type='error'] {
  border-left-color: #fb7185;
}

.demo-inspector__events li[data-event-type='abort'] {
  border-left-color: #fbbf24;
}

.demo-inspector__event-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}

.demo-inspector__event-heading time {
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 10px;
}

.demo-inspector__events code {
  display: block;
  overflow-wrap: anywhere;
  margin-top: 5px;
  color: #a5b4fc;
  font-size: 10px;
  white-space: pre-wrap;
}

.demo-inspector__empty {
  padding: 16px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 1100px) {
  .demo-workbench__body {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) 210px;
  }

  .demo-inspector {
    border-top: 1px solid #e5e7eb;
    border-left: 0;
  }

  .demo-inspector__state {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .demo-inspector__error {
    grid-column: auto;
  }

  .demo-inspector__events {
    display: none;
  }
}

@media (max-width: 720px) {
  .demo-workbench__toolbar {
    display: grid;
    gap: 10px;
    padding: 10px 12px;
  }

  .demo-workbench__description {
    display: none;
  }

  .demo-workbench__scenario {
    grid-template-columns: 110px minmax(0, 1fr);
    align-items: center;
  }

  .demo-workbench__scenario-help {
    display: none;
  }

  .demo-inspector__header,
  .demo-inspector__state {
    display: none;
  }

  .demo-workbench__body {
    grid-template-rows: minmax(0, 1fr);
  }

  .demo-inspector {
    display: none;
  }
}
</style>

<template>
  <section class="qa-input-demo">
    <fieldset class="qa-input-demo__settings">
      <legend>实例配置</legend>
      <div class="qa-input-demo__controls">
        <label>最大显示行数 <input v-model.number="maxRows" type="number" min="1" max="6" @change="configure" /></label>
        <label><input v-model="limited" type="checkbox" @change="configure" />限制为 50 个字符</label>
        <label><input v-model="autoFill" type="checkbox" @change="configure" />预填选中文字</label>
      </div>
    </fieldset>
    <section class="qa-input-demo__group">
      <h4>划词体验</h4>
      <p id="qa-input-demo-selection" class="qa-input-demo__selection">{{ selectionText }}</p>
      <p class="qa-input-demo__hint">
        勾选“限制为 50 个字符”和“预填选中文字”，再从左向右选中整段文字，可观察超限计数和发送禁用效果。
      </p>
    </section>
    <section class="qa-input-demo__group">
      <h4>命令式调用</h4>
      <div class="qa-input-demo__controls">
        <button type="button" @click="open($event)">按实例配置打开</button>
        <button type="button" @click="open($event, true)">本次预填</button>
        <button type="button" @click="open($event, false)">本次留空</button>
      </div>
    </section>
    <aside v-if="request" class="qa-input-demo__result" aria-live="polite">
      <p>已提交：{{ request.query }}</p>
      <p>保留的上下文：{{ request.context.text }}</p>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type { AIRequest, QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const maxRows = ref(2)
const limited = ref(false)
const autoFill = ref(false)
const exampleText = '查看系统盘使用率'
const selectionText =
  '云服务器运行一段时间后，系统盘使用率持续升高。请结合日志增长、临时文件、应用缓存和磁盘分区情况，分析空间占用的主要原因，并给出清理顺序、容量扩展建议以及操作前需要确认的事项。'
const request = shallowRef<AIRequest>()
let assist: QuickAssistInstance | undefined

function configure() {
  maxRows.value = Math.max(1, Math.min(6, Math.trunc(Number(maxRows.value)) || 2))
  assist?.updateOptions({
    input: { maxRows: maxRows.value, maxLength: limited.value ? 50 : null, autoFill: autoFill.value },
  })
}

function open(event: MouseEvent, prefill?: boolean) {
  request.value = undefined
  assist?.activate({
    text: exampleText,
    anchor: event.currentTarget as HTMLButtonElement,
    open: 'popover',
    ...(prefill === undefined ? {} : { autoFill: prefill }),
  })
}

onMounted(() => {
  assist = createQuickAssist({
    include: ['#qa-input-demo-selection'],
    input: { maxRows: maxRows.value, maxLength: limited.value ? 50 : null, autoFill: autoFill.value },
    adapter: {
      submit: (value) => {
        request.value = value
      },
    },
  })
})

onBeforeUnmount(() => assist?.destroy())
</script>

<style scoped>
.qa-input-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  display: grid;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.qa-input-demo__settings {
  min-width: 0;
  margin: 0;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.qa-input-demo__settings legend {
  padding: 0 6px;
  font-size: 14px;
  font-weight: 600;
}
.qa-input-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.qa-input-demo__settings label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.qa-input-demo__settings input[type='number'] {
  width: 56px;
}
.qa-input-demo__group h4 {
  margin: 0 0 8px;
  font-size: 14px;
}
.qa-input-demo__selection {
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.qa-input-demo__hint {
  margin: 8px 0 0;
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
  line-height: 1.6;
}
.qa-input-demo button,
.qa-input-demo input[type='number'] {
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}
.qa-input-demo__result {
  overflow-wrap: anywhere;
}
</style>

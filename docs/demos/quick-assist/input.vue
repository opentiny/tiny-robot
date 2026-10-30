<template>
  <section class="qa-input-demo">
    <div class="qa-input-demo__settings">
      <label>最大显示行数 <input v-model.number="maxRows" type="number" min="1" max="6" @change="configure" /></label>
      <label><input v-model="limited" type="checkbox" @change="configure" />限制为 50 个字符</label>
      <label><input v-model="autoFill" type="checkbox" @change="configure" />默认填入上下文</label>
      <label>
        本次预填
        <select v-model="activationAutoFill" @change="close">
          <option value="inherit">跟随默认设置</option>
          <option value="enabled">开启</option>
          <option value="disabled">关闭</option>
        </select>
      </label>
    </div>
    <p>打开输入框后可输入或粘贴长文本，观察展开、滚动、删除收缩及字数限制。</p>
    <button type="button" @click="open">询问“查看系统盘使用率”</button>
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
const autoFill = ref(true)
const activationAutoFill = ref('inherit')
const request = shallowRef<AIRequest>()
let assist: QuickAssistInstance | undefined

function configure() {
  maxRows.value = Math.max(1, Math.min(6, Math.trunc(Number(maxRows.value)) || 2))
  assist?.updateOptions({
    input: { maxRows: maxRows.value, maxLength: limited.value ? 50 : undefined, autoFill: autoFill.value },
  })
}

function close() {
  assist?.close()
}

function open(event: MouseEvent) {
  request.value = undefined
  assist?.activate({
    text: '查看系统盘使用率',
    anchor: event.currentTarget as HTMLButtonElement,
    open: 'popover',
    autoFill: activationAutoFill.value === 'inherit' ? undefined : activationAutoFill.value === 'enabled',
  })
}

onMounted(() => {
  assist = createQuickAssist({
    include: ['.qa-input-demo'],
    adapter: {
      submit: (value) => {
        request.value = value
      },
    },
  })
  configure()
})

onBeforeUnmount(() => assist?.destroy())
</script>

<style scoped>
.qa-input-demo {
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.qa-input-demo__settings {
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
.qa-input-demo button,
.qa-input-demo select,
.qa-input-demo input[type='number'] {
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}
.qa-input-demo__result {
  margin-top: 12px;
  overflow-wrap: anywhere;
}
</style>

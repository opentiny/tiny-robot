<script setup lang="ts">
import { ref, unref } from 'vue'
import { EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import Sender from '../../../../components/src/sender/index.vue'
import type { InputMode } from '../../../../components/src/sender/index.type'

interface Props {
  mode?: InputMode
}

const props = withDefaults(defineProps<Props>(), { mode: 'single' })
const value = ref('')
const actionLog = ref('')

const record = (valueToRecord: string) => {
  actionLog.value = valueToRecord
}
</script>

<template>
  <main>
    <output data-testid="action-log">{{ actionLog }}</output>
    <Sender data-testid="sender-root" v-model="value" :mode="props.mode">
      <template #header>
        <span data-testid="header-slot">header</span>
      </template>
      <template #prefix>
        <span data-testid="prefix-slot">prefix</span>
      </template>
      <template #content="{ editor }">
        <div class="content-slot" data-testid="content-slot">
          <TiptapEditorContent v-if="unref(editor)" :editor="unref(editor)" />
        </div>
      </template>
      <template #actions-inline="{ insert, append, replace, focus, blur, disabled, loading, hasContent }">
        <div data-testid="actions-inline-slot">
          <button data-testid="insert-action" type="button" @click="insert('inserted')">insert</button>
          <button data-testid="append-action" type="button" @click="append('appended')">append</button>
          <button data-testid="replace-action" type="button" @click="replace('replaced')">replace</button>
          <button data-testid="focus-action" type="button" @click="focus">focus</button>
          <button data-testid="blur-action" type="button" @click="blur">blur</button>
          <output data-testid="scope-state"
            >{{ String(disabled) }}|{{ String(loading) }}|{{ String(hasContent) }}</output
          >
        </div>
      </template>
      <template #footer="{ insert, append, replace, focus, blur, disabled, loading, hasContent }">
        <div data-testid="footer-slot">
          <button data-testid="footer-insert" type="button" @click="insert('footer-insert')">footer insert</button>
          <button data-testid="footer-append" type="button" @click="append('footer-append')">footer append</button>
          <button data-testid="footer-replace" type="button" @click="replace('footer-replace')">footer replace</button>
          <button data-testid="footer-focus" type="button" @click="focus">footer focus</button>
          <button data-testid="footer-blur" type="button" @click="blur">footer blur</button>
          <output data-testid="footer-scope-state"
            >{{ String(disabled) }}|{{ String(loading) }}|{{ String(hasContent) }}</output
          >
        </div>
      </template>
      <template #footer-right="{ hasContent }">
        <button data-testid="footer-right-slot" type="button" @click="record(String(hasContent))">footer right</button>
      </template>
    </Sender>
  </main>
</template>

<style scoped>
.content-slot {
  display: flex;
  flex: 1;
  min-width: 0;
}

.content-slot :deep(.tiptap) {
  flex: 1;
  min-width: 0;
}

.content-slot > :deep(div) {
  flex: 1;
  min-width: 0;
}

.content-slot :deep(.ProseMirror) {
  flex: 1;
  min-width: 0;
  min-height: 26px;
  white-space: pre-wrap;
}
</style>

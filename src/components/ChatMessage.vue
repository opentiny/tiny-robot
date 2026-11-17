<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { BubbleMessage } from "@opentiny/tiny-robot";
import type { Message } from "../services/chat/types.js";
import {
  useChatStore,
  editMessage,
  selectMessageVersion,
  retryUpload,
} from "../services/chat/store.js";
import { getVisibleMessages, buildMessageVersions } from "../services/chat/branches.js";
import { useSettings } from "../services/settings.js";
import { stopReadAloud } from "../services/speech/readAloud.js";
import { translate as t } from "../i18n/index.js";
import { notify, openSettings, editingMessageId } from "../ui.js";
import { copyText } from "../utils/clipboard.js";
import Reply from "./Reply.vue";
import MessageFile from "./MessageFile.vue";
import Icon from "./Icon.vue";

type Part = { type: string; original: Message; sessionId: string };
const props = defineProps<{ message: BubbleMessage<Part[]>; contentIndex: number }>();
const part = computed(() => props.message.content![props.contentIndex]);
const item = computed(() => part.value.original);
const chat = useChatStore.state;
const session = computed(() => chat.value.sessionCache[part.value.sessionId]);
const visible = computed(() => (session.value ? getVisibleMessages(session.value) : []));
const busy = computed(() => !!chat.value.streaming[part.value.sessionId]);
const version = computed(() =>
  session.value ? buildMessageVersions(session.value, new Map()).get(item.value.id) : undefined,
);
const editing = computed({
  get: () => editingMessageId.value === item.value.id,
  set: (value) => {
    if (value) editingMessageId.value = item.value.id;
    else if (editingMessageId.value === item.value.id) editingMessageId.value = null;
  },
});
const editText = ref(""),
  editor = ref<HTMLTextAreaElement>();
const canSend = computed(
  () =>
    !busy.value &&
    (!!editText.value.trim() || (item.value.role === "user" && !!item.value.files.length)),
);
watch(
  () => [part.value.sessionId, item.value.id],
  () => {
    editing.value = false;
  },
);
watch([editing, editText], async () => {
  await nextTick();
  const el = editing.value ? editor.value : undefined;
  if (el) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 202)}px`;
    el.focus();
  }
});
function sendEdit() {
  if (!canSend.value) return;
  if (!useSettings.state.value.apiKey) return openSettings("data");
  if (editMessage(part.value.sessionId, item.value.id, editText.value.trim())) {
    stopReadAloud();
    editing.value = false;
  }
}
function editKey(e: KeyboardEvent) {
  if (e.isComposing) return;
  if (e.key === "Escape") editing.value = false;
  else if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && innerWidth >= 768) {
    e.preventDefault();
    sendEdit();
  }
}
const failedUpload = computed(() => {
  const next = visible.value[visible.value.findIndex((m) => m.id === item.value.id) + 1];
  return next?.role === "assistant" && next.error?.kind === "upload" ? next : null;
});
function retry() {
  if (failedUpload.value) {
    stopReadAloud();
    retryUpload(part.value.sessionId, failedUpload.value.id);
  }
}
function switchVersion(direction: number) {
  if (version.value) {
    stopReadAloud();
    selectMessageVersion(part.value.sessionId, version.value.ids[version.value.index + direction]);
  }
}
</script>
<template>
  <article :class="['message', item.role]" :data-message-id="item.id">
    <template v-if="item.role === 'user'">
      <div class="message-files">
        <MessageFile
          v-for="file in item.files"
          :key="file.id"
          :file="file"
          :can-retry="!busy && !!failedUpload"
          @retry="retry"
        />
      </div>
      <form v-if="editing" class="message-editor" @submit.prevent="sendEdit">
        <textarea
          ref="editor"
          v-model="editText"
          rows="1"
          :disabled="busy"
          :aria-label="t('editMessage')"
          @keydown="editKey"
        />
        <div class="editor-actions">
          <button type="button" @click="editing = false">{{ t("cancel") }}</button
          ><button :disabled="!canSend">{{ t("send") }}</button>
        </div>
      </form>
      <div v-else-if="item.content" class="user-text">{{ item.content }}</div>
      <div class="message-actions">
        <button
          v-if="item.content"
          :aria-label="t('copy')"
          :title="t('copy')"
          @click="copyText(item.content).then((ok) => notify(t(ok ? 'copied' : 'copyFailed')))"
        >
          <Icon name="IconCopyOutline16" />
        </button>
        <button
          :disabled="busy"
          :aria-label="t('editMessage')"
          :title="t('editMessage')"
          @click="
            editing = true;
            editText = item.content;
          "
        >
          <Icon name="IconEditOutline16" />
        </button>
      </div>
    </template>
    <Reply
      v-else
      :message="item"
      :session-id="part.sessionId"
      :busy="busy"
      :is-last="item.id === visible.at(-1)?.id"
    />
    <div v-if="version && version.ids.length > 1" class="versions">
      <button
        :disabled="busy || version.index === 0"
        :aria-label="t('previousVersion')"
        @click="switchVersion(-1)"
      >
        ‹
      </button>
      <span>{{ version.index + 1 }} / {{ version.ids.length }}</span>
      <button
        :disabled="busy || version.index === version.ids.length - 1"
        :aria-label="t('nextVersion')"
        @click="switchVersion(1)"
      >
        ›
      </button>
    </div>
  </article>
</template>

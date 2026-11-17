<script setup lang="ts">
import { computed, ref } from "vue";
import type { AssistantMessage } from "../services/chat/types.js";
import { buildReplyView, getAreaTitle } from "../services/chat/view.js";
import { describeReply } from "../services/chat/describe.js";
import { getReplyText, canContinueReply } from "../services/chat/reply.js";
import { regenerateReply, continueReply } from "../services/chat/store.js";
import {
  toggleReadAloud,
  stopReadAloud,
  useReadAloud,
  describeReadAloudError,
} from "../services/speech/readAloud.js";
import { translate as t } from "../i18n/index.js";
import { notify, openSettings, sourcePanel } from "../ui.js";
import { copyText } from "../utils/clipboard.js";
import Markdown, { safeUrl } from "./Markdown.js";
import Icon from "./Icon.vue";
import ReplyArea from "./ReplyArea.vue";
import SiteIcons from "./SiteIcons.vue";
const props = defineProps<{
  message: AssistantMessage;
  sessionId: string;
  busy: boolean;
  isLast: boolean;
}>();
const streaming = computed(() => ["pending", "streaming"].includes(props.message.status));
const view = computed(() => buildReplyView(props.message, streaming.value));
const notice = computed(() => describeReply(props.message));

const reading = useReadAloud.state;
async function copy() {
  notify(
    t(
      (await copyText(getReplyText(props.message) || notice.value?.text || ""))
        ? "copied"
        : "copyFailed",
    ),
  );
}
</script>
<template>
  <div class="reply">
    <ReplyArea :message="message" :view="view" :streaming="streaming" />
    <Markdown
      v-if="view.answer && message.stopReason !== 'refusal'"
      :text="view.answer.markdown"
      :sources="view.sources"
    />
    <Markdown v-if="notice?.presentation === 'response'" :text="notice.text" />
    <p v-else-if="notice" class="error">
      {{ notice.text }}
      <button v-if="notice.action === 'apiKey'" @click="openSettings('data')">
        {{ t("changeApiKey") }}</button
      ><a
        v-if="notice.action === 'topUp'"
        href="https://platform.deepseek.com/top_up"
        target="_blank"
        rel="noopener"
        >{{ t("topUp") }}</a
      >
    </p>
    <p v-if="streaming && !view.answer && !view.steps.length" class="pending">● ● ●</p>
    <button
      v-if="!streaming && message.stopReason !== 'refusal' && view.searchResults.length"
      class="sources-button"
      @click="sourcePanel = view.searchResults"
    >
      <SiteIcons :sources="view.searchResults" />{{
        t(view.searchResults.length === 1 ? "messageSearchSummary" : "messageSearchSummaries", {
          count: view.searchResults.length,
        })
      }}
    </button>
    <div v-if="!streaming" class="message-actions">
      <button :title="t('copy')" :aria-label="t('copy')" @click="copy">
        <Icon name="IconCopyOutline16" /></button
      ><button
        v-if="isLast && canContinueReply(message)"
        :disabled="busy"
        @click="
          stopReadAloud();
          continueReply(sessionId, message.id);
        "
      >
        {{ t("continueGenerating") }}</button
      ><button
        :aria-label="t(reading.messageId === message.id ? 'ttsStop' : 'ttsPlay')"
        :title="t(reading.messageId === message.id ? 'ttsStop' : 'ttsPlay')"
        v-if="getReplyText(message)"
        @click="
          toggleReadAloud(message.id, getReplyText(message), (e) =>
            notify(describeReadAloudError(e)),
          )
        "
      >
        <Icon
          :name="reading.messageId === message.id ? 'IconStopFill16' : 'IconPlayMediaOutline16'"
        /></button
      ><button
        :disabled="busy || message.stopReason === 'refusal'"
        :aria-label="t('regenerate')"
        :title="t('regenerate')"
        @click="
          stopReadAloud();
          regenerateReply(sessionId, message.id);
        "
      >
        <Icon name="IconRefreshOutline16" />
      </button>
    </div>
  </div>
</template>

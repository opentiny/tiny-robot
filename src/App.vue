<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch, markRaw } from "vue";
import {
  TrChatUI,
  useChatRuntimeAdapter,
  type ChatUIOptions,
  type ChatHistoryActionPayload,
} from "@opentiny/tiny-robot-chat";
import { TrDragOverlay, vDropzone } from "@opentiny/tiny-robot";
import {
  useChatStore,
  runtime,
  initChat,
  bindChatPersistence,
  newChat,
  selectSession,
  renameSession,
  removeSession,
  retrySaveSessions,
  stopReply,
} from "./services/chat/store.js";
import { useSettings, setSiderCollapsed, setThinking, setSearch } from "./services/settings.js";
import { groupSessions } from "./services/chat/sessionGroups.js";
import { stopReadAloud } from "./services/speech/readAloud.js";
import { removeDraftAttachment, retryDraftAttachment } from "./services/chat/drafts.js";
import { onUploadNotice, ACCEPT, MAX_COUNT, MAX_SIZE_MB } from "./services/attachments.js";
import { translate as t } from "./i18n/index.js";
import {
  editingMessageId,
  toast,
  settingsOpen,
  extensionsOpen,
  notify,
  confirmAction,
  confirmation,
  sourcePanel,
  resolvedDark,
  openSettings,
} from "./ui.js";
import { useMobileViewport } from "./viewport.js";
import { useComposer } from "./components/useComposer.js";
import Icon from "./components/Icon.vue";
import ChatMessage from "./components/ChatMessage.vue";
import DraftAttachments from "./components/DraftAttachments.vue";
import Extensions from "./components/Extensions.vue";
import Confirmation from "./components/Confirmation.vue";
import Sources from "./components/Sources.vue";
import Settings from "./components/Settings.vue";
useMobileViewport();
const chat = useChatStore.state,
  settings = useSettings.state;
const {
  text,
  busy,
  attachments,
  ready,
  input,
  recording,
  transcribing,
  seconds,
  canvas,
  submit,
  files,
  paste,
  release,
  voice,
} = useComposer();
const session = computed(() => chat.value.sessionCache[chat.value.activeId || ""]);
const failedSession = computed(() => Object.keys(chat.value.sessionLoadErrors)[0]);
const mobile = ref(innerWidth < 768),
  mobileOpen = ref(false);
const dragging = ref(false),
  dragTarget = ref<HTMLElement | null>(null);
const adapter = useChatRuntimeAdapter({
  runtime: {
    ...runtime,
    composer: {
      ...runtime.composer,
      disabled: computed(
        () => chat.value.importingHistory || recording.value || transcribing.value,
      ),
      submitDisabled: computed(() => !ready.value),
    },
  },
  historyData: computed(() =>
    groupSessions(chat.value.sessions, new Date().setHours(0, 0, 0, 0)).map((g) => ({
      group: g.label,
      items: g.sessions,
    })),
  ),
  onActionError: () => notify(t("sessionDeleteFailed")),
});
const renderer = markRaw(ChatMessage);
const ui = computed<ChatUIOptions>(() => ({
  brand: { name: t("appName") },
  labels: {
    newConversationTitle: t("untitledChat"),
    createConversation: t("newChat"),
    renameConversation: t("sessionItemMenuRenameOption"),
    deleteConversation: t("delete"),
    expandConversationList: t("expandSiderbarButton"),
    collapseConversationList: t("collapseSiderbarButton"),
    composerPlaceholder: t("chatInputPlaceholderChat"),
    welcomeTitle: t("welcomeMessageChat250808"),
    welcomeDescription: "",
  },
  layout: {
    surface: { mode: "normal" },
    emptyState: "center",
    contentMaxWidth: 800,
    panelPadding: 0,
    panelGap: 0,
    mobileBreakpoint: 768,
    composer: { welcome: mobile.value ? "footer" : "center" },
    leftAside: {
      mode: mobile.value ? "drawer" : "dock",
      width: mobile.value ? 300 : 261,
      collapsedWidth: 0,
      open: mobile.value ? mobileOpen.value : !settings.value.siderCollapsed,
    },
    rightAside: {
      width: 390,
      collapsedWidth: 0,
      mode: mobile.value ? "drawer" : "dock",
      panels: [{ id: "sources", title: t("search") }],
    },
  },
  welcome: { title: t("welcomeMessageChat250808"), description: "" },
  prompts: false,
  model: false,
  mcp: false,
  bubble: {
    bubbleList: {
      roleConfigs: {
        user: { avatar: undefined, shape: "none", placement: "end" },
        assistant: { avatar: undefined, shape: "none", placement: "start" },
      },
    },
    bubbleProvider: { fallbackContentRenderer: renderer },
  },
  sender: {
    mode: "multiple",
    placeholder: t("chatInputPlaceholderChat"),
    autoSize: { minRows: 1, maxRows: 12 },
    maxLength: Number.MAX_SAFE_INTEGER,
    showWordLimit: false,
    clearable: false,
    toolbar: [],
  },
}));
const system = matchMedia("(prefers-color-scheme: dark)");
function theme() {
  resolvedDark.value =
    settings.value.themePreference === "dark" ||
    (settings.value.themePreference === "system" && system.matches);
  document.body.toggleAttribute("data-ds-dark-theme", resolvedDark.value);
  document.body.classList.toggle("dark", resolvedDark.value);
  document.body.classList.toggle("light", !resolvedDark.value);
  document.documentElement.setAttribute(
    "data-tr-color-mode",
    resolvedDark.value ? "dark" : "light",
  );
  document.documentElement.lang = settings.value.locale;
}
watch(settings, theme, { immediate: true });
system.addEventListener("change", theme);
function resize() {
  mobile.value = innerWidth < 768;
}
let unbind: (() => void) | undefined, uploadUnbind: (() => void) | undefined;
onMounted(() => {
  initChat();
  if (!settings.value.apiKey) settingsOpen.value = true;
  unbind = bindChatPersistence();
  uploadUnbind = onUploadNotice(notify);
  addEventListener("resize", resize);
});
onBeforeUnmount(() => {
  unbind?.();
  uploadUnbind?.();
  removeEventListener("resize", resize);
  system.removeEventListener("change", theme);
  stopReadAloud();
});
function open(id: string | null) {
  editingMessageId.value = null;
  stopReadAloud();
  sourcePanel.value = null;
  if (id) selectSession(id);
  else newChat();
  mobileOpen.value = false;
}
async function remove(id: string) {
  if (
    (await confirmAction(
      t("deleteSessionModalContentTitle"),
      t("deleteSessionWithFilesDescription"),
      t("delete"),
      true,
    )) &&
    !(await removeSession(id))
  )
    notify(t("sessionDeleteFailed"));
}
function historyAction(payload: ChatHistoryActionPayload) {
  if (payload.action.id === "delete") {
    payload.preventDefault();
    void remove(payload.conversation.id);
  }
}
function stop() {
  stopReadAloud();
  if (chat.value.activeId) stopReply(chat.value.activeId);
}
</script>
<template>
  <div
    class="suite-app"
    v-dropzone="{
      accept: ACCEPT,
      multiple: true,
      maxFiles: MAX_COUNT,
      maxSize: MAX_SIZE_MB * 1024 * 1024,
      disabled: chat.importingHistory,
      onDrop: files,
      onError: () => notify(t('uploadUnsupportedFormat')),
      onDraggingChange: (v, el) => {
        dragging = v;
        dragTarget = el;
      },
    }"
  >
    <TrChatUI
      class="deepseek-chat-suite"
      :data="adapter.data.value"
      :ui="ui"
      :is-empty="!chat.activeId"
      v-model:input-value="text"
      :right-aside-open="!!sourcePanel"
      active-right-aside-panel-id="sources"
      @update:right-aside-open="
        (v) => {
          if (!v) sourcePanel = null;
        }
      "
      @left-aside-open-change="
        (e) => {
          if (mobile) mobileOpen = e.open;
          else setSiderCollapsed(!e.open);
        }
      "
      @create-conversation="open(null)"
      @switch-conversation="({ conversationId }) => open(conversationId)"
      @rename-conversation="({ conversationId, title }) => renameSession(conversationId, title)"
      @history-action="historyAction"
      @submit="submit"
      @cancel="stop"
      @sender-paste="paste"
    >
      <template #layout-header="{ toggleLeftAside }">
        <header class="main-header">
          <button
            v-if="mobile || settings.siderCollapsed"
            class="icon-button"
            :aria-label="t('expandSiderbarButton')"
            @click="toggleLeftAside"
          >
            <Icon name="IconMenuOutline20" />
          </button>
          <span>{{ session?.title || "" }}</span>
          <button
            v-if="mobile || settings.siderCollapsed"
            class="icon-button"
            :aria-label="t('newChat')"
            @click="open(null)"
          >
            <Icon name="IconNewChatOutline20" />
          </button>
        </header>
        <div v-if="chat.initError" class="loading">
          {{ t("sessionListLoadFailed") }}<button @click="initChat">{{ t("retry") }}</button>
        </div>
        <div v-else-if="!chat.ready" class="loading">{{ t("sessionLoading") }}</div>
        <div v-else-if="failedSession || (chat.activeId && !session)" class="loading">
          {{ t(failedSession ? "sessionLoadFailed" : "sessionLoading") }}
          <button v-if="failedSession" @click="selectSession(failedSession)">
            {{ t("retry") }}
          </button>
        </div>
        <div v-if="chat.activeId && chat.sessionSaveErrors[chat.activeId]" class="save-error">
          {{ t("sessionSaveFailed") }}<button @click="retrySaveSessions">{{ t("retry") }}</button>
        </div>
      </template>
      <template #layout-left-aside-brand="{ closeLeftAside }">
        <div class="suite-brand">
          <span>{{ t("appName") }}</span
          ><button
            class="icon-button"
            :aria-label="t('collapseSiderbarButton')"
            @click="closeLeftAside"
          >
            <Icon name="IconPanelLeftOutline16" />
          </button>
        </div>
      </template>
      <template #layout-left-aside-actions="{ createConversation }"
        ><button class="new-chat" @click="createConversation">
          <Icon name="IconNewChatOutline20" /> {{ t("newChat") }}
        </button></template
      >
      <template #layout-left-aside-footer
        ><div class="suite-sidebar-footer">
          <button class="extensions-entry" @click="extensionsOpen = true">✧ MCP / Skills</button
          ><button class="settings-entry" @click="openSettings()">
            <Icon name="IconSettingsOutline16" /> {{ t("settings") }}
          </button>
        </div></template
      >
      <template #layout-right-aside><Sources v-if="sourcePanel" /></template>
      <template #composer-before
        ><div v-if="recording" class="recording">
          <canvas ref="canvas" width="300" height="32" />{{ t("voiceInputTimer", { seconds })
          }}<button @click="release">{{ t("cancel") }}</button>
        </div></template
      >
      <template v-if="attachments.length" #sender-header
        ><DraftAttachments
          :items="attachments"
          :disabled="chat.importingHistory"
          @remove="(file) => file.id && removeDraftAttachment(chat.activeId, file.id)"
          @retry="
            (file) => file.id && retryDraftAttachment(chat.activeId, file.id, settings.apiKey || '')
          "
      /></template>
      <template #sender-footer
        ><div class="composer-actions">
          <button
            :class="['toggle', { selected: settings.thinking }]"
            :aria-pressed="settings.thinking"
            :title="t('deactivatedThinkTooltip')"
            @click="setThinking(!settings.thinking)"
          >
            <Icon name="IconThinkOutline14" /> {{ t("thinkingSwitch") }}
          </button>
          <button
            :class="['toggle', { selected: settings.search }]"
            :aria-pressed="settings.search"
            :title="t('deactivatedSearchTooltip')"
            @click="setSearch(!settings.search)"
          >
            <Icon name="IconGlobeLanguageOutline14" /> {{ t("search") }}
          </button>
        </div></template
      >
      <template #sender-footer-right>
        <button
          class="icon-button"
          :title="t('voiceInput')"
          :aria-label="
            recording ? t('voiceInputStop') : transcribing ? t('voiceInputCancel') : t('voiceInput')
          "
          @click="voice"
        >
          <Icon :name="recording ? 'IconStopFill16' : 'IconMicOutline16'" />
        </button>
        <button
          class="icon-button"
          :title="t('uploadFile')"
          :aria-label="t('uploadFile')"
          :disabled="chat.importingHistory"
          @click="input?.click()"
        >
          <Icon name="IconPaperclipOutline16" />
        </button>
        <button
          v-if="busy"
          class="send-button"
          :aria-label="t('chatInputStopButtonTooltip')"
          @click="stop"
        >
          <Icon name="IconStopFill16" />
        </button>
        <button
          v-else
          class="send-button"
          :disabled="!ready || chat.importingHistory || recording || transcribing"
          :aria-label="t('send')"
          @click="submit"
        >
          <Icon name="IconSendOutline16" />
        </button>
      </template>
      <template #composer-after
        ><p class="caveat" :class="{ 'welcome-caveat': !chat.activeId }">
          {{ t("contentCaveat") }}
        </p></template
      >
    </TrChatUI>
    <input
      ref="input"
      type="file"
      hidden
      multiple
      :accept="ACCEPT"
      @change="
        files(Array.from(input?.files || []));
        input && (input.value = '');
      "
    />
    <TrDragOverlay
      :is-dragging="dragging"
      :drag-target="dragTarget"
      :overlay-title="t('dragFileToUpload')"
      :overlay-description="[t('dragFileDesc', { count: MAX_COUNT, size: MAX_SIZE_MB })]"
    />
  </div>
  <Settings v-if="settingsOpen" /><Extensions v-if="extensionsOpen" /><Confirmation
    v-if="confirmation"
    :key="confirmation.title"
  />
  <div v-if="toast" class="toast" role="status">{{ toast }}</div>
</template>

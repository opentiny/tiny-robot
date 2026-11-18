import { computed, ref, onBeforeUnmount, watch } from "vue";

import { type Attachment } from "@opentiny/tiny-robot";
import { useSettings } from "../services/settings.js";
import { useChatStore, runtime } from "../services/chat/store.js";
import {
  useDrafts,
  EMPTY_DRAFT,
  setDraftText,
  addDraftFiles,
  prepareDraftMessage,
} from "../services/chat/drafts.js";
import { useUploads } from "../services/attachments.js";
import { startRecording, type Recording } from "../services/speech/recorder.js";
import { transcribe } from "../services/api/speech.js";
import { stopReadAloud } from "../services/speech/readAloud.js";
import { settingsOpen, notify } from "../ui.js";
import { translate as t } from "../i18n/index.js";
export function useComposer() {
  const settings = useSettings.state,
    chat = useChatStore.state,
    uploads = useUploads.state,
    drafts = useDrafts.state;
  const draft = computed(() => drafts.value.drafts.get(chat.value.activeId) || EMPTY_DRAFT);
  const text = computed({
    get: () => draft.value.text,
    set: (v) => setDraftText(chat.value.activeId, v),
  });
  const busy = computed(() => !!chat.value.streaming[chat.value.activeId || ""]);
  const attachments = computed<Attachment[]>(() =>
    draft.value.attachments.map((a) => ({
      id: a.id,
      name: a.file.name,
      rawFile: a.file,
      url: a.previewUrl || undefined,
      size: a.file.size,
      status:
        uploads.value.tasks[a.id]?.status === "error"
          ? "error"
          : uploads.value.tasks[a.id]?.status === "done"
            ? "success"
            : "uploading",
      message:
        uploads.value.tasks[a.id]?.status === "error" ? t("uploadFileStatusFailed") : undefined,
    })),
  );
  const ready = computed(() => !!prepareDraftMessage(draft.value, uploads.value.tasks));
  const input = ref<HTMLInputElement>(),
    recording = ref(false),
    transcribing = ref(false),
    seconds = ref(0),
    canvas = ref<HTMLCanvasElement>();
  let record: Recording | undefined,
    timer: ReturnType<typeof setInterval> | undefined,
    frame = 0,
    epoch = 0,
    controller: AbortController | undefined;
  function requireKey() {
    if (!settings.value.apiKey) {
      settingsOpen.value = true;
      return false;
    }
    return true;
  }
  function submit() {
    if (!requireKey() || busy.value) return;
    stopReadAloud();
    void runtime.actions.send({ text: text.value });
  }
  function files(list: File[]) {
    if (!requireKey()) return;
    const error = addDraftFiles(chat.value.activeId, list, settings.value.apiKey!);
    if (error) notify(error);
  }
  function paste(e: ClipboardEvent) {
    const list = Array.from(e.clipboardData?.files || []);
    if (list.length) {
      e.preventDefault();
      files(list);
    }
  }
  function release() {
    epoch++;
    record?.cancel();
    record = undefined;
    controller?.abort();
    recording.value = false;
    transcribing.value = false;
    clearInterval(timer);
    cancelAnimationFrame(frame);
  }
  watch(() => chat.value.activeId, release);
  onBeforeUnmount(release);
  function draw() {
    const el = canvas.value;
    if (el && record) {
      const values = new Uint8Array(record.analyser.frequencyBinCount);
      record.analyser.getByteFrequencyData(values);
      const ctx = el.getContext("2d")!;
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.fillStyle = "#3964fe";
      for (let i = 0; i < 60; i++) {
        const height = Math.max(2, values[i] * 0.12);
        ctx.fillRect(i * 5, (32 - height) / 2, 2, height);
      }
    }
    frame = requestAnimationFrame(draw);
  }
  async function voice() {
    if (transcribing.value) {
      release();
      return;
    }
    if (!requireKey()) return;
    if (recording.value) {
      const captured = record;
      record = undefined;
      recording.value = false;
      clearInterval(timer);
      cancelAnimationFrame(frame);
      const id = chat.value.activeId;
      const token = ++epoch;
      transcribing.value = true;
      controller = new AbortController();
      try {
        const audio = await captured?.stop();
        if (!audio) {
          notify(t("voiceInputEmpty"));
          return;
        }
        const result = await transcribe(settings.value.apiKey!, audio, controller.signal);
        if (token === epoch) {
          setDraftText(id, (useDrafts.getState().drafts.get(id)?.text || "") + result);
          if (!result) notify(t("voiceInputEmpty"));
        }
      } catch {
        if (!controller?.signal.aborted) notify(t("voiceInputFailed"));
      } finally {
        if (token === epoch) transcribing.value = false;
      }
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      notify(t("voiceInputRequiresHttps"));
      return;
    }
    const token = ++epoch;
    stopReadAloud();
    try {
      const rec = await startRecording(() => void voice());
      if (token !== epoch) {
        rec.cancel();
        return;
      }
      record = rec;
      recording.value = true;
      seconds.value = 0;
      timer = setInterval(() => seconds.value++, 1000);
      draw();
    } catch (e) {
      notify(
        t(
          e instanceof DOMException && e.name === "NotAllowedError"
            ? "voiceInputPermissionDenied"
            : "voiceInputNoDevice",
        ),
      );
    }
  }

  return {
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
  };
}

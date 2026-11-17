import { ref } from "vue";
import { translate, type TranslationMessage } from "./i18n/index.js";
export const settingsOpen = ref(false);
export const extensionsOpen = ref(false);
export const editingMessageId = ref<string | null>(null);
export const toast = ref("");
let timer: ReturnType<typeof setTimeout>;
export function notify(message: string | TranslationMessage) {
  toast.value = typeof message === "string" ? message : translate(message.key, message.params);
  clearTimeout(timer);
  timer = setTimeout(() => (toast.value = ""), 5000);
}
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export type Confirmation = {
  title: string;
  description?: string;
  label: string;
  value?: string;
  danger?: boolean;
  resolve: (value: string | null) => void;
};
export const confirmation = ref<Confirmation | null>(null);
export function ask(options: Omit<Confirmation, "resolve">): Promise<string | null> {
  confirmation.value?.resolve(null);
  return new Promise((resolve) => (confirmation.value = { ...options, resolve }));
}
export function settleConfirmation(value: string | null) {
  const pending = confirmation.value;
  confirmation.value = null;
  pending?.resolve(value);
}
export async function confirmAction(
  title: string,
  description = "",
  label = translate("confirm"),
  danger = false,
) {
  return (await ask({ title, description, label, danger })) !== null;
}

import type { Source } from "./services/chat/view.js";
export const sourcePanel = ref<Source[] | null>(null);

export const settingsSection = ref<"general" | "data" | null>(null);
export function openSettings(section?: "general" | "data") {
  settingsSection.value = section || null;
  settingsOpen.value = true;
}
export const resolvedDark = ref(false);

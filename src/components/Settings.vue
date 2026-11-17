<script setup lang="ts">
import { computed, ref } from "vue";
import Icon from "./Icon.vue";
import SelectField from "./SelectField.vue";
import Modal from "./Modal.vue";
import {
  useSettings,
  setApiKey,
  setLocale,
  setThemePreference,
  setTtsVoice,
  setLocation,
  isChineseBrowser,
} from "../services/settings.js";
import { provinces, regionCodes, getRegionName } from "../services/location.js";
import { verifyApiKey } from "../services/api/client.js";
import { exportHistory, importHistory, clearHistory } from "../services/chat/backup.js";
import { useChatStore } from "../services/chat/store.js";
import { stopReadAloud } from "../services/speech/readAloud.js";
import { translate as t } from "../i18n/index.js";
import { settingsOpen, settingsSection, notify, download, confirmAction } from "../ui.js";
const settings = useSettings.state;
const tab = ref(settingsSection.value || (settings.value.apiKey ? "general" : "data")),
  key = ref(""),
  editingKey = ref(settingsSection.value === "data"),
  busy = ref(false),
  error = ref("");
const cities = computed(
  () => provinces.find((p) => p.code === settings.value.location?.province)?.cities || [],
);

async function saveKey() {
  busy.value = true;
  error.value = "";
  try {
    await verifyApiKey(key.value.trim());
    setApiKey(key.value.trim());
    key.value = "";
    editingKey.value = false;
    notify(t("confirm"));
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    busy.value = false;
  }
}
async function exportData() {
  busy.value = true;
  try {
    const data = await exportHistory();
    download(data.blob, data.name);
  } catch (e) {
    notify(t("historyExportFailed", { message: String(e) }));
  } finally {
    busy.value = false;
  }
}
async function importData(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (
    !file ||
    !(await confirmAction(
      t("historyImportConfirmTitle"),
      t("historyImportConfirmDescription"),
      t("historyImportConfirm"),
    ))
  )
    return;
  busy.value = true;
  stopReadAloud();
  try {
    const count = await importHistory(file);
    notify(t("historyImported", { count }));
  } catch {
    notify(t("historyImportFailed"));
  } finally {
    busy.value = false;
  }
}
async function clear() {
  if (
    !(await confirmAction(
      t("deleteAllSessionsModalTitle"),
      t("deleteAllSessionsModalDescription"),
      t("deleteAllSessions"),
      true,
    ))
  )
    return;
  busy.value = true;
  stopReadAloud();
  try {
    await clearHistory();
    notify(t("historyDeleted"));
  } catch {
    notify(t("historyDeleteFailed"));
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <Modal class="settings-modal" :title="t('settings')" @close="settingsOpen = false"
    ><div class="settings-grid">
      <nav>
        <button :class="{ selected: tab === 'general' }" @click="tab = 'general'">
          <Icon name="IconSettingsOutline16" />{{
            t("settingDialogAsideGeneralOptionLabel")
          }}</button
        ><button :class="{ selected: tab === 'data' }" @click="tab = 'data'">
          <Icon name="IconDataOutline16" />{{ t("settingDialogAsideDataOptionLabel") }}
        </button>
      </nav>
      <div class="settings-body">
        <template v-if="tab === 'general'">
          <div class="theme-setting">
            <span>{{ t("avatarMenuSettingsDialogThemeItemLabel") }}</span>
            <div class="theme-options">
              <button
                v-for="option in [
                  {
                    value: 'light',
                    icon: 'IconLightOutline16',
                    label: 'avatarMenuSettingsDialogThemeSelectLightOption',
                  },
                  {
                    value: 'dark',
                    icon: 'IconDarkOutline16',
                    label: 'avatarMenuSettingsDialogThemeSelectDarkOption',
                  },
                  {
                    value: 'system',
                    icon: 'IconFollowsystemOutline16',
                    label: 'avatarMenuSettingsDialogThemeSelectSystemOption',
                  },
                ] as const"
                :aria-pressed="settings.themePreference === option.value"
                :class="{ selected: settings.themePreference === option.value }"
                @click="setThemePreference(option.value)"
              >
                <Icon :name="option.icon" />{{ t(option.label) }}
              </button>
            </div>
          </div>
          <div class="setting-row">
            {{ t("settingsLocalePreference")
            }}<SelectField
              :aria-label="t('settingsLocalePreference')"
              :value="settings.locale"
              :options="[
                { value: 'zh-CN', label: '简体中文', lang: 'zh-CN' },
                { value: 'en-US', label: 'English', lang: 'en' },
              ]"
              @change="setLocale($event as any)"
            />
          </div>
          <div class="setting-row">
            {{ t("settingsTtsVoice")
            }}<SelectField
              :aria-label="t('settingsTtsVoice')"
              :value="settings.ttsVoice"
              :options="[
                { value: 'stella', label: t('settingsTtsVoiceStella') },
                { value: 'tide', label: t('settingsTtsVoiceTide') },
              ]"
              @change="setTtsVoice($event as any)"
            />
          </div>
          <div class="setting-row location-row">
            {{ t("settingsLocation") }}
            <div v-if="isChineseBrowser()">
              <SelectField
                class="province-select"
                :aria-label="t('settingsLocationProvince')"
                :placeholder="t('settingsLocationProvince')"
                :value="settings.location?.province || ''"
                :options="provinces.map((p) => ({ value: p.code, label: p.name }))"
                @change="
                  $event !== settings.location?.province &&
                  setLocation({ region: 'CN', province: $event })
                "
              />
              <SelectField
                class="city-select"
                :disabled="!cities.length"
                :aria-label="t('settingsLocationCity')"
                :placeholder="t('settingsLocationCity')"
                :value="settings.location?.city || ''"
                :options="cities.map((c) => ({ value: c.code, label: c.name }))"
                @change="
                  settings.location?.province &&
                  setLocation({ region: 'CN', province: settings.location.province, city: $event })
                "
              />
            </div>
            <SelectField
              v-else
              :aria-label="t('settingsLocationRegion')"
              :placeholder="t('settingsLocationRegion')"
              :value="settings.location?.region || ''"
              :options="
                regionCodes
                  .map((code) => ({ value: code, label: getRegionName(code, settings.locale) }))
                  .sort((a, b) => a.label.localeCompare(b.label, settings.locale))
              "
              @change="setLocation({ region: $event })"
            />
          </div> </template
        ><template v-else
          ><form class="key-form" @submit.prevent="saveKey">
            <label for="api-key">{{ t("apiKeyStart") }}</label>
            <div v-if="settings.apiKey && !editingKey" class="key-saved">
              <span>{{ "*".repeat(settings.apiKey.length) }}</span
              ><button
                type="button"
                :aria-label="t('apiKeyEdit')"
                :title="t('apiKeyEdit')"
                @click="editingKey = true"
              >
                <Icon name="IconEditOutline16" />
              </button>
            </div>
            <div v-else class="key-input">
              <input
                id="api-key"
                aria-label="API Key"
                v-model="key"
                type="password"
                autocomplete="off"
                :placeholder="t('apiKeyPlaceholder')"
                @blur="settings.apiKey && !key.trim() && (editingKey = false)"
              /><button v-if="key.trim()" class="key-confirm" :disabled="busy" @mousedown.prevent>
                {{ busy ? t("apiKeyVerifying") : t("confirm") }}
              </button>
            </div>
            <p v-if="error" role="alert" class="error">{{ error }}</p>
          </form>
          <div class="data-setting">
            <h3>{{ t("historyImport") }}</h3>
            <p>{{ t("historyImportDescription") }}</p>
            <label class="button"
              ><Icon name="IconUploadOutline14" />{{ t("upload")
              }}<input type="file" accept=".zip" :disabled="busy" hidden @change="importData"
            /></label>
          </div>
          <div class="data-setting">
            <h3>{{ t("exportAllLabel") }}</h3>
            <p>{{ t("historyExportDescription") }}</p>
            <button
              :disabled="busy || !useChatStore.state.value.sessions.length"
              @click="exportData"
            >
              <Icon name="IconDownloadOutline16" />{{ t("exportAllDownload") }}
            </button>
          </div>
          <div class="data-setting">
            <h3>{{ t("deleteAllSessions") }}</h3>
            <button class="danger" :disabled="busy" @click="clear">{{ t("delete") }}</button>
          </div></template
        >
      </div>
    </div></Modal
  >
</template>

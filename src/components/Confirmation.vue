<script setup lang="ts">
import { ref } from "vue";
import Modal from "./Modal.vue";
import { confirmation, settleConfirmation } from "../ui.js";
import { translate as t } from "../i18n/index.js";
const value = ref(confirmation.value?.value || "");
</script>
<template>
  <Modal
    v-if="confirmation"
    class="confirm-modal"
    :title="confirmation.title"
    @close="settleConfirmation(null)"
    ><form class="confirm-body" @submit.prevent="settleConfirmation(value)">
      <p v-if="confirmation.description">{{ confirmation.description }}</p>
      <input
        v-if="confirmation.value !== undefined"
        v-model="value"
        :aria-label="confirmation.title"
        autofocus
      />
      <footer>
        <button type="button" @click="settleConfirmation(null)">{{ t("cancel") }}</button
        ><button :class="confirmation.danger ? 'danger primary' : 'primary'">
          {{ confirmation.label }}
        </button>
      </footer>
    </form></Modal
  >
</template>

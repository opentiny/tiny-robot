<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import { translate as t } from "../i18n/index.js";
defineProps<{ title: string }>();
const emit = defineEmits<{ close: [] }>();
const root = ref<HTMLDialogElement>();
let previous: HTMLElement | null;
onMounted(() => {
  previous = document.activeElement as HTMLElement;
  root.value?.showModal();
});
onBeforeUnmount(() => previous?.focus());
</script>
<template>
  <dialog
    ref="root"
    class="modal"
    @cancel.prevent="emit('close')"
    @click="
      (e) => {
        if (e.target === root) emit('close');
      }
    "
  >
    <section>
      <header>
        <h2>{{ title }}</h2>
        <button class="icon-button" :aria-label="t('close')" @click="emit('close')">×</button>
      </header>
      <slot />
    </section>
  </dialog>
</template>

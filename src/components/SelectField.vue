<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { TrDropdownMenu } from "@opentiny/tiny-robot";
import Icon from "./Icon.vue";
import "../styles/select-field.css";
const props = defineProps<{
  value: string;
  options: { value: string; label: string; lang?: string }[];
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
}>();
const emit = defineEmits<{ change: [value: string] }>();
const trigger = ref<HTMLButtonElement>();
const host = ref<HTMLElement>();
onMounted(() => {
  host.value = trigger.value?.closest("dialog") ?? document.body;
});
const current = computed(() => props.options.find((item) => item.value === props.value));
</script>
<template>
  <TrDropdownMenu
    :key="host ? 1 : 0"
    :append-to="host"
    :items="options.map((item) => ({ id: item.value, text: item.label }))"
    @item-click="({ id }) => emit('change', id)"
  >
    <template #trigger>
      <button
        ref="trigger"
        type="button"
        class="sf-trigger"
        :aria-label="ariaLabel"
        :disabled="disabled"
      >
        <span :class="{ 'sf-placeholder': !current }" :lang="current?.lang">{{
          current?.label || placeholder
        }}</span>
        <span class="sf-arrow"><Icon name="IconChevronDownOutline14" /></span>
      </button>
    </template>
  </TrDropdownMenu>
</template>

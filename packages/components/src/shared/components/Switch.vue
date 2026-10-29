<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label: string
  disabled?: boolean
  descriptionId?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const handleChange = (event: Event) => {
  if (props.disabled) return

  const input = event.currentTarget as HTMLInputElement
  const nextValue = input.checked

  input.checked = props.modelValue
  emit('update:modelValue', nextValue)
}
</script>

<template>
  <label class="tr-switch" :class="{ 'is-disabled': props.disabled }">
    <input
      class="tr-switch__input"
      type="checkbox"
      role="switch"
      :aria-label="props.label"
      :aria-describedby="props.descriptionId"
      :checked="props.modelValue"
      :disabled="props.disabled"
      @change="handleChange"
    />
    <span class="tr-switch__track" aria-hidden="true">
      <span class="tr-switch__thumb"></span>
    </span>
  </label>
</template>

<style lang="less" scoped>
.tr-switch {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  width: var(--tr-switch-width, 40px);
  height: var(--tr-switch-height, 22px);
  cursor: pointer;

  &.is-disabled {
    cursor: not-allowed;
    opacity: var(--tr-switch-disabled-opacity, 0.5);
  }
}

.tr-switch__input {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;

  &:focus-visible + .tr-switch__track {
    box-shadow:
      0 0 0 2px var(--tr-container-bg-default),
      0 0 0 4px var(--tr-color-primary);
  }

  &:checked + .tr-switch__track {
    background: var(--tr-switch-bg-color-checked, var(--tr-color-primary));
  }

  &:checked + .tr-switch__track .tr-switch__thumb {
    transform: translateX(var(--tr-switch-thumb-translate-x, 18px));
  }
}

.tr-switch__track {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: var(--tr-switch-bg-color, var(--tr-text-disabled));
  pointer-events: none;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.tr-switch__thumb {
  display: block;
  width: var(--tr-switch-thumb-size, 18px);
  height: var(--tr-switch-thumb-size, 18px);
  margin: var(--tr-switch-thumb-offset, 2px);
  border-radius: 50%;
  background: var(--tr-switch-thumb-bg-color, #fff);
  box-shadow: 0 1px 3px rgb(0 0 0 / 16%);
  transition: transform 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
  .tr-switch__track,
  .tr-switch__thumb {
    transition: none;
  }
}
</style>

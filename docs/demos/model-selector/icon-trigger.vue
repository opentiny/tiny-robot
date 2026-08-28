<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconArrowDown, IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('deepseek-v4-flash')

const models = [
  {
    value: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    icon: IconDeepseek,
  },
  {
    value: 'qwen3.7-max',
    label: 'Qwen3.7 Max',
    icon: IconBailian,
  },
] satisfies readonly ModelSelectorOption[]
</script>

<template>
  <div class="model-selector-icon-trigger-demo">
    <TrModelSelector v-model="model" :models="models">
      <template #trigger="{ option, label, open }">
        <span class="model-selector-icon-trigger-demo__trigger" :class="{ 'has-icon': option?.icon }">
          <span class="model-selector-icon-trigger-demo__trigger-main">
            <img
              v-if="typeof option?.icon === 'string'"
              :src="option.icon"
              class="model-selector-icon-trigger-demo__icon"
              alt=""
              aria-hidden="true"
            />
            <component
              :is="option?.icon"
              v-else-if="option?.icon"
              class="model-selector-icon-trigger-demo__icon"
              aria-hidden="true"
              focusable="false"
            />
            <span class="model-selector-icon-trigger-demo__label">{{ label }}</span>
          </span>
          <IconArrowDown
            class="model-selector-icon-trigger-demo__chevron"
            :class="{ 'is-open': open }"
            aria-hidden="true"
            focusable="false"
          />
        </span>
      </template>
    </TrModelSelector>

    <span class="model-selector-icon-trigger-demo__value" aria-live="polite">当前模型：{{ model }}</span>
  </div>
</template>

<style scoped>
.model-selector-icon-trigger-demo {
  display: flex;
  min-height: 96px;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg);
}

.model-selector-icon-trigger-demo__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.model-selector-icon-trigger-demo__trigger,
.model-selector-icon-trigger-demo__trigger-main {
  display: inline-flex;
  align-items: center;
}

.model-selector-icon-trigger-demo__trigger {
  width: 100%;
  justify-content: space-between;
  gap: 8px;
}

.model-selector-icon-trigger-demo__trigger-main {
  min-width: 0;
  gap: 8px;
}

.model-selector-icon-trigger-demo__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-selector-icon-trigger-demo__chevron {
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  transition: transform 0.18s ease;
}

.model-selector-icon-trigger-demo__chevron.is-open {
  transform: rotate(180deg);
}

@media (max-width: 480px) {
  .model-selector-icon-trigger-demo__trigger.has-icon .model-selector-icon-trigger-demo__label {
    display: none;
  }

  .model-selector-icon-trigger-demo__chevron {
    display: none;
  }

  .model-selector-icon-trigger-demo__trigger.has-icon .model-selector-icon-trigger-demo__trigger-main {
    gap: 0;
  }
}

.model-selector-icon-trigger-demo__value {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>

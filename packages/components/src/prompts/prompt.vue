<script setup lang="ts">
import type { PromptProps } from './index.type'

const props = withDefaults(defineProps<PromptProps>(), {
  size: 'medium',
})
</script>

<template>
  <div :class="['tr-prompt', { disabled: props.disabled }, props.size]">
    <component :is="props.icon"></component>
    <div class="tr-prompt__content">
      <h6 class="tr-prompt__content-title">{{ props.label }}</h6>
      <p v-if="props.description" class="tr-prompt__content-description">{{ props.description }}</p>
    </div>
    <div class="tr-prompt__badge">
      <template v-if="typeof props.badge === 'string'">
        {{ props.badge }}
      </template>
      <template v-else>
        <component :is="props.badge"></component>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-prompt {
  /* 不影响的布局的变量 */
  --bg: var(--tr-prompt-bg);
  --bg-hover: var(--tr-prompt-bg-hover);
  --bg-active: var(--tr-prompt-bg-active);
  --bg-disabled: var(--tr-prompt-bg-disabled);
  --box-shadow: var(--tr-prompt-shadow);
  --title-color: var(--tr-prompt-title-color);
  --title-font-weight: var(--tr-prompt-title-font-weight);
  --description-color: var(--tr-prompt-description-color);
  --border-radius: var(--tr-prompt-border-radius);
  --badge-bg: var(--tr-prompt-badge-bg);
  --badge-color: var(--tr-prompt-badge-color);

  /* 影响布局的变量 */
  --width: var(--tr-prompt-width);
  --padding: var(--tr-prompt-padding);
  --title-font-size: var(--tr-prompt-title-font-size);
  --title-line-height: var(--tr-prompt-title-line-height);
  --description-font-size: var(--tr-prompt-description-font-size);
  --description-line-height: var(--tr-prompt-description-line-height);
  --gap: var(--tr-prompt-gap);
  --content-gap: var(--tr-prompt-content-gap);
  --badge-padding: var(--tr-prompt-badge-padding);
  --badge-font-size: var(--tr-prompt-badge-font-size);
  --badge-line-height: var(--tr-prompt-badge-line-height);

  &.small {
    --padding: var(--tr-prompt-padding-small, var(--tr-prompt-padding));
    --title-font-size: var(--tr-prompt-title-font-size-small, var(--tr-prompt-title-font-size));
    --title-line-height: var(--tr-prompt-title-line-height-small, var(--tr-prompt-title-line-height));
    --description-font-size: var(--tr-prompt-description-font-size-small, var(--tr-prompt-description-font-size));
    --description-line-height: var(--tr-prompt-description-line-height-small, var(--tr-prompt-description-line-height));
    --gap: var(--tr-prompt-gap-small, var(--tr-prompt-gap));
    --content-gap: var(--tr-prompt-content-gap-small, var(--tr-prompt-content-gap));
    --badge-padding: var(--tr-prompt-badge-padding-small, var(--tr-prompt-badge-padding));
    --badge-font-size: var(--tr-prompt-badge-font-size-small, var(--tr-prompt-badge-font-size));
    --badge-line-height: var(--tr-prompt-badge-line-height-small, var(--tr-prompt-badge-line-height));
  }

  &.large {
    --padding: var(--tr-prompt-padding-large, var(--tr-prompt-padding));
    --title-font-size: var(--tr-prompt-title-font-size-large, var(--tr-prompt-title-font-size));
    --title-line-height: var(--tr-prompt-title-line-height-large, var(--tr-prompt-title-line-height));
    --description-font-size: var(--tr-prompt-description-font-size-large, var(--tr-prompt-description-font-size));
    --description-line-height: var(--tr-prompt-description-line-height-large, var(--tr-prompt-description-line-height));
    --gap: var(--tr-prompt-gap-large, var(--tr-prompt-gap));
    --content-gap: var(--tr-prompt-content-gap-large, var(--tr-prompt-content-gap));
    --badge-padding: var(--tr-prompt-badge-padding-large, var(--tr-prompt-badge-padding));
    --badge-font-size: var(--tr-prompt-badge-font-size-large, var(--tr-prompt-badge-font-size));
    --badge-line-height: var(--tr-prompt-badge-line-height-large, var(--tr-prompt-badge-line-height));
  }
}

.tr-prompt {
  flex: none;
  display: flex;
  align-items: start;
  gap: var(--gap);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: var(--padding);
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
  background: var(--bg);
  width: var(--width);

  &:hover {
    background: var(--bg-hover);
  }

  &.disabled {
    cursor: default;
    pointer-events: none;
    background: var(--bg-disabled);
  }

  &:active {
    background: var(--bg-active);
  }
}

.tr-prompt__content {
  display: flex;
  flex-direction: column;
  gap: var(--content-gap);
  align-items: start;
}

.tr-prompt__content-title {
  margin: 0;
  padding: 0;
  color: var(--title-color);
  font-size: var(--title-font-size);
  line-height: var(--title-line-height);
  font-weight: var(--title-font-weight);
}

.tr-prompt__content-description {
  margin: 0;
  padding: 0;
  font-size: var(--description-font-size);
  line-height: var(--description-line-height);
  color: var(--description-color);
}

.tr-prompt__badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: var(--badge-padding);
  border-top-right-radius: var(--border-radius);
  border-bottom-left-radius: var(--border-radius);
  background-color: var(--badge-bg);
  color: var(--badge-color);
  font-size: var(--badge-font-size);
  line-height: var(--badge-line-height);
}
</style>

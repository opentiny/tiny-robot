<script setup lang="ts">
import { WelcomeProps, WelcomeSlots } from './index.type'

const props = withDefaults(defineProps<WelcomeProps>(), {
  align: 'center',
})

defineSlots<WelcomeSlots>()
</script>

<template>
  <div class="tr-welcome">
    <div class="tr-welcome__title-wrapper">
      <span v-if="props.icon" class="tr-welcome__icon">
        <component :is="props.icon"></component>
      </span>
      <h3 class="tr-welcome__title">盘古助手</h3>
    </div>
    <span class="tr-welcome__description">{{ props.description }}</span>
    <slot name="footer"></slot>
  </div>
</template>

<style lang="less" scoped>
.tr-welcome {
  --title-font: 40px;
  --title-color: rgb(25, 25, 25);
  --title-font-size: 40px;
  --title-line-height: 56px;
  --title-font-weight: 600;
  --description-color: rgb(25, 25, 25);
  --description-font-size: 20px;
  --description-line-height: 34px;
  --description-font-weight: 500;

  text-align: v-bind('props.align');

  display: flex;
  flex-direction: column;
  padding: 16px;
}

.tr-welcome__title-wrapper {
}

.tr-welcome__icon {
  margin-right: 16px;
}

.tr-welcome__title {
  color: var(--title-color);
  font-size: var(--title-font-size);
  line-height: var(--title-line-height);
  font-weight: var(--title-font-weight);

  padding: 0;
  margin: 0;
  display: inline-block;
}

.tr-welcome__description {
  color: var(--description-color);
  font-size: var(--description-font-size);
  line-height: var(--description-line-height);
  font-weight: var(--description-font-weight);

  margin-top: 32px;
}
</style>

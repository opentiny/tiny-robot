<template>
  <div class="tr-question__loading-wrapper">
    <slot>
      <img class="tr-question__loading" src="../../assets/loading.webp" />
      <span class="tr-question__loading-text">正在加载</span>
    </slot>
  </div>
</template>

<style lang="less">
:root {
  --tr-suggestion-popover-loading-color: #808080;
  --tr-suggestion-popover-loading-font-size: 12px;
  --tr-suggestion-popover-loading-line-height: 24px;
}
</style>

<style scoped lang="less">
.tr-question__loading-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .tr-question__loading {
    width: 36px;
    height: 36px;
  }

  .tr-question__loading-text {
    margin-top: 12px;
    font-size: var(--tr-suggestion-popover-loading-font-size);
    line-height: var(--tr-suggestion-popover-loading-line-height);
    color: var(--tr-suggestion-popover-loading-color);
  }
}
</style>

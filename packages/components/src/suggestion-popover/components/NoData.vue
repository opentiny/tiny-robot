<template>
  <div class="tr-question__no-data-wrapper">
    <slot>
      <img class="tr-question__no-data" src="../../assets/svgs/no-data.svg" />
      <span class="tr-question__no-data-text">暂时没有内容</span>
    </slot>
  </div>
</template>

<style lang="less">
:root {
  --tr-suggestion-popover-no-data-color: #191919;
  --tr-suggestion-popover-no-data-font-size: 12px;
  --tr-suggestion-popover-no-data-line-height: 24px;
}
</style>

<style scoped lang="less">
.tr-question__no-data-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .tr-question__no-data {
    width: 120px;
    height: 120px;
  }

  .tr-question__no-data-text {
    margin-top: 14px;
    font-size: var(--tr-suggestion-popover-no-data-font-size);
    line-height: var(--tr-suggestion-popover-no-data-line-height);
    color: var(--tr-suggestion-popover-no-data-color);
  }
}
</style>

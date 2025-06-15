<template>
  <div class="tr-question__no-data-wrapper">
    <slot>
      <img class="tr-question__no-data" src="../../assets/svgs/no-data.svg" />
      <span class="tr-question__no-data-text">暂时没有内容</span>
    </slot>
  </div>
</template>

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
    font-size: 12px;
    line-height: 24px;
    color: #191919;
  }
}
</style>

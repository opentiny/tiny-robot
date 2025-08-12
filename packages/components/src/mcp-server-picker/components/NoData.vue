<template>
  <div class="tr-mcp__no-data-wrapper">
    <slot>
      <img class="tr-mcp__no-data" src="../../assets/svgs/no-data.svg" />
      <span class="tr-mcp__no-data-text">暂时没有内容</span>
    </slot>
  </div>
</template>

<style lang="less">
:root {
  --tr-mcp-no-data-color: #191919;
  --tr-mcp-no-data-font-size: 12px;
  --tr-mcp-no-data-line-height: 24px;
}
</style>

<style scoped lang="less">
.tr-mcp__no-data-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 180px;

  .tr-mcp__no-data {
    width: 112px;
    height: 112px;
  }

  .tr-mcp__no-data-text {
    margin-top: 12px;
    font-size: var(--tr-mcp-no-data-font-size);
    line-height: var(--tr-mcp-no-data-line-height);
    color: var(--tr-mcp-no-data-color);
  }
}
</style>

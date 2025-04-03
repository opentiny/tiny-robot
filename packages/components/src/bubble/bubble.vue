<template>
  <div class="bubble-container">
    <img class="ai-avatar" src="/ai-avatar.svg" alt="AI avatar" />
    <div class="bubble-content">
      <h3 v-if="props.title" class="title text">{{ props.title }}</h3>
      <p id="ai-answer" class="text"></p>
      <slot name="footer">
        <div v-if="!loading" class="footer">
          <div style="flex: 1"></div>
          <div class="buttons">
            <!-- TODO 切换成button -->
            <img src="/refresh.svg" alt="Refresh button" />
            <img src="/copy.svg" alt="Copy button" />
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import Typed, { TypedOptions } from "typed.js";
import { onMounted, ref, watchEffect } from "vue";

const props = withDefaults(
  defineProps<{
    title?: string; // 支持markdown后，不需要此参数
    content: string;
    loading?: boolean;
  }>(),
  {}
);

const loading = ref(false);

watchEffect(() => {
  loading.value = props.loading;
});

const printFn = (data: string) => {
  const options: TypedOptions = {
    strings: [data],
    typeSpeed: 50,
    startDelay: 300,
    loop: false,
    showCursor: true,
    contentType: "null",
    onBegin: () => {
      loading.value = true;
    },
    onComplete: (data: Typed) => {
      loading.value = false;
    },
    onStringTyped: (index: number, data: Typed) => {},
  };

  new Typed(`#ai-answer`, options);
};

onMounted(() => {
  printFn(props.content);
});
</script>

<style lang="less" scoped>
.bubble-container {
  display: flex;
  gap: 16px;
}

.bubble-content {
  background-color: white;
  padding: 16px 24px;
  border-top-left-radius: 0;
  border-top-right-radius: 24px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.02);

  h3.title {
    font-size: 500;
    margin-bottom: 16px;
  }

  .text {
    color: rgb(25, 25, 25);
    font-size: 16px;
    line-height: 26px;
    margin: 0;
  }
}

.ai-avatar {
  width: 32px;
  height: 32px;
}

.footer {
  margin-top: 16px;
  display: flex;
  gap: 24px;

  .buttons {
    display: flex;
    gap: 4px;

    img {
      width: 24px;
      height: 24px;
      padding: 4px;
      box-sizing: border-box;
    }
  }
}
</style>

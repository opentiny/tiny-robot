<script lang="ts" setup>
import { provide, ref } from 'vue'
import LoginLang from './login-lang.vue'
import LoginMail from './login-mail.vue'
import LoginRegister from './login-register.vue'

// 切换开关
const display = ref(false)

function handle(value: any) {
  display.value = value
}
provide('handle', handle)
</script>

<template>
  <div class="login-form-container">
    <div class="login-form-language">
      <LoginLang />
    </div>
    <div v-if="display">
      <LoginRegister />
    </div>
    <div v-if="!display">
      <LoginMail />
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-form-container {
  margin-top: 5%;
}

.login-form-language {
  position: absolute;
  top: 10%;
  left: 90%;
}

:deep(.tiny-tabs__content) {
  margin-left: -6%;
}

// 修复组件默认tab的点击横线偏右超出
:deep(.tiny-tabs__nav.is-show-active-bar .tiny-tabs__item) {
  margin-right: 0;
}

// responsive
@media (max-width: @screen-lg) {
  .login-form-language {
    position: absolute;
    top: 10%;
    left: 78%;
  }
}

@media (max-width: @screen-mm) {
  .login-form-language {
    position: absolute;
    top: 8%;
    left: 75%;
  }
}

@media (max-width: @screen-ms) {
  .login-form-language {
    position: absolute;
    top: 1%;
    left: 72%;
  }
}
</style>

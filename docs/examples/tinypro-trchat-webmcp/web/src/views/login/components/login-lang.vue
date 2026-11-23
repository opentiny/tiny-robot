<script lang="ts" setup>
import { Button as TinyButton } from '@opentiny/vue'
import { iconLanguage } from '@opentiny/vue-icon'
import { ref } from 'vue'
import useLocale from '@/hooks/locale'
import { LOCALE_OPTIONS } from '@/locale'

const locales = [...LOCALE_OPTIONS]
const { changeLocale } = useLocale()
const IconLanguage = iconLanguage()
const LangDrop = ref(false)

function changeLangDrop() {
  LangDrop.value = !LangDrop.value
}
</script>

<template>
  <TinyButton :icon="IconLanguage" circle @click="changeLangDrop" />
  <span>{{ $t('login.icon.language') }}</span>
  <div v-if="LangDrop" class="login-lan-drop">
    <li
      v-for="(item, index) in locales"
      :key="index"
      :value="item.value"
      @click="changeLocale(locales[index].value)"
    >
      {{ item.label }}
    </li>
  </div>
</template>

<style lang="less" scoped>
.login-lan-drop {
  margin-left: -36%;
  background: #fff;
  border: 1px solid #ccc;

  li {
    display: block;
    padding: 6px;
    text-align: left;
    list-style-type: none;
    box-shadow: 0 0 2px 2px var(--tv-common-color-bg-normal);
    cursor: pointer;
  }

  li:hover {
    color: #2f5bea;
    background-color: #f5f6f7;
  }
}

span {
  padding-left: 5px;
  font-size: 20px;
}

// responsive
@media (max-width: @screen-ms) {
  .login-lan-drop {
    li {
      padding: 2px;
    }
  }
}
</style>

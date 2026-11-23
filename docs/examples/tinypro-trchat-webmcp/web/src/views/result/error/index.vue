<script lang="ts" setup>
import {
  Modal,
  Button as TinyButton,
  TimeLine as TinyTimeLine,
} from '@opentiny/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const list = computed(() => [
  { name: t('stepForm.start.coaching') },
  { name: t('stepForm.immediate.supervisor') },
  { name: t('stepForm.overall.goals') },
  { name: t('stepForm.overall.summary') },
  { name: t('stepForm.overall.end') },
])

const active = ref(4)

function handleSubmit() {
  if (active.value < 4) {
    active.value += 1
    Modal.message({
      message: t('menu.result.messageSuccess'),
      status: 'success',
    })
  }
  else {
    active.value = 4
    Modal.message({
      message: t('menu.result.messageEnd'),
      status: 'success',
    })
  }
}

function handleFormReset() {
  if (active.value === 4) {
    active.value = 0
  }
}
</script>

<template>
  <div class="container">
    <Breadcrumb :items="['menu.result', 'menu.result.error']" />
    <div class="content">
      <div class="content-main">
        <div v-if="active === 4" class="result-alert">
          <img src="@/assets/images/error.png" alt="error">
          <div>
            <div class="text-[20px] max-sm:text-[16px]">
              {{ $t('menu.result.messageError') }}
            </div>
            <div class="text-[14px] max-sm:text-[12px]">
              {{ $t('error.result.title') }}
            </div>
          </div>
        </div>
        <div class="result-btn">
          <TinyButton
            class="text-[14px] max-sm:text-[12px]"
            type="primary"
            native-type="submit"
            @click="handleSubmit"
          >
            {{ $t('error.result.home') }}
          </TinyButton>
          <TinyButton class="text-[14px] max-sm:text-[12px]" @click="handleFormReset">
            {{ $t('menu.btn.cancel') }}
          </TinyButton>
        </div>
        <div class="result-line">
          <div>{{ $t('menu.line.process') }}</div>
          <div>
            <TinyTimeLine :data="list" :active="active" type="normal" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: inherit;
  margin: 0 auto;
  overflow: hidden;

  :deep(.tiny-steps) {
    margin-top: 10px;
  }
}

.content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  overflow: auto;
  background: #fff;
  border-radius: 10px;
}

.content-main {
  padding: 75px 0;
}

.result-alert {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  color: black;
  text-align: center;

  img {
    width: 68px;
    height: 68px;
    margin: 0 auto;
  }

  div:first-child {
    padding-top: 50px;
    font-weight: 900;
  }

  div:last-child {
    padding-top: 20px;
  }
}

.result-line {
  width: 75%;
  height: 200px;
  margin: 0 auto;
  margin-top: 50px;
  color: black;
  background-color: #f5f6f7;

  div:first-child {
    padding: 20px;
  }
}

.result-btn {
  display: flex;
  justify-content: center;
  padding: 50px 0;

  button {
    width: 120px;
    height: 36px;
    border-radius: 4px;
  }
}
</style>

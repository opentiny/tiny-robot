<script lang="ts" setup>
import {
  Button as TinyButton,
  TimeLine as TinyTimeLine,
} from '@opentiny/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import transitionFadeSlideGroup from '@/components/transition/transition-fade-slide-group.vue'
import { useAppStore } from '@/store'
import CollapseForm from './components/collapse-form.vue'

const { t } = useI18n()
const appStore = useAppStore()
const collapseRef = ref()
const normalActive = computed(() => appStore.step)
const loacle = computed(() => localStorage.getItem('tiny-locale'))
// btn操作
function handleFormReset() {
  collapseRef.value.collapseReset()
}

function handleSubmit() {
  collapseRef.value.collapseSubmit()
}

function handleFormRestore() {
  collapseRef.value.collapseRestore()
}
</script>

<template>
  <div class="container-form">
    <div class="container-header">
      <Breadcrumb :items="['menu.form', 'menu.form.step']" />
    </div>
    <div class="base-body">
      <transition-fade-slide-group>
        <div class="form-card">
          <div class="form-header">
            {{ $t('stepForm.coaching.process') }}
          </div>
          <div>
            <TinyTimeLine
              :data="[
                { name: t('stepForm.start.coaching') },
                { name: t('stepForm.immediate.supervisor') },
                { name: t('stepForm.overall.goals') },
                { name: t('stepForm.overall.summary') },
                { name: t('stepForm.overall.end') },
              ]"
              :active="normalActive"
              space="200"
              type="normal"
              :class="`${loacle}-line`"
            />
          </div>
        </div>

        <div class="form-card mart_16 form-scroll">
          <CollapseForm ref="collapseRef" />
        </div>
        <div class="base-footer mart_16">
          <TinyButton v-if="normalActive !== 4" @click="handleFormReset">
            {{
              $t('stepForm.button.cancel')
            }}
          </TinyButton>
          <TinyButton
            v-if="normalActive !== 4"
            type="primary"
            native-type="submit"
            @click="handleSubmit"
          >
            {{ $t('stepForm.button.next') }}
          </TinyButton>
          <TinyButton v-if="normalActive === 4" @click="handleFormRestore">
            {{
              $t('stepForm.button.restore')
            }}
          </TinyButton>
        </div>
      </transition-fade-slide-group>
    </div>
  </div>
</template>

<style scoped lang="less">
.form-card {
  padding: 60px 400px 32px;
}

.form-scroll {
  overflow: auto;
}
</style>

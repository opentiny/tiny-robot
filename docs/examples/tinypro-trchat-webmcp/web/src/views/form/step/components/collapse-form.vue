<script lang="ts" setup>
import { Loading, Modal } from '@opentiny/vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getStepData } from '@/api/form'
import { useAppStore } from '@/store'
import CoachForm from './coach-form.vue'
import DirectorForm from './director-form.vue'
import SummationForm from './summation-form.vue'
import TargetForm from './target-form.vue'

// 加载效果（用于接口请求时的 loading 遮罩）
const state = reactive<{
  loading: any
}>({
  loading: null,
})

// 国际化、全局状态、表单引用、步骤控制等初始化
const { t } = useI18n()
const appStore = useAppStore()
const coachFormRef = ref()
const directorRef = ref()
const targetRef = ref()
const summationRef = ref()
const directorVis = ref(false)
const targetVis = ref(false)
const summationVis = ref(false)
const coachPlay = ref(true)
const directorPlay = ref(true)
const summationPlay = ref(true)
const projectData = reactive({
  position: [],
  HR: [],
  mentor: [],
  director: [],
})

// 请求表单下拉选项等数据
async function fetchData() {
  state.loading = Loading.service({
    text: 'loading...',
    target: document.getElementById('container'),
  })
  try {
    const { data } = await getStepData()
    projectData.position = data.position
    projectData.HR = data.HR
    projectData.mentor = data.mentor
    projectData.director = data.director
  }
  finally {
    state.loading.close()
  }
}

// 缓存相关：用于分步表单数据的本地存储与恢复
const FORM_CACHE_KEY = 'step-form-cache'
// 保存当前步骤表单数据到 localStorage
function saveCache(step: number, data: any) {
  const cache = JSON.parse(localStorage.getItem(FORM_CACHE_KEY) || '{}')
  cache[step] = data
  localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(cache))
}
// 读取指定步骤的缓存数据
function loadCache(step: number) {
  const cache = JSON.parse(localStorage.getItem(FORM_CACHE_KEY) || '{}')
  return cache[step] || null
}
// 清空所有步骤缓存
function clearCache() {
  localStorage.removeItem(FORM_CACHE_KEY)
}

// 页面挂载时：请求数据并尝试恢复每步表单的缓存，若有缓存则赋值并禁用表单
onMounted(() => {
  fetchData()
  // coach 步骤缓存恢复
  const coachCache = loadCache(0)
  if (coachCache && coachFormRef.value?.state) {
    coachFormRef.value.state.filterOptions = coachCache
    if (coachFormRef.value.disabled !== undefined)
      coachFormRef.value.disabled = true
  }
  // director 步骤缓存恢复
  const directorCache = loadCache(1)
  if (directorCache && directorRef.value?.state) {
    directorRef.value.state.filterOptions = directorCache
    if (directorRef.value.disabled !== undefined)
      directorRef.value.disabled = true
  }
  // target 步骤缓存恢复
  const targetCache = loadCache(2)
  if (targetCache && targetRef.value) {
    targetRef.value.targetModel = targetCache || []
    targetRef.value.targetSubmit()
  }
  // summation 步骤缓存恢复
  const summationCache = loadCache(3)
  if (summationCache && summationRef.value?.state) {
    summationRef.value.state.filterOptions = summationCache
    if (summationRef.value.disabled !== undefined)
      summationRef.value.disabled = true
  }
})

// 监听步骤变化，动态控制各分步表单的显隐
watch(
  appStore.$state,
  (newValue) => {
    if (newValue.step >= 1) {
      directorVis.value = true
    }
    if (newValue.step >= 2) {
      targetVis.value = true
    }
    if (newValue.step >= 3) {
      summationVis.value = true
    }
  },
  { immediate: true },
)

// 重置操作：清空缓存并重置当前步骤表单
function collapseReset() {
  clearCache()
  if (appStore.step === 0) {
    coachFormRef.value.coachReset()
  }
  else if (appStore.step === 1) {
    directorRef.value.directorReset()
  }
  else if (appStore.step === 2) {
    targetRef.value.targetReset()
  }
  else if (appStore.step === 3) {
    summationRef.value.summarizeReset()
  }
}

// 校验结果处理：成功则进入下一步，失败弹出提示
function packaged(vaild: boolean, index: number) {
  if (vaild) {
    Modal.message({
      message: t('baseForm.form.submit.success'),
      status: 'success',
    })
    appStore.updateStep(index)
  }
  else {
    Modal.message({
      message:
          index !== 3
            ? t('baseForm.form.submit.error')
            : t('stepForm.error.target'),
      status: 'error',
    })
  }
}

// 下一步：校验并缓存当前步骤表单数据
function collapseSubmit() {
  if (appStore.step === 0) {
    const vaild = coachFormRef.value?.coachValid()
    if (vaild && coachFormRef.value?.state?.filterOptions) {
      saveCache(0, JSON.parse(JSON.stringify(coachFormRef.value.state.filterOptions)))
      packaged(vaild, 1)
    }
  }

  if (appStore.step === 1) {
    const vaild = directorRef.value?.directorValid()
    if (vaild && directorRef.value?.state?.filterOptions) {
      saveCache(1, JSON.parse(JSON.stringify(directorRef.value.state.filterOptions)))
      packaged(vaild, 2)
    }
  }
  else if (appStore.step === 2) {
    const vaild = targetRef.value?.targetSubmit()
    if (targetRef.value?.targetModel?.length) {
      saveCache(2, JSON.parse(JSON.stringify(targetRef.value.targetModel)))
      packaged(vaild, 3)
    }
  }
  else if (appStore.step === 3) {
    const vaild = summationRef.value?.summarizeValid()
    if (vaild && summationRef.value?.state?.filterOptions) {
      saveCache(3, JSON.parse(JSON.stringify(summationRef.value.state.filterOptions)))
      packaged(vaild, 4)
    }
  }
}

// 恢复操作：清空缓存并重置所有表单和步骤
function collapseRestore() {
  clearCache()
  appStore.updateStep(0)
  coachFormRef.value.coachReset()
  directorRef.value.directorReset()
  targetRef.value.targetReset()
  summationRef.value.summarizeReset()
  directorVis.value = false
  targetVis.value = false
  summationVis.value = false
}

defineExpose({
  collapseReset,
  collapseSubmit,
  collapseRestore,
})
</script>

<template>
  <div class="container-form">
    <transition-fade-down-group>
      <div>
        <div class="form-header">
          {{ t('stepForm.collapse.base') }}
        </div>
        <CoachForm
          ref="coachFormRef"
          :project-data="projectData"
          :coach-play="coachPlay"
        />
      </div>
      <div v-if="directorVis">
        <transition-slide-group>
          <div class="form-header">
            {{ t('stepForm.collapse.supervisor') }}
          </div>
          <DirectorForm
            ref="directorRef"
            :project-data="projectData"
            :director-play="directorPlay"
          />
        </transition-slide-group>
      </div>
      <div v-if="targetVis" class="targetStyle">
        <transition-slide-group>
          <div class="form-header">
            {{ t('stepForm.collapse.goals') }}
          </div>
          <TargetForm ref="targetRef" :project-data="projectData" />
        </transition-slide-group>
      </div>
      <div v-if="summationVis">
        <transition-slide-group>
          <div class="form-header">
            {{ t('stepForm.collapse.summary') }}
          </div>
          <SummationForm
            ref="summationRef"
            :project-data="projectData"
            :summation-play="summationPlay"
          />
        </transition-slide-group>
      </div>
    </transition-fade-down-group>
  </div>
</template>

<style scoped lang="less"></style>

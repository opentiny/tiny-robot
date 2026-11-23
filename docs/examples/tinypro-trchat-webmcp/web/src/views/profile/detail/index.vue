<script lang="ts" setup>
import type { ProjectInfo } from '@/api/project'
import {
  DatePicker as TinyDatePicker,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Input as TinyInput,
  Numeric as TinyNumeric,
  Option as TinyOption,
  Select as TinySelect,
  Steps as TinySteps,
  Tag as TinyTag,
} from '@opentiny/vue'
import { t } from '@opentiny/vue-locale'
import { computed, onMounted, ref } from 'vue'
import { queryProjectList } from '@/api/project'

const project = ref<ProjectInfo | null>(null)

const projectStatusOptions = [
  { value: '0', label: 'advancedList.status.notStarted' },
  { value: '1', label: 'advancedList.status.inProgress' },
  { value: '2', label: 'advancedList.status.completed' },
  { value: '3', label: 'advancedList.status.paused' },
]

const priorityOptions = [
  { value: '0', label: 'advancedList.priority.high' },
  { value: '1', label: 'advancedList.priority.medium' },
  { value: '2', label: 'advancedList.priority.low' },
]

const riskOptions = [
  { value: '高', label: 'advancedList.priority.high' },
  { value: '中', label: 'advancedList.priority.medium' },
  { value: '低', label: 'advancedList.priority.low' },
]

// 第一模块：项目进度（横向步骤条）
const stepNodeKeys = [
  'profileDetail.steps.initiation',
  'profileDetail.steps.review',
  'profileDetail.steps.development',
  'profileDetail.steps.testing',
  'profileDetail.steps.release',
  'profileDetail.steps.acceptance',
]

const statusDoneCount: Record<string, number> = {
  0: 0,
  1: 2,
  2: 6,
  3: 3,
}

const stepsData = computed(() => {
  if (!project.value)
    return []
  const doneCount = statusDoneCount[project.value.projectStatus] ?? 2
  const paused = project.value.projectStatus === '3'
  return stepNodeKeys.map((key, index) => {
    const name = t(key)
    if (index < doneCount)
      return { name, status: 'done' }
    if (index === doneCount)
      return { name, status: paused ? 'error' : 'doing' }
    return { name }
  })
})

const activeStep = computed(() => {
  if (!project.value)
    return 0
  const doneCount = statusDoneCount[project.value.projectStatus] ?? 2
  return Math.min(doneCount, stepNodeKeys.length - 1)
})

const versionStatusLabel: Record<string, string> = {
  0: 'profileDetail.versions.published',
  1: 'profileDetail.versions.prerelease',
  2: 'profileDetail.versions.planned',
}

const versionStatusTagType: Record<string, string> = {
  0: 'success',
  1: 'warning',
  2: 'info',
}

async function fetchData() {
  const { data } = await queryProjectList()
  project.value = data[0] ?? null
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="project-detail-container">
    <Breadcrumb :items="['menu.profile', 'menu.profile.detail']" />

    <div class="detail-wrapper">
      <!-- 模块一：项目进度 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">{{ $t('profileDetail.card.progress') }}</span>
          <TinyTag v-if="project" :type="{ 0: '', 1: 'success', 2: 'primary', 3: 'warning' }[project.projectStatus]">
            {{ $t(projectStatusOptions.find(item => item.value === project?.projectStatus)?.label ?? '') }}
          </TinyTag>
          <span v-else>-</span>
        </div>
        <div class="card-desc">
          {{ project ? `${project.projectName}（${project.projectCode}）` : '-' }}
        </div>
        <TinySteps v-if="project" line :data="stepsData" :active="activeStep" :visible-num="6" class="project-steps" />
        <span v-else>-</span>
      </div>

      <!-- 模块二：基本信息 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">{{ $t('profileDetail.card.basicInfo') }}</span>
        </div>
        <TinyForm class="detail-form" display-only label-position="top">
          <TinyFormItem :label="$t('profileDetail.form.projectName')">
            <TinyInput :model-value="project?.projectName ?? '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.projectCode')">
            <TinyInput :model-value="project?.projectCode ?? '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.projectStatus')">
            <TinySelect :model-value="project ? project.projectStatus : '-'">
              <TinyOption
                v-for="option in projectStatusOptions" :key="option.value" :value="option.value"
                :label="$t(option.label)"
              />
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.priority')">
            <TinySelect :model-value="project ? project.priority : '-'">
              <TinyOption
                v-for="option in priorityOptions" :key="option.value" :value="option.value"
                :label="$t(option.label)"
              />
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.owner')">
            <TinyInput :model-value="project?.owner ?? '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.department')">
            <TinyInput :model-value="project?.department ?? '-'" />
          </TinyFormItem>
        </TinyForm>
      </div>

      <!-- 模块三：周期与资源 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">{{ $t('profileDetail.card.schedule') }}</span>
        </div>
        <TinyForm class="detail-form" display-only label-position="top">
          <TinyFormItem :label="$t('profileDetail.form.startTime')">
            <TinyDatePicker :model-value="project?.startTime ?? '-'" type="date" value-format="yyyy-MM-dd" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.endTime')">
            <TinyDatePicker :model-value="project?.endTime ?? '-'" type="date" value-format="yyyy-MM-dd" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.progress')">
            <TinyNumeric v-if="project" :model-value="project.progress" unit="%" />
            <span v-else>-</span>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.manHours')">
            <TinyNumeric v-if="project" :model-value="project.manHours" unit="人日" />
            <span v-else>-</span>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.budget')">
            <TinyNumeric v-if="project" :model-value="project.budget" unit="万元" />
            <span v-else>-</span>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.teamSize')">
            <TinyNumeric v-if="project" :model-value="project.teamSize" unit="人" />
            <span v-else>-</span>
          </TinyFormItem>
        </TinyForm>
      </div>

      <!-- 模块四：目标与风险 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">{{ $t('profileDetail.card.goalRisk') }}</span>
        </div>
        <TinyForm class="detail-form" display-only label-position="top">
          <TinyFormItem :label="$t('profileDetail.form.goal')">
            <TinyInput :model-value="project?.goal || '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.technology')">
            <TinyInput :model-value="project?.technology || '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.partner')">
            <TinyInput :model-value="project?.partner || '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.riskLevel')">
            <TinySelect :model-value="project?.riskLevel || '-'">
              <TinyOption
                v-for="option in riskOptions" :key="option.value" :value="option.value"
                :label="$t(option.label)"
              />
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.quality')">
            <TinyInput :model-value="project?.quality || '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.remark')">
            <TinyInput :model-value="project?.remark || '-'" type="textarea" />
          </TinyFormItem>
        </TinyForm>
      </div>

      <!-- 模块五：版本发布记录 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">{{ $t('profileDetail.card.versions') }}</span>
        </div>
        <TinyGrid :data="project?.versions ?? []" row-id="id" align="center">
          <TinyGridColumn field="version" :title="$t('profileDetail.versions.version')" width="120" />
          <TinyGridColumn field="date" :title="$t('profileDetail.versions.date')" width="120" />
          <TinyGridColumn field="content" :title="$t('profileDetail.versions.content')" show-overflow />
          <TinyGridColumn field="status" :title="$t('profileDetail.versions.status')" width="100">
            <template #default="{ row }">
              <TinyTag :type="versionStatusTagType[row.status]">
                {{ $t(versionStatusLabel[row.status]) }}
              </TinyTag>
            </template>
          </TinyGridColumn>
          <TinyGridColumn field="owner" :title="$t('profileDetail.versions.owner')" width="110" />
        </TinyGrid>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import './detail.less';
</style>

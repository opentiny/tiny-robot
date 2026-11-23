<script lang="ts" setup>
import {
  Modal,
  Button as TinyButton,
  Col as TinyCol,
  DatePicker as TinyDatePicker,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Layout as TinyLayout,
  Option as TinyOption,
  Row as TinyRow,
  Select as TinySelect,
} from '@opentiny/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAllRole } from '@/api/role'
import { registerUser } from '@/api/user'
import { getSimpleDate } from '@/utils/time'

const props = defineProps({
  statusData: Object,
  projectData: Object,
})

const emit = defineEmits<{
  confirm: []
}>()

// 初始化请求数据
onMounted(() => {
  fetchRole()
})

const { t } = useI18n()

export interface UserAddData {
  email: string
  password: string
  name: string
  address: string
  department: string
  roleIds: number[]
  employeeType
  probationDate: string[]
  probationDuration: string
  protocolStart: Date
  protocolEnd: Date
  status: string
}

// 加载效果
const state = reactive<{
  userData: UserAddData
  roleData: any
}>({
  userData: {},
  roleData: [],
})

const setFormRef = ref()

// 校验规则
const rulesType = {
  required: true,
  trigger: 'blur',
}

const rules = computed(() => {
  return {
    email: [rulesType],
    password: [rulesType],
    name: [rulesType],
  }
})

async function handleSubmit() {
  setFormRef.value
    .validate()
    .then(async () => {
      const data = state.userData
      const newTemp = {
        ...data,
      }
      newTemp.roleIds && (newTemp.roleIds = [data.roleIds])
      newTemp.probationStart && (newTemp.probationStart = getSimpleDate(data.probationDate[0]))
      newTemp.probationEnd && (newTemp.probationEnd = getSimpleDate(data.probationDate[1]))
      newTemp.protocolStart && (newTemp.protocolStart = getSimpleDate(data.protocolStart))
      newTemp.protocolEnd && (newTemp.protocolEnd = getSimpleDate(data.protocolEnd))
      newTemp.status && (newTemp.status = props.statusData.find(item => item.label === data.status).value)

      try {
        await registerUser(newTemp)
        Modal.message({
          message: t('baseForm.form.submit.success'),
          status: 'success',
        })
        state.userData = {}
        emit('confirm')
      }
      catch (error) {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '未知错误'
          Modal.message({
            message: errorMessage,
            status: 'error',
          })
        }
      }
    })
    .catch(() => {})
}

async function fetchRole() {
  const { data } = await getAllRole()
  state.roleData = data
}

// 结束时间校验
function handleBlur() {
  const start = state.userData.protocolStart?.getTime()
  const end = state.userData.protocolEnd?.getTime()
  if (end < start) {
    state.userData.protocolEnd = ''
    Modal.message({
      message: t('userInfo.time.message'),
      status: 'error',
    })
  }
}

defineExpose({
  setUserInfo: (userData) => {
    state.userData = userData
  },
  handleSubmit,
})
</script>

<template>
  <div class="container-set">
    <div class="general-card">
      <div class="general-contain">
        <TinyLayout>
          <TinyForm
            ref="setFormRef"
            :model="state.userData"
            :rules="rules"
            label-width="94px"
            :label-align="true"
            label-position="left"
            overflow-title
          >
            <TinyRow class="flex flex-wrap justify-start">
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem :label="$t('userAdd.email')" prop="email">
                  <TinyInput v-model="state.userData.email" />
                </TinyFormItem>
              </TinyCol>
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem :label="$t('userAdd.password')" prop="password">
                  <TinyInput
                    v-model="state.userData.password"
                    type="password"
                    show-password
                  />
                </TinyFormItem>
              </TinyCol>
            </TinyRow>

            <TinyRow class="flex flex-wrap justify-start">
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem :label="$t('userAdd.name')" prop="name">
                  <TinyInput v-model="state.userData.name" />
                </TinyFormItem>
              </TinyCol>
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem :label="$t('userAdd.address')" prop="address">
                  <TinyInput v-model="state.userData.address" />
                </TinyFormItem>
              </TinyCol>
            </TinyRow>

            <TinyRow class="flex flex-wrap justify-start">
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem
                  :label="$t('userAdd.department')"
                  prop="department"
                >
                  <TinyInput v-model="state.userData.department" />
                </TinyFormItem>
              </TinyCol>
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem :label="$t('userAdd.position')" prop="roleIds">
                  <TinySelect
                    v-model="state.userData.roleIds"
                    :placeholder="$t('baseForm.form.label.placeholder')"
                  >
                    <TinyOption
                      v-for="item in state.roleData as any"
                      :key="item.id"
                      :label="$t(item.name)"
                      :value="item.id"
                    />
                  </TinySelect>
                </TinyFormItem>
              </TinyCol>
            </TinyRow>

            <TinyRow class="flex flex-wrap justify-start">
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem :label="$t('userAdd.type')" prop="employeeType">
                  <TinySelect
                    v-model="state.userData.employeeType"
                    :placeholder="$t('baseForm.form.label.placeholder')"
                  >
                    <TinyOption
                      v-for="item in projectData as any"
                      :key="item.value"
                      :label="$t(item.label)"
                      :value="item.label"
                    />
                  </TinySelect>
                </TinyFormItem>
              </TinyCol>
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem
                  :label="$t('userAdd.date')"
                  prop="probationDate"
                >
                  <TinyDatePicker
                    v-model="state.userData.probationDate"
                    unlink-panels
                    type="daterange"
                    range-separator="-"
                    :start-placeholder="$t('userAdd.first')"
                    :end-placeholder="$t('userAdd.last')"
                  />
                </TinyFormItem>
              </TinyCol>
            </TinyRow>

            <TinyRow class="flex flex-wrap justify-start">
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem
                  :label="$t('userAdd.during')"
                  prop="probationDuration"
                >
                  <TinyInput
                    v-model="state.userData.probationDuration"
                  />
                </TinyFormItem>
              </TinyCol>
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem
                  :label="$t('userAdd.startTime')"
                  prop="protocolStart"
                >
                  <TinyDatePicker
                    v-model="state.userData.protocolStart"
                    @blur="handleBlur"
                  />
                </TinyFormItem>
              </TinyCol>
            </TinyRow>

            <TinyRow class="flex flex-wrap justify-start">
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem
                  :label="$t('userAdd.endTime')"
                  prop="protocolEnd"
                >
                  <TinyDatePicker
                    v-model="state.userData.protocolEnd"
                    @blur="handleBlur"
                  />
                </TinyFormItem>
              </TinyCol>
              <TinyCol class="w-1/2 max-sm:w-full" label-width="100px">
                <TinyFormItem :label="$t('userAdd.status')" prop="status">
                  <TinySelect
                    v-model="state.userData.status"
                    :placeholder="$t('baseForm.form.label.placeholder')"
                  >
                    <TinyOption
                      v-for="item in statusData as any"
                      :key="item.value"
                      :label="$t(item.label)"
                      :value="item.label"
                    />
                  </TinySelect>
                </TinyFormItem>
              </TinyCol>
            </TinyRow>
          </TinyForm>
        </TinyLayout>

        <div class="general-btn">
          <TinyButton
            size="small"
            type="primary"
            native-type="submit"
            round
            @click="handleSubmit"
          >
            {{ $t('userAdd.save') }}
          </TinyButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
  .container-set {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: inherit;

  .general-card {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    border-radius: 10px;

    .general-top {
      display: flex;
      justify-content: space-around;
      min-height: 202px;
      margin: 0 -12px;
      overflow: hidden;
      background-image: url('@/assets/images/step-head.png');
      background-size: 100% 100%;
    }

    .general-contain {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 75%;
      padding-bottom: 32px;

      .tiny-layout {
        width: 100%;
      }
    }

    .general-btn {
      position: relative;
      margin: 0 auto;

      button {
        width: 96px;
      }
    }

    .col {
      padding: 4px 0;
      color: #fff;
    }
  }
}
</style>

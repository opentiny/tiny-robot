<script lang="ts" setup>
import {
  Modal,
  Button as TinyButton,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Link as TinyLink,
} from '@opentiny/vue'
import { computed, inject, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { registerUser } from '@/api/user'
import useLoading from '@/hooks/loading'

// 注册
const { t } = useI18n()
const { loading } = useLoading()
const ruleForm = ref()

// 切换模式
const handle: any = inject('handle')
function typeChange() {
  handle(false)
}

const createData = reactive({
  username: '',
  password: '',
  passwordConfirm: '',
})

const isvalidate = ref(true)

// 校验格式
function validatePass(rule: any, value: string, callback: (arg?: Error) => void) {
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value)) {
    callback(new Error(t('login.form.checkPassword')))
  }
  else {
    callback()
  }
}

function validateMail(rule: any, value: string, callback: (arg?: Error) => void) {
  if (!/^(?:\w-*\.*)+@(?:\w-?)+(?:\.\w{2,})+$/.test(value)) {
    callback(new Error(t('login.form.checkUsername')))
  }
  else {
    callback()
  }
}
function validatePassConfirm(rule: any, value: string, callback: (arg?: Error) => void) {
  if (createData.password && createData.password !== value) {
    callback(new Error(t('login.form.confirmPassword')))
  }
  else {
    callback()
  }
}

const rules = computed(() => {
  return {
    username: [
      {
        required: true,
        message: t('login.form.mailName.errMsg'),
        trigger: 'blur',
      },
      { validator: validateMail, trigger: 'blur' },
    ],
    password: [
      {
        required: true,
        message: t('login.form.mailpassword.errMsg'),
        trigger: 'blur',
      },
      { validator: validatePass, trigger: 'blur' },
    ],
    passwordConfirm: [
      {
        required: true,
        message: t('login.form.mailpassword2.errMsg'),
        trigger: 'blur',
      },
      { validator: validatePassConfirm, trigger: 'blur' },
    ],
  }
})

// 注册提交
function handleSubmit() {
  ruleForm.value.validate(async (e: any) => {
    if (e) {
      const data: any = reactive({
        username: createData.username,
        password: createData.password,
      })
      await registerUser(data)
      Modal.message({
        message: t('login.form.registerPass'),
        status: 'success',
      })
      handle(false)
    }
    else {
      Modal.message({
        message: t('login.form.registerError'),
        status: 'warning',
      })
    }
  })
}
</script>

<template>
  <div class="login-register-container">
    <TinyForm
      ref="ruleForm"
      :model="createData"
      :rules="rules"
      :validate-on-rule-change="isvalidate"
      :label-align="true"
      label-position="top"
      label-width="100px"
    >
      <TinyFormItem
        :label="$t('login.form.mailInput')"
        prop="username"
        size="medium"
      >
        <TinyInput
          v-model="createData.username"
          :placeholder="$t('login.form.registerMail.placeholder')"
        />
      </TinyFormItem>
      <TinyFormItem
        :label="$t('login.form.passwordInput')"
        prop="password"
        size="medium"
      >
        <TinyInput
          v-model="createData.password"
          :placeholder="$t('login.form.registerPassword.placeholder')"
          type="password"
          show-password
        />
      </TinyFormItem>
      <TinyFormItem
        :label="$t('login.form.passwordConfirm')"
        prop="passwordConfirm"
        size="medium"
      >
        <TinyInput
          v-model="createData.passwordConfirm"
          :placeholder="$t('login.form.registerConfirmPassword.placeholder')"
          type="password"
          show-password
        />
      </TinyFormItem>

      <div class="login-form-options">
        <TinyLink type="primary" @click="typeChange">
          {{ $t('login.form.change') }}
        </TinyLink>
      </div>

      <TinyFormItem size="medium">
        <TinyButton
          type="primary"
          class="login-form-btn"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ $t('login.form.register') }}
        </TinyButton>
      </TinyFormItem>
    </TinyForm>
  </div>
</template>

<style lang="less" scoped>
.login-register-container {
  margin-top: -6%;
  margin-left: 6%;

  .tiny-form-item {
    margin-bottom: 20px;
  }

  &-container {
    width: 320px;
  }

  .login-form-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    margin-left: 65%;
  }

  .login-form-btn {
    display: block;
    width: 100%;
    max-width: 100%;
  }
}

// responsive
@media (max-width: @screen-ms) {
  .login-register-container {
    margin-top: -10%;

    .tiny-form-item {
      margin-bottom: 5px;
    }

    .login-form-options {
      margin-bottom: 10px;
      margin-left: 50%;
    }
  }
}

@media (max-height: @screen-xs) {
  .login-register-container {
    margin-top: -15%;
  }
}
</style>

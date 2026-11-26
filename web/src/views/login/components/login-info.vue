<script lang="ts" setup>
import {
  Modal,
  Notify,
  Button as TinyButton,
  Checkbox as TinyCheckbox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Link as TinyLink,
} from '@opentiny/vue'
import { computed, inject, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useLoading from '@/hooks/loading'
import { useUserStore } from '@/store'
import { resolvePostLoginLocation } from '@/utils/app-location'

const router = useRouter()
const { t } = useI18n()
const { loading, setLoading } = useLoading()
const userStore = useUserStore()
const loginFormInfo = ref()

const rules = computed(() => {
  return {
    username: [
      {
        required: true,
        message: t('login.form.userName.errMsg'),
        trigger: 'change',
      },
    ],
    password: [
      {
        required: true,
        message: t('login.form.password.errMsg'),
        trigger: 'change',
      },
    ],
  }
})

const loginInfo = reactive({
  username: 'admin@no-reply.com',
  password: 'admin',
  rememberPassword: true,
})

// 切换模式
const handle: any = inject('handle')
function typeChange() {
  handle(true)
}

function handleSubmit() {
  loginFormInfo.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    setLoading(true)

    try {
      await userStore.login({
        email: loginInfo.username,
        password: loginInfo.password,
      })
      Modal.message({
        message: t('login.form.login.success'),
        status: 'success',
      })

      const { redirect } = router.currentRoute.value.query
      await router.replace(resolvePostLoginLocation(redirect))
    }
    catch {
      Notify({
        type: 'error',
        title: t('login.tip.right'),
        message: t('login.tip.info'),
        position: 'top-right',
        duration: 2000,
        customClass: 'my-custom-cls',
      })
    }
    finally {
      setLoading(false)
    }
  })
}
</script>

<template>
  <div class="login-form-container">
    <TinyForm
      ref="loginFormInfo"
      :model="loginInfo"
      class="login-form"
      :rules="rules"
      validate-type="text"
      label-width="0"
      size="medium"
    >
      <TinyFormItem prop="username" size="medium">
        <TinyInput
          v-model="loginInfo.username"
          :placeholder="$t('login.form.userName.placeholder')"
        />
      </TinyFormItem>

      <TinyFormItem prop="password" size="medium">
        <TinyInput
          v-model="loginInfo.password"
          type="password"
          show-password
          :placeholder="$t('login.form.password.placeholder')"
        />
      </TinyFormItem>

      <div class="login-form-options">
        <TinyCheckbox>{{ $t('login.form.rememberPassword') }}</TinyCheckbox>
        <div>
          <TinyLink type="primary">
            {{ $t('login.form.forgetPassword') }}
          </TinyLink>
          <TinyLink type="primary" class="divide-line">
            |
          </TinyLink>
          <TinyLink type="primary" @click="typeChange">
            {{ $t('login.form.registration') }}
          </TinyLink>
        </div>
      </div>

      <TinyFormItem size="medium">
        <TinyButton
          type="primary"
          class="login-form-btn"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ $t('login.form.login') }}
        </TinyButton>
      </TinyFormItem>
    </TinyForm>
  </div>
</template>

<style lang="less" scoped>
.login-form-container {
  margin-top: 5%;
}

.login-form {
  margin-left: 6%;

  .tiny-form-item {
    margin-bottom: 20px;
  }

  &-container {
    width: 320px;
  }

  &-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 12px;
  }

  &-btn {
    display: block;
    width: 100%;
    max-width: 100%;
  }
}

.divide-line {
  margin: 0 5px;
}

// responsive
@media (max-width: @screen-ms) {
  .login-form {
    margin-left: 5%;

    &-container {
      width: 240px;
    }
  }
}
</style>

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
import { AxiosError } from 'axios'
import { computed, inject, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useRouter,
} from 'vue-router'
import useLoading from '@/hooks/loading'
import { registerHiddenSubRoutes, toRoutes } from '@/router/guard/menu'
import { useUserStore } from '@/store'
import { useLocales } from '@/store/modules/locales'
import { useMenuStore } from '@/store/modules/router'
import { resolvePostLoginLocation } from '@/utils/app-location'

const router = useRouter()
const { t, mergeLocaleMessage } = useI18n()
const { loading, setLoading } = useLoading()
const userStore = useUserStore()
const menuStore = useMenuStore()
const localeStore = useLocales()
const loginFormMail = ref()

const rules = computed(() => {
  return {
    mailname: [
      {
        required: true,
        message: t('login.form.mailName.errMsg'),
        trigger: 'change',
      },
    ],
    mailpassword: [
      {
        required: true,
        message: t('login.form.mailpassword.errMsg'),
        trigger: 'change',
      },
    ],
  }
})

const loginMail = reactive({
  mailname: 'admin@no-reply.com',
  mailpassword: 'admin',
  rememberPassword: true,
})

// 切换模式
const handle: any = inject('handle')
function typeChange() {
  handle(true)
}

function handleSubmit() {
  loginFormMail.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }

    setLoading(true)

    try {
      await userStore.login({
        email: loginMail.mailname,
        password: loginMail.mailpassword,
      })
      Modal.message({
        message: t('login.form.login.success'),
        status: 'success',
      })

      try {
        await localeStore.fetchLocalTable()
        const entries = Object.entries(localeStore.localTable)
        for (let i = 0; i < entries.length; i += 1) {
          const key = entries[i][0]
          const messages = entries[i][1]
          mergeLocaleMessage(key, messages)
        }
        localeStore.$patch({
          shouldMerge: false,
        })
      }
      catch (e) {
        // 模拟登录或后端不可用时忽略，使用前端内置语言包
        if (import.meta.env.DEV) console.warn('[mock-login] 语言包拉取失败，使用内置词条', e)
      }

      try {
        await menuStore.getMenuList()
      }
      catch (e) {
        // 模拟登录或后端不可用时忽略，仅使用静态路由
        if (import.meta.env.DEV) console.warn('[mock-login] 菜单拉取失败，仅使用静态路由', e)
      }
      const routes = toRoutes(menuStore.menuList)

      routes.forEach((route) => {
        if (!router.hasRoute(route.name)) {
          router.addRoute('root', route)
        }
      })
      registerHiddenSubRoutes(router)

      const route = router.currentRoute
      const { redirect } = route.value.query
      const target = resolvePostLoginLocation(redirect)
      if ('name' in target && target.name && !router.hasRoute(target.name)) {
        const [routerItem] = router.getRoutes().filter((routeItem) => {
          return (
            routeItem.name
            && !['login', 'notFound', 'redirect', 'preview', 'root'].includes(routeItem.name.toString())
            && routeItem.children.length === 0
          )
        })
        if (!routerItem) {
          Notify({
            type: 'error',
            message: t('router.not-exists-valid-route'),
            duration: 2000,
          })
          return
        }
        router.replace({ name: routerItem.name.toString() })
        return
      }

      router.replace(target)
    }
    catch (err) {
      let title = t('login.tip.right')
      let message = t('login.tip.mail')
      if (err instanceof AxiosError) {
        if (err.status === 500) {
          message = t('http.error.InternalError')
          title = undefined
        }
      }
      Notify({
        type: 'error',
        title,
        message,
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
      ref="loginFormMail"
      :model="loginMail"
      class="login-form"
      :rules="rules"
      validate-type="text"
      label-width="0"
      size="medium"
    >
      <TinyFormItem prop="mailname" size="medium">
        <TinyInput
          v-model="loginMail.mailname"
          :placeholder="$t('login.form.mailName.placeholder')"
        />
      </TinyFormItem>

      <TinyFormItem prop="mailpassword" size="medium">
        <TinyInput
          v-model="loginMail.mailpassword"
          type="password"
          show-password
          :placeholder="$t('login.form.mailpassword.placeholder')"
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

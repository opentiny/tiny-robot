<script lang="ts" setup>
import {
  Button as TinyButton,
  Col as TinyCol,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Layout as TinyLayout,
  Modal as TinyModal,
  Row as TinyRow,
  UserHead as TinyUserHead,
} from '@opentiny/vue'
import { iconCheckOut, iconEdit, iconUser } from '@opentiny/vue-icon'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { updatePwdUser } from '@/api/user'
import Theme from '@/components/theme/index.vue'
import useLocale from '@/hooks/locale'
import { useResponsive, useResponsiveSize } from '@/hooks/responsive'
import useUser from '@/hooks/user'
import { LOCALE_OPTIONS } from '@/locale'
import router from '@/router'
import { useAppStore, useUserStore } from '@/store'
import { getToken } from '@/utils/auth'

const i18 = useI18n()
const { t } = useI18n()
const lan = ref(false)

// 检查是否启用低代码设计器
const isLowcodeDesignerEnabled = computed(() => {
  return import.meta.env.VITE_LOWCODE_DESIGNER_ENABLED === 'true'
})

const appStore = useAppStore()
const userStore = useUserStore()
const { logout } = useUser()
const { changeLocale } = useLocale()
const locales = [...LOCALE_OPTIONS]
const { lg } = useResponsive()
const { modalSize } = useResponsiveSize()

const IconCheckOut = iconCheckOut()
const IconEdit = iconEdit()
const IconUser = iconUser()

const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

const state = reactive<{
  isPwdUpdate: boolean
  pwdData: any
}>({
  isPwdUpdate: false,
  pwdData: {} as any,
})

// 切换语言
function changeLan() {
  lan.value = !lan.value
}
function help() {
  window.open('https://opentiny.design/vue-pro/docs/start', '_blank', 'noopener,noreferrer')
}

// 设置页面显示
function setVisible() {
  appStore.updateSettings({ Settings: true })
}

// 设计器
function openLowCodeDesigner() {
  // 支持通过环境变量配置设计器链接，默认为开发环境地址
  const designerUrl = import.meta.env.VITE_LOWCODE_DESIGNER_URL || 'http://localhost:8090'
  window.open(`${designerUrl}/?type=app&id=1&tenant=1&pageid=1`, '_blank')
}

// 用户设置
const userlist = [
  { label: 'messageBox.userCenter', value: 1 },
  { label: 'messageBox.updatePwd', value: 2 },
  { label: 'messageBox.logout', value: 3 },
]

// 校验规则
const rulesType = {
  required: true,
  trigger: 'blur',
}
const rules = computed(() => {
  return {
    oldPassword: [rulesType],
    newPassword: [rulesType],
    confirmNewPassword: [rulesType],
  }
})

function switchUser(e: number) {
  switch (e) {
    case 1:
      router.push({ name: 'Info' })
      break
    case 2:
      handlePwdUpdate()
      break
    case 3:
      logout()
      break
    default:
  }
}

// 点击图标跳转首页
function jumpUrl() {
  window.location.href = `${window.location.protocol}//${window.location.host}`
}

function handlePwdUpdate() {
  state.isPwdUpdate = true
}

function handlePwdUpdateCancel() {
  state.isPwdUpdate = false
  state.pwdData = {} as any
}

// 页面主题
const disTheme = ref(false)
function themeVisible() {
  disTheme.value = !disTheme.value
}

async function handlePwdUpdateSubmit() {
  const data = state.pwdData
  const newTemp = {
    email: userStore.userInfo.email,
    token: getToken(),
    newPassword: data.newPassword,
    confirmNewPassword: data.confirmNewPassword,
    oldPassword: data.oldPassword,
  }
  if (newTemp.newPassword !== newTemp.confirmNewPassword) {
    TinyModal.message({
      message: t('userInfo.modal.message.error'),
      status: 'error',
    })
  }
  else {
    try {
      await updatePwdUser(newTemp)
      TinyModal.message({
        message: t('baseForm.form.submit.success'),
        status: 'success',
      })
      state.pwdData = {} as any
      state.isPwdUpdate = false
      logout()
    }
    catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || '未知错误'
        TinyModal.message({
          message: errorMessage,
          status: 'error',
        })
      }
    }
  }
}
</script>

<template>
  <div class="navbar">
    <div class="left-side">
      <div style="display: flex; align-items: center">
        <img class="max-lg:w-[38px]" src="@/assets/images/opentiny-logo.png" alt="logo" @click="jumpUrl">
        <h5 @click="jumpUrl">
          OpenTiny
        </h5>
        <div v-if="!lg" class="divider" />
        <img v-if="!lg" class="vue-icon" alt="logo" src="@/assets/images/pro.png">
        <h4 v-if="!lg">
          TinyPro of Vue
        </h4>
      </div>
    </div>
    <div class="navbar-right">
      <button class="menu-toggle" @click="toggleMenu">
        ☰
      </button>

      <ul class="right-side" :class="{ open: menuOpen }">
        <li>
          <input id="navbar-search" class="input-icon" :placeholder="$t('setting.input.search')">
        </li>
        <li v-if="!lg">
          <div class="divider" />
        </li>
        <li class="lan-item" @click="changeLan">
          <span v-if="i18.locale.value === 'zhCN'">中文</span>
          <span v-else>English</span>
          <img src="@/assets/images/lan.png" alt="lan" class="navbar-lan">
          <div v-if="lan" class="trigger-lan">
            <li
              v-for="(item, index) in locales" :key="index" :value="item.value"
              @click="changeLocale(locales[index].value)"
            >
              {{ item.label }}
            </li>
          </div>
        </li>

        <li>
          <span @click="help">{{ $t('settings.navbar.help') }}</span>
        </li>
        <li>
          <span @click="setVisible">{{ $t('settings.title') }}</span>
        </li>
        <li>
          <span @click="themeVisible">{{ $t('theme.title.first') }}</span>
        </li>
        <li v-if="isLowcodeDesignerEnabled">
          <span @click="openLowCodeDesigner">设计器</span>
        </li>
        <li class="navbar-user">
          <TinyUserHead type="icon" round min>
            <div class="user-image">
              <img src="@/assets/images/avatar.png" alt="user">
            </div>
          </TinyUserHead>
          <div class="trigger-user">
            <li
              v-for="(item, index) in userlist"
              :key="index"
              :value="item.label"
              @click="switchUser(item.value)"
            >
              <IconUser v-if="item.value === 1" />
              <IconCheckOut v-if="item.value === 2" />
              <IconEdit v-if="item.value === 3" />
              {{ $t(item.label) }}
            </li>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <div v-if="state.isPwdUpdate">
    <TinyModal
      v-model="state.isPwdUpdate" :lock-scroll="true" show-header show-footer :mask-closable="true"
      height="auto" :width="modalSize" :title="$t('userInfo.modal.title.pwdUpdate')"
    >
      <template #default>
        <TinyLayout>
          <TinyForm :model="state.pwdData" :rules="rules" label-width="120px" :label-align="true" label-position="left">
            <TinyRow :flex="true">
              <TinyCol :span="10" label-width="100px">
                <TinyFormItem :label="$t('userInfo.table.email')">
                  <label>{{ userStore.userInfo.email }}</label>
                </TinyFormItem>
              </TinyCol>
            </TinyRow>

            <TinyRow :flex="true">
              <TinyCol :span="10" label-width="100px">
                <TinyFormItem :label="$t('userInfo.modal.input.oldPassword')" prop="oldPassword">
                  <TinyInput v-model="state.pwdData.oldPassword" type="password" show-password />
                </TinyFormItem>
              </TinyCol>
            </TinyRow>

            <TinyRow :flex="true">
              <TinyCol :span="10" label-width="100px">
                <TinyFormItem :label="$t('userInfo.modal.input.newPassword')" prop="newPassword">
                  <TinyInput v-model="state.pwdData.newPassword" type="password" show-password />
                </TinyFormItem>
              </TinyCol>
            </TinyRow>

            <TinyRow :flex="true">
              <TinyCol :span="10" label-width="100px">
                <TinyFormItem :label="$t('userInfo.modal.input.confirmNewPassword')" prop="confirmNewPassword">
                  <TinyInput v-model="state.pwdData.confirmNewPassword" type="password" show-password />
                </TinyFormItem>
              </TinyCol>
            </TinyRow>
          </TinyForm>
        </TinyLayout>
      </template>
      <template #footer>
        <TinyButton type="primary" @click="handlePwdUpdateSubmit">
          {{ $t('menu.btn.confirm') }}
        </TinyButton>
        <TinyButton @click="handlePwdUpdateCancel">
          {{ $t('menu.btn.cancel') }}
        </TinyButton>
      </template>
    </TinyModal>
  </div>
  <div v-if="disTheme">
    <TinyModal
      v-model="disTheme" show-header show-footer :title="$t('theme.title.main')" :mask-closable="true"
      height="900" :width="modalSize"
    >
      <template #default>
        <Theme />
      </template>
      <template #footer />
    </TinyModal>
  </div>
</template>

<style scoped lang="less">
.navbar {
  display: flex;
  justify-content: space-between;
  height: 100%;
  background-color: #fff;
  border-bottom: 1px solid #dbdbdb;
}

#navbar-search {
  width: 159px;
  height: 30px;
  padding: 14px;
  background-color: #eff1f7;
  background-position: 130px 8px;
  border: none;
  border-radius: 16px;
  outline: none;
}

.input-icon {
  background: url('@/assets/images/search.png') no-repeat scroll right center transparent;
}

.divider {
  width: 1px;
  height: 18px;
  margin: 0 2px;
  margin-top: 1px;
  background: #dfe1e6;
}

.left-side {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding-left: 10px;
  cursor: pointer;

  .vue-icon {
    width: 24px;
    height: 24px;
    margin-left: 30px;
  }

  h5 {
    margin: 0 30px 0 12px;
    color: var(--tv-base-common-title-color);
    font-weight: 700;
    font-size: 22px;
    line-height: 32px;
    letter-spacing: 0.55px;
  }

  h4 {
    width: 135px;
    height: 22px;
    margin-left: 10px;
    color: var(--tv-base-common-title-color);
    font-weight: normal;
    font-size: 16px;
    line-height: 22px;
    text-align: left;
  }
}

.navbar-right {
  position: relative;
}

// 组件无法固定非message的modal类型距离顶部距离
:deep(.tiny-modal__box) {
  top: 8px !important;
}

.menu-toggle {
  display: none;
  width: 60px;
  height: 60px;
  background: none;
  border: none;
}

.right-side {
  display: flex;
  height: 60px;
  padding-right: 20px;
  list-style: none;

  :deep(.locale-select) {
    border-radius: 20px;
  }

  li {
    display: flex;
    align-items: center;
    padding: 0 15px;

    .item {
      display: inline-block;
      margin: 4px;
    }

    span {
      cursor: pointer;
    }

    span:hover {
      color: #2f5bea;
    }

    .navbar-lan {
      padding: 2px 0 0 2px;
    }
  }

  .user-image {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-weight: 600;
    font-size: 2em;
    font-style: oblique;
    cursor: pointer;
    fill: var(--tv-common-color-line-active);
  }

  a {
    color: var(--color-text-1);
    text-decoration: none;
  }

  .trigger-lan {
    position: absolute;
    bottom: -44px;
    width: 100px;
    margin-left: -35px;
  }

  .navbar-user:hover > .trigger-user {
    display: inline-block;
  }

  .trigger-user {
    position: absolute;
    bottom: -75px;
    display: none;
    width: 100px;
    margin-left: -43px;
  }

  .trigger-user:hover {
    display: inline-block;
  }

  .trigger-user {
    li {
      display: flex;
      justify-content: space-around;
      padding: 6px;
      font-size: 12px;
      text-align: center;
      list-style-type: none;
      background-color: #fff;
      box-shadow: 0 0 2px 2px var(--tv-common-color-bg-normal);
      cursor: pointer;
    }

    li:hover {
      color: #2f5bea;
      background-color: #f5f6f7;
    }
  }

  .trigger-lan {
    li {
      display: block;
      padding: 6px;
      font-size: 12px;
      text-align: center;
      list-style-type: none;
      background-color: #fff;
      box-shadow: 0 0 2px 2px var(--tv-common-color-bg-normal);
      cursor: pointer;
    }

    li:hover {
      color: #2f5bea;
      background-color: #f5f6f7;
    }
  }
}

// 移动端显示折叠按钮，隐藏右侧菜单
@media (max-width: 768px) {
  // 折叠按钮
  .menu-toggle {
    display: block;
    font-size: 20px;
    background: none;
    border: none;
    cursor: pointer;
    margin-left: auto;
  }

  .navbar-user {
    position: relative;

    &:hover {
      .trigger-user {
        display: block; // 保持 hover 时显示
      }
    }

    .trigger-user {
      position: absolute;
      top: 100%; // 相对父元素定位
      left: 0;
      display: none;
      width: 120px;
      background-color: #fff;
      box-shadow: 0 0 2px 2px var(--tv-common-color-bg-normal);
      border-radius: 6px;
      z-index: 1000;
    }
  }

  .right-side {
    position: absolute;
    top: 100%;
    right: 0;
    flex-direction: column;
    height: auto;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 10px;
    display: none;
    z-index: 999;

    &.open {
      display: flex;
    }

    > li {
      margin: 8px 0;

      &.lan-item {
        position: relative;

        // 下拉菜单
        .trigger-lan {
          position: absolute;
          top: 100%;
          left: 0;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 6px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 6px 0;
          min-width: 100px;
          z-index: 1000;

          li {
            padding: 6px 12px;
            cursor: pointer;

            &:hover {
              background: #f5f5f5;
            }
          }
        }
      }
    }
  }
}
</style>

<script lang="ts" setup>
import {
  Col as TinyCol,
  Layout as TinyLayout,
  Row as TinyRow,
} from '@opentiny/vue'
import { useUserStore } from '@/store'

const userStore = useUserStore()
</script>

<template>
  <div class="user w-[16%] max-md:ml-[5%] max-sm:mt-[5%] max-md:w-[25%] max-sm:w-[100%] max-sm:justify-center max-sm:gap-6">
    <transition-fade-down-group>
      <img src="@/assets/images/user-head.png" alt="user" class="user-image max-md:h-[50%] max-sm:h-[70%]">
      <div>
        <transition-fade-down-group>
          <h3 class="user-name pl-[26px] text-[18px] max-sm:pl-[0px]">
            {{ $t('stepForm.head.admin') }}
          </h3>
          <h3 class="user-name pl-[26px] text-[18px] max-sm:pl-[0px]">
            {{ userStore.userInfo.name }}
          </h3>
        </transition-fade-down-group>
      </div>
    </transition-fade-down-group>
  </div>
  <div class="divider max-sm:smx-auto my-auto h-[50%] w-[1px] max-md:mx-[2%] max-sm:my-[2%] max-sm:h-[1px] max-sm:w-[60%]" />
  <div class="user-content pb-[8px] max-sm:mt-[10px] max-sm:pb-[20px]">
    <TinyLayout :cols="12">
      <TinyRow justify="center" class="margin-bottom flex flex-wrap">
        <transition-fade-down-group>
          <TinyCol class="w-[calc((100%-140px)/3)] flex max-md:w-[calc((100%-94px)/2)] max-sm:w-[calc(100%-50px)]" :span="4">
            <img src="@/assets/images/head-1.png" class="head-image">
            <div class="col">
              <div>{{ $t('stepForm.recruitment.department') }}</div>
              <div class="space" />
              <div>{{ userStore.userInfo.department }}</div>
            </div>
          </TinyCol>
          <TinyCol class="w-[calc((100%-140px)/3)] flex max-md:w-[calc((100%-94px)/2)] max-sm:w-[calc(100%-50px)]" :span="4">
            <img src="@/assets/images/head-2.png" class="head-image">
            <div class="col">
              <div>{{ $t('stepForm.recruitment.type') }}</div>
              <div class="space" />
              <div>{{ userStore.userInfo.employeeType }}</div>
            </div>
          </TinyCol>
          <TinyCol class="w-[calc((100%-140px)/3)] flex max-md:w-[calc((100%-94px)/2)] max-sm:w-[calc(100%-50px)]" :span="4">
            <img src="@/assets/images/head-3.png" class="head-image">
            <div class="col">
              <div>{{ $t('stepForm.recruitment.position') }}</div>
              <div class="space" />
              <div>{{ userStore.userInfo.job }}</div>
            </div>
          </TinyCol>
        </transition-fade-down-group>
      </TinyRow>
      <TinyRow justify="center" class="margin-bottom flex flex-wrap">
        <transition-fade-down-group>
          <TinyCol class="w-[calc((100%-140px)/3)] flex max-md:w-[calc((100%-94px)/2)] max-sm:w-[calc(100%-50px)]" :span="4">
            <img src="@/assets/images/head-4.png" class="head-image">
            <div class="col">
              <div>{{ $t('stepForm.probation.start') }}</div>
              <div class="space" />
              <div>
                {{ userStore.userInfo.probationStart }}
                ~
                {{ userStore.userInfo.probationEnd }}
              </div>
            </div>
          </TinyCol>
          <TinyCol class="w-[calc((100%-140px)/3)] flex max-md:w-[calc((100%-94px)/2)] max-sm:w-[calc(100%-50px)] max-sm:flex-col" :span="4">
            <img src="@/assets/images/head-5.png" class="head-image">
            <div class="col">
              <div>{{ $t('stepForm.start.date') }}</div>
              <div class="space" />
              <div>{{ userStore.userInfo.protocolStart }}</div>
            </div>
          </TinyCol>
          <TinyCol class="w-[calc((100%-140px)/3)] flex max-md:w-[calc((100%-94px)/2)] max-sm:w-[calc(100%-50px)] max-sm:flex-col" :span="4">
            <img src="@/assets/images/head-6.png" class="head-image">
            <div class="col">
              <div>{{ $t('stepForm.probation.period') }}</div>
              <div class="space" />
              <div>
                {{ userStore.userInfo.probationDuration
                }}{{ $t('stepForm.probation.day') }}
              </div>
            </div>
          </TinyCol>
        </transition-fade-down-group>
      </TinyRow>
    </TinyLayout>
  </div>
</template>

<style scoped lang="less">
.user-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 66%;
}

.divider {
  background: #fff;
  opacity: 0.3;
}

.user {
  display: flex;
  align-items: center;
}

.user-image {
  font-style: oblique;
  border-radius: 60px;
  fill: var(--tv-common-color-line-active);
}

.space {
  height: 10px;
}

.head-image {
  margin-top: 6px;
  padding-right: 10px;
  margin-bottom: 10px;
}

.user-name {
  color: #fff;
  font-weight: 600;
}

.margin-bottom {
  margin-top: 15px;
  margin-bottom: 15px;
}

.col {
  color: #fff;
}
</style>

<style lang="less" scoped>
</style>

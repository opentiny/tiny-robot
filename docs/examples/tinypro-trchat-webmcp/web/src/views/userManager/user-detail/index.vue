<script lang="ts" setup>
import { reactive } from 'vue'
import { getUserInfo } from '@/api/user'

const props = defineProps({
  email: String,
  statusMap: {
    type: Object,
    default: () => ({}),
  },
})

// 初始化请求数据
fetchData(props.email)

const state = reactive<{
  userData: any
}>({
  userData: {} as any,
})

async function fetchData(email: string) {
  if (email) {
    const { data } = await getUserInfo(email)
    if (data.role && data.role.length) {
      data.roleIds = data.role[0].id
      data.roleName = data.role[0].name
    }
    state.userData = data
    state.userData.probationDate = [data.probationStart, data.probationEnd]
  }
}
</script>

<template>
  <ul class="tiny-info-expand">
    <li>
      <span class="title">{{ $t('userInfo.table.id') }}：</span>
      <span class="desc">{{ state.userData.id }}</span>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.name') }}：</span><!-- 使用一个ref来控制输入框的显示与隐藏 -->
      <span class="desc">{{ state.userData.name }}</span>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.email') }}：</span>
      <span class="desc">{{ state.userData.email }}</span>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.department') }}：</span>
      <span class="desc">{{ state.userData.department }}</span>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.employeeType') }}：</span>
      <span class="desc">{{ state.userData.employeeType }}</span>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.job') }}：</span>
      <span v-if="state.userData.role && state.userData.role[0]" class="desc">{{ state.userData.role[0].name }}</span>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.probationStart') }}：</span>
      <span class="desc">{{ state.userData.probationStart }}</span>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.probationEnd') }}：</span>
      <span class="desc">{{ state.userData.probationEnd }}</span>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.probationDuration') }}：</span>
      <span class="desc">{{ state.userData.probationDuration }}{{ $t('userInfo.day') }}</span>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.address') }}：</span>
      <span class="desc">{{ state.userData.address }}</span>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.status') }}：</span>
      <span class="desc">{{ statusMap[state.userData.status] }}</span>
    </li>
  </ul>
</template>

<style scoped lang="less">
.tiny-info-expand {
  display: flex;
  flex-wrap: wrap;
  list-style-type: none;
  padding: 0;

  li {
    width: calc(16.666% - 10px); // 一行显示6个li，留出间距
    margin: 5px;
    line-height: 1.5;

    span {
      display: block;
    }

    .title {
      color: rgb(128, 128, 128);
    }

    .desc {
      margin-top: 8px;
      white-space: normal;
      word-break: break-word;
    }
  }

  // 给第七个往后的li增加margin-top:16px;
  li:nth-child(n + 7) {
    margin-top: 16px;
  }
}
</style>

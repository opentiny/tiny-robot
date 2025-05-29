<template>
  <TrSuggestionPills>
    <TrSuggestionPillButton>
      <template #icon>
        <IconSparkles style="font-size: 16px; color: #1476ff" />
      </template>
    </TrSuggestionPillButton>
    <TrSuggestionPillButton>资源管理</TrSuggestionPillButton>
    <TrSuggestionPillButton>
      <template #icon>
        <IconSparkles style="font-size: 16px; color: #1476ff" />
      </template>
      费用查询
    </TrSuggestionPillButton>
    <TrSuggestionPillButton>资源管理</TrSuggestionPillButton>
  </TrSuggestionPills>
  <hr />
  <TrSuggestionPills v-model:show-more="showMore">
    <TrSuggestionPillButton>
      <template #icon>
        <IconSparkles style="font-size: 16px; color: #1476ff" />
      </template>
    </TrSuggestionPillButton>
    <TrSuggestionPillButton>资源管理</TrSuggestionPillButton>
    <TrSuggestionPillButton>
      <template #icon>
        <IconSparkles style="font-size: 16px; color: #1476ff" />
      </template>
      费用查询
    </TrSuggestionPillButton>
    <TrSuggestionPillButton>资源管理</TrSuggestionPillButton>
    <TrSuggestionPillButton>费用查询</TrSuggestionPillButton>
    <TrSuggestionPillButton>资源管理</TrSuggestionPillButton>
    <TrSuggestionPillButton>费用查询</TrSuggestionPillButton>
    <TrSuggestionPillButton>资源管理</TrSuggestionPillButton>
  </TrSuggestionPills>
  <hr />
  <div>
    <label>手动控制显示更多：</label>
    <tiny-switch v-model="showMore"></tiny-switch>
  </div>
</template>

<script setup lang="ts">
import { TrSuggestionPillButton, TrSuggestionPills } from '@opentiny/tiny-robot'
import { IconSparkles } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { ref } from 'vue'

const showMore = ref(false)
</script>

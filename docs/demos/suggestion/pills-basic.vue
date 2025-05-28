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
    <TrSuggestionPillButton>费用查询</TrSuggestionPillButton>
    <TrSuggestionPillButton>资源管理</TrSuggestionPillButton>
    <TrSuggestionPillButton>费用查询</TrSuggestionPillButton>
    <TrSuggestionPillButton>资源管理</TrSuggestionPillButton>
  </TrSuggestionPills>
</template>

<script setup lang="ts">
import { TrSuggestionPillButton, TrSuggestionPills } from '@opentiny/tiny-robot'
import { IconSparkles } from '@opentiny/tiny-robot-svgs'
</script>

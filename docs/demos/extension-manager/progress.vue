<script setup lang="ts">
import { TrExtensionCard } from '@opentiny/tiny-robot'
</script>

<template>
  <tr-extension-card name="知识库同步" description="已同步 64% 的资料。" :progress="64" />
  <tr-extension-card name="本地索引" description="正在准备搜索索引。" progress="indeterminate" />
  <tr-extension-card name="范围限制" description="超过范围的数值会显示为 100%。" :progress="160" />
</template>

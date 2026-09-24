<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string
    description?: string
    badges?: string[]
  }>(),
  {
    description: '',
    badges: () => [],
  },
)
</script>

<template>
  <div class="extension-detail-summary">
    <dl class="extension-detail-summary__content">
      <div class="extension-detail-summary__row">
        <dt>名称：</dt>
        <dd>{{ name }}</dd>
      </div>
      <div class="extension-detail-summary__row">
        <dt>描述：</dt>
        <dd>{{ description || '暂无描述' }}</dd>
      </div>
    </dl>

    <div v-if="badges.length" class="extension-detail-summary__metadata" aria-label="扩展元数据">
      <span v-for="badge in badges" :key="badge" class="extension-detail-summary__badge">{{ badge }}</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.extension-detail-summary__content {
  margin: 0 0 8px;
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.extension-detail-summary__row {
  display: flex;
  gap: 4px;
}

.extension-detail-summary__row dt {
  flex: none;
}

.extension-detail-summary__row dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}

.extension-detail-summary__metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.extension-detail-summary__badge {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--tr-container-bg-hover);
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 18px;
}
</style>

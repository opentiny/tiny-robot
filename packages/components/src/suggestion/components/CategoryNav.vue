<script setup lang="ts">
import { PropType } from 'vue'
import { Category } from '../index.type'

defineProps({
  categories: {
    type: Array as PropType<Category[]>,
    required: true,
  },
  activeCategory: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['category-select'])

const handleCategorySelect = (categoryId: string) => {
  emit('category-select', categoryId)
}
</script>

<template>
  <div class="tr-suggestion-categories">
    <div
      v-for="category in categories"
      :key="category.id"
      class="tr-suggestion-categories-item"
      :class="{ active: activeCategory === category.id }"
      @click="handleCategorySelect(category.id)"
    >
      <slot name="category-label" :category="category">
        <div class="category-icon" v-if="category.icon">{{ category.icon }}</div>
        <span>{{ category.label }}</span>
      </slot>
    </div>
  </div>
</template>

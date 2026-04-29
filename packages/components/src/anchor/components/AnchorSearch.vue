<script setup lang="ts">
import type { AnchorSearchEmits, AnchorSearchProps } from '../internal.type'

defineOptions({ name: 'AnchorSearch' })

const props = defineProps<AnchorSearchProps>()
const emit = defineEmits<AnchorSearchEmits>()
</script>

<template>
  <input
    class="tr-anchor__search"
    type="search"
    :value="props.searchQuery"
    :placeholder="props.searchOptions?.placeholder ?? 'Search'"
    :aria-label="props.searchOptions?.placeholder ?? 'Search content navigation'"
    data-testid="anchor-search"
    @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
  />
</template>

<style lang="less" scoped>
.tr-anchor {
  &__search {
    width: 100%;
    box-sizing: border-box;
    height: 32px;
    border: 1px solid var(--tr-anchor-search-border);
    border-radius: var(--tr-anchor-search-radius);
    background: var(--tr-anchor-search-bg);
    color: var(--tr-anchor-search-color);
    padding: 0 10px;
    outline: none;

    &:focus {
      border-color: var(--tr-anchor-search-border-focus);
      box-shadow: 0 0 0 3px var(--tr-anchor-search-focus-ring);
    }
  }
}
</style>

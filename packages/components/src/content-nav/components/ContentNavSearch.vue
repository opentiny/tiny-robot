<script setup lang="ts">
import type { ContentNavSearchEmits, ContentNavSearchProps } from '../internal.type'

defineOptions({ name: 'ContentNavSearch' })

const props = defineProps<ContentNavSearchProps>()
const emit = defineEmits<ContentNavSearchEmits>()
</script>

<template>
  <input
    class="tr-content-nav__search"
    type="search"
    :value="props.query"
    :placeholder="props.options?.placeholder ?? 'Search'"
    :aria-label="props.options?.placeholder ?? 'Search content navigation'"
    data-testid="content-nav-search"
    @input="emit('update:query', ($event.target as HTMLInputElement).value)"
  />
</template>

<style lang="less" scoped>
.tr-content-nav {
  &__search {
    width: 100%;
    box-sizing: border-box;
    height: 32px;
    border: 1px solid var(--tr-content-nav-search-border);
    border-radius: var(--tr-content-nav-search-radius);
    background: var(--tr-content-nav-search-bg);
    color: var(--tr-content-nav-search-color);
    padding: 0 10px;
    outline: none;

    &:focus {
      border-color: var(--tr-content-nav-search-border-focus);
      box-shadow: 0 0 0 3px var(--tr-content-nav-search-focus-ring);
    }
  }
}
</style>

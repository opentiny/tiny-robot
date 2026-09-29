<script setup lang="ts">
defineProps<{ kind: 'mcp' | 'skill' }>()
</script>

<template>
  <svg v-if="kind === 'mcp'" viewBox="0 0 180 180" fill="none" aria-hidden="true">
    <path
      d="M18 84.8528L85.8822 16.9706C95.2548 7.59798 110.451 7.59798 119.823 16.9706C129.196 26.3431 129.196 41.5391 119.823 50.9117L68.5581 102.177"
      stroke="currentColor"
      stroke-width="12"
      stroke-linecap="round"
    />
    <path
      d="M69.2652 101.47L119.823 50.9117C129.196 41.5391 144.392 41.5391 153.765 50.9117L154.118 51.2652C163.491 60.6378 163.491 75.8338 154.118 85.2063L92.7248 146.6C89.6006 149.724 89.6006 154.789 92.7248 157.913L105.331 170.52"
      stroke="currentColor"
      stroke-width="12"
      stroke-linecap="round"
    />
    <path
      d="M102.853 33.9411L52.6482 84.1457C43.2756 93.5183 43.2756 108.714 52.6482 118.087C62.0208 127.459 77.2167 127.459 86.5893 118.087L136.794 67.8822"
      stroke="currentColor"
      stroke-width="12"
      stroke-linecap="round"
    />
  </svg>
  <svg v-else viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path
      d="M24 5c1.8 10.2 5 15.2 18 19-13 3.8-16.2 8.8-18 19C22.2 32.8 19 27.8 6 24 19 20.2 22.2 15.2 24 5Z"
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linejoin="round"
    />
    <path d="m20 24 4-4 4 4-4 4-4-4Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
    <path
      d="m8 8 3.5 3.5M40 8l-3.5 3.5M8 40l3.5-3.5M40 40l-3.5-3.5"
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linecap="round"
    />
  </svg>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const route = router.currentRoute.value
if (route.query.path) {
  router.push({
    path: route.query.path.toString(),
    query: route.query.path.toString().includes('redirect')
      ? {
          final: '1',
        }
      : {},
  })
}
else {
  router.push({ name: route.query.to?.toString() ?? 'Home' })
}
</script>

<template>
  <div />
</template>

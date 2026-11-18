<script setup lang="ts">
import icons from "./icons.json";
defineProps<{ name: keyof typeof icons }>();
</script>
<template><span class="icon" aria-hidden="true" v-html="icons[name]" /></template>

<script setup lang="ts">
import { ref } from "vue";
import type { Source } from "../services/chat/view.js";
import Icon from "./Icon.vue";
import { safeUrl } from "./Markdown.js";
defineProps<{ sources: Source[] }>();
const failed = ref(new Set<string>());
</script>
<template>
  <span class="site-icons"
    ><span v-for="source in sources.slice(0, 4)" class="site-logo"
      ><img
        v-if="source.siteIcon && safeUrl(source.siteIcon) && !failed.has(source.url)"
        :src="source.siteIcon"
        alt=""
        referrerpolicy="no-referrer"
        @error="failed.add(source.url)" /><Icon v-else name="IconLinkOutline14" /></span
  ></span>
</template>

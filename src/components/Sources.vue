<script setup lang="ts">
import { sourcePanel } from "../ui.js";
import { translate as t } from "../i18n/index.js";
import { safeUrl } from "./Markdown.js";
import Icon from "./Icon.vue";
</script>
<template>
  <aside class="source-panel">
    <header>
      <span>{{ t("searchResult") }}</span
      ><button class="icon-button" :aria-label="t('close')" @click="sourcePanel = null">
        <Icon name="IconCloseOutline16" />
      </button>
    </header>
    <div class="sources">
      <a
        v-for="source in sourcePanel"
        :href="safeUrl(source.url)"
        target="_blank"
        rel="noopener noreferrer"
        ><small
          ><img
            v-if="source.siteIcon && safeUrl(source.siteIcon)"
            :src="source.siteIcon"
            alt=""
            referrerpolicy="no-referrer"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />{{ source.index }} · {{ source.siteName }}</small
        >
        <h3>{{ source.title }}</h3>
        <p>{{ source.snippet }}</p>
        <small>{{ source.publishedAt }}</small></a
      >
    </div>
  </aside>
</template>

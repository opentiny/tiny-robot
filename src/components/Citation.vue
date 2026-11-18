<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount } from "vue";
import type { Source } from "../services/chat/view.js";
const props = defineProps<{ source: Source }>();
const open = ref(false),
  left = ref(0),
  top = ref(0);
const card = ref<HTMLElement>();
let timer: ReturnType<typeof setTimeout> | undefined;
function keep() {
  clearTimeout(timer);
}
function close() {
  keep();
  open.value = false;
}
function hide() {
  keep();
  timer = setTimeout(close, 100);
}
function show(e: Event) {
  keep();
  const target = e.currentTarget as HTMLElement;
  timer = setTimeout(
    async () => {
      const rect = target.getBoundingClientRect();
      open.value = true;
      await nextTick();
      const box = card.value?.getBoundingClientRect();
      const width = box?.width || 355,
        height = box?.height || 150;
      left.value = Math.max(8, Math.min(rect.left, innerWidth - width - 8));
      top.value = Math.max(
        8,
        rect.bottom + height + 16 > innerHeight ? rect.top - height - 8 : rect.bottom + 8,
      );
    },
    e.type === "focus" ? 0 : 300,
  );
}
onBeforeUnmount(keep);
const href = () => (/^https?:\/\//i.test(props.source.url) ? props.source.url : undefined);
</script>
<template>
  <a
    class="citation"
    :href="href()"
    target="_blank"
    rel="noopener noreferrer"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
    @keydown.esc="close"
    >{{ source.index }}</a
  ><Teleport to="body"
    ><div
      v-if="open"
      class="citation-card"
      ref="card"
      role="tooltip"
      @mouseenter="keep"
      @mouseleave="hide"
      @focusin="keep"
      @focusout="hide"
      @keydown.esc="close"
      :style="{ left: left + 'px', top: top + 'px' }"
    >
      <a :href="href()" target="_blank" rel="noopener noreferrer"
        ><small>{{ source.siteName }}</small
        ><strong>{{ source.title }}</strong>
        <p v-if="source.snippet">{{ source.snippet }}</p>
        <small v-if="source.publishedAt">{{ source.publishedAt }}</small>
      </a>
    </div></Teleport
  >
</template>

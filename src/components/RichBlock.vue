<script setup lang="ts">
import { ref, watch } from "vue";
import { ensureKatex } from "../services/markdown/katex.js";
import { renderMermaid } from "../services/markdown/mermaid.js";
import Icon from "./Icon.vue";
import { translate as t } from "../i18n/index.js";
import { copyText } from "../utils/clipboard.js";
import { notify, resolvedDark } from "../ui.js";
import DOMPurify from "dompurify";
import Prism from "prismjs";
import { getHighlightLang, loadHighlight } from "../services/markdown/highlight.js";
const props = defineProps<{ value: string; lang?: string; math?: boolean; inline?: boolean }>();
const html = ref(""),
  error = ref(false),
  code = ref(false),
  loading = ref(false);

watch(
  () => [props.value, props.lang, props.math, resolvedDark.value],
  async (_, __, cleanup) => {
    let cancelled = false;
    cleanup(() => (cancelled = true));
    error.value = false;
    loading.value = true;
    try {
      let result: string | null = "";
      if (props.math)
        result = (await ensureKatex()).renderToString(props.value, {
          displayMode: !props.inline,
          throwOnError: false,
          trust: false,
        });
      else if (props.lang === "mermaid")
        result = await renderMermaid(props.value, resolvedDark.value, () => cancelled);
      else {
        const lang = getHighlightLang(props.lang || "");
        if (lang) await loadHighlight(lang);
        result = Prism.highlight(
          props.value,
          Prism.languages[lang || ""] || Prism.languages.plain,
          lang || "plain",
        );
      }
      if (!cancelled)
        html.value = DOMPurify.sanitize(
          result || "",
          props.lang === "mermaid" && !props.math
            ? { ADD_TAGS: ["foreignObject"], HTML_INTEGRATION_POINTS: { foreignobject: true } }
            : {},
        );
    } catch {
      if (!cancelled) error.value = true;
    } finally {
      if (!cancelled) loading.value = false;
    }
  },
  { immediate: true },
);
async function copy() {
  notify(t((await copyText(props.value)) ? "copied" : "copyFailed"));
}
</script>
<template>
  <span v-if="math" :class="{ 'math-display': !inline }" v-html="html" />
  <div v-else class="code-block">
    <header class="code-banner">
      <span>{{ lang || "text" }}</span
      ><button v-if="lang === 'mermaid'" @click="code = !code">
        {{ code ? t("mermaidDiagram") : t("mermaidCode") }}</button
      ><button @click="copy"><Icon name="IconCopyOutline16" />{{ t("copy") }}</button>
    </header>
    <template v-if="lang === 'mermaid' && !code"
      ><p v-if="loading">{{ t("mermaidLoading") }}</p>
      <p v-else-if="error">{{ t("mermaidRenderFail") }}</p>
      <div v-else class="diagram" v-html="html"
    /></template>
    <pre
      v-else
    ><code v-if="lang==='mermaid'">{{ value }}</code><code v-else :class="`language-${getHighlightLang(lang || '') || 'plain'}`" v-html="html" /></pre>
  </div>
</template>

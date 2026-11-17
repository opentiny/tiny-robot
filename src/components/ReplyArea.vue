<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from "vue";
import type { AssistantMessage } from "../services/chat/types.js";
import {
  getAreaTitle,
  isDeepSearchKind,
  isImageSearchKind,
  type ReplyView,
  type SearchStep,
} from "../services/chat/view.js";
import { translate as t } from "../i18n/index.js";
import { sourcePanel } from "../ui.js";
import Markdown, { safeUrl } from "./Markdown.js";
import Icon from "./Icon.vue";
import SiteIcons from "./SiteIcons.vue";
import "../styles/reply-area.css";
const props = defineProps<{ message: AssistantMessage; view: ReplyView; streaming: boolean }>();
const open = ref(true),
  tick = ref(0),
  now = ref(Date.now());
const timer = setInterval(() => {
  if (props.streaming) {
    now.value = Date.now();
    tick.value++;
  }
}, 1000);
onBeforeUnmount(() => clearInterval(timer));
const thinking = computed(
  () => props.message.thinking ?? props.view.steps.some((s) => s.type === "thinking"),
);
const title = computed(() =>
  thinking.value ? getAreaTitle(props.view, props.streaming, now.value, !!props.view.answer) : null,
);
function searchLabel(step: SearchStep) {
  if (step.status === "wip")
    return t(isImageSearchKind(step.kind) ? "imageSearching" : "messageSearching");
  if (step.status === "failed")
    return t(
      !props.streaming && props.message.status === "stopped" ? "searchStopped" : "toolSearchFail",
    );
  const n = step.results.length;
  return t(
    n === 0
      ? isDeepSearchKind(step.kind)
        ? "toolSearchNoResult"
        : "messageSearchNoResult"
      : isDeepSearchKind(step.kind)
        ? n === 1
          ? "toolSearch1Result"
          : "toolSearchResults"
        : n === 1
          ? "messageSearchResult"
          : "messageSearchResults",
    { count: n },
  );
}
</script>
<template>
  <div v-if="view.steps.length || (thinking && streaming)" class="ra-area">
    <button v-if="title" class="ra-title" :aria-expanded="open" @click="open = !open">
      <span class="ra-titleIcon"><Icon name="IconThinkOutline16" /></span
      ><span class="ra-titleText">{{ title }}</span
      ><Icon :name="open ? 'IconChevronDownOutline14' : 'IconChevronRightOutline14'" />
    </button>
    <div v-if="open || !title">
      <template v-for="(step, i) in view.steps" :key="i">
        <div
          v-if="step.type === 'thinking' || step.type === 'text'"
          :class="['ra-content', { 'ra-lastItem': i === view.steps.length - 1 }]"
        >
          <span class="ra-dot"
            ><span :class="['ra-dotInner', { 'ra-inactive': !streaming }]"
          /></span>
          <Markdown
            :text="
              step.type === 'thinking' ? step.blocks.map((b) => b.thinking).join('') : step.markdown
            "
            :disable-link="step.type === 'thinking'"
            :sources="view.sources"
          />
        </div>
        <div
          v-else-if="step.type === 'search'"
          :class="[
            'ra-row',
            {
              'ra-withLine': i < view.steps.length - 1,
              'ra-clickable': step.status === 'done' && step.results.length,
            },
          ]"
          :role="step.results.length ? 'button' : undefined"
          :tabindex="step.results.length ? 0 : undefined"
          @click="step.results.length && (sourcePanel = step.results)"
          @keydown.enter="step.results.length && (sourcePanel = step.results)"
        >
          <span class="ra-rowIcon"
            ><Icon
              :name="
                step.status === 'failed' ? 'IconSearchWarningOutline16' : 'IconSearchOutline16'
              "
          /></span>
          <template v-if="step.status === 'wip' && step.queries.length"
            ><span class="ra-prefix">{{ t("toolSearchIntro") }}</span
            ><span class="ra-query">{{
              step.queries[Math.floor(tick / 2) % step.queries.length]
            }}</span></template
          >
          <template v-else
            ><span class="ra-summary">{{ searchLabel(step) }}</span
            ><SiteIcons v-if="step.results.length" :sources="step.results"
          /></template>
        </div>
        <div v-else :class="['ra-tool', { 'ra-withLine': i < view.steps.length - 1 }]">
          <span class="ra-rowIcon ra-toolIcon"
            ><Icon :name="step.type === 'read_link' ? 'IconLinkOutline16' : 'IconBrowseOutline16'"
          /></span>
          <div class="ra-toolBody">
            <template v-if="step.type === 'find'">
              <span class="ra-intro">{{
                step.patterns.every((p) => p.status === "failed")
                  ? t("toolFindFail")
                  : t("toolFindIntro")
              }}</span>
              <span
                v-for="item in step.patterns"
                :class="['ra-chip', { 'ra-chipFailed': item.status === 'failed' }]"
                :title="item.status === 'failed' ? t('toolFindFailTooltip') : undefined"
                ><Icon
                  v-if="item.status !== 'wip'"
                  :name="item.status === 'failed' ? 'IconCloseFill14' : 'IconCheckedOutline14'"
                />{{ item.pattern }}</span
              >
            </template>
            <template v-else>
              <span class="ra-intro">{{
                step.type === "read_link"
                  ? t("readingLink")
                  : step.pages.every((p) => p.status === "failed")
                    ? t("toolOpenFail")
                    : t(step.pages.length === 1 ? "toolOpenOneIntro" : "toolOpensIntro", {
                        count: step.pages.length,
                      })
              }}</span>
              <span
                v-for="page in step.type === 'open' ? step.pages.slice(0, 5) : step.links"
                :class="['ra-page', page.status === 'failed' ? 'ra-pageFailed' : 'ra-pageDone']"
              >
                <span
                  v-if="page.status === 'failed'"
                  class="ra-pageText"
                  :title="t('toolOpenFailTooltip')"
                  >{{ page.title || page.url }}</span
                ><a
                  v-else
                  class="ra-pageText"
                  :href="safeUrl(page.url)"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ page.title || page.url }}</a
                ><Icon name="IconRightUpOutline14" />
              </span>
              <button
                v-if="step.type === 'open' && step.pages.length > 5"
                class="ra-chip"
                @click="
                  sourcePanel = view.sources.filter((s) => step.pages.some((p) => p.url === s.url))
                "
              >
                {{ t("toolOpenViewAll") }}
              </button>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

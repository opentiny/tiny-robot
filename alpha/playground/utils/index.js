import { useVueImportMap as g, useStore as $, File as f } from "@vue/repl";
function A(i) {
  const { tinyRobotVersion: e = "latest" } = i || {};
  return [
    {
      filename: "src/App.vue",
      code: `<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
    style="--tr-bubble-box-bg: var(--tr-color-primary-light)"
  ></tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`
    },
    {
      filename: "src/index.css",
      code: `@import url('https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@${e}/dist/style.css') layer(base);
@import url('https://cdn.jsdelivr.net/npm/@opentiny/vue-theme@3.22.0/index.min.css') layer(base);

@layer base {
  body {
    background-color: #fafafa;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
}
`
    }
  ];
}
function V(i) {
  const { tinyRobotVersion: e, builtinImportMap: t, extraImports: a } = i, c = Object.entries(a || {}).map(([s, o]) => ({
    [s]: `https://cdn.jsdelivr.net/npm/${s}@${o}`
  })).reduce((s, o) => ({ ...s, ...o }), {});
  return {
    imports: {
      ...t == null ? void 0 : t.imports,
      // TinyRobot 相关包 - 使用统一版本号
      "@opentiny/tiny-robot": `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@${e}/dist/index.min.js`,
      "@opentiny/tiny-robot-svgs": `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot-svgs@${e}/dist/tiny-robot-svgs.min.js`,
      "@opentiny/tiny-robot-kit": `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot-kit@${e}/dist/index.mjs`,
      // TinyVue 相关包
      "@opentiny/vue": "https://cdn.jsdelivr.net/npm/@opentiny/vue-runtime@3/dist3/tiny-vue-pc.mjs",
      "@opentiny/vue-icon": "https://cdn.jsdelivr.net/npm/@opentiny/vue-runtime@3/dist3/tiny-vue-icon.mjs",
      "@opentiny/vue-locale": "https://cdn.jsdelivr.net/npm/@opentiny/vue-runtime@3/dist3/tiny-vue-locale.mjs",
      "@opentiny/vue-common": "https://cdn.jsdelivr.net/npm/@opentiny/vue-runtime@3/dist3/tiny-vue-common.mjs",
      // 其他常用库
      "@vueuse/core": "https://cdn.jsdelivr.net/npm/@vueuse/core@13/index.iife.min.js",
      dompurify: "https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js",
      "markdown-it": "https://cdn.jsdelivr.net/npm/markdown-it@14/dist/markdown-it.min.js",
      echarts: "https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js",
      // Tiptap 编辑器相关包 (用于 Sender 组件)
      // 使用 esm.sh CDN，自动处理子路径导入和依赖解析
      // 添加 ?external=vue 参数，避免 Vue 版本冲突
      "@tiptap/core": "https://esm.sh/@tiptap/core@3.11.0",
      "@tiptap/vue-3": "https://esm.sh/@tiptap/vue-3@3.11.0?external=vue",
      "@tiptap/pm/state": "https://esm.sh/@tiptap/pm@3.11.0/state",
      "@tiptap/pm/view": "https://esm.sh/@tiptap/pm@3.11.0/view",
      "@tiptap/pm/model": "https://esm.sh/@tiptap/pm@3.11.0/model",
      "@tiptap/extension-document": "https://esm.sh/@tiptap/extension-document@3.11.0",
      "@tiptap/extension-paragraph": "https://esm.sh/@tiptap/extension-paragraph@3.11.0",
      "@tiptap/extension-text": "https://esm.sh/@tiptap/extension-text@3.11.0",
      "@tiptap/extension-history": "https://esm.sh/@tiptap/extension-history@3.11.0",
      "@tiptap/extension-placeholder": "https://esm.sh/@tiptap/extension-placeholder@3.11.0",
      "@tiptap/extension-character-count": "https://esm.sh/@tiptap/extension-character-count@3.11.0",
      ...c
    }
  };
}
const I = (i) => {
  const { files: e, tinyRobotVersion: t = "latest", vueVersion: a = "latest", extraImports: c } = i, { importMap: m, vueVersion: s, productionMode: o } = g();
  s.value = a, o.value = !0;
  const r = $({
    // pre-set import map
    builtinImportMap: m,
    vueVersion: s
  });
  if (e && e.length > 0) {
    for (const p of e)
      r.addFile(p instanceof f ? p : new f(p.filename, p.code));
    r.setActive(e[0].filename);
  }
  const u = V({
    tinyRobotVersion: t,
    builtinImportMap: m.value,
    extraImports: c
  });
  return r.setImportMap(u), {
    store: r,
    builtinImportMap: m,
    vueVersion: s
  };
}, b = /* @__PURE__ */ new Map();
async function T(i, e = {}) {
  var r, u;
  const { includePrerelease: t = !1, limit: a = 20, includeLatest: c = !0 } = e, m = Array.isArray(t) ? t.join(",") : t, s = `${i}-${m}-${a}-${c}`, o = b.get(s);
  if (o)
    return o;
  try {
    const l = await (await fetch(`https://registry.npmmirror.com/${i}`)).json(), j = (l == null ? void 0 : l.time) || {}, x = (r = l["dist-tags"]) == null ? void 0 : r.latest;
    let d = Object.entries(j).filter(([n]) => n !== "created" && n !== "modified").slice().sort((n, v) => new Date(v[1]).getTime() - new Date(n[1]).getTime()).map(([n]) => n).filter((n) => {
      if (typeof t == "boolean") {
        if (!t && /[a-zA-Z]/.test(n))
          return !1;
      } else if (Array.isArray(t) && /[a-zA-Z]/.test(n) && !t.some(
        (h) => n.includes(`-${h}.`) || n.includes(`-${h}-`) || n.endsWith(`-${h}`)
      ))
        return !1;
      return !0;
    });
    d = d.slice(0, a), c && ((u = l["dist-tags"]) != null && u.latest) && (d.includes("latest") || d.unshift("latest"));
    const y = { versions: d, lastVersion: x };
    return b.set(s, y), y;
  } catch (p) {
    return console.error(`Failed to fetch versions for ${i}:`, p), { versions: ["latest"], lastVersion: void 0 };
  }
}
export {
  V as generateImportMap,
  I as generateStore,
  A as getDefaultFiles,
  T as getVersions
};

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
  const { tinyRobotVersion: e, builtinImportMap: t, extraImports: a } = i, c = Object.entries(a || {}).map(([s, r]) => ({
    [s]: `https://cdn.jsdelivr.net/npm/${s}@${r}`
  })).reduce((s, r) => ({ ...s, ...r }), {});
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
      idb: "https://cdn.jsdelivr.net/npm/idb@8/+esm",
      yaml: "https://cdn.jsdelivr.net/npm/yaml@2/browser/index.min.js",
      // Tiptap 编辑器相关包 (用于 Sender 组件)
      // 使用 esm.sh CDN，自动处理子路径导入和依赖解析
      // 添加 ?external=vue 参数，避免 Vue 版本冲突
      "@tiptap/core": "https://esm.sh/@tiptap/core@3.17.1",
      "@tiptap/vue-3": "https://esm.sh/@tiptap/vue-3@3.17.1?external=vue",
      "@tiptap/pm/state": "https://esm.sh/@tiptap/pm@3.17.1/state",
      "@tiptap/pm/view": "https://esm.sh/@tiptap/pm@3.17.1/view",
      "@tiptap/pm/model": "https://esm.sh/@tiptap/pm@3.17.1/model",
      "@tiptap/extension-document": "https://esm.sh/@tiptap/extension-document@3.17.1",
      "@tiptap/extension-paragraph": "https://esm.sh/@tiptap/extension-paragraph@3.17.1",
      "@tiptap/extension-text": "https://esm.sh/@tiptap/extension-text@3.17.1",
      "@tiptap/extension-history": "https://esm.sh/@tiptap/extension-history@3.17.1",
      "@tiptap/extension-placeholder": "https://esm.sh/@tiptap/extension-placeholder@3.17.1",
      "@tiptap/extension-character-count": "https://esm.sh/@tiptap/extension-character-count@3.17.1",
      ...c
    }
  };
}
const I = (i) => {
  const { files: e, tinyRobotVersion: t = "latest", vueVersion: a = "latest", extraImports: c } = i, { importMap: m, vueVersion: s, productionMode: r } = g();
  s.value = a, r.value = !0;
  const o = $({
    // pre-set import map
    builtinImportMap: m,
    vueVersion: s
  });
  if (e && e.length > 0) {
    for (const p of e)
      o.addFile(p instanceof f ? p : new f(p.filename, p.code));
    o.setActive(e[0].filename);
  }
  const u = V({
    tinyRobotVersion: t,
    builtinImportMap: m.value,
    extraImports: c
  });
  return o.setImportMap(u), {
    store: o,
    builtinImportMap: m,
    vueVersion: s
  };
}, b = /* @__PURE__ */ new Map();
async function T(i, e = {}) {
  var o, u;
  const { includePrerelease: t = !1, limit: a = 20, includeLatest: c = !0 } = e, m = Array.isArray(t) ? t.join(",") : t, s = `${i}-${m}-${a}-${c}`, r = b.get(s);
  if (r)
    return r;
  try {
    const l = await (await fetch(`https://registry.npmmirror.com/${i}`)).json(), j = (l == null ? void 0 : l.time) || {}, x = (o = l["dist-tags"]) == null ? void 0 : o.latest;
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

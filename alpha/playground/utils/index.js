import { useVueImportMap as g, useStore as $, File as f } from "@vue/repl";
function A(i) {
  const { tinyRobotVersion: t = "latest" } = i || {};
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
      code: `@import url('https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@${t}/dist/style.css') layer(base);
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
function M(i) {
  const { tinyRobotVersion: t, builtinImportMap: e, extraImports: c } = i, p = `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@${t}/dist/vanilla`, a = `const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = ${JSON.stringify(`${p}/style.css`)};
document.head.appendChild(link);`, o = Object.entries(c || {}).map(([n, r]) => ({
    [n]: `https://cdn.jsdelivr.net/npm/${n}@${r}`
  })).reduce((n, r) => ({ ...n, ...r }), {});
  return {
    imports: {
      ...e == null ? void 0 : e.imports,
      // TinyRobot 相关包 - 使用统一版本号
      "@opentiny/tiny-robot": `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@${t}/dist/index.min.js`,
      "@opentiny/tiny-robot/vanilla": `${p}/index.js`,
      "@opentiny/tiny-robot/vanilla/style.css": `data:text/javascript,${encodeURIComponent(a)}`,
      "@opentiny/tiny-robot-svgs": `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot-svgs@${t}/dist/tiny-robot-svgs.min.js`,
      "@opentiny/tiny-robot-kit": `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot-kit@${t}/dist/index.mjs`,
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
      ...o
    }
  };
}
const I = (i) => {
  const { files: t, tinyRobotVersion: e = "latest", vueVersion: c = "latest", extraImports: p } = i, { importMap: a, vueVersion: o, productionMode: m } = g();
  o.value = c, m.value = !0;
  const n = $({
    // pre-set import map
    builtinImportMap: a,
    vueVersion: o
  });
  if (t && t.length > 0) {
    for (const l of t)
      n.addFile(l instanceof f ? l : new f(l.filename, l.code));
    n.setActive(t[0].filename);
  }
  const r = M({
    tinyRobotVersion: e,
    builtinImportMap: a.value,
    extraImports: p
  });
  return n.setImportMap(r), {
    store: n,
    builtinImportMap: a,
    vueVersion: o
  };
}, b = /* @__PURE__ */ new Map();
async function k(i, t = {}) {
  var n, r;
  const { includePrerelease: e = !1, limit: c = 20, includeLatest: p = !0 } = t, a = Array.isArray(e) ? e.join(",") : e, o = `${i}-${a}-${c}-${p}`, m = b.get(o);
  if (m)
    return m;
  try {
    const d = await (await fetch(`https://registry.npmmirror.com/${i}`)).json(), j = (d == null ? void 0 : d.time) || {}, x = (n = d["dist-tags"]) == null ? void 0 : n.latest;
    let u = Object.entries(j).filter(([s]) => s !== "created" && s !== "modified").slice().sort((s, v) => new Date(v[1]).getTime() - new Date(s[1]).getTime()).map(([s]) => s).filter((s) => {
      if (typeof e == "boolean") {
        if (!e && /[a-zA-Z]/.test(s))
          return !1;
      } else if (Array.isArray(e) && /[a-zA-Z]/.test(s) && !e.some(
        (h) => s.includes(`-${h}.`) || s.includes(`-${h}-`) || s.endsWith(`-${h}`)
      ))
        return !1;
      return !0;
    });
    u = u.slice(0, c), p && ((r = d["dist-tags"]) != null && r.latest) && (u.includes("latest") || u.unshift("latest"));
    const y = { versions: u, lastVersion: x };
    return b.set(o, y), y;
  } catch (l) {
    return console.error(`Failed to fetch versions for ${i}:`, l), { versions: ["latest"], lastVersion: void 0 };
  }
}
export {
  M as generateImportMap,
  I as generateStore,
  A as getDefaultFiles,
  k as getVersions
};

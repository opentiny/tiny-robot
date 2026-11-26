import { useVueImportMap as g, useStore as $, File as f } from "@vue/repl";
function V(o) {
  const { tinyRobotVersion: t = "latest" } = o || {};
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
function M(o) {
  const { tinyRobotVersion: t, builtinImportMap: e, extraImports: d } = o, a = `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@${t}/dist/vanilla`, l = `const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = ${JSON.stringify(`${a}/style.css`)};
document.head.appendChild(link);`, i = "https://esm.sh/monaco-editor@0.57.0", c = `const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = ${JSON.stringify(`${i}/es2022/editor/editor.api.css`)};
await new Promise((resolve, reject) => {
  link.onload = resolve;
  link.onerror = () => reject(new Error('Failed to load Monaco editor styles'));
  document.head.appendChild(link);
});
export * from ${JSON.stringify(`${i}/editor/editor.api?target=es2022`)};`, r = Object.entries(d || {}).map(([n, p]) => ({
    [n]: `https://cdn.jsdelivr.net/npm/${n}@${p}`
  })).reduce((n, p) => ({ ...n, ...p }), {});
  return {
    imports: {
      ...e == null ? void 0 : e.imports,
      // TinyRobot 相关包 - 使用统一版本号
      "@opentiny/tiny-robot": `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@${t}/dist/index.min.js`,
      "@opentiny/tiny-robot/vanilla": `${a}/index.js`,
      "@opentiny/tiny-robot/vanilla/style.css": `data:text/javascript,${encodeURIComponent(l)}`,
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
      "monaco-editor/editor/editor.api": `data:text/javascript,${encodeURIComponent(c)}`,
      "monaco-editor/languages/definitions/typescript/register": `${i}/languages/definitions/typescript/register?bundle=false&target=es2022`,
      // Route the language module's relative editor import to the same bundled
      // API, avoiding duplicate registries and raw CSS imports in the browser.
      [`${i}/es2022/esm/vs/editor/editor.api.nobundle.mjs`]: `data:text/javascript,${encodeURIComponent(c)}`,
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
      ...r
    }
  };
}
const I = (o) => {
  const { files: t, tinyRobotVersion: e = "latest", vueVersion: d = "latest", extraImports: a } = o, { importMap: l, vueVersion: i, productionMode: c } = g();
  i.value = d, c.value = !0;
  const r = $({
    // pre-set import map
    builtinImportMap: l,
    vueVersion: i
  });
  if (t && t.length > 0) {
    for (const n of t)
      r.addFile(n instanceof f ? n : new f(n.filename, n.code));
    r.setActive(t[0].filename);
  }
  const m = M({
    tinyRobotVersion: e,
    builtinImportMap: l.value,
    extraImports: a
  });
  return r.setImportMap(m), {
    store: r,
    builtinImportMap: l,
    vueVersion: i
  };
}, b = /* @__PURE__ */ new Map();
async function A(o, t = {}) {
  var r, m;
  const { includePrerelease: e = !1, limit: d = 20, includeLatest: a = !0 } = t, l = Array.isArray(e) ? e.join(",") : e, i = `${o}-${l}-${d}-${a}`, c = b.get(i);
  if (c)
    return c;
  try {
    const p = await (await fetch(`https://registry.npmmirror.com/${o}`)).json(), j = (p == null ? void 0 : p.time) || {}, x = (r = p["dist-tags"]) == null ? void 0 : r.latest;
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
    u = u.slice(0, d), a && ((m = p["dist-tags"]) != null && m.latest) && (u.includes("latest") || u.unshift("latest"));
    const y = { versions: u, lastVersion: x };
    return b.set(i, y), y;
  } catch (n) {
    return console.error(`Failed to fetch versions for ${o}:`, n), { versions: ["latest"], lastVersion: void 0 };
  }
}
export {
  M as generateImportMap,
  I as generateStore,
  V as getDefaultFiles,
  A as getVersions
};

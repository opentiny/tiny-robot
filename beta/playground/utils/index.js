import { useVueImportMap as f, useStore as b, File as v } from "@vue/repl";
function $(i) {
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
function j(i) {
  const { tinyRobotVersion: e, builtinImportMap: t, extraImports: p } = i, a = Object.entries(p || {}).map(([n, r]) => ({
    [n]: `https://cdn.jsdelivr.net/npm/${n}@${r}`
  })).reduce((n, r) => ({ ...n, ...r }), {});
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
      ...a
    }
  };
}
const M = (i) => {
  const { files: e, tinyRobotVersion: t = "latest", vueVersion: p = "latest", extraImports: a } = i, { importMap: c, vueVersion: n, productionMode: r } = f();
  n.value = p, r.value = !0;
  const o = b({
    // pre-set import map
    builtinImportMap: c,
    vueVersion: n
  });
  if (e && e.length > 0) {
    for (const l of e)
      o.addFile(l instanceof v ? l : new v(l.filename, l.code));
    o.setActive(e[0].filename);
  }
  const m = j({
    tinyRobotVersion: t,
    builtinImportMap: c.value,
    extraImports: a
  });
  return o.setImportMap(m), {
    store: o,
    builtinImportMap: c,
    vueVersion: n
  };
}, h = /* @__PURE__ */ new Map();
async function V(i, e = {}) {
  var r;
  const { includePrerelease: t = !1, limit: p = 20, includeLatest: a = !0 } = e, c = Array.isArray(t) ? t.join(",") : t, n = `${i}-${c}-${p}-${a}`;
  if (h.has(n))
    return h.get(n);
  try {
    const m = await (await fetch(`https://registry.npmmirror.com/${i}`)).json(), l = (m == null ? void 0 : m.time) || {};
    let u = Object.entries(l).filter(([s]) => s !== "created" && s !== "modified").slice().sort((s, y) => new Date(y[1]).getTime() - new Date(s[1]).getTime()).map(([s]) => s).filter((s) => {
      if (typeof t == "boolean") {
        if (!t && /[a-zA-Z]/.test(s))
          return !1;
      } else if (Array.isArray(t) && /[a-zA-Z]/.test(s) && !t.some(
        (d) => s.includes(`-${d}.`) || s.includes(`-${d}-`) || s.endsWith(`-${d}`)
      ))
        return !1;
      return !0;
    });
    return u = u.slice(0, p), a && ((r = m["dist-tags"]) != null && r.latest) && (u.includes("latest") || u.unshift("latest")), h.set(n, u), u;
  } catch (o) {
    return console.error(`Failed to fetch versions for ${i}:`, o), ["latest"];
  }
}
export {
  j as generateImportMap,
  M as generateStore,
  $ as getDefaultFiles,
  V as getVersions
};

import { useVueImportMap as b, useStore as h, File as v } from "@vue/repl";
function M(s) {
  const { tinyRobotVersion: e = "latest" } = s || {};
  return [
    {
      filename: "src/App.vue",
      code: `<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
    style="--tr-bubble-content-bg: var(--tr-color-primary-light)"
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
function j(s) {
  const { tinyRobotVersion: e, builtinImportMap: t, extraImports: p } = s, a = Object.entries(p || {}).map(([n, r]) => ({
    [n]: `https://cdn.jsdelivr.net/npm/${n}@${r}`
  })).reduce((n, r) => ({ ...n, ...r }), {});
  return {
    imports: {
      ...t == null ? void 0 : t.imports,
      // TinyRobot 相关包 - 使用统一版本号
      "@opentiny/tiny-robot": `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@${e}/dist/index.min.js`,
      "@opentiny/tiny-robot-svgs": `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot-svgs@${e}/dist/tiny-robot-svgs.min.js`,
      "@opentiny/tiny-robot-kit": `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot-kit@${e}/+esm`,
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
      ...a
    }
  };
}
const V = (s) => {
  const { files: e, tinyRobotVersion: t = "latest", vueVersion: p = "latest", extraImports: a } = s, { importMap: c, vueVersion: n, productionMode: r } = b();
  n.value = p, r.value = !0;
  const o = h({
    // pre-set import map
    builtinImportMap: c,
    vueVersion: n
  });
  if (e && e.length > 0) {
    for (const m of e)
      o.addFile(m instanceof v ? m : new v(m.filename, m.code));
    o.setActive(e[0].filename);
  }
  const l = j({
    tinyRobotVersion: t,
    builtinImportMap: c.value,
    extraImports: a
  });
  return o.setImportMap(l), {
    store: o,
    builtinImportMap: c,
    vueVersion: n
  };
}, y = /* @__PURE__ */ new Map();
async function x(s, e = {}) {
  var r;
  const { includePrerelease: t = !1, limit: p = 20, includeLatest: a = !0 } = e, c = Array.isArray(t) ? t.join(",") : t, n = `${s}-${c}-${p}-${a}`;
  if (y.has(n))
    return y.get(n);
  try {
    const l = await (await fetch(`https://registry.npmmirror.com/${s}`)).json(), m = (l == null ? void 0 : l.time) || {};
    let u = Object.entries(m).filter(([i]) => i !== "created" && i !== "modified").slice().sort((i, f) => new Date(f[1]).getTime() - new Date(i[1]).getTime()).map(([i]) => i).filter((i) => {
      if (typeof t == "boolean") {
        if (!t && /[a-zA-Z]/.test(i))
          return !1;
      } else if (Array.isArray(t) && /[a-zA-Z]/.test(i) && !t.some(
        (d) => i.includes(`-${d}.`) || i.includes(`-${d}-`) || i.endsWith(`-${d}`)
      ))
        return !1;
      return !0;
    });
    return u = u.slice(0, p), a && ((r = l["dist-tags"]) != null && r.latest) && (u.includes("latest") || u.unshift("latest")), y.set(n, u), u;
  } catch (o) {
    return console.error(`Failed to fetch versions for ${s}:`, o), ["latest"];
  }
}
export {
  j as generateImportMap,
  V as generateStore,
  M as getDefaultFiles,
  x as getVersions
};

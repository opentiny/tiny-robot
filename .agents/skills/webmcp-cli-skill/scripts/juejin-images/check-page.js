(() => {
  /**
   * 扫描文章正文区域内的 img，返回 broken / ok。
   * 供 webmcp-cli page-agent-tool executeJavascript 注入。
   *
   * 注意：浏览器会把相对路径解析成绝对 URL，相对路径判定必须用 getAttribute('src')。
   * 未 complete 的图片（含 lazy）不算裂图，避免误报。
   */
  const ARTICLE_SELECTORS = [
    '.article-content',
    '.markdown-body',
    '.article-viewer',
    'article .main-area',
    'article',
    '.byte-viewer-editor',
    '.bytemd-preview',
    '.CodeMirror',
    'main',
  ];

  const findRoot = () => {
    for (const sel of ARTICLE_SELECTORS) {
      const el = document.querySelector(sel);
      if (el && el.querySelectorAll('img').length > 0) return el;
    }
    for (const sel of ARTICLE_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return document.body;
  };

  const isJuejinCdn = (src) => {
    try {
      const u = new URL(src, location.href);
      const host = u.hostname.toLowerCase();
      // 含公开 byteimg、编辑器返回的 xtjj-private.juejin.cn 签名链、静态资源域
      return (
        /(^|\.)byteimg\.com$/i.test(host) ||
        /(^|\.)juejin\.cn$/i.test(host) ||
        /lf[-.].*juejin/i.test(host)
      );
    } catch {
      return false;
    }
  };

  /** @param {string} attrSrc raw attribute value */
  const isRelativeOrLocal = (attrSrc) => {
    if (!attrSrc || !String(attrSrc).trim()) return true;
    const s = String(attrSrc).trim();
    if (s.startsWith('data:')) return false;
    if (/^https?:\/\//i.test(s) || s.startsWith('//')) return false;
    if (s.startsWith('blob:')) return false;
    return true;
  };

  const root = findRoot();
  const imgs = Array.from(root.querySelectorAll('img'));
  const broken = [];
  const ok = [];
  const skipped = [];

  imgs.forEach((img, index) => {
    const attrSrc = img.getAttribute('src') || img.getAttribute('data-src') || '';
    const resolvedSrc = img.currentSrc || img.src || '';
    const alt = img.alt || '';
    const entry = {
      index,
      src: attrSrc || resolvedSrc,
      resolved_src: resolvedSrc,
      alt,
    };

    // 尚未加载完成：不判裂图（lazy / 视口外）
    if (!img.complete) {
      skipped.push({ ...entry, reason: 'not-complete' });
      return;
    }

    const failedDecode = img.naturalWidth === 0 || img.naturalHeight === 0;
    const relative = isRelativeOrLocal(attrSrc);
    const dataUriBroken = String(attrSrc || resolvedSrc).startsWith('data:') && failedDecode;

    if (relative || failedDecode || dataUriBroken) {
      broken.push({
        ...entry,
        reason: relative
          ? 'relative-or-empty-src'
          : dataUriBroken
            ? 'data-uri-broken'
            : 'load-failed',
        on_juejin_cdn: isJuejinCdn(resolvedSrc || attrSrc),
      });
    } else {
      ok.push({ ...entry, on_juejin_cdn: isJuejinCdn(resolvedSrc || attrSrc) });
    }
  });

  return JSON.stringify({
    broken,
    ok,
    skipped,
    scanned: imgs.length,
    root_hint: root === document.body ? 'body-fallback' : root.className || root.tagName,
  });
})();

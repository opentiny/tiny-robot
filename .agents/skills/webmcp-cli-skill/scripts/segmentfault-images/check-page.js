(() => {
  /**
   * 扫描思否正文/编辑器预览区域内的 img，返回 broken / ok。
   * 供 webmcp-cli page-agent-tool executeJavascript 注入。
   *
   * 相对路径必须用 getAttribute('src')；未 complete 的 lazy 图进 skipped。
   */
  const ARTICLE_SELECTORS = [
    '.article__content',
    '.article-content',
    '.fmt',
    '.markdown-body',
    '.editor-preview',
    '.preview',
    '.CodeMirror',
    '.write-content',
    'article',
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

  /**
   * 合法思否图床：image-static / static / segmentfault.com/img 等。
   * @param {string} src
   */
  const isSegmentfaultCdn = (src) => {
    try {
      const u = new URL(src, location.href);
      const host = u.hostname.toLowerCase();
      const path = u.pathname || '';
      if (/^(image-static|static)\.segmentfault\.com$/i.test(host)) return true;
      if (/(^|\.)segmentfault\.com$/i.test(host) && (/^\/img\//i.test(path) || /\/remote\//i.test(path))) {
        return true;
      }
      // 历史/第三方图床偶发落到阿里云 OSS 且 Referer 为思否时仍可能正常；仅当 host 明显含 segmentfault
      if (/segmentfault/i.test(host)) return true;
      return false;
    } catch {
      return false;
    }
  };

  /** @param {string} attrSrc */
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
        on_segmentfault_cdn: isSegmentfaultCdn(resolvedSrc || attrSrc),
      });
    } else {
      ok.push({ ...entry, on_segmentfault_cdn: isSegmentfaultCdn(resolvedSrc || attrSrc) });
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

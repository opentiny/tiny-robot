(() => {
  /**
   * 扫描 CSDN 正文/编辑器预览区域内的 img，返回 broken / ok。
   * 供 webmcp-cli page-agent-tool executeJavascript 注入。
   *
   * 相对路径必须用 getAttribute('src')；未 complete 的 lazy 图进 skipped。
   * CSDN 特有：img-home.csdnimg.cn?...origin_url=... 是「外链转存失败」占位图，
   * 虽有宽高也判为 broken（勿当成已上 CDN）。
   */
  const ARTICLE_SELECTORS = [
    '#content_views',
    '.article_content',
    '.markdown_views',
    '.blog-content-box',
    '.htmledit_views',
    '.editor-preview',
    '.editor-preview-active',
    '.cledit-preview',
    '.markdown-preview',
    '.article-box',
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
   * 正文配图 CDN（i-blog / img-blog 等）。
   * img-home 转存失败占位不算合法 CDN。
   * @param {string} src
   */
  const isCsdnCdn = (src) => {
    try {
      const u = new URL(src, location.href);
      const host = u.hostname.toLowerCase();
      if (/^img-home\./i.test(host)) return false;
      if (u.searchParams.has('origin_url')) return false;
      return (
        /(^|\.)csdnimg\.cn$/i.test(host) ||
        /img[-.].*csdnimg/i.test(host) ||
        /^img-blog\./i.test(host) ||
        /^i-blog\./i.test(host)
      );
    } catch {
      return false;
    }
  };

  /**
   * CSDN 外链转存失败占位：img-home + origin_url，或 alt 含提示文案。
   * @param {string} attrSrc
   * @param {string} resolvedSrc
   * @param {string} alt
   */
  const isTransferFailurePlaceholder = (attrSrc, resolvedSrc, alt) => {
    const src = String(attrSrc || resolvedSrc || '');
    const a = String(alt || '');
    if (/外链图片转存失败|建议将图片保存下来直接上传/.test(a)) return true;
    try {
      const u = new URL(src, location.href);
      if (/^img-home\./i.test(u.hostname) && u.searchParams.has('origin_url')) return true;
    } catch {
      /* ignore */
    }
    return /img-home\.csdnimg\.cn/i.test(src) && /[?&]origin_url=/i.test(src);
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
    const transferFail = isTransferFailurePlaceholder(attrSrc, resolvedSrc, alt);

    if (relative || failedDecode || dataUriBroken || transferFail) {
      broken.push({
        ...entry,
        reason: relative
          ? 'relative-or-empty-src'
          : transferFail
            ? 'csdn-transfer-failure-placeholder'
            : dataUriBroken
              ? 'data-uri-broken'
              : 'load-failed',
        on_csdn_cdn: isCsdnCdn(resolvedSrc || attrSrc),
      });
    } else {
      ok.push({ ...entry, on_csdn_cdn: isCsdnCdn(resolvedSrc || attrSrc) });
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

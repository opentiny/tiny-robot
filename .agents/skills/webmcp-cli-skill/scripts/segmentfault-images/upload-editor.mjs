#!/usr/bin/env node
/**
 * 将 prepare-upload.mjs 产出的 upload-N.json 包装为 page-agent-tool executeJavascript
 * 参数文件：在已登录的思否写文章页（segmentfault.com/write）执行图片上传。
 *
 * 策略（按序）：
 *  1) 若指定 --upload-url：FormData + fetch(credentials:include)
 *  2) 否则找 accept 含 image 的 input[type=file]，DataTransfer 注入并 dispatch change
 *  3) 结果写入 window.__sfImgUpload（不依赖 executeJavascript await Promise）
 *
 * 成功检测：优先看新增的思否 CDN（image-static / static / /img/）；同时扫 Markdown 源码。
 *
 * 用法：
 *   node upload-editor.mjs --upload-json upload-0.json --out upload-run-0.json [--poll-out poll.json]
 *   node upload-editor.mjs --upload-json upload-0.json --out run.json --upload-url "https://..."
 *
 * 未传 --poll-out 时，默认写到与 --out 同目录的 poll.json。
 * stdout：元数据 JSON；base64 不进 stdout。
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {string[]} argv
 * @returns {Record<string, string | boolean>}
 */
function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a.startsWith('--') && i + 1 < argv.length) {
      out[a.slice(2)] = argv[++i];
    }
  }
  return out;
}

/**
 * @param {{ filename: string, mimeType: string, base64: string, uploadUrl?: string }} payload
 * @returns {string}
 */
function buildUploadScript(payload) {
  const { filename, mimeType, base64, uploadUrl } = payload;
  return `(${function (filename, mimeType, b64, explicitUploadUrl) {
    window.__sfImgUpload = { status: 'pending', started_at: Date.now() };

    const toBytes = (s) => {
      const bin = atob(s);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    };
    const bytes = toBytes(b64);
    const blob = new Blob([bytes], { type: mimeType });
    const file = new File([blob], filename, { type: mimeType });

    /** 思否正文配图 CDN */
    const isUploadCdn = (url) => {
      try {
        const u = new URL(url, location.href);
        const h = u.hostname.toLowerCase();
        const p = u.pathname || '';
        if (/^(image-static|static)\.segmentfault\.com$/i.test(h)) return true;
        if (/(^|\.)segmentfault\.com$/i.test(h) && (/^\/img\//i.test(p) || /\/remote\//i.test(p))) {
          return true;
        }
        if (/segmentfault/i.test(h)) return true;
        return false;
      } catch {
        return false;
      }
    };

    const digUrl = (node) => {
      if (typeof node === 'string') {
        const s = node.trim();
        return /^https?:\/\//i.test(s) && isUploadCdn(s) ? s : null;
      }
      if (!node || typeof node !== 'object') return null;
      for (const key of ['url', 'src', 'imageUrl', 'image_url', 'cdn', 'cdn_url', 'link']) {
        const v = node[key];
        if (typeof v === 'string' && /^https?:\/\//i.test(v) && isUploadCdn(v)) return v;
      }
      if (Array.isArray(node)) {
        for (const item of node) {
          const hit = digUrl(item);
          if (hit) return hit;
        }
      } else {
        for (const v of Object.values(node)) {
          const hit = digUrl(v);
          if (hit) return hit;
        }
      }
      return null;
    };

    const finish = (result) => {
      window.__sfImgUpload = Object.assign({}, result, { finished_at: Date.now() });
    };

    const readEditorMarkdown = () => {
      try {
        const cm = document.querySelector('.CodeMirror');
        if (cm && cm.CodeMirror && typeof cm.CodeMirror.getValue === 'function') {
          return cm.CodeMirror.getValue() || '';
        }
      } catch (_) {}
      const ta =
        document.querySelector('textarea#editor') ||
        document.querySelector('textarea.editor') ||
        document.querySelector('.editor textarea') ||
        document.querySelector('textarea');
      if (ta && typeof ta.value === 'string') return ta.value;
      return '';
    };

    const extractCdnUrls = (text) => {
      const re = /https?:\/\/[^\s)"']+/gi;
      const out = [];
      let m;
      while ((m = re.exec(text || ''))) {
        const u = m[0].replace(/[.,;]+$/, '');
        if (isUploadCdn(u)) out.push(u);
      }
      return out;
    };

    const snapshotDomCdn = () =>
      Array.from(document.querySelectorAll('img'))
        .map((img) => img.currentSrc || img.src || '')
        .filter((src) => isUploadCdn(src));

    const beforeDom = new Set(snapshotDomCdn());
    const beforeMd = new Set(extractCdnUrls(readEditorMarkdown()));

    const findNewCdn = () => {
      const domAdded = snapshotDomCdn().find((src) => !beforeDom.has(src));
      if (domAdded) return { url: domAdded, via: 'dom-img' };
      const mdAdded = extractCdnUrls(readEditorMarkdown()).find((src) => !beforeMd.has(src));
      if (mdAdded) return { url: mdAdded, via: 'markdown-source' };
      return null;
    };

    const tryFileInput = () => {
      const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
      // 仅匹配明确接受图片的 input；禁止空 accept（易误命中封面/附件/其它选择器）
      const input = inputs.find((el) => {
        const acc = (el.getAttribute('accept') || '').toLowerCase();
        const id = (el.id || '').toLowerCase();
        const name = (el.getAttribute('name') || '').toLowerCase();
        if (id.includes('markdown') || acc.includes('.md')) return false;
        if (name.includes('cover') || id.includes('cover') || name.includes('avatar')) return false;
        return (
          acc.includes('image') ||
          acc.includes('png') ||
          acc.includes('gif') ||
          acc.includes('jpeg') ||
          acc.includes('webp') ||
          acc.includes('*/*')
        );
      });
      if (!input) return false;

      try {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
      } catch (e) {
        finish({
          ok: false,
          status: 'error',
          mode: 'file-input',
          error: 'DataTransfer/files assignment failed: ' + String(e && e.message ? e.message : e),
        });
        return true;
      }

      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));

      const started = Date.now();
      const timer = setInterval(() => {
        const hit = findNewCdn();
        if (hit) {
          clearInterval(timer);
          finish({ ok: true, status: 'done', mode: 'file-input', cdn_url: hit.url, via: hit.via });
          return;
        }
        if (Date.now() - started > 20000) {
          clearInterval(timer);
          if (window.__sfImgUpload && window.__sfImgUpload.status === 'pending') {
            finish({
              ok: false,
              status: 'timeout',
              mode: 'file-input',
              error:
                'file input dispatched but no new segmentfault CDN in DOM or markdown within 20s; try --upload-url or editor UI',
            });
          }
        }
      }, 400);
      return true;
    };

    const tryFetchUpload = async (url) => {
      const form = new FormData();
      form.append('file', file, filename);
      form.append('image', file, filename);
      const resp = await fetch(url, { method: 'POST', credentials: 'include', body: form });
      const text = await resp.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (_) {}
      const cdn = digUrl(json);
      if (resp.ok && cdn) {
        finish({ ok: true, status: 'done', mode: 'fetch', cdn_url: cdn, http_status: resp.status });
        return;
      }
      // 部分接口直接返回 URL 字符串
      if (resp.ok && typeof text === 'string' && isUploadCdn(text.trim())) {
        finish({
          ok: true,
          status: 'done',
          mode: 'fetch',
          cdn_url: text.trim(),
          http_status: resp.status,
        });
        return;
      }
      finish({
        ok: false,
        status: 'error',
        mode: 'fetch',
        http_status: resp.status,
        error: 'upload response missing url',
        body_preview: String(text).slice(0, 500),
      });
    };

    (async () => {
      try {
        if (explicitUploadUrl) {
          await tryFetchUpload(explicitUploadUrl);
          return;
        }
        if (!tryFileInput()) {
          finish({
            ok: false,
            status: 'error',
            mode: 'none',
            error:
              'no image file input found; pass --upload-url or use editor UI searchTree for 上传图片',
          });
        }
      } catch (e) {
        finish({ ok: false, status: 'error', error: String(e && e.message ? e.message : e) });
      }
    })();

    return JSON.stringify({ started: true, poll: 'window.__sfImgUpload' });
  }.toString()})(${JSON.stringify(filename)}, ${JSON.stringify(mimeType)}, ${JSON.stringify(base64)}, ${JSON.stringify(uploadUrl || '')})`;
}

/**
 * @returns {string}
 */
function buildPollScript() {
  return `(() => {
  const s = window.__sfImgUpload;
  if (!s) return JSON.stringify({ ok: false, status: 'missing', error: 'window.__sfImgUpload not set' });
  if (s.status === 'pending') return JSON.stringify({ ok: null, status: 'pending' });
  return JSON.stringify(s);
})()`;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.error(
      'Usage: node upload-editor.mjs --upload-json <file> --out <run.json> [--poll-out poll.json] [--upload-url <url>]',
    );
    process.exit(0);
  }

  if (typeof args['upload-json'] !== 'string' || typeof args.out !== 'string') {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'missing-args',
        errors: ['--upload-json and --out required'],
      }),
    );
    process.exit(1);
  }

  const uploadDoc = JSON.parse(fs.readFileSync(path.resolve(args['upload-json']), 'utf8'));
  if (!uploadDoc.base64 || !uploadDoc.filename || !uploadDoc.mimeType) {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'invalid-upload-json',
        errors: ['upload json must contain filename, mimeType, base64'],
      }),
    );
    process.exit(1);
  }

  const uploadUrl = typeof args['upload-url'] === 'string' ? args['upload-url'] : '';
  const script = buildUploadScript({
    filename: uploadDoc.filename,
    mimeType: uploadDoc.mimeType,
    base64: uploadDoc.base64,
    uploadUrl,
  });

  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ action: 'executeJavascript', script }), 'utf8');

  const pollOut =
    typeof args['poll-out'] === 'string'
      ? path.resolve(args['poll-out'])
      : path.join(path.dirname(outPath), 'poll.json');
  fs.writeFileSync(
    pollOut,
    JSON.stringify({ action: 'executeJavascript', script: buildPollScript() }),
    'utf8',
  );

  console.log(
    JSON.stringify({
      ok: true,
      out_file: outPath,
      poll_out: pollOut,
      filename: uploadDoc.filename,
      byte_length: uploadDoc.byte_length ?? null,
      has_upload_url: Boolean(uploadUrl),
      preferred_mode: uploadUrl ? 'fetch-upload-url' : 'file-input',
      note: 'Run page-agent-tool -f out_file then poll poll_out until ok/cdn_url on https://segmentfault.com/write',
    }),
  );
}

main();

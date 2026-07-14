#!/usr/bin/env node
/**
 * 将 prepare-upload.mjs 产出的 upload-N.json 包装为 page-agent-tool executeJavascript
 * 参数文件：在已登录的 CSDN Markdown 编辑器页执行图片上传。
 *
 * 策略（按序）：
 *  1) 优先 `window.csdn.upload.uploadImg`（编辑器已注入的图床 SDK；实战可用）
 *  2) 若指定 --upload-url：FormData + fetch(credentials:include)
 *  3) 否则找 accept 含 image 的 input[type=file]（禁止落到「导入 Markdown」的 .md input）
 *  4) 结果写入 window.__csdnImgUpload（不依赖 executeJavascript await Promise）
 *
 * 成功检测：SDK 直接返回 imageUrl；file-input/fetch 仍扫 DOM / Markdown 新增 CDN。
 * 合法正文 CDN：i-blog / img-blog 等；`img-home.csdnimg.cn?...origin_url=` 是转存失败占位，不算成功。
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
    window.__csdnImgUpload = { status: 'pending', started_at: Date.now() };

    const toBytes = (s) => {
      const bin = atob(s);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    };
    const bytes = toBytes(b64);
    const blob = new Blob([bytes], { type: mimeType });
    const file = new File([blob], filename, { type: mimeType });

    /** 正文配图 CDN；排除 img-home 转存失败占位 */
    const isUploadCdn = (url) => {
      try {
        const u = new URL(url, location.href);
        const h = u.hostname.toLowerCase();
        if (/^img-home\./i.test(h) || u.searchParams.has('origin_url')) return false;
        return (
          /(^|\.)csdnimg\.cn$/i.test(h) ||
          /img[-.].*csdnimg/i.test(h) ||
          /^img-blog\./i.test(h) ||
          /^i-blog\./i.test(h)
        );
      } catch {
        return false;
      }
    };

    const digImageUrl = (node) => {
      if (!node || typeof node !== 'object') return null;
      if (typeof node.imageUrl === 'string' && /^https?:\/\//i.test(node.imageUrl)) {
        return node.imageUrl;
      }
      if (typeof node.url === 'string' && /^https?:\/\//i.test(node.url) && isUploadCdn(node.url)) {
        return node.url;
      }
      for (const v of Object.values(node)) {
        const hit = digImageUrl(v);
        if (hit) return hit;
      }
      return null;
    };

    const pickUrlFromJson = (json) => digImageUrl(json);

    const finish = (result) => {
      window.__csdnImgUpload = Object.assign({}, result, { finished_at: Date.now() });
    };

    const readEditorMarkdown = () => {
      try {
        const cm = document.querySelector('.CodeMirror');
        if (cm && cm.CodeMirror && typeof cm.CodeMirror.getValue === 'function') {
          return cm.CodeMirror.getValue() || '';
        }
      } catch (_) {}
      const inner = document.querySelector('.editor__inner');
      if (inner && typeof inner.innerText === 'string' && inner.innerText.trim()) {
        return inner.innerText;
      }
      const ta =
        document.querySelector('textarea.editor-content') ||
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

    const tryCsdnSdk = async () => {
      const uploadImg = window.csdn && window.csdn.upload && window.csdn.upload.uploadImg;
      if (typeof uploadImg !== 'function') return false;
      try {
        const results = await uploadImg({
          file,
          appName: 'direct_blog',
          env: 'prod',
          currentLine: 'external',
        });
        const first = Array.isArray(results) ? results[0] : results;
        const cdn = digImageUrl(first);
        if (cdn && isUploadCdn(cdn)) {
          finish({ ok: true, status: 'done', mode: 'csdn-sdk', cdn_url: cdn });
          return true;
        }
        finish({
          ok: false,
          status: 'error',
          mode: 'csdn-sdk',
          error: 'csdn.upload.uploadImg returned no usable imageUrl',
          body_preview: JSON.stringify(first).slice(0, 400),
        });
        return true;
      } catch (e) {
        finish({
          ok: false,
          status: 'error',
          mode: 'csdn-sdk',
          error: 'csdn.upload.uploadImg failed: ' + String(e && e.message ? e.message : e),
        });
        return true;
      }
    };

    const tryFileInput = () => {
      const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
      // 仅接受图片的 input；禁止落到 #import-markdown-file-input（accept=.md）
      const input = inputs.find((el) => {
        const acc = (el.getAttribute('accept') || '').toLowerCase();
        const id = (el.id || '').toLowerCase();
        if (id.includes('markdown') || acc.includes('.md')) return false;
        return acc.includes('image') || acc.includes('png') || acc.includes('gif') || acc.includes('*/*');
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
          if (window.__csdnImgUpload && window.__csdnImgUpload.status === 'pending') {
            finish({
              ok: false,
              status: 'timeout',
              mode: 'file-input',
              error:
                'file input dispatched but no new blog CDN in DOM or markdown within 20s; csdn-sdk preferred',
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
      const cdn = pickUrlFromJson(json);
      if (resp.ok && cdn) {
        finish({ ok: true, status: 'done', mode: 'fetch', cdn_url: cdn, http_status: resp.status });
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
        if (await tryCsdnSdk()) return;
        if (!tryFileInput()) {
          finish({
            ok: false,
            status: 'error',
            mode: 'none',
            error:
              'csdn.upload.uploadImg unavailable and no image file input; pass --upload-url or use editor UI',
          });
        }
      } catch (e) {
        finish({ ok: false, status: 'error', error: String(e && e.message ? e.message : e) });
      }
    })();

    return JSON.stringify({ started: true, poll: 'window.__csdnImgUpload' });
  }.toString()})(${JSON.stringify(filename)}, ${JSON.stringify(mimeType)}, ${JSON.stringify(base64)}, ${JSON.stringify(uploadUrl || '')})`;
}

/**
 * @returns {string}
 */
function buildPollScript() {
  return `(() => {
  const s = window.__csdnImgUpload;
  if (!s) return JSON.stringify({ ok: false, status: 'missing', error: 'window.__csdnImgUpload not set' });
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
      preferred_mode: uploadUrl ? 'fetch-upload-url' : 'csdn-sdk',
      note: 'Run page-agent-tool -f out_file then poll poll_out until ok/cdn_url on https://editor.csdn.net/md/',
    }),
  );
}

main();

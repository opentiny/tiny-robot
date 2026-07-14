#!/usr/bin/env node
/**
 * 将 prepare-upload.mjs 产出的 upload-N.json 包装为 page-agent-tool executeJavascript
 * 参数文件：在已登录的 CSDN Markdown 编辑器页执行图片上传。
 *
 * 策略（按序）：
 *  1) 若指定 --upload-url：FormData + fetch(credentials:include)
 *  2) 否则找编辑器 input[type=file]，DataTransfer 注入并 dispatch change
 *  3) 结果写入 window.__csdnImgUpload（不依赖 executeJavascript await Promise）
 *
 * 成功检测：优先看新增的 img-blog/csdnimg CDN；同时扫 Markdown 源码（CodeMirror/textarea），
 * 因为 CSDN 常把图片写成 `![](cdn)` 而不立刻渲染 <img>。
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

    /** 用于判定「上传成功」的 CDN（收紧，避免 avatar.csdn.net 等站点图误判） */
    const isUploadCdn = (url) => {
      try {
        const h = new URL(url, location.href).hostname.toLowerCase();
        return (
          /(^|\.)csdnimg\.cn$/i.test(h) ||
          /img[-.].*csdnimg/i.test(h) ||
          /^img-blog\./i.test(h)
        );
      } catch {
        return false;
      }
    };

    const pickUrlFromJson = (json) => {
      if (!json || typeof json !== 'object') return null;
      const data = json.data;
      const candidates = [
        json.url,
        json.imageUrl,
        json.imgUrl,
        data && data.url,
        data && data.imageUrl,
        data && data.imgUrl,
        data && data.image_url,
        typeof data === 'string' ? data : null,
      ];
      for (const c of candidates) {
        if (typeof c === 'string' && /^https?:\/\//i.test(c)) return c;
      }
      return null;
    };

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

    const tryFileInput = () => {
      const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
      const input =
        inputs.find((el) => {
          const acc = (el.getAttribute('accept') || '').toLowerCase();
          return !acc || acc.includes('image') || acc.includes('*');
        }) || inputs[0];
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
                'file input dispatched but no new csdnimg CDN in DOM or markdown within 20s; try --upload-url or UI',
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
        if (!tryFileInput()) {
          finish({
            ok: false,
            status: 'error',
            mode: 'none',
            error: 'no file input found; pass --upload-url from Network or use editor UI upload',
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
      note: 'Run page-agent-tool -f out_file then poll poll_out until ok/cdn_url on https://editor.csdn.net/md/',
    }),
  );
}

main();

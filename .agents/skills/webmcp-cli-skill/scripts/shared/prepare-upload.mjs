/**
 * 按 markers.json 中的 index 读取本地图片，生成上传 payload（base64）。
 *
 * 用法：
 *   node prepare-upload.mjs --markers markers.json --index 0 [--out upload-0.json]
 *
 * 指定 --out 时 stdout 仅元数据；完整 base64 只在 out 文件中。
 * 掘金/思否在 platform 提供 buildExecuteJavascriptHint 时写入 hint 字段；CSDN 不写。
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from './parse-args.mjs';

const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

/**
 * 按 markers 与本地图片生成上传 payload；可选写入 execute_javascript_hint。
 * @param {string[]} argv
 * @param {{ prepareUploadNote: string, buildExecuteJavascriptHint?: (filename: string, mimeType: string, base64: string) => string }} platform
 * @returns {void}
 */
export function runPrepareUpload(argv, platform) {
  const args = parseArgs(argv);
  if (args.help) {
    console.error('Usage: node prepare-upload.mjs --markers <file> --index <n> [--out <file>]');
    process.exit(0);
  }

  if (typeof args.markers !== 'string' || args.index === undefined) {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'missing-args',
        errors: ['--markers and --index required'],
      }),
    );
    process.exit(1);
  }

  const index = Number(args.index);
  if (!Number.isInteger(index) || index < 0) {
    console.log(JSON.stringify({ ok: false, code: 'invalid-index', errors: ['--index must be non-negative integer'] }));
    process.exit(1);
  }

  const markersDoc = JSON.parse(fs.readFileSync(path.resolve(args.markers), 'utf8'));
  const markers = Array.isArray(markersDoc) ? markersDoc : markersDoc.markers;
  if (!Array.isArray(markers)) {
    console.log(JSON.stringify({ ok: false, code: 'invalid-markers', errors: ['markers.json missing markers array'] }));
    process.exit(1);
  }

  const marker = markers.find((m) => Number(m.index) === index) ?? markers[index];
  if (!marker) {
    console.log(JSON.stringify({ ok: false, code: 'marker-not-found', errors: [`no marker for index ${index}`] }));
    process.exit(1);
  }

  const localPath = marker.local_path;
  if (!localPath || typeof localPath !== 'string') {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'missing-local-path',
        errors: [`marker ${index} has no local_path; cannot prepare upload`],
        marker,
      }),
    );
    process.exit(1);
  }

  const abs = path.resolve(localPath);
  if (!fs.existsSync(abs)) {
    console.log(JSON.stringify({ ok: false, code: 'file-not-found', errors: [abs] }));
    process.exit(1);
  }

  const ext = path.extname(abs).toLowerCase();
  const mimeType = MIME_BY_EXT[ext];
  if (!mimeType) {
    console.log(JSON.stringify({ ok: false, code: 'unsupported-ext', errors: [ext] }));
    process.exit(1);
  }

  const buf = fs.readFileSync(abs);
  const base64 = buf.toString('base64');
  const filename = path.basename(abs);
  const hasHint = typeof platform.buildExecuteJavascriptHint === 'function';

  /** @type {Record<string, unknown>} */
  const full = {
    ok: true,
    index,
    filename,
    mimeType,
    base64,
    local_path: abs,
    byte_length: buf.length,
    alt: marker.alt ?? '',
    original: marker.original ?? '',
    note: platform.prepareUploadNote,
  };

  if (hasHint) {
    full.execute_javascript_hint = platform.buildExecuteJavascriptHint(filename, mimeType, base64);
  }

  if (typeof args.out === 'string') {
    const outPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(full, null, 2), 'utf8');
    /** @type {Record<string, unknown>} */
    const meta = {
      ok: true,
      index,
      filename,
      mimeType,
      local_path: abs,
      byte_length: buf.length,
      alt: full.alt,
      original: full.original,
      out_file: outPath,
      has_base64: true,
      note: full.note,
    };
    if (hasHint) {
      meta.has_execute_javascript_hint = true;
    }
    console.log(JSON.stringify(meta));
    return;
  }

  console.log(JSON.stringify(full));
}

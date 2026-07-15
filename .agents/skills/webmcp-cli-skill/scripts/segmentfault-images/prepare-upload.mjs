#!/usr/bin/env node
/**
 * 按 markers.json 中的 index 读取本地图片，生成上传 payload（base64）。
 *
 * 推荐后续步骤：把 --out 产出交给 upload-editor.mjs（思否编辑器 file input / --upload-url 上传）。
 *
 * 用法：
 *   node prepare-upload.mjs --markers markers.json --index 0 [--out upload-0.json]
 *
 * 指定 --out 时 stdout 仅元数据；完整 base64 只在 out 文件中。
 */

import fs from 'node:fs';
import path from 'node:path';

const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

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
 * 提示调用方改用 upload-editor.mjs（保留字段兼容旧调用方）。
 * @param {string} filename
 * @param {string} mimeType
 * @param {string} _base64
 * @returns {string}
 */
function buildExecuteJavascriptHint(filename, mimeType, _base64) {
  return [
    'Use upload-editor.mjs on segmentfault.com/write tab.',
    `filename=${filename}`,
    `mimeType=${mimeType}`,
    'See domains/fix-segmentfault-article-images.md step 5',
  ].join(' ');
}

function main() {
  const args = parseArgs(process.argv);
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
  const execute_javascript_hint = buildExecuteJavascriptHint(filename, mimeType, base64);

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
    execute_javascript_hint,
    note: 'Preferred next step: node upload-editor.mjs --upload-json <this-out> --out run.json --poll-out poll.json then page-agent-tool -f on https://segmentfault.com/write.',
  };

  if (typeof args.out === 'string') {
    const outPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(full, null, 2), 'utf8');
    // stdout 只输出元数据，避免大图 base64 撑爆 Agent 上下文；完整 payload 在 --out 文件
    console.log(
      JSON.stringify({
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
        has_execute_javascript_hint: true,
        note: full.note,
      }),
    );
    return;
  }

  console.log(JSON.stringify(full));
}

main();

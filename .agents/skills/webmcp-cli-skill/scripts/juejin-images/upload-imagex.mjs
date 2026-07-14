#!/usr/bin/env node
/**
 * 将 prepare-upload.mjs 产出的 upload-N.json 包装为 page-agent-tool executeJavascript
 * 参数文件：在已登录的掘金编辑器页执行 ImageX 五步上传。
 *
 * 流程：gen_token → ApplyImageUpload → POST 二进制 → CommitImageUpload → get_img_url
 *
 * 用法：
 *   node upload-imagex.mjs --upload-json upload-0.json --out upload-run-0.json
 *   node upload-imagex.mjs --upload-json upload-0.json --out upload-run-0.json --poll-out poll.json
 *
 * 执行后（重要）：
 *   1) webmcp-cli run page-agent-tool -t TAB_ID -f upload-run-0.json
 *   2) 轮询：webmcp-cli run page-agent-tool -t TAB_ID -f poll.json
 *      直到返回 JSON 含 ok/cdn_url（勿依赖 executeJavascript await Promise）
 *
 * stdout：元数据 JSON { ok, out_file, poll_out?, filename, byte_length }；STS / base64 不进 stdout。
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
 * 生成浏览器内 ImageX 上传 IIFE（同步返回 started，结果写 window.__juejinImgUpload）。
 *
 * @param {{ filename: string, mimeType: string, base64: string }} payload
 * @returns {string}
 */
function buildUploadScript(payload) {
  const { filename, mimeType, base64 } = payload;
  return `
(() => {
  const SERVICE_ID = '73owjymdk6';
  const filename = ${JSON.stringify(filename)};
  const mimeType = ${JSON.stringify(mimeType)};
  const b64 = ${JSON.stringify(base64)};

  const toBytes = (s) => {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };
  const bytes = toBytes(b64);

  const crc32 = (buf) => {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return (~c >>> 0).toString(16).padStart(8, '0');
  };

  const enc = new TextEncoder();
  const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const sha256Hex = async (data) =>
    hex(await crypto.subtle.digest('SHA-256', typeof data === 'string' ? enc.encode(data) : data));
  const hmacRaw = async (keyBytes, msg) => {
    const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
  };

  const amzTimestamp = () => {
    // 2026-07-14T07:00:23.123Z -> 20260714T070023Z
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\\.\\d{3}Z$/, 'Z');
  };

  const sigv4 = async (method, host, uri, queryParams, body, sts) => {
    const timestamp = amzTimestamp();
    const datestamp = timestamp.slice(0, 8);
    const sorted = [...queryParams].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const queryString = sorted
      .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
      .join('&');
    const canonicalHeaders =
      'host:' + host + '\\nx-amz-date:' + timestamp + '\\nx-amz-security-token:' + sts.SessionToken + '\\n';
    const signedHeaders = 'host;x-amz-date;x-amz-security-token';
    const payloadHash = await sha256Hex(body || new Uint8Array());
    const canonicalRequest = [method, uri, queryString, canonicalHeaders, signedHeaders, payloadHash].join('\\n');
    const hashedCr = await sha256Hex(canonicalRequest);
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = datestamp + '/cn-north-1/imagex/aws4_request';
    const stringToSign = [algorithm, timestamp, credentialScope, hashedCr].join('\\n');
    const kDate = await hmacRaw(enc.encode('AWS4' + sts.SecretAccessKey), datestamp);
    const kRegion = await hmacRaw(kDate, 'cn-north-1');
    const kService = await hmacRaw(kRegion, 'imagex');
    const kSigning = await hmacRaw(kService, 'aws4_request');
    const sigKey = await crypto.subtle.importKey('raw', kSigning, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = hex(await crypto.subtle.sign('HMAC', sigKey, enc.encode(stringToSign)));
    return {
      queryString,
      headers: {
        Authorization:
          algorithm +
          ' Credential=' +
          sts.AccessKeyId +
          '/' +
          credentialScope +
          ', SignedHeaders=' +
          signedHeaders +
          ', Signature=' +
          signature,
        'x-amz-date': timestamp,
        'x-amz-security-token': sts.SessionToken,
      },
    };
  };

  window.__juejinImgUpload = 'pending';
  (async () => {
    try {
      const tokenRes = await fetch('https://api.juejin.cn/imagex/v2/gen_token?aid=2608&client=web', {
        credentials: 'include',
      });
      const tokenJson = await tokenRes.json();
      if (tokenJson.err_no !== 0) throw new Error('gen_token: ' + (tokenJson.err_msg || tokenRes.status));
      const sts = tokenJson.data.token;

      const applyParams = [
        ['Action', 'ApplyImageUpload'],
        ['ServiceId', SERVICE_ID],
        ['Version', '2018-08-01'],
      ];
      const applyAuth = await sigv4('GET', 'imagex.bytedanceapi.com', '/', applyParams, new Uint8Array(), sts);
      const applyRes = await fetch('https://imagex.bytedanceapi.com/?' + applyAuth.queryString, {
        method: 'GET',
        headers: { Accept: '*/*', Origin: 'https://juejin.cn', Referer: 'https://juejin.cn/', ...applyAuth.headers },
      });
      const applyJson = await applyRes.json();
      const addr = applyJson.Result && applyJson.Result.UploadAddress;
      if (!addr || !addr.UploadHosts || !addr.StoreInfos) {
        throw new Error('ApplyImageUpload failed: ' + JSON.stringify(applyJson.ResponseMetadata || applyJson).slice(0, 300));
      }
      const uploadHost = addr.UploadHosts[0];
      const storeUri = addr.StoreInfos[0].StoreUri;
      const auth = addr.StoreInfos[0].Auth;
      const sessionKey = addr.SessionKey;

      const upHeaders = {
        'Content-Type': 'application/octet-stream',
        'Content-CRC32': crc32(bytes),
        'Content-Disposition': 'attachment; filename="undefined"',
        Origin: 'https://juejin.cn',
        Referer: 'https://juejin.cn/',
        Accept: '*/*',
      };
      if (auth) upHeaders.Authorization = auth;
      const upRes = await fetch('https://' + uploadHost + '/' + storeUri, {
        method: 'POST',
        headers: upHeaders,
        body: bytes,
      });
      if (!upRes.ok) {
        throw new Error('binary upload HTTP ' + upRes.status + ' ' + (await upRes.text()).slice(0, 200));
      }

      const commitParams = [
        ['Action', 'CommitImageUpload'],
        ['ServiceId', SERVICE_ID],
        ['SessionKey', sessionKey],
        ['Version', '2018-08-01'],
      ];
      const commitAuth = await sigv4('POST', 'imagex.bytedanceapi.com', '/', commitParams, new Uint8Array(), sts);
      const commitRes = await fetch('https://imagex.bytedanceapi.com/?' + commitAuth.queryString, {
        method: 'POST',
        headers: {
          'Content-Length': '0',
          Accept: '*/*',
          Origin: 'https://juejin.cn',
          Referer: 'https://juejin.cn/',
          ...commitAuth.headers,
        },
      });
      const commitJson = await commitRes.json();
      const committed =
        commitJson.Result &&
        commitJson.Result.Results &&
        commitJson.Result.Results[0] &&
        commitJson.Result.Results[0].Uri;
      const uri = committed || storeUri;

      const urlRes = await fetch(
        'https://api.juejin.cn/imagex/v2/get_img_url?aid=2608&uri=' + encodeURIComponent(uri) + '&img_type=private',
        { credentials: 'include' },
      );
      const urlJson = await urlRes.json();
      let cdn = urlJson.data && (urlJson.data.main_url || urlJson.data.backup_url);
      if (!cdn) cdn = 'https://p1-juejin.byteimg.com/' + String(uri).replace(/^\\//, '');

      window.__juejinImgUpload = JSON.stringify({
        ok: true,
        filename,
        mimeType,
        uri,
        cdn_url: cdn,
      });
    } catch (e) {
      window.__juejinImgUpload = JSON.stringify({
        ok: false,
        filename,
        error: String(e && e.message ? e.message : e),
      });
    }
  })();
  return JSON.stringify({ started: true, filename });
})()
`.trim();
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.error(
      'Usage: node upload-imagex.mjs --upload-json <upload-N.json> --out <run-args.json> [--poll-out <poll-args.json>]',
    );
    process.exit(0);
  }

  const uploadKey = typeof args['upload-json'] === 'string' ? args['upload-json'] : args.upload;
  if (typeof uploadKey !== 'string' || typeof args.out !== 'string') {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'missing-args',
        errors: ['--upload-json and --out required'],
      }),
    );
    process.exit(1);
  }

  const uploadPath = path.resolve(uploadKey);
  if (!fs.existsSync(uploadPath)) {
    console.log(JSON.stringify({ ok: false, code: 'file-not-found', errors: [uploadPath] }));
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(uploadPath, 'utf8'));
  const { filename, mimeType, base64 } = payload;
  if (!filename || !mimeType || !base64) {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'invalid-upload-json',
        errors: ['upload json must include filename, mimeType, base64'],
      }),
    );
    process.exit(1);
  }

  const script = buildUploadScript({ filename, mimeType, base64 });
  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ action: 'executeJavascript', script }), 'utf8');

  /** @type {string | undefined} */
  let pollOut;
  if (typeof args['poll-out'] === 'string') {
    pollOut = path.resolve(args['poll-out']);
    fs.mkdirSync(path.dirname(pollOut), { recursive: true });
    fs.writeFileSync(
      pollOut,
      JSON.stringify({
        action: 'executeJavascript',
        script: "(() => window.__juejinImgUpload || 'pending')()",
      }),
      'utf8',
    );
  }

  console.log(
    JSON.stringify({
      ok: true,
      out_file: outPath,
      poll_out: pollOut ?? null,
      filename,
      mimeType,
      byte_length: Buffer.from(base64, 'base64').length,
      result_global: '__juejinImgUpload',
      note: 'Run -f out_file then poll -f poll_out until JSON with ok/cdn_url (or ok:false). Do not print STS secrets.',
    }),
  );
}

main();

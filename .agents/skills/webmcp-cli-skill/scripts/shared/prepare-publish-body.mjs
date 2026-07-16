/**
 * 从 article.md 生成去 Front Matter 的正文，供掘金/CSDN/思否等平台发布。
 *
 * 用法：
 *   node prepare-publish-body.mjs --file <article.md> [--out-dir <dir>] [--out-file <path>]
 *
 * stdout: JSON { ok, source_file, body_file, stripped_frontmatter } 或 { ok:false, code, errors }
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from './parse-args.mjs';
import { stripFrontMatter } from './strip-frontmatter.mjs';

function printHelp() {
  console.error(`Usage:
  node prepare-publish-body.mjs --file <article.md> [--out-dir <dir>] [--out-file <path>]`);
}

/**
 * @param {string[]} argv
 * @returns {void}
 */
export function runPreparePublishBody(argv) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const sourceFile =
    typeof args.file === 'string' ? path.resolve(args.file) : '';
  if (!sourceFile) {
    console.log(
      JSON.stringify({ ok: false, code: 'missing-file', errors: ['--file required'] }),
    );
    process.exit(1);
  }

  if (!fs.existsSync(sourceFile)) {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'source-not-found',
        errors: [`source file not found: ${sourceFile}`],
      }),
    );
    process.exit(1);
  }

  const raw = fs.readFileSync(sourceFile, 'utf8');
  if (!raw.trim()) {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'empty-source',
        errors: [`source file is empty: ${sourceFile}`],
      }),
    );
    process.exit(1);
  }

  const { body, stripped, malformed } = stripFrontMatter(raw);
  if (malformed) {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'malformed-frontmatter',
        errors: ['file starts with --- but front matter delimiters are invalid'],
      }),
    );
    process.exit(1);
  }
  if (!body.trim()) {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'empty-body',
        errors: ['body is empty after stripping front matter'],
      }),
    );
    process.exit(1);
  }

  const articleSlug = path.basename(path.dirname(sourceFile));
  const outFile =
    typeof args['out-file'] === 'string'
      ? path.resolve(args['out-file'])
      : typeof args['out-dir'] === 'string'
        ? path.join(path.resolve(args['out-dir']), 'body.md')
        : path.join(process.cwd(), '.cache', 'publish-body', articleSlug, 'body.md');

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, body, 'utf8');

  console.log(
    JSON.stringify({
      ok: true,
      source_file: sourceFile,
      body_file: outFile,
      stripped_frontmatter: stripped,
    }),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runPreparePublishBody(process.argv);
}

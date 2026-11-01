import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { verifyAngularConsumer } from '../skills/trchat-angular-integration/scripts/verify-consumer.mjs';

const chat = '@opentiny/tiny-robot-chat';
const kit = '@opentiny/tiny-robot-kit';
const version = '1.0.0-alpha.0';
test('skill entrypoint links resolve to local resources', () => {
  const root = resolve('skills/trchat-angular-integration');
  const content = readFileSync(join(root, 'SKILL.md'), 'utf8');
  const links = [...content.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);
  assert.ok(links.length > 0);
  for (const link of links) {
    if (/^(?:https?:|#)/.test(link)) continue;
    assert.ok(readFileSync(resolve(root, link.split('#')[0])).length > 0, `missing or empty resource: ${link}`);
  }
});
test('renderer routing links to a public-import reference', () => {
  const entry = readFileSync('skills/trchat-angular-integration/SKILL.md', 'utf8');
  assert.match(entry, /\[renderer reference\]\(references\/renderers\.md\)/);
  const guidance = readFileSync('skills/trchat-angular-integration/references/renderers.md', 'utf8');
  assert.doesNotMatch(guidance, /(?:@opentiny\/tiny-robot-(?:chat|kit)\/src\/|packages\/(?:chat|kit)\/src\/)/);
});
test('renderer example uses custom notice renderers in deterministic order and preserves fallback', () => {
  const guidance = readFileSync('skills/trchat-angular-integration/references/renderers.md', 'utf8');
  assert.match(guidance, /content\.type === 'notice'[\s\S]*renderer: \(\{ content \}\) => `First:[\s\S]*priority: -2[\s\S]*content\.type === 'notice'[\s\S]*renderer: \(\{ content \}\) => `Second:[\s\S]*priority: -2/);
  assert.match(guidance, /ordinary text item[\s\S]*fallback renders Markdown/);
});
test('Angular NgModule guidance opts the component out of standalone mode', () => {
  const guidance = readFileSync('skills/trchat-angular-integration/references/angular-host-modes.md', 'utf8');
  assert.match(guidance, /NgModule[^\n]*standalone: false/);
});
function write(path, text) { mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, text); }
function fixture(t, pnpm = false) {
  const root = mkdtempSync(join(tmpdir(), 'trchat-consumer-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(join(root, 'package.json'), JSON.stringify({ dependencies: { [chat]: version } }));
  write(join(root, 'src/app.ts'), `import '${chat}/experimental';`);
  const target = pnpm ? join(root, 'node_modules/.pnpm/chat/node_modules', chat) : join(root, 'node_modules', chat);
  write(join(target, 'package.json'), JSON.stringify({ name: chat, version, type: 'module', exports: { './experimental': './experimental.js', './experimental/web-component.css': './style.css' } }));
  write(join(target, 'experimental.js'), 'export {};');
  write(join(target, 'style.css'), '');
  if (pnpm) { mkdirSync(join(root, 'node_modules/@opentiny'), { recursive: true }); symlinkSync(target, join(root, 'node_modules', chat), 'dir'); }
  return root;
}
function report(root, options = {}) { return verifyAngularConsumer({ projectRoot: root, ...options }); }
function failing(result, pattern) { assert.equal(result.ok, false); assert.match(result.checks.filter(c => !c.ok).map(c => c.detail).join(' '), pattern); }
test('accepts an npm-style published alpha consumer', t => { assert.equal(report(fixture(t)).ok, true); });
test('accepts a pnpm-style published alpha consumer', t => { assert.equal(report(fixture(t, true)).ok, true); });
test('rejects a wrong chat or direct kit version', t => {
  const root = fixture(t); write(join(root, 'package.json'), JSON.stringify({ dependencies: { [chat]: '^1.0.0-alpha.0', [kit]: '1.0.0' } }));
  write(join(root, 'src/app.ts'), `import '${kit}';`);
  failing(report(root), /version/i);
});
test('checks installed versions and direct Kit imports', t => {
  const root = fixture(t);
  write(join(root, 'package.json'), JSON.stringify({ dependencies: { [chat]: version, [kit]: version } }));
  write(join(root, 'src/app.ts'), `import '${kit}';`);
  write(join(root, 'node_modules', kit, 'package.json'), JSON.stringify({ name: kit, version, main: './index.js' }));
  write(join(root, 'node_modules', kit, 'index.js'), '');
  assert.equal(report(root).ok, true);
  write(join(root, 'node_modules', kit, 'package.json'), JSON.stringify({ name: kit, version: '1.0.0', main: './index.js' }));
  failing(report(root), /installed version/i);
});
test('rejects workspace dependencies in an installed manifest', t => {
  const root = fixture(t); const path = join(root, 'node_modules', chat, 'package.json');
  const manifest = JSON.parse(readFileSync(path, 'utf8')); manifest.dependencies = { [kit]: 'workspace:*' }; write(path, JSON.stringify(manifest));
  failing(report(root), /workspace/i);
});
test('requires the experimental CSS export', t => {
  const root = fixture(t); rmSync(join(root, 'node_modules', chat, 'style.css'));
  failing(report(root), /style.css/i);
});
test('rejects package realpaths outside the consumer node_modules tree', t => {
  const root = fixture(t); const path = join(root, 'node_modules', chat); const outside = join(root, 'linked-chat');
  rmSync(path, { recursive: true }); write(join(outside, 'package.json'), JSON.stringify({ name: chat, version, exports: { './experimental': './index.js', './experimental/web-component.css': './style.css' } })); write(join(outside, 'index.js'), ''); write(join(outside, 'style.css'), ''); symlinkSync(outside, path, 'dir');
  failing(report(root), /node_modules/i);
});
test('rejects private monorepo source imports', t => { const root = fixture(t); write(join(root, 'src/app.ts'), `import x from '@opentiny/tiny-robot-chat/src/foo';`); failing(report(root), /source|private/i); });
test('rejects absolute monorepo source imports', t => {
  const root = fixture(t); write(join(root, 'src/app.ts'), "import '/workspace/tiny-robot/packages/chat/src/index.ts';");
  failing(report(root), /source|private/i);
});
test('requires the browser-facing experimental export target', t => {
  const root = fixture(t); const path = join(root, 'node_modules', chat, 'package.json');
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  manifest.exports['./experimental'] = { types: './experimental.d.ts', browser: './browser.js', node: './experimental.js', import: './browser.js' };
  write(path, JSON.stringify(manifest));
  failing(report(root), /browser/i);
  write(join(root, 'node_modules', chat, 'browser.js'), 'export {};');
  assert.equal(report(root).ok, true);
});
test('rejects a directory as the browser experimental entry', t => {
  const root = fixture(t); const path = join(root, 'node_modules', chat, 'package.json');
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  manifest.exports['./experimental'] = { browser: './browser.js', node: './experimental.js', import: './browser.js' };
  write(path, JSON.stringify(manifest)); mkdirSync(join(root, 'node_modules', chat, 'browser.js'));
  failing(report(root), /browser/i);
});
test("rejects Yarn Plug'n'Play with an explicit unsupported message", t => { const root = fixture(t); write(join(root, '.pnp.cjs'), ''); failing(report(root), /plug.n.play.*unsupported/i); });
test('rejects a tracked .env.local file', t => { const root = fixture(t); execFileSync('git', ['init', '-q', root]); write(join(root, '.env.local'), 'KEY=x'); execFileSync('git', ['-C', root, 'add', '.env.local']); failing(report(root), /env.local/i); });
test('rejects a test secret in source maps or build output', t => { const root = fixture(t); write(join(root, 'dist/main.js.map'), 'fake-secret'); failing(report(root, { buildDirs: ['dist'], testSecret: 'fake-secret' }), /secret/i); });
test('reports every check without modifying the consumer', t => {
  const root = fixture(t); write(join(root, '.pnp.cjs'), ''); write(join(root, 'src/app.ts'), `import '${chat}/src/private';`);
  const before = readFileSync(join(root, 'src/app.ts'), 'utf8'); const result = report(root);
  assert.ok(result.checks.length >= 5); assert.ok(result.checks.filter(c => !c.ok).length >= 2); assert.equal(readFileSync(join(root, 'src/app.ts'), 'utf8'), before);
  const cli = spawnSync(process.execPath, ['skills/trchat-angular-integration/scripts/verify-consumer.mjs', root], { encoding: 'utf8' }); assert.equal(cli.status, 1); assert.equal(JSON.parse(cli.stdout).ok, false);
});

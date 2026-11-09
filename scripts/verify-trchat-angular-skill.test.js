import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, readFileSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { verifyAngularConsumer } from '../skills/trchat-angular-integration/scripts/verify-consumer.mjs';

const chat = '@opentiny/tiny-robot-chat';
const kit = '@opentiny/tiny-robot-kit';
const robot = '@opentiny/tiny-robot';
const svgs = '@opentiny/tiny-robot-svgs';
const version = '1.0.0-rc.9';
const chatTarball = 'file:./candidate/opentiny-tiny-robot-chat-1.0.0-rc.9.tgz';
const kitTarball = 'file:./candidate/opentiny-tiny-robot-kit-1.0.0-rc.9.tgz';
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
  assert.equal((guidance.match(/content\['text'\]/g) || []).length, 2);
  assert.doesNotMatch(guidance, /content\.text\b/);
});
test('advanced guidance is linked and keeps credentials outside browser configuration', () => {
  const entry = readFileSync('skills/trchat-angular-integration/SKILL.md', 'utf8');
  for (const name of ['advanced-capabilities', 'troubleshooting']) {
    assert.match(entry, new RegExp(`\\]\\(references/${name}\\.md\\)`));
  }
  const guidance = ['SKILL.md', 'references/advanced-capabilities.md', 'references/troubleshooting.md', 'references/angular-host-modes.md', 'references/renderers.md']
    .map(path => readFileSync(join('skills/trchat-angular-integration', path), 'utf8')).join('\n');
  assertSafeExamples(guidance);
});
test('advanced guidance uses the rc.9 unified model feature-value contract', () => {
  const guidance = readFileSync('skills/trchat-angular-integration/references/advanced-capabilities.md', 'utf8');
  assert.match(guidance, /model-feature-value-change/);
  assert.match(guidance, /features[^\n]*switch\/select fields/);
  assert.doesNotMatch(guidance, /model-feature-change|model-reasoning-effort-change|featureBody|effortParam/);
});
function assertSafeExamples(guidance) {
  // Examples are intentionally stricter than prose: never demonstrate this key
  // or credential assignments in a runtimeOptions code block.
  for (const match of guidance.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) {
    const code = match[1];
    assert.doesNotMatch(code, /\bDEEPSEEK_API_KEY\b/i);
    if (/\bruntimeOptions\b/.test(code)) {
      assert.doesNotMatch(code, /\b(?:apiKey|secret|token)\s*(?::|=)/i);
    }
  }
}
test('credential checks reject multiline environment and indirect runtime examples', () => {
  const unsafe = [
    '```ts\n// src/environments/environment.ts\nexport const environment = {\n  DEEPSEEK_API_KEY: \'secret\',\n};\n```',
    '```ts\nconst options = {};\nelement.runtimeOptions = options;\noptions.apiKey = \'secret\';\n```',
  ];
  for (const example of unsafe) assert.throws(() => assertSafeExamples(example));
  assert.doesNotThrow(() => assertSafeExamples('```ts\nconst options = { modelProviders: [] };\nelement.runtimeOptions = options;\n```'));
  assert.doesNotThrow(() => assertSafeExamples('Never put DEEPSEEK_API_KEY in browser configuration.'));
});
test('Angular NgModule guidance opts the component out of standalone mode', () => {
  const guidance = readFileSync('skills/trchat-angular-integration/references/angular-host-modes.md', 'utf8');
  assert.match(guidance, /NgModule[^\n]*standalone: false/);
});
test('skill distinguishes the rc.9 source baseline from the registry package without Web Components', () => {
  const entry = readFileSync('skills/trchat-angular-integration/SKILL.md', 'utf8');
  assert.match(entry, /published[^\n]*1\.0\.0-rc\.9[^\n]*does not include[^\n]*Web Component/i);
  assert.match(entry, /local[^\n]*\.tgz/i);
  assert.match(entry, /\.\/experimental/);
  assert.match(entry, /experimental\/web-component\.css/);
});
function write(path, text) { mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, text); }
function fixture(t, pnpm = false) {
  const root = mkdtempSync(join(tmpdir(), 'trchat-consumer-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(join(root, 'package.json'), JSON.stringify({ dependencies: { [chat]: chatTarball } }));
  write(join(root, 'candidate/opentiny-tiny-robot-chat-1.0.0-rc.9.tgz'), 'candidate');
  write(join(root, 'candidate/opentiny-tiny-robot-kit-1.0.0-rc.9.tgz'), 'candidate');
  if (pnpm) {
    write(join(root, 'pnpm-lock.yaml'), `lockfileVersion: '9.0'\nimporters:\n  .:\n    dependencies:\n      '${chat}':\n        specifier: ${chatTarball}\n      '${kit}':\n        specifier: ${kitTarball}\n`);
  } else {
    write(join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { '': { dependencies: { [chat]: chatTarball, [kit]: kitTarball } }, [`node_modules/${chat}`]: { resolved: chatTarball }, [`node_modules/${kit}`]: { resolved: kitTarball } } }));
  }
  write(join(root, 'src/app.ts'), `import '${chat}/experimental';`);
  const target = pnpm ? join(root, 'node_modules/.pnpm/chat/node_modules', chat) : join(root, 'node_modules', chat);
  write(join(target, 'package.json'), JSON.stringify({ name: chat, version, type: 'module', exports: { './experimental': './experimental.js', './experimental/web-component.css': './style.css' }, dependencies: { [robot]: version, [kit]: version, [svgs]: version }, peerDependencies: { vue: '^3.3.11' } }));
  write(join(target, 'experimental.js'), 'export {};');
  write(join(target, 'style.css'), '');
  const modules = pnpm ? join(root, 'node_modules/.pnpm/chat/node_modules') : join(root, 'node_modules');
  for (const name of [robot, kit, svgs, 'vue']) {
    const dir = join(modules, name);
    write(join(dir, 'package.json'), JSON.stringify({ name, version: name === 'vue' ? '3.4.0' : version, ...(name === svgs ? {} : { main: './index.js' }), ...(name !== 'vue' ? { peerDependencies: { vue: name === robot ? '^3.3.11' : '>=3.0.0', ...(name === robot ? { [kit]: version } : {}) }, ...(name === robot ? { dependencies: { [svgs]: version } } : {}) } : {}) }));
    if (name !== svgs) write(join(dir, 'index.js'), '');
  }
  if (pnpm) { mkdirSync(join(root, 'node_modules/@opentiny'), { recursive: true }); symlinkSync(target, join(root, 'node_modules', chat), 'dir'); }
  return root;
}
function report(root, options = {}) { return verifyAngularConsumer({ projectRoot: root, ...options }); }
function failing(result, pattern) { assert.equal(result.ok, false); assert.match(result.checks.filter(c => !c.ok).map(c => c.detail).join(' '), pattern); }
test('accepts an npm-style rc.9 Web Component candidate consumer', t => { assert.equal(report(fixture(t)).ok, true); });
test('accepts a pnpm-style rc.9 Web Component candidate consumer', t => { assert.equal(report(fixture(t, true)).ok, true); });
test('accepts local rc.9 candidate tarball dependency declarations', t => {
  const root = fixture(t);
  write(join(root, 'package.json'), JSON.stringify({ dependencies: {
    [chat]: chatTarball,
    [kit]: kitTarball,
  } }));
  write(join(root, 'src/app.ts'), `import '${kit}';`);
  assert.equal(report(root).ok, true);
});
test('rejects a missing candidate tarball even when stale candidate files are installed', t => {
  const root = fixture(t);
  write(join(root, 'package.json'), JSON.stringify({ dependencies: { [chat]: 'file:./candidate/missing.tgz' } }));
  write(join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { '': { dependencies: { [chat]: 'file:./candidate/missing.tgz' } }, [`node_modules/${chat}`]: { resolved: 'file:./candidate/missing.tgz' } } }));
  failing(report(root), /does not exist|regular file/i);
});
test('rejects a lockfile that resolves a different candidate tarball', t => {
  const root = fixture(t);
  write(join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { '': { dependencies: { [chat]: chatTarball } }, [`node_modules/${chat}`]: { resolved: kitTarball } } }));
  failing(report(root), /lockfile/i);
});
test('rejects a pnpm root specifier mismatch even when another lock section contains the candidate path', t => {
  const root = fixture(t, true);
  write(join(root, 'pnpm-lock.yaml'), `lockfileVersion: '9.0'\nimporters:\n  .:\n    dependencies:\n      '${chat}':\n        specifier: file:./candidate/other.tgz\npackages:\n  unrelated:\n    resolution: {tarball: ${chatTarball}}\n`);
  failing(report(root), /pnpm root importer/i);
});
test('rejects a bare registry rc.9 dependency even when stale candidate files are installed', t => {
  const root = fixture(t);
  write(join(root, 'package.json'), JSON.stringify({ dependencies: { [chat]: version } }));
  failing(report(root), /local candidate \.tgz/i);
});
test('rejects a wrong chat or direct kit version', t => {
  const root = fixture(t); write(join(root, 'package.json'), JSON.stringify({ dependencies: { [chat]: '^1.0.0-rc.9', [kit]: '1.0.0' } }));
  write(join(root, 'src/app.ts'), `import '${kit}';`);
  failing(report(root), /local candidate/i);
});
test('checks installed versions and direct Kit imports', t => {
  const root = fixture(t);
  write(join(root, 'package.json'), JSON.stringify({ dependencies: { [chat]: chatTarball, [kit]: kitTarball } }));
  write(join(root, 'src/app.ts'), `import '${kit}';`);
  write(join(root, 'node_modules', kit, 'package.json'), JSON.stringify({ name: kit, version, main: './index.js', peerDependencies: { vue: '>=3.0.0' } }));
  write(join(root, 'node_modules', kit, 'index.js'), '');
  assert.equal(report(root).ok, true);
  write(join(root, 'node_modules', kit, 'package.json'), JSON.stringify({ name: kit, version: '1.0.0', main: './index.js', peerDependencies: { vue: '>=3.0.0' } }));
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
test('rejects the published registry rc.9 manifest without Web Component exports', t => {
  const root = fixture(t);
  const path = join(root, 'node_modules', chat, 'package.json');
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  delete manifest.exports;
  write(path, JSON.stringify(manifest));
  failing(report(root), /experimental|browser|style\.css/i);
});
test('rejects package realpaths outside the consumer node_modules tree', t => {
  const root = fixture(t); const path = join(root, 'node_modules', chat); const outside = join(root, 'linked-chat');
  rmSync(path, { recursive: true }); write(join(outside, 'package.json'), JSON.stringify({ name: chat, version, exports: { './experimental': './index.js', './experimental/web-component.css': './style.css' } })); write(join(outside, 'index.js'), ''); write(join(outside, 'style.css'), ''); symlinkSync(outside, path, 'dir');
  failing(report(root), /node_modules/i);
});

test('rejects a transitive package linked outside consumer node_modules', t => {
  const root = fixture(t); const path = join(root, 'node_modules', robot); const outside = join(root, 'linked-robot');
  rmSync(path, { recursive: true }); write(join(outside, 'package.json'), JSON.stringify({ name: robot, version, main: './index.js' })); write(join(outside, 'index.js'), ''); symlinkSync(outside, path, 'dir');
  failing(report(root), /tiny-robot.*node_modules/i);
});
test('rejects a missing installed Vue', t => {
  const root = fixture(t); rmSync(join(root, 'node_modules/vue'), { recursive: true });
  failing(report(root), /vue/i);
});
test('rejects Vue incompatible with Chat or Kit peer ranges', t => {
  const root = fixture(t); const path = join(root, 'node_modules/vue/package.json');
  write(path, JSON.stringify({ name: 'vue', version: '2.7.0', main: './index.js' }));
  failing(report(root), /vue.*peer/i);
  write(path, JSON.stringify({ name: 'vue', version: '3.4.0', main: './index.js' }));
  const kitPath = join(root, 'node_modules', kit, 'package.json');
  const manifest = JSON.parse(readFileSync(kitPath, 'utf8')); manifest.peerDependencies.vue = '^4.0.0'; write(kitPath, JSON.stringify(manifest));
  failing(report(root), /vue.*peer/i);
});

test('runs as a standalone copied verifier', t => {
  const root = fixture(t); const isolated = mkdtempSync(join(tmpdir(), 'trchat-verifier-'));
  t.after(() => rmSync(isolated, { recursive: true, force: true }));
  const script = join(isolated, 'verify-consumer.mjs');
  copyFileSync('skills/trchat-angular-integration/scripts/verify-consumer.mjs', script);
  const result = spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
test('checks nested robot dependency and peer package copies', t => {
  for (const name of [kit, svgs]) {
    const root = fixture(t, true); const nested = join(root, 'node_modules/.pnpm/chat/node_modules', robot, 'node_modules', name);
    write(join(nested, 'package.json'), JSON.stringify({ name, version: '1.0.0', main: './index.js', peerDependencies: { vue: '>=3.0.0' } }));
    write(join(nested, 'index.js'), '');
    failing(report(root), /installed version/i);
  }
});
test('checks the Vue resolved by a directly declared Kit copy', t => {
  const root = fixture(t, true);
  write(join(root, 'package.json'), JSON.stringify({ dependencies: { [chat]: chatTarball, [kit]: kitTarball } }));
  const directKit = join(root, 'node_modules', kit);
  write(join(directKit, 'package.json'), JSON.stringify({ name: kit, version, main: './index.js', peerDependencies: { vue: '>=3.0.0' } }));
  write(join(directKit, 'index.js'), '');
  write(join(directKit, 'node_modules/vue/package.json'), JSON.stringify({ name: 'vue', version: '2.7.0', main: './index.js' }));
  write(join(directKit, 'node_modules/vue/index.js'), '');
  failing(report(root), /vue.*peer/i);
});
test('rejects malformed, prerelease, and too-old Vue versions', t => {
  const root = fixture(t); const path = join(root, 'node_modules/vue/package.json');
  for (const vueVersion of ['3.3.10', '3.3.11-rc.1', '03.4.0', '3.4']) {
    write(path, JSON.stringify({ name: 'vue', version: vueVersion, main: './index.js' }));
    failing(report(root), /vue.*peer/i);
  }
  write(path, JSON.stringify({ name: 'vue', version: '3.3.11+build.1', main: './index.js' }));
  assert.equal(report(root).ok, true);
});
test('checks frozen Vue peer declarations and incompatible Vue versions', t => {
  const root = fixture(t); const robotManifest = join(root, 'node_modules', robot, 'package.json');
  const manifest = JSON.parse(readFileSync(robotManifest, 'utf8')); manifest.peerDependencies.vue = '>=2.0.0'; write(robotManifest, JSON.stringify(manifest));
  failing(report(root), /vue.*peer/i);
});
test('checks Angular configured source roots for private imports', t => {
  const root = fixture(t);
  write(join(root, 'angular.json'), JSON.stringify({ projects: { chat: { sourceRoot: 'projects/chat/src' } } }));
  const source = join(root, 'projects/chat/src/app.ts');
  write(source, `import '${chat}/src/private';`);
  failing(report(root), /private.*source/i);
});
test('checks Angular configured source roots for direct Kit usage', t => {
  const root = fixture(t);
  write(join(root, 'angular.json'), JSON.stringify({ projects: { chat: { sourceRoot: 'projects/chat/src' } } }));
  write(join(root, 'projects/chat/src/app.ts'), `import '${kit}';`);
  failing(report(root), /local candidate/i);
});
test('accepts Angular JSONC and scans its configured source root', t => {
  const root = fixture(t);
  write(join(root, 'angular.json'), `{
    // Angular CLI accepts comments and trailing commas.
    "version": 1,
    "projects": {
      "chat": {
        "sourceRoot": "projects/chat/src",
      },
    },
  }`);
  const source = join(root, 'projects/chat/src/app.ts');
  write(source, `export const marker = 'safe';`);
  assert.equal(report(root).ok, true);
  write(source, `import '${chat}/src/private';`);
  failing(report(root), /private.*source/i);
});
test('fails clearly when no source files are covered', t => {
  const root = fixture(t); rmSync(join(root, 'src'), { recursive: true });
  failing(report(root), /no source files/i);
});
test('accepts unrelated local package source imports', t => {
  const root = fixture(t); write(join(root, 'src/app.ts'), `import '../packages/domain/src/index';`);
  assert.equal(report(root).ok, true);
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

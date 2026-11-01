import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import semver from 'semver';

const CHAT = '@opentiny/tiny-robot-chat';
const KIT = '@opentiny/tiny-robot-kit';
const TRANSITIVE = ['@opentiny/tiny-robot', KIT, '@opentiny/tiny-robot-svgs'];
const VERSION = '1.0.0-alpha.0';
const inside = (root, path) => { const rel = relative(root, path); return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel); };
function files(dir, excluded = new Set()) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (excluded.has(entry.name) || entry.isSymbolicLink()) return [];
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path, excluded) : entry.isFile() ? [path] : [];
  });
}
function packageManifest(req, name, entry) {
  let resolved;
  try { resolved = req.resolve(`${name}/package.json`); }
  catch { resolved = req.resolve(entry); }
  let dir = dirname(realpathSync(resolved));
  while (true) {
    const file = join(dir, 'package.json');
    if (existsSync(file)) {
      const manifest = JSON.parse(readFileSync(file, 'utf8'));
      if (manifest.name === name) return { manifest, dir: realpathSync(dir) };
    }
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`Cannot find manifest for ${name}`);
    dir = parent;
  }
}
export function verifyAngularConsumer({ projectRoot, buildDirs = [], testSecret } = {}) {
  const checks = [];
  const check = (name, fn) => {
    try { const detail = fn(); checks.push({ name, ok: true, detail }); }
    catch (error) { checks.push({ name, ok: false, detail: error.message }); }
  };
  const root = resolve(projectRoot || '.');
  let manifest = {};
  let sources = [];
  const req = createRequire(join(root, 'package.json'));
  check('package manager', () => {
    if (existsSync(join(root, '.pnp.cjs')) || existsSync(join(root, '.pnp.js'))) throw new Error("Yarn Plug'n'Play is unsupported; use npm or pnpm node_modules");
    return 'Supported node_modules layout';
  });
  check('consumer manifest', () => { manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')); return 'Consumer manifest read'; });
  check('source imports', () => {
    sources = files(join(root, 'src'), new Set(['node_modules', '.git'])).filter(path => /\.(?:[cm]?[jt]sx?|html|vue)$/.test(path)).map(path => readFileSync(path, 'utf8'));
    if (sources.some(text => /(?:["'`])(?:@opentiny\/tiny-robot[^"'`]*\/(?:src|packages)\/|(?:(?:\.\.\/)+|\/)[^"'`]*(?:tiny-robot\/)?packages\/[^"'`]*\/src\/)/.test(text))) throw new Error('Private monorepo source import detected');
    return 'No private monorepo source imports detected';
  });
  const directKit = () => sources.some(text => /["'`]@opentiny\/tiny-robot-kit(?:\/[^"'`]*)?["'`]/.test(text));
  check('dependency versions', () => {
    const deps = { ...manifest.devDependencies, ...manifest.dependencies };
    if (deps[CHAT] !== VERSION || ((directKit() || deps[KIT] !== undefined) && deps[KIT] !== VERSION)) throw new Error(`Direct dependency version must be ${VERSION} for Chat and directly used Kit`);
    return 'Direct dependency versions match alpha';
  });
  const installedPackage = (resolver, name, entry) => {
    const installed = packageManifest(resolver, name, entry);
    const modules = realpathSync(join(root, 'node_modules'));
    if (!inside(realpathSync(root), modules) || !inside(modules, installed.dir)) throw new Error(`${name} realpath is outside consumer node_modules`);
    return installed;
  };
  const checkOpenTiny = (resolver, name, entry) => {
    const installed = installedPackage(resolver, name, entry);
    if (installed.manifest.version !== VERSION) throw new Error(`${name} installed version must be ${VERSION}`);
    for (const section of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
      if (Object.values(installed.manifest[section] || {}).some(value => typeof value === 'string' && value.startsWith('workspace:'))) throw new Error(`${name} installed manifest contains a workspace dependency`);
    }
    return installed;
  };
  check(`${CHAT} installation`, () => {
    checkOpenTiny(req, CHAT, `${CHAT}/experimental`);
    return `${CHAT} ${VERSION} resolved inside consumer node_modules`;
  });
  for (const name of TRANSITIVE) {
    check(`${name} installation`, () => {
      const chat = installedPackage(req, CHAT, `${CHAT}/experimental`);
      const chatReq = createRequire(join(chat.dir, 'package.json'));
      checkOpenTiny(chatReq, name, name);
      if (name === KIT && (directKit() || manifest.dependencies?.[KIT] || manifest.devDependencies?.[KIT])) checkOpenTiny(req, KIT, KIT);
      return `${name} ${VERSION} resolved inside consumer node_modules`;
    });
  }
  check('Vue peer compatibility', () => {
    const chat = installedPackage(req, CHAT, `${CHAT}/experimental`);
    const chatReq = createRequire(join(chat.dir, 'package.json'));
    const kit = installedPackage(chatReq, KIT, KIT);
    for (const [name, installed] of [[CHAT, chat], [KIT, kit]]) {
      const resolver = createRequire(join(installed.dir, 'package.json'));
      const vue = installedPackage(resolver, 'vue', 'vue');
      const range = installed.manifest.peerDependencies?.vue;
      if (range && !semver.satisfies(vue.manifest.version, range)) throw new Error(`Vue ${vue.manifest.version} does not satisfy ${name} peer range ${range}`);
    }
    return 'Vue satisfies installed Chat and Kit peer ranges';
  });
  check('public exports', () => {
    for (const entry of [`${CHAT}/experimental`, `${CHAT}/experimental/web-component.css`]) realpathSync(req.resolve(entry));
    const installed = packageManifest(req, CHAT, `${CHAT}/experimental`);
    const browserTarget = (value) => {
      if (typeof value === 'string') return value;
      if (!value || typeof value !== 'object') return undefined;
      for (const [condition, target] of Object.entries(value)) {
        if (['browser', 'import', 'default'].includes(condition)) {
          const selected = browserTarget(target);
          if (selected) return selected;
        }
      }
    };
    const target = browserTarget(installed.manifest.exports?.['./experimental']);
    if (!target || !target.startsWith('./')) throw new Error('Browser experimental export target is missing');
    const path = resolve(installed.dir, target);
    if (!inside(installed.dir, path) || !existsSync(path) || !statSync(path).isFile() || !inside(installed.dir, realpathSync(path))) throw new Error('Browser experimental export target does not resolve inside the package');
    return 'Experimental browser entry and CSS exports resolve';
  });
  check('local environment file', () => {
    const git = (...args) => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' });
    if (git('rev-parse', '--is-inside-work-tree').status !== 0) return 'Not a Git project';
    const tracked = git('ls-files', '--', '.env.local');
    if (tracked.status !== 0) throw new Error('Unable to inspect tracked .env.local');
    if (tracked.stdout.trim()) throw new Error('.env.local is tracked by Git');
    const ignored = git('check-ignore', '-q', '--', '.env.local');
    if (ignored.status !== 0) throw new Error('.env.local is not ignored by Git');
    return '.env.local is ignored and untracked';
  });
  check('build output secret', () => {
    if (!testSecret) return 'No test secret supplied';
    for (const dir of buildDirs) {
      const path = resolve(root, dir);
      if (!existsSync(path)) throw new Error(`Build directory does not exist: ${dir}`);
      for (const file of files(path)) if (readFileSync(file).includes(Buffer.from(testSecret))) throw new Error(`Test secret found in build output: ${relative(root, file)}`);
    }
    return buildDirs.length ? 'Test secret absent from supplied build output' : 'No build directories supplied';
  });
  return { ok: checks.every(item => item.ok), checks };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2); const options = { projectRoot: undefined, buildDirs: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--build-dir' && args[i + 1]) options.buildDirs.push(args[++i]);
    else if (args[i] === '--test-secret' && args[i + 1]) options.testSecret = args[++i];
    else if (!args[i].startsWith('-') && !options.projectRoot) options.projectRoot = args[i];
    else { console.error('Usage: verify-consumer.mjs <projectRoot> [--build-dir DIR] [--test-secret VALUE]'); process.exit(2); }
  }
  if (!options.projectRoot) { console.error('Usage: verify-consumer.mjs <projectRoot> [--build-dir DIR] [--test-secret VALUE]'); process.exit(2); }
  const result = verifyAngularConsumer(options); console.log(JSON.stringify(result, null, 2)); process.exitCode = result.ok ? 0 : 1;
}

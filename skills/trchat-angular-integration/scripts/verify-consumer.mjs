import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const CHAT = '@opentiny/tiny-robot-chat';
const KIT = '@opentiny/tiny-robot-kit';
const ROBOT = '@opentiny/tiny-robot';
const SVGS = '@opentiny/tiny-robot-svgs';
const EDGES = { [CHAT]: [ROBOT, KIT, SVGS], [ROBOT]: [KIT, SVGS], [KIT]: [], [SVGS]: [] };
const VERSION = '1.0.0-rc.9';
const inside = (root, path) => { const rel = relative(root, path); return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel); };
function files(dir, excluded = new Set()) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (excluded.has(entry.name) || entry.isSymbolicLink()) return [];
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path, excluded) : entry.isFile() ? [path] : [];
  });
}
function parseJsonc(text) {
  let withoutComments = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (inString) {
      withoutComments += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') {
      inString = true;
      withoutComments += char;
    } else if (char === '/' && next === '/') {
      while (i + 1 < text.length && text[i + 1] !== '\n' && text[i + 1] !== '\r') i++;
    } else if (char === '/' && next === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        if (text[i] === '\n' || text[i] === '\r') withoutComments += text[i];
        i++;
      }
      if (i >= text.length) throw new SyntaxError('Unterminated block comment in JSONC');
      i++;
    } else {
      withoutComments += char;
    }
  }

  let withoutTrailingCommas = '';
  inString = false;
  escaped = false;
  for (let i = 0; i < withoutComments.length; i++) {
    const char = withoutComments[i];
    if (inString) {
      withoutTrailingCommas += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') {
      inString = true;
      withoutTrailingCommas += char;
    } else if (char === ',') {
      let next = i + 1;
      while (/\s/.test(withoutComments[next] || '')) next++;
      if (withoutComments[next] !== '}' && withoutComments[next] !== ']') withoutTrailingCommas += char;
    } else {
      withoutTrailingCommas += char;
    }
  }
  return JSON.parse(withoutTrailingCommas);
}
function yamlScalar(value) {
  const scalar = value.trim();
  if (scalar.startsWith("'") && scalar.endsWith("'")) return scalar.slice(1, -1).replace(/''/g, "'");
  if (scalar.startsWith('"') && scalar.endsWith('"')) return JSON.parse(scalar);
  return scalar;
}
function pnpmRootDependencySpecifier(text, name) {
  let importers = false;
  let rootImporter = false;
  let dependencySection = false;
  let selectedDependency = false;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    const colon = trimmed.indexOf(':');
    if (colon < 0) continue;
    const key = yamlScalar(trimmed.slice(0, colon));
    const value = trimmed.slice(colon + 1);
    if (indent === 0) {
      importers = key === 'importers';
      rootImporter = false;
      dependencySection = false;
      selectedDependency = false;
      continue;
    }
    if (indent === 2) {
      rootImporter = importers && key === '.';
      dependencySection = false;
      selectedDependency = false;
      continue;
    }
    if (!rootImporter) continue;
    if (indent === 4) {
      dependencySection = ['dependencies', 'devDependencies', 'optionalDependencies'].includes(key);
      selectedDependency = false;
      continue;
    }
    if (!dependencySection) continue;
    if (indent === 6) {
      selectedDependency = key === name;
      continue;
    }
    if (selectedDependency && indent === 8 && key === 'specifier') return yamlScalar(value);
  }
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
    const roots = new Set([join(root, 'src')]);
    const angularPath = join(root, 'angular.json');
    if (existsSync(angularPath)) {
      const angular = parseJsonc(readFileSync(angularPath, 'utf8'));
      for (const project of Object.values(angular.projects || {})) {
        if (typeof project?.sourceRoot === 'string') roots.add(resolve(root, project.sourceRoot));
      }
    }
    const paths = new Set();
    for (const sourceRoot of roots) {
      if (sourceRoot !== root && !inside(root, sourceRoot)) throw new Error(`Angular source root is outside consumer project: ${sourceRoot}`);
      for (const path of files(sourceRoot, new Set(['node_modules', '.git']))) {
        if (/\.(?:[cm]?[jt]sx?|html|vue)$/.test(path)) paths.add(path);
      }
    }
    if (!paths.size) throw new Error('No source files found in consumer source roots');
    sources = [...paths].map(path => readFileSync(path, 'utf8'));
    if (sources.some(text => /(?:["'`])(?:@opentiny\/tiny-robot[^"'`]*\/(?:src|packages)\/|(?:(?:\.\.\/)+|\/)[^"'`]*tiny-robot\/packages\/[^"'`]*\/src\/)/.test(text))) throw new Error('Private monorepo source import detected');
    return 'No private monorepo source imports detected';
  });
  const directKit = () => sources.some(text => /["'`]@opentiny\/tiny-robot-kit(?:\/[^"'`]*)?["'`]/.test(text));
  const verifyCandidateDependency = (name, value) => {
    if (typeof value !== 'string' || !/^file:.+\.tgz$/.test(value)) throw new Error(`Direct dependency ${name} must use a local candidate .tgz; registry ${VERSION} lacks the Web Component`);
    const tarball = resolve(root, value.slice('file:'.length));
    if (!existsSync(tarball) || !statSync(tarball).isFile()) throw new Error(`Candidate tarball for ${name} does not exist as a regular file: ${tarball}`);

    const pnpmLock = join(root, 'pnpm-lock.yaml');
    const npmLock = join(root, 'package-lock.json');
    if (existsSync(pnpmLock)) {
      if (pnpmRootDependencySpecifier(readFileSync(pnpmLock, 'utf8'), name) !== value) throw new Error(`pnpm root importer does not record ${name} candidate specifier ${value}`);
    } else if (existsSync(npmLock)) {
      const lock = JSON.parse(readFileSync(npmLock, 'utf8'));
      const locked = lock.packages?.[`node_modules/${name}`]?.resolved;
      if (lock.packages?.['']?.dependencies?.[name] !== value || typeof locked !== 'string' || !locked.startsWith('file:') || resolve(root, locked.slice('file:'.length)) !== tarball) throw new Error(`npm lockfile does not record ${name} candidate tarball ${value}`);
    } else {
      throw new Error('A matching pnpm-lock.yaml or package-lock.json is required for candidate provenance');
    }
  };
  check('dependency versions', () => {
    const deps = { ...manifest.devDependencies, ...manifest.dependencies };
    verifyCandidateDependency(CHAT, deps[CHAT]);
    if (directKit() || deps[KIT] !== undefined) verifyCandidateDependency(KIT, deps[KIT]);
    return 'Direct dependencies and lockfile use existing local candidate tarballs';
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
  check('OpenTiny dependency graph and Vue peers', () => {
    const visited = new Set();
    const visit = (resolver, name, entry = name) => {
      const installed = checkOpenTiny(resolver, name, entry);
      if (visited.has(installed.dir)) return;
      visited.add(installed.dir);
      const packageReq = createRequire(join(installed.dir, 'package.json'));
      const expectedRange = name === CHAT || name === ROBOT ? '^3.3.11' : '>=3.0.0';
      if (installed.manifest.peerDependencies?.vue !== expectedRange) throw new Error(`${name} Vue peer range must be ${expectedRange}`);
      const vue = installedPackage(packageReq, 'vue', 'vue');
      const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(vue.manifest.version || '');
      const parts = match?.slice(1, 4).map(BigInt);
      const compatible = parts && (expectedRange === '^3.3.11'
        ? parts[0] === 3n && (parts[1] > 3n || (parts[1] === 3n && parts[2] >= 11n))
        : parts[0] >= 3n);
      if (!compatible) throw new Error(`Vue ${vue.manifest.version} does not satisfy ${name} peer range ${expectedRange}`);
      for (const child of EDGES[name]) visit(packageReq, child);
    };
    visit(req, CHAT, `${CHAT}/experimental`);
    if (directKit() || manifest.dependencies?.[KIT] || manifest.devDependencies?.[KIT]) visit(req, KIT);
    return 'OpenTiny dependency graph and Vue peer ranges verified';
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

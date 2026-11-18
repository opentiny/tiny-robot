import Prism from "prismjs";

type Loader = () => Promise<unknown>;

/** Prism 核心自带的语言，无需加载 */
const builtin: Loader = () => Promise.resolve();

/** 语言包注册到全局 Prism 上，依赖的语言要先加载 */
const after =
  (deps: Loader[], load: Loader): Loader =>
  () =>
    Promise.all(deps.map((dep) => dep())).then(load);

const c: Loader = () => import("prismjs/components/prism-c.min.js");
const java: Loader = () => import("prismjs/components/prism-java.min.js");
const jsx: Loader = () => import("prismjs/components/prism-jsx.min.js");
const typescript: Loader = () => import("prismjs/components/prism-typescript.min.js");

/** 只保留常用语言，其余按纯文本显示；key 为 Prism 语言名 */
const loaders: Record<string, Loader> = {
  markup: builtin,
  css: builtin,
  clike: builtin,
  javascript: builtin,
  bash: () => import("prismjs/components/prism-bash.min.js"),
  c,
  cpp: after([c], () => import("prismjs/components/prism-cpp.min.js")),
  csharp: () => import("prismjs/components/prism-csharp.min.js"),
  dart: () => import("prismjs/components/prism-dart.min.js"),
  diff: () => import("prismjs/components/prism-diff.min.js"),
  docker: () => import("prismjs/components/prism-docker.min.js"),
  go: () => import("prismjs/components/prism-go.min.js"),
  graphql: () => import("prismjs/components/prism-graphql.min.js"),
  haskell: () => import("prismjs/components/prism-haskell.min.js"),
  ini: () => import("prismjs/components/prism-ini.min.js"),
  java,
  json: () => import("prismjs/components/prism-json.min.js"),
  jsx,
  kotlin: () => import("prismjs/components/prism-kotlin.min.js"),
  latex: () => import("prismjs/components/prism-latex.min.js"),
  lua: () => import("prismjs/components/prism-lua.min.js"),
  makefile: () => import("prismjs/components/prism-makefile.min.js"),
  markdown: () => import("prismjs/components/prism-markdown.min.js"),
  matlab: () => import("prismjs/components/prism-matlab.min.js"),
  mermaid: () => import("prismjs/components/prism-mermaid.min.js"),
  nginx: () => import("prismjs/components/prism-nginx.min.js"),
  objectivec: after([c], () => import("prismjs/components/prism-objectivec.min.js")),
  perl: () => import("prismjs/components/prism-perl.min.js"),
  php: after(
    [() => import("prismjs/components/prism-markup-templating.min.js")],
    () => import("prismjs/components/prism-php.min.js"),
  ),
  powershell: () => import("prismjs/components/prism-powershell.min.js"),
  protobuf: () => import("prismjs/components/prism-protobuf.min.js"),
  python: () => import("prismjs/components/prism-python.min.js"),
  r: () => import("prismjs/components/prism-r.min.js"),
  ruby: () => import("prismjs/components/prism-ruby.min.js"),
  rust: () => import("prismjs/components/prism-rust.min.js"),
  scala: after([java], () => import("prismjs/components/prism-scala.min.js")),
  scss: () => import("prismjs/components/prism-scss.min.js"),
  sql: () => import("prismjs/components/prism-sql.min.js"),
  swift: () => import("prismjs/components/prism-swift.min.js"),
  toml: () => import("prismjs/components/prism-toml.min.js"),
  tsx: after([jsx, typescript], () => import("prismjs/components/prism-tsx.min.js")),
  typescript,
  yaml: () => import("prismjs/components/prism-yaml.min.js"),
};

/** 代码块语言名 → Prism 语言名 */
const aliases: Record<string, string> = {
  html: "markup",
  xml: "markup",
  vue: "markup",
  js: "javascript",
  ts: "typescript",
  shell: "bash",
  sh: "bash",
  zsh: "bash",
  "c++": "cpp",
  cc: "cpp",
  cplusplus: "cpp",
  cs: "csharp",
  "c#": "csharp",
  dockerfile: "docker",
  golang: "go",
  hs: "haskell",
  kt: "kotlin",
  tex: "latex",
  mk: "makefile",
  md: "markdown",
  objc: "objectivec",
  py: "python",
  rb: "ruby",
  rs: "rust",
  yml: "yaml",
};

/** 支持高亮时返回 Prism 语言名，否则返回 null */
export function getHighlightLang(infostring: string): string | null {
  const lang = Object.hasOwn(aliases, infostring) ? aliases[infostring] : infostring;
  return Object.hasOwn(loaders, lang) ? lang : null;
}

export function isHighlightLoaded(lang: string): boolean {
  return Object.hasOwn(Prism.languages, lang);
}

export function loadHighlight(lang: string): Promise<unknown> {
  return loaders[lang]();
}

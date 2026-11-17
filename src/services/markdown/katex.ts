export type Katex = typeof import("katex").default;

let katex: Katex | null = null;
let katexPromise: Promise<Katex> | null = null;

/** 按需加载 KaTeX 及其样式、化学公式扩展；已加载时同步返回 */
export const ensureKatex = (): Katex | Promise<Katex> => {
  if (katex !== null) {
    return katex;
  }
  katexPromise ??= Promise.all([
    import("katex"),
    import("katex/contrib/mhchem"),
    import("katex/dist/katex.min.css"),
  ]).then(([module]) => (katex = module.default));
  return katexPromise;
};

# Skill Contract Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用测试侧公开接口 `inspectSkillContract(skillRoot)` 替换 `polish-opentiny-article` 的历史迁移断言，让确定性测试只保护 Skill 的独立加载契约。

**Architecture:** 新增一个小而深的测试辅助模块，负责读取 Skill 入口、解析 YAML Front Matter、抽取运行所需 Markdown reference，并返回结构化违规项。单元测试只通过公开函数观察行为；集成测试只验证真实 Skill 契约和调用方稳定工作流词汇。

**Tech Stack:** TypeScript、Vitest、Node.js `fs/promises`、`path`、`os`、`yaml`。

---

## 文件结构

- Create: `tests/support/skill-contract.ts`
  - 导出 `SkillContractViolationCode`、`SkillContractViolation`、`inspectSkillContract(skillRoot)`。
  - 只读取传入目录，不修改文件，不依赖 repository root，不包含 `polish-opentiny-article` 专属逻辑。
- Create: `tests/unit/skill-contract.test.ts`
  - 使用临时目录创建最小 Skill fixture。
  - 每个测试只断言 `inspectSkillContract` 的可观察输出，不调用内部 helper。
- Modify: `tests/integration/polish-skill.test.ts`
  - 删除历史路径、作者名、License、仓库名、Commit SHA、旧术语黑名单、固定 reference 清单和精确中文规则句子断言。
  - 保留三种输入场景、Head SHA 保护和 `article-hub validate article`。
- Create: `docs/superpowers/plans/2026-06-22-polish-skill-contract-tests.md`
  - 本实施计划。

## 任务 1：建立最小合法 Skill 契约

**Files:**

- Create: `tests/unit/skill-contract.test.ts`
- Create: `tests/support/skill-contract.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("最小合法 Skill 不返回契约违规", async () => {
  const skillRoot = await createSkillFixture({
    "SKILL.md": `---
name: minimal-skill
description: 最小合法 Skill。
---

# Minimal Skill
`
  });

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "最小合法 Skill 不返回契约违规"`

Expected: 先因模块缺失或未实现失败；补齐导出骨架后，应因返回值不是 `[]` 失败。

- [ ] **Step 3: 写最小实现**

```ts
export async function inspectSkillContract(skillRoot: string): Promise<SkillContractViolation[]> {
  const entryPath = path.join(skillRoot, "SKILL.md");
  const entry = await readFile(entryPath, "utf8");
  const parsed = parseEntryFrontMatter(entry);

  return parsed.ok ? [] : [{ code: "invalid-frontmatter", path: "SKILL.md", message: "SKILL.md Front Matter 无法解析。" }];
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "最小合法 Skill 不返回契约违规"`

Expected: PASS。

## 任务 2：入口缺失

**Files:**

- Modify: `tests/unit/skill-contract.test.ts`
- Modify: `tests/support/skill-contract.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("缺少入口文件时返回 missing-entry", async () => {
  const skillRoot = await createSkillFixture({});

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
    { code: "missing-entry", path: "SKILL.md", message: expect.any(String) }
  ]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "缺少入口文件时返回 missing-entry"`

Expected: FAIL，当前实现抛出 `ENOENT`。

- [ ] **Step 3: 写最小实现**

```ts
try {
  entry = await readFile(entryPath, "utf8");
} catch (error) {
  if (isNodeError(error, "ENOENT")) {
    return [{ code: "missing-entry", path: "SKILL.md", message: "缺少 Skill 入口文件。" }];
  }
  throw error;
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "缺少入口文件时返回 missing-entry"`

Expected: PASS。

## 任务 3：Front Matter 契约

**Files:**

- Modify: `tests/unit/skill-contract.test.ts`
- Modify: `tests/support/skill-contract.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("Front Matter 不可解析时返回 invalid-frontmatter", async () => {
  const skillRoot = await createSkillFixture({
    "SKILL.md": `---
name: [
---

# Broken
`
  });

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
    { code: "invalid-frontmatter", path: "SKILL.md", message: expect.any(String) }
  ]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "Front Matter 不可解析时返回 invalid-frontmatter"`

Expected: FAIL，当前实现没有稳定捕获 YAML 解析失败。

- [ ] **Step 3: 写最小实现**

```ts
function parseEntryFrontMatter(contents: string): ParsedFrontMatter {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { ok: false };

  const metadata = parseYaml(match[1]);
  if (!isRecord(metadata) || typeof metadata.name !== "string" || metadata.name.trim() === "" || typeof metadata.description !== "string" || metadata.description.trim() === "") {
    return { ok: false };
  }

  return { ok: true, name: metadata.name, bodyStart: match[0].length };
}
```

- [ ] **Step 4: 写字段缺失失败测试**

```ts
test("Front Matter 缺少必要字段时返回 invalid-frontmatter", async () => {
  const skillRoot = await createSkillFixture({
    "SKILL.md": `---
name: missing-description
---

# Missing Description
`
  });

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
    { code: "invalid-frontmatter", path: "SKILL.md", message: expect.any(String) }
  ]);
});
```

- [ ] **Step 5: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "Front Matter 缺少必要字段时返回 invalid-frontmatter"`

Expected: FAIL，当前实现未验证 `description`。

- [ ] **Step 6: 写最小实现**

```ts
if (typeof metadata.description !== "string" || metadata.description.trim() === "") {
  return { ok: false };
}
```

- [ ] **Step 7: 写 name 不匹配失败测试**

```ts
test("Front Matter name 与目录名不一致时返回 name-mismatch", async () => {
  const skillRoot = await createSkillFixture(
    {
      "SKILL.md": `---
name: another-skill
description: 名称不匹配。
---

# Mismatch
`
    },
    "actual-skill"
  );

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
    { code: "name-mismatch", path: "SKILL.md", message: expect.any(String) }
  ]);
});
```

- [ ] **Step 8: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "Front Matter name 与目录名不一致时返回 name-mismatch"`

Expected: FAIL，当前实现未比较目录名。

- [ ] **Step 9: 写最小实现**

```ts
if (parsed.ok && parsed.name !== path.basename(skillRoot)) {
  violations.push({ code: "name-mismatch", path: "SKILL.md", message: "Front Matter name 必须与 Skill 目录名一致。" });
}
```

- [ ] **Step 10: 运行任务测试确认 GREEN**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts`

Expected: PASS。

## 任务 4：缺失的本地 reference

**Files:**

- Modify: `tests/unit/skill-contract.test.ts`
- Modify: `tests/support/skill-contract.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("本地 Markdown reference 缺失时返回 missing-reference", async () => {
  const skillRoot = await createSkillFixture({
    "SKILL.md": validSkillEntry("[Missing](./references/missing.md)")
  });

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
    { code: "missing-reference", path: "references/missing.md", message: expect.any(String) }
  ]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "本地 Markdown reference 缺失时返回 missing-reference"`

Expected: FAIL，当前实现未抽取 reference。

- [ ] **Step 3: 写最小实现**

```ts
const references = extractMarkdownReferences(entry);
for (const target of references) {
  const candidate = path.resolve(skillRoot, stripFragment(target));
  const fileStat = await stat(candidate).catch(() => undefined);
  if (!fileStat?.isFile()) {
    violations.push({ code: "missing-reference", path: displayPath(skillRoot, candidate), message: "本地 Markdown reference 不存在。" });
  }
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "本地 Markdown reference 缺失时返回 missing-reference"`

Expected: PASS。

## 任务 5：规范化路径逃逸

**Files:**

- Modify: `tests/unit/skill-contract.test.ts`
- Modify: `tests/support/skill-contract.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("本地 Markdown reference 规范化后逃出根目录时返回 escaped-reference", async () => {
  const skillRoot = await createSkillFixture({
    "SKILL.md": validSkillEntry("[Outside](../outside.md)")
  });

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
    { code: "escaped-reference", path: "../outside.md", message: expect.any(String) }
  ]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "本地 Markdown reference 规范化后逃出根目录时返回 escaped-reference"`

Expected: FAIL，当前实现将逃逸路径当作缺失文件。

- [ ] **Step 3: 写最小实现**

```ts
if (!isInsidePath(skillRoot, candidate)) {
  violations.push({ code: "escaped-reference", path: normalizeReferencePath(target), message: "本地 Markdown reference 不能逃出 Skill 根目录。" });
  continue;
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "本地 Markdown reference 规范化后逃出根目录时返回 escaped-reference"`

Expected: PASS。

## 任务 6：symlink 逃逸

**Files:**

- Modify: `tests/unit/skill-contract.test.ts`
- Modify: `tests/support/skill-contract.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("本地 Markdown reference 最终真实路径逃出根目录时返回 escaped-reference", async () => {
  const outsideRoot = await mkdtemp(path.join(tmpdir(), "skill-outside-"));
  await writeFile(path.join(outsideRoot, "outside.md"), "# Outside\n");
  const skillRoot = await createSkillFixture({
    "SKILL.md": validSkillEntry("[Linked](./references/linked.md)"),
    "references/.keep": ""
  });
  await symlink(path.join(outsideRoot, "outside.md"), path.join(skillRoot, "references/linked.md"));

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
    { code: "escaped-reference", path: "references/linked.md", message: expect.any(String) }
  ]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "本地 Markdown reference 最终真实路径逃出根目录时返回 escaped-reference"`

Expected: FAIL，当前实现只检查规范化路径。

- [ ] **Step 3: 写最小实现**

```ts
const rootRealPath = await realpath(skillRoot);
const targetRealPath = await realpath(candidate);
if (!isInsidePath(rootRealPath, targetRealPath)) {
  violations.push({ code: "escaped-reference", path: displayPath(skillRoot, candidate), message: "本地 Markdown reference 的真实路径不能逃出 Skill 根目录。" });
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "本地 Markdown reference 最终真实路径逃出根目录时返回 escaped-reference"`

Expected: PASS。

## 任务 7：远程运行 reference

**Files:**

- Modify: `tests/unit/skill-contract.test.ts`
- Modify: `tests/support/skill-contract.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("远程 Markdown URL 作为运行 reference 时返回 external-reference", async () => {
  const skillRoot = await createSkillFixture({
    "SKILL.md": validSkillEntry("[Remote](https://example.com/reference.md#usage)\n[Docs](https://example.com/docs)")
  });

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
    { code: "external-reference", path: "https://example.com/reference.md#usage", message: expect.any(String) }
  ]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "远程 Markdown URL 作为运行 reference 时返回 external-reference"`

Expected: FAIL，当前实现未区分远程 Markdown URL。

- [ ] **Step 3: 写最小实现**

```ts
if (isRemoteMarkdownReference(target)) {
  violations.push({ code: "external-reference", path: target, message: "运行所需 Markdown reference 必须是本地文件。" });
  continue;
}
if (hasScheme(target)) continue;
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "远程 Markdown URL 作为运行 reference 时返回 external-reference"`

Expected: PASS。

## 任务 8：递归 reference

**Files:**

- Modify: `tests/unit/skill-contract.test.ts`
- Modify: `tests/support/skill-contract.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("入口引用的 Markdown 文件可以继续引用本地 Markdown", async () => {
  const skillRoot = await createSkillFixture({
    "SKILL.md": validSkillEntry("[First](./references/first.md)"),
    "references/first.md": "[Second](./second.md)\n",
    "references/second.md": "# Second\n"
  });

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "入口引用的 Markdown 文件可以继续引用本地 Markdown"`

Expected: FAIL，当前实现只检查入口文件中的 reference，导致 `second.md` 被后续孤立检查发现前尚不可达。

- [ ] **Step 3: 写最小实现**

```ts
await visitMarkdownFile(entryPath);
async function visitMarkdownFile(filePath: string): Promise<void> {
  const realPath = await realpath(filePath);
  if (visited.has(realPath)) return;
  visited.add(realPath);
  for (const reference of extractMarkdownReferences(await readFile(filePath, "utf8"))) {
    await inspectReference(filePath, reference);
  }
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "入口引用的 Markdown 文件可以继续引用本地 Markdown"`

Expected: PASS。

## 任务 9：孤立 reference

**Files:**

- Modify: `tests/unit/skill-contract.test.ts`
- Modify: `tests/support/skill-contract.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("references 目录下不可达 Markdown 返回 orphan-reference", async () => {
  const skillRoot = await createSkillFixture({
    "SKILL.md": validSkillEntry("[Used](./references/used.md)"),
    "references/used.md": "# Used\n",
    "references/orphan.md": "# Orphan\n"
  });

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
    { code: "orphan-reference", path: "references/orphan.md", message: expect.any(String) }
  ]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "references 目录下不可达 Markdown 返回 orphan-reference"`

Expected: FAIL，当前实现未枚举 `references/`。

- [ ] **Step 3: 写最小实现**

```ts
for (const referenceFile of await collectMarkdownFiles(path.join(skillRoot, "references"))) {
  const realPath = await realpath(referenceFile);
  if (!reachableRealPaths.has(realPath)) {
    violations.push({ code: "orphan-reference", path: displayPath(skillRoot, referenceFile), message: "references 目录下的 Markdown 必须能从 SKILL.md 到达。" });
  }
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "references 目录下不可达 Markdown 返回 orphan-reference"`

Expected: PASS。

## 任务 10：嵌套 Skill

**Files:**

- Modify: `tests/unit/skill-contract.test.ts`
- Modify: `tests/support/skill-contract.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("根目录下存在第二个 SKILL.md 时返回 nested-skill", async () => {
  const skillRoot = await createSkillFixture({
    "SKILL.md": validSkillEntry(""),
    "nested/SKILL.md": validSkillEntry("")
  });

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
    { code: "nested-skill", path: "nested/SKILL.md", message: expect.any(String) }
  ]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "根目录下存在第二个 SKILL.md 时返回 nested-skill"`

Expected: FAIL，当前实现未扫描嵌套入口。

- [ ] **Step 3: 写最小实现**

```ts
for (const skillFile of await collectSkillEntryFiles(skillRoot)) {
  if (path.resolve(skillFile) !== entryPath) {
    violations.push({ code: "nested-skill", path: displayPath(skillRoot, skillFile), message: "Skill 根目录下不能嵌套另一个 SKILL.md。" });
  }
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "根目录下存在第二个 SKILL.md 时返回 nested-skill"`

Expected: PASS。

## 任务 11：Markdown 边界

**Files:**

- Modify: `tests/unit/skill-contract.test.ts`
- Modify: `tests/support/skill-contract.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("代码、行内代码和图片中的 Markdown 路径不作为运行 reference", async () => {
  const skillRoot = await createSkillFixture({
    "SKILL.md": validSkillEntry([
      "```md",
      "[Ignored](./references/code.md)",
      "```",
      "`[Ignored](./references/inline.md)`",
      "![Image](./references/image.md)"
    ].join("\n"))
  });

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "代码、行内代码和图片中的 Markdown 路径不作为运行 reference"`

Expected: FAIL，当前提取器会误识别代码或图片中的 `.md`。

- [ ] **Step 3: 写最小实现**

```ts
function stripMarkdownCode(contents: string): string {
  const lines = contents.split(/\r?\n/);
  let fenced = false;
  return lines
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return "";
      }
      return fenced ? "" : line.replace(/`[^`\n]*`/g, "");
    })
    .join("\n");
}
```

- [ ] **Step 4: 写 reference definition 失败测试**

```ts
test("reference definition 中的本地 Markdown 会作为运行 reference", async () => {
  const skillRoot = await createSkillFixture({
    "SKILL.md": validSkillEntry("[Guide][guide]\n\n[guide]: ./references/guide.md#read"),
    "references/guide.md": "# Guide\n"
  });

  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
});
```

- [ ] **Step 5: 运行测试确认 RED**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts -t "reference definition 中的本地 Markdown 会作为运行 reference"`

Expected: FAIL，当前提取器不支持 reference definition。

- [ ] **Step 6: 写最小实现**

```ts
const definitionPattern = /^\s{0,3}\[[^\]]+\]:\s*(\S+)/gm;
while ((match = definitionPattern.exec(markdown)) !== null) {
  references.push(cleanReferenceTarget(match[1]));
}
```

- [ ] **Step 7: 运行任务测试确认 GREEN**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts`

Expected: PASS。

## 任务 12：真实 Skill 集成测试

**Files:**

- Modify: `tests/integration/polish-skill.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
test("真实 Skill 满足独立加载契约", async () => {
  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `pnpm vitest run tests/integration/polish-skill.test.ts -t "真实 Skill 满足独立加载契约"`

Expected: FAIL，测试文件尚未导入检查器或旧断言职责尚未移除。

- [ ] **Step 3: 写最小实现**

```ts
import { inspectSkillContract } from "../support/skill-contract.js";

test("真实 Skill 满足独立加载契约", async () => {
  await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
});
```

- [ ] **Step 4: 写稳定工作流词汇测试**

```ts
test("保留调用方依赖的输入场景、Head SHA 保护和文章校验命令", async () => {
  const skill = await readFile(path.join(skillRoot, "SKILL.md"), "utf8");

  for (const scope of ["初稿全文优化", "/ai 全文润色", "Review 局部修订"]) {
    expect(skill).toContain(scope);
  }

  expect(skill).toContain("Head SHA");
  expect(skill).toContain("article-hub validate article");
});
```

- [ ] **Step 5: 运行测试确认 GREEN**

Run: `pnpm vitest run tests/integration/polish-skill.test.ts`

Expected: PASS。

- [ ] **Step 6: 删除旧职责断言**

Remove from `tests/integration/polish-skill.test.ts`:

- `requiredFiles`
- `forbiddenPaths`
- 历史词语黑名单
- 手工 reference 路径清单
- 精确中文规则句子断言

- [ ] **Step 7: 运行集成测试确认 GREEN**

Run: `pnpm vitest run tests/integration/polish-skill.test.ts`

Expected: PASS。

## 任务 13：重构与全量验证

**Files:**

- Modify: `tests/support/skill-contract.ts`
- Modify: `tests/unit/skill-contract.test.ts`
- Modify: `tests/integration/polish-skill.test.ts`

- [ ] **Step 1: GREEN 后重构检查器内部结构**

保持公开接口不变，只整理：

```ts
type PendingReference = {
  sourcePath: string;
  target: string;
};

function addViolation(violations: SkillContractViolation[], violation: SkillContractViolation): void {
  if (!violations.some((item) => item.code === violation.code && item.path === violation.path)) {
    violations.push(violation);
  }
}
```

- [ ] **Step 2: 运行单元测试确认重构未改变行为**

Run: `pnpm vitest run tests/unit/skill-contract.test.ts`

Expected: PASS。

- [ ] **Step 3: 运行指定验证命令**

Run:

```sh
pnpm vitest run tests/unit/skill-contract.test.ts
pnpm vitest run tests/integration/polish-skill.test.ts
pnpm test
pnpm build
git diff --check
git status --short
```

Expected:

- 前五条命令 exit 0。
- `git status --short` 只显示本任务新增/修改文件以及 handoff 明确保护的两项用户暂存删除。

- [ ] **Step 4: 路径限定提交**

Run:

```sh
git add docs/superpowers/plans/2026-06-22-polish-skill-contract-tests.md tests/support/skill-contract.ts tests/unit/skill-contract.test.ts tests/integration/polish-skill.test.ts
git commit -m "test: add skill contract inspection"
```

Expected:

- Commit 只包含本任务文件。
- 用户已暂存删除仍保持暂存状态，未被恢复、取消暂存或纳入本任务提交。

## 验收清单

- [ ] `inspectSkillContract(skillRoot)` 是唯一公开测试接口。
- [ ] 单元测试不直接测试内部 helper。
- [ ] `polish-skill.test.ts` 不包含历史删除清单、旧术语黑名单、固定 reference 清单或精确中文规则句子断言。
- [ ] 本地 reference 缺失、路径逃逸、symlink 逃逸、远程 Markdown reference、孤立 reference、嵌套 Skill 都有 RED→GREEN 证据。
- [ ] 真实 `polish-opentiny-article` 通过同一检查器验证。
- [ ] 不修改 `src/`、CLI 或 Skill 正文。
- [ ] 不 push，不创建 PR。

# Remove Intermediate Terminology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 清理源码、文档、测试和配置中的临时路线图代号与编号化 schema 标识，并保留正式业务状态标签。

**Architecture:** 将 `article-hub.*.<numbered-suffix>` 契约值收敛为无阶段编号的稳定 schema 标识；将路线图代号文案改为“当前支持范围”“本地人工驱动流程”“能力里程碑”等产品语义。新增仓库级术语守卫测试，确保后续变更不会重新引入这些词。

**Tech Stack:** TypeScript、Vitest、YAML、Markdown、GitHub Issue template。

---

### Task 1: 术语守卫测试

**Files:**
- Create: `tests/integration/terminology-guard.test.ts`

- [x] **Step 1: Write the failing test**

Add a Vitest integration test that recursively reads text files outside `.git`, `node_modules`, and `dist`, then reports any forbidden intermediate terminology. Build the regular expressions from string fragments so the guard file itself does not contain forbidden terms as plain text.

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/terminology-guard.test.ts`
Expected: FAIL，并列出当前仓库内的编号化 schema 标识与临时路线图代号命中。

### Task 2: Schema 契约值收敛

**Files:**
- Modify: `src/**/*.ts`
- Modify: `schemas/article-frontmatter.schema.json`
- Modify: `config/projects.yml`
- Modify: `tests/fixtures/**/*.json`
- Modify: `tests/fixtures/**/*.yml`
- Modify: `tests/fixtures/**/*.md`
- Modify: `tests/**/*.test.ts`

- [x] **Step 1: Update tests to expect schema identifiers without stage numbering**

Update expected strings from `article-hub.<name>.<numbered-suffix>` to `article-hub.<name>`.

- [x] **Step 2: Run focused tests to verify failure**

Run: `pnpm vitest run tests/integration/plan-state-cli.test.ts tests/integration/validate-article-cli.test.ts tests/unit/article-validation.test.ts tests/unit/project-config.test.ts`
Expected: FAIL because production code still returns old schema identifiers.

- [x] **Step 3: Update production schema identifiers**

Replace all numbered schema constants and literal outputs with the matching unnumbered `article-hub.*` value.

- [x] **Step 4: Run focused tests**

Run: `pnpm vitest run tests/integration/plan-state-cli.test.ts tests/integration/validate-article-cli.test.ts tests/unit/article-validation.test.ts tests/unit/project-config.test.ts`
Expected: PASS.

### Task 3: 阶段术语文案清理

**Files:**
- Modify: `src/domain/article-validation.ts`
- Modify: `src/domain/project-config.ts`
- Modify: `src/domain/command-parser.ts`
- Modify: `src/commands/*.ts`
- Modify: `docs/article-generation-requirements.md`
- Modify: `docs/article-generation-workflow-design.md`
- Modify: `skills/*/SKILL.md`
- Modify: `INSTALL.md`
- Modify: `articles/README.md`
- Modify: `scripts/README.md`
- Modify: `.github/ISSUE_TEMPLATE/article.yml`
- Modify: `tests/**/*.test.ts`
- Modify: `tests/fixtures/articles/valid-article.md`

- [x] **Step 1: Replace intermediate stage terms with product terms**

Use “当前支持范围”“项目 allowlist”“本地人工驱动流程”“Workflow 自动化”“能力里程碑”替代临时路线图代号。

- [x] **Step 2: Preserve formal workflow labels**

Keep labels like `阶段：策划`、`阶段：写作`、`阶段：审核` unchanged because they are state-machine values.

- [x] **Step 3: Run terminology guard**

Run: `pnpm vitest run tests/integration/terminology-guard.test.ts`
Expected: PASS.

### Task 4: Full verification

**Files:**
- No additional file changes.

- [x] **Step 1: Run complete test suite**

Run: `pnpm test`
Expected: PASS.

- [x] **Step 2: Run build**

Run: `pnpm run build`
Expected: PASS.

- [x] **Step 3: Run grep acceptance check**

Run the same forbidden-pattern scan used by `tests/integration/terminology-guard.test.ts`.
Expected: no matches.

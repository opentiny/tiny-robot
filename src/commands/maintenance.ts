import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { loadProjectConfig } from "../domain/project-config.js";
import { ArticleHubError } from "../infrastructure/errors.js";

interface ReconcileState {
  issue_number?: unknown;
  repository?: unknown;
  branch?: unknown;
  branch_exists?: unknown;
  draft_pr_exists?: unknown;
  labels?: unknown;
}

const skeletonDirectories = [
  "articles",
  "materials",
  "materials/article-archive",
  "materials/issue-sources",
  "references",
  "references/brand",
  "references/terminology",
  "scripts"
];
const skeletonReadmes = new Map([
  ["materials/README.md", "materials 存放 Issue 来源快照和文章归档素材。\n"],
  ["references/README.md", "references 存放品牌、术语和写作规范引用。\n"],
  ["scripts/README.md", "scripts 存放阶段 A 的本地辅助脚本。\n"]
]);

/**
 * 检查 Phase A 本地运行所需的依赖、配置和仓库结构。
 *
 * @param options 仓库根目录、项目配置路径和 dry-run 标记。
 * @returns 每项检查的稳定 JSON 结果。
 */
export async function doctor(options: {
  root: string;
  configPath: string;
  dryRun: boolean;
}): Promise<unknown> {
  const checks = [
    await checkNodeVersion(),
    await checkFile(options.root, "package-lock.json", "package-lock"),
    await checkProjectConfig(options.configPath),
    await checkAllFiles(options.root, "skills", [
      "skills/generate-opentiny-article/SKILL.md",
      "skills/polish-opentiny-article/SKILL.md"
    ]),
    await checkFile(options.root, "INSTALL.md", "install-doc"),
    await checkFile(options.root, ".github/workflows/article-ci.yml", "github-ci"),
    await checkFile(options.root, ".github/ISSUE_TEMPLATE/article.yml", "github-issue-form"),
    await checkFile(options.root, ".github/pull_request_template.md", "github-pr-template")
  ];

  return {
    ok: true,
    schema_version: "article-hub.doctor.v1",
    dry_run: options.dryRun,
    root: options.root,
    checks
  };
}

/**
 * 初始化 Phase A 本地目录骨架；真实写入必须显式传入 `--yes`。
 *
 * @param options 目标根目录、dry-run 和人工确认标记。
 * @returns 计划创建的目录和文件。
 * @throws ArticleHubError 当真实写入缺少确认时抛出。
 */
export async function setup(options: {
  root: string;
  dryRun: boolean;
  yes: boolean;
}): Promise<unknown> {
  const plannedDirectories = skeletonDirectories.map((relativePath) =>
    path.join(options.root, relativePath)
  );
  const plannedFiles = [...skeletonReadmes.keys()].map((relativePath) =>
    path.join(options.root, relativePath)
  );

  if (!options.dryRun && !options.yes) {
    throw new ArticleHubError("CONFIRMATION_REQUIRED", "setup 写入需要 --yes", 2);
  }

  if (!options.dryRun) {
    for (const directory of plannedDirectories) {
      await mkdir(directory, { recursive: true });
    }

    for (const [relativePath, content] of skeletonReadmes) {
      const filePath = path.join(options.root, relativePath);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content);
    }
  }

  return {
    ok: true,
    schema_version: "article-hub.setup.v1",
    dry_run: options.dryRun,
    applied: !options.dryRun,
    root: options.root,
    planned_directories: plannedDirectories,
    planned_files: plannedFiles
  };
}

/**
 * 根据本地事实文件恢复部分成功状态，例如分支已创建但 Draft PR 缺失。
 *
 * @param options reconcile 状态文件和 dry-run 标记。
 * @returns 需要执行的恢复 mutation plan。
 */
export async function reconcile(options: {
  stateFile: string;
  dryRun: boolean;
}): Promise<unknown> {
  const state = await readReconcileState(options.stateFile);
  const issueNumber = Number.isSafeInteger(state.issue_number)
    ? (state.issue_number as number)
    : null;
  const branch = typeof state.branch === "string" ? state.branch : "";
  const repository = typeof state.repository === "string" ? state.repository : "";
  const operations = [];

  if (state.branch_exists === true && state.draft_pr_exists !== true) {
    operations.push({
      kind: "gh-pr-create",
      repository,
      branch
    });
    operations.push({
      kind: "gh-issue-comment",
      issue_number: issueNumber,
      repository,
      body: "检测到文章分支已存在但 Draft PR 缺失，需要重新创建 Draft PR。"
    });
  }

  return {
    ok: true,
    schema_version: "article-hub.reconcile.v1",
    dry_run: options.dryRun,
    recovery_required: operations.length > 0,
    issue_number: issueNumber,
    mutation_plan: {
      operations
    }
  };
}

async function checkNodeVersion() {
  const major = Number(process.versions.node.split(".")[0]);

  return {
    name: "node-version",
    ok: major >= 20,
    detail: process.versions.node
  };
}

async function checkFile(root: string, relativePath: string, name: string) {
  try {
    const fileStat = await stat(path.join(root, relativePath));

    return {
      name,
      ok: fileStat.isFile(),
      path: relativePath
    };
  } catch {
    return {
      name,
      ok: false,
      path: relativePath
    };
  }
}

async function checkAllFiles(root: string, name: string, relativePaths: string[]) {
  const checks = await Promise.all(relativePaths.map((relativePath) => checkFile(root, relativePath, relativePath)));

  return {
    name,
    ok: checks.every((check) => check.ok),
    paths: relativePaths
  };
}

async function checkProjectConfig(configPath: string) {
  try {
    await loadProjectConfig(configPath);

    return {
      name: "project-config",
      ok: true,
      path: configPath
    };
  } catch (error) {
    return {
      name: "project-config",
      ok: false,
      path: configPath,
      detail: error instanceof Error ? error.message : "项目配置检查失败"
    };
  }
}

async function readReconcileState(stateFile: string): Promise<ReconcileState> {
  const raw = await readFile(stateFile, "utf8");

  try {
    return JSON.parse(raw) as ReconcileState;
  } catch {
    throw new ArticleHubError("INVALID_JSON", `Reconcile 状态文件不是有效 JSON：${stateFile}`);
  }
}

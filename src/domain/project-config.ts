import path from "node:path";
import { readFile } from "node:fs/promises";

import { parse } from "yaml";

import { ArticleHubError } from "../infrastructure/errors.js";

export type ProjectId = "webmcp-sdk" | "genui-sdk" | "tiny-robot";

export interface ProjectRepositoryConfig {
  name: string;
  url: string;
  default_ref?: string;
  ref?: string;
  required_commit?: string;
  role: string;
  source_type: string;
  license?: string;
}

export interface ProjectConfigEntry {
  project_id: ProjectId;
  display_name: string;
  docs: Record<string, unknown>;
  demo: Record<string, unknown>;
  deepwiki: Record<string, unknown>;
  terminology: Record<string, unknown>;
  repositories: ProjectRepositoryConfig[];
}

export interface ProjectConfig {
  schema_version: "article-hub.projects.v1";
  projects: ProjectConfigEntry[];
}

const allowedProjectIds = ["webmcp-sdk", "genui-sdk", "tiny-robot"] as const;
const projectIdSet = new Set<string>(allowedProjectIds);
const safeSegmentPattern = /^[a-zA-Z0-9._-]+$/;

/**
 * 读取并校验项目配置，确保阶段 A 只处理白名单项目和受控 checkout 路径。
 */
export async function loadProjectConfig(configPath: string): Promise<ProjectConfig> {
  let raw: string;

  try {
    raw = await readFile(configPath, "utf8");
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      throw new ArticleHubError("PROJECT_CONFIG_NOT_FOUND", `项目配置不存在：${configPath}`);
    }

    throw error;
  }

  let parsed: unknown;

  try {
    parsed = parse(raw) as unknown;
  } catch {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `项目配置不是有效 YAML：${configPath}`);
  }

  return validateProjectConfig(parsed);
}

/**
 * 查找阶段 A 支持项目；未知项目直接停止，避免 Skill 继续生成不可追溯内容。
 */
export function resolveProject(config: ProjectConfig, projectId: string): ProjectConfigEntry {
  const project = config.projects.find((item) => item.project_id === projectId);

  if (!project) {
    throw new ArticleHubError("UNKNOWN_PROJECT", `未配置阶段 A 项目：${projectId}`, 2);
  }

  return project;
}

/**
 * 生成仓库 checkout 的受控路径，拒绝绝对路径和 `..` 穿越。
 */
export function safeCheckoutPath(
  cacheRoot: string,
  repository: ProjectRepositoryConfig
): string {
  const namespace = repositoryNamespace(repository.url);
  const checkoutPath = path.resolve(cacheRoot, namespace, repository.name);
  const resolvedRoot = path.resolve(cacheRoot);

  if (!isInsideDirectory(resolvedRoot, checkoutPath)) {
    throw new ArticleHubError("UNSAFE_PATH", `checkout 路径逃逸 cache 目录：${repository.name}`);
  }

  return checkoutPath;
}

function validateProjectConfig(value: unknown): ProjectConfig {
  if (value === null || typeof value !== "object") {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", "项目配置必须是 YAML object");
  }

  const config = value as Partial<ProjectConfig>;

  if (config.schema_version !== "article-hub.projects.v1") {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", "项目配置 schema_version 无效");
  }

  if (!Array.isArray(config.projects) || config.projects.length === 0) {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", "项目配置缺少 projects");
  }

  const seen = new Set<string>();
  const projects = config.projects.map((project) => validateProject(project, seen));

  return {
    schema_version: "article-hub.projects.v1",
    projects
  };
}

function validateProject(value: unknown, seen: Set<string>): ProjectConfigEntry {
  if (value === null || typeof value !== "object") {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", "项目条目必须是 object");
  }

  const project = value as Partial<ProjectConfigEntry>;
  const projectId = project.project_id;

  if (typeof projectId !== "string" || !projectIdSet.has(projectId)) {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `阶段 A 不支持项目：${String(projectId)}`);
  }

  if (seen.has(projectId)) {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `项目重复配置：${projectId}`);
  }

  seen.add(projectId);

  if (typeof project.display_name !== "string" || project.display_name.length === 0) {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `项目缺少 display_name：${projectId}`);
  }

  if (!Array.isArray(project.repositories) || project.repositories.length === 0) {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `项目缺少 repositories：${projectId}`);
  }

  return {
    project_id: projectId as ProjectId,
    display_name: project.display_name,
    docs: readObject(project.docs, "docs", projectId),
    demo: readObject(project.demo, "demo", projectId),
    deepwiki: readObject(project.deepwiki, "deepwiki", projectId),
    terminology: readObject(project.terminology, "terminology", projectId),
    repositories: project.repositories.map((repository) =>
      validateRepository(repository, projectId)
    )
  };
}

function validateRepository(value: unknown, projectId: string): ProjectRepositoryConfig {
  if (value === null || typeof value !== "object") {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `仓库条目必须是 object：${projectId}`);
  }

  const repository = value as Partial<ProjectRepositoryConfig>;

  assertSafeSegment(repository.name, "name", projectId);

  if (typeof repository.url !== "string" || repository.url.length === 0) {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `仓库缺少 url：${projectId}`);
  }

  if (typeof repository.role !== "string" || repository.role.length === 0) {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `仓库缺少 role：${projectId}`);
  }

  if (typeof repository.source_type !== "string" || repository.source_type.length === 0) {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `仓库缺少 source_type：${projectId}`);
  }

  if (!repository.ref && !repository.default_ref) {
    throw new ArticleHubError(
      "INVALID_PROJECT_CONFIG",
      `仓库必须配置 ref 或 default_ref：${projectId}/${repository.name}`
    );
  }

  if (repository.ref !== undefined && typeof repository.ref !== "string") {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `仓库 ref 必须是字符串：${projectId}`);
  }

  if (repository.default_ref !== undefined && typeof repository.default_ref !== "string") {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `仓库 default_ref 必须是字符串：${projectId}`);
  }

  if (
    repository.required_commit !== undefined &&
    !/^[0-9a-f]{40}$/.test(repository.required_commit)
  ) {
    throw new ArticleHubError(
      "INVALID_PROJECT_CONFIG",
      `required_commit 必须是 40 位小写 SHA：${projectId}/${repository.name}`
    );
  }

  return {
    name: repository.name,
    url: repository.url,
    default_ref: repository.default_ref,
    ref: repository.ref,
    required_commit: repository.required_commit,
    role: repository.role,
    source_type: repository.source_type,
    license: repository.license
  };
}

function readObject(value: unknown, fieldName: string, projectId: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", `项目缺少 ${fieldName}：${projectId}`);
  }

  return value as Record<string, unknown>;
}

function assertSafeSegment(value: unknown, fieldName: string, projectId: string): asserts value is string {
  if (typeof value !== "string" || !safeSegmentPattern.test(value)) {
    throw new ArticleHubError(
      "INVALID_PROJECT_CONFIG",
      `字段 ${fieldName} 不是安全路径片段：${projectId}`
    );
  }
}

function repositoryNamespace(url: string): string {
  const githubMatch = /github\.com[:/](?<owner>[A-Za-z0-9_.-]+)\/(?<repo>[A-Za-z0-9_.-]+?)(?:\.git)?$/.exec(
    url
  );

  if (githubMatch?.groups?.owner) {
    return githubMatch.groups.owner;
  }

  return "local";
}

function isInsideDirectory(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);

  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

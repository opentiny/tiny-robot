import path from "node:path";
import { readFile } from "node:fs/promises";

import { parse } from "yaml";

import { ArticleHubError } from "../infrastructure/errors.js";

export type ProjectId = string;

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
  schema_version: "article-hub.projects";
  projects: ProjectConfigEntry[];
}

const safeSegmentPattern = /^[a-zA-Z0-9._-]+$/;

/**
 * 读取项目配置，只校验文件、YAML 与顶层结构契约。
 *
 * @param configPath 项目配置 YAML 文件路径。
 * @returns 可供命令层读取的项目配置对象，深层字段由配置评审和使用边界兜底。
 * @throws ArticleHubError 当配置文件不存在、YAML 无效或顶层结构不符合契约时抛出。
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
 * 查找当前支持项目；未知项目直接停止，避免 Skill 继续生成不可追溯内容。
 *
 * @param config 已读取的项目配置。
 * @param projectId 调用方请求的项目标识。
 * @returns 与请求项目标识匹配的项目配置。
 * @throws ArticleHubError 当项目未出现在配置中时抛出。
 */
export function resolveProject(config: ProjectConfig, projectId: string): ProjectConfigEntry {
  const project = config.projects.find((item) => item.project_id === projectId);

  if (!project) {
    throw new ArticleHubError("UNKNOWN_PROJECT", `未配置项目：${projectId}`, 2);
  }

  return project;
}

/**
 * 生成仓库 checkout 的受控路径，拒绝绝对路径和 `..` 穿越。
 *
 * @param cacheRoot checkout 缓存根目录。
 * @param repository 仓库配置。
 * @returns 归一化后的 checkout 目录路径。
 * @throws ArticleHubError 当仓库 owner 或 name 不是安全路径片段时抛出。
 */
export function safeCheckoutPath(
  cacheRoot: string,
  repository: ProjectRepositoryConfig
): string {
  const namespace = repositoryNamespace(repository.url);
  assertSafePathSegment(namespace, "namespace");
  assertSafePathSegment(repository.name, "name");
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

  if (config.schema_version !== "article-hub.projects") {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", "项目配置 schema_version 无效");
  }

  if (!Array.isArray(config.projects)) {
    throw new ArticleHubError("INVALID_PROJECT_CONFIG", "项目配置缺少 projects");
  }

  return config as ProjectConfig;
}

function assertSafePathSegment(value: string, fieldName: string): void {
  if (!isSafePathSegment(value)) {
    throw new ArticleHubError("UNSAFE_PATH", `字段 ${fieldName} 不是安全路径片段`);
  }
}

function isSafePathSegment(value: string): boolean {
  return value !== "." && value !== ".." && safeSegmentPattern.test(value);
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

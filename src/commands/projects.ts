import { loadProjectConfig } from "../domain/project-config.js";

/**
 * 列出项目配置，供 Skill 在生成前做 allowlist 校验。
 */
export async function listProjects(options: {
  configPath: string;
  dryRun: boolean;
}): Promise<unknown> {
  const config = await loadProjectConfig(options.configPath);

  return {
    ok: true,
    schema_version: "article-hub.projects.list",
    dry_run: options.dryRun,
    projects: config.projects.map((project) => ({
      project_id: project.project_id,
      display_name: project.display_name,
      repositories: project.repositories.map((repository) => ({
        name: repository.name,
        role: repository.role,
        source_type: repository.source_type
      }))
    }))
  };
}

/**
 * 校验项目配置文件，不执行任何 checkout 或网络操作。
 */
export async function validateProjects(options: {
  configPath: string;
  dryRun: boolean;
}): Promise<unknown> {
  const config = await loadProjectConfig(options.configPath);

  return {
    ok: true,
    schema_version: "article-hub.projects.validate",
    dry_run: options.dryRun,
    valid: true,
    project_count: config.projects.length
  };
}

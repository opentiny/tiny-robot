import { loadProjectConfig, resolveProject } from "../domain/project-config.js";
import { checkoutProjectSources } from "../git/source-checkout.js";

/**
 * 按项目配置 checkout 阶段 A 所需源码，并生成来源快照 manifest。
 */
export async function checkoutSources(options: {
  configPath: string;
  projectId: string;
  cacheDir: string;
  dryRun: boolean;
}): Promise<unknown> {
  const config = await loadProjectConfig(options.configPath);
  const project = resolveProject(config, options.projectId);
  const result = await checkoutProjectSources({
    project,
    cacheDir: options.cacheDir,
    dryRun: options.dryRun
  });

  return {
    ok: true,
    schema_version: "article-hub.checkout-sources.v1",
    dry_run: options.dryRun,
    project_id: project.project_id,
    ...result
  };
}

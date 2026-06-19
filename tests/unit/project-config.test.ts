import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import {
  loadProjectConfig,
  resolveProject,
  safeCheckoutPath
} from "../../src/domain/project-config.js";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

describe("project config", () => {
  test("只接受阶段 A 支持的三个项目，并保留稳定顺序", async () => {
    const config = await loadProjectConfig(
      path.join(repositoryRoot, "tests/fixtures/projects-valid.yml")
    );

    expect(config.projects.map((project) => project.project_id)).toEqual([
      "webmcp-sdk",
      "genui-sdk",
      "tiny-robot"
    ]);
    expect(resolveProject(config, "webmcp-sdk").repositories[0]).toMatchObject({
      name: "webmcp-sdk",
      default_ref: "dev",
      source_type: "source"
    });
  });

  test("未知项目稳定拒绝", async () => {
    await expect(
      loadProjectConfig(path.join(repositoryRoot, "tests/fixtures/projects-unknown.yml"))
    ).rejects.toMatchObject({
      code: "INVALID_PROJECT_CONFIG"
    });
  });

  test("checkout 路径不能穿越 cache 根目录", async () => {
    const config = await loadProjectConfig(
      path.join(repositoryRoot, "tests/fixtures/projects-valid.yml")
    );
    const cacheRoot = path.join(repositoryRoot, "tmp/source cache");

    expect(safeCheckoutPath(cacheRoot, resolveProject(config, "webmcp-sdk").repositories[0])).toBe(
      path.join(cacheRoot, "opentiny", "webmcp-sdk")
    );
    await expect(
      loadProjectConfig(
        path.join(repositoryRoot, "tests/fixtures/projects-unsafe-path.yml")
      )
    ).rejects.toMatchObject({
      code: "INVALID_PROJECT_CONFIG"
    });
  });
});

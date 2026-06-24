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
  test("按配置文件保留项目顺序", async () => {
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

  test("项目列表由配置文件决定", async () => {
    const config = await loadProjectConfig(
      path.join(repositoryRoot, "tests/fixtures/projects-unknown.yml")
    );

    expect(config.projects.map((project) => project.project_id)).toEqual(["tiny-engine"]);
    expect(resolveProject(config, "tiny-engine")).toMatchObject({
      project_id: "tiny-engine",
      display_name: "TinyEngine"
    });
  });

  test("未配置项目稳定拒绝", async () => {
    const config = await loadProjectConfig(
      path.join(repositoryRoot, "tests/fixtures/projects-valid.yml")
    );

    expect(() => resolveProject(config, "tiny-engine")).toThrowError(/未配置项目/);
  });

  test("checkout 路径不能穿越 cache 根目录", async () => {
    const config = await loadProjectConfig(
      path.join(repositoryRoot, "tests/fixtures/projects-valid.yml")
    );
    const cacheRoot = path.join(repositoryRoot, "tmp/source cache");

    expect(safeCheckoutPath(cacheRoot, resolveProject(config, "webmcp-sdk").repositories[0])).toBe(
      path.join(cacheRoot, "opentiny", "webmcp-sdk")
    );
    const unsafeConfig = await loadProjectConfig(
      path.join(repositoryRoot, "tests/fixtures/projects-unsafe-path.yml")
    );
    expect(() =>
      safeCheckoutPath(cacheRoot, resolveProject(unsafeConfig, "webmcp-sdk").repositories[0])
    ).toThrowError(/路径片段/);
  });

  test.each([".", ".."])("拒绝路径折叠 repo name：%s", (repoName) => {
    expect(() => {
      safeCheckoutPath(path.join(repositoryRoot, "tmp/source cache"), {
        name: repoName,
        url: "https://github.com/opentiny/webmcp-sdk.git",
        default_ref: "dev",
        role: "primary-source",
        source_type: "source"
      });
    }).toThrowError(/路径片段/);
  });

  test.each([".", ".."])("拒绝路径折叠 GitHub owner：%s", (owner) => {
    expect(() => {
      safeCheckoutPath(path.join(repositoryRoot, "tmp/source cache"), {
        name: "webmcp-sdk",
        url: `https://github.com/${owner}/webmcp-sdk.git`,
        default_ref: "dev",
        role: "primary-source",
        source_type: "source"
      });
    }).toThrowError(/路径片段/);
  });
});

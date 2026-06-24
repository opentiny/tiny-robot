import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { inspectSkillContract } from "../support/skill-contract.js";

const createdRoots: string[] = [];

async function createSkillFixture(
  files: Record<string, string>,
  skillName = "minimal-skill"
): Promise<string> {
  const workspace = await mkdtemp(path.join(tmpdir(), "skill-contract-"));
  const skillRoot = path.join(workspace, skillName);
  await mkdir(skillRoot, { recursive: true });
  createdRoots.push(workspace);

  for (const [relativePath, contents] of Object.entries(files)) {
    const filePath = path.join(skillRoot, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, contents, "utf8");
  }

  return skillRoot;
}

function validSkillEntry(body: string): string {
  return `---
name: minimal-skill
description: 最小合法 Skill。
---

# Minimal Skill

${body}
`;
}

describe("skill contract inspector", () => {
  afterEach(async () => {
    await Promise.all(
      createdRoots.splice(0).map((root) =>
        rm(root, { force: true, recursive: true })
      )
    );
  });

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

  test("缺少入口文件时返回 missing-entry", async () => {
    const skillRoot = await createSkillFixture({});

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "missing-entry",
        path: "SKILL.md",
        message: expect.any(String)
      }
    ]);
  });

  test("Front Matter 不可解析时返回 invalid-frontmatter", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": `---
name: [
---

# Broken
`
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "invalid-frontmatter",
        path: "SKILL.md",
        message: expect.any(String)
      }
    ]);
  });

  test("Front Matter 缺少必要字段时返回 invalid-frontmatter", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": `---
name: missing-description
---

# Missing Description
`
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "invalid-frontmatter",
        path: "SKILL.md",
        message: expect.any(String)
      }
    ]);
  });

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
      {
        code: "name-mismatch",
        path: "SKILL.md",
        message: expect.any(String)
      }
    ]);
  });

  test("本地 Markdown reference 缺失时返回 missing-reference", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": validSkillEntry("[Missing](./references/missing.md)")
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "missing-reference",
        path: "references/missing.md",
        message: expect.any(String)
      }
    ]);
  });

  test("本地 Markdown reference 规范化后逃出根目录时返回 escaped-reference", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": validSkillEntry("[Outside](../outside.md)")
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "escaped-reference",
        path: "../outside.md",
        message: expect.any(String)
      }
    ]);
  });

  test("本地 Markdown reference 最终真实路径逃出根目录时返回 escaped-reference", async () => {
    const outsideRoot = await mkdtemp(path.join(tmpdir(), "skill-outside-"));
    createdRoots.push(outsideRoot);
    const outsideFile = path.join(outsideRoot, "outside.md");
    await writeFile(outsideFile, "# Outside\n", "utf8");

    const skillRoot = await createSkillFixture({
      "SKILL.md": validSkillEntry("[Linked](./references/linked.md)"),
      "references/.keep": ""
    });
    await symlink(outsideFile, path.join(skillRoot, "references/linked.md"));

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "escaped-reference",
        path: "references/linked.md",
        message: expect.any(String)
      }
    ]);
  });

  test("远程 Markdown URL 作为运行 reference 时返回 external-reference", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": validSkillEntry(
        [
          "[Remote](https://example.com/reference.md#usage)",
          "[Docs](https://example.com/docs)"
        ].join("\n")
      )
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "external-reference",
        path: "https://example.com/reference.md#usage",
        message: expect.any(String)
      }
    ]);
  });

  test("入口引用的 Markdown 文件继续引用缺失本地 Markdown 时返回 missing-reference", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": validSkillEntry("[First](./references/first.md)"),
      "references/first.md": "[Second](./second.md)\n"
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "missing-reference",
        path: "references/second.md",
        message: expect.any(String)
      }
    ]);
  });

  test("references 目录下不可达 Markdown 返回 orphan-reference", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": validSkillEntry("[Used](./references/used.md)"),
      "references/used.md": "# Used\n",
      "references/orphan.md": "# Orphan\n"
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "orphan-reference",
        path: "references/orphan.md",
        message: expect.any(String)
      }
    ]);
  });

  test("根目录下存在第二个 SKILL.md 时返回 nested-skill", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": validSkillEntry(""),
      "nested/SKILL.md": validSkillEntry("")
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "nested-skill",
        path: "nested/SKILL.md",
        message: expect.any(String)
      }
    ]);
  });

  test("代码、行内代码和图片中的 Markdown 路径不作为运行 reference", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": validSkillEntry(
        [
          "```md",
          "[Ignored](./references/code.md)",
          "```",
          "`[Ignored](./references/inline.md)`",
          "![Image](./references/image.md)"
        ].join("\n")
      )
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
  });

  test("reference definition 中的本地 Markdown 会作为运行 reference", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": validSkillEntry(
        ["[Guide][guide]", "", "[guide]: ./references/guide.md#read"].join("\n")
      ),
      "references/guide.md": "# Guide\n"
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
  });

  test("同一路径同类违规只返回一次", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": validSkillEntry(
        [
          "[Missing one](./references/missing.md)",
          "[Missing two](./references/missing.md)"
        ].join("\n")
      )
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "missing-reference",
        path: "references/missing.md",
        message: expect.any(String)
      }
    ]);
  });

  test("契约违规按路径和代码稳定排序", async () => {
    const skillRoot = await createSkillFixture({
      "SKILL.md": validSkillEntry(
        [
          "[B](./references/b-missing.md)",
          "[A](./references/a-missing.md)"
        ].join("\n")
      )
    });

    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([
      {
        code: "missing-reference",
        path: "references/a-missing.md",
        message: expect.any(String)
      },
      {
        code: "missing-reference",
        path: "references/b-missing.md",
        message: expect.any(String)
      }
    ]);
  });
});

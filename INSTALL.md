# 安装 Phase A 本地 Skill

本文档用于把仓库内 `skills/` 同步到 Codex 或 Claude Code 的本地 Skill 发现目录。仓库内 `skills/` 是唯一源码来源；安装副本不要直接改，修改必须先提交到本仓库，再重新同步。

## 前置条件

- Node.js 20 或更新版本
- npm
- git
- 已认证的 GitHub CLI：`gh auth status`
- Codex 或 Claude Code

## 识别目标目录

Codex 默认目录：

```sh
echo "${CODEX_HOME:-$HOME/.codex}/skills"
```

Claude Code 默认目录：

```sh
echo "$HOME/.claude/skills"
```

如果团队使用自定义目录，以工具实际加载路径为准。Windows Git Bash 下使用普通复制，不使用符号链接。

## 安装前检查

在仓库根目录执行：

```sh
npm ci
npm test
npm run build
node dist/cli.js doctor --root . --config config/projects.yml
git rev-parse HEAD
```

记录最后一条输出的 Commit。后续排查 Skill 行为时，以该 Commit 对应的仓库内容为准。

如目标目录已有同名 Skill，先查看差异：

```sh
diff -ru skills/generate-opentiny-article "$TARGET_SKILLS/generate-opentiny-article" || true
diff -ru skills/polish-opentiny-article "$TARGET_SKILLS/polish-opentiny-article" || true
```

## 同步

把 `$TARGET_SKILLS` 替换为 Codex 或 Claude Code 的目标目录：

```sh
mkdir -p "$TARGET_SKILLS"
rm -rf "$TARGET_SKILLS/generate-opentiny-article"
rm -rf "$TARGET_SKILLS/polish-opentiny-article"
cp -R skills/generate-opentiny-article "$TARGET_SKILLS/"
cp -R skills/polish-opentiny-article "$TARGET_SKILLS/"
```

## 安装后校验

```sh
test -f "$TARGET_SKILLS/generate-opentiny-article/SKILL.md"
test -f "$TARGET_SKILLS/polish-opentiny-article/SKILL.md"
node dist/cli.js projects validate --config config/projects.yml
node dist/cli.js --dry-run inspect-issue --issue-file tests/fixtures/issue-minimal.json
```

最小触发测试：在 Codex 或 Claude Code 中请求使用 `generate-opentiny-article`，确认工具能读到 Skill 标题和步骤即可。不要在触发测试中创建 PR。

## 更新

每次仓库内 Skill 变更后重复“安装前检查”和“同步”。安装副本只记录来源 Commit，不保留本地定制。

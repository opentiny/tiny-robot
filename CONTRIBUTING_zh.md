# 贡献指南

很高兴你有意愿参与 Tiny Robot 开源项目的贡献，参与贡献的形式有很多种，你可以根据自己的特长和兴趣选择其中的一个或多个：

- 报告[新缺陷](https://github.com/opentiny/tiny-robot/issues/new?template=bug_report.yml)
- 为[已有缺陷](https://github.com/opentiny/tiny-robot/labels/bug)提供更详细的信息，比如补充截图、提供更详细的复现步骤、提供最小可复现 demo 链接等
- 提交 Pull Requests 修复文档中的错别字或让文档更清晰和完善

当你对 Tiny Robot 逐渐熟悉之后，可以尝试做一些更有挑战的事情，比如：

- 修复缺陷
- 实现新特性
- 完善单元测试
- 翻译文档
- 参与代码检视

## 提交 Issue

如果你在使用 Tiny Robot 组件过程中遇到问题，欢迎给我们提交 Issue。提交 Issue 之前，请先仔细阅读相关文档，确认这是一个缺陷还是尚未实现的功能。

如果是一个缺陷，创建新 Issue 时选择 [Bug report](https://github.com/opentiny/tiny-robot/issues/new?template=bug_report.yml) 模板，标题遵循 `[componentName] 缺陷简述` 的格式，比如：`[bubble] 数据变化时消息内容未更新`。

报告缺陷的 Issue 主要需要填写以下信息：

- `@opentiny/tiny-robot` 和 `vue` 的版本号
- 缺陷的表现，可截图辅助说明，如果有报错可贴上报错信息
- 缺陷的复现步骤，最好能提供一个最小可复现 demo 链接

如果是一个新特性，则选择 [Feature request](https://github.com/opentiny/tiny-robot/issues/new?template=feature_request.yml) 模板，标题遵循 `[componentName] 新特性简述` 的格式，比如：`[sender] 希望能支持自定义 placeholder`。

新特性的 Issue 主要需要填写以下信息：

- 该特性主要解决用户的什么问题
- 该特性的 API 是什么样的

## 提交 PR

提交 PR 之前，请先确保你提交的内容符合 Tiny Robot 整体规划。一般已经标记为 [bug](https://github.com/opentiny/tiny-robot/labels/bug) 的 Issue 是鼓励提交 PR 的，如果你不是很确定，可以创建一个 [Discussion](https://github.com/opentiny/tiny-robot/discussions) 进行讨论。

### Pull Request 规范

#### Commit 信息

commit 信息要以 `type(scope): 描述信息` 的形式填写，例如 `fix(components): [bubble] fix xxx bug`。

1. **type**：必须是 build、chore、ci、docs、feat、fix、perf、refactor、revert、release、style、test、improvement 其中的一个。

2. **scope**（可选）：包名或组件名，如 `components`、`kit`、`bubble`、`sender`、`docs` 等。

#### Pull Request 的标题

标题的规范与 commit 信息一样，以 `type(scope): 描述信息` 的形式填写。

#### Pull Request 的描述

请填写 PR 相关信息，主要包括：

- PR 自检项：Commit 信息是否符合规范、是否在需要时补充了 E2E/测试用例、是否更新了文档
- PR 类型：缺陷修复、新特性、代码格式调整、重构、文档等
- 关联的 Issue 编号（如有）
- 是否包含破坏性变更

### 本地启动步骤

- 点击 [Tiny Robot](https://github.com/opentiny/tiny-robot) 代码仓库右上角的 Fork 按钮，将上游仓库 Fork 到个人仓库
- Clone 个人仓库到本地
- 关联上游仓库，方便同步上游仓库最新代码
- 在 Tiny Robot 根目录下运行 `pnpm i`，安装依赖
- 运行 `pnpm dev`，启动文档和演练场
- 打开浏览器访问文档和演练场

```shell
# username 为你的 GitHub 用户名，执行前请替换
git clone git@github.com:username/tiny-robot.git
cd tiny-robot

# 关联上游仓库
git remote add upstream git@github.com:opentiny/tiny-robot.git

# 安装依赖
pnpm i

# 启动文档和演练场
pnpm dev
```

### 提交 PR 的步骤

- 请确保你已经完成本地启动中的步骤，并能正常运行项目
- 同步上游仓库 develop 分支最新代码：`git pull upstream develop`
- 从上游仓库 develop 分支创建新分支：`git checkout -b username/feat-xxx upstream/develop`（修复缺陷可用 `username/fix-xxx`），分支名建议为 `username/feat-xxx` / `username/fix-xxx`
- 本地编码
- 遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范进行提交，不符合提交规范的 PR 将不会被合并
- 提交到远程仓库：`git push origin branchName`
- 打开 Tiny Robot 代码仓库的 [Pull requests](https://github.com/opentiny/tiny-robot/pulls) 链接，点击 **New pull request** 按钮提交 PR
- 填写 PR 描述（自检项、类型、关联 Issue、是否破坏性变更）
- 项目维护者进行 Code Review 并提出意见
- PR 作者根据意见调整代码，请注意一个分支发起了 PR 后，后续的 commit 会自动同步，无需重新提交 PR
- 项目维护者合并 PR

贡献流程结束，感谢你的贡献！

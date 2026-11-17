# Web Component 示例

三个独立项目使用同一组真实候选包，分别展示原生 JS、Angular、React 如何接入 `tr-chat`。每个页面都可以本地聊天、修改属性、延后接入 Runtime、切换浮窗和卸载重挂。回复由本地函数生成，无需 API 密钥。

| 宿主    | 项目                                                     | 工具链                   | 开发地址              |
| ------- | -------------------------------------------------------- | ------------------------ | --------------------- |
| 原生 JS | [web-component-js](web-component-js/README.md)           | JavaScript / Vite 8      | http://127.0.0.1:4327 |
| Angular | [web-component-angular](web-component-angular/README.md) | Angular 20 / Angular CLI | http://127.0.0.1:4328 |
| React   | [web-component-react](web-component-react/README.md)     | React 19 / Vite 8        | http://127.0.0.1:4329 |

## 能力导航

三个项目共用原生 JavaScript 展示框架：左侧为分组导航，右侧一次展示一个能力。框架保持在视口内，右侧内容独立滚动，导航位置保持固定；菜单过长时在导航内部滚动。窄屏时导航排列在内容上方，能力切换后内容回到顶部。

| 能力页       | 地址                       | 内容                                         |
| ------------ | -------------------------- | -------------------------------------------- |
| 属性与事件   | `#/basic/props`            | 标题、对象配置、布尔属性与本地聊天           |
| Runtime 接入 | `#/basic/runtime`          | 延后接入、首次就绪、卸载与重新挂载           |
| 浮窗状态     | `#/basic/floating`         | 位置、尺寸、拖动事件与状态回写               |
| 公开方法     | `#/basic/methods`          | 设置和清空草稿、聚焦、通过元素发送并读取结果 |
| 普通 Slot    | `#/content/ordinary-slots` | 欢迎说明、提示词换题、咨询主题和助手标识     |
| Scoped Slot  | `#/content/scoped-slots`   | 会话上下文、消息索引、Sender 操作与宿主输入  |

例如，React 的 Runtime 示例地址为 `http://127.0.0.1:4329/#/basic/runtime`。地址支持刷新、收藏和浏览器前进后退；未识别的路径回到属性与事件页。切换能力会销毁旧页面、释放本页的监听与 Runtime，再创建新页面；重新进入时使用初始状态。浏览器历史缓存暂存页面时保留当前视图，恢复后可继续聊天和导航。

## 启动页面

使用 Node 22（至少 22.12）和 pnpm 10.34.5。以下命令在仓库根目录执行。

1. 安装仓库依赖：

   ```sh
   pnpm install --no-frozen-lockfile
   ```

2. 启动三个开发项目：

   ```sh
   pnpm dev:wc-examples
   ```

   命令先构建并打包 `components`、`kit`、`svgs`、`chat`，为三个项目安装相同候选包，再启动开发服务。按 Ctrl+C 停止全部服务。安装依赖需要网络访问。

只查看一个项目时，可以运行 `pnpm dev:wc-examples --project=react`，`js` 和 `angular` 同样适用。

## 更新正在运行的示例

通过 `pnpm dev:wc-examples` 启动后，可在另一个终端更新候选包：

```sh
pnpm prepare:wc-examples
```

安装和产物校验完成后，启动器自动重启候选标识发生变化的宿主服务，浏览器重新连接并刷新页面。新进程重新读取依赖，避免沿用旧包缓存。更新会重新初始化对应演示页；相同候选重复校验时保留页面状态。`pnpm test:wc` 更新候选包时也会触发这一刷新。

`--project=js`、`--project=angular`、`--project=react` 可用于只准备或启动指定宿主。

## 一次验证三个宿主

```sh
pnpm test:wc
```

该命令构建一次候选包，校验三个项目的实际安装，再分别进行类型检查、生产构建并运行 Playwright。E2E 直接操作上面的示例页面，使用独立的 4427、4428、4429 端口，不复用已运行的服务。

| 命令                                 | 用途                                            |
| ------------------------------------ | ----------------------------------------------- |
| `pnpm test:wc --project=react`       | 只构建、启动和测试 React 示例                   |
| `pnpm test:wc --project=react --dev` | 验证 React 开发模式下的 StrictMode 初始化与清理 |
| `pnpm test:wc --grep 'Scoped Slot'`  | 在三个宿主上运行 Scoped Slot 交互验收           |
| `pnpm test:wc --grep '普通 Slot'`    | 在三个宿主上运行普通 Slot 交互验收              |
| `pnpm test:wc --grep '浮窗'`         | 在三个宿主上只运行浮窗用例                      |
| `pnpm test:wc-scripts`               | 验证候选标识和安装校验脚本                      |
| `pnpm prepare:wc-examples`           | 只准备候选包和独立项目依赖                      |

已经构建过且包源码、产物均未变化时，可加 `--skip-build` 跳过四包构建。生产验收仍会执行示例的类型检查和生产构建。开发模式验收占用开发端口，运行前应停止对应的手动开发服务。

测试代码位于 [packages/test/web-component](../packages/test/web-component/README.md)。通用用例分别运行于 `js`、`angular`、`react` 三个 Playwright project；宿主特定用例可以放入对应同名目录。Vue 组件测试继续独立运行。

生产报告位于 `.artifacts/web-component/report/index.html` 和 `results.json`；开发模式报告位于其 `development/` 子目录。报告记录宿主、运行模式和候选标识，失败保留截图与 trace。

## 示例的能力范围

当前页面覆盖适配组件的基础接入：字符串、普通对象和布尔属性，连接后传入 Runtime，首次就绪事件，浮窗状态与拖动事件，以及卸载后重新创建。浮窗需要从创建起就处于受控模式，因此示例在切换布局模式时重建聊天组件，会清空当前对话。

[web-component-shared](web-component-shared/README.md) 提供能力目录、布局、导航和地址处理。三个宿主各自实现 `src/demos/` 下的能力页，处理状态、DOM 属性、事件和视图生命周期。示例在卸载时中止本地 Runtime 请求并停止自己创建的 Vue effect scope；这不代表 SDK 已提供整体 Runtime dispose 契约。

基础兼容回归对照直接转换与适配组件，验证已可用的属性、原事件和公开方法；三个宿主的公开方法页覆盖真实包的输入、聚焦与发送。普通 Slot 页使用 `tr-chat`、`tr-chat-ui`，验证四个具名区域的内容、绑定、事件、条件子视图、空状态切换和卸载重挂。Scoped Slot 页验证三端宿主视图、会话与消息上下文、Sender 操作、输入订阅和卸载清理。流式回复、错误取消、会话切换和完整 Runtime 资源释放仍需各自验收。

## 增加能力演示

1. 在 `web-component-shared/catalog.js` 登记能力 ID、分组、标题、路径和说明，导航随目录生成。
2. 在三个项目各自的 `src/demos/` 下增加能力页，并在各自 `src/main.*` 中登记组件或挂载函数。原生 JS 返回清理函数；Angular、React 通过各自组件生命周期清理视图。
3. 在 `packages/test/web-component/common/` 添加使用相同能力地址的共同验收；宿主特定行为放入对应目录。

展示框架保留稳定的内容容器，只通知当前能力变化；能力页的挂载、属性绑定、事件和清理由所属宿主管理。目录登记的是三个宿主都已提供的演示能力。

## 真实包来源

四个 tarball 及 `provenance.json` 位于 `.artifacts/web-component/candidates/<候选标识>/`。候选标识包含四包的清单、所有 dist 文件和 README；CSS 或声明文件变化也会产生新候选。安装后逐项核对实际包版本、模块路径以及 JS、CSS、声明等产物哈希，避免测试源码别名或旧候选包。

三个项目各有自己的 `pnpm-workspace.yaml` 和锁文件，所有 TinyRobot 依赖通过 override 指向同一候选组，Vue 固定为 3.5.41。`package.json` 中的 file 路径由准备命令生成；新 checkout 应先运行根目录的准备或启动命令，再进入项目。

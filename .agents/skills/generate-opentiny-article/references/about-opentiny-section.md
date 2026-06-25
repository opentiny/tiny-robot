# 关于 OpenTiny NEXT 收尾章节（默认模板）

OpenTiny 对外文章默认在正文末尾追加一段「关于 OpenTiny NEXT」介绍与社区邀请。文案是固定品牌信息，套用本模板，不要即兴改写或编造。

## 何时包含 / 何时省略

- **默认包含**：所有类型文章都在正文最后追加本章节，标题固定为 `## 关于 OpenTiny NEXT`，位置放在「立即体验 / 总结 / 结语」之后的最末尾。
- **省略**：仅当选题或写作计划阶段，人工以自然语言明确表示不要该收尾章节时才省略——这是自然语言判断，不需要固定命令；省略时在写作计划的建议大纲里不列出本章节即可。

## 固定文案

先按下表填好「代码仓库」一行，再整体套用：

```markdown
## 关于 OpenTiny NEXT

OpenTiny NEXT 是一套企业智能前端开发解决方案，以生成式 UI 和 WebMCP 两大核心技术为基础，对现有传统的 TinyVue 组件库、TinyEngine 低代码引擎等产品进行智能化升级，构建出面向 Agent 应用的前端 NEXT-SDKs、AI Extension、TinyRobot 智能助手、GenUI 等新产品，实现 AI 理解用户意图自主完成任务，加速企业应用的智能化改造。

欢迎加入 OpenTiny 开源社区。添加微信小助手：opentiny-official 一起参与交流前端技术～
OpenTiny 官网：[opentiny.design](https://opentiny.design)
<产品名> 代码仓库：[github.com/opentiny/<repo>](https://github.com/opentiny/<repo>)（欢迎 star ⭐）
如果你也想要共建，可以进入代码仓库，找到 good first issue 标签，一起参与开源贡献～如果你有任何问题，欢迎在评论区留言交流！
```

## 按项目填充「代码仓库」行

`<产品名>` 与 `<repo>` 以本文 `project_id` 在 `config/projects.yml` 中 `role: primary-source` 的仓库为准：

| project_id | 产品名 | 代码仓库 |
| --- | --- | --- |
| webmcp-sdk | WebMCP SDK | https://github.com/opentiny/webmcp-sdk |
| genui-sdk | GenUI SDK | https://github.com/opentiny/genui-sdk |
| tiny-robot | TinyRobot | https://github.com/opentiny/tiny-robot |

新增项目时，以 `config/projects.yml` 中该项目的 `primary-source` 仓库为准对应填充，不要沿用其他项目的链接。

## 可微调 / 不可改

- **可微调**：仅与正文衔接的过渡或引导语（例如承接上文的一句话），让收尾自然，不显得生硬拼接。
- **不可改、不可新增**：产品定位描述、产品清单、官网与仓库链接目标、微信小助手 `opentiny-official`、品牌名等都是固定事实，不得改写、增删或编造；链接统一用上面的 canonical URL，不要替换成发布平台的跳转链接。

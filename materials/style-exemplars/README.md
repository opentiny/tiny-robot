# 文风范例策展库

## 用途

本目录收录四种文风的优秀技术文章范例，供 AI 与维护者在生成和润色 OpenTiny 文章时作为写作手艺参照与出处。每种文风对应一个 Markdown 文件，记录范例的来源、为什么好、craft 解剖和可迁移招式。

本目录是学习业界优秀技术文章的可迁移写作手艺，**不照搬主题或措辞**。

## 选取标准

每篇范例同时满足以下四条：

1. **高传播**：具有可验证的传播信号（HN 高分、官方博客、广泛转载、大量粉丝或高阅读量等）。
2. **高手艺**：在钩子（hook）、判断（judgement）、主线（spine）、具体（concreteness）四个维度中至少两项表现突出。
3. **领域贴近**：内容与前端工程、组件库、框架内核或软件工程实践相关。
4. **可公开访问**：URL 可直接访问，内容不受登录墙阻挡。

## 版权与引用约定

- 顶层四份文风档案只存 URL、短节选和 craft 提炼；节选保留原作者与出处，不替代阅读原文。
- 各文风子目录保存 16 篇内部正文静态镜像，仅供私有仓库中的离线 Agent 和维护者参考，不用于公开转载。
- 每篇镜像均标注标题、作者、出处和采集日期；引用时仍应回到原文。
- 如原始链接失效，以本文件中的「craft 解剖」提炼文字与采集日期为准。

## 文件清单

| 文件 | 文风 | 说明 |
| --- | --- | --- |
| `technical-deep-dive.md` | 技术深潜（technical-deep-dive） | 源码解析、架构原理、机制拆解类文章 |
| `developer-friendly.md` | 开发者友好（developer-friendly） | 教程、指南、最佳实践类文章 |
| `release-promotional.md` | 发版推广（release-promotional） | 版本发布公告、特性介绍类文章 |
| `official-balanced.md` | 官方均衡（official-balanced） | 工程博客、故障复盘、架构演进类文章 |

## 正文镜像

16 篇范例文章的英文或原文正文静态镜像已保存至各文风子目录（`technical-deep-dive/`、`developer-friendly/`、`release-promotional/`、`official-balanced/`），供离线/无网 Agent 深读使用。部分中文译文另存为 `.zh.md` 辅助镜像，不替代原文。

**使用说明：**

- 正文镜像仅供内部参考，版权归原作者所有。
- 采集日期：2026-06-25。

**镜像清单：**

| 文风 | slug | 字节数 |
| --- | --- | --- |
| technical-deep-dive | react-as-a-ui-runtime | ~51 KB |
| technical-deep-dive | how-does-setstate-know-what-to-do | ~13 KB |
| technical-deep-dive | deep-dive-react-fiber | ~39 KB |
| technical-deep-dive | vue3computed | ~8 KB |
| developer-friendly | interactive-guide-to-flexbox | ~25 KB |
| developer-friendly | interactive-guide-to-grid | ~18 KB |
| developer-friendly | 5-css-snippets-every-front-end-developer-should-know-in-2024 | ~7 KB |
| developer-friendly | common-mistakes-with-react-testing-library | ~20 KB |
| release-promotional | vue-3-4 | ~9 KB |
| release-promotional | next-15 | ~36 KB |
| release-promotional | announcing-typescript-5-0 | ~57 KB |
| release-promotional | announcing-vite5 | ~10 KB |
| official-balanced | sharding-postgres-at-notion | ~21 KB |
| official-balanced | cloudflare-incident-on-june-20-2024 | ~20 KB |
| official-balanced | shopify-monolith | ~33 KB |
| official-balanced | api-versioning | ~14 KB |

## 说明

本目录是**人工策展资料**，不是 Skill 运行时强依赖。Skill 可参考本目录内容，但不依赖其存在来完成正常运行。

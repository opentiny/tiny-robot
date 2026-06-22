# Integration 测试边界

Integration 测试只验证调用方可观察的公开行为，避免绑定实现细节。

## 应该验证

- CLI exit code。
- 稳定 JSON envelope，例如 `ok`、`schema_version`、`dry_run`。
- 稳定错误码，例如 `INVALID_JSON`、`UNSAFE_PATH`。
- `--dry-run` 不写文件、不执行外部 mutation。
- 少量关键端到端路径，例如本地 git checkout、文章素材校验。

## 不应该验证

- 仓库文件和目录的完整清单。
- 临时迁移术语是否仍然不存在。
- 用户可见文案的精确词语，除非该词语是公开协议字段。
- 内部 `mutation_plan.operations` 的完整顺序，除非顺序是调用方契约。
- fixture 的完整快照、comment 数量、标题或列表顺序。

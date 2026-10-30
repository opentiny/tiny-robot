/** Shared defaults for option normalization and the standalone DOM view. */
export const DEFAULT_INPUT = {
  maxRows: 2,
  autoFill: true,
  placeholder: '告诉 AI 你想做什么',
  ariaLabel: '请输入问题',
  submitLabel: '发送问题',
  maxLengthExceededMessage: '字数超出限制',
}

export const DEFAULT_MESSAGES = {
  loading: '正在加载推荐…',
  empty: '暂无推荐',
  error: '推荐加载失败',
}

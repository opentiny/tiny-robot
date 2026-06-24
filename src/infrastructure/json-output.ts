/**
 * 将对象序列化为 CLI stdout 使用的稳定 JSON 文本。
 */
export function serializeJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

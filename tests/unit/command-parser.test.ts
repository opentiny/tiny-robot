import { describe, expect, test } from "vitest";

import { parseAiCommand } from "../../src/domain/command-parser.js";

describe("parseAiCommand", () => {
  test.each([
    ["/ai 状态", "status"],
    ["/ai 批准选题", "approve-topic"],
    ["/ai 批准写作计划", "approve-writing-plan"],
    ["/ai 暂停", "pause"],
    ["/ai 恢复", "resume"],
    ["/ai 重试", "retry"],
  ])("解析支持的固定命令类型：%s", (body, kind) => {
    expect(parseAiCommand(body)).toEqual({ kind });
  });

  test("拒绝一个代表性的非固定命令", () => {
    expect(parseAiCommand("请开始写作")).toBeNull();
  });

  test.each([
    "/ai 批准写作计划 2 a1b2c3d4",
    "/ai 批准写作计划 ",
    " /ai 批准写作计划",
    "我批准 /ai 批准写作计划",
  ])("拒绝携带参数或近似的批准命令：%s", (body) => {
    expect(parseAiCommand(body)).toBeNull();
  });
});

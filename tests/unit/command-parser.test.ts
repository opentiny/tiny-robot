import { describe, expect, test } from "vitest";

import { parseAiCommand } from "../../src/domain/command-parser.js";

describe("parseAiCommand", () => {
  test("只接受完整的小写 hash 写作计划批准命令", () => {
    expect(parseAiCommand("/ai 批准写作计划 2 a1b2c3d4")).toEqual({
      kind: "approve-writing-plan",
      planVersion: 2,
      hashPrefix: "a1b2c3d4"
    });
  });

  test.each([
    ["/ai 状态", "status"],
    ["/ai 批准选题", "approve-topic"],
    ["/ai 暂停", "pause"],
    ["/ai 恢复", "resume"],
    ["/ai 重试", "retry"]
  ])("解析支持的固定命令类型", (body, kind) => {
    expect(parseAiCommand(body)).toMatchObject({ kind });
  });

  test("拒绝一个代表性的非固定命令", () => {
    expect(parseAiCommand("请开始写作")).toBeNull();
  });

  test.each([
    "/ai 批准写作计划 0 a1b2c3d4",
    "/ai 批准写作计划 -1 a1b2c3d4",
    "/ai 批准写作计划 9007199254740993 a1b2c3d4",
    "/ai 批准写作计划 2 A1B2C3D4",
    "/ai 批准写作计划 2 a1b2c3d",
    "/ai 批准写作计划 2 a1b2c3d45"
  ])("拒绝近似或非批准命令：%s", (body) => {
    expect(parseAiCommand(body)).toBeNull();
  });
});

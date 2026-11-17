import { isTranslationKey, translate } from "../../i18n/index.js";
import { classifyStatus } from "../api/errors.js";
import type { AssistantMessage } from "./types.js";

export type Notice = {
  text: string;
  /** 模板答复使用正文样式；其余统一为红色错误提示。 */
  presentation?: "response";
  /** 需要用户处理的问题附带的操作 */
  action?: "apiKey" | "topUp";
};

const getTemplateText = (reply: AssistantMessage) =>
  reply.blocks
    .map((block) => (block.type === "text" && block.isTemplate ? block.text : ""))
    .join("");

/** 回复出错或未正常结束时展示的提示 */
export const describeReply = (reply: AssistantMessage): Notice | null => {
  if (reply.status === "error" && reply.error) {
    const { kind, status, localMessage } = reply.error;
    // 导入的历史可能来自不同版本；不识别的文案沿用保存时的原文。
    const message =
      localMessage && isTranslationKey(localMessage.key)
        ? translate(localMessage.key, localMessage.params)
        : reply.error.message;
    // 历史补传错误刷新后仍需说明原因，恢复沿用附件卡片或重新生成。
    if (kind === "upload") {
      return { text: message || translate("uploadFileStatusFailed") };
    }
    if (kind === "network") {
      return { text: translate("commonNetworkErrorToast") };
    }
    switch (classifyStatus(status)) {
      case "unauthorized":
        return { text: translate("replyInvalidApiKey"), action: "apiKey" };
      case "insufficientBalance":
        return { text: translate("replyInsufficientBalance"), action: "topUp" };
      case "rateLimited":
        return { text: translate("replyRateLimited") };
      case "serverBusy":
        return { text: translate("completionServerBusyToast") };
      default:
        return message ? { text: message } : null;
    }
  }
  const template = getTemplateText(reply);
  // 归档不带结构化错误，错误文案保存在模板中，仍按错误提示展示。
  if (reply.status === "error" && template) {
    return { text: template };
  }
  if (reply.stopReason === "refusal") {
    // 导入的拒绝回复优先展示归档中的模板，普通正文仍不可展示。
    return { text: template || translate("replyRefused"), presentation: "response" };
  }
  if (template) {
    return { text: template, presentation: "response" };
  }
  return null;
};

import { translate, type TranslationKey } from "../../../i18n/index.js";

/** 导入导出失败的原因，key 对应界面提示文案。 */
export class BackupError extends Error {
  constructor(readonly key: TranslationKey) {
    super(translate(key));
    this.name = "BackupError";
  }
}

export const fail = (key: TranslationKey): never => {
  throw new BackupError(key);
};

import { getRegionName, provinces, type UserLocation } from "../location.js";
import type { Locale } from "../settings.js";
import { formatDate } from "../../utils/format.js";
import { translate } from "../../i18n/index.js";

const locationName = (location: UserLocation | null, locale: Locale): string => {
  if (!location) {
    return "";
  }
  if (location.region === "CN" && locale === "zh-CN") {
    const province = provinces.find((item) => item.code === location.province);
    const city = province?.cities.find((item) => item.code === location.city);
    return city?.name ?? province?.name ?? getRegionName("CN", locale);
  }
  return getRegionName(location.region, locale);
};

/** 模型约定的五项信息；日期与星期使用浏览器本地时区，避免 UTC 日期跨日。 */
export const createLatestReminder = (
  { locale, location }: { locale: Locale; location: UserLocation | null },
  now = new Date(),
): string => {
  return [
    formatDate(now),
    new Intl.DateTimeFormat(locale, { weekday: "long" }).format(now),
    locationName(location, locale),
    "Web",
    translate("latestReminderLanguage"),
  ].join(",");
};

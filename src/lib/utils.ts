import BigNumber from "bignumber.js";
import { clsx, type ClassValue } from "clsx";
import { DateTime } from "luxon";
import { twMerge } from "tailwind-merge";
import { type GrpcTime } from "./objects";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

DateTime.prototype.toGrpcTime = function (this: DateTime): GrpcTime {
  const ms = this.toMillis();
  return {
    seconds: Math.floor(ms / 1000),
    nanos: (ms % 1000) * 1_000_000,
  };
};

export function formatCurrency(val: BigNumber | string | number): string {
  const amount = BigNumber.isBigNumber(val) ? val : new BigNumber(val || "0");
  return `₹${amount.toFormat(2).replace(/\.00$/, "")}`;
}

type FormatDateOptions =
  | { weekDay?: boolean; seconds?: false }
  | { weekDay?: false; seconds?: boolean };

export function formatDate(
  time: GrpcTime | undefined | null,
  locale: FormatDateOptions = {},
): string {
  if (!time) return "";

  const format: Intl.DateTimeFormatOptions = { ...DateTime.DATETIME_MED };
  if (locale.weekDay) format.weekday = "short";
  if (locale.seconds) format.second = "numeric";

  return DateTime.fromSeconds(time.seconds, {
    zone: "Asia/Kolkata",
  }).toLocaleString(format);
}

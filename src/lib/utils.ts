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
  return `₹ ${amount.toFormat(2).replace(/\.00$/, "")}`;
}

export function formatDate(
  time: GrpcTime | undefined | null,
  weekDay: boolean = false,
): string {
  if (!time) return "";
  return DateTime.fromSeconds(time.seconds, {
    zone: "Asia/Kolkata",
  }).toLocaleString(
    weekDay ? DateTime.DATETIME_MED_WITH_WEEKDAY : DateTime.DATETIME_MED,
  );
}

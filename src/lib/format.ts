import BigNumber from "bignumber.js";
import { DateTime } from "luxon";

import { formatTimestamp, type GrpcTimestamp } from "@/lib/time";

const inrWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const inrFractional = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(val: BigNumber | string | number): string {
  const amount = BigNumber.isBigNumber(val)
    ? val
    : new BigNumber(val === "" ? "0" : val);
  if (!amount.isFinite()) return "—";
  const fixed = amount.toFixed(2);
  const formatter = amount.isInteger() ? inrWhole : inrFractional;
  return formatter.format(fixed as unknown as number);
}

type FormatDateOptions =
  | { weekDay?: boolean; seconds?: false }
  | { weekDay?: false; seconds?: boolean };

export function formatDate(
  time: GrpcTimestamp | undefined | null,
  options: FormatDateOptions = {},
): string {
  const format: Intl.DateTimeFormatOptions = { ...DateTime.DATETIME_MED };
  if (options.weekDay) format.weekday = "short";
  if (options.seconds) format.second = "numeric";
  return formatTimestamp(time, format);
}

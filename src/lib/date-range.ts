import { DateTime } from "luxon";
import { type DateRange } from "react-day-picker";

import {
  TIME_ZONE,
  fromGrpcTime,
  toGrpcTime,
  type GrpcTimestamp,
} from "@/lib/time";

export function pickerDateToZoned(date: Date): DateTime {
  return DateTime.fromObject(
    {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    },
    { zone: TIME_ZONE },
  );
}

export function zonedToPickerDate(value: DateTime): Date {
  const zoned = value.setZone(TIME_ZONE);
  return new Date(zoned.year, zoned.month - 1, zoned.day);
}

export function zonedRangeToPicker(from: DateTime, to: DateTime): DateRange {
  return { from: zonedToPickerDate(from), to: zonedToPickerDate(to) };
}

export function grpcToPickerDate(value: GrpcTimestamp): Date {
  return zonedToPickerDate(fromGrpcTime(value));
}

export function dayRangeToGrpc(from: Date, to: Date) {
  return {
    start_date: toGrpcTime(pickerDateToZoned(from).startOf("day")),
    end_date: toGrpcTime(pickerDateToZoned(to).endOf("day")),
  };
}

export type RangePreset =
  "today" | "this_week" | "last_week" | "this_month" | "last_month";

export function presetRange(preset: RangePreset): {
  from: DateTime;
  to: DateTime;
} {
  const now = DateTime.now().setZone(TIME_ZONE);
  switch (preset) {
    case "today":
      return { from: now.startOf("day"), to: now.endOf("day") };
    case "this_week":
      return { from: now.startOf("week"), to: now.endOf("week") };
    case "last_week": {
      const lastWeek = now.minus({ weeks: 1 });
      return { from: lastWeek.startOf("week"), to: lastWeek.endOf("week") };
    }
    case "this_month":
      return { from: now.startOf("month"), to: now.endOf("month") };
    case "last_month": {
      const lastMonth = now.minus({ months: 1 });
      return { from: lastMonth.startOf("month"), to: lastMonth.endOf("month") };
    }
  }
}

export function presetToGrpc(preset: RangePreset): {
  start_date: GrpcTimestamp;
  end_date: GrpcTimestamp;
} {
  const { from, to } = presetRange(preset);
  return { start_date: toGrpcTime(from), end_date: toGrpcTime(to) };
}

export function presetToPicker(preset: RangePreset): DateRange {
  const { from, to } = presetRange(preset);
  return zonedRangeToPicker(from, to);
}

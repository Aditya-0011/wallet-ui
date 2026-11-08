import { DateTime, Settings } from "luxon";
import { z } from "zod";

export const TIME_ZONE = "Asia/Kolkata";

Settings.defaultZone = TIME_ZONE;

export const GrpcTimeSchema = z.iso.datetime({ offset: true });
export type GrpcTimestamp = z.infer<typeof GrpcTimeSchema>;

export function fromGrpcTime(value: GrpcTimestamp): DateTime {
  return DateTime.fromISO(value, { zone: TIME_ZONE });
}

export function toGrpcTime(value: DateTime): GrpcTimestamp {
  const iso = value.toUTC().toISO();
  if (!iso) throw new Error(`Invalid date: ${value.invalidReason}`);
  return iso;
}

export function grpcTimeMillis(
  value: GrpcTimestamp | null | undefined,
): number {
  return value ? fromGrpcTime(value).toMillis() : 0;
}

export function formatTimestamp(
  value: GrpcTimestamp | null | undefined,
  format: Intl.DateTimeFormatOptions = DateTime.DATETIME_MED,
): string {
  if (!value) return "";
  return fromGrpcTime(value).toLocaleString(format);
}

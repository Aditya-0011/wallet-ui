import { useId, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { presetToPicker, type RangePreset } from "@/lib/date-range";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
  labelledBy?: string;
};

const PRESETS: { preset: RangePreset; label: string }[] = [
  { preset: "this_week", label: "This Week" },
  { preset: "last_week", label: "Last Week" },
  { preset: "this_month", label: "This Month" },
  { preset: "last_month", label: "Last Month" },
];

const shortFormat = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "2-digit",
});
const longFormat = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

function describeRange(date: DateRange | undefined): string {
  if (!date?.from) return "Pick a date range";
  if (!date.to) return longFormat.format(date.from);
  return `${shortFormat.format(date.from)} – ${longFormat.format(date.to)}`;
}

export function DateRangePicker({
  date,
  setDate,
  className,
  labelledBy,
}: DateRangePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isMobile = useIsMobile();
  const valueId = useId();

  const setPreset = (preset: RangePreset) => {
    setDate(presetToPicker(preset));
    setIsCalendarOpen(false);
  };

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            aria-labelledby={
              labelledBy ? `${labelledBy} ${valueId}` : undefined
            }
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon data-icon="inline-start" aria-hidden="true" />
            <span id={valueId}>{describeRange(date)}</span>
          </Button>
        }
      />
      <PopoverContent
        className="border-input max-h-[calc(100dvh-4rem)] w-auto overflow-y-auto rounded-md border bg-neutral-950 p-0 shadow-md"
        align="start"
      >
        <div className="grid grid-cols-2 gap-2 border-b border-white/10 p-2 sm:flex sm:flex-row">
          {PRESETS.map(({ preset, label }) => (
            <Button
              key={preset}
              variant="ghost"
              size="sm"
              className="justify-start text-xs text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 hover:inset-ring hover:ring-amber-500"
              onClick={() => setPreset(preset)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={isMobile ? 1 : 2}
          showOutsideDays={false}
          className="transactions-calendar"
        />
      </PopoverContent>
    </Popover>
  );
}

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { type DateRange } from "react-day-picker";

type DateRangePickerProps = {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
};

export function DateRangePicker({
  date,
  setDate,
  className,
}: DateRangePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isMobile = useIsMobile();

  const setPreset = (
    preset: "this_week" | "last_week" | "this_month" | "last_month",
  ) => {
    const now = DateTime.now();
    let from: DateTime;
    let to: DateTime;

    switch (preset) {
      case "this_week":
        from = now.startOf("week");
        to = now.endOf("week");
        break;
      case "last_week":
        from = now.minus({ weeks: 1 }).startOf("week");
        to = now.minus({ weeks: 1 }).endOf("week");
        break;
      case "this_month":
        from = now.startOf("month");
        to = now.endOf("month");
        break;
      case "last_month":
        from = now.minus({ months: 1 }).startOf("month");
        to = now.minus({ months: 1 }).endOf("month");
        break;
    }

    setDate({
      from: from.toJSDate(),
      to: to.toJSDate(),
    });
    setIsCalendarOpen(false);
  };

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {DateTime.fromJSDate(date.from).toFormat("LLL dd")} -{" "}
                  {DateTime.fromJSDate(date.to).toFormat("LLL dd, yyyy")}
                </>
              ) : (
                DateTime.fromJSDate(date.from).toFormat("LLL dd, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        }
      />
      <PopoverContent
        className="border-input max-h-[calc(100dvh-4rem)] w-auto overflow-y-auto rounded-md border bg-neutral-950 p-0 shadow-md"
        align="start"
      >
        <div className="grid grid-cols-2 gap-2 border-b border-white/10 p-2 sm:flex sm:flex-row">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-xs text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 hover:inset-ring hover:ring-amber-500"
            onClick={() => setPreset("this_week")}
          >
            This Week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-xs text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 hover:inset-ring hover:ring-amber-500"
            onClick={() => setPreset("last_week")}
          >
            Last Week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-xs text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 hover:inset-ring hover:ring-amber-500"
            onClick={() => setPreset("this_month")}
          >
            This Month
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-xs text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 hover:inset-ring hover:ring-amber-500"
            onClick={() => setPreset("last_month")}
          >
            Last Month
          </Button>
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

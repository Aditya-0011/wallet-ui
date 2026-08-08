import { DateRangePicker } from "@/components/pages/transactions/ui/DateRangePicker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CategoryType,
  type Category,
  type GetTransactionsRequest,
} from "@/lib/objects";
import { ListFilter, RefreshCcw } from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { type DateRange } from "react-day-picker";

type FiltersProps = {
  filters: GetTransactionsRequest;
  setFilters: (filters: GetTransactionsRequest) => void;
  categories: Category[];
};

export function Filters({ filters, setFilters, categories }: FiltersProps) {
  const [localType, setLocalType] = useState<CategoryType | "all">(
    filters.type ?? "all",
  );
  const [localCategoryId, setLocalCategoryId] = useState<number | "all">(
    filters.category_id ?? "all",
  );

  const [date, setDate] = useState<DateRange | undefined>({
    from: filters.start_date
      ? DateTime.fromSeconds(filters.start_date.seconds).toJSDate()
      : undefined,
    to: filters.end_date
      ? DateTime.fromSeconds(filters.end_date.seconds).toJSDate()
      : undefined,
  });

  const filteredCategories = categories.filter((c) =>
    localType === "all" ? true : c.type === localType,
  );

  const handleApply = () => {
    setFilters({
      ...filters,
      page: 1,
      type: localType === "all" ? undefined : localType,
      category_id: localCategoryId === "all" ? undefined : localCategoryId,
      start_date: date?.from
        ? DateTime.fromJSDate(date.from).startOf("day").toGrpcTime()
        : undefined,
      end_date: date?.to
        ? DateTime.fromJSDate(date.to).endOf("day").toGrpcTime()
        : undefined,
    });
  };

  const handleReset = () => {
    const now = DateTime.now();
    const thisWeekStart = now.startOf("week");
    const thisWeekEnd = now.endOf("week");

    setLocalType("all");
    setLocalCategoryId("all");
    setDate({
      from: thisWeekStart.toJSDate(),
      to: thisWeekEnd.toJSDate(),
    });

    setFilters({
      ...filters,
      page: 1,
      type: undefined,
      category_id: undefined,
      start_date: thisWeekStart.toGrpcTime(),
      end_date: thisWeekEnd.toGrpcTime(),
    });
  };

  const inputClass =
    "border-input h-9 w-full rounded-md border bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:border-amber-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500";

  return (
    <div className="mb-4 flex w-full flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid w-full grid-cols-2 gap-3 lg:flex lg:w-auto lg:flex-1 lg:flex-nowrap lg:items-end">
        <div className="col-span-1 flex flex-col lg:w-35">
          <span className="text-muted-foreground mb-1.5 pl-1 text-xs font-medium">
            Type
          </span>
          <Select
            value={localType.toString()}
            onValueChange={(val) => {
              const newType =
                val === "all" ? "all" : (Number(val) as CategoryType);
              setLocalType(newType);
              if (newType !== "all" && localCategoryId !== "all") {
                const cat = categories.find((c) => c.id === localCategoryId);
                if (cat && cat.type !== newType) {
                  setLocalCategoryId("all");
                }
              }
            }}
          >
            <SelectTrigger className={inputClass}>
              <SelectValue>
                {(val: string | null) => {
                  if (!val || val === "all") return "All";
                  if (val === CategoryType.Income.toString()) return "Income";
                  if (val === CategoryType.Expense.toString()) return "Expense";
                  return "All";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-input rounded-md border bg-neutral-950 px-1 py-2">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value={CategoryType.Income.toString()}>
                Income
              </SelectItem>
              <SelectItem value={CategoryType.Expense.toString()}>
                Expense
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 flex flex-col lg:w-45">
          <span className="text-muted-foreground mb-1.5 pl-1 text-xs font-medium">
            Category
          </span>
          <Select
            value={localCategoryId.toString()}
            onValueChange={(val) =>
              setLocalCategoryId(val === "all" ? "all" : Number(val))
            }
          >
            <SelectTrigger className={inputClass}>
              <SelectValue>
                {(val: string | null) => {
                  if (!val || val === "all") return "All";
                  const selectedCategory = categories.find(
                    (c) => c.id === Number(val),
                  );
                  return selectedCategory ? (
                    <div className="flex items-center gap-2">
                      <span>{selectedCategory.icon}</span>
                      <span className="truncate">{selectedCategory.name}</span>
                    </div>
                  ) : (
                    "All"
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-input rounded-md border bg-neutral-950 px-1 py-2">
              <SelectItem value="all">All</SelectItem>
              {filteredCategories.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{c.icon}</span>
                    <span>{c.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex flex-col lg:col-span-1 lg:w-65">
          <span className="text-muted-foreground mb-1.5 pl-1 text-xs font-medium">
            Date Range
          </span>
          <DateRangePicker
            date={date}
            setDate={setDate}
            className={inputClass}
          />
        </div>
      </div>
      <div className="mt-1 grid grid-cols-2 items-center gap-2 lg:mt-0 lg:flex lg:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex h-9 w-full items-center gap-2 rounded-md lg:w-auto"
        >
          <RefreshCcw className="size-4" />
          Reset
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          className="flex h-9 w-full items-center gap-2 rounded-md bg-neutral-950 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 hover:inset-ring hover:ring-amber-500 lg:w-auto"
        >
          <ListFilter className="size-4" />
          Filter
        </Button>
      </div>
    </div>
  );
}

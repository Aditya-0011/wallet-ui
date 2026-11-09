import { useId, useState } from "react";
import { ListFilter, RefreshCcw } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { DateRangePicker } from "@/components/pages/transactions/ui/DateRangePicker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  dayRangeToGrpc,
  grpcToPickerDate,
  presetToGrpc,
  presetToPicker,
} from "@/lib/date-range";
import {
  CategoryType,
  type Category,
  type GetTransactionsRequest,
} from "@/lib/objects";

type FiltersProps = {
  filters: GetTransactionsRequest;
  onApply: (filters: GetTransactionsRequest) => void;
  categories: Category[];
};

export function Filters({ filters, onApply, categories }: FiltersProps) {
  const typeId = useId();
  const categoryId = useId();
  const dateId = useId();

  const [localType, setLocalType] = useState<CategoryType | "all">(
    filters.type ?? "all",
  );
  const [localCategoryId, setLocalCategoryId] = useState<number | "all">(
    filters.category_id ?? "all",
  );
  const [date, setDate] = useState<DateRange | undefined>(() => ({
    from: filters.start_date ? grpcToPickerDate(filters.start_date) : undefined,
    to: filters.end_date ? grpcToPickerDate(filters.end_date) : undefined,
  }));

  const filteredCategories =
    localType === "all"
      ? categories
      : categories.filter((c) => c.type === localType);

  const handleApply = () => {
    const range =
      date?.from && date.to
        ? dayRangeToGrpc(date.from, date.to)
        : date?.from
          ? dayRangeToGrpc(date.from, date.from)
          : { start_date: undefined, end_date: undefined };

    onApply({
      ...filters,
      type: localType === "all" ? undefined : localType,
      category_id: localCategoryId === "all" ? undefined : localCategoryId,
      ...range,
    });
  };

  const handleReset = () => {
    setLocalType("all");
    setLocalCategoryId("all");
    setDate(presetToPicker("this_week"));
    onApply({
      ...filters,
      type: undefined,
      category_id: undefined,
      ...presetToGrpc("this_week"),
    });
  };

  const inputClass =
    "border-input h-9 w-full rounded-md border bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:border-amber-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500";

  return (
    <div className="mb-4 flex w-full flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div className="grid w-full grid-cols-2 gap-3 xl:flex xl:w-auto xl:flex-1 xl:flex-nowrap xl:items-end">
        <div className="col-span-1 flex flex-col xl:w-35">
          <span
            id={typeId}
            className="text-muted-foreground mb-1.5 pl-1 text-xs font-medium"
          >
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
            <SelectTrigger className={inputClass} aria-labelledby={typeId}>
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
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value={CategoryType.Income.toString()}>
                  Income
                </SelectItem>
                <SelectItem value={CategoryType.Expense.toString()}>
                  Expense
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 flex flex-col xl:w-45">
          <span
            id={categoryId}
            className="text-muted-foreground mb-1.5 pl-1 text-xs font-medium"
          >
            Category
          </span>
          <Select
            value={localCategoryId.toString()}
            onValueChange={(val) =>
              setLocalCategoryId(val === "all" ? "all" : Number(val))
            }
          >
            <SelectTrigger className={inputClass} aria-labelledby={categoryId}>
              <SelectValue>
                {(val: string | null) => {
                  if (!val || val === "all") return "All";
                  const selectedCategory = categories.find(
                    (c) => c.id === Number(val),
                  );
                  return selectedCategory ? (
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true">{selectedCategory.icon}</span>
                      <span className="truncate">{selectedCategory.name}</span>
                    </div>
                  ) : (
                    "All"
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-input rounded-md border bg-neutral-950 px-1 py-2">
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true">{c.icon}</span>
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex flex-col xl:col-span-1 xl:w-65">
          <span
            id={dateId}
            className="text-muted-foreground mb-1.5 pl-1 text-xs font-medium"
          >
            Date Range
          </span>
          <DateRangePicker
            date={date}
            setDate={setDate}
            className={inputClass}
            labelledBy={dateId}
          />
        </div>
      </div>
      <div className="mt-1 grid grid-cols-2 items-center gap-2 xl:mt-0 xl:flex xl:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex h-9 w-full items-center gap-2 rounded-md xl:w-auto"
        >
          <RefreshCcw data-icon="inline-start" aria-hidden="true" />
          Reset
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          className="flex h-9 w-full items-center gap-2 rounded-md bg-neutral-950 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 hover:inset-ring hover:ring-amber-500 xl:w-auto"
        >
          <ListFilter data-icon="inline-start" aria-hidden="true" />
          Filter
        </Button>
      </div>
    </div>
  );
}

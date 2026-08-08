import { Delete } from "@/components/pages/Delete";
import { Form } from "@/components/pages/categories/Form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as TableTag,
} from "@/components/ui/table";
import {
  type Category,
  type DeleteRequest,
  type SimpleResponse,
  type UpdateCategoryRequest,
  CategoryType,
  getCategoryTypeLabel,
} from "@/lib/objects";
import { cn, formatDate } from "@/lib/utils";
import {
  type RankingInfo,
  compareItems,
  rankItem,
} from "@tanstack/match-sorter-utils";
import {
  type Column,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type FilterFn,
  type SortFn,
  type SortingState,
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  ArrowRightLeft,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import { useState } from "react";

const fuzzyFilter: FilterFn<typeof features, Category> = (
  row,
  columnId,
  value,
  addMeta,
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta?.({ itemRank });
  return itemRank.passed;
};

const fuzzySort: SortFn<typeof features, Category> = (rowA, rowB, columnId) => {
  let dir = 0;
  const rankA = (rowA.columnFiltersMeta[columnId] as { itemRank: RankingInfo })
    ?.itemRank;
  const rankB = (rowB.columnFiltersMeta[columnId] as { itemRank: RankingInfo })
    ?.itemRank;
  if (rankA !== undefined && rankB !== undefined) {
    dir = compareItems(rankA, rankB);
  }
  return dir === 0 ? sortFn_alphanumeric(rowA, rowB, columnId) : dir;
};

function NameHeader<TValue>({
  column,
}: {
  column: Column<typeof features, Category, TValue>;
}) {
  const [open, setOpen] = useState(false);
  const filterValue = column.getFilterValue() as string | undefined;
  const [prevFilterValue, setPrevFilterValue] = useState(filterValue);
  const [localValue, setLocalValue] = useState(filterValue ?? "");

  if (filterValue !== prevFilterValue) {
    setPrevFilterValue(filterValue);
    setLocalValue(filterValue ?? "");
  }

  if (open) {
    return (
      <Input
        autoFocus
        placeholder="Filter name..."
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          column.setFilterValue(e.target.value || undefined);
        }}
        onBlur={() => {
          setOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setLocalValue("");
            column.setFilterValue(undefined);
            setOpen(false);
          } else if (e.key === "Enter") {
            setOpen(false);
          }
        }}
        className="text-foreground border-input bg-background h-7 w-40 rounded-md border px-2 text-xs focus-visible:border-amber-500 focus-visible:ring-0 focus-visible:ring-amber-500"
      />
    );
  }

  const isFiltered = localValue !== "";

  return (
    <button
      className="hover:text-foreground flex items-center gap-1.5 transition-colors"
      onClick={() => setOpen(true)}
    >
      <span>Name</span>
      <Search
        size={12}
        className={cn("text-muted-foreground", isFiltered && "text-amber-500")}
      />
    </button>
  );
}

function TypeHeader<TValue>({
  column,
}: {
  column: Column<typeof features, Category, TValue>;
}) {
  const [open, setOpen] = useState(false);
  const filterValue = column.getFilterValue() as string | number | undefined;
  const [prevFilterValue, setPrevFilterValue] = useState(filterValue);
  const [localValue, setLocalValue] = useState(
    filterValue?.toString() ?? "all",
  );

  if (filterValue !== prevFilterValue) {
    setPrevFilterValue(filterValue);
    setLocalValue(filterValue?.toString() ?? "all");
  }

  if (open) {
    return (
      <Select
        defaultOpen
        value={localValue}
        onValueChange={(value) => {
          if (value === null) return;
          setLocalValue(value);
          column.setFilterValue(value === "all" ? undefined : Number(value));
          setOpen(false);
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpen(false);
        }}
      >
        <SelectTrigger className="text-muted-foreground border-input bg-background h-7 w-28 rounded-md border px-2 text-xs focus-visible:border-amber-500 focus-visible:ring-0 focus-visible:ring-amber-500">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent className="border-input rounded-md border px-1 py-2">
          <SelectItem value="all" className="rounded-md">
            All Types
          </SelectItem>
          <SelectItem
            value={CategoryType.Income.toString()}
            className="rounded-md"
          >
            Income
          </SelectItem>
          <SelectItem
            value={CategoryType.Expense.toString()}
            className="rounded-md"
          >
            Expense
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  const isFiltered = localValue !== "all";

  return (
    <button
      className="hover:text-foreground flex items-center gap-1.5 transition-colors"
      onClick={() => setOpen(true)}
    >
      <span>Type</span>
      <Filter
        size={12}
        className={cn("text-muted-foreground", isFiltered && "text-amber-500")}
      />
    </button>
  );
}

type CategoriesTableProps = {
  categories: Category[];
  isUpdating: boolean;
  isDeleting: boolean;
  updateAsync: (req: UpdateCategoryRequest) => Promise<SimpleResponse>;
  deleteAsync: (req: DeleteRequest) => Promise<SimpleResponse>;
};

type CategoriesTableMeta = {
  isUpdating: boolean;
  isDeleting: boolean;
  updateAsync: (req: UpdateCategoryRequest) => Promise<SimpleResponse>;
  deleteAsync: (req: DeleteRequest) => Promise<SimpleResponse>;
};

const features = tableFeatures({
  tableMeta: metaHelper<CategoriesTableMeta>(),
  columnVisibilityFeature,
  rowSelectionFeature,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const helper = createColumnHelper<typeof features, Category>();

const columns = helper.columns([
  helper.accessor("icon", {
    header: () => <span className="pl-2">Icon</span>,
    cell: ({ row }) => (
      <div className="pl-2 text-xl">{row.getValue("icon")}</div>
    ),
  }),
  helper.accessor("name", {
    header: ({ column }) => <NameHeader column={column} />,
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("name")}</span>;
    },
    filterFn: fuzzyFilter,
    sortFn: fuzzySort,
  }),
  helper.accessor("type", {
    header: ({ column }) => <TypeHeader column={column} />,
    cell: ({ row }) => {
      const type = row.getValue("type") as CategoryType;
      const label = getCategoryTypeLabel(type);
      return (
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium",
            type === CategoryType.Income
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
              : type === CategoryType.Expense
                ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                : "bg-muted text-muted-foreground border-transparent",
          )}
        >
          {label}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return value === undefined || row.getValue(id) === value;
    },
  }),
  helper.accessor((row) => row.created_at?.seconds, {
    id: "createdAt",
    header: ({ column, table }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 transition-colors hover:bg-white/5"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Created</span>
            <ArrowUpDown className="text-muted-foreground ml-1.5 h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-7 w-7 transition-colors hover:bg-white/10"
            onClick={() =>
              table.setColumnVisibility({ createdAt: false, updatedAt: true })
            }
            title="Switch to Updated"
          >
            <ArrowRightLeft size={14} />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground pr-4 text-center text-sm">
          <span className="transition-all duration-300">
            {formatDate(row.original.created_at, { weekDay: true })}
          </span>
        </div>
      );
    },
  }),
  helper.accessor((row) => row.updated_at?.seconds, {
    id: "updatedAt",
    header: ({ column, table }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-amber-500 transition-colors hover:bg-white/5 hover:text-amber-400"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Updated</span>
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-amber-500/70" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-amber-500 transition-colors hover:bg-white/10 hover:text-amber-400"
            onClick={() =>
              table.setColumnVisibility({ createdAt: true, updatedAt: false })
            }
            title="Switch to Created"
          >
            <ArrowRightLeft size={14} />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const isUpdated =
        row.original.updated_at &&
        row.original.created_at &&
        row.original.updated_at.seconds > row.original.created_at.seconds;

      return (
        <div className="text-muted-foreground pr-4 text-center text-sm">
          <span
            className={cn(
              "transition-all duration-300",
              isUpdated
                ? "rounded-md px-2 py-0.5 font-medium text-amber-500"
                : "",
            )}
          >
            {formatDate(row.original.updated_at, { weekDay: true })}
          </span>
        </div>
      );
    },
  }),
  helper.display({
    id: "actions",
    header: () => <div className="pr-2 text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta!;
      return (
        <div className="flex justify-end gap-1 pr-2">
          <Form
            data={row.original}
            isUpdating={meta.isUpdating}
            mutateAsync={meta.updateAsync}
          />
          <Delete
            id={row.original.id}
            description="This action cannot be undone. This will delete the category"
            name={row.original.name}
            isDeleting={meta.isDeleting}
            mutateAsync={meta.deleteAsync}
          />
        </div>
      );
    },
  }),
]);

export function Table({
  categories,
  isUpdating,
  isDeleting,
  updateAsync,
  deleteAsync,
}: CategoriesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({
      createdAt: true,
      updatedAt: false,
    });

  const meta = {
    isUpdating,
    isDeleting,
    updateAsync,
    deleteAsync,
  };

  const table = useTable({
    features,
    data: categories,
    columns,
    meta,
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      setSorting((prevSorting) => {
        const nextFilters =
          typeof updater === "function" ? updater(columnFilters) : updater;
        const nameFilter = nextFilters.find((f) => f.id === "name");

        if (nameFilter && !prevSorting.find((s) => s.id === "name")) {
          return [{ id: "name", desc: false }];
        }
        return prevSorting;
      });
    },
    onColumnVisibilityChange: setColumnVisibility,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-white/10 bg-neutral-950/20 shadow-sm backdrop-blur">
        <TableTag>
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[30%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-white/10 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12 font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-white/5 transition-colors hover:bg-white/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-muted-foreground h-32 text-center"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableTag>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="flex items-center gap-1 border-white/10 bg-transparent transition-colors hover:bg-white/10"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="flex items-center gap-1 border-white/10 bg-transparent transition-colors hover:bg-white/10"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as TableTag,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CategoryType,
  type Category,
  type DeleteRequest,
  type SimpleResponse,
  type Transaction,
  type UpdateTransactionRequest,
} from "@/lib/objects";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Form } from "./Form";
import { Delete } from "@/components/pages/Delete";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowRightLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TransactionsTableProps = {
  transactions: Transaction[];
  categories: Category[];
  backendPage: number;
  setBackendPage: (page: number) => void;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  updateAsync: (req: UpdateTransactionRequest) => Promise<SimpleResponse>;
  deleteAsync: (req: DeleteRequest) => Promise<SimpleResponse>;
};

export function Table({
  transactions,
  categories,
  backendPage,
  setBackendPage,
  isLoading,
  isUpdating,
  isDeleting,
  updateAsync,
  deleteAsync,
}: TransactionsTableProps) {
  const [showUpdated, setShowUpdated] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  type TransactionsTableMeta = {
    isUpdating: boolean;
    isDeleting: boolean;
    updateAsync: (req: UpdateTransactionRequest) => Promise<SimpleResponse>;
    deleteAsync: (req: DeleteRequest) => Promise<SimpleResponse>;
    categories: Category[];
  };

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [backendPage, transactions]);

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "description",
        header: () => <div className="pl-4">Description</div>,
        cell: ({ row }) => (
          <div className="pl-4 font-medium">{row.original.description}</div>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {formatCurrency(row.original.amount.value)}
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: () => <div className="text-center">Category</div>,
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">{row.original.category.icon}</span>
                  <span className="hidden md:inline">
                    {row.original.category.name}
                  </span>
                </div>
              }
            />
            <TooltipContent className="md:hidden">
              {row.original.category.name}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        id: "date",
        accessorFn: (row) =>
          showUpdated ? row.updated_at?.seconds : row.created_at?.seconds,
        header: ({ column }) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "-ml-3 h-8 transition-colors hover:bg-white/5",
                showUpdated && "text-amber-500 hover:text-amber-400",
              )}
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>{showUpdated ? "Updated" : "Created"}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 transition-colors hover:bg-white/10",
                showUpdated
                  ? "text-amber-500/70 hover:text-amber-500"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={`Switch to ${showUpdated ? "Created" : "Updated"}`}
              onClick={() => setShowUpdated(!showUpdated)}
            >
              <ArrowRightLeft size={14} />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const time = showUpdated
            ? row.original.updated_at
            : row.original.created_at;

          const isUpdated =
            showUpdated &&
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
                {formatDate(time, true)}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="pr-2 text-right">Actions</div>,
        cell: ({ row, table }) => {
          const meta = table.options.meta as TransactionsTableMeta;

          return (
            <div className="flex justify-end gap-2 pr-2">
              <Form
                data={row.original}
                categories={meta.categories}
                isUpdating={meta.isUpdating}
                mutateAsync={meta.updateAsync}
              />
              <Delete
                id={row.original.id}
                description="This action cannot be undone. This will delete the transaction"
                name={row.original.description}
                isDeleting={meta.isDeleting}
                mutateAsync={meta.deleteAsync}
              />
            </div>
          );
        },
      },
    ],
    [showUpdated],
  );

  const table = useReactTable({
    data: transactions,
    columns,
    meta: {
      isUpdating,
      isDeleting,
      updateAsync,
      deleteAsync,
      categories,
    },
    filterFns: {
      fuzzy: () => false,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: false,
  });

  const handleNextPage = () => {
    if (table.getCanNextPage()) {
      table.nextPage();
    } else {
      if (transactions.length === 50) {
        setBackendPage(backendPage + 1);
      }
    }
  };

  const handlePrevPage = () => {
    if (table.getCanPreviousPage()) {
      table.previousPage();
    } else {
      if (backendPage > 1) {
        setBackendPage(backendPage - 1);
      }
    }
  };

  const isLocalNextDisabled = !table.getCanNextPage();
  const isBackendNextDisabled = transactions.length < 50;

  const canNext = !isLocalNextDisabled || !isBackendNextDisabled;
  const canPrev = table.getCanPreviousPage() || backendPage > 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-white/10 bg-neutral-950/20 shadow-sm backdrop-blur">
        <TableTag>
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[15%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
            <col className="w-[15%]" />
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
              table.getRowModel().rows.map((row) => {
                const type = row.original.category.type;
                const rowColor =
                  type === CategoryType.Income
                    ? "text-emerald-500"
                    : type === CategoryType.Expense
                      ? "text-rose-500"
                      : "text-muted-foreground";

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-white/5 transition-colors hover:bg-white/5",
                      rowColor,
                    )}
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
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? "Loading..." : "No transactions found."}
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
          onClick={handlePrevPage}
          disabled={!canPrev}
          className="border-white/10 bg-transparent transition-colors hover:bg-white/10"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!canNext}
          className="border-white/10 bg-transparent transition-colors hover:bg-white/10"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

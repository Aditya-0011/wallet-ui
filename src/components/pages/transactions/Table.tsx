import { Delete } from "@/components/pages/Delete";
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
  type Transaction,
  type UpdateTransactionRequest,
} from "@/lib/objects";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnVisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Form } from "./Form";
import { Table as HistoryTable } from "./history/Table";
import { grpcTimeMillis } from "@/lib/time";

const CLIENT_PAGE_SIZE = 25;

export type TransactionsPagination = {
  backendPage: number;
  pageIndex: number;
};

type TransactionsTableBaseProps = {
  transactions: Transaction[];
  isLoading: boolean;
};

type TransactionsTableFullProps = TransactionsTableBaseProps & {
  readonly?: false;
  categories: Category[];
  backendPageSize: number;
  pagination: TransactionsPagination;
  onPaginationChange: (next: TransactionsPagination) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  updateAsync: (req: UpdateTransactionRequest) => Promise<boolean>;
  onDelete: (req: DeleteRequest) => void;
};

type TransactionsTableReadonlyProps = TransactionsTableBaseProps & {
  readonly: true;
};

type TransactionsTableProps =
  TransactionsTableFullProps | TransactionsTableReadonlyProps;

type TransactionsTableMeta = {
  isUpdating: boolean;
  isDeleting: boolean;
  updateAsync: (req: UpdateTransactionRequest) => Promise<boolean>;
  onDelete: (req: DeleteRequest) => void;
  categories: Category[];
};

const getRowId = (row: Transaction) => String(row.id);

const features = tableFeatures({
  tableMeta: metaHelper<TransactionsTableMeta>(),
  columnVisibilityFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const helper = createColumnHelper<typeof features, Transaction>();

const columns = helper.columns([
  helper.accessor("description", {
    header: () => <div className="pl-4">Description</div>,
    cell: ({ row }) => (
      <div className="pl-4 font-medium">{row.original.description}</div>
    ),
  }),
  helper.accessor("amount", {
    header: () => <div className="pl-4">Amount</div>,
    cell: ({ row }) => (
      <div className="pl-4 font-medium">
        {formatCurrency(row.original.amount.value)}
      </div>
    ),
  }),
  helper.accessor("category", {
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
  }),
  helper.accessor((row) => grpcTimeMillis(row.created_at), {
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
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-7 w-7 transition-colors hover:bg-white/10"
            title="Switch to Updated"
            aria-label="Show updated date instead"
            onClick={() =>
              table.setColumnVisibility((prev) => ({
                ...prev,
                createdAt: false,
                updatedAt: true,
              }))
            }
          >
            <ArrowRightLeft size={14} aria-hidden="true" />
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
  helper.accessor((row) => grpcTimeMillis(row.updated_at), {
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
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-amber-500/70 transition-colors hover:bg-white/10 hover:text-amber-500"
            title="Switch to Created"
            aria-label="Show created date instead"
            onClick={() =>
              table.setColumnVisibility((prev) => ({
                ...prev,
                createdAt: true,
                updatedAt: false,
              }))
            }
          >
            <ArrowRightLeft size={14} aria-hidden="true" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const isUpdated =
        row.original.updated_at &&
        row.original.created_at &&
        grpcTimeMillis(row.original.updated_at) >
          grpcTimeMillis(row.original.created_at);

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
      const meta = table.options.meta as TransactionsTableMeta;
      const isUpdated =
        row.original.updated_at &&
        row.original.created_at &&
        grpcTimeMillis(row.original.updated_at) !==
          grpcTimeMillis(row.original.created_at);
      const isUpdatedAtVisible = table.getColumn("updatedAt")?.getIsVisible();

      return (
        <div className="flex items-center justify-end gap-2 pr-4">
          {isUpdated && isUpdatedAtVisible && (
            <HistoryTable transaction={row.original} />
          )}
          <Form
            data={row.original}
            categories={meta.categories}
            isUpdating={meta.isUpdating}
            submit={meta.updateAsync}
          />
          <Delete
            id={row.original.id}
            description="This action cannot be undone. This will delete the transaction"
            name={row.original.description}
            isDeleting={meta.isDeleting}
            onDelete={meta.onDelete}
          />
        </div>
      );
    },
  }),
]);

export function Table(props: TransactionsTableProps) {
  const isReadonly = props.readonly === true;

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({
      createdAt: true,
      updatedAt: false,
      ...(isReadonly && { actions: false }),
    });

  const [readonlyPageIndex, setReadonlyPageIndex] = useState(0);

  const pageCount = Math.max(
    1,
    Math.ceil(props.transactions.length / CLIENT_PAGE_SIZE),
  );
  const requestedPageIndex = isReadonly
    ? readonlyPageIndex
    : props.pagination.pageIndex;
  const pageIndex = Math.min(requestedPageIndex, pageCount - 1);

  const setPageIndex = (next: number, backendPage?: number) => {
    if (isReadonly) {
      setReadonlyPageIndex(next);
      return;
    }
    props.onPaginationChange({
      backendPage: backendPage ?? props.pagination.backendPage,
      pageIndex: next,
    });
  };

  const meta = isReadonly
    ? undefined
    : {
        isUpdating: props.isUpdating,
        isDeleting: props.isDeleting,
        updateAsync: props.updateAsync,
        onDelete: props.onDelete,
        categories: props.categories,
      };

  const paginationState = { pageIndex, pageSize: CLIENT_PAGE_SIZE };

  const table = useTable({
    features,
    data: props.transactions,
    columns,
    meta,
    getRowId,
    autoResetPageIndex: false,
    state: {
      pagination: paginationState,
      columnVisibility,
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(paginationState) : updater;
      setPageIndex(next.pageIndex);
    },
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: false,
  });

  const backendPage = isReadonly ? 1 : props.pagination.backendPage;
  const hasMoreOnServer =
    !isReadonly && props.transactions.length === props.backendPageSize;
  const lastLocalPageOfFullBackendPage =
    (isReadonly ? 0 : Math.ceil(props.backendPageSize / CLIENT_PAGE_SIZE)) - 1;

  const canNext = table.getCanNextPage() || hasMoreOnServer;
  const canPrev = table.getCanPreviousPage() || backendPage > 1;

  const handleNextPage = () => {
    if (table.getCanNextPage()) {
      table.nextPage();
    } else if (hasMoreOnServer) {
      setPageIndex(0, backendPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (table.getCanPreviousPage()) {
      table.previousPage();
    } else if (backendPage > 1) {
      setPageIndex(lastLocalPageOfFullBackendPage, backendPage - 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-white/10 bg-neutral-950/20 shadow-sm backdrop-blur">
        <TableTag>
          <colgroup>
            <col className={isReadonly ? "w-[30%]" : "w-[30%]"} />
            <col className={isReadonly ? "w-[20%]" : "w-[15%]"} />
            <col className={isReadonly ? "w-[25%]" : "w-[20%]"} />
            <col className={isReadonly ? "w-[25%]" : "w-[20%]"} />
            {!isReadonly && <col className="w-[15%]" />}
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
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  {props.isLoading ? "Loading..." : "No transactions found."}
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
          className="flex items-center gap-1 border-white/10 bg-transparent transition-colors hover:bg-white/10"
        >
          <ChevronLeft data-icon="inline-start" aria-hidden="true" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!canNext}
          className="flex items-center gap-1 border-white/10 bg-transparent transition-colors hover:bg-white/10"
        >
          Next
          <ChevronRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

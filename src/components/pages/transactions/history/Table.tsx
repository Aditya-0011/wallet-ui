import { useDataQuery } from "@/api/handler";
import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as TableTag,
} from "@/components/ui/table";
import {
  type GetTransactionsUpdateHistoryRequest,
  type GetTransactionsUpdateHistoryResponse,
  type Transaction,
  type TransactionsUpdateHistory,
  type FetchError,
} from "@/lib/objects";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  columnVisibilityFeature,
  createColumnHelper,
  flexRender,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { History } from "lucide-react";
import { useState } from "react";

const features = tableFeatures({ columnVisibilityFeature });
const helper = createColumnHelper<typeof features, TransactionsUpdateHistory>();

const columns = helper.columns([
  helper.accessor("created_at", {
    header: () => <div className="pl-4 text-left">Date</div>,
    cell: ({ row }) => (
      <div className="pl-4 font-medium">
        {formatDate(row.original.created_at, { seconds: true })}
      </div>
    ),
  }),
  helper.display({
    id: "changes",
    header: () => <div className="text-left">Changes</div>,
    cell: ({ row }) => {
      const h = row.original;
      return (
        <div className="flex flex-col gap-2 text-sm">
          {h.previous_category.id !== h.current_category.id && (
            <div className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap">
              <span className="text-muted-foreground w-24 shrink-0">
                Category:
              </span>
              <span className="flex shrink-0 items-center gap-1 line-through decoration-rose-500/50">
                <span>{h.previous_category.icon}</span>
                <span>{h.previous_category.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-amber-500">
                <span>{h.current_category.icon}</span>
                <span>{h.current_category.name}</span>
              </span>
            </div>
          )}
          {h.previous_amount.value !== h.current_amount.value && (
            <div className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap">
              <span className="text-muted-foreground w-24 shrink-0">
                Amount:
              </span>
              <span className="shrink-0 line-through decoration-rose-500/50">
                {formatCurrency(h.previous_amount.value)}
              </span>
              <span className="shrink-0 text-amber-500">
                {formatCurrency(h.current_amount.value)}
              </span>
            </div>
          )}
          {h.previous_description !== h.current_description && (
            <div className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap">
              <span className="text-muted-foreground w-24 shrink-0">
                Description:
              </span>
              <span className="shrink-0 line-through decoration-rose-500/50">
                {h.previous_description}
              </span>
              <span className="shrink-0 text-amber-500">
                {h.current_description}
              </span>
            </div>
          )}
        </div>
      );
    },
  }),
]);

export type HistoryTableProps = {
  transaction: Transaction;
};

export function Table({ transaction }: HistoryTableProps) {
  const [open, setOpen] = useState(false);

  const {
    data: historyData,
    isLoading,
    isError,
    error,
  } = useDataQuery<
    GetTransactionsUpdateHistoryRequest,
    GetTransactionsUpdateHistoryResponse
  >(
    "wallet",
    ["transactions", "history", transaction.id],
    "/transaction/history",
    false,
    {
      isQuery: true,
      enabled: open,
      variables: { transaction_id: transaction.id },
    },
  );

  const isHistoryNotFoundError =
    isError &&
    error &&
    "status" in error &&
    (error as FetchError).status === 404;

  const hasHistoryError = isError && !isHistoryNotFoundError;

  const historyList = isHistoryNotFoundError
    ? []
    : (historyData?.history ?? []);

  const table = useTable({
    features,
    data: historyList,
    columns,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md text-sky-500 hover:bg-sky-500/10 hover:text-sky-400 hover:ring hover:ring-sky-500/50"
            title="View History"
          />
        }
      >
        <History size={16} />
      </DialogTrigger>
      <DialogContent
        className="border border-white bg-neutral-950 sm:max-w-3xl"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>
            Update{" "}
            <span className="text-amber-500">
              {transaction?.description || "history"}
            </span>
          </DialogTitle>
          <DialogDescription>
            Checking to see if you were hacked, or just indecisive?
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-6">
            <Loading content="history" />
          </div>
        ) : hasHistoryError ? (
          <div className="py-6">
            <Error content="history" />
          </div>
        ) : historyList.length === 0 ? (
          <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
            No history available for this transaction.
          </div>
        ) : (
          <div className="overflow-hidden overflow-x-auto rounded-xl border border-white/10 bg-neutral-950/20 shadow-sm backdrop-blur">
            <TableTag className="min-w-150">
              <colgroup>
                <col className="w-[40%]" />
                <col className="w-[60%]" />
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
                      className="border-white/5 transition-colors hover:bg-white/5"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 align-top">
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
                      className="text-muted-foreground h-24 text-center"
                    >
                      No history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableTag>
          </div>
        )}
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" size="default" className="rounded-md">
                Close
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

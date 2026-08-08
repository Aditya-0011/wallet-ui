import { useDataQuery } from "@/api/handler";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  type ExportTransactionsRequest,
  type ExportTransactionsResponse,
} from "@/lib/objects";
import { Download } from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DateRangePicker } from "./ui/DateRangePicker";

export function Export() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: DateTime.now().startOf("month").toJSDate(),
    to: DateTime.now().endOf("month").toJSDate(),
  });

  const { refetch: exportTransactionsQuery, isFetching: isExporting } =
    useDataQuery<ExportTransactionsRequest, ExportTransactionsResponse>(
      "wallet",
      ["transactions", "export"],
      "/transaction/export",
      false,
      {
        isQuery: true,
        enabled: false,
        variables: {
          start_date: date?.from
            ? DateTime.fromJSDate(date.from).toGrpcTime()
            : DateTime.now().startOf("month").toGrpcTime(),
          end_date: date?.to
            ? DateTime.fromJSDate(date.to).toGrpcTime()
            : DateTime.now().endOf("month").toGrpcTime(),
        },
        keepPreviousData: false,
        isBlob: true,
      },
    );

  const handleExport = async () => {
    if (!date?.from || !date?.to) {
      toast.error("Please select a valid date range");
      return;
    }

    const res = await exportTransactionsQuery();
    if (res.data) {
      const { file_data, file_name } = res.data;
      const url = URL.createObjectURL(file_data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export successful");
      setOpen(false);
    } else if (res.isError) {
      toast.error("Failed to export transactions");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="flex h-9 items-center gap-2 rounded-md border-amber-500/50 text-amber-500 transition-colors hover:bg-amber-500/10 hover:text-amber-500"
          />
        }
      >
        <Download className="size-4" />
        Export
      </DialogTrigger>
      <DialogContent
        className="top-4 translate-y-0 border border-white bg-neutral-950 sm:top-1/2 sm:-translate-y-1/2"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>
            Export <span className="text-amber-500">transactions</span>
          </DialogTitle>
          <DialogDescription>
            Preparing a spreadsheet to cry over?
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="mt-1">
          <Field>
            <FieldLabel>Date Range</FieldLabel>
            <DateRangePicker
              date={date}
              setDate={setDate}
              className="border-input h-9 w-full rounded-md border bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:border-amber-500 focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Field orientation="horizontal" className="justify-end">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setOpen(false)}
                  className="rounded-md"
                >
                  Cancel
                </Button>
              }
            />
            <Button
              disabled={isExporting}
              onClick={handleExport}
              className="rounded-md bg-neutral-950 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 hover:inset-ring hover:ring-amber-500"
            >
              {isExporting ? "Exporting..." : "Download"}
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

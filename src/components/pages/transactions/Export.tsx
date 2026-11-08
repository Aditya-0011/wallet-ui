import { useState } from "react";
import { Download } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { toast } from "sonner";

import { apiFetch, type BlobResponse } from "@/api/handler";
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
import { dayRangeToGrpc, presetToPicker } from "@/lib/date-range";
import { type ExportTransactionsRequest } from "@/lib/objects";
import { useMutation } from "@tanstack/react-query";
import { DateRangePicker } from "./ui/DateRangePicker";

function saveBlob({ file_data, file_name }: BlobResponse) {
  const url = URL.createObjectURL(file_data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file_name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Export() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(() =>
    presetToPicker("this_month"),
  );

  const { mutate: exportTransactions, isPending: isExporting } = useMutation({
    mutationFn: (request: ExportTransactionsRequest) =>
      apiFetch<BlobResponse>("wallet", "/transaction/export", {
        method: "QUERY",
        body: request,
        kind: "blob",
      }),
    onSuccess: (file) => {
      saveBlob(file);
      toast.success("Export successful");
      setOpen(false);
    },
  });

  const handleExport = () => {
    if (!date?.from || !date.to) {
      toast.error("Please select a valid date range");
      return;
    }
    exportTransactions(dayRangeToGrpc(date.from, date.to));
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
        <Download data-icon="inline-start" aria-hidden="true" />
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
            <FieldLabel id="export-range-label">Date Range</FieldLabel>
            <DateRangePicker
              date={date}
              setDate={setDate}
              labelledBy="export-range-label"
              className="border-input h-9 w-full rounded-md border bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:border-amber-500 focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Field orientation="horizontal" className="justify-end">
            <DialogClose
              render={
                <Button variant="outline" size="default" className="rounded-md">
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

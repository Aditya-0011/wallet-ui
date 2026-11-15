import { Skeleton } from "@/components/ui/skeleton";

const TABLE_ROWS = ["a", "b", "c", "d", "e", "f"];
const SUMMARY_CARDS = ["income", "expense", "savings"];

export function TableSkeleton({ rows = TABLE_ROWS.length }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex flex-col rounded-xl border border-white/10 bg-neutral-950"
    >
      <div className="flex h-12 items-center gap-4 border-b border-white/10 px-4">
        <Skeleton className="h-3 w-24 rounded-md" />
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="ml-auto h-3 w-16 rounded-md" />
      </div>
      {TABLE_ROWS.slice(0, rows).map((key) => (
        <div
          key={key}
          className="flex h-14 items-center gap-4 border-b border-white/5 px-4 last:border-b-0"
        >
          <Skeleton className="h-4 w-2/5 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="ml-auto h-7 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function SummarySkeleton() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-3 w-32 rounded-md" />
        </div>
        <Skeleton className="h-6 w-56 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SUMMARY_CARDS.map((key) => (
          <Skeleton key={key} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({
  actions = 0,
  filters = false,
}: {
  actions?: number;
  filters?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40 rounded-md" />
          <Skeleton className="h-3 w-28 rounded-md" />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {Array.from({ length: actions }, (_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-md" />
          ))}
        </div>
      </div>
      {filters && <Skeleton className="h-10 w-full rounded-md" />}
      <TableSkeleton />
    </div>
  );
}

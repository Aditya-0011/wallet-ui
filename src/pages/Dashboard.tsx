import { useDataQuery } from "@/api/handler";

import { type UserSummaryResponse } from "@/lib/objects";

import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";
import { Summary } from "@/components/pages/dashboard/Summary";

export default function Dashboard() {
  const { data, isLoading, isError } = useDataQuery<null, UserSummaryResponse>(
    "wallet",
    ["summary"],
    "/user/summary",
    false,
  );

  if (isLoading) {
    return <Loading content="user summary" />;
  }

  if (isError || !data) {
    return <Error content="user summary" />;
  }

  return (
    <div className="mx-auto flex max-h-screen w-full flex-col gap-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-xs">Feeling proud?</p>
        </div>
      </div>
      <Summary data={data} />
    </div>
  );
}

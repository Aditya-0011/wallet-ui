import { useDataQuery } from "@/api/handler";
import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";
import { Summary } from "@/components/pages/dashboard/Summary";
import {
  // type GetTransactionsRequest,
  // type GetTransactionsResponse,
  type UserSummaryResponse,
} from "@/lib/objects";
//import { DateTime } from "luxon";

export default function Dashboard() {
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useDataQuery<null, UserSummaryResponse>(
    "wallet",
    ["summary"],
    "/user/summary",
    false,
  );

  // const {
  //   data: transactions,
  //   isLoading: isTransactionsLoading,
  //   isError: isTransactionsError,
  // } = useDataQuery<GetTransactionsRequest, GetTransactionsResponse>(
  //   "wallet",
  //   ["transactions"],
  //   "/transaction/list",
  //   false,
  //   {
  //     isQuery: true,
  //     variables: {
  //       limit: 50,
  //       page: 1,
  //       start_date: DateTime.now().startOf("day").toGrpcTime(),
  //       end_date: DateTime.now().endOf("day").toGrpcTime(),
  //     },
  //   },
  // );

  return (
    <div className="mx-auto flex max-h-screen w-full flex-col gap-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-xs">Feeling proud?</p>
        </div>
      </div>
      {isSummaryLoading ? (
        <Loading content="user summary" />
      ) : isSummaryError || !summary ? (
        <Error content="user summary" />
      ) : (
        <Summary data={summary} />
      )}
    </div>
  );
}

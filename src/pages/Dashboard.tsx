import { useDataQuery } from "@/api/handler";
import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";
import { Summary } from "@/components/pages/dashboard/Summary";
import { Table } from "@/components/pages/transactions/Table";
import {
  CategoryType,
  type FetchError,
  type GetTransactionsRequest,
  type GetTransactionsResponse,
  type UserSummaryResponse,
} from "@/lib/objects";
import { formatCurrency } from "@/lib/utils";
import BigNumber from "bignumber.js";
import { DateTime } from "luxon";

export default function Dashboard() {
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useDataQuery<null, UserSummaryResponse>(
    "wallet",
    ["summary", "transaction"],
    "/user/summary",
    false,
  );

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    error: transactionsError,
  } = useDataQuery<GetTransactionsRequest, GetTransactionsResponse>(
    "wallet",
    ["transactions", "today"],
    "/transaction/list",
    false,
    {
      isQuery: true,
      variables: {
        limit: 50,
        page: 1,
        start_date: DateTime.now().startOf("day").toGrpcTime(),
        end_date: DateTime.now().endOf("day").toGrpcTime(),
      },
    },
  );

  const isTransactionsNotFoundError =
    isTransactionsError &&
    transactionsError &&
    "status" in transactionsError &&
    (transactionsError as FetchError).status === 404;

  const hasTransactionsError =
    isTransactionsError && !isTransactionsNotFoundError;

  const transactionList = isTransactionsNotFoundError
    ? []
    : transactions?.transactions || [];

  const todayTotal = transactionList.reduce((acc, curr) => {
    const val = new BigNumber(curr.amount.value);
    return curr.category.type === CategoryType.Expense
      ? acc.minus(val)
      : acc.plus(val);
  }, new BigNumber(0));

  const totalAmount = todayTotal.toNumber();
  const todayDescription =
    totalAmount > 0
      ? `You're up ${formatCurrency(todayTotal)} today. Don't let it get to your head.`
      : totalAmount < 0
        ? `Down ${formatCurrency(todayTotal.abs())} today. Try holding onto your wallet for a change.`
        : "No movement today. Boring, but safe.";

  return (
    <div className="mx-auto flex max-h-screen w-full flex-col gap-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Dashboard</h1>
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

      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-wide text-amber-500">
            Today&apos;s Transactions
          </span>
          <span className="text-muted-foreground text-xs font-medium tracking-wider">
            {todayDescription}
          </span>
        </div>
        {isTransactionsLoading ? (
          <Loading content="transactions" />
        ) : hasTransactionsError ? (
          <Error content="transactions" />
        ) : (
          <Table
            readonly
            transactions={transactionList}
            isLoading={isTransactionsLoading}
          />
        )}
      </div>
    </div>
  );
}

import { useDataMutation, useDataQuery } from "@/api/handler";
import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";
import { Form } from "@/components/pages/transactions/Form";
import { Table } from "@/components/pages/transactions/Table";
import {
  type CreateTransactionRequest,
  type DeleteRequest,
  type FetchError,
  type GetTransactionsRequest,
  type GetTransactionsResponse,
  type GetCategoriesResponse,
  // type GetTransactionsUpdateHistoryRequest,
  // type GetTransactionsUpdateHistoryResponse,
  type SimpleResponse,
  type UpdateTransactionRequest,
} from "@/lib/objects";
import { DateTime } from "luxon";
import { useState } from "react";
import { toast } from "sonner";

export default function Transactions() {
  const [filters, setFilters] = useState<GetTransactionsRequest>({
    limit: 50,
    page: 1,
    start_date: DateTime.now().startOf("month").toGrpcTime(),
    end_date: DateTime.now().endOf("day").toGrpcTime(),
  });

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useDataQuery<null, GetCategoriesResponse>(
    "wallet",
    ["categories"],
    "/category/list",
    false,
  );

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    error: transactionsError,
  } = useDataQuery<GetTransactionsRequest, GetTransactionsResponse>(
    "wallet",
    ["transactions"],
    "/transaction/list",
    false,
    {
      isQuery: true,
      variables: filters,
    },
  );

  // const {
  //   data: history,
  //   isLoading: isHistoryLoading,
  //   isError: isHistoryError,
  //   error: historyError,
  // } = useDataQuery<
  //   GetTransactionsUpdateHistoryRequest,
  //   GetTransactionsUpdateHistoryResponse
  // >("wallet", ["transactions"], "/transaction/history", false, {
  //   isQuery: true,
  // });

  const {
    mutateAsync: createAsync,
    isPending: isCreating,
    isError: isCreateError,
  } = useDataMutation<CreateTransactionRequest, SimpleResponse>(
    "wallet",
    "/transaction/add",
    false,
    {
      invalidateKey: [["transactions"]],
      onSuccess: (data) => {
        toast.success(data.message);
      },
    },
  );

  const {
    mutateAsync: updateAsync,
    isPending: isUpdating,
    isError: isUpdateError,
  } = useDataMutation<UpdateTransactionRequest, SimpleResponse>(
    "wallet",
    "/transaction/edit",
    false,
    {
      invalidateKey: [["transactions"]],
      onSuccess: (data) => {
        toast.success(data.message);
      },
    },
  );

  const {
    mutateAsync: deleteAsync,
    isPending: isDeleting,
    isError: isDeleteError,
  } = useDataMutation<DeleteRequest, SimpleResponse>(
    "wallet",
    "/transaction/delete",
    false,
    {
      invalidateKey: [["transactions"]],
      onSuccess: (data) => {
        toast.success(data.message);
      },
    },
  );

  const isCategoriesNotFoundError =
    isCategoriesError &&
    categoriesError &&
    "status" in categoriesError &&
    (categoriesError as FetchError).status === 404;
  const hasCategoriesError = categoriesError && !isCategoriesNotFoundError;

  if (isCategoriesLoading) {
    return <Loading content="categories" />;
  }
  if (hasCategoriesError || (!categories && !isCategoriesNotFoundError)) {
    return <Error content="categories" />;
  }

  const isTransactionsNotFoundError =
    isTransactionsError &&
    transactionsError &&
    "status" in transactionsError &&
    (transactionsError as FetchError).status === 404;

  const hasTransactionsError =
    (isTransactionsError && !isTransactionsNotFoundError) ||
    isCreateError ||
    isUpdateError ||
    isDeleteError;

  if (isTransactionsLoading) {
    return <Loading content="transactions" />;
  }
  if (hasTransactionsError || (!transactions && !isTransactionsNotFoundError)) {
    return <Error content="transactions" />;
  }

  // const isHistoryNotFoundError =
  //   isHistoryError &&
  //   historyError &&
  //   "status" in historyError &&
  //   (historyError as FetchError).status === 404;
  // const hasHistoryError = isHistoryError && !isHistoryNotFoundError;

  // if (isHistoryLoading) {
  //   return <Loading content="transaction history" />;
  // }
  // if (hasHistoryError || (!history && !isHistoryNotFoundError)) {
  //   return <Error content="transaction history" />;
  // }

  const transactionList = isTransactionsNotFoundError
    ? []
    : transactions?.transactions || [];
  // const transactionUpdateHistoryList = isHistoryNotFoundError
  //   ? []
  //   : history?.history || [];

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Transactions</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Hmmm, quite rich?
          </p>
        </div>
        <Form
          categories={categories?.categories || []}
          isCreating={isCreating}
          mutateAsync={createAsync}
        />
      </div>

      <Table
        transactions={transactionList}
        categories={categories?.categories || []}
        backendPage={filters.page}
        setBackendPage={(p) => setFilters({ ...filters, page: p })}
        isLoading={isTransactionsLoading}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        updateAsync={updateAsync}
        deleteAsync={deleteAsync}
      />
    </div>
  );
}

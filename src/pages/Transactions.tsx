import { useDataMutation, useDataQuery } from "@/api/handler";
import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";
import { Export } from "@/components/pages/transactions/Export";
import { Filters } from "@/components/pages/transactions/Filters";
import { Form } from "@/components/pages/transactions/Form";
import { Table } from "@/components/pages/transactions/Table";
import {
  type CreateTransactionRequest,
  type DeleteRequest,
  type FetchError,
  type GetCategoriesResponse,
  type GetTransactionsRequest,
  type GetTransactionsResponse,
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
    start_date: DateTime.now().startOf("week").toGrpcTime(),
    end_date: DateTime.now().endOf("week").toGrpcTime(),
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
    { staleTime: 30 * 60 * 1000 },
  );

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    isFetching: isTransactionsFetching,
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
      keepPreviousData: true,
    },
  );

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

  const transactionList = isTransactionsNotFoundError
    ? []
    : transactions?.transactions || [];

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Transactions</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Hmmm, quite rich?
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Export />
          <Form
            categories={categories?.categories || []}
            isCreating={isCreating}
            mutateAsync={createAsync}
          />
        </div>
      </div>

      <Filters
        filters={filters}
        setFilters={setFilters}
        categories={categories?.categories || []}
      />

      <Table
        transactions={transactionList}
        categories={categories?.categories || []}
        backendPage={filters.page}
        setBackendPage={(p) => setFilters({ ...filters, page: p })}
        isLoading={isTransactionsFetching}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        updateAsync={updateAsync}
        deleteAsync={deleteAsync}
      />
    </div>
  );
}

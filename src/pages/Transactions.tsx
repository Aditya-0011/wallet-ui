import { useState } from "react";
import { toast } from "sonner";

import { isNotFoundError, useDataMutation, useDataQuery } from "@/api/handler";
import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";
import { Export } from "@/components/pages/transactions/Export";
import { Filters } from "@/components/pages/transactions/Filters";
import { Form } from "@/components/pages/transactions/Form";
import {
  Table,
  type TransactionsPagination,
} from "@/components/pages/transactions/Table";
import { presetToGrpc } from "@/lib/date-range";
import {
  type Category,
  type CreateTransactionRequest,
  type DeleteRequest,
  type GetCategoriesResponse,
  type GetTransactionsRequest,
  type GetTransactionsResponse,
  type SimpleResponse,
  type Transaction,
  type UpdateTransactionRequest,
} from "@/lib/objects";

const BACKEND_PAGE_SIZE = 50;

const EMPTY_CATEGORIES: Category[] = [];
const EMPTY_TRANSACTIONS: Transaction[] = [];
const INVALIDATE = [["transactions"], ["summary"]];
const notifySuccess = (data: SimpleResponse) => toast.success(data.message);

function initialFilters(): GetTransactionsRequest {
  return { limit: BACKEND_PAGE_SIZE, page: 1, ...presetToGrpc("this_week") };
}

export default function Transactions() {
  const [filters, setFilters] =
    useState<GetTransactionsRequest>(initialFilters);
  const [localPageIndex, setLocalPageIndex] = useState(0);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
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
    error: transactionsError,
    refetch: refetchTransactions,
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

  const { submit: createAsync, isPending: isCreating } = useDataMutation<
    CreateTransactionRequest,
    SimpleResponse
  >("wallet", "/transaction/add", false, {
    invalidateKey: INVALIDATE,
    onSuccess: notifySuccess,
  });

  const { submit: updateAsync, isPending: isUpdating } = useDataMutation<
    UpdateTransactionRequest,
    SimpleResponse
  >("wallet", "/transaction/edit", false, {
    invalidateKey: INVALIDATE,
    onSuccess: notifySuccess,
  });

  const { mutate: deleteTransaction, isPending: isDeleting } = useDataMutation<
    DeleteRequest,
    SimpleResponse
  >("wallet", "/transaction/delete", false, {
    invalidateKey: INVALIDATE,
    onSuccess: notifySuccess,
  });

  if (isCategoriesLoading) {
    return <Loading content="categories" />;
  }
  const noCategories = isNotFoundError(categoriesError);
  if ((categoriesError && !noCategories) || (!categories && !noCategories)) {
    return (
      <Error content="categories" onRetry={() => void refetchCategories()} />
    );
  }

  if (isTransactionsLoading) {
    return <Loading content="transactions" />;
  }
  const noTransactions = isNotFoundError(transactionsError);
  if (
    (transactionsError && !noTransactions) ||
    (!transactions && !noTransactions)
  ) {
    return (
      <Error
        content="transactions"
        onRetry={() => void refetchTransactions()}
      />
    );
  }

  const categoryList = categories?.categories ?? EMPTY_CATEGORIES;
  const transactionList = noTransactions
    ? EMPTY_TRANSACTIONS
    : (transactions?.transactions ?? EMPTY_TRANSACTIONS);

  const pagination: TransactionsPagination = {
    backendPage: filters.page,
    pageIndex: localPageIndex,
  };

  const handlePaginationChange = (next: TransactionsPagination) => {
    setLocalPageIndex(next.pageIndex);
    if (next.backendPage !== filters.page) {
      setFilters((current) => ({ ...current, page: next.backendPage }));
    }
  };

  const handleFiltersChange = (next: GetTransactionsRequest) => {
    setFilters({ ...next, limit: BACKEND_PAGE_SIZE, page: 1 });
    setLocalPageIndex(0);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Transactions</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Hmmm, quite rich?
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Export />
          <Form
            categories={categoryList}
            isCreating={isCreating}
            submit={createAsync}
          />
        </div>
      </div>

      <Filters
        filters={filters}
        onApply={handleFiltersChange}
        categories={categoryList}
      />

      <Table
        transactions={transactionList}
        categories={categoryList}
        backendPageSize={BACKEND_PAGE_SIZE}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={isTransactionsFetching}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        updateAsync={updateAsync}
        onDelete={deleteTransaction}
      />
    </div>
  );
}

import { DateTime } from "luxon";
import { useState } from "react";
import { toast } from "sonner";

import { useDataMutation, useDataQuery } from "@/api/handler";

import {
  type CreateTransactionRequest,
  type DeleteRequest,
  type FetchError,
  type GetTransactionsRequest,
  type GetTransactionsResponse,
  type SimpleResponse,
  type UpdateTransactionRequest,
} from "@/lib/objects";

import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";

export default function Transactions() {
  const [filters, setFilters] = useState<GetTransactionsRequest>({
    limit: 50,
    page: 1,
    start_date: DateTime.now().startOf("month").toGrpcTime(),
    end_date: DateTime.now().endOf("day").toGrpcTime(),
  });

  const { data, isLoading, isError, error } = useDataQuery<
    GetTransactionsRequest,
    GetTransactionsResponse
  >("wallet", ["transactions"], "/transaction/list", false, {
    isQuery: true,
    variables: filters,
  });

  const {
    mutateAsync: createAsync,
    isPending: isCreating,
    isError: createError,
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
    isError: updateError,
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
    isError: deleteError,
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

  const isNotFoundError =
    isError &&
    error &&
    "status" in error &&
    (error as FetchError).status === 404;
  const hasError =
    (isError && !isNotFoundError) || createError || updateError || deleteError;

  if (isLoading || isCreating || isUpdating || isDeleting) {
    return <Loading content="transactions" />;
  }
  if (hasError || (!data && !isNotFoundError)) {
    return <Error content="transactions" />;
  }

  const transactionList = isNotFoundError ? [] : data?.transactions || [];
}

import { useDataMutation, useDataQuery } from "@/api/handler";
import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";
import { Form } from "@/components/pages/categories/Form";
import { Table } from "@/components/pages/categories/Table";
import {
  type CreateCategoryRequest,
  type DeleteRequest,
  type FetchError,
  type GetCategoriesResponse,
  type SimpleResponse,
  type UpdateCategoryRequest,
} from "@/lib/objects";
import { toast } from "sonner";

export default function Categories() {
  const { data, isLoading, isError, error } = useDataQuery<
    null,
    GetCategoriesResponse
  >("wallet", ["categories"], "/category/list", false);

  const {
    mutateAsync: createAsync,
    isPending: isCreating,
    isError: isCreateError,
  } = useDataMutation<CreateCategoryRequest, SimpleResponse>(
    "wallet",
    "/category/add",
    false,
    {
      invalidateKey: [["categories"]],
      onSuccess: (data) => {
        toast.success(data.message);
      },
    },
  );

  const {
    mutateAsync: updateAsync,
    isPending: isUpdating,
    isError: isUpdateError,
  } = useDataMutation<UpdateCategoryRequest, SimpleResponse>(
    "wallet",
    "/category/edit",
    false,
    {
      invalidateKey: [["categories"]],
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
    "/category/delete",
    false,
    {
      invalidateKey: [["categories"]],
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
    (isError && !isNotFoundError) ||
    isCreateError ||
    isUpdateError ||
    isDeleteError;

  if (isLoading) {
    return <Loading content="categories" />;
  }
  if (hasError || (!data && !isNotFoundError)) {
    return <Error content="categories" />;
  }

  const categoryList = isNotFoundError ? [] : data?.categories || [];

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Categories</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Nothing beats 'Stuff I bought'
          </p>
        </div>
        <Form isCreating={isCreating} mutateAsync={createAsync} />
      </div>

      <Table
        categories={categoryList}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        updateAsync={updateAsync}
        deleteAsync={deleteAsync}
      />
    </div>
  );
}

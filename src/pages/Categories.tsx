import { isNotFoundError, useDataMutation, useDataQuery } from "@/api/handler";
import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";
import { Form } from "@/components/pages/categories/Form";
import { Table } from "@/components/pages/categories/Table";
import {
  type CreateCategoryRequest,
  type DeleteRequest,
  type Category,
  type GetCategoriesResponse,
  type SimpleResponse,
  type UpdateCategoryRequest,
} from "@/lib/objects";
import { toast } from "sonner";

const EMPTY_CATEGORIES: Category[] = [];
const INVALIDATE = [["categories"], ["transactions"]];
const notifySuccess = (data: SimpleResponse) => toast.success(data.message);

export default function Categories() {
  const { data, isLoading, error, refetch } = useDataQuery<
    null,
    GetCategoriesResponse
  >("wallet", ["categories"], "/category/list", false, {
    staleTime: 30 * 60 * 1000,
  });

  const { submit: createAsync, isPending: isCreating } = useDataMutation<
    CreateCategoryRequest,
    SimpleResponse
  >("wallet", "/category/add", false, {
    invalidateKey: INVALIDATE,
    onSuccess: notifySuccess,
  });

  const { submit: updateAsync, isPending: isUpdating } = useDataMutation<
    UpdateCategoryRequest,
    SimpleResponse
  >("wallet", "/category/edit", false, {
    invalidateKey: INVALIDATE,
    onSuccess: notifySuccess,
  });

  const { mutate: deleteCategory, isPending: isDeleting } = useDataMutation<
    DeleteRequest,
    SimpleResponse
  >("wallet", "/category/delete", false, {
    invalidateKey: INVALIDATE,
    onSuccess: notifySuccess,
  });

  if (isLoading) {
    return <Loading content="categories" />;
  }

  const isEmpty = isNotFoundError(error);
  if ((error && !isEmpty) || (!data && !isEmpty)) {
    return <Error content="categories" onRetry={() => void refetch()} />;
  }

  const categoryList = data?.categories ?? EMPTY_CATEGORIES;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Categories</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Nothing beats 'Stuff I bought'
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Form isCreating={isCreating} submit={createAsync} />
        </div>
      </div>

      <Table
        categories={categoryList}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        updateAsync={updateAsync}
        onDelete={deleteCategory}
      />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CategoryType,
  CreateTransactionRequestSchema,
  UpdateTransactionRequestSchema,
  type Category,
  type CreateTransactionRequest,
  type SimpleResponse,
  type Transaction,
  type UpdateTransactionRequest,
} from "@/lib/objects";
import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { Edit2 } from "lucide-react";
import { useState } from "react";

type FormProps =
  | {
      data: Transaction;
      categories: Category[];
      isCreating?: undefined;
      isUpdating: boolean;
      mutateAsync: (req: UpdateTransactionRequest) => Promise<SimpleResponse>;
    }
  | {
      data?: undefined;
      categories: Category[];
      isCreating: boolean;
      isUpdating?: undefined;
      mutateAsync: (req: CreateTransactionRequest) => Promise<SimpleResponse>;
    };

export function Form({
  data,
  isCreating,
  isUpdating,
  mutateAsync,
  categories,
}: FormProps) {
  const [open, setOpen] = useState(false);
  const formId = data
    ? `transaction-form-${data.id}`
    : "transaction-form-create";

  const defaultValues: UpdateTransactionRequest | CreateTransactionRequest =
    data
      ? {
          id: data.id,
          amount: { value: data.amount.value },
          description: data.description,
          category_id: data.category.id,
        }
      : {
          amount: { value: "" },
          description: "",
          category_id: 0,
        };

  const {
    Field: FormField,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues,
    validators: {
      onSubmit: data
        ? UpdateTransactionRequestSchema.omit({ id: true })
        : CreateTransactionRequestSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (data) {
          await mutateAsync({
            ...value,
            id: data.id,
          } as UpdateTransactionRequest);
        } else {
          await mutateAsync(value as CreateTransactionRequest);
        }
        reset();
        setOpen(false);
      } catch {
        //
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
        }
      }}
    >
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        key={data?.id || "create"}
      >
        <DialogTrigger
          render={
            data ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-md text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 hover:ring hover:ring-amber-500"
              />
            ) : (
              <Button className="rounded-md bg-amber-500 hover:bg-neutral-950 hover:text-amber-500 hover:ring hover:ring-amber-500" />
            )
          }
        >
          {data ? <Edit2 className="size-4" /> : "Add"}
        </DialogTrigger>
        <DialogContent
          className="border border-white bg-neutral-950"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>
              {data ? (
                <>
                  Update{" "}
                  <span className="text-amber-500">{data.description}</span>
                </>
              ) : (
                <>
                  Add <span className="text-amber-500">transaction</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {data
                ? "Let's hope you are not fixing any typos!"
                : "Try not to put any typos!"}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-1">
            <FormField
              name="amount.value"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      autoComplete="off"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={isCreating || isUpdating}
                      type="number"
                      step="0.01"
                      required
                      className="border-input rounded-md border bg-neutral-950 focus-visible:border-amber-500 focus-visible:ring-0 focus-visible:ring-amber-500"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <FormField
              name="category_id"
              children={(field) => {
                const selectedCategory = categories.find(
                  (c) => c.id === field.state.value,
                );

                const selectedColor =
                  selectedCategory?.type === CategoryType.Income
                    ? "text-emerald-500"
                    : selectedCategory?.type === CategoryType.Expense
                      ? "text-rose-500"
                      : "text-muted-foreground";

                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <Select
                      name={field.name}
                      value={
                        field.state.value ? field.state.value.toString() : ""
                      }
                      onValueChange={(val) => field.handleChange(Number(val))}
                      disabled={isCreating || isUpdating}
                      aria-invalid={isInvalid}
                      required
                    >
                      <SelectTrigger
                        id={field.name}
                        className={cn(
                          "border-input w-full rounded-md border bg-neutral-950 focus-visible:border-amber-500 focus-visible:ring-0 focus-visible:ring-amber-500",
                          selectedColor,
                        )}
                      >
                        <SelectValue>
                          {(val: string | null) => {
                            if (!val) return "Select a category";
                            const selectedCategory = categories.find(
                              (c) => c.id === Number(val),
                            );
                            return selectedCategory ? (
                              <div className="flex items-center gap-2">
                                <span>{selectedCategory.icon}</span>
                                <span>{selectedCategory.name}</span>
                              </div>
                            ) : (
                              "Select a category"
                            );
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="border-input rounded-md border px-1 py-2">
                        {categories.map((c) => {
                          const optionColor =
                            c.type === CategoryType.Income
                              ? "text-emerald-500"
                              : c.type === CategoryType.Expense
                                ? "text-rose-500"
                                : "text-muted-foreground";

                          return (
                            <SelectItem
                              key={c.id}
                              value={c.id.toString()}
                              className={cn("rounded-md", optionColor)}
                            >
                              <div className="flex items-center gap-2">
                                <span>{c.icon}</span>
                                <span>{c.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <FormField
              name="description"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      autoComplete="off"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={isCreating || isUpdating}
                      type="text"
                      required
                      className="border-input rounded-md border bg-neutral-950 focus-visible:border-amber-500 focus-visible:ring-0 focus-visible:ring-amber-500"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
          <DialogFooter>
            <Field orientation="horizontal" className="justify-end">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => reset()}
                    className="rounded-md"
                  >
                    Cancel
                  </Button>
                }
              />
              <Button
                form={formId}
                type="submit"
                disabled={isCreating || isUpdating}
                className="rounded-md bg-neutral-950 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 hover:inset-ring hover:ring-amber-500"
              >
                Save
              </Button>
            </Field>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

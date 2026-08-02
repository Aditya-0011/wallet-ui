import { useForm } from "@tanstack/react-form";
import { Edit2, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";

import {
  CategoryType,
  CreateCategoryRequestSchema,
  UpdateCategoryRequestSchema,
  getCategoryTypeLabel,
  type Category,
  type CreateCategoryRequest,
  type SimpleResponse,
  type UpdateCategoryRequest,
} from "@/lib/objects";

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

type FormProps =
  | {
      data: Category;
      isCreating?: undefined;
      isUpdating: boolean;
      mutateAsync: (req: UpdateCategoryRequest) => Promise<SimpleResponse>;
    }
  | {
      data?: undefined;
      isCreating: boolean;
      isUpdating?: undefined;
      mutateAsync: (req: CreateCategoryRequest) => Promise<SimpleResponse>;
    };

export function Form({ data, isCreating, isUpdating, mutateAsync }: FormProps) {
  const formId = data ? `category-form-${data.id}` : "category-form-create";
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const defaultValues: UpdateCategoryRequest | CreateCategoryRequest = data
    ? {
        id: data.id,
        name: data.name,
        icon: data.icon,
        type: data.type,
      }
    : {
        name: "",
        icon: "",
        type: 2 as CategoryType,
      };

  const {
    Field: FormField,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues,
    validators: {
      onSubmit: data
        ? UpdateCategoryRequestSchema.omit({ id: true })
        : CreateCategoryRequestSchema,
    },
    onSubmit: async ({ value }) => {
      if (data) {
        await mutateAsync({ ...value, id: data.id } as UpdateCategoryRequest);
      } else {
        await mutateAsync(value as CreateCategoryRequest);
      }
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset();
          setShowEmojiPicker(false);
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
                  Update <span className="text-amber-500">{data.name}</span>
                </>
              ) : (
                <>
                  Add <span className="text-amber-500">category</span>
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
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
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

            <FormField
              name="type"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value.toString()}
                      onValueChange={(value) => {
                        field.handleChange(Number(value) as CategoryType);
                      }}
                      disabled={isCreating || isUpdating}
                      aria-invalid={isInvalid}
                      required
                    >
                      <SelectTrigger
                        id={field.name}
                        className="border-input w-full rounded-md border bg-neutral-950 focus-visible:border-amber-500 focus-visible:ring-0 focus-visible:ring-amber-500"
                      >
                        <SelectValue>
                          {(val: string | null) =>
                            val
                              ? getCategoryTypeLabel(
                                  Number(val) as CategoryType,
                                )
                              : "Select Category"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="border-input rounded-md border px-1 py-2">
                        {Object.entries(CategoryType)
                          .filter(
                            ([name]) =>
                              isNaN(Number(name)) && name !== "Unspecified",
                          )
                          .map(([name, value]) => (
                            <SelectItem
                              key={name}
                              value={value.toString()}
                              className="rounded-md"
                            >
                              {getCategoryTypeLabel(value as CategoryType)}
                            </SelectItem>
                          ))}
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
              name="icon"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid} className="relative">
                    <FieldLabel htmlFor={field.name}>Icon</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="border-input w-full rounded-md border bg-neutral-950 focus-visible:border-amber-500 focus-visible:ring-0 focus-visible:ring-amber-500"
                        disabled={isCreating || isUpdating}
                        autoComplete="off"
                        placeholder="Icon(s)"
                      />
                      <Button
                        type="button"
                        ref={emojiButtonRef}
                        variant="outline"
                        size="icon"
                        className="border-input shrink-0 rounded-md bg-neutral-950 hover:bg-neutral-900 focus-visible:border-amber-500 focus-visible:ring-0 focus-visible:ring-amber-500"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        disabled={isCreating || isUpdating}
                      >
                        <Smile size={16} className="text-muted-foreground" />
                      </Button>
                    </div>

                    {showEmojiPicker && (
                      <div
                        ref={emojiPickerRef}
                        className="animate-in fade-in-0 zoom-in-95 absolute top-full right-0 z-50 mt-2 h-75 w-full rounded-md border bg-neutral-950 shadow-md"
                      >
                        <EmojiPicker
                          className="h-full w-full"
                          columns={13}
                          onEmojiSelect={(emojiData) => {
                            field.handleChange(
                              (field.state.value || "") + emojiData.emoji,
                            );
                          }}
                        >
                          <EmojiPickerSearch />
                          <EmojiPickerContent />
                          <EmojiPickerFooter />
                        </EmojiPicker>
                      </div>
                    )}
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

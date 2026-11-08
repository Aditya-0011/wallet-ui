import BigNumber from "bignumber.js";
import { z } from "zod";
import { GrpcTimeSchema, grpcTimeMillis, type GrpcTimestamp } from "@/lib/time";

export const AMOUNT_PATTERN = /^\d{1,13}(\.\d{1,2})?$/;

export const CATEGORY_ICON_PATTERN =
  /^(?:[\u{1F300}-\u{1FAD6}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]|\u{200D}|\u{FE0F})+$/u;

export function isValidCategoryIcon(icon: string): boolean {
  return CATEGORY_ICON_PATTERN.test(icon.trim());
}

export const GrpcDecimalSchema = z.object({
  value: z.string(),
});
export type GrpcDecimal = z.infer<typeof GrpcDecimalSchema>;

export { GrpcTimeSchema };
export type GrpcTime = GrpcTimestamp;

export const AmountSchema = GrpcDecimalSchema.superRefine((x, ctx) => {
  const value = x.value.trim();
  const fail = (message: string) =>
    ctx.addIssue({ code: "custom", message, path: ["value"] });

  if (value === "") {
    fail("Amount is required");
    return;
  }
  const amount = new BigNumber(value);
  if (!AMOUNT_PATTERN.test(value) || !amount.isFinite()) {
    fail("Use digits only, with up to 13 before and 2 after the decimal point");
    return;
  }
  if ((amount.decimalPlaces() ?? 0) > 2) {
    fail("Amount can have at most 2 decimal places");
    return;
  }
  if (!amount.gt(0)) {
    fail("Amount must be greater than zero");
  }
});

export const SimpleResponseSchema = z.object({
  message: z.string().trim(),
});
export type SimpleResponse = z.infer<typeof SimpleResponseSchema>;

export const DeleteRequestSchema = z.object({
  id: z.number(),
});
export type DeleteRequest = z.infer<typeof DeleteRequestSchema>;

export const UserSummaryResponseSchema = z.object({
  all_income: GrpcDecimalSchema,
  all_expense: GrpcDecimalSchema,
  month_income: GrpcDecimalSchema,
  month_expense: GrpcDecimalSchema,
  week_income: GrpcDecimalSchema,
  week_expense: GrpcDecimalSchema,
  start_date: GrpcTimeSchema,
});
export type UserSummaryResponse = z.infer<typeof UserSummaryResponseSchema>;

export const CategoryType = {
  Unspecified: 0,
  Income: 1,
  Expense: 2,
} as const;

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

export const CategoryTypeSchema = z.union(
  [
    z.literal(CategoryType.Unspecified),
    z.literal(CategoryType.Income),
    z.literal(CategoryType.Expense),
  ],
  { error: "Invalid category type" },
);

export const getCategoryTypeLabel = (categoryType: CategoryType): string => {
  switch (categoryType) {
    case CategoryType.Income:
      return "Income";
    case CategoryType.Expense:
      return "Expense";
    default:
      return "Unspecified";
  }
};

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  icon: z.emoji(),
  type: CategoryTypeSchema,
  created_at: GrpcTimeSchema,
  updated_at: GrpcTimeSchema,
});
export type Category = z.infer<typeof CategorySchema>;

export const CategorySummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  icon: z.emoji(),
  type: CategoryTypeSchema,
});
export type CategorySummary = z.infer<typeof CategorySummarySchema>;

export const GetCategoriesResponseSchema = z.object({
  categories: z.array(CategorySchema),
});
export type GetCategoriesResponse = z.infer<typeof GetCategoriesResponseSchema>;

export const CreateCategoryRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required" })
    .max(255, { error: "Name can be at most 255 characters long" }),
  icon: z.string().trim().regex(CATEGORY_ICON_PATTERN, {
    error: "Pick an emoji the server supports",
  }),
  type: CategoryTypeSchema,
});
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;

export const UpdateCategoryRequestSchema = z.object({
  id: z.number(),
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required" })
    .max(255, { error: "Name can be at most 255 characters long" }),
  icon: z.string().trim().regex(CATEGORY_ICON_PATTERN, {
    error: "Pick an emoji the server supports",
  }),

  type: CategoryTypeSchema,
});
export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;

export const TransactionSchema = z.object({
  id: z.number(),
  description: z.string(),
  amount: GrpcDecimalSchema,
  category: CategorySummarySchema,
  created_at: GrpcTimeSchema,
  updated_at: GrpcTimeSchema,
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const GetTransactionsResponseSchema = z.object({
  transactions: z.array(TransactionSchema),
});
export type GetTransactionsResponse = z.infer<
  typeof GetTransactionsResponseSchema
>;

export const TransactionsUpdateHistorySchema = z.object({
  id: z.number(),
  previous_category: CategorySummarySchema,
  current_category: CategorySummarySchema,
  previous_description: z.string(),
  current_description: z.string(),
  previous_amount: GrpcDecimalSchema,
  current_amount: GrpcDecimalSchema,
  created_at: GrpcTimeSchema,
});
export type TransactionsUpdateHistory = z.infer<
  typeof TransactionsUpdateHistorySchema
>;

export const GetTransactionsUpdateHistoryRequestSchema = z.object({
  transaction_id: z.number(),
});
export type GetTransactionsUpdateHistoryRequest = z.infer<
  typeof GetTransactionsUpdateHistoryRequestSchema
>;

export const GetTransactionsUpdateHistoryResponseSchema = z.object({
  history: z.array(TransactionsUpdateHistorySchema),
});
export type GetTransactionsUpdateHistoryResponse = z.infer<
  typeof GetTransactionsUpdateHistoryResponseSchema
>;

export const GetTransactionsRequestSchema = z
  .object({
    limit: z.number().gt(0, { error: "Invalid limit" }),
    page: z.number().gt(0, { error: "Invalid page" }),
    type: CategoryTypeSchema.optional(),
    category_id: z.number().gt(0, { error: "Invalid category" }).optional(),
    start_date: GrpcTimeSchema.optional(),
    end_date: GrpcTimeSchema.optional(),
  })
  .refine(
    (x) => {
      if (!x.start_date || !x.end_date) return true;
      return grpcTimeMillis(x.end_date) >= grpcTimeMillis(x.start_date);
    },
    {
      error: "end date must be after or equal to start date",
      path: ["end_date"],
    },
  );
export type GetTransactionsRequest = z.infer<
  typeof GetTransactionsRequestSchema
>;

export const CreateTransactionRequestSchema = z.object({
  category_id: z
    .number({ error: "Category is required" })
    .gt(0, { error: "Invalid category" }),
  description: z
    .string()
    .trim()
    .min(1, { error: "Description is required" })
    .max(255, { error: "Description can be at most 255 characters long" }),
  amount: AmountSchema,
});
export type CreateTransactionRequest = z.infer<
  typeof CreateTransactionRequestSchema
>;

export const ExportTransactionsRequestSchema = z
  .object({
    start_date: GrpcTimeSchema,
    end_date: GrpcTimeSchema,
  })
  .refine(
    (x) => {
      if (!x.start_date || !x.end_date) return true;
      return grpcTimeMillis(x.end_date) >= grpcTimeMillis(x.start_date);
    },
    {
      error: "end date must be after or equal to start date",
      path: ["end_date"],
    },
  );

export type ExportTransactionsRequest = z.infer<
  typeof ExportTransactionsRequestSchema
>;

export const ExportTransactionsResponseSchema = z.object({
  file_data: z.instanceof(Blob),
  file_name: z.string(),
  content_type: z.string(),
});

export type ExportTransactionsResponse = z.infer<
  typeof ExportTransactionsResponseSchema
>;

export const UpdateTransactionRequestSchema = z.object({
  id: z.number(),
  category_id: z
    .number({ error: "Category is required" })
    .gt(0, { error: "Invalid Category" }),
  description: z
    .string()
    .trim()
    .min(1, { error: "Description is required" })
    .max(255, { error: "Description can be at most 255 characters long" }),
  amount: AmountSchema,
});
export type UpdateTransactionRequest = z.infer<
  typeof UpdateTransactionRequestSchema
>;

export { FetchError } from "@/lib/errors";

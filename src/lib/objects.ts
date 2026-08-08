import { type RankingInfo } from "@tanstack/match-sorter-utils";
import { type FilterFn, type TableFeatures } from "@tanstack/react-table";
import BigNumber from "bignumber.js";
import { z } from "zod";

export const RequestMethodSchema = z.enum(["GET", "POST", "QUERY"]);
export type RequestMethod = z.infer<typeof RequestMethodSchema>;

export const ServiceListSchema = z.enum(["auth", "wallet"]);
export type ServiceList = z.infer<typeof ServiceListSchema>;

export const ServiceApiMappingSchema = z.record(ServiceListSchema, z.string());
export type ServiceApiMapping = z.infer<typeof ServiceApiMappingSchema>;

export const GrpcDecimalSchema = z.object({
  value: z.string(),
});
export type GrpcDecimal = z.infer<typeof GrpcDecimalSchema>;

export const GrpcTimeSchema = z.object({
  seconds: z.number(),
  nanos: z.number(),
});
export type GrpcTime = z.infer<typeof GrpcTimeSchema>;

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
  icon: z.emoji({ error: "Invalid emoji" }).trim(),
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
  icon: z.emoji({ error: "Invalid emoji" }).trim(),

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
      const start = x.start_date.seconds + x.start_date.nanos / 1e9;
      const end = x.end_date.seconds + x.end_date.nanos / 1e9;
      return end >= start;
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
  amount: GrpcDecimalSchema.superRefine((x, ctx) => {
    if (new BigNumber(x.value).lte(0)) {
      ctx.addIssue({
        code: "custom",
        message: "Amount must be greater than zero",
        path: ["value"],
      });
    }
  }),
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
      const start = x.start_date.seconds + x.start_date.nanos / 1e9;
      const end = x.end_date.seconds + x.end_date.nanos / 1e9;
      return end >= start;
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
  amount: GrpcDecimalSchema.superRefine((x, ctx) => {
    if (new BigNumber(x.value).lte(0)) {
      ctx.addIssue({
        code: "custom",
        message: "Amount must be greater than zero",
        path: ["value"],
      });
    }
  }),
});
export type UpdateTransactionRequest = z.infer<
  typeof UpdateTransactionRequestSchema
>;

export class FetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

declare module "luxon" {
  interface DateTime {
    toGrpcTime(): GrpcTime;
  }
}

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<TableFeatures, Record<string, unknown>>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type UserSummaryResponse } from "@/lib/objects";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import BigNumber from "bignumber.js";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";

export function Summary({ data }: { data: UserSummaryResponse }) {
  const [tab, setTab] = useState<"all" | "month" | "week">("week");

  const startDate = formatDate(data.start_date);

  const getValues = () => {
    switch (tab) {
      case "all":
        return {
          income: data.all_income.value,
          expense: data.all_expense.value,
        };
      case "month":
        return {
          income: data.month_income.value,
          expense: data.month_expense.value,
        };
      case "week":
        return {
          income: data.week_income.value,
          expense: data.week_expense.value,
        };
    }
  };

  const { income: incomeStr, expense: expenseStr } = getValues();

  const income = new BigNumber(incomeStr || "0");
  const expense = new BigNumber(expenseStr || "0");
  const savings = income.minus(expense);

  const savingsStatus = savings.isGreaterThan(0)
    ? "positive"
    : savings.isLessThan(0)
      ? "negative"
      : "neutral";

  const getSavingsColors = () => {
    switch (savingsStatus) {
      case "positive":
        return {
          card: "border-amber-500/50 bg-amber-950/10 ring-amber-500/10 hover:ring-amber-500/30",
          text: "text-amber-500",
        };
      case "negative":
        return {
          card: "border-rose-900/60 bg-rose-950/10 ring-rose-500/10 hover:ring-rose-500/30",
          text: "text-rose-500",
        };
      case "neutral":
      default:
        return {
          card: "border-neutral-700/50 bg-neutral-900/20 ring-neutral-500/10 hover:ring-neutral-500/30",
          text: "text-neutral-400",
        };
    }
  };

  const savingsColors = getSavingsColors();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-white/10 pb-3">
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-wide text-amber-500">
            Summary
          </span>
          <span className="text-muted-foreground text-xs font-medium tracking-wider">
            From: {startDate}
          </span>
        </div>

        <Tabs
          value={tab}
          onValueChange={(val) => setTab(val as "all" | "month" | "week")}
        >
          <TabsList
            variant="line"
            className="-mb-3 h-auto gap-6 bg-transparent p-0"
          >
            <TabsTrigger
              value="all"
              className="text-muted-foreground hover:text-foreground px-0 py-2 font-medium data-active:text-amber-500 data-active:after:bg-amber-500"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="text-muted-foreground hover:text-foreground px-0 py-2 font-medium data-active:text-amber-500 data-active:after:bg-amber-500"
            >
              This Month
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="text-muted-foreground hover:text-foreground px-0 py-2 font-medium data-active:text-amber-500 data-active:after:bg-amber-500"
            >
              This Week
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="group border-emerald-900/60 bg-emerald-950/10 shadow-sm ring ring-emerald-500/10 backdrop-blur transition-all hover:scale-[1.02] hover:ring-emerald-500/30">
          <CardContent className="flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="text-sm font-medium">Income</span>
              <TrendingUp size={18} strokeWidth={2.5} />
            </div>
            <div className="text-foreground text-2xl font-semibold tracking-tight">
              {formatCurrency(income)}
            </div>
          </CardContent>
        </Card>

        <Card className="group border-rose-900/60 bg-rose-950/10 shadow-sm ring ring-rose-500/10 backdrop-blur transition-all hover:scale-[1.02] hover:ring-rose-500/30">
          <CardContent className="flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between text-rose-500">
              <span className="text-sm font-medium">Expense</span>
              <TrendingDown size={18} strokeWidth={2.5} />
            </div>
            <div className="text-foreground text-2xl font-semibold tracking-tight">
              {formatCurrency(expense)}
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "group shadow-sm ring backdrop-blur transition-all hover:scale-[1.02]",
            savingsColors.card,
          )}
        >
          <CardContent className="flex flex-col gap-5 p-5">
            <div
              className={cn(
                "flex items-center justify-between",
                savingsColors.text,
              )}
            >
              <span className="text-sm font-medium">Savings</span>
              <Wallet size={18} strokeWidth={2.5} />
            </div>
            <div
              className={cn(
                "text-2xl font-semibold tracking-tight",
                savingsColors.text,
              )}
            >
              {formatCurrency(savings)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

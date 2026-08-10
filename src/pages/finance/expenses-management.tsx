"use client";

import { useState } from "react";
import type { DateRange as RDateRange } from "react-day-picker";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import TitleSubtitle from "@/components/TitleSubtitle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Upload,
  Plus,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DateRangeFilter from "@/components/ui/date-range-filter";
import { MonthlySummaryCard } from "@/components/finance/monthly-summary-card";
import { ExpensesCategoryChart } from "@/components/finance/expenses-category-chart";
import { BudgetVsActualChart } from "@/components/finance/budget-vs-actual-chart";
import { AddExpenseDialog } from "@/components/finance/add-expense-dialog";
import { BudgetAlert, ImportantNote } from "@/components/finance/alerts";
import { ExpensesCategoryManagement } from "@/components/finance/expenses-category-management";
import { UploadFileDialog } from "@/components/upload-file-dialog";
import SuccessDialog from "@/components/success-dialog";
import {
  useExpensesFiltersQuery,
  useExpensesQuery,
} from "@/modules/financials/financials.hooks";

function ExpenseCard({
  title,
  value,
  growth,
}: {
  title: string;
  value: string;
  growth: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <div className="mt-1 flex items-end gap-2">
        <p className="text-xl font-semibold leading-none text-slate-900">
          {value}
        </p>
      </div>
      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
        <CircleDollarSign className="h-3.5 w-3.5" />
        <span>{growth}</span>
      </div>
    </div>
  );
}

export default function ExpensesManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogTitle, setSuccessDialogTitle] = useState(
    "File(s) Uploaded Successfully",
  );

  const limit = 10;

  // Fetch dynamic filters
  const { data: filtersRes, isLoading: isFiltersLoading } = useExpensesFiltersQuery();
  const filtersData = filtersRes?.data;

  const categories = filtersData?.categories || [];
  const buildingLabels = filtersData?.buildingLabels || [];
  const statuses = filtersData?.statuses || [];
  const projects = filtersData?.projects || [];

  // Build query params
  const startDateStr = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const endDateStr = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  const queryParams = {
    projectId: selectedProject !== "all" ? selectedProject : undefined,
    buildingLabel: selectedBuilding !== "all" ? selectedBuilding : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    startDate: startDateStr,
    endDate: endDateStr,
    page: currentPage,
    limit,
  };

  // Fetch expenses list & stats
  const { data: expensesRes, isLoading: isExpensesLoading, isFetching: isExpensesFetching } = useExpensesQuery(queryParams);

  const stats = expensesRes?.data?.stats;
  const expensesList = expensesRes?.data?.expenses || [];
  const totalCount = expensesRes?.data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Expense card values derived from stats
  const formattedTotalExpense = stats?.totalExpense !== undefined ? `$${stats.totalExpense.toLocaleString()}` : "$0.00";

  const getCategoryTotal = (catName: string) => {
    const item = stats?.byCategory?.find(
      (c) => c.category.toLowerCase() === catName.toLowerCase()
    );
    return item ? `$${item.total.toLocaleString()}` : "$0.00";
  };

  const dynamicCards = [
    { title: "Total Expense", value: formattedTotalExpense, growth: "+12.5%" },
    { title: "Vendor / Freight", value: getCategoryTotal("Vendor/Freight"), growth: "+12.5%" },
    { title: "Operations", value: getCategoryTotal("Operations"), growth: "+12.5%" },
    { title: "Miscellaneous", value: getCategoryTotal("Miscellaneous"), growth: "+12.5%" },
    { title: "Salaries", value: getCategoryTotal("Salaries"), growth: "+12.5%" },
    { title: "Marketing", value: getCategoryTotal("Marketing"), growth: "+12.5%" },
  ];

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <TitleSubtitle
          title="Expenses Management"
          subtitle="Track and manage all your business expenses"
        />

        <div className="flex flex-wrap gap-2">
          <Button className="h-9 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <UploadFileDialog
            title="Upload Expense File"
            description="Add your documents here, and you can upload up to 5 files max"
            supportText="Only support .jpg, .png and .svg and zip files"
            accept=".jpg,.jpeg,.png,.svg,.zip,.pdf,.csv,.xls,.xlsx"
            maxFiles={5}
            onUpload={(files) => {
              console.log("Imported expense files:", files);
              setSuccessDialogTitle("File(s) Imported Successfully");
              setSuccessDialogOpen(true);
            }}
          >
            <Button className="h-9 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50">
              <Upload className="mr-2 h-4 w-4" />
              Import Expenses
            </Button>
          </UploadFileDialog>
          <Button
            className="h-9 bg-violet-600 px-4 text-white hover:bg-violet-700"
            onClick={() => setAddExpenseDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Expenses
          </Button>
        </div>
      </div>

      {/* Expense Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {dynamicCards.map((card) => (
          <ExpenseCard
            key={card.title}
            title={card.title}
            value={card.value}
            growth={card.growth}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={selectedProject}
          onValueChange={(val) => {
            setSelectedProject(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-auto bg-white min-w-[200px]">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Select Project: All Projects</SelectItem>
            {projects.map((proj) => (
              <SelectItem key={proj.leadId} value={proj.leadId}>
                {proj.projectName} ({proj.jobId})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedBuilding}
          onValueChange={(val) => {
            setSelectedBuilding(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-auto bg-white min-w-[180px]">
            <SelectValue placeholder="Select Building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Buildings: All Buildings</SelectItem>
            {buildingLabels.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus}
          onValueChange={(val) => {
            setSelectedStatus(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-auto bg-white min-w-[160px]">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All Status</SelectItem>
            {statuses.map((st) => (
              <SelectItem key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangeFilter
          value={dateRange}
          onChange={(range) => {
            setDateRange(range);
            setCurrentPage(1);
          }}
          className="bg-white"
        />

        {isExpensesFetching && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating...
          </div>
        )}
      </div>

      {/* Category Tabs with Table Card */}
      <Card className="overflow-hidden gap-0 p-0">
        <Tabs
          value={selectedCategory}
          onValueChange={(val) => {
            setSelectedCategory(val);
            setCurrentPage(1);
          }}
          className="w-full flex flex-col"
        >
          <TabsList variant="line">
            <TabsTrigger value="all" className="px-4 py-2">
              All
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="px-4 py-2">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="flex flex-col gap-4">
            {/* Expenses Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-24">Expense ID</TableHead>
                    <TableHead className="w-28">Date</TableHead>
                    <TableHead className="w-28">Category</TableHead>
                    <TableHead className="w-28">Sub Category</TableHead>
                    <TableHead className="w-32">Profile</TableHead>
                    <TableHead className="w-32">Project Building</TableHead>
                    <TableHead className="w-24 text-right">Amount</TableHead>
                    <TableHead className="w-32">Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isExpensesLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                          <span>Loading expenses...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : expensesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                        No expenses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expensesList.map((expense, index) => {
                      const profileName =
                        typeof expense.createdBy === "object" && expense.createdBy !== null
                          ? expense.createdBy.name
                          : "-";
                      const leadObj =
                        typeof expense.leadId === "object" && expense.leadId !== null
                          ? expense.leadId
                          : null;
                      const projectBuilding = leadObj
                        ? `${leadObj.projectName} - ${expense.buildingLabel || ""}`
                        : expense.buildingLabel || "-";

                      const formattedDate = expense.date
                        ? format(new Date(expense.date), "dd MMM yyyy")
                        : "-";

                      const formattedAmount = `$${expense.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`;

                      const paymentMethodLabel = expense.paymentMethod
                        ? expense.paymentMethod.replace(/_/g, " ").toUpperCase()
                        : "-";

                      return (
                        <TableRow
                          key={expense._id}
                          className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                        >
                          <TableCell className="font-medium text-blue-600">
                            {expense.expenseId}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {formattedDate}
                          </TableCell>
                          <TableCell>
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              {expense.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {expense.subcategory || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {profileName}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {projectBuilding}
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-900">
                            {formattedAmount}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {paymentMethodLabel}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 pb-6">
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">{expensesList.length}</span> of{" "}
                <span className="font-medium">{totalCount}</span> Results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isExpensesLoading}
                  className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        disabled={isExpensesLoading}
                        className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? "bg-violet-600 text-white"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage >= totalPages || isExpensesLoading}
                  className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* New Sections */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Summary */}
        <MonthlySummaryCard />

        {/* Expenses by Category Chart */}
        <ExpensesCategoryChart />

        {/* Budget VS Actual Chart */}
        <BudgetVsActualChart />
      </div>

      {/* Alert and Note Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BudgetAlert />
        <ImportantNote />
      </div>

      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title={successDialogTitle}
      />

      <AddExpenseDialog
        open={addExpenseDialogOpen}
        onClose={() => setAddExpenseDialogOpen(false)}
        onSuccess={() => {
          setSuccessDialogTitle("Expense added successfully");
          setSuccessDialogOpen(true);
        }}
      />

      {/* Expenses Categories Management */}
      <div className="mt-6">
        <ExpensesCategoryManagement />
      </div>
    </div>
  );
}


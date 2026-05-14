"use client";

import { useState } from "react";
import type { DateRange as RDateRange } from "react-day-picker";
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

interface Expense {
  id: string;
  date: string;
  category: string;
  subCategory: string;
  profile: string;
  profileImage?: string;
  projectBuilding: string;
  amount: string;
  paymentMethod: string;
}

const expenseCards = [
  { title: "Total Expense", value: "$48,950.00", growth: "+12.5%" },
  { title: "Vendor / Freight", value: "$28,320.00", growth: "+12.5%" },
  { title: "Operations", value: "$8,650.00", growth: "+12.5%" },
  { title: "Miscellaneous", value: "$6,230.00", growth: "+12.5%" },
  { title: "Salaries", value: "$4,900.00", growth: "+12.5%" },
  { title: "Marketing", value: "$2,847,392", growth: "+12.5%" },
];

const expenseData: Expense[] = [
  {
    id: "EXP00525",
    date: "22 Feb 2025",
    category: "Vendor/Freight",
    subCategory: "Freight",
    profile: "Emily Clark",
    projectBuilding: "Project1 - B-A",
    amount: "$10,000",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "EXP00524",
    date: "07 Feb 2025",
    category: "Vendor/Freight",
    subCategory: "Vendor",
    profile: "John Carter",
    projectBuilding: "Project2 - B-A",
    amount: "$25,750",
    paymentMethod: "Check",
  },
  {
    id: "EXP00523",
    date: "30 Jan 2025",
    category: "Vendor/Freight",
    subCategory: "Freight",
    profile: "Sophia White",
    projectBuilding: "Project 3 - B-A",
    amount: "$50,025",
    paymentMethod: "Cash",
  },
  {
    id: "EXP00522",
    date: "17 Jan 2025",
    category: "Vendor/Freight",
    subCategory: "Vendor",
    profile: "Michael Johnson",
    projectBuilding: "Project 4 - B-A",
    amount: "$75,900",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "EXP00521",
    date: "04 Jan 2025",
    category: "Vendor/Freight",
    subCategory: "Freight",
    profile: "Olivia Harris",
    projectBuilding: "Project1 - B-A",
    amount: "$99,999",
    paymentMethod: "Card",
  },
  {
    id: "EXP00520",
    date: "09 Dec 2024",
    category: "Vendor/Freight",
    subCategory: "Vendor",
    profile: "David Anderson",
    projectBuilding: "Project1 - B-A",
    amount: "$120,500",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "EXP00519",
    date: "02 Dec 2024",
    category: "Vendor/Freight",
    subCategory: "Freight",
    profile: "Emma Lewis",
    projectBuilding: "Project1 - B-A",
    amount: "$250,000",
    paymentMethod: "Cash",
  },
  {
    id: "EXP00518",
    date: "15 Nov 2024",
    category: "Vendor/Freight",
    subCategory: "Vendor",
    profile: "Robert Thomas",
    projectBuilding: "Project1 - B-A",
    amount: "$55,00,750",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "EXP00517",
    date: "30 Nov 2024",
    category: "Vendor/Freight",
    subCategory: "Freight",
    profile: "Isabella Scott",
    projectBuilding: "Project1 - B-A",
    amount: "$750,300",
    paymentMethod: "Cash",
  },
  {
    id: "EXP00516",
    date: "12 Oct 2024",
    category: "Vendor/Freight",
    subCategory: "Vendor",
    profile: "Daniel Martinez",
    projectBuilding: "Project1 - B-A",
    amount: "$8,98,999",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "EXP00515",
    date: "05 Oct 2024",
    category: "Vendor/Freight",
    subCategory: "Freight",
    profile: "Charlotte Brown",
    projectBuilding: "Project1 - B-A",
    amount: "$87,650",
    paymentMethod: "Cash",
  },
  {
    id: "EXP00514",
    date: "09 Sep 2024",
    category: "Vendor/Freight",
    subCategory: "Vendor",
    profile: "William Parker",
    projectBuilding: "Project1 - B-A",
    amount: "$89,400",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "EXP00513",
    date: "02 Sep 2024",
    category: "Vendor/Freight",
    subCategory: "Freight",
    profile: "Mia Thompson",
    projectBuilding: "Project1 - B-A",
    amount: "$33,210",
    paymentMethod: "Cash",
  },
  {
    id: "EXP00512",
    date: "07 Aug 2024",
    category: "Vendor/Freight",
    subCategory: "Vendor",
    profile: "Amelia Robinson",
    projectBuilding: "Project1 - B-A",
    amount: "$2,10,000",
    paymentMethod: "Bank Transfer",
  },
];

const categories = [
  "All",
  "Vendor / Freight",
  "Manual (Operations)",
  "Miscellaneous",
  "Salaries",
  "Marketing",
  "Custom Categories",
];

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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogTitle, setSuccessDialogTitle] = useState(
    "File(s) Uploaded Successfully",
  );
  const itemsPerPage = 10;
  const totalPages = Math.ceil(expenseData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = expenseData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

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
        {expenseCards.map((card) => (
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
        <Select defaultValue="all-projects">
          <SelectTrigger className="w-auto bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-projects">
              Select Project: All Projects
            </SelectItem>
            <SelectItem value="project-1">Project 1</SelectItem>
            <SelectItem value="project-2">Project 2</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all-buildings">
          <SelectTrigger className="w-auto bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-buildings">
              Buildings: All Buildings
            </SelectItem>
            <SelectItem value="building-1">Building 1</SelectItem>
            <SelectItem value="building-2">Building 2</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all-status">
          <SelectTrigger className="w-auto bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">Status: All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          className="bg-white"
        />
      </div>

      {/* Category Tabs with Table Card */}
      <Card className="overflow-hidden gap-0 p-0">
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full flex flex-col"
        >
          <TabsList variant="line">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="px-4 py-2"
              >
                {category}
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
                    <TableHead className="w-28">Project Building</TableHead>
                    <TableHead className="w-24 text-right">Amount</TableHead>
                    <TableHead className="w-32">Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((expense, index) => (
                    <TableRow
                      key={expense.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <TableCell className="font-medium text-blue-600">
                        {expense.id}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {expense.date}
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {expense.subCategory}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {expense.profile}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {expense.projectBuilding}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {expense.amount}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {expense.paymentMethod}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 pb-6">
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">10</span> Results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
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
                  disabled={currentPage === totalPages}
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Loader2 } from "lucide-react";
import { AddExpenseCategoryDialog } from "./add-expense-category-dialog";
import { useExpenseCategoriesQuery } from "@/modules/financials/financials.hooks";
import type { ExpenseCategoryApiItem } from "@/modules/financials/financials.api";

export function ExpensesCategoryManagement() {
  const [openDialog, setOpenDialog] = useState(false);

  const { data: categoriesRes, isLoading, isError } = useExpenseCategoriesQuery();
  const apiCategories: ExpenseCategoryApiItem[] = categoriesRes?.data?.categories || [];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">
          Expenses Categories Management
        </h3>
        <Button
          onClick={() => setOpenDialog(true)}
          className="h-9 bg-violet-600 px-4 text-white hover:bg-violet-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                    <span>Loading categories...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-red-500">
                  Failed to load expense categories.
                </TableCell>
              </TableRow>
            ) : apiCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  No expense categories found.
                </TableCell>
              </TableRow>
            ) : (
              apiCategories.map((category, index) => {
                const status = category.isActive ? "Active" : "Inactive";

                return (
                  <TableRow
                    key={category._id}
                    className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    <TableCell className="font-medium text-slate-900">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      -
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        -
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        -
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          category.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        <Edit className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AddExpenseCategoryDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
    </div>
  );
}




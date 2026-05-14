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
import { Plus, Edit } from "lucide-react";
import {
  AddExpenseCategoryDialog,
  type AddExpenseCategoryFormValues,
} from "./add-expense-category-dialog";

interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  type: string;
  default: string;
  status: string;
}

const expenseCategoriesData: ExpenseCategory[] = [
  {
    id: "1",
    name: "Vendor/Freight",
    description: "All vendors payment",
    type: "System",
    default: "Yes",
    status: "Active",
  },
  {
    id: "2",
    name: "Operations (Manually)",
    description: "Manually Added Operational",
    type: "System",
    default: "Yes",
    status: "Active",
  },
  {
    id: "3",
    name: "Miscellaneous",
    description: "Other Miscellaneous",
    type: "System",
    default: "Yes",
    status: "Active",
  },
  {
    id: "4",
    name: "Salaries",
    description: "Employee salaries",
    type: "System",
    default: "Yes",
    status: "Active",
  },
  {
    id: "5",
    name: "Marketing",
    description: "Marketing Promotional",
    type: "System",
    default: "Yes",
    status: "Active",
  },
  {
    id: "6",
    name: "Professional Fees",
    description: "Legal Consultancy professional fees",
    type: "System",
    default: "Yes",
    status: "Active",
  },
  {
    id: "7",
    name: "Equipment Maintenance",
    description: "Repair & Maintenance",
    type: "System",
    default: "Yes",
    status: "Active",
  },
];

export function ExpensesCategoryManagement() {
  const [openDialog, setOpenDialog] = useState(false);
  const [categories, setCategories] = useState(expenseCategoriesData);

  const handleAddCategory = (data: AddExpenseCategoryFormValues) => {
    const newCategory: ExpenseCategory = {
      id: String(categories.length + 1),
      name: data.name,
      description: data.description,
      type: data.type,
      default: data.default,
      status: data.status,
    };
    setCategories([...categories, newCategory]);
  };

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
            {categories.map((category, index) => (
              <TableRow
                key={category.id}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                <TableCell className="font-medium text-slate-900">
                  {category.name}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {category.description}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600">
                    {category.type}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600">
                    {category.default}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    {category.status}
                  </span>
                </TableCell>
                <TableCell>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    <Edit className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddExpenseCategoryDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={handleAddCategory}
      />
    </div>
  );
}

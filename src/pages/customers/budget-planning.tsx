import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  CircleDollarSign,
  MessageSquare,
  Package,
  Ship,
  Truck,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import SuccessDialog from "@/components/success-dialog";

export default function BudgetPlanning() {
  const navigate = useNavigate();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogTitle, setSuccessDialogTitle] = useState("Success!");

  const handleSaveDraft = () => {
    setSuccessDialogTitle("Draft Saved");
    setSuccessDialogOpen(true);
  };

  const handleUpdateBudget = () => {
    setSuccessDialogTitle("Update successfully");
    setSuccessDialogOpen(true);
  };

  return (
    <div className="flex h-full flex-col ">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="default"
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Budget Planning
              </h1>
              <p className="text-sm text-gray-500">
                Plan and manage the estimate budget for the project before
                execution
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-2"
              onClick={handleSaveDraft}
            >
              <Upload className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
              onClick={handleUpdateBudget}
            >
              Update Budget
            </Button>
          </div>
        </div>

        {/* Project Info Card */}
        <Card className="mt-8 overflow-hidden rounded-xl border-gray-200">
          <div className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Project 1- ABC Warehouse
                </h2>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                  In Progress
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Q-2025-1047</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 border-t border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Assigned Plant</p>
                <p className="text-sm font-medium text-gray-900">
                  Houston Plant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircleDollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Total Quote Value</p>
                <p className="text-sm font-medium text-gray-900">$1,250,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircleDollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Total Estimate Cost</p>
                <p className="text-sm font-medium text-gray-900">$1,038,500</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircleDollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Expected Profit</p>
                <p className="text-sm font-medium text-emerald-600">
                  $211,500(16%)
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Budget Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {/* Material Budget Card */}
          <Card className="rounded-xl border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Material Budget
                </h3>
                <p className="text-sm text-gray-500">
                  Estimate all material related costs for the project
                </p>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-500">
                Total Material Cost (USD)
              </label>
              <div className="flex gap-4">
                <Input
                  defaultValue="$ 343,000.00"
                  className="flex-1 text-gray-900 bg-white"
                />
                <Button className="bg-[#1E50A5] hover:bg-[#1a438c] text-white w-24">
                  Update
                </Button>
              </div>
            </div>
          </Card>

          {/* Logistic Budget Card */}
          <Card className="rounded-xl border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Logistic Budget
                </h3>
                <p className="text-sm text-gray-500">
                  Estimate all logistic related cost
                </p>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-500">
                Total Logistic Cost (USD)
              </label>
              <div className="flex gap-4">
                <Input
                  defaultValue="$ 343,000.00"
                  className="flex-1 text-gray-900 bg-white"
                />
                <Button className="bg-[#1E50A5] hover:bg-[#1a438c] text-white w-24">
                  Update
                </Button>
              </div>
            </div>
          </Card>

          {/* Production Budget Card */}
          <Card className="rounded-xl border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Production Budget
                </h3>
                <p className="text-sm text-gray-500">
                  Estimate Production and fabrication cost
                </p>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-500">
                Total Production Cost (USD)
              </label>
              <div className="flex gap-4">
                <Input
                  defaultValue="$ 343,000.00"
                  className="flex-1 text-gray-900 bg-white"
                />
                <Button className="bg-[#1E50A5] hover:bg-[#1a438c] text-white w-24">
                  Update
                </Button>
              </div>
            </div>
          </Card>

          {/* Shipper Budget Card */}
          <Card className="rounded-xl border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Ship className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Shipper Budget
                </h3>
                <p className="text-sm text-gray-500">
                  Estimate shipper quotation and related costs
                </p>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-500">
                Total Shipper Cost (USD)
              </label>
              <div className="flex gap-4">
                <Input
                  defaultValue="$ 343,000.00"
                  className="flex-1 text-gray-900 bg-white"
                />
                <Button className="bg-[#1E50A5] hover:bg-[#1a438c] text-white w-24">
                  Update
                </Button>
              </div>
            </div>
          </Card>

          {/* Other Costs Card */}
          <Card className="rounded-xl border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Other Costs</h3>
                <p className="text-sm text-gray-500">
                  Estimate any additional miscellaneous costs
                </p>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-500">
                Total other Cost (USD)
              </label>
              <div className="flex gap-4">
                <Input
                  defaultValue="$ 343,000.00"
                  className="flex-1 text-gray-900 bg-white"
                />
                <Button className="bg-[#1E50A5] hover:bg-[#1a438c] text-white w-24">
                  Update
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title={successDialogTitle}
      />
    </div>
  );
}

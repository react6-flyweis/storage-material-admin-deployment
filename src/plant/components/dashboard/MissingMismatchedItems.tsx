import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMismatchSummaryQuery } from "@/modules/plant/dashboard.hooks";
import type { DashboardFilterParams, MismatchCategory } from "@/modules/plant/dashboard.api";
import MismatchReportDialog from "./MismatchReportDialog";

interface MissingMismatchedItemsProps {
  filters?: DashboardFilterParams;
  employeeName?: string;
}

export default function MissingMismatchedItems({
  filters,
  employeeName,
}: MissingMismatchedItemsProps) {
  const { data, isLoading, isError } = useMismatchSummaryQuery(filters);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MismatchCategory | "">("");

  const summary = data?.data;
  const missingItems = summary?.missingItems ?? summary?.missingItemsFromQuote ?? 0;
  const qtyMismatches = summary?.quantityMismatches ?? summary?.qtyMismatches ?? 0;
  const specMismatches = summary?.specificationMismatches ?? summary?.specMismatches ?? 0;
  const extraItems = summary?.extraItems ?? summary?.extraItemsInShipper ?? 0;

  const handleOpenReport = (category: MismatchCategory | "" = "") => {
    setSelectedCategory(category);
    setIsReportOpen(true);
  };

  return (
    <>
      <Card className="flex flex-col shadow-sm h-full">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-base font-bold">Missing/Mismatched Items</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between px-5 py-4">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-6 w-8" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center p-6 text-sm text-red-500">
              Failed to load mismatch summary.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Row 1: Missing Items from Quote vs Shipper */}
              <div
                onClick={() => handleOpenReport("missing")}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                title="Click to view Missing Items"
              >
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Missing Items from Quote vs Shipper
                </span>
                <span className={`text-lg font-bold ${missingItems > 0 ? "text-red-600" : "text-blue-600"}`}>
                  {missingItems}
                </span>
              </div>

              {/* Row 2: Quantity Mismatches */}
              <div
                onClick={() => handleOpenReport("qty")}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                title="Click to view Quantity Mismatches"
              >
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Quantity Mismatches
                </span>
                <span className={`text-lg font-bold ${qtyMismatches > 0 ? "text-amber-600" : "text-blue-600"}`}>
                  {qtyMismatches}
                </span>
              </div>

              {/* Row 3: Specification Mismatches */}
              <div
                onClick={() => handleOpenReport("spec")}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                title="Click to view Specification Mismatches"
              >
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Specification Mismatches
                </span>
                <span className={`text-lg font-bold ${specMismatches > 0 ? "text-purple-600" : "text-blue-600"}`}>
                  {specMismatches}
                </span>
              </div>

              {/* Row 4: Extra Items in Shipper */}
              <div
                onClick={() => handleOpenReport("extra")}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                title="Click to view Extra Items in Shipper"
              >
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Extra Items in Shipper
                </span>
                <span className={`text-lg font-bold ${extraItems > 0 ? "text-orange-600" : "text-blue-600"}`}>
                  {extraItems}
                </span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-4 justify-center bg-gray-50/50 border-t">
          <Button
            onClick={() => handleOpenReport("")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            View Mismatch Report
          </Button>
        </CardFooter>
      </Card>

      {/* Mismatch Report Dialog */}
      <MismatchReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        filters={filters}
        initialCategory={selectedCategory}
        employeeName={employeeName}
      />
    </>
  );
}

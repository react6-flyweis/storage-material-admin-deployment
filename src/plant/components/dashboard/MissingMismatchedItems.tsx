import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MissingMismatchedItems() {
  return (
    <Card className="flex flex-col shadow-sm h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-base font-bold">Missing/Mismatched Items</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="text-sm text-gray-600">Missing Items from Quote vs Shipper</span>
          <span className="text-lg font-bold text-blue-600">-</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="text-sm text-gray-600">Quantity Mismatches</span>
          <span className="text-lg font-bold text-blue-600">-</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="text-sm text-gray-600">Specification Mismatches</span>
          <span className="text-lg font-bold text-blue-600">-</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="text-sm text-gray-600">Extra Items in Shipper</span>
          <span className="text-lg font-bold text-blue-600">-</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-4 justify-center bg-gray-50/50">
        <Button className="w-full bg-gray-400 hover:bg-gray-500 text-white">
          View Mismatch Report
        </Button>
      </CardFooter>
    </Card>
  );
}

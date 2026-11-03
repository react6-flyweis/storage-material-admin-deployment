import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, FileSpreadsheet, FileText, File } from "lucide-react";
import { useState, useMemo } from "react";
import SuccessDialog from "@/components/success-dialog";
import { useNavigate } from "react-router";

export default function TaxReportExport() {
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState(
    "File Exported Successfully"
  );
  const navigate = useNavigate();

  const { currentMonthName, currentYear, nextReportDate } = useMemo(() => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "long" });
    const year = now.getFullYear();
    const lastDayOfMonth = new Date(year, now.getMonth() + 1, 0).getDate();
    return {
      currentMonthName: month,
      currentYear: year,
      nextReportDate: `Next report ${month} ${lastDayOfMonth}, ${year} at 11:59 PM`,
    };
  }, []);

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b flex flex-row justify-between items-center">
          <CardTitle>Tax Report Export</CardTitle>
          <Button
            variant="link"
            size="sm"
            onClick={() => navigate("/payments/sales-tax-filing")}
            className="text-blue-600"
          >
            Filing History
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pt-6 flex-1 flex flex-col justify-start">
          {/* Monthly Tax Report */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Monthly Tax Report
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {currentMonthName} {currentYear} • Ready for export
                </p>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    size="sm"
                    onClick={() => {
                      setSuccessTitle("Excel Exported Successfully");
                      setSuccessOpen(true);
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Excel
                  </Button>
                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600"
                    size="sm"
                    onClick={() => {
                      setSuccessTitle("PDF Exported Successfully");
                      setSuccessOpen(true);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                    size="sm"
                    onClick={() => {
                      setSuccessTitle("CSV Exported Successfully");
                      setSuccessOpen(true);
                    }}
                  >
                    <File className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Auto Report Schedule */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Auto Report schedule
                </h3>
                <p className="text-sm text-yellow-700">
                  {nextReportDate}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Export */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Export Period
            </label>
            <Select defaultValue="current">
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="last">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => {
                setSuccessTitle("File Exported Successfully");
                setSuccessOpen(true);
              }}
            >
              Quick Export
            </Button>
          </div>
        </CardContent>
      </Card>
      <SuccessDialog
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={successTitle}
        okLabel="Ok"
      />
    </>
  );
}

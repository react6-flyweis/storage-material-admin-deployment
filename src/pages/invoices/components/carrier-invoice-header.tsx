import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CarrierInvoiceHeaderProps = {
  onExport: () => void;
  onUpload: () => void;
  isExporting?: boolean;
};

export function CarrierInvoiceHeader({
  onExport,
  onUpload,
  isExporting,
}: CarrierInvoiceHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Page Title & Export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Carrier Invoices
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track carrier freight invoices
          </p>
        </div>
        <Button onClick={onExport} variant="outline" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </div>

      {/* Subheader & Upload Invoice */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-xl font-bold text-gray-900">Carrier Invoices</h2>
        <Button
          onClick={onUpload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="w-4 h-4" />
          Upload Invoice
        </Button>
      </div>
    </div>
  );
}

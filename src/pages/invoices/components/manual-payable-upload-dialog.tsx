import { useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBudgetVsActualProjectsQuery } from "@/modules/financials/financials.hooks";
import { usePlantVendorsQuery } from "@/modules/plant/vendor.hooks";
import { usePlantCarriersQuery } from "@/modules/plant/carrier.hooks";
import {
  useCreateManualVendorPayableMutation,
  useCreateManualFreightPayableMutation,
} from "@/modules/invoices/invoices.hooks";
import { uploadFileToS3 } from "@/lib/upload";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  X,
  Loader2,
} from "lucide-react";

interface ManualPayableUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "vendor" | "freight_carrier";
  onSuccess?: () => void;
}

export function ManualPayableUploadDialog({
  open,
  onOpenChange,
  type,
  onSuccess,
}: ManualPayableUploadDialogProps) {
  const isVendor = type === "vendor";
  const title = isVendor ? "Upload Vendor Invoice" : "Upload Carrier Invoice";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [leadId, setLeadId] = useState("");
  const [payeeId, setPayeeId] = useState("");
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [category, setCategory] = useState<string>(isVendor ? "service" : "shipping");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [daysToPay, setDaysToPay] = useState<number>(30);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Queries for selectors
  const { data: projectsData, isLoading: isProjectsLoading } =
    useBudgetVsActualProjectsQuery();
  const { data: vendorsData, isLoading: isVendorsLoading } = usePlantVendorsQuery(
    { page: 1, limit: 100 },
    { enabled: isVendor && open }
  );
  const { data: carriersData, isLoading: isCarriersLoading } = usePlantCarriersQuery(
    { page: 1, limit: 100 },
    { enabled: !isVendor && open }
  );

  const projects = useMemo(() => {
    const list = projectsData?.data?.projects ?? [];
    return list.map((p) => ({
      id: p._id,
      name: p.projectName ? `${p.projectName} (${p.jobId})` : p.jobId,
    }));
  }, [projectsData?.data?.projects]);

  const vendors = useMemo(() => {
    return vendorsData?.data?.vendors ?? [];
  }, [vendorsData?.data?.vendors]);

  const carriers = useMemo(() => {
    return carriersData?.data?.carriers ?? [];
  }, [carriersData?.data?.carriers]);

  // Mutations
  const createVendorMutation = useCreateManualVendorPayableMutation();
  const createCarrierMutation = useCreateManualFreightPayableMutation();

  const isSubmitting =
    isUploadingFile ||
    createVendorMutation.isPending ||
    createCarrierMutation.isPending;

  const handleReset = () => {
    setLeadId("");
    setPayeeId("");
    setTotalAmount("");
    setCategory(isVendor ? "service" : "shipping");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setDaysToPay(30);
    setSelectedFile(null);
    setUploadProgress(null);
    setIsUploadingFile(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size exceeds 20MB limit.");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadId) {
      toast.error("Please select a project.");
      return;
    }

    if (!payeeId) {
      toast.error(`Please select a ${isVendor ? "vendor" : "carrier"}.`);
      return;
    }

    const numAmount = parseFloat(totalAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid total amount.");
      return;
    }

    try {
      let documentUrl: string | undefined = undefined;
      let documentFileName: string | undefined = undefined;

      if (selectedFile) {
        setIsUploadingFile(true);
        setUploadProgress(10);
        documentFileName = selectedFile.name;
        documentUrl = await uploadFileToS3(
          selectedFile,
          "payable-invoices",
          (progress) => setUploadProgress(progress)
        );
        setIsUploadingFile(false);
      }

      if (isVendor) {
        await createVendorMutation.mutateAsync({
          leadId,
          vendorId: payeeId,
          totalAmount: numAmount,
          category,
          description: description.trim() || undefined,
          date,
          daysToPay: Number(daysToPay) || 30,
          documentUrl,
          documentFileName,
        });
        toast.success("Vendor invoice uploaded successfully for approval!");
      } else {
        await createCarrierMutation.mutateAsync({
          leadId,
          carrierId: payeeId,
          totalAmount: numAmount,
          category,
          description: description.trim() || undefined,
          date,
          daysToPay: Number(daysToPay) || 30,
          documentUrl,
          documentFileName,
        });
        toast.success("Carrier invoice uploaded successfully for approval!");
      }

      handleReset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      setIsUploadingFile(false);
      console.error("Failed to upload payable invoice:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload payable invoice."
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleReset();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-gray-900">
              <Upload className="w-5 h-5 text-blue-600" />
              <DialogTitle>{title}</DialogTitle>
            </div>
            <DialogDescription className="text-gray-500">
              Submit a manual accounts-payable invoice. It will be added to the
              approval queue awaiting admin review.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project (Lead) <span className="text-red-500">*</span>
              </label>
              <Select value={leadId} onValueChange={setLeadId} disabled={isSubmitting}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isProjectsLoading ? "Loading projects..." : "Select project"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {projects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payee Selection (Vendor or Carrier) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isVendor ? "Vendor" : "Freight Carrier"}{" "}
                <span className="text-red-500">*</span>
              </label>
              {isVendor ? (
                <Select
                  value={payeeId}
                  onValueChange={setPayeeId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isVendorsLoading ? "Loading vendors..." : "Select vendor"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor._id} value={vendor._id}>
                        {vendor.vendorName} ({vendor.vendorCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={payeeId}
                  onValueChange={setPayeeId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isCarriersLoading
                          ? "Loading carriers..."
                          : "Select freight carrier"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier._id} value={carrier._id}>
                        {carrier.carrierName} ({carrier.carrierCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Total Amount & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-8"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {isVendor ? (
                      <>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="materials">Materials</SelectItem>
                        <SelectItem value="fabrication">Fabrication</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="shipping">Shipping</SelectItem>
                        <SelectItem value="freight">Freight</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Invoice Date & Days To Pay */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Days to Pay (Term)
                </label>
                <Select
                  value={daysToPay.toString()}
                  onValueChange={(val) => setDaysToPay(Number(val))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Days</SelectItem>
                    <SelectItem value="30">30 Days (Net 30)</SelectItem>
                    <SelectItem value="45">45 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description / Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description / Memo
              </label>
              <Textarea
                placeholder="Optional notes or PO reference..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            {/* Document Upload (PDF) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Document (PDF)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50/50"
                >
                  <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to browse or drag invoice file here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, PNG, JPG up to 20MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="text-sm text-gray-800 truncate font-medium">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-gray-500 shrink-0">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isUploadingFile && uploadProgress !== null && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-right text-gray-500">
                    Uploading document... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Uploading..." : "Submit Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

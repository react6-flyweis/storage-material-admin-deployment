import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, Link as LinkIcon, FileText } from "lucide-react";
import { uploadFileToS3 } from "@/lib/upload";
import {
  useCreateExpenseMutation,
  useExpensesFiltersQuery,
  useExpenseCategoriesQuery,
} from "@/modules/financials/financials.hooks";

const addExpenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  leadId: z.string().optional(),
  buildingLabel: z.string().optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  status: z.string().default("paid"),
  receiptFile: z.string().optional(),
});


export type AddExpenseFormValues = z.infer<typeof addExpenseSchema>;

type AddExpenseDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const paymentMethodOptions = [
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Cash", value: "cash" },
  { label: "Cheque", value: "cheque" },
  { label: "Card", value: "card" },
];

const statusOptions = [
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
];

export function AddExpenseDialog({
  open,
  onClose,
  onSuccess,
}: AddExpenseDialogProps) {
  const { data: filtersRes } = useExpensesFiltersQuery();
  const { data: categoriesRes } = useExpenseCategoriesQuery();

  const createExpenseMutation = useCreateExpenseMutation();

  const [receiptMode, setReceiptMode] = useState<"upload" | "url">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const projects = filtersRes?.data?.projects || [];
  const filterBuildingLabels = filtersRes?.data?.buildingLabels || [];
  const apiCategories = categoriesRes?.data?.categories || [];

  const categoryOptions =
    apiCategories.length > 0
      ? apiCategories.map((c) => c.name)
      : filtersRes?.data?.categories || [
        "Vendor/Freight",
        "Manual (Operations)",
        "Miscellaneous",
        "Salaries",
        "Marketing",
      ];

  const subcategoryOptions = [
    "Steel Delivery",
    "Freight",
    "Vendor",
    "Operations",
    "Miscellaneous",
    "Salary",
    "Marketing",
  ];

  const buildingOptions =
    filterBuildingLabels.length > 0
      ? filterBuildingLabels
      : ["Building A", "Building B", "Building C"];

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddExpenseFormValues>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      category: "Vendor/Freight",
      subcategory: "Steel Delivery",
      paymentMethod: "bank_transfer",
      amount: 10000,
      date: new Date().toISOString().split("T")[0],
      description: "Freight charges",
      status: "paid",
      buildingLabel: "Building A",
    },
  });

  const handleCancel = () => {
    reset();
    setSelectedFile(null);
    setUploadedUrl(null);
    setUploadError(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadedUrl(null);
      setUploadError(null);
    }
  };


  const onSubmit = async (data: AddExpenseFormValues) => {
    setUploadError(null);
    let finalReceiptUrl = receiptMode === "upload" ? (uploadedUrl || data.receiptFile) : data.receiptFile;

    if (receiptMode === "upload" && selectedFile && !uploadedUrl) {
      setIsUploading(true);
      try {
        finalReceiptUrl = await uploadFileToS3(selectedFile, "expenses");
        setUploadedUrl(finalReceiptUrl);
        setValue("receiptFile", finalReceiptUrl);
      } catch (err) {
        console.error("Failed to upload receipt file:", err);
        setUploadError("Failed to upload file. Please try again or provide a direct URL.");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    try {
      await createExpenseMutation.mutateAsync({
        category: data.category,
        subcategory: data.subcategory,
        date: data.date,
        amount: Number(data.amount),
        description: data.description || "",
        leadId: data.leadId === "none" || !data.leadId ? undefined : data.leadId,
        buildingLabel: data.buildingLabel === "none" || !data.buildingLabel ? undefined : data.buildingLabel,
        paymentMethod: data.paymentMethod,
        status: data.status || "paid",
        receiptFile: finalReceiptUrl || undefined,
      });
      onSuccess?.();
      reset();
      setSelectedFile(null);
      setUploadedUrl(null);
      onClose();
    } catch (error) {
      console.error("Failed to create expense:", error);
    }
  };


  const isSubmitting = createExpenseMutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleCancel()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto gap-0 p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-lg">Add Expense entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Sub Category</Label>
              <Controller
                control={control}
                name="subcategory"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sub category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subcategory && (
                <p className="text-sm text-red-500">
                  {errors.subcategory.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Project (Optional)</Label>
              <Controller
                control={control}
                name="leadId"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map((proj) => (
                        <SelectItem key={proj.leadId} value={proj.leadId}>
                          {proj.projectName} ({proj.jobId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.leadId && (
                <p className="text-sm text-red-500">{errors.leadId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Building (Optional)</Label>
              <Controller
                control={control}
                name="buildingLabel"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {buildingOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.buildingLabel && (
                <p className="text-sm text-red-500">
                  {errors.buildingLabel.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentMethod && (
                <p className="text-sm text-red-500">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-500">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-sm text-red-500">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Enter description"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Receipt Attachment Section (Upload or Direct URL) */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Receipt Document (Optional)</Label>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptMode("upload");
                      setUploadError(null);
                    }}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${receiptMode === "upload"
                      ? "bg-violet-100 text-violet-700"
                      : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    Upload File
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptMode("url");
                      setUploadError(null);
                    }}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${receiptMode === "url"
                      ? "bg-violet-100 text-violet-700"
                      : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    Enter URL
                  </button>
                </div>
              </div>

              {receiptMode === "upload" ? (
                <div className="space-y-2">
                  <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50 transition-colors sm:flex-row sm:items-center sm:justify-between">
                    <input
                      id="receiptFileInput"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!selectedFile ? (
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="receiptFileInput"
                          className="flex cursor-pointer items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-100"
                        >
                          <Upload className="mr-2 h-4 w-4 text-violet-600" />
                          Choose File
                        </label>
                        <span className="text-xs text-slate-500">
                          No file chosen (PDF, PNG, JPG)
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-5 w-5 flex-shrink-0 text-violet-600" />
                          <div className="flex flex-col truncate">
                            <span className="text-sm font-medium text-slate-800 truncate">
                              {selectedFile.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {uploadedUrl ? (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Uploaded ✓
                            </span>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              className="bg-violet-600 text-white hover:bg-violet-700 h-8 text-xs"
                              onClick={async () => {
                                setUploadError(null);
                                setIsUploading(true);
                                try {
                                  const url = await uploadFileToS3(selectedFile, "expenses");
                                  setUploadedUrl(url);
                                  setValue("receiptFile", url);
                                } catch (err) {
                                  console.error(err);
                                  setUploadError("Failed to upload file.");
                                } finally {
                                  setIsUploading(false);
                                }
                              }}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                              ) : (
                                <Upload className="h-3.5 w-3.5 mr-1" />
                              )}
                              Upload
                            </Button>
                          )}

                          <label
                            htmlFor="receiptFileInput"
                            className="flex cursor-pointer items-center justify-center rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-100"
                          >
                            Replace
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="receiptFile"
                    type="text"
                    className="pl-9"
                    placeholder="https://..."
                    {...register("receiptFile")}
                  />
                </div>
              )}


              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}
              {errors.receiptFile && (
                <p className="text-sm text-red-500">
                  {errors.receiptFile.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="px-8" size="lg" disabled={isSubmitting}>
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading File...</span>
                </div>
              ) : createExpenseMutation.isPending ? (
                "Adding..."
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



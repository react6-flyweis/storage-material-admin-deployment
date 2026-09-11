/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Package,
  Ruler,
  Clock,
  Paperclip,
  MapPin,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { UploadFileDialog } from "@/components/upload-file-dialog";
import { useUpdateDeliveryDetailsMutation } from "@/modules/plant/freight.hooks";
import { type DeliveryDetails } from "@/modules/plant/freight.api";

export const parseDimensions = (input: string) => {
  const parts = input.replace(/['"]/g, "").split(/x/i);
  if (parts.length === 3) {
    const lengthFeet = parseFloat(parts[0].trim());
    const widthFeet = parseFloat(parts[1].trim());
    const heightFeet = parseFloat(parts[2].trim());
    if (!isNaN(lengthFeet) && !isNaN(widthFeet) && !isNaN(heightFeet)) {
      return { lengthFeet, widthFeet, heightFeet };
    }
  }
  return { lengthFeet: 0, widthFeet: 0, heightFeet: 0 };
};

export const getLocalTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getMinDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export const freightFormSchema = z.object({
  description: z.string().default("Project outbound freight"),
  loadDescription: z.string().trim().min(1, "Load description is required"),
  weight: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ error: "Weight must be a number" }).positive("Weight must be a positive number")
  ),
  weightUnit: z.string().default("Lbs"),
  dimensionsInput: z.string().trim().refine(
    (val) => {
      if (!val) return true;
      const parts = val.replace(/['"]/g, "").split(/x/i);
      if (parts.length !== 3) return false;
      return parts.every(part => {
        const num = parseFloat(part.trim());
        return !isNaN(num) && num > 0;
      });
    },
    { message: "Dimensions must be in format: Length' x Width' x Height' (e.g. 51' x 8.5' x 8')" }
  ).optional().or(z.literal("")),
  metalType: z.string().trim().min(1, "Material type is required"),
  packageCount: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ error: "Package count must be a number" })
      .int("Package count must be an integer")
      .positive("Package count must be a positive number")
  ),
  loadingEquipment: z.array(z.string()).default(["Crane"]),
  bidDeadline: z.string().min(1, "Bid deadline is required"),
  pickupLocation: z.string().trim().min(1, "Pickup location is required"),
  deliveryLocation: z.string().trim().min(1, "Delivery location is required"),
  pickupDate: z.string().min(1, "Pickup date is required").refine(
    (val) => !val || val >= getLocalTodayString(),
    { message: "Pickup date must be today or in the future" }
  ),
  pickupTime: z.string().optional().or(z.literal("")),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliveryTime: z.string().optional().or(z.literal("")),
  receivingPoc: z.string().trim().min(1, "Receiving POC is required"),
  pickupContactPhone: z.string().trim().min(1, "Pickup contact phone is required").refine(
    (val) => {
      const normalized = val.replace(/[\s()-]/g, "");
      return /^\+?\d{7,15}$/.test(normalized);
    },
    { message: "Enter a valid phone number" }
  ),
  specialRequirements: z.string().optional().or(z.literal("")),
  additionalNotes: z.string().optional().or(z.literal("")),
}).refine(
  (data) => {
    if (!data.pickupDate || !data.deliveryDate) return true;
    return data.deliveryDate >= data.pickupDate;
  },
  {
    message: "Delivery date must be greater than or equal to pickup date",
    path: ["deliveryDate"],
  }
);

export type FreightFormValues = z.infer<typeof freightFormSchema>;

interface EditDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryId: string;
  delivery: DeliveryDetails;
  onSaveSuccess: () => void;
}

const CardHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconBgColor: string;
  iconColor: string;
}> = ({ icon, title, subtitle, iconBgColor, iconColor }) => {
  return (
    <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
      <div className={`w-10 h-10 rounded-full ${iconBgColor} ${iconColor} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#212B36]">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
};

interface LocationSelectorProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  placeholder: string;
  required?: boolean;
  error?: string;
  iconColor?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  label,
  placeholder,
  required,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-inter font-semibold text-[#212B36]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <MapPin size={18} />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-xl text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

const EditDeliveryModal: React.FC<EditDeliveryModalProps> = ({
  isOpen,
  onClose,
  deliveryId,
  delivery,
  onSaveSuccess,
}) => {
  const { mutateAsync: updateDeliveryDetails, isPending: isLoading } = useUpdateDeliveryDetailsMutation();
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string }[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(freightFormSchema),
    defaultValues: {
      description: "Project outbound freight",
      loadDescription: "",
      weight: undefined,
      weightUnit: "Lbs",
      dimensionsInput: "",
      metalType: "",
      packageCount: undefined,
      loadingEquipment: ["Crane"],
      bidDeadline: "",
      pickupLocation: "",
      deliveryLocation: "",
      pickupDate: "",
      pickupTime: "",
      deliveryDate: "",
      deliveryTime: "",
      receivingPoc: "",
      pickupContactPhone: "",
      specialRequirements: "",
      additionalNotes: "",
    },
  });

  const pickupDateValue = watch("pickupDate");

  useEffect(() => {
    if (isOpen && delivery) {
      // Parse dimensions if nested
      let dimensionsStr = "";
      if (delivery.formDetails?.dimensions) {
        dimensionsStr = `${delivery.formDetails.dimensions.lengthFeet || 0}' x ${delivery.formDetails.dimensions.widthFeet || 0}' x ${delivery.formDetails.dimensions.heightFeet || 0}'`;
      }

      const weightVal = delivery.formDetails?.loadWeight || undefined;
      const pkgCount = delivery.formDetails?.packageCount || undefined;

      const pickupDateStr = delivery.formDetails?.pickupDate
        ? new Date(delivery.formDetails.pickupDate).toISOString().split("T")[0]
        : "";

      const deliveryDateStr = delivery.formDetails?.deliveryDate
        ? new Date(delivery.formDetails.deliveryDate).toISOString().split("T")[0]
        : delivery.deliverySchedule?.deliveryDate
          ? new Date(delivery.deliverySchedule.deliveryDate).toISOString().split("T")[0]
          : "";

      const deadlineStr = delivery.formDetails?.bidDeadline
        ? new Date(delivery.formDetails.bidDeadline).toISOString().slice(0, 16)
        : "";

      const pickupTimeStr = delivery.formDetails?.pickupTime ||
        delivery.formDetails?.timeWindowStart ||
        (delivery.formDetails?.timings || delivery.formDetails?.deliveryTime || delivery.deliverySchedule?.timeWindow || "").split(/\s*[-–]\s*/)[0] ||
        "";

      const deliveryTimeStr = delivery.formDetails?.deliveryTime ||
        delivery.formDetails?.timeWindowEnd ||
        (delivery.formDetails?.timings || delivery.formDetails?.deliveryTime || delivery.deliverySchedule?.timeWindow || "").split(/\s*[-–]\s*/)[1] ||
        "";

      reset({
        description: delivery.formDetails?.description || "Project outbound freight",
        loadDescription: delivery.formDetails?.loadDescription || "",
        weight: weightVal,
        weightUnit: "Lbs",
        dimensionsInput: dimensionsStr,
        metalType: delivery.formDetails?.materialType || "",
        packageCount: pkgCount,
        loadingEquipment: delivery.formDetails?.loadingEquipment || ["Crane"],
        bidDeadline: deadlineStr,
        pickupLocation: delivery.formDetails?.pickupLocation || "",
        deliveryLocation: delivery.formDetails?.deliveryLocation || "",
        pickupDate: pickupDateStr,
        pickupTime: pickupTimeStr,
        deliveryDate: deliveryDateStr,
        deliveryTime: deliveryTimeStr,
        receivingPoc: delivery.formDetails?.receivingPoc || "",
        pickupContactPhone: delivery.formDetails?.pickupContactPhone || "",
        specialRequirements: delivery.formDetails?.specialRequirements || "",
        additionalNotes: delivery.formDetails?.additionalNotes || "",
      });

      const docUrl = delivery.formDetails?.documentUrl;
      const expectedFile = docUrl ? [{ url: docUrl, name: docUrl.split("/").pop() || "document.pdf" }] : [];
      setTimeout(() => {
        setUploadedFiles(expectedFile);
        setErrorMsg("");
      }, 0);
    }
  }, [isOpen, delivery, reset]);

  if (!isOpen) return null;

  const handleSave = async (values: FreightFormValues) => {
    setErrorMsg("");
    try {
      const payload = {
        description: values.description,
        loadDescription: values.loadDescription,
        weight: values.weight,
        dimensions: parseDimensions(values.dimensionsInput || ""),
        metalType: values.metalType,
        packageCount: values.packageCount,
        loadingEquipment: values.loadingEquipment,
        bidDeadline: values.bidDeadline ? new Date(values.bidDeadline).toISOString() : "",
        documentUrl: uploadedFiles[0]?.url || "",
        pickupLocation: values.pickupLocation,
        pickupLocationData: {
          address: values.pickupLocation,
          coordinates: delivery?.formDetails?.pickupLocationData?.coordinates || { lat: 0, lng: 0 },
        },
        deliveryLocation: values.deliveryLocation,
        deliveryLocationData: {
          address: values.deliveryLocation,
          coordinates: delivery?.formDetails?.deliveryLocationData?.coordinates || { lat: 0, lng: 0 },
        },
        pickupDate: values.pickupDate ? new Date(values.pickupDate + "T00:00:00Z").toISOString() : "",
        pickupTime: values.pickupTime || undefined,
        deliveryDate: values.deliveryDate ? new Date(values.deliveryDate + "T00:00:00Z").toISOString() : "",
        deliveryTime: values.deliveryTime || undefined,
        timeWindowStart: values.pickupTime || undefined,
        timeWindowEnd: values.deliveryTime || undefined,
        timings: values.pickupTime && values.deliveryTime ? `${values.pickupTime} - ${values.deliveryTime}` : undefined,
        receivingPoc: values.receivingPoc,
        pickupContactPhone: values.pickupContactPhone,
        specialRequirements: values.specialRequirements || undefined,
        additionalNotes: values.additionalNotes || undefined,
      };

      await updateDeliveryDetails({
        deliveryId,
        body: payload,
      });

      onSaveSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const apiError = err as { response?: { data?: { message?: string } } };
      setErrorMsg(apiError?.response?.data?.message || "Failed to update delivery details. Please try again.");
    }
  };

  const materialOptions = [
    { label: "Steel & Metal", value: "Steel & Metal" },
    ...(delivery?.formDetails?.materialType && delivery.formDetails.materialType !== "Steel & Metal"
      ? [{ label: delivery.formDetails.materialType, value: delivery.formDetails.materialType }]
      : []),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader width="max-w-[800px]">
      <div className="space-y-6 font-inter ">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-[#212B36]">Edit Delivery Details</h2>
            <p className="text-sm text-[#637381]">Modify parameters for delivery #{delivery?.deliveryNumber || deliveryId}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Load Details Card */}
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 md:p-6 space-y-8">
            <CardHeader
              icon={<Package />}
              title="Load Details"
              subtitle="Describe what needs to be transported"
              iconBgColor="bg-[#FFF4E5]"
              iconColor="text-[#FFAB00]"
            />

            <div className="space-y-6">
              <Controller
                control={control}
                name="loadDescription"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-semibold text-[#212B36]">
                      Load Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...field}
                      className="w-full px-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                    />
                    {errors.loadDescription?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.loadDescription.message as string}</p>
                    )}
                  </div>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-inter font-semibold text-[#212B36]">
                    Weight <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Package size={18} />
                      </span>
                      <Controller
                        control={control}
                        name="weight"
                        render={({ field }) => (
                          <input
                            type="number"
                            {...field}
                            value={(field.value as string | number) ?? ""}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-xl text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                          />
                        )}
                      />
                    </div>
                    <div className="w-24">
                      <Controller
                        control={control}
                        name="weightUnit"
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full px-3 py-3 bg-white border border-[#E2E4E6] rounded-xl text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                          >
                            <option value="Lbs">Lbs</option>
                            <option value="Kg">Kg</option>
                          </select>
                        )}
                      />
                    </div>
                  </div>
                  {errors.weight?.message && (
                    <p className="text-xs text-red-500 mt-1">{errors.weight.message as string}</p>
                  )}
                </div>

                <Controller
                  control={control}
                  name="dimensionsInput"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-inter font-semibold text-[#212B36]">
                        Dimensions
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Ruler size={18} />
                        </span>
                        <input
                          type="text"
                          {...field}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-xl text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                        />
                      </div>
                      {errors.dimensionsInput?.message && (
                        <p className="text-xs text-red-500 mt-1">{errors.dimensionsInput.message as string}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="metalType"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-semibold text-[#212B36]">
                      Material Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...field}
                      className="w-full px-4 py-3 bg-white border border-[#E2E4E6] rounded-xl text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                    >
                      {materialOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.metalType?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.metalType.message as string}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="packageCount"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-semibold text-[#212B36]">
                      Pallet / Package Count <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...field}
                      value={(field.value as string | number) ?? ""}
                      placeholder="e.g., 18"
                      className="w-full px-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                    />
                    {errors.packageCount?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.packageCount.message as string}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="loadingEquipment"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-semibold text-[#212B36]">
                      Loading Equipment
                    </label>
                    <select
                      value={field.value?.[0] || "Crane"}
                      onChange={(e) => field.onChange([e.target.value])}
                      className="w-full px-4 py-3 bg-white border border-[#E2E4E6] rounded-xl text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                    >
                      <option value="Crane">Crane</option>
                      <option value="Forklift">Forklift</option>
                    </select>
                    {errors.loadingEquipment?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.loadingEquipment.message as string}</p>
                    )}
                  </div>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  control={control}
                  name="bidDeadline"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-inter font-semibold text-[#212B36]">
                        Bid Deadline <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-2">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Clock size={18} />
                        </span>
                        <input
                          type="datetime-local"
                          min={getMinDateTime()}
                          {...field}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-sm font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                        />
                      </div>
                      {errors.bidDeadline?.message && (
                        <p className="text-xs text-red-500 mt-1">{errors.bidDeadline.message as string}</p>
                      )}
                    </div>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-inter font-semibold text-[#212B36]">
                    Document Upload
                  </label>
                  {uploadedFiles.length === 0 ? (
                    <div
                      className="relative mt-2 cursor-pointer"
                      onClick={() => setIsUploadOpen(true)}
                    >
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Paperclip size={18} />
                      </span>
                      <input
                        type="text"
                        readOnly
                        placeholder="Upload PDF Documents"
                        value=""
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-sm font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE] text-gray-400 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-inter">
                          <span className="text-[#212B36] truncate max-w-[80%] font-medium">{file.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-red-500 hover:text-red-700 font-semibold text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <UploadFileDialog
                    open={isUploadOpen}
                    onOpenChange={setIsUploadOpen}
                    title="Upload Documents"
                    description="Upload PDF documents for this freight request."
                    supportText="Only support .pdf files"
                    accept=".pdf"
                    onUploadComplete={(files) => {
                      setUploadedFiles((prev) => [...prev, ...files]);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Locations Card */}
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 md:p-6 space-y-8">
            <CardHeader
              icon={<MapPin size={24} />}
              title="Locations"
              subtitle="Pickup and delivery addresses"
              iconBgColor="bg-[#E8F1FF]"
              iconColor="text-[#1E51A4]"
            />

            <div className="space-y-6">
              <Controller
                control={control}
                name="pickupLocation"
                render={({ field }) => (
                  <LocationSelector
                    {...field}
                    label="Pickup Location"
                    placeholder="e.g., Steel Mill, Pittsburgh, PA"
                    required
                    error={errors.pickupLocation?.message as string}
                    iconColor="text-[#22C55E]"
                  />
                )}
              />

              <Controller
                control={control}
                name="deliveryLocation"
                render={({ field }) => (
                  <LocationSelector
                    {...field}
                    label="Delivery Location"
                    placeholder="e.g., Construction Site, Austin, TX"
                    required
                    error={errors.deliveryLocation?.message as string}
                    iconColor="text-[#EF4444]"
                  />
                )}
              />
            </div>
          </div>

          {/* Timing Card */}
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 md:p-6 space-y-8">
            <CardHeader
              icon={<Calendar />}
              title="Timing"
              subtitle="Pickup and delivery schedule"
              iconBgColor="bg-[#E8F5E9]"
              iconColor="text-[#2E7D32]"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Controller
                control={control}
                name="pickupDate"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-bold text-[#212B36]">
                      Pickup Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Calendar size={18} />
                      </span>
                      <input
                        type="date"
                        {...field}
                        min={getLocalTodayString()}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                      />
                    </div>
                    {errors.pickupDate?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.pickupDate.message as string}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="pickupTime"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-bold text-[#212B36]">
                      Pickup Time
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Clock size={18} />
                      </span>
                      <input
                        type="time"
                        {...field}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                      />
                    </div>
                    {errors.pickupTime?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.pickupTime.message as string}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="deliveryDate"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-bold text-[#212B36]">
                      Delivery Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Calendar size={18} />
                      </span>
                      <input
                        type="date"
                        {...field}
                        min={pickupDateValue || getLocalTodayString()}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                      />
                    </div>
                    {errors.deliveryDate?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.deliveryDate.message as string}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="deliveryTime"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-bold text-[#212B36]">
                      Delivery Time
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Clock size={18} />
                      </span>
                      <input
                        type="time"
                        {...field}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                      />
                    </div>
                    {errors.deliveryTime?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.deliveryTime.message as string}</p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Coordination Card */}
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 md:p-6 space-y-8">
            <CardHeader
              icon={<User />}
              title="Coordination"
              subtitle="Contact and special requirements"
              iconBgColor="bg-[#F3E5F5]"
              iconColor="text-[#9C27B0]"
            />

            <div className="space-y-4">
              <Controller
                control={control}
                name="receivingPoc"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-bold text-[#212B36]">
                      Receiving POC <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#919EAB]">
                        <User size={20} />
                      </span>
                      <input
                        type="text"
                        {...field}
                        placeholder="Full name of on-site contact"
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-base font-inter focus:outline-none"
                      />
                    </div>
                    {errors.receivingPoc?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.receivingPoc.message as string}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="pickupContactPhone"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-semibold text-[#212B36]">
                      Pickup Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#919EAB]">
                        <User size={20} />
                      </span>
                      <input
                        type="text"
                        {...field}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-base font-inter focus:outline-none"
                      />
                    </div>
                    {errors.pickupContactPhone?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.pickupContactPhone.message as string}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="specialRequirements"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-semibold text-[#212B36]">
                      Special Requirements
                    </label>
                    <textarea
                      {...field}
                      placeholder="e.g., Crane unloading required, liftgate needed, fragile..."
                      className="w-full px-4 py-3 bg-white border border-[#E2E4E6] rounded-md mt-2 text-base font-inter focus:outline-none"
                    />
                    {errors.specialRequirements?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.specialRequirements.message as string}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="additionalNotes"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-semibold text-[#212B36]">
                      Additional Notes
                    </label>
                    <div className="relative mt-2">
                      <span className="absolute left-4 top-4 text-[#919EAB]">
                        <FileText size={20} />
                      </span>
                      <textarea
                        {...field}
                        placeholder="Any other information for carriers..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-[#E2E4E6] rounded-md text-base font-inter focus:outline-none"
                      />
                    </div>
                    {errors.additionalNotes?.message && (
                      <p className="text-xs text-red-500 mt-1">{errors.additionalNotes.message as string}</p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit(handleSave)} disabled={isLoading}>
            {isLoading ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditDeliveryModal;

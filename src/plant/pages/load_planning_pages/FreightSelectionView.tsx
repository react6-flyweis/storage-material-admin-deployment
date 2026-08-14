import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
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
  Truck,
  SlidersHorizontal,
  Check,
  DollarSign,
  Plus,
  Send,
} from "lucide-react";
import LoadPlanningHeader from "./LoadPlanningHeader";
import CarrierFilterModal from "@/plant/components/modals/CarrierFilterModal";
import FreightReviewModal, { type FreightFormData } from "@/plant/components/modals/FreightReviewModal";
import SuccessModal from "@/plant/components/common_component/SuccessModal";
import Button from "@/plant/components/common_component/Button";
import CommonDropdown from "@/plant/components/common_component/CommonDropdown";
import CardHeader from "@/plant/components/common_component/CardHeader";
import LocationSelector from "@/plant/components/common_component/LocationSelector";
import { UploadModal } from "@/plant/pages/modals/ProjectUploadModals";
import { useGetFreightAutofillQuery } from "@/modules/plant/load-planning.hooks";
import { type FreightAutofillData } from "@/modules/plant/load-planning.api";
import { usePlantCarriersQuery } from "@/modules/plant/carrier.hooks";
import {
  useCreatePlantDeliveryMutation,
  useSendFreightBidsMutation,
  useProjectDeliveryQuery,
} from "@/modules/plant/freight.hooks";
import type { ProjectDeliveryItem } from "@/modules/plant/freight.api";


const parseDimensions = (input: string) => {
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

const getLocalTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatStatusText = (status: string) => {
  if (!status) return "";
  return status
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const freightFormSchema = z
  .object({
    description: z.string().default("Project outbound freight"),
    loadDescription: z.string().trim().min(1, "Load description is required"),
    weight: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z.number({ message: "Weight must be a number" }).positive("Weight must be a positive number")
    ),
    weightUnit: z.string().default("Lbs"),
    dimensionsInput: z
      .string()
      .trim()
      .refine(
        (val) => {
          if (!val) return true;
          const parts = val.replace(/['"]/g, "").split(/x/i);
          if (parts.length !== 3) return false;
          return parts.every((part) => {
            const num = parseFloat(part.trim());
            return !isNaN(num) && num > 0;
          });
        },
        { message: "Dimensions must be in format: Length' x Width' x Height' (e.g. 51' x 8.5' x 8')" }
      )
      .optional()
      .or(z.literal("")),
    metalType: z.string().trim().min(1, "Material type is required"),
    packageCount: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z
        .number({ message: "Package count must be a number" })
        .int("Package count must be an integer")
        .positive("Package count must be a positive number")
    ),
    loadingEquipment: z.array(z.string()).default(["Crane"]),
    bidDeadline: z.string().min(1, "Bid deadline is required"),
    pickupLocation: z.string().trim().min(1, "Pickup location is required"),
    deliveryLocation: z.string().trim().min(1, "Delivery location is required"),
    pickupDate: z
      .string()
      .min(1, "Pickup date is required")
      .refine((val) => !val || val >= getLocalTodayString(), {
        message: "Pickup date must be today or in the future",
      }),
    pickupTime: z.string().optional().or(z.literal("")),
    deliveryDate: z.string().min(1, "Delivery date is required"),
    deliveryTime: z.string().optional().or(z.literal("")),
    receivingPoc: z.string().trim().min(1, "Receiving POC is required"),
    pickupContactPhone: z
      .string()
      .trim()
      .min(1, "Pickup contact phone is required")
      .refine(
        (val) => {
          const normalized = val.replace(/[\s()-]/g, "");
          return /^\+?\d{7,15}$/.test(normalized);
        },
        { message: "Enter a valid phone number" }
      ),
    specialRequirements: z.string().optional().or(z.literal("")),
    additionalNotes: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.pickupDate || !data.deliveryDate) return true;
      return data.deliveryDate >= data.pickupDate;
    },
    {
      message: "Delivery date must be greater than or equal to pickup date",
      path: ["deliveryDate"],
    }
  );

type FreightFormValues = z.infer<typeof freightFormSchema>;

interface DeliveryItem {
  _id: string;
  status: string;
  deliveryNumber?: string;
  requestId?: string;
  deliveryLocation?: string;
  deliveryDate?: string;
  weight?: number;
  loadWeight?: number;
  loadSize?: {
    weight?: number;
    dimensions?: {
      lengthFeet?: number;
      widthFeet?: number;
      heightFeet?: number;
    };
    packageCount?: number;
  };
  dimensions?: {
    lengthFeet?: number;
    widthFeet?: number;
    heightFeet?: number;
  };
  description?: string;
  loadDescription?: string;
  weightUnit?: string;
  metalType?: string;
  materialType?: string;
  packageCount?: number;
  loadingEquipment?: string[];
  equipment?: string[];
  bidDeadline?: string;
  pickupLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  deliveryTime?: string;
  receivingPoc?: string;
  poc?: {
    receivingPoc?: string;
    pickupContactPhone?: string;
  };
  pickupContactPhone?: string;
  specialRequirements?: string;
  additionalNotes?: string;
  remarks?: string;
  documentUrl?: string;
}

const FreightSelectionView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: autofillRes, isLoading } = useGetFreightAutofillQuery(
    projectId || "",
    { skip: !projectId }
  );
  const autofillData: FreightAutofillData | undefined = autofillRes;

  const { data: carriersRes, isLoading: isLoadingCarriers } = usePlantCarriersQuery({ limit: 100 });
  const carriersList = carriersRes?.data?.carriers || [];

  const { data: projectDeliveryRes } = useProjectDeliveryQuery(projectId || "", { enabled: !!projectId });

  const deliveriesList: DeliveryItem[] = (
    projectDeliveryRes?.requests ||
    projectDeliveryRes?.data?.requests ||
    []
  ).map((item: ProjectDeliveryItem) => ({
    _id: item.deliveryId || item.requestId,
    requestId: item.requestId,
    deliveryNumber: item.deliveryId || item.requestId,
    status: item.status,
    description: item.description,
    pickupLocation: item.pickupLocation,
    deliveryLocation: item.deliveryLocation,
    pickupDate: item.pickupDate,
    deliveryDate: item.deliveryDate,
    weight: item.loadWeight,
    loadWeight: item.loadWeight,
  }));

  const [createDelivery, { isLoading: isCreating }] = useCreatePlantDeliveryMutation();
  const [sendFreightBids, { isLoading: isSendingBids }] = useSendFreightBidsMutation();

  const isSubmitting = isCreating || isSendingBids;

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedCarrierIds, setSelectedCarrierIds] = useState<string[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [selectedType, setSelectedType] = useState<"existing" | "new" | null>("new");
  const [savedDeliveryId, setSavedDeliveryId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stagedFormData, setStagedFormData] = useState<FreightFormData | null>(null);

  const hasDeliveries = deliveriesList.length > 0;
  const activeFreightDeliveries = deliveriesList.filter((d) => {
    const norm = (d.status || "").toLowerCase().replace(/[\s_-]+/g, "");
    return ["confirmed", "delivered", "intransit", "scheduled", "carrierselected", "biddingsent"].includes(norm);
  });
  const hasActiveFreight = activeFreightDeliveries.length > 0;
  const hasActiveDelivery = hasActiveFreight;
  const getFreightFormDefaults = (data?: FreightAutofillData): FreightFormValues => ({
    description: "Project outbound freight",
    loadDescription: data?.loadDescription || data?.summary?.loadDescription || "",
    weight: data?.weight || data?.totalWeight || data?.summary?.totalWeight || undefined,
    weightUnit: "Lbs",
    dimensionsInput: data?.dimensions
      ? `${data.dimensions.lengthFeet}' x ${data.dimensions.widthFeet}' x ${data.dimensions.heightFeet}'`
      : data?.summary?.dimensionsText || "",
    metalType: data?.metalType || data?.materialType || data?.summary?.materialType || "",
    packageCount: data?.packageCount || data?.totalBundles || data?.summary?.packageCount || undefined,
    loadingEquipment: ["Crane"],
    bidDeadline: "",
    pickupLocation: data?.pickupLocation || data?.summary?.suggestedPickupLocation || "",
    deliveryLocation: data?.deliveryLocation || data?.summary?.suggestedDeliveryLocation || "",
    pickupDate: "",
    pickupTime: "",
    deliveryDate: "",
    deliveryTime: "",
    receivingPoc: data?.receivingPoc || data?.summary?.receivingPoc || "",
    pickupContactPhone: data?.pickupContactPhone || data?.summary?.pickupContactPhone || "",
    specialRequirements: "",
    additionalNotes: "",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(freightFormSchema),
    defaultValues: getFreightFormDefaults(autofillData),
  });

  const handleCreateNewDelivery = () => {
    if (selectedType === "new") {
      setSelectedType(null);
      setShowForm(false);
    } else {
      setSelectedType("new");
      setSavedDeliveryId(null);
      setShowForm(true);
      reset(getFreightFormDefaults(autofillData));
      setUploadedFiles([]);
    }
  };

  useEffect(() => {
    if (hasActiveDelivery && selectedType === "new") {
      setSelectedType("existing");
      if (deliveriesList.length > 0) {
        handleSelectDelivery(deliveriesList[0]);
      }
    }
  }, [hasActiveDelivery, deliveriesList]);

  useEffect(() => {
    if (autofillData && selectedType === "new" && !savedDeliveryId) {
      reset(getFreightFormDefaults(autofillData));
    }
  }, [autofillData, reset, selectedType, savedDeliveryId]);

  const pickupDateValue = watch("pickupDate");

  const handleSelectDelivery = (delivery: DeliveryItem) => {
    setSavedDeliveryId(delivery._id);
    setSelectedType("existing");
    setShowForm(false);

    let dimensionsStr = "";
    if (delivery.dimensions) {
      dimensionsStr = `${delivery.dimensions.lengthFeet || 0}' x ${delivery.dimensions.widthFeet || 0}' x ${delivery.dimensions.heightFeet || 0}'`;
    } else if (delivery.loadSize?.dimensions) {
      dimensionsStr = `${delivery.loadSize.dimensions.lengthFeet || 0}' x ${delivery.loadSize.dimensions.widthFeet || 0}' x ${delivery.loadSize.dimensions.heightFeet || 0}'`;
    }

    const weightVal = delivery.weight || delivery.loadWeight || delivery.loadSize?.weight || undefined;
    const pkgCount = delivery.packageCount || delivery.loadSize?.packageCount || undefined;

    reset({
      description: delivery.description || "Project outbound freight",
      loadDescription: delivery.loadDescription || delivery.description || "",
      weight: weightVal,
      weightUnit: delivery.weightUnit || "Lbs",
      dimensionsInput: dimensionsStr,
      metalType: delivery.metalType || delivery.materialType || "",
      packageCount: pkgCount,
      loadingEquipment: delivery.loadingEquipment || delivery.equipment || ["Crane"],
      bidDeadline: delivery.bidDeadline ? new Date(delivery.bidDeadline).toISOString().slice(0, 16) : "",
      pickupLocation: delivery.pickupLocation || "",
      deliveryLocation: delivery.deliveryLocation || "",
      pickupDate: delivery.pickupDate ? new Date(delivery.pickupDate).toISOString().split("T")[0] : "",
      pickupTime: delivery.pickupTime || "",
      deliveryDate: delivery.deliveryDate ? new Date(delivery.deliveryDate).toISOString().split("T")[0] : "",
      deliveryTime: delivery.deliveryTime || "",
      receivingPoc: delivery.receivingPoc || delivery.poc?.receivingPoc || "",
      pickupContactPhone: delivery.pickupContactPhone || delivery.poc?.pickupContactPhone || "",
      specialRequirements: delivery.specialRequirements || "",
      additionalNotes: delivery.additionalNotes || delivery.remarks || "",
    });

    if (delivery.documentUrl) {
      setUploadedFiles([{ url: delivery.documentUrl, name: delivery.documentUrl.split("/").pop() || "document.pdf" }]);
    } else {
      setUploadedFiles([]);
    }
  };

  const materialOptions = [
    { label: "Steel & Metal", value: "Steel & Metal" },
    ...(autofillData?.metalType && autofillData.metalType !== "Steel & Metal"
      ? [{ label: autofillData.metalType, value: autofillData.metalType }]
      : autofillData?.materialType && autofillData.materialType !== "Steel & Metal"
        ? [{ label: autofillData.materialType, value: autofillData.materialType }]
        : []),
  ];

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSendBidsDirectly = async (deliveryId: string, bidDeadline?: string) => {
    setSubmitError(null);
    try {
      const carrierIds = selectedCarrierIds.length > 0
        ? selectedCarrierIds
        : carriersList.map((c) => c._id);

      const formattedDeadline = bidDeadline ? new Date(bidDeadline).toISOString() : undefined;

      await sendFreightBids({
        deliveryId,
        carrierIds,
        bidDeadline: formattedDeadline,
      }).unwrap();

      navigate(`/plant/freight-request-details/${deliveryId}`);
    } catch (err: any) {
      console.error("Failed to send freight bids:", err);
      const errMsg = err?.data?.message || err?.message || "Failed to send freight request. Please try again.";
      setSubmitError(errMsg);
    }
  };

  const onFormSubmitValid = (data: FreightFormValues) => {
    const finalData: FreightFormData = {
      loadDescription: data.loadDescription,
      weight: data.weight || 0,
      weightUnit: data.weightUnit,
      dimensionsInput: data.dimensionsInput,
      metalType: data.metalType,
      packageCount: data.packageCount || 0,
      loadingEquipment: data.loadingEquipment,
      bidDeadline: data.bidDeadline,
      pickupLocation: data.pickupLocation,
      deliveryLocation: data.deliveryLocation,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      deliveryDate: data.deliveryDate,
      deliveryTime: data.deliveryTime,
      receivingPoc: data.receivingPoc,
      pickupContactPhone: data.pickupContactPhone,
      specialRequirements: data.specialRequirements,
      additionalNotes: data.additionalNotes,
      documentUrl: uploadedFiles[0]?.url || "",
    };
    setStagedFormData(finalData);
    setSubmitError(null);
    setIsReviewModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!stagedFormData) return;
    setSubmitError(null);

    try {
      let deliveryId = savedDeliveryId;

      if (!deliveryId) {
        const dimensions = parseDimensions(stagedFormData.dimensionsInput || "");
        const deliveryPayload = {
          leadId: projectId,
          loadDescription: stagedFormData.loadDescription,
          weight: Number(stagedFormData.weight),
          dimensions,
          metalType: stagedFormData.metalType,
          packageCount: Number(stagedFormData.packageCount),
          loadingEquipment: stagedFormData.loadingEquipment,
          bidDeadline: stagedFormData.bidDeadline ? new Date(stagedFormData.bidDeadline).toISOString() : undefined,
          pickupLocation: stagedFormData.pickupLocation,
          deliveryLocation: stagedFormData.deliveryLocation,
          pickupDate: stagedFormData.pickupDate ? new Date(stagedFormData.pickupDate).toISOString() : undefined,
          pickupTime: stagedFormData.pickupTime,
          deliveryDate: stagedFormData.deliveryDate ? new Date(stagedFormData.deliveryDate).toISOString() : undefined,
          deliveryTime: stagedFormData.deliveryTime,
          receivingPoc: stagedFormData.receivingPoc,
          pickupContactPhone: stagedFormData.pickupContactPhone,
          specialRequirements: stagedFormData.specialRequirements,
          additionalNotes: stagedFormData.additionalNotes,
          documentUrl: stagedFormData.documentUrl || undefined,
        };

        const createRes = await createDelivery(deliveryPayload).unwrap();
        deliveryId = createRes?.data?._id;
      }

      if (deliveryId) {
        const carrierIds = selectedCarrierIds.length > 0
          ? selectedCarrierIds
          : carriersList.map((c) => c._id);

        const formattedDeadline = stagedFormData.bidDeadline
          ? new Date(stagedFormData.bidDeadline).toISOString()
          : undefined;

        await sendFreightBids({
          deliveryId,
          carrierIds,
          bidDeadline: formattedDeadline,
        }).unwrap();
      }

      setIsReviewModalOpen(false);
      if (deliveryId) {
        navigate(`/plant/freight-request-details/${deliveryId}`);
      } else {
        setIsSuccessModalOpen(true);
      }
    } catch (err: any) {
      console.error("Failed to submit freight request:", err);
      const errMsg = err?.data?.message || err?.message || "Failed to submit freight request. Please try again.";
      setSubmitError(errMsg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadPlanningHeader
          requestId={projectId || ""}
          title="Create Freight Request"
          description="Request freight pricing from carriers and compare competitive bids"
          actions={[]}
        />
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 md:p-6 space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-12 bg-gray-100 rounded-lg w-full"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-8">
              <div className="h-64 bg-white rounded-[14px] border border-gray-100 shadow-sm p-6 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <LoadPlanningHeader
        requestId={projectId || ""}
        title="Create Freight Request"
        description="Request freight pricing from carriers and compare competitive bids"
        actions={[]}
      />

      <form onSubmit={handleSubmit(onFormSubmitValid)} className="md:p-6 p-3 pt-0">
        {hasActiveFreight ? (
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 md:p-6 space-y-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E8F1FF] rounded-full flex items-center justify-center text-[#1E51A4]">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-inter font-semibold text-[#212B36]">
                    Freight Request In Progress
                  </h3>
                  <p className="text-xs text-[#637381]">
                    An active freight bid request has already been initiated for this project.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const activeDelivery = activeFreightDeliveries[0];
                  const navId = activeDelivery?.requestId || activeDelivery?._id || projectId;
                  navigate(`/plant/freight-request-details/${navId}`);
                }}
                className="px-4 py-2 bg-[#1E51A4] hover:bg-[#123E84] text-white font-semibold rounded-md transition-all text-sm cursor-pointer flex items-center gap-2"
              >
                <span>Go to Freight Request</span>
                <Send size={14} />
              </button>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-[#637381] uppercase tracking-wider">
                  Active Deliveries
                </h4>
              </div>
              <div className="flex flex-row overflow-x-auto gap-4 pb-2 pt-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {activeFreightDeliveries.map((delivery) => {
                  const statusColors: Record<string, string> = {
                    draft: "text-[#D08700] bg-[#FFF9E6] border-[#FFEAA6]",
                    bidding_sent: "text-[#155DFC] bg-[#E6F0FF] border-[#B8D2FF]",
                    carrier_selected: "text-[#155DFC] bg-[#E6F0FF] border-[#B8D2FF]",
                    scheduled: "text-[#155DFC] bg-[#E6F0FF] border-[#B8D2FF]",
                    confirmed: "text-[#00C853] bg-[#E6FFEF] border-[#A3F3B8]",
                    in_transit: "text-[#4A5565] bg-[#F4F6F8] border-[#E2E4E6]",
                    delivered: "text-[#00C853] bg-[#E6FFEF] border-[#A3F3B8]",
                    delayed: "text-[#FF4842] bg-[#FFE9E9] border-[#FFD1D1]",
                    cancelled: "text-[#FF4842] bg-[#FFE9E9] border-[#FFD1D1]",
                  };
                  const statusKey = (delivery.status || "").toLowerCase().replace(/[\s-]+/g, "_");
                  const statusColor = statusColors[statusKey] || "text-[#4A5565] bg-[#F4F6F8] border-[#E2E4E6]";

                  return (
                    <div
                      key={delivery._id}
                      onClick={() => {
                        const navId = delivery.requestId || delivery._id || projectId;
                        navigate(`/plant/freight-request-details/${navId}`);
                      }}
                      className="min-w-[280px] max-w-[320px] p-4 rounded-xl border border-gray-100 bg-white flex flex-col justify-between cursor-pointer hover:border-gray-300 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-sm text-[#212B36] truncate">
                            {delivery.deliveryNumber || ""}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {formatStatusText(delivery.status).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-[#637381] space-y-1">
                          <p className="truncate">
                            <strong>From:</strong> {delivery.pickupLocation || "-"}
                          </p>
                          <p className="truncate">
                            <strong>To:</strong> {delivery.deliveryLocation || "-"}
                          </p>
                          <p>
                            <strong>Pickup:</strong> {delivery.pickupDate ? new Date(delivery.pickupDate).toLocaleDateString() : "-"}
                          </p>
                          <p>
                            <strong>Delivery:</strong> {delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#1E51A4]">
                          {delivery.loadSize?.weight || delivery.weight || delivery.loadWeight || 0} Lbs
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-8">
              {/* Available Deliveries Section */}
              {hasDeliveries && (
                <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 md:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E8F1FF] rounded-full flex items-center justify-center text-[#1E51A4]">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-inter font-semibold text-[#212B36]">
                        Available Deliveries to Send
                      </h3>
                      <p className="text-xs text-[#637381]">
                        Select an existing delivery load to pre-fill details, or create a new one
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row overflow-x-auto gap-4 pb-2 pt-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {/* Create New Option (hidden if active delivery exists) */}
                    {!hasActiveDelivery && (
                      <div
                        onClick={handleCreateNewDelivery}
                        className={`min-w-[280px] max-w-[320px] p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-center items-center gap-2 text-center ${selectedType === "new"
                          ? "border-[#1E51A4] bg-[#F4F8FF]"
                          : "border-dashed border-gray-300 bg-white hover:border-gray-400"
                          }`}
                      >
                        <div className="w-10 h-10 bg-[#E8F1FF] rounded-full flex items-center justify-center text-[#1E51A4]">
                          <Plus size={20} />
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-[#212B36]">
                            Create New Delivery
                          </span>
                          <p className="text-xs text-[#637381] mt-1">
                            Start with a blank form or autofilled project defaults
                          </p>
                        </div>
                        {selectedType === "new" && (
                          <div className="w-5 h-5 bg-[#1E51A4] rounded-full flex items-center justify-center text-white mt-1">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    )}

                    {deliveriesList.map((delivery: DeliveryItem) => {
                      const isSelected = selectedType === "existing" && savedDeliveryId === delivery._id;
                      const statusColors: Record<string, string> = {
                        draft: "text-[#D08700] bg-[#FFF9E6] border-[#FFEAA6]",
                        bidding_sent: "text-[#155DFC] bg-[#E6F0FF] border-[#B8D2FF]",
                        carrier_selected: "text-[#155DFC] bg-[#E6F0FF] border-[#B8D2FF]",
                        scheduled: "text-[#155DFC] bg-[#E6F0FF] border-[#B8D2FF]",
                        confirmed: "text-[#00C853] bg-[#E6FFEF] border-[#A3F3B8]",
                        in_transit: "text-[#4A5565] bg-[#F4F6F8] border-[#E2E4E6]",
                        delivered: "text-[#00C853] bg-[#E6FFEF] border-[#A3F3B8]",
                        delayed: "text-[#FF4842] bg-[#FFE9E9] border-[#FFD1D1]",
                        cancelled: "text-[#FF4842] bg-[#FFE9E9] border-[#FFD1D1]",
                      };
                      const statusKey = (delivery.status || "").toLowerCase().replace(/[\s-]+/g, "_");
                      const statusColor = statusColors[statusKey] || "text-[#4A5565] bg-[#F4F6F8] border-[#E2E4E6]";

                      return (
                        <div
                          key={delivery._id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedType(null);
                              setSavedDeliveryId(null);
                              setShowForm(false);
                            } else {
                              handleSelectDelivery(delivery);
                            }
                          }}
                          className={`min-w-[280px] max-w-[320px] p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${isSelected
                            ? "border-[#1E51A4] bg-[#F4F8FF]"
                            : "border-gray-100 bg-white hover:border-gray-200"
                            }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-sm text-[#212B36] truncate">
                                {delivery.deliveryNumber || ""}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                                {formatStatusText(delivery.status).toUpperCase()}
                              </span>
                            </div>
                            <div className="text-xs text-[#637381] space-y-1">
                              <p className="truncate">
                                <strong>From:</strong> {delivery.pickupLocation || "-"}
                              </p>
                              <p className="truncate">
                                <strong>To:</strong> {delivery.deliveryLocation || "-"}
                              </p>
                              <p>
                                <strong>Pickup:</strong> {delivery.pickupDate ? new Date(delivery.pickupDate).toLocaleDateString() : "-"}
                              </p>
                              <p>
                                <strong>Delivery:</strong> {delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : "-"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#1E51A4]">
                              {delivery.loadSize?.weight || delivery.weight || delivery.loadWeight || 0} Lbs
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 bg-[#1E51A4] rounded-full flex items-center justify-center text-white">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form and Selection States */}
              {selectedType === "existing" && savedDeliveryId && !showForm && (
                <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 md:p-6 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h4 className="text-base font-semibold text-[#212B36]">
                        Selected Delivery Ready
                      </h4>
                      <p className="text-xs text-[#637381]">
                        Send freight bid request directly to selected carriers for this delivery.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="gradient"
                      size="lg"
                      disabled={isSubmitting}
                      onClick={() => handleSendBidsDirectly(savedDeliveryId, watch("bidDeadline"))}
                      className="px-6 font-bold cursor-pointer"
                    >
                      {isSubmitting ? "Sending Bids..." : "Send Freight Bid"}
                    </Button>
                  </div>
                  {submitError && (
                    <p className="text-xs text-red-500 mt-2">{submitError}</p>
                  )}
                </div>
              )}

              {selectedType !== null && showForm && (
                <>
                  {/* Load Details Card */}
                  <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 md:p-6 space-y-8">
                    <CardHeader
                      icon={<Package />}
                      title="Load Details (Auto-Fill)"
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
                              <p className="text-xs text-red-500 mt-1">{errors.loadDescription.message}</p>
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
                                  <CommonDropdown
                                    options={[
                                      { label: "Lbs", value: "Lbs" },
                                      { label: "Kg", value: "Kg" },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="rounded-xl"
                                  />
                                )}
                              />
                            </div>
                          </div>
                          {errors.weight?.message && (
                            <p className="text-xs text-red-500 mt-1">{errors.weight.message}</p>
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
                                <p className="text-xs text-red-500 mt-1">{errors.dimensionsInput.message}</p>
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
                              Material Type
                            </label>
                            <CommonDropdown
                              options={materialOptions}
                              value={field.value}
                              onChange={field.onChange}
                              className="rounded-xl"
                            />
                            {errors.metalType?.message && (
                              <p className="text-xs text-red-500 mt-1">{errors.metalType.message}</p>
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
                              Pallet / Package Count
                            </label>
                            <input
                              type="number"
                              {...field}
                              value={(field.value as string | number) ?? ""}
                              placeholder="e.g., 18"
                              className="w-full px-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                            />
                            {errors.packageCount?.message && (
                              <p className="text-xs text-red-500 mt-1">{errors.packageCount.message}</p>
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
                            <CommonDropdown
                              options={[
                                { label: "Crane", value: "Crane" },
                                { label: "Forklift", value: "Forklift" },
                              ]}
                              value={field.value?.[0] || "Crane"}
                              onChange={(val) => field.onChange([val])}
                              className="rounded-xl"
                            />
                            {errors.loadingEquipment?.message && (
                              <p className="text-xs text-red-500 mt-1">{errors.loadingEquipment.message}</p>
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
                                <p className="text-xs text-red-500 mt-1">{errors.bidDeadline.message}</p>
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

                          <UploadModal
                            isOpen={isUploadOpen}
                            onClose={() => setIsUploadOpen(false)}
                            title="Upload Freight Documents"
                            subtitle="Upload documents (PDF, Excel, text files, etc.) for this freight request."
                            folder="freight-documents"
                            onUpload={(file, fileUrl) => {
                              setUploadedFiles((prev) => [...prev, { name: file.name, url: fileUrl }]);
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
                            error={errors.pickupLocation?.message}
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
                            error={errors.deliveryLocation?.message}
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
                              <p className="text-xs text-red-500 mt-1">{errors.pickupDate.message}</p>
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
                              <p className="text-xs text-red-500 mt-1">{errors.pickupTime.message}</p>
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
                              <p className="text-xs text-red-500 mt-1">{errors.deliveryDate.message}</p>
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
                              <p className="text-xs text-red-500 mt-1">{errors.deliveryTime.message}</p>
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
                                placeholder="e.g., John Doe"
                                className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-sm font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                              />
                            </div>
                            {errors.receivingPoc?.message && (
                              <p className="text-xs text-red-500 mt-1">{errors.receivingPoc.message}</p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        control={control}
                        name="pickupContactPhone"
                        render={({ field }) => (
                          <div className="space-y-2">
                            <label className="text-sm font-inter font-bold text-[#212B36]">
                              Pickup Contact Phone <span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-2">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#919EAB]">
                                <User size={20} />
                              </span>
                              <input
                                type="text"
                                {...field}
                                placeholder="e.g., +15551234567"
                                className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E4E6] rounded-md text-sm font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                              />
                            </div>
                            {errors.pickupContactPhone?.message && (
                              <p className="text-xs text-red-500 mt-1">{errors.pickupContactPhone.message}</p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        control={control}
                        name="specialRequirements"
                        render={({ field }) => (
                          <div className="space-y-2">
                            <label className="text-sm font-inter font-bold text-[#212B36]">
                              Special Requirements
                            </label>
                            <textarea
                              rows={3}
                              {...field}
                              placeholder="Tarp required, PPE requirements, etc."
                              className="w-full p-3 bg-white border border-[#E2E4E6] rounded-md text-sm font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                            />
                          </div>
                        )}
                      />

                      <Controller
                        control={control}
                        name="additionalNotes"
                        render={({ field }) => (
                          <div className="space-y-2">
                            <label className="text-sm font-inter font-bold text-[#212B36]">
                              Additional Notes
                            </label>
                            <textarea
                              rows={3}
                              {...field}
                              placeholder="Any extra instructions or notes..."
                              className="w-full p-3 bg-white border border-[#E2E4E6] rounded-md text-sm font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE]"
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      variant="gradient"
                      size="lg"
                      className="px-8 font-bold cursor-pointer"
                    >
                      Review & Send Request to Carriers
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Carrier Selection */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm p-4 md:p-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-start md:items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#E8F1FF] rounded-full flex items-center justify-center text-[#1E51A4]">
                      <Truck size={16} className="md:size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-lg font-inter font-semibold text-[#212B36]">Select Carriers</h3>
                      <p className="text-xs text-[#637381]">Send bid request to carriers</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFilterModalOpen(true)}
                    className="p-2 bg-[#DFDFDF] ml-auto rounded-full border border-[#E2E4E6] text-black"
                  >
                    <SlidersHorizontal size={20} strokeWidth={2.5} />
                  </button>
                </div>

                {isLoadingCarriers ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-24 bg-gray-100 rounded-md"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {carriersList.map((carrier: any) => {
                      const isChecked = selectedCarrierIds.includes(carrier._id);
                      return (
                        <div
                          key={carrier._id}
                          onClick={() => {
                            setSelectedCarrierIds((prev) =>
                              prev.includes(carrier._id)
                                ? prev.filter((id) => id !== carrier._id)
                                : [...prev, carrier._id]
                            );
                          }}
                          className={`p-2 md:p-4 rounded-md border transition-all cursor-pointer font-inter text-sm ${isChecked ? "border-[#E2E4E6] bg-white" : "border-gray-50 bg-white opacity-70 hover:opacity-100"
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isChecked ? "bg-white border-[#22C55E]" : "bg-white border-gray-200"
                                }`}
                            >
                              {isChecked && <Check size={12} className="text-[#22C55E]" strokeWidth={4} />}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-[#212B36] text-sm">
                                  {carrier.carrierName}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-[#FFAB00] font-bold">
                                  ★ {(4.0 + (carrier.bidWinRate || 50) * 0.01).toFixed(1)}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-[#637381]">
                                  Last: ${carrier.avgBid?.toLocaleString() || "2,500"}
                                </span>
                              </div>
                              <p className="text-xs text-[#637381] font-medium leading-relaxed">
                                {carrier.equipmentTypes?.join(", ") || carrier.serviceType || "Flatbed, Step Deck"}
                                <br />
                                On-time rate: 94%
                                <br />
                                Service Area: {carrier.serviceArea}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {carriersList.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No carriers found.</p>
                    )}
                  </div>
                )}

                {/* Selection Summary */}
                <div className="bg-[#EFF6FF] rounded-xl p-4 flex items-start gap-3">
                  <div className="text-[#1D4ED8] mt-1">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1D4ED8]">{selectedCarrierIds.length} Carriers Selected</p>
                    <p className="text-xs text-[#1D4ED8]/70">Select carriers to request freight quotes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      <CarrierFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />

      <FreightReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleFinalSubmit}
        formData={stagedFormData}
        projectName={autofillData?.projectName || "Logistics Request"}
        isSubmitting={isSubmitting}
        error={submitError}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          navigate(`/plant/deliveries`);
        }}
        title="Freight Request Sent Successfully!"
        subTitle="Your freight request has been broadcasted to carriers. You can monitor incoming bids in the deliveries section."
        buttonText="Go to Deliveries"
      />
    </div>
  );
};

export default FreightSelectionView;

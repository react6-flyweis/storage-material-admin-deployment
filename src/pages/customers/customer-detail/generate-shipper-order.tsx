import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Search, Send, Truck } from "lucide-react";
import Button from "@/plant/components/common_component/Button";
import { Input } from "@/components/ui/input";
import SuccessModal from "@/plant/components/common_component/SuccessModal";
import AddShipperMailModal from "./add-shipper-mail-modal";
import { BOMListContent } from "./bom-list-content-view";

import {
  useGetConsolidatedBOMQuery,
  useSendConsolidatedBOMToVendorsMutation,
  type PlantProjectDetail,
} from "@/modules/plant/bom.hooks";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { usePlantVendorsQuery } from "@/modules/plant/vendor.hooks";

const GenerateShipperOrder: React.FC = () => {
  const navigate = useNavigate();
  const { id, projectId: paramProjectId } = useParams<{ id?: string; projectId?: string }>();
  const projectId = paramProjectId || id || "";

  const {
    data: consolidatedBOMData,
    isLoading: isBOMLoading,
    error: bomError,
  } = useGetConsolidatedBOMQuery(projectId);

  const consolidatedBOM = consolidatedBOMData?.consolidatedBOM;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShipperIds, setSelectedShipperIds] = useState<string[]>([]);
  const [newShipperEmails, setNewShipperEmails] = useState(["steelinvestment@gmail.com"]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAddShipperModalOpen, setIsAddShipperModalOpen] = useState(false);
  const [isAddSuccessOpen, setIsAddSuccessOpen] = useState(false);

  // Initialize selectedShipperIds from already sent vendors when data loads
  useEffect(() => {
    if (consolidatedBOM?.sentToVendors) {
      const sentIds = consolidatedBOM.sentToVendors.map((v) => v.vendorId);
      const timer = setTimeout(() => {
        setSelectedShipperIds(sentIds);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [consolidatedBOM]);

  const sendConsolidatedBOMMutation = useSendConsolidatedBOMToVendorsMutation();
  const isSending = sendConsolidatedBOMMutation.isPending;

  const {
    data: leadData,
    isLoading: isProjectLoading,
    error: projectError,
  } = useLeadDetailQuery(projectId);

  const {
    data: vendorsDataResponse,
    isLoading: isVendorsLoading,
    refetch: refetchVendors,
  } = usePlantVendorsQuery({ search: searchTerm.trim() || undefined, type: "shipper" });

  if (isProjectLoading || isBOMLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E51A4]"></div>
        <p className="text-gray-500 font-inter font-medium text-sm">
          Loading BOM details...
        </p>
      </div>
    );
  }

  if (bomError || projectError) {
    const is404 = bomError && typeof bomError === "object" && "status" in bomError && (bomError as { status: number }).status === 404;
    return (
      <div className="xl:pr-5 px-2 pb-10 space-y-6">
        <div className="flex items-center gap-4 mt-2">
          <Button
            variant="blueFilled"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 shrink-0"
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Back
          </Button>
          <h1 className="text-xl md:text-2xl font-bold font-inter text-[#212B36]">
            Generate Shipper Order
          </h1>
        </div>
        <div className="p-10 text-center bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4">
          <p className="font-semibold text-lg font-inter text-[#212B36]">
            {is404 ? "Consolidated BOM Not Generated Yet" : "Error Loading BOM Details"}
          </p>
          <p className="text-sm text-gray-500 font-inter max-w-md">
            {is404
              ? "The consolidated Bill of Materials (BOM) has not been generated for this project. Please make sure that BOM files have been uploaded and processed."
              : "Something went wrong while retrieving the consolidated BOM. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  const leadObj = leadData?.data?.lead as Record<string, unknown> | undefined;
  const projectDetail: PlantProjectDetail | undefined = leadObj
    ? {
        lead: leadObj as PlantProjectDetail["lead"],
        client: typeof leadObj.customerId === "object" && leadObj.customerId !== null ? (leadObj.customerId as PlantProjectDetail["client"]) : undefined,
        jobId: typeof leadObj.jobId === "string" ? leadObj.jobId : (typeof leadObj.leadId === "string" ? leadObj.leadId : undefined),
      }
    : undefined;

  const toggleShipper = (id: string) => {
    const isAlreadySent = consolidatedBOM?.sentToVendors?.some(
      (v: { vendorId: string }) => v.vendorId === id
    );
    if (isAlreadySent) return;

    setSelectedShipperIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddShipperMail = (data: { name: string; email: string; phone: string }) => {
    if (data.email && !newShipperEmails.includes(data.email)) {
      setNewShipperEmails([...newShipperEmails, data.email]);
    }
    refetchVendors();
    setIsAddShipperModalOpen(false);
    setIsAddSuccessOpen(true);
  };

  const handleSendOrder = async () => {
    if (!projectId || selectedShipperIds.length === 0) return;
    try {
      await sendConsolidatedBOMMutation.mutateAsync({
        leadId: projectId,
        vendorIds: selectedShipperIds,
      });
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Failed to send consolidated BOM:", err);
    }
  };

  const vendors = vendorsDataResponse?.data?.vendors || vendorsDataResponse?.vendors || [];

  return (
    <div className="xl:pr-5 px-2 pb-10 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="blueFilled"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 shrink-0"
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Back
          </Button>
          <h1 className="text-xl md:text-2xl font-bold font-inter text-[#212B36]">
            Generate Shipper Order
          </h1>
        </div>

        <div className="flex justify-end">
          <Button
            variant="purpleFilled"
            size="md"
            className="flex items-center gap-2"
            onClick={handleSendOrder}
            disabled={selectedShipperIds.length === 0 || isSending}
          >
            <Send size={18} /> {isSending ? "Sending..." : "Send Order"}
          </Button>
        </div>
      </div>

      {/* Select Shipper Card */}
      <div className="bg-white rounded-[16px] md:rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-[#EBF1FF] flex items-center justify-center flex-shrink-0">
              <Truck className="size-6 text-[#1E51A4]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#212B36]">Select Shipper</h3>
              <p className="text-sm text-[#637381]">Send Material Request to Shipper</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 lg:justify-end">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search Shippers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
              />
            </div>
            <Button
              variant="white"
              size="sm"
              onClick={() => setIsAddShipperModalOpen(true)}
            >
              Add new Shipper
            </Button>
          </div>
        </div>

        {/* Shippers Grid */}
        {isVendorsLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1E51A4]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {vendors.map((shipper) => {
              const isSelected = selectedShipperIds.includes(shipper._id);
              const sentVendor = consolidatedBOM?.sentToVendors?.find(
                (v: { vendorId: string; vendorName: string; sentAt: string }) => v.vendorId === shipper._id
              );
              const isAlreadySent = !!sentVendor;
              return (
                <div
                  key={shipper._id}
                  onClick={() => toggleShipper(shipper._id)}
                  className={`p-5 rounded-[12px] border-2 transition-all flex flex-col gap-3 relative ${isAlreadySent
                    ? "border-gray-200 bg-gray-50/50 opacity-75 cursor-not-allowed select-none"
                    : isSelected
                      ? "border-[#3AB449] bg-white cursor-pointer"
                      : "border-[#E2E4E6] bg-white cursor-pointer"
                    }`}
                >
                  {sentVendor && (
                    <span className="absolute top-2 right-2 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                      Sent
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`size-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isAlreadySent
                      ? "bg-gray-300 border-gray-300"
                      : isSelected
                        ? "bg-[#3AB449] border-[#3AB449]"
                        : "border-gray-300 bg-white"
                      }`}>
                      {isSelected && (
                        <svg viewBox="0 0 24 24" fill="none" className="size-3.5 text-white" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="space-y-1 pr-8">
                      <h4 className="font-bold text-[#212B36] text-sm md:text-base leading-tight">{shipper.vendorName}</h4>
                    </div>
                  </div>
                  <div className="ml-8 space-y-1">
                    <p className="text-[11px] md:text-xs text-[#637381] font-medium">Pickup: {shipper.pickupLocation || "N/A"}</p>
                    {sentVendor && (
                      <p className="text-[10px] text-gray-400 font-medium">
                        Sent at: {new Date(sentVendor.sentAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOM Content Section */}
      {consolidatedBOM && (
        <BOMListContent consolidatedBOM={consolidatedBOM} projectDetail={projectDetail} />
      )}

      {/* Main Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          const customerId = (leadObj?.customerId as Record<string, unknown>)?._id || (leadObj?.customerId as string) || id || "";
          if (customerId) {
            navigate(`/customers/${customerId}/project-shipper-files/${projectId}`);
          } else {
            navigate(-1);
          }
        }}
        title="Order Sent Successfully"
        subTitle="Material Request has been sent to selected shippers."
      />

      {/* Add Shipper Mail Modal */}
      <AddShipperMailModal
        isOpen={isAddShipperModalOpen}
        onClose={() => setIsAddShipperModalOpen(false)}
        onAdd={handleAddShipperMail}
      />

      {/* Add Email Success Modal */}
      <SuccessModal
        isOpen={isAddSuccessOpen}
        onClose={() => setIsAddSuccessOpen(false)}
        title="Shipper Mail Added in the Order"
        subTitle="After Shipper/vendor processes the order, they prepare the actual shipment. Then they send the shipper file."
      />
    </div>
  );
};

export default GenerateShipperOrder;

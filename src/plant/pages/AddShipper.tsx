import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useAppBack } from "@/modules/navigation";
import { Button } from "@/components/ui/button";
import SuccessModal from "../components/common_component/SuccessModal";
import ShipperForm from "./ShipperForm";
import { type VendorFormValues, type VendorFormInput } from "./vendorSchema";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreatePlantVendorMutation } from "@/modules/plant/vendor.hooks";
import { type UseFormSetError } from "react-hook-form";

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 bg-[#f4f7fb] min-h-screen font-sans max-w-[1200px] mx-auto w-full">
      {children}
    </div>
  );
};

const AddNewShipper: React.FC = () => {
  const navigate = useNavigate();
  const { goBack } = useAppBack("/plant/shippers");
  const createPlantVendorMutation = useCreatePlantVendorMutation();
  const isLoading = createPlantVendorMutation.isPending;

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdVendorName, setCreatedVendorName] = useState<string | null>(null);

  const onSubmit = async (
    values: VendorFormValues,
    setError: UseFormSetError<VendorFormInput>
  ) => {
    try {
      const payload = {
        vendorName: values.vendorName,
        email: values.email,
        phone: values.phone,
        contactName: values.contactName,
        vendorCode: values.vendorCode,
        yearsWithCompany: values.yearsWithCompany,
        serviceCategory: values.serviceCategory,
        vendorType: values.vendorType,
        materialTypes: values.materialTypes,
        address: {
          placeNumber: values.address.placeNumber,
          streetAddress: values.address.streetAddress,
          landmark: values.address.landmark,
          city: values.address.city,
          state: values.address.state,
          postalCode: String(values.address.postalCode),
          gpsCoordinates: values.address.gpsCoordinates,
        },
        documents: values.documents || [],
        internalNotes: values.internalNotes ?? "",
      };

      await createPlantVendorMutation.mutateAsync(payload);
      setCreatedVendorName(values.vendorName);
      setIsSuccessOpen(true);
    } catch (unknownError) {
      setError("root", { message: getApiErrorMessage(unknownError) });
    }
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => goBack("/plant/shippers")}
            className="flex items-center gap-2 shrink-0 bg-[#1E51A4] hover:bg-[#154085] text-white"
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Back
          </Button>
          <h1 className="text-lg md:text-xl font-semibold">Add New Shipper</h1>
        </div>
      </div>

      <ShipperForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        submitButtonText="Add Shipper"
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          navigate("/plant/shippers", { replace: true });
        }}
        title="Shipper Added Successfully"
        subTitle={createdVendorName ? `Name: ${createdVendorName}` : undefined}
      />
    </PageWrapper>
  );
};

export default AddNewShipper;

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { type UseFormSetError } from "react-hook-form";

import SuccessModal from "../components/common_component/SuccessModal";
import CarrierForm from "./CarrierForm";

import { type CarrierFormInput, type CarrierFormValues } from "./carrierSchema";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreatePlantCarrierMutation } from "@/modules/plant/carrier.hooks";
import { type CreatePlantCarrierRequest } from "@/modules/plant/carrier.api";

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 bg-[#f4f7fb] min-h-screen font-sans max-w-[1200px] mx-auto w-full">
      {children}
    </div>
  );
};

const AddNewFreightCourier: React.FC = () => {
  const navigate = useNavigate();
  const createPlantCarrierMutation = useCreatePlantCarrierMutation();
  const isLoading = createPlantCarrierMutation.isPending;

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdCarrierName, setCreatedCarrierName] = useState<string | null>(null);

  const onSubmit = async (
    values: CarrierFormValues,
    setError: UseFormSetError<CarrierFormInput>
  ) => {
    try {
      const payload: CreatePlantCarrierRequest = {
        carrierName: values.vendorName,
        email: values.email,
        phone: values.phone,
        contactName: values.contactName,
        carrierCode: values.vendorCode || undefined,
        serviceType: values.serviceType,
        serviceArea: values.serviceArea,
        address: {
          placeNumber: values.address.placeNumber,
          streetAddress: values.address.streetAddress,
          landmark: values.address.landmark,
          city: values.address.city,
          state: values.address.state,
          postalCode: String(values.address.postalCode),
          gpsCoordinates: values.address.gpsCoordinates,
        },
        fleetEquipment: values.fleetEquipment?.map((eq) => ({
          equipmentName: eq.equipment,
          quantity: eq.quantity,
        })),
        fleetCapacity: {
          totalVehicleCount: values.fleetCapacity.totalVehicles,
          maximumLoadCapacity: Number.parseFloat(values.fleetCapacity.maxLoadCapacity.replace(/[^0-9.]/g, "")) || 0,
          averageFleetAge: values.fleetCapacity.avgFleetAge,
        },
        documents: values.documents?.map((doc) => ({
          name: doc.name,
          url: doc.url,
        })) || [],
        internalNotes: values.internalNotes ?? "",
      };

      await createPlantCarrierMutation.mutateAsync(payload);
      setCreatedCarrierName(values.vendorName);
      setIsSuccessOpen(true);
    } catch (unknownError) {
      setError("root", { message: getApiErrorMessage(unknownError) });
    }
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6 pt-2">
        <div
          className="flex items-center gap-3 cursor-pointer text-gray-800 hover:text-black transition-colors select-none"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
          <h1 className="text-lg md:text-xl font-semibold">Add New Freight Courier</h1>
        </div>
      </div>

      <CarrierForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        submitButtonText="Add Freight Courier"
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          navigate("/plant/freight-carriers");
        }}
        title="Courier Added Successfully"
        subTitle={createdCarrierName ? `Name: ${createdCarrierName}` : undefined}
      />
    </PageWrapper>
  );
};

export default AddNewFreightCourier;

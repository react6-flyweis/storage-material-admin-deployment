import React, { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import SuccessModal from "../components/common_component/SuccessModal";
import CarrierForm from "./CarrierForm";
import { type CarrierFormValues, type CarrierFormInput } from "./carrierSchema";
import { getApiErrorMessage } from "@/lib/api-error";
import { type UseFormSetError } from "react-hook-form";
import {
  usePlantCarrierQuery,
  useUpdatePlantCarrierMutation,
} from "@/modules/plant/carrier.hooks";
import { type UpdatePlantCarrierRequest } from "@/modules/plant/carrier.api";

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 bg-[#f4f7fb] min-h-screen font-sans max-w-[1200px] mx-auto w-full">
      {children}
    </div>
  );
};

const EditFreightCarrier: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: carrierResponse, isLoading: isCarrierLoading } = usePlantCarrierQuery(id ?? "", {
    enabled: !!id,
  });
  const updatePlantCarrierMutation = useUpdatePlantCarrierMutation();
  const isUpdating = updatePlantCarrierMutation.isPending;

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const initialValues = useMemo<Partial<CarrierFormInput> | undefined>(() => {
    if (!carrierResponse?.data?.carrier) return undefined;
    const carrier = carrierResponse.data.carrier;
    const lat = carrier.address?.gpsCoordinates?.lat;
    const lng = carrier.address?.gpsCoordinates?.lng;
    const gpsCoordinatesStr = (lat !== null && lat !== undefined && lng !== null && lng !== undefined) ? `${lat}, ${lng}` : "";

    const fleetEquipment = carrier.fleetEquipment?.map((eq) => ({
      equipment: eq.equipmentName || "",
      quantity: eq.quantity || 1,
    })) || [{ equipment: "", quantity: 1 }];

    return {
      vendorName: carrier.carrierName || "",
      vendorCode: carrier.carrierCode || "",
      contactName: carrier.contactName || "",
      email: carrier.email || "",
      phone: carrier.phone || "",
      address: {
        placeNumber: carrier.address?.placeNumber || "",
        streetAddress: carrier.address?.streetAddress || "",
        landmark: carrier.address?.landmark || "",
        city: carrier.address?.city || "",
        state: carrier.address?.state || "",
        postalCode: carrier.address?.postalCode ? Number(carrier.address.postalCode) : "",
        gpsCoordinates: gpsCoordinatesStr,
      },
      serviceType: carrier.serviceType || "",
      serviceArea: carrier.serviceArea || "",
      fleetEquipment,
      fleetCapacity: {
        totalVehicles: carrier.fleetCapacity?.totalVehicleCount || 0,
        maxLoadCapacity: carrier.fleetCapacity?.maximumLoadCapacity ? `${carrier.fleetCapacity.maximumLoadCapacity} lbs` : "0 lbs",
        avgFleetAge: carrier.fleetCapacity?.averageFleetAge || 0,
      },
      documents: (carrier.documents || []).map((doc) => ({
        name: doc.name || "",
        url: doc.url || "",
      })),
      internalNotes: carrier.internalNotes || "",
    };
  }, [carrierResponse]);

  const onSubmit = async (values: CarrierFormValues, setError: UseFormSetError<CarrierFormInput>) => {
    if (!id) return;
    try {
      const payload: UpdatePlantCarrierRequest = {
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

      await updatePlantCarrierMutation.mutateAsync({ carrierId: id, body: payload });
      setIsSuccessOpen(true);
    } catch (unknownError) {
      setError("root", { message: getApiErrorMessage(unknownError) });
    }
  };

  if (isCarrierLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-3 mb-6 pt-2">
          <div className="p-1 rounded-full bg-gray-100 animate-pulse w-7 h-7" />
          <div className="h-7 w-32 bg-gray-200 animate-pulse rounded-md" />
        </div>
        <div className="space-y-6">
          <div className="h-40 bg-gray-100 animate-pulse rounded-xl" />
          <div className="h-40 bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6 pt-2">
        <div
          className="flex items-center gap-3 cursor-pointer text-gray-800 hover:text-black transition-colors select-none"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
          <h1 className="text-lg md:text-xl font-semibold">Edit Freight Courier</h1>
        </div>
      </div>

      <CarrierForm
        onSubmit={onSubmit}
        isLoading={isUpdating}
        initialValues={initialValues}
        submitButtonText="Save Changes"
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          navigate(`/plant/freight-carriers/${id}`);
        }}
        title="Courier Updated Successfully"
        subTitle={initialValues?.vendorName ? `Name: ${initialValues.vendorName}` : undefined}
      />
    </PageWrapper>
  );
};

export default EditFreightCarrier;

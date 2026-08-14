import React, { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import SuccessModal from "../components/common_component/SuccessModal";
import ShipperForm from "./ShipperForm";
import { type VendorFormValues, type VendorFormInput } from "./vendorSchema";
import { getApiErrorMessage } from "@/lib/api-error";
import { type UseFormSetError } from "react-hook-form";
import {
  usePlantVendorQuery,
  useUpdatePlantVendorMutation,
} from "@/modules/plant/vendor.hooks";
import { type UpdatePlantVendorRequest } from "@/modules/plant/vendor.api";

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 bg-[#f4f7fb] min-h-screen font-sans max-w-[1200px] mx-auto w-full">
      {children}
    </div>
  );
};

const EditShipper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vendorResponse, isLoading: isVendorLoading } = usePlantVendorQuery(id ?? "", {
    enabled: !!id,
  });
  const updatePlantVendorMutation = useUpdatePlantVendorMutation();
  const isUpdating = updatePlantVendorMutation.isPending;

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const initialValues = useMemo<Partial<VendorFormInput> | undefined>(() => {
    if (!vendorResponse?.data?.vendor) return undefined;
    const vendor = vendorResponse.data.vendor;
    const lat = vendor.address?.gpsCoordinates?.lat;
    const lng = vendor.address?.gpsCoordinates?.lng;
    const gpsCoordinatesStr = (lat !== undefined && lng !== undefined) ? `${lat}, ${lng}` : "";

    return {
      vendorName: vendor.vendorName || "",
      vendorCode: vendor.vendorCode || "",
      contactName: vendor.contactName || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      yearsWithCompany: vendor.yearsWithCompany || undefined,
      serviceCategory: vendor.serviceCategory || "",
      address: {
        placeNumber: vendor.address?.placeNumber || "",
        streetAddress: vendor.address?.streetAddress || "",
        landmark: vendor.address?.landmark || "",
        city: vendor.address?.city || "",
        state: vendor.address?.state || "",
        postalCode: vendor.address?.postalCode ? Number(vendor.address.postalCode) : "",
        gpsCoordinates: gpsCoordinatesStr,
      },
      vendorType: vendor.vendorType || "",
      materialTypes: vendor.materialTypes || [],
      documents: (vendor.documents || []).map(doc => ({
        name: doc.name || "",
        url: doc.url || "",
      })),
      internalNotes: vendor.internalNotes || "",
    };
  }, [vendorResponse]);

  const onSubmit = async (values: VendorFormValues, setError: UseFormSetError<VendorFormInput>) => {
    if (!id) return;
    try {
      const payload: UpdatePlantVendorRequest = {
        vendorName: values.vendorName,
        email: values.email,
        phone: values.phone,
        contactName: values.contactName,
        vendorCode: values.vendorCode,
        yearsWithCompany: values.yearsWithCompany ?? undefined,
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

      await updatePlantVendorMutation.mutateAsync({ vendorId: id, body: payload });
      setIsSuccessOpen(true);
    } catch (unknownError) {
      setError("root", { message: getApiErrorMessage(unknownError) });
    }
  };

  if (isVendorLoading) {
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
          className="flex items-center gap-3 cursor-pointer text-gray-800 hover:text-black transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
          <h1 className="text-lg md:text-xl font-semibold">Edit Shipper</h1>
        </div>
      </div>

      <ShipperForm
        onSubmit={onSubmit}
        isLoading={isUpdating}
        initialValues={initialValues}
        submitButtonText="Save Changes"
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          navigate(`/plant/shippers/${id}`);
        }}
        title="Shipper Updated Successfully"
        subTitle={initialValues?.vendorName ? `Name: ${initialValues.vendorName}` : undefined}
      />
    </PageWrapper>
  );
};

export default EditShipper;

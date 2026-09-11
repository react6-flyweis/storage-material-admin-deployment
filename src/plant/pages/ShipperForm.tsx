import React from "react";
import { Controller, useForm, type UseFormSetError, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye } from "lucide-react";

import AccordionSection from "../components/common_component/AccordionSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhoneNumberInput from "../ui/phone-input";
import DocumentUploadCard from "./DocumentUploadCard";
import AddressFormSection from "../components/common_component/AddressFormSection";

import { VENDOR_TYPES, vendorSchema, type VendorFormInput, type VendorFormValues } from "./vendorSchema";

const getMessage = (error: unknown) => {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return undefined;
  }
  const errObj = error as { message: unknown };
  return typeof errObj.message === "string" ? errObj.message : undefined;
};

const serviceCategoryOptions = [
  { label: "Construction Material", value: "construction-material" },
  { label: "Heavy Equipment", value: "heavy-equipment" },
  { label: "Raw Material", value: "raw-material" },
  { label: "Finished Goods", value: "finished-goods" },
];

const materialTypeOptions = [
  { label: "All Materials", value: "All Materials" },
  { label: "Steel & Metal", value: "Steel & Metal" },
  { label: "Concrete", value: "Concrete" },
];

const vendorTypeOptions = VENDOR_TYPES.map((type) => ({
  label: type.charAt(0).toUpperCase() + type.slice(1),
  value: type,
}));

interface ShipperFormProps {
  onSubmit: (values: VendorFormValues, setError: UseFormSetError<VendorFormInput>) => Promise<void>;
  isLoading: boolean;
  initialValues?: Partial<VendorFormInput>;
  submitButtonText: string;
}

const ShipperForm: React.FC<ShipperFormProps> = ({
  onSubmit,
  isLoading,
  initialValues,
  submitButtonText,
}) => {
  const methods = useForm<VendorFormInput, unknown, VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    mode: "onChange",
    defaultValues: {
      vendorName: initialValues?.vendorName || "",
      vendorCode: initialValues?.vendorCode || "",
      contactName: initialValues?.contactName || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      yearsWithCompany: initialValues?.yearsWithCompany || "",
      serviceCategory: initialValues?.serviceCategory || "",
      address: {
        placeNumber: initialValues?.address?.placeNumber || "",
        streetAddress: initialValues?.address?.streetAddress || "",
        landmark: initialValues?.address?.landmark || "",
        city: initialValues?.address?.city || "",
        state: initialValues?.address?.state || "",
        postalCode: initialValues?.address?.postalCode || "",
        gpsCoordinates: initialValues?.address?.gpsCoordinates || "",
      },
      vendorType: initialValues?.vendorType || "",
      materialTypes: initialValues?.materialTypes || [],
      documents: initialValues?.documents || [],
      internalNotes: initialValues?.internalNotes || "",
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitted },
  } = methods;

  const documents = (watch("documents") ?? []) as VendorFormValues["documents"];

  const validationMessages = [
    getMessage(errors.vendorName),
    getMessage(errors.vendorCode),
    getMessage(errors.contactName),
    getMessage(errors.email),
    getMessage(errors.phone),
    getMessage(errors.yearsWithCompany),
    getMessage(errors.serviceCategory),
    getMessage(errors.address?.placeNumber),
    getMessage(errors.address?.streetAddress),
    getMessage(errors.address?.landmark),
    getMessage(errors.address?.city),
    getMessage(errors.address?.state),
    getMessage(errors.address?.postalCode),
    getMessage(errors.address?.gpsCoordinates),
    getMessage(errors.vendorType),
    getMessage(errors.materialTypes),
  ].filter(Boolean) as string[];

  const handleFormSubmit = handleSubmit((values) => {
    return onSubmit(values, setError);
  });

  const onDocumentsChange = (docs: VendorFormValues["documents"]) => {
    setValue("documents", docs, { shouldDirty: true });
  };

  return (
    <FormProvider {...methods}>
      <div className="flex justify-end -mt-14 mb-6">
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 shadow-xs font-semibold h-10"
          type="submit"
          form="shipper-form"
          disabled={isLoading}
        >
          <Eye className="w-4 h-4" />
          {submitButtonText}
        </Button>
      </div>

      <form id="shipper-form" onSubmit={handleFormSubmit}>
        {isSubmitted && (errors.root?.message || validationMessages.length > 0) && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div className="font-semibold">Please fix the following validation errors:</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errors.root?.message && <li>{errors.root.message}</li>}
              {validationMessages.map((message, index) => (
                <li key={`${message}-${index}`}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col">
          <AccordionSection title="Carriers Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Controller
                control={control}
                name="vendorName"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#212B36] flex items-center">
                      Carriers Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Steel Shippers Inc."
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className={`h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-400 ${errors.vendorName ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                    />
                    {errors.vendorName?.message && (
                      <p className="text-xs text-red-600">
                        {errors.vendorName.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="contactName"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#212B36] flex items-center">
                      Contact Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Mike Johnson"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className={`h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-400 ${errors.contactName ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                    />
                    {errors.contactName?.message && (
                      <p className="text-xs text-red-600">
                        {errors.contactName.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="vendorCode"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#212B36] flex items-center">
                      Shippers ID (Auto-generated + Editable) <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      placeholder="e.g. SHP-2026-10482"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className={`h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-400 ${errors.vendorCode ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                    />
                    {errors.vendorCode?.message && (
                      <p className="text-xs text-red-600">
                        {errors.vendorCode.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#212B36] flex items-center">
                      Phone Number <span className="text-red-500 ml-1">*</span>
                    </label>
                    <PhoneNumberInput
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Enter phone number"
                      className={
                        errors.phone ? "PhoneInput--invalid border-red-500" : ""
                      }
                    />
                    {errors.phone?.message && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#212B36] flex items-center">
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      placeholder="e.g. dispatch@shippers.com"
                      type="email"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className={`h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-400 ${errors.email ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                    />
                    {errors.email?.message && (
                      <p className="text-xs text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <div className="md:col-span-2 grid lg:grid-cols-3 gap-5">
                <Controller
                  control={control}
                  name="yearsWithCompany"
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-[#212B36] flex items-center">
                        Years of working with company
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 3"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        className={`h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-400 ${errors.yearsWithCompany ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""
                          }`}
                      />
                      {errors.yearsWithCompany?.message && (
                        <p className="text-xs text-red-600">
                          {errors.yearsWithCompany.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  control={control}
                  name="serviceCategory"
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-[#212B36] flex items-center">
                        Service Category <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger className={`h-11! w-full bg-white border-gray-200 focus:ring-1 focus:ring-blue-400 ${errors.serviceCategory ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategoryOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.serviceCategory?.message && (
                        <p className="text-xs text-red-600">
                          {errors.serviceCategory.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  control={control}
                  name="vendorType"
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-[#212B36] flex items-center">
                        Vendor Type <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger className={`h-11! w-full bg-white border-gray-200 focus:ring-1 focus:ring-blue-400 ${errors.vendorType ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendorTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.vendorType?.message && (
                        <p className="text-xs text-red-600">
                          {errors.vendorType.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </AccordionSection>

          <AddressFormSection />

          <AccordionSection title="Material Types">
            <div className="w-full">
              <Controller
                control={control}
                name="materialTypes"
                render={({ field }) => {
                  const selectedTypes = field.value ?? [];

                  return (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm font-semibold text-[#212B36] flex items-center">
                          Material Types <span className="text-red-500 ml-1">*</span>
                        </label>
                        <span className="text-xs text-gray-500 select-none">
                          Select one or more material types
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                        {materialTypeOptions.map((option) => {
                          const checked = selectedTypes.includes(option.value);

                          const handleToggle = () => {
                            let nextValues: string[];

                            if (option.value === "All Materials") {
                              nextValues = checked ? [] : [option.value];
                            } else if (checked) {
                              nextValues = selectedTypes.filter(
                                (value) => value !== option.value,
                              );
                            } else {
                              nextValues = selectedTypes
                                .filter(
                                  (value) => value !== "All Materials",
                                )
                                .concat(option.value);
                            }

                            field.onChange(nextValues);
                          };

                          return (
                            <label
                              key={option.value}
                              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer select-none"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={handleToggle}
                                className="size-4 shrink-0"
                              />
                              <span className="text-sm font-semibold text-gray-800">
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {errors.materialTypes?.message && (
                        <p className="-mt-1 text-xs text-red-600">
                          {errors.materialTypes.message}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
            </div>
          </AccordionSection>

          <DocumentUploadCard
            documents={documents || []}
            onDocumentsChange={onDocumentsChange}
          />

          <AccordionSection title="Internal Notes (Optional)">
            <div className="w-full">
              <Controller
                control={control}
                name="internalNotes"
                render={({ field }) => (
                  <div>
                    <Textarea
                      className={`w-full min-h-24 p-4 bg-gray-50/50 rounded-xl text-sm text-gray-700 resize-none outline-none transition-all placeholder:text-gray-400 border focus-visible:ring-1 focus-visible:ring-blue-400 ${errors.internalNotes ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : "border-gray-200 focus-visible:border-blue-400 focus-visible:ring-blue-400"}`}
                      placeholder="Add your notes here..."
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {errors.internalNotes?.message && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.internalNotes.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </AccordionSection>
        </div>
      </form>
    </FormProvider>
  );
};

export default ShipperForm;
export { ShipperForm };

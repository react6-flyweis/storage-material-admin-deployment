import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/plant/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PhoneNumberInput from "@/plant/ui/phone-input";
import { useCreatePlantVendorMutation } from "@/modules/plant/vendor.hooks";

const isPhoneNumber = (value: string) => {
  const normalizedValue = value.replace(/[\s()-]/g, "");
  return /^\+?\d{7,15}$/.test(normalizedValue);
};

const shipperSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Shipper name is required.")
    .refine((value) => !/^\d+$/.test(value), {
      message: "Shipper Name cannot be only numbers.",
    }),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .refine((value) => isPhoneNumber(value), {
      message: "Enter a valid phone number.",
    }),
});

type ShipperFormValues = z.infer<typeof shipperSchema>;

interface AddShipperMailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; email: string; phone: string }) => void;
}

const AddShipperMailModal: React.FC<AddShipperMailModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const createPlantVendorMutation = useCreatePlantVendorMutation();
  const isLoading = createPlantVendorMutation.isPending;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShipperFormValues>({
    resolver: zodResolver(shipperSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        email: "",
        phone: "",
      });
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  const onSubmit = async (values: ShipperFormValues) => {
    try {
      setErrorMsg(null);
      const payload = {
        vendorName: values.name,
        email: values.email,
        phone: values.phone,
        type: "shipper" as const,
      };
      await createPlantVendorMutation.mutateAsync(payload);
      onAdd(values);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? (err as { message: string }).message : "Failed to add vendor";
      setErrorMsg(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add new Shipper mail"
      width="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
        {errorMsg && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
            {errorMsg}
          </div>
        )}

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#212B36]">
                Shipper Name
              </label>
              <Input
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                placeholder="Enter shipper name"
                className={
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : ""
                }
              />
              {errors.name?.message && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#212B36]">
                Add Email
              </label>
              <Input
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                placeholder="Enter email address"
                className={
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : ""
                }
              />
              {errors.email?.message && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#212B36]">
                Add Phone Number
              </label>
              <PhoneNumberInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter phone number"
                className={
                  errors.phone
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : ""
                }
              />
              {errors.phone?.message && (
                <p className="text-xs text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>
          )}
        />

        <div className="flex items-center justify-between gap-3 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            type="button"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddShipperMailModal;

import { z } from "zod";

export const VENDOR_TYPES = [
  "steel",
  "insulation",
  "panels",
  "trim",
  "hardware",
  "other",
] as const;

export const vendorSchema = z.object({
  vendorName: z.string().min(1, "Vendor Name is required"),
  vendorCode: z.string().min(1, "Vendor Code is required"),
  contactName: z.string().min(1, "Contact Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  yearsWithCompany: z.union([
    z.string(),
    z.number(),
    z.null(),
    z.undefined()
  ]).optional(),
  serviceCategory: z.string().min(1, "Service Category is required"),
  vendorType: z.string().min(1, "Vendor Type is required"),
  materialTypes: z.array(z.string()).min(1, "Select at least one material type"),
  address: z.object({
    placeNumber: z.string().min(1, "Place number is required"),
    streetAddress: z.string().min(1, "Street address is required"),
    landmark: z.string().min(1, "Landmark is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.union([z.string(), z.number()]).refine((val) => {
      const valStr = String(val).trim();
      return /^\d{5}$/.test(valStr);
    }, { message: "US Postal Code must be a 5-digit number." }),
    gpsCoordinates: z.string().min(1, "GPS coordinates are required"),
  }),
  documents: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      size: z.number().optional(),
    })
  ).optional(),
  internalNotes: z.string().optional(),
});

export type VendorFormInput = z.input<typeof vendorSchema>;
export type VendorFormValues = z.output<typeof vendorSchema>;
export type VendorFormInputKeys = keyof VendorFormInput;
export type VendorFormAddressKeys = keyof VendorFormInput["address"];

import { z } from "zod";

export const carrierSchema = z.object({
  vendorName: z.string().min(1, "Carrier Name is required"),
  vendorCode: z.string().optional(),
  contactName: z.string().min(1, "Contact Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  serviceType: z.string().min(1, "Service Type is required"),
  serviceArea: z.string().min(1, "Service Area is required"),
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
  fleetEquipment: z.array(
    z.object({
      equipment: z.string().min(1, "Equipment is required"),
      quantity: z.union([z.string(), z.number()]).transform((val) => {
        const num = Number(val);
        return Number.isNaN(num) ? 0 : num;
      }).refine((val) => val > 0, { message: "Quantity must be greater than 0" }),
    })
  ).optional(),
  fleetCapacity: z.object({
    totalVehicles: z.union([z.string(), z.number()]).transform((val) => {
      const num = Number(val);
      return Number.isNaN(num) ? 0 : num;
    }).refine((val) => val > 0, { message: "Total vehicle count must be greater than 0" }),
    maxLoadCapacity: z.string().min(1, "Maximum load capacity is required"),
    avgFleetAge: z.union([z.string(), z.number()]).transform((val) => {
      const num = Number(val);
      return Number.isNaN(num) ? 0 : num;
    }).refine((val) => val >= 0, { message: "Average fleet age must be 0 or greater" }),
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

export type CarrierFormInput = z.input<typeof carrierSchema>;
export type CarrierFormValues = z.output<typeof carrierSchema>;
export type CarrierFormInputKeys = keyof CarrierFormInput;
export type CarrierFormAddressKeys = keyof CarrierFormInput["address"];

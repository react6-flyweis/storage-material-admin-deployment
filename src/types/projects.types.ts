import type { InstallAddress } from "@/types/address.types";
export type { InstallAddress } from "@/types/address.types";

export interface Project {
  _id: string;
  leadId?: string;
  projectName?: string;
  buildingType?: string;
  location?: string;
  city?: string;
  state?: string;
  pincode?: string;
  installAddress?: InstallAddress;
  businessUnit?: string | null;
  businessUnitLabel?: string;
  jobId?: string;
  lifecycleStatus?: string;
  hasDelivery?: boolean;
  [key: string]: unknown;
}

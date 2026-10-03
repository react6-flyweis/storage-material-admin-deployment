export interface Project {
  _id: string;
  leadId?: string;
  projectName?: string;
  buildingType?: string;
  location?: string;
  businessUnit?: string | null;
  businessUnitLabel?: string;
  jobId?: string;
  lifecycleStatus?: string;
  hasDelivery?: boolean;
  [key: string]: unknown;
}

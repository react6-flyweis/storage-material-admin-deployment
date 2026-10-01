export interface Project {
  _id: string;
  leadId?: string;
  projectName?: string;
  buildingType?: string;
  location?: string;
  jobId?: string;
  lifecycleStatus?: string;
  hasDelivery?: boolean;
  [key: string]: unknown;
}

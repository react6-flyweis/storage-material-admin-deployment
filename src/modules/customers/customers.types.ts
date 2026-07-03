export type AdminCustomerPhone = {
  number?: string;
  countryCode?: string;
};

export type AdminCustomer = {
  _id: string;
  customerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: AdminCustomerPhone;
  isActive?: boolean;
  source?: string;
  inquiryFor?: string;
  createdAt?: string;
  isReturning?: boolean;
  totalProjects?: number;
  companyName?: string;
  jobTitle?: string;
  leadStatus?: string;
  priority?: string;
  notes?: string;
};

export type GetAdminCustomersData = {
  customers: AdminCustomer[];
  total: number;
  page: number;
  limit: number;
};

export type GetAdminCustomersResponse = {
  success: boolean;
  message: string;
  data: GetAdminCustomersData;
};

// Used for projects embedded in the customer detail response
export type AdminCustomerProject = {
  _id: string;
  customerId?: string;
  buildingType?: string;
  location?: string;
  source?: string;
  quoteValue?: number;
  lifecycleStatus?: string;
  isQuoteReady?: boolean;
  isHandedToSales?: boolean;
  isRaisedToPO?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// Type matching the real /api/admin/customers/{id}/projects response
export type CustomerProject = {
  _id: string;
  projectName?: string;
  numberOfBuildings?: number;
  lifecycleStatus?: string;
  assignedSales?: { _id: string; name: string };
  quoteValue?: number;
  isTerminated?: boolean;
  budget?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminCustomerInvoiceLineItem = {
  images?: string[];
  items?: string[];
  rate?: number;
  markup?: number;
  quantity?: number;
  tax?: number;
  total?: number;
  _id?: string;
};

export type AdminCustomerInvoice = {
  _id: string;
  leadId?: string;
  customerId?: string;
  quotationId?: string;
  createdBy?: string;
  invoiceNumber?: string;
  date?: string;
  paymentScheduleId?: string;
  daysToPay?: number;
  poNumber?: string;
  lineItems?: AdminCustomerInvoiceLineItem[];
  subtotal?: number;
  markupTotal?: number;
  discount?: number;
  depositAmount?: number;
  totalAmount?: number;
  status?: string;
  sentAt?: string;
  paidBy?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type GetAdminCustomerDetailData = {
  customer: AdminCustomer;
  totalPaid: number;
  totalPending: number;
  totalInvoices: number;
  projects: AdminCustomerProject[];
  invoices: AdminCustomerInvoice[];
};

export type GetAdminCustomerDetailResponse = {
  success: boolean;
  message: string;
  data: GetAdminCustomerDetailData;
};

export type GetCustomerProjectsResponse = {
  success: boolean;
  message: string;
  data: {
    projects: CustomerProject[];
    total: number;
  };
};

export type GetCustomerInvoicesResponse = {
  success: boolean;
  message: string;
  data: {
    invoices: AdminCustomerInvoice[];
    total: number;
    page: number;
    limit: number;
  };
};

export type CustomerStatsData = {
  totalCustomers?: number;
  activeCustomers?: number;
  totalProjects?: number;
  projectsInExecution?: number;
  projectsNotAssigned?: number;
  completedProjects?: number;
};

export type CustomerStatsResponse = {
  success: boolean;
  message: string;
  data: CustomerStatsData;
};

export type SalesEmployee = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  assignedLeadCount?: number;
};

export type GetSalesEmployeesData = {
  employees: SalesEmployee[];
  total: number;
};

export type GetSalesEmployeesResponse = {
  success: boolean;
  message: string;
  data: GetSalesEmployeesData;
};

export type CreateCustomerRequest = {
  firstName: string;
  email: string;
  phone: string;
  buildingType: string;
  location: string;
  projectName: string;
  countryCode: string;
  assignedSales: string;
};

export type CreateCustomerResponse = {
  success: boolean;
  message: string;
  data: {
    customer: AdminCustomer;
  };
};

export type CreateBasicCustomerRequest = {
  firstName: string;
  email: string;
  phone: string;
  countryCode?: string;
};

export type CreateBasicCustomerResponse = {
  success: boolean;
  message: string;
  data: {
    customer: AdminCustomer;
  };
};

export type EditCustomerRequest = {
  firstName?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  isActive?: boolean;
};

export type EditCustomerResponse = {
  success: boolean;
  message: string;
  data: {
    customer: AdminCustomer & {
      phone?: {
        number?: string;
        countryCode?: string;
      };
    };
    financials?: {
      totalPaid: number;
      pendingPayment: number;
      totalInvoices: number;
      revenueGenerated: number;
    };
  };
};

export type CreateCustomerLeadRequest = {
  projectName: string;
  buildingType: string;
  location: string;
  roofStyle: string;
  width: number;
  length: number;
  height: number;
  doors?: number;
  windows?: number;
  insulation?: number;
  quoteValue?: number;
};

export type CreateCustomerLeadResponse = {
  success: boolean;
  message: string;
  data: any;
};

export type GetCustomersProjectsListResponse = {
  success: boolean;
  message: string;
  data: {
    projects: {
      leadId: string;
      projectName: string;
      jobId: string;
      customerId: string;
      customerName: string;
      quoteValue: number;
      lifecycleStatus: string;
      poRaisedAt?: string;
    }[];
    total: number;
    page: number;
    limit: number;
    scope: string;
  };
};

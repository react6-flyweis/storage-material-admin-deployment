import React, { useState } from "react";
import Modal from "../components/Modal";
import Button from "../components/Button";
import { useLeadsQuery } from "@/modules/leads/leads.hooks";
import { useCustomersQuery } from "@/modules/customers/customers.hooks";

interface ProjectLead {
  _id: string;
  projectName?: string;
  jobId?: string;
  customerId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
  };
}

interface CustomerItem {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface DeliveryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, string>) => void;
}

const DeliveryFilterModal: React.FC<DeliveryFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [project, setProject] = useState("");
  const [customer, setCustomer] = useState("");

  const { data: leadsResponse } = useLeadsQuery(1, 100);
  const { data: customersResponse } = useCustomersQuery(1, 100);

  const projectsList = (leadsResponse?.data?.leads || []) as unknown as ProjectLead[];
  const customersList = (customersResponse?.data?.customers || []) as unknown as CustomerItem[];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({ project, customer });
  };

  const handleClear = () => {
    setProject("");
    setCustomer("");
    onApply({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader width="max-w-[440px]">
      <form onSubmit={handleApply} className="p-4 md:p-6 space-y-6 font-inter text-left">
        <div>
          <h2 className="text-xl font-bold text-[#212B36]">Filters</h2>
          <p className="text-sm text-[#637381] mt-1">Filter calendar events by project or customer</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#212B36] uppercase tracking-wider">Project</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1E51A4] text-sm bg-white cursor-pointer"
            >
              <option value="">Select Project</option>
              {projectsList.map((p: ProjectLead) => {
                const customerName = p.customerId
                  ? `${p.customerId.firstName || ""} ${p.customerId.lastName || ""}`.trim()
                  : "";
                const projectId = p.jobId || p._id;
                const displayName = p.projectName || (customerName ? `${customerName} - ${projectId}` : projectId);
                return (
                  <option key={p._id} value={p._id}>
                    {displayName}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#212B36] uppercase tracking-wider">Customer</label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1E51A4] text-sm bg-white cursor-pointer"
            >
              <option value="">Select Customer</option>
              {customersList.map((c: CustomerItem) => {
                const nameFromFirstLast = `${c.firstName || ""} ${c.lastName || ""}`.trim();
                const customerName = c.name || nameFromFirstLast;
                const customerEmail = c.email || "";
                const displayName = customerName && customerEmail
                  ? `${customerName} (${customerEmail})`
                  : customerName || customerEmail || c._id;
                return (
                  <option key={c._id} value={c._id}>
                    {displayName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button variant="primary" onClick={handleClear} type="button">Clear All</Button>
          <div className="flex gap-3">
            <Button variant="primary" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Apply</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default DeliveryFilterModal;

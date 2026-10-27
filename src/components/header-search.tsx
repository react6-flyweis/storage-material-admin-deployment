import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminLeadsQuery } from "@/modules/leads/leads.hooks";
import { useCustomersQuery } from "@/modules/customers/customers.hooks";
import {
  getLeadLifecycleBadgeClassName,
  getLeadLifecycleStatusLabel,
} from "@/modules/leads/lead-lifecycle";
import { formatPhone, cn } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function HeaderSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: leadsData, isLoading: isLeadsLoading } = useAdminLeadsQuery(
    { search: debouncedSearch.trim(), page: 1, limit: 6 },
    { enabled: Boolean(debouncedSearch.trim()) }
  );

  const { data: customersData, isLoading: isCustomersLoading } =
    useCustomersQuery(
      1,
      6,
      { search: debouncedSearch.trim() },
      { enabled: Boolean(debouncedSearch.trim()) }
    );

  const leads = leadsData?.data?.leads ?? [];
  const customers = customersData?.data?.customers ?? [];

  const isDebouncing = searchTerm.trim() !== debouncedSearch.trim();
  const isLoading =
    (isLeadsLoading || isCustomersLoading || isDebouncing) &&
    Boolean(searchTerm.trim());

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectLead = (leadId: string) => {
    setIsOpen(false);
    setSearchTerm("");
    navigate(`/leads/${leadId}`);
  };

  const handleSelectCustomer = (customerId: string) => {
    setIsOpen(false);
    setSearchTerm("");
    navigate(`/customers/${customerId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && isOpen) {
      if (leads.length > 0) {
        handleSelectLead(leads[0]._id);
      } else if (customers.length > 0) {
        handleSelectCustomer(customers[0]._id);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-48 md:w-72 lg:w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (searchTerm.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search leads, customers..."
          className="pl-9 pr-8 bg-gray-50 border-gray-200 text-sm focus-visible:bg-white transition-colors"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && Boolean(searchTerm.trim()) && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-72">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span>Searching leads and customers...</span>
            </div>
          ) : leads.length === 0 && customers.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              No results found
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {leads.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100">
                    Leads ({leads.length})
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {leads.map((lead) => {
                      const projectName =
                        lead.projectName?.trim() || "Untitled Project";
                      const customerName =
                        [lead.customerId?.firstName, lead.customerId?.lastName]
                          .filter(Boolean)
                          .join(" ")
                          .trim() || "Unknown Customer";

                      return (
                        <li key={lead._id}>
                          <button
                            type="button"
                            onClick={() => handleSelectLead(lead._id)}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 transition-colors flex flex-col gap-0.5 group cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {projectName}
                              </span>
                              {lead.lifecycleStatus && (
                                <span
                                  className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0",
                                    getLeadLifecycleBadgeClassName(
                                      lead.lifecycleStatus
                                    )
                                  )}
                                >
                                  {getLeadLifecycleStatusLabel(
                                    lead.lifecycleStatus
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="truncate">{customerName}</span>
                              {lead.jobId && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="font-mono text-[11px] text-gray-400">
                                    #{lead.jobId}
                                  </span>
                                </>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {customers.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100">
                    Customers ({customers.length})
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {customers.map((customer) => {
                      const fullName = [customer.firstName, customer.lastName]
                        .filter(Boolean)
                        .join(" ")
                        .trim();
                      const displayName =
                        fullName ||
                        customer.customerName ||
                        "Unknown Customer";

                      const phoneStr =
                        typeof customer.phone === "object" && customer.phone
                          ? formatPhone(
                              customer.phone.number,
                              customer.phone.countryCode
                            )
                          : typeof customer.phone === "string"
                          ? formatPhone(customer.phone)
                          : "";
                      const displayPhone =
                        phoneStr && phoneStr !== "N/A" ? phoneStr : "";

                      const isActive =
                        customer.isActive ??
                        (customer.status?.toLowerCase() === "active");

                      return (
                        <li key={customer._id}>
                          <button
                            type="button"
                            onClick={() => handleSelectCustomer(customer._id)}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 transition-colors flex flex-col gap-0.5 group cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {displayName}
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 inline-flex items-center gap-1",
                                  isActive
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                )}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {customer.email && (
                                <span className="truncate">
                                  {customer.email}
                                </span>
                              )}
                              {customer.email && displayPhone && (
                                <span className="text-gray-300">•</span>
                              )}
                              {displayPhone && (
                                <span className="shrink-0">{displayPhone}</span>
                              )}
                              {!customer.email && !displayPhone && (
                                <span className="text-gray-400">
                                  No contact info
                                </span>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

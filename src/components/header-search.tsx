import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, Loader2, X, Briefcase, User, FolderKanban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDashboardSearchQuery } from "@/modules/dashboard/dashboard.hooks";
import {
  getLeadLifecycleBadgeClassName,
  getLeadLifecycleStatusLabel,
} from "@/modules/leads/lead-lifecycle";
import { cn } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function formatCurrency(amount?: number) {
  if (amount === undefined || amount === null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function HeaderSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: searchResponse, isLoading: isSearchLoading } =
    useDashboardSearchQuery(debouncedSearch.trim(), 20, {
      enabled: Boolean(debouncedSearch.trim()),
    });

  const searchData = searchResponse?.data;
  const leads = searchData?.leads ?? [];
  const projects = searchData?.projects ?? [];
  const customers = searchData?.customers ?? [];

  const isDebouncing = searchTerm.trim() !== debouncedSearch.trim();
  const isLoading =
    (isSearchLoading || isDebouncing) && Boolean(searchTerm.trim());

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

  const handleSelectProject = (projectId: string) => {
    setIsOpen(false);
    setSearchTerm("");
    navigate(`/plant/projects?id=${projectId}`);
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
        handleSelectLead(leads[0].id);
      } else if (projects.length > 0) {
        handleSelectProject(projects[0].id);
      } else if (customers.length > 0) {
        handleSelectCustomer(customers[0].id);
      }
    }
  };

  const totalResults = leads.length + projects.length + customers.length;

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
          placeholder="Search leads, projects, customers..."
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
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-80">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span>Searching leads, projects, and customers...</span>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              No results found for &quot;{searchTerm}&quot;
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {/* Leads */}
              {leads.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 text-blue-500" />
                    <span>Leads ({leads.length})</span>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {leads.map((lead) => (
                      <li key={lead.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectLead(lead.id)}
                          className="w-full text-left px-3.5 py-2 hover:bg-gray-50 transition-colors flex flex-col gap-0.5 group cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {lead.name}
                            </span>
                            {lead.status && (
                              <span
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0",
                                  getLeadLifecycleBadgeClassName(lead.status)
                                )}
                              >
                                {getLeadLifecycleStatusLabel(lead.status)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {lead.projectName && (
                              <span className="truncate">{lead.projectName}</span>
                            )}
                            {lead.projectId && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="font-mono text-[11px] text-gray-400">
                                  #{lead.projectId}
                                </span>
                              </>
                            )}
                            {lead.value !== undefined && lead.value > 0 && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="font-medium text-emerald-600">
                                  {formatCurrency(lead.value)}
                                </span>
                              </>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
                    <FolderKanban className="h-3 w-3 text-purple-500" />
                    <span>Projects ({projects.length})</span>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {projects.map((project) => (
                      <li key={project.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectProject(project.id)}
                          className="w-full text-left px-3.5 py-2 hover:bg-gray-50 transition-colors flex flex-col gap-0.5 group cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                              {project.name}
                            </span>
                            {project.status && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 bg-purple-50 text-purple-700 border border-purple-200">
                                {project.status.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                          {project.projectId && (
                            <div className="text-xs text-gray-500 font-mono">
                              #{project.projectId}
                            </div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Customers */}
              {customers.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
                    <User className="h-3 w-3 text-green-500" />
                    <span>Customers ({customers.length})</span>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {customers.map((customer) => (
                      <li key={customer.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectCustomer(customer.id)}
                          className="w-full text-left px-3.5 py-2 hover:bg-gray-50 transition-colors flex flex-col gap-0.5 group cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm text-gray-900 group-hover:text-green-600 transition-colors truncate">
                              {customer.name}
                            </span>
                          </div>
                          {customer.email && (
                            <div className="text-xs text-gray-500 truncate">
                              {customer.email}
                            </div>
                          )}
                        </button>
                      </li>
                    ))}
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

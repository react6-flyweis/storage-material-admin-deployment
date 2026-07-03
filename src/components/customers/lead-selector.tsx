import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadsQuery } from "@/modules/leads/leads.hooks";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  customerId?: string;
  placeholder?: string;
  className?: string;
  error?: boolean;
};

export default function LeadSelector({
  value,
  onValueChange,
  customerId,
  placeholder = "Search leads...",
  className = "w-full",
  error,
}: Props) {
  // Fetch leads from API
  const { data: leadsData, isLoading } = useLeadsQuery(1, 100, {
    customerId: customerId || undefined,
  });

  const leads = useMemo(() => {
    if (!leadsData?.data?.leads) return [];
    
    return leadsData.data.leads.map(lead => {
      let name = lead.projectName || `Lead ${lead._id.slice(-6)}`;
      name = name.replace(/\s\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z/g, '').trim();
      
      return {
        id: lead._id,
        name,
        buildingType: lead.buildingType || '',
        location: lead.location || '',
        status: lead.lifecycleStatus || 'New',
      };
    });
  }, [leadsData]);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn(className, error ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500" : "")} aria-invalid={error}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">
            No leads found
          </div>
        ) : (
          leads.map((lead) => (
            <SelectItem key={lead.id} value={lead.id}>
              <div className="flex flex-col">
                <span className="font-medium">{lead.name}</span>
                <span className="text-xs text-gray-500">
                  {lead.buildingType} 
                </span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
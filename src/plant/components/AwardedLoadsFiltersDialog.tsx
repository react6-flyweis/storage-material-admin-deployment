import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AwardedLoadsFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AwardedLoadsFiltersDialog({
  open,
  onOpenChange,
}: AwardedLoadsFiltersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-8 rounded-3xl overflow-hidden border-0 bg-white">
        
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-8 mt-2">Filters</h2>

        <div className="flex flex-col gap-6 items-center justify-center mb-8">
          
          {/* Row 1 */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full">
            <div className="flex items-center justify-between w-[200px] font-bold text-lg px-2">
              <button className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <span>March 2024</span>
              <button className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            <Select>
              <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="All Deliveries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deliveries</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p1">Project 1</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Delivery Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="d1">Type 1</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Color by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c1">Status 1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full">
            <Select>
              <SelectTrigger className="w-[150px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">Vendor 1</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[150px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c1">Carrier 1</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[150px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Site Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sl1">Location 1</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[150px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p1">Priority 1</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[160px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Internal Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="io1">Owner 1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 3 */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full">
            <Select>
              <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="s1">Status 1</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Delivery" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="d1">Delivery 1</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ch1">Channel 1</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>

        <div className="flex justify-center mt-4">
          <Button 
            className="w-[120px] h-11 rounded-full text-base font-medium bg-[#3b59df] hover:bg-[#2b41b3] text-white"
            onClick={() => onOpenChange(false)}
          >
            Apply
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

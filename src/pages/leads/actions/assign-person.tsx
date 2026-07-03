import React from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AssignPerson() {
  const navigate = useNavigate();
  const { leadId } = useParams();

  return (
    <div className="flex-1 bg-[#f8fafc] min-h-screen p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border shadow-sm mt-10 overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Assign Plant person</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-700 font-medium">Assign Plant</label>
            <Select defaultValue="james">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="james">James Lee</SelectItem>
                <SelectItem value="sarah">Sarah Connor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-700 font-medium">Priority</label>
              <Select defaultValue="low">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-700 font-medium">Select Panel</label>
              <Select defaultValue="plant">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select panel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plant">Plant</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-700 font-medium">Notes</label>
            <Textarea 
              defaultValue="James Lee"
              className="min-h-[120px] resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            className="w-32 bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
            onClick={() => navigate(`/leads/${leadId}`)}
          >
            Cancel
          </Button>
          <Button 
            className="w-32 bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
            onClick={() => navigate(`/leads/${leadId}`)}
          >
            Assign Project
          </Button>
        </div>
      </div>
    </div>
  );
}

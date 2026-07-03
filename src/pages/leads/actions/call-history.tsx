import React from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";

export default function CallHistory() {
  const navigate = useNavigate();
  const { leadId } = useParams();

  return (
    <div className="flex-1 bg-[#f8fafc] min-h-screen p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border shadow-sm mt-10 overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">Call History</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border rounded-md p-4 text-sm text-gray-600">
            <span>May 1, 2026</span>
            <span>9.00 PM</span>
            <span>2 Calls</span>
          </div>
          <div className="flex items-center justify-between border rounded-md p-4 text-sm text-gray-600">
            <span>May 1, 2026</span>
            <span>9.00 PM</span>
            <span>2 Calls</span>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <Button 
            className="w-24 bg-gray-500 hover:bg-gray-600 text-white"
            onClick={() => navigate(`/leads/${leadId}`)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

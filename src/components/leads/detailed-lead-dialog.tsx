import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AssignSalesDialog from "@/components/leads/assign-sales-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: string;
    name: string;
    workshop?: string;
    category?: string;
    assignedToName?: string;
    quoteValue?: string;
    status?: string;
  };
};

export default function DetailedLeadDialog({
  open,
  onOpenChange,
  lead,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Lead Details - {lead.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Contact Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Name</div>
                <div className="text-gray-900">{lead.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="text-gray-900">john@doe.com</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div className="text-gray-900">+1 (555) 123-4567</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="text-gray-900">Dallas, TX</div>
              </div>
            </div>
          </div>

          {/* Building Requirements */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Building Requirements
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Building Type</div>
                <div className="text-gray-900">
                  {lead.workshop || "Workshop"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Dimensions</div>
                <div className="text-gray-900">30' x 40' x 12'</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Roof Style</div>
                <div className="text-gray-900">Gable Roof</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Wind Load</div>
                <div className="text-gray-900">120 mph</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Snow Load</div>
                <div className="text-gray-900">20 psf</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Estimated Delivery</div>
                <div className="text-gray-900">4-6 weeks</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Price Range</div>
                <div className="text-gray-900">
                  {lead.quoteValue || "$24,500 - $28,000"}
                </div>
              </div>
            </div>
          </div>

          {/* Lead Management */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Lead Management
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1">
                  <Badge className="bg-purple-100 text-purple-700">
                    {lead.status || "In Pipeline"}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Handler Type</div>
                <div className="mt-1">
                  <Badge className="bg-blue-100 text-blue-700">AI</Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Lead Score</div>
                <div className="mt-1">
                  <Badge className="bg-red-100 text-red-700">HOT</Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Assigned To</div>
                <div className="text-gray-900">
                  {lead.assignedToName || "AI Assistant"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Last Contact</div>
                <div className="text-gray-900">2024-01-15</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Next Follow-up</div>
                <div className="text-gray-900">2024-01-18</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Handling Summary */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            AI Handling Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">AI Qualification</div>
              <div className="text-sm text-gray-900">
                Qualified – Budget OK, Timeline Realistic
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Quotation Status</div>
              <div className="text-sm text-gray-900">Created by AI - sent</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">
              AI Conversation Summary
            </div>
            <ul className="text-sm text-gray-900 space-y-1 list-disc list-inside">
              <li>Initial quote request received</li>
              <li>AI confirmed building specifications</li>
              <li>Customer interested in premium options</li>
            </ul>
          </div>
        </div>

        {/* Included Materials and Optional Add-ons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Included Materials
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Frame
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Roof
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Panels
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Trim
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Fasteners
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Drawings
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Engineer Plans
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Optional Add-ons
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Doors
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Windows
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Skylights
              </Badge>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Activity Log
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
              <div className="text-sm">
                <div className="text-gray-900">Lead created</div>
                <div className="text-xs text-gray-500">
                  by System on 2024-01-16
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
              <div className="text-sm">
                <div className="text-gray-900">AI qualification completed</div>
                <div className="text-xs text-gray-500">
                  by AI Assistant on 2024-01-15
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
              <div className="text-sm">
                <div className="text-gray-900">Quotation sent</div>
                <div className="text-xs text-gray-500">
                  by AI Assistant on 2024-01-18
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <AssignSalesDialog
            leadId={lead.id}
            trigger={
              <Button className="bg-blue-600 hover:bg-blue-700">
                Assign Lead
              </Button>
            }
          />
          <Button className="bg-green-600 hover:bg-green-700">Edit Lead</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

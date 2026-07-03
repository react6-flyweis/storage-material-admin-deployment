import type { ReactNode } from "react";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SuccessDialog from "@/components/success-dialog";
import AssignPoPlantDialog from "@/components/leads/assign-po-plant-dialog";
import { useUpdatePurchaseOrderStatusMutation, usePurchaseOrderDetailsQuery } from "@/modules/purchase-orders/purchase-orders.hooks";
import { toast } from "sonner";

type ActivityLogEntry = {
  id: string;
  title: string;
  timestamp: string;
};

type PurchaseOrderDetails = {
  leadId: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  buildingRequirements: {
    buildingType: string;
    dimensions: string;
    roofStyle: string;
    windLoad: string;
    snowLoad: string;
    estimatedDelivery: string;
    priceRange: string;
  };
  leadManagement: {
    status: string;
    handlerType: string;
    leadScore: string;
    assignedTo: string;
    lastContact: string;
    nextFollowUp: string;
  };
  paymentDetails: {
    received: string;
    pending: string;
  };
  aiHandlingSummary: {
    qualification: string;
    conversationSummary: string[];
    quotationStatus: string;
  };
  includedMaterials: string[];
  optionalAddOns: string[];
  activityLog: ActivityLogEntry[];
};

const details: PurchaseOrderDetails = {
  leadId: "Q-2025-1047",
  contact: {
    name: "John Doe",
    email: "john@doe.com",
    phone: "+1 (555) 123-4567",
    location: "Dallas, TX",
  },
  buildingRequirements: {
    buildingType: "Workshop",
    dimensions: "30' x 40' x 12'",
    roofStyle: "Gable Roof",
    windLoad: "120 mph",
    snowLoad: "20 psf",
    estimatedDelivery: "4-6 weeks",
    priceRange: "$24,500 - $28,000",
  },
  leadManagement: {
    status: "In Pipeline",
    handlerType: "AI",
    leadScore: "HOT",
    assignedTo: "AI Assistant",
    lastContact: "2024-01-15",
    nextFollowUp: "2024-01-18",
  },
  paymentDetails: {
    received: "$208742",
    pending: "$208742",
  },
  aiHandlingSummary: {
    qualification: "Qualified - Budget OK, Timeline Realistic",
    conversationSummary: [
      "Initial quote request received",
      "AI confirmed building specifications",
      "Customer interested in premium options",
    ],
    quotationStatus: "Created by AI - sent",
  },
  includedMaterials: [
    "Frame",
    "Roof",
    "Panels",
    "Trim",
    "Fasteners",
    "Drawings",
    "Engineer Plans",
  ],
  optionalAddOns: ["Doors", "Windows", "Skylights"],
  activityLog: [
    { id: "1", title: "Lead created", timestamp: "by System on 2024-01-15" },
    {
      id: "2",
      title: "AI qualification completed",
      timestamp: "by AI Assistant on 2024-01-15",
    },
    {
      id: "3",
      title: "Quotation sent",
      timestamp: "by AI Assistant on 2024-01-16",
    },
  ],
};

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
      {children}
    </p>
  );
}

export default function PurchaseOrderDetailsPage() {
  const formatActionString = (action: string) => {
    if (!action) return "";
    return action
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const navigate = useNavigate();
  const { poId: poOrderId } = useParams();
  const [assignPlantDialogOpen, setAssignPlantDialogOpen] = useState(false);

  const { data: apiResponse, isLoading, error } = usePurchaseOrderDetailsQuery(poOrderId);
  const apiData = apiResponse?.data || apiResponse;
  
  const orderDetails = apiData?.order;
  const leadDetails = apiData?.lead;
  const auditLogs = apiData?.auditLog || [];
  const customerInfo = leadDetails?.customerId || apiData?.customer || {};

  const updateStatusMutation = useUpdatePurchaseOrderStatusMutation();

  const handleApprove = () => {
    if (!poOrderId) return;
    updateStatusMutation.mutate(
      { poOrderId, status: "approved" },
      {
        onSuccess: () => {
          setAssignPlantDialogOpen(true);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to approve PO");
        }
      }
    );
  };

  const handleReject = () => {
    if (!poOrderId) return;
    updateStatusMutation.mutate(
      { poOrderId, status: "rejected" },
      {
        onSuccess: () => {
          toast.success("Purchase order rejected");
          navigate("/leads/purchase-orders");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to reject PO");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#e9eef8] p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/leads/purchase-orders")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl text-slate-900">PO Details</h1>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
          >
            View Customer Profile
          </Button>
          {orderDetails?.status !== "approved" && orderDetails?.status !== "rejected" && (
            <>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={updateStatusMutation.isPending}
                className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Reject
              </Button>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updateStatusMutation.isPending || leadDetails?.lifecycleStatus !== "payment_done"}
                onClick={handleApprove}
                title={leadDetails?.lifecycleStatus !== "payment_done" ? "Lead must be paid to approve" : ""}
              >
                Approve PO
              </Button>
            </>
          )}
          {orderDetails?.status === "approved" && !orderDetails?.assignedTo && leadDetails?.lifecycleStatus === "payment_done" && (
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => setAssignPlantDialogOpen(true)}
            >
              Assign Plant
            </Button>
          )}
        </div>
      </div>

      <Card className="mx-auto max-w-305 border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading details...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load purchase order details.</div>
        ) : (
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="mb-4 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            PO Number: {orderDetails?.poNumber || details.leadId}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section>
              <h2 className="text-sm font-semibold text-slate-800">
                Contact Information
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Name</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {customerInfo?.firstName || details.contact.name}
                  </p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {customerInfo?.email || details.contact.email}
                  </p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {customerInfo?.phone?.number || details.contact.phone}
                  </p>
                </div>
                <div>
                  <Label>Location / Project</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {leadDetails?.projectName || details.contact.location}
                  </p>
                </div>
                <div>
                  <Label>Payment Details</Label>
                  <div className="mt-1 space-y-2 text-sm text-slate-900">
                    <div>
                      <Label>Payment Received</Label>
                      <p className="mt-1">{details.paymentDetails.received}</p>
                    </div>
                    <div>
                      <Label>Payment Pending</Label>
                      <p className="mt-1">{details.paymentDetails.pending}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-800">
                Building Requirements
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Building Type</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.buildingType}
                  </p>
                </div>
                <div>
                  <Label>Dimensions</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.dimensions}
                  </p>
                </div>
                <div>
                  <Label>Roof Style</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.roofStyle}
                  </p>
                </div>
                <div>
                  <Label>Wind Load</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.windLoad}
                  </p>
                </div>
                <div>
                  <Label>Snow Load</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.snowLoad}
                  </p>
                </div>
                <div>
                  <Label>Estimated Delivery</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.estimatedDelivery}
                  </p>
                </div>
                <div>
                  <Label>Price Range</Label>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {details.buildingRequirements.priceRange}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-800">
                Lead Management
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Status</Label>
                  <Badge className="mt-1 rounded-full border-0 bg-violet-100 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 hover:bg-violet-100">
                    {orderDetails?.status || details.leadManagement.status}
                  </Badge>
                </div>
                <div>
                  <Label>Lifecycle Status</Label>
                  <Badge className="mt-1 rounded-full border-0 bg-violet-100 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 hover:bg-violet-100">
                    {leadDetails?.lifecycleStatus || details.leadManagement.handlerType}
                  </Badge>
                </div>
                <div>
                  <Label>Lead Score</Label>
                  <Badge className="mt-1 rounded-full border-0 bg-red-100 px-2.5 py-0.5 text-[11px] font-medium text-red-600 hover:bg-red-100">
                    {details.leadManagement.leadScore}
                  </Badge>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {orderDetails?.assignedTo?.name || details.leadManagement.assignedTo}
                  </p>
                </div>
                <div>
                  <Label>Last Contact</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.leadManagement.lastContact}
                  </p>
                </div>
                <div>
                  <Label>Next Follow-up</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.leadManagement.nextFollowUp}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold text-slate-800">
              AI Handling Summary
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <Label>AI Qualification</Label>
                <p className="mt-1 text-sm text-slate-900">
                  {details.aiHandlingSummary.qualification}
                </p>

                <div className="mt-4">
                  <Label>AI Conversation Summary</Label>
                  <ul className="mt-2 space-y-1.5">
                    {details.aiHandlingSummary.conversationSummary.map(
                      (item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                          <span>{item}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>

              <div>
                <Label>Quotation Status</Label>
                <p className="mt-1 text-sm text-slate-900">
                  {details.aiHandlingSummary.quotationStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Included Materials
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {details.includedMaterials.map((material) => (
                  <Badge
                    key={material}
                    className="rounded-full border-0 bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    {material}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Optional Add-ons
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {details.optionalAddOns.map((addon) => (
                  <Badge
                    key={addon}
                    className="rounded-full border-0 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    {addon}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold text-slate-800">
              Activity Log
            </h2>
            <div className="mt-4 space-y-5">
              {auditLogs.length > 0 ? auditLogs.map((entry: any, index: number) => (
                <div key={entry._id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500" />
                    {index !== auditLogs.length - 1 ? (
                      <div className="h-10 w-px bg-slate-200" />
                    ) : null}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium text-slate-900">
                      {formatActionString(entry.action)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      by {entry.performedBy?.name} on {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : details.activityLog.map((entry, index) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500" />
                    {index !== details.activityLog.length - 1 ? (
                      <div className="h-10 w-px bg-slate-200" />
                    ) : null}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium text-slate-900">
                      {entry.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        )}
      </Card>

      <AssignPoPlantDialog
        open={assignPlantDialogOpen}
        onOpenChange={(open) => setAssignPlantDialogOpen(open)}
        poOrderId={poOrderId ?? null}
      />
    </div>
  );
}

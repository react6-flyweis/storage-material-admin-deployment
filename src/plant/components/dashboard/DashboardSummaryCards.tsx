import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useShipperQuotationSummaryQuery,
  usePackingListSummaryQuery,
  useQrLabelsSummaryQuery,
  useShippersSummaryQuery,
  useDeliveriesSummaryQuery,
} from "@/modules/plant/dashboard.hooks";

// Icons
function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function QrCodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}

function TruckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
      <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
      <circle cx="7" cy="18" r="2" />
      <path d="M15 18H9" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

interface SummaryCardProps {
  title: string;
  icon: React.ReactNode;
  isLoading: boolean;
  isError: boolean;
  rows: Array<{ label: string; value?: number }>;
  viewLink: string;
  viewLinkLabel: string;
}

function SummaryCard({
  title,
  icon,
  isLoading,
  isError,
  rows,
  viewLink,
  viewLinkLabel,
}: SummaryCardProps) {
  return (
    <Card className="shadow-sm h-full">
      <CardContent className="p-5 flex flex-col h-full justify-between">
        <div>
          <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center mb-4 text-orange-600">
            {icon}
          </div>
          <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
          
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-xs text-red-500 min-h-[60px] flex items-center justify-center">
              Failed to load
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-medium text-gray-900">{row.value ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t text-center">
          <Button variant="link" className="text-blue-600 h-auto p-0 font-medium text-sm" asChild>
            <Link to={viewLink}>{viewLinkLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardSummaryCards() {
  const quoteQuery = useShipperQuotationSummaryQuery();
  const packingQuery = usePackingListSummaryQuery();
  const qrQuery = useQrLabelsSummaryQuery();
  const shippersQuery = useShippersSummaryQuery();
  const deliveriesQuery = useDeliveriesSummaryQuery();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {/* Shipper Quotations */}
      <SummaryCard
        title="Shipper Quotations"
        icon={<FileTextIcon className="w-4 h-4" />}
        isLoading={quoteQuery.isLoading}
        isError={quoteQuery.isError}
        rows={[
          { label: "Requested", value: quoteQuery.data?.data?.requested },
          { label: "Quoted", value: quoteQuery.data?.data?.quoted },
          { label: "Pending", value: quoteQuery.data?.data?.pending },
        ]}
        viewLink="/plant/shipper-quotation"
        viewLinkLabel="View All Quotations"
      />

      {/* Packing List */}
      <SummaryCard
        title="Packing List"
        icon={<ListIcon className="w-4 h-4" />}
        isLoading={packingQuery.isLoading}
        isError={packingQuery.isError}
        rows={[
          { label: "Generated", value: packingQuery.data?.data?.generated },
          { label: "In Progress", value: packingQuery.data?.data?.inProgress },
          { label: "Pending", value: packingQuery.data?.data?.pending },
        ]}
        viewLink="/plant/packing-list"
        viewLinkLabel="View Packing List"
      />

      {/* QR Labels */}
      <SummaryCard
        title="QR Labels"
        icon={<QrCodeIcon className="w-4 h-4" />}
        isLoading={qrQuery.isLoading}
        isError={qrQuery.isError}
        rows={[
          { label: "Generated", value: qrQuery.data?.data?.generated },
          { label: "In Progress", value: qrQuery.data?.data?.inProgress },
          { label: "Pending", value: qrQuery.data?.data?.pending },
        ]}
        viewLink="/plant/qr-labels"
        viewLinkLabel="View QR Labels"
      />

      {/* Shippers */}
      <SummaryCard
        title="Shippers"
        icon={<TruckIcon className="w-4 h-4" />}
        isLoading={shippersQuery.isLoading}
        isError={shippersQuery.isError}
        rows={[
          { label: "Active Shippers", value: shippersQuery.data?.data?.activeShippers },
          { label: "Orders with Shippers", value: shippersQuery.data?.data?.ordersWithShippers },
          { label: "Pending Assignments", value: shippersQuery.data?.data?.pendingAssignments },
        ]}
        viewLink="/plant/shippers"
        viewLinkLabel="Manage Shippers"
      />

      {/* Deliveries */}
      <SummaryCard
        title="Deliveries"
        icon={<PackageIcon className="w-4 h-4" />}
        isLoading={deliveriesQuery.isLoading}
        isError={deliveriesQuery.isError}
        rows={[
          { label: "Scheduled", value: deliveriesQuery.data?.data?.scheduled },
          { label: "In Transit", value: deliveriesQuery.data?.data?.inTransit },
          { label: "Delivered", value: deliveriesQuery.data?.data?.delivered },
        ]}
        viewLink="/plant/all-deliveries"
        viewLinkLabel="View Deliveries"
      />
    </div>
  );
}

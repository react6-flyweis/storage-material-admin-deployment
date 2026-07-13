import React, { useState } from "react";
import {
  ArrowLeft,
  Truck,
  TrendingDown,
  BarChart3,
  Zap,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import {
  AwardLoadModal,
  AwardSuccessModal,
  RequestRevisionModal,
  RevisionSuccessModal,
} from "./AwardLoadModals";
import {
  useDeliveryFreightBidsQuery,
  useDeliveryDetailQuery,
  useSelectFreightBidMutation,
  useRequestFreightBidRevisionMutation,
} from "@/modules/plant/freight.hooks";
import type { FreightBidItem } from "@/modules/plant/freight.api";

import BidCard from "./BidCard";
import FreightRequestDetailsTab from "./FreightRequestDetailsTab";
import FreightStatCard from "./FreightStatCard";

// --- Types ---
interface RevisionData {
  targetAmount: string;
  message: string;
}

interface FilterDropdownProps {
  label: string;
  activeTab: string;
  onTabChange: (val: string) => void;
  options: { label: string; value: string }[];
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  activeTab,
  onTabChange,
  options,
}) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 font-medium whitespace-nowrap">{label}</span>
      <select
        value={activeTab}
        onChange={(e) => onTabChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-[#051321] font-medium bg-white focus:border-blue-400 transition-all cursor-pointer text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// --- Main Component ---
const FreightRequestDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 'id' from route matching plant/freight-request-details/:id
  const [activeTab, setActiveTab] = useState("Bid Comparison");
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isRevisionSuccessOpen, setIsRevisionSuccessOpen] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<FreightBidItem | null>(null);
  const [revisionData, setRevisionData] = useState<RevisionData>({ targetAmount: "", message: "" });
  const [sortBy, setSortBy] = useState("low");
  const [awardedDeliveryId, setAwardedDeliveryId] = useState<string>("");
  const [selectError, setSelectError] = useState<string>("");
  const [revisionError, setRevisionError] = useState<string>("");

  const { data: projectDeliveryData, isLoading: isDeliveryLoading } = useDeliveryDetailQuery(id || "", { enabled: !!id });
  const delivery = projectDeliveryData?.data?.delivery;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const deliveryDateFormatted = delivery?.deliverySchedule?.deliveryDate || delivery?.formDetails?.deliveryDate
    ? `${formatDate(delivery.deliverySchedule?.deliveryDate || delivery.formDetails?.deliveryDate)}${delivery.formDetails?.deliveryTime || delivery.deliverySchedule?.timeWindow ? ` (${delivery.formDetails?.deliveryTime || delivery.deliverySchedule?.timeWindow})` : ""}`
    : "—";

  const deliveryPoc = delivery?.receivingPocDetails?.receivingPoc || delivery?.formDetails?.receivingPoc || "—";
  const deliveryLocation = delivery?.formDetails?.deliveryLocation || delivery?.deliverySchedule?.dropoffAddress || "—";

  const { mutateAsync: selectFreightBid, isPending: isSelectingBid } = useSelectFreightBidMutation();
  const { mutateAsync: requestFreightBidRevision, isPending: isRevisingBid } = useRequestFreightBidRevisionMutation();

  const sortParam = sortBy === "low" ? "low_to_high" : "high_to_low";
  const { data: bidsResponse, isLoading: isBidsLoading, error, refetch } = useDeliveryFreightBidsQuery(
    delivery?.deliveryId ?? "",
    sortParam,
    { enabled: !!delivery?.deliveryId }
  );

  const isLoading = isDeliveryLoading || (delivery?.deliveryId ? isBidsLoading : false);

  const handleAwardClick = (bidId: string) => {
    const bid = bidsResponse?.data?.bids?.find((bid) => bid.bidId === bidId);
    if (!bid) return;
    setSelectedCarrier(bid);
    setSelectError("");
    setIsAwardModalOpen(true);
  };

  const handleRevisionClick = (bidId: string) => {
    const bid = bidsResponse?.data?.bids?.find((bid) => bid.bidId === bidId);
    if (!bid) return;
    setSelectedCarrier(bid);
    setRevisionError("");
    setIsRevisionModalOpen(true);
  };

  const handleConfirmAward = async () => {
    if (!selectedCarrier?.bidId) {
      setSelectError("Invalid bid selection.");
      return;
    }
    setSelectError("");
    try {
      const response = await selectFreightBid(selectedCarrier.bidId);
      setAwardedDeliveryId(response.deliveryId);
      setIsAwardModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      const errMsg = errorObj?.data?.message || errorObj?.message || "Failed to award bid. Please try again.";
      setSelectError(errMsg);
    }
  };

  const handleConfirmRevision = async (data: RevisionData) => {
    if (!selectedCarrier?.bidId) {
      setRevisionError("Invalid bid selection.");
      return;
    }
    setRevisionError("");
    try {
      const cleanAmount = data.targetAmount.replace(/[^0-9.]/g, "");
      const parsedAmount = cleanAmount ? Number(cleanAmount) : undefined;
      const bidAmount = (parsedAmount !== undefined && !isNaN(parsedAmount)) ? parsedAmount : undefined;

      await requestFreightBidRevision({
        bidId: selectedCarrier.bidId,
        body: {
          note: data.message,
          bidAmount,
        },
      });
      setRevisionData(data);
      setIsRevisionModalOpen(false);
      setIsRevisionSuccessOpen(true);
      refetch();
    } catch (err) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      const errMsg = errorObj?.data?.message || errorObj?.message || "Failed to request revision. Please try again.";
      setRevisionError(errMsg);
    }
  };

  const handleSuccessOk = () => {
    setIsSuccessModalOpen(false);
    navigate(`/plant/freight-loads`);
  };

  const tabs = [
    `Bid Comparison (${bidsResponse?.data?.bids?.length ?? 0})`,
    "Request Details",
  ];

  const lowestBidAmount = bidsResponse?.data?.bidRange?.lowestBid?.amount ?? 0;

  return (
    <div className="xl:pr-5 pb-10 space-y-8 mt-2 px-4 md:px-0 font-inter max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 md:w-8 md:h-8 bg-[#000000] rounded-full flex items-center justify-center text-white hover:bg-[#212B36] transition-all shadow-sm shrink-0"
          >
            <ArrowLeft size={16} strokeWidth={3} />
          </button>
          <div>
            <h1 className="text-lg md:text-[25px] font-semibold text-[#212B36] tracking-tight">Freight Request Details</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#637381] font-normal text-sm">
                {bidsResponse?.data?.projectName || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E51A4]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-center">
          Failed to load freight request details. Please try again.
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            <FreightStatCard
              title="Total Bids"
              value={bidsResponse?.data?.stats?.totalBids ?? 0}
              subtitle="From invited carriers"
              icon={Truck}
              gradient="linear-gradient(135deg, #2B7FFF 0%, #155DFC 100%)"
            />
            <FreightStatCard
              title="Awarded Bid"
              value={bidsResponse?.data?.stats?.awardedBid ? `$${bidsResponse.data.stats.awardedBid.toLocaleString()}` : "N/A"}
              subtitle="Best available rate"
              icon={TrendingDown}
              gradient="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
            />
            <FreightStatCard
              title="Average Bid"
              value={bidsResponse?.data?.stats?.averageBid ? `$${Math.round(bidsResponse.data.stats.averageBid).toLocaleString()}` : "N/A"}
              subtitle="Market average"
              icon={BarChart3}
              gradient="linear-gradient(135deg, #FF6900 0%, #F54900 100%)"
            />
            <FreightStatCard
              title="Potential Savings"
              value={bidsResponse?.data?.stats?.potentialSavings !== null && bidsResponse?.data?.stats?.potentialSavings !== undefined ? `$${bidsResponse?.data.stats.potentialSavings.toLocaleString()}` : "-"}
              subtitle="vs highest bid"
              icon={Zap}
              gradient="linear-gradient(135deg, #AD46FF 0%, #9810FA 100%)"
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap gap-4 md:gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold transition-all relative ${activeTab.includes(tab.split(" (")[0])
                    ? "text-[#1E51A4] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1E51A4]"
                    : "text-[#637381] hover:text-[#212B36]"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab.includes("Bid Comparison") && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-[#212B36]">All Bids</h2>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <div className="flex items-center gap-2">
                      <FilterDropdown
                        label="Sort:"
                        activeTab={sortBy}
                        onTabChange={setSortBy}
                        options={[
                          { label: "Low to High", value: "low" },
                          { label: "High to Low", value: "high" },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-[#22C55E] font-bold">
                      {bidsResponse?.data?.bidRange?.lowestBid?.amount ? `$${bidsResponse.data.bidRange.lowestBid.amount.toLocaleString()}` : "—"}
                    </span>
                    <span className="text-[#637381] mx-2">-</span>
                    <span className="text-[#FF5630] font-bold">
                      {bidsResponse?.data?.bidRange?.highestBid?.amount ? `$${bidsResponse.data.bidRange.highestBid.amount.toLocaleString()}` : "—"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4">
                  {(bidsResponse?.data?.bids ?? []).map((bid, idx) => (
                    <BidCard
                      key={bid.bidId}
                      bid={bid}
                      rank={idx + 1}
                      lowestBidAmount={lowestBidAmount}
                      onAward={handleAwardClick}
                      onRequestRevision={handleRevisionClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Request Details" && bidsResponse?.data?.requestId && (
              <FreightRequestDetailsTab deliveryId={bidsResponse.data.requestId} />
            )}
          </div>
        </>
      )}

      <AwardLoadModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        onConfirm={handleConfirmAward}
        carrier={selectedCarrier}
        isLoading={isSelectingBid}
        error={selectError}
      />

      <AwardSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onOk={handleSuccessOk}
        carrier={selectedCarrier}
        projectName={bidsResponse?.data?.projectName || "—"}
        deliveryId={awardedDeliveryId}
        deliveryDate={deliveryDateFormatted}
        poc={deliveryPoc}
        location={deliveryLocation}
      />

      <RequestRevisionModal
        key={selectedCarrier?.bidId || "revision-modal"}
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        onConfirm={handleConfirmRevision}
        carrier={selectedCarrier}
        isLoading={isRevisingBid}
        error={revisionError}
      />

      <RevisionSuccessModal
        isOpen={isRevisionSuccessOpen}
        onClose={() => setIsRevisionSuccessOpen(false)}
        onOk={() => setIsRevisionSuccessOpen(false)}
        carrier={selectedCarrier}
        targetAmount={revisionData.targetAmount}
        message={revisionData.message}
      />
    </div>
  );
};

export default FreightRequestDetailsView;

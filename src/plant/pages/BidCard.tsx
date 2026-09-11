import { Award, RotateCw } from "lucide-react";
import type { FreightBidItem } from "@/modules/plant/freight.api";

interface BidCardProps {
  bid: FreightBidItem;
  rank: number;
  lowestBidAmount: number;
  onAward: (bidId: string) => void;
  onRequestRevision: (bidId: string) => void;
}

const BidCard = ({ bid, rank, lowestBidAmount, onAward, onRequestRevision }: BidCardProps) => {
  const isSent = bid.status === "sent";
  const isRejected = bid.status === "rejected" || bid.status === "no_bid";
  const isAwarded = bid.status === "selected";

  let diffText = "";
  if (!isSent && !isRejected && bid.bidAmount !== null && bid.bidAmount !== undefined) {
    if (bid.isLowest) {
      diffText = "Lowest Bid";
    } else if (lowestBidAmount > 0 && bid.bidAmount > lowestBidAmount) {
      const diffVal = bid.bidAmount - lowestBidAmount;
      diffText = `+$${diffVal?.toLocaleString()} more`;
    }
  }

  const carrier = bid.carrierName;
  const submitted = bid.submittedAt ? new Date(bid.submittedAt).toLocaleDateString() : "Pending";
  const isPending = bid.status === "sent" || bid.status === "resubmit_requested";
  const amount = isPending
    ? "Pending"
    : isRejected
      ? "No Bid"
      : bid.bidAmount !== null && bid.bidAmount !== undefined
        ? `$${bid.bidAmount.toLocaleString()}`
        : "Pending";
  const notes = bid.carrierNote;
  const status = bid.status;
  const bidId = bid.bidId;

  return (
    <div
      className={`rounded-[14px] p-4 md:p-6 border transition-all ${rank === 1
        ? "bg-[#EAFBF3] border-[#00C271]/40 shadow-sm"
        : isAwarded
          ? "bg-white border-[#00A76F]/30 ring-1 ring-[#00A76F]/20"
          : "bg-white border-gray-100 shadow-sm hover:shadow-md"
        }`}
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div
            className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-all ${rank === 1
              ? "w-12 h-12 bg-[#00A76F] text-white shadow-[0_4px_12px_rgba(0,167,111,0.25)] text-base md:text-lg"
              : isAwarded
                ? "w-10 h-10 bg-[#00A76F] text-white"
                : "w-10 h-10 bg-[#F4F6F8] text-[#919EAB]"
              }`}
          >
            #{rank}
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-[#212B36]">{carrier}</h4>
            <div className="flex flex-wrap items-center gap-x-2 md:gap-x-2.5 gap-y-1 text-xs md:text-sm text-[#637381]">
              <span>Submitted On: {submitted}</span>
            </div>
          </div>
        </div>

        <div className="text-right hidden md:flex flex-col justify-start min-w-[140px]">
          <p className="text-xs font-bold text-[#919EAB] uppercase tracking-wide">
            Bid Amount
          </p>
          <p
            className={`text-lg md:text-[32px] font-extrabold leading-none my-1.5 ${rank === 1 || isAwarded ? "text-[#00A76F]" : "text-[#212B36]"
              }`}
          >
            {amount}
          </p>
          {diffText && (
            <p
              className={`text-[10px] md:text-xs font-bold tracking-wide uppercase ${rank === 1 ? "text-[#00A76F]" : "text-[#637381]"
                }`}
            >
              {diffText}
            </p>
          )}
        </div>
      </div>

      {/* Mobile Price display */}
      <div className="flex md:hidden justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs font-bold text-[#919EAB] uppercase tracking-wide">
          Bid Amount
        </p>
        <div className="text-right">
          <p
            className={`text-2xl font-extrabold leading-tight ${rank === 1 || isAwarded ? "text-[#00A76F]" : "text-[#212B36]"
              }`}
          >
            {amount}
          </p>
          {diffText && (
            <p
              className={`text-[10px] font-bold tracking-wide uppercase mt-0.5 ${rank === 1 ? "text-[#00A76F]" : "text-[#637381]"
                }`}
            >
              {diffText}
            </p>
          )}
        </div>
      </div>

      {/* Carrier Notes */}
      {!isSent && (
        <div
          className={`mt-4 p-4 rounded-[12px] md:ml-16 transition-all ${rank === 1
            ? "bg-white border border-[#00C271]/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            : "bg-[#F4F6F8]"
            }`}
        >
          <p className="text-sm font-bold text-[#454F5B]">Carrier Notes:</p>
          <p className="text-sm text-[#637381] font-normal mt-1">{notes || "—"}</p>
        </div>
      )}

      {/* Revision Info */}
      {bid.status === "resubmit_requested" && (
        <div className="mt-4 p-4 rounded-[12px] md:ml-16 bg-[#FFF9EC] border border-[#FFE2A3]/30 text-[#B76E00]">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <p className="text-sm font-bold">Revision Requested</p>
            {bid.resubmitRequestedAt && (
              <span className="text-xs opacity-80">
                {new Date(bid.resubmitRequestedAt).toLocaleString()}
              </span>
            )}
          </div>
          {(bid.plantNote || bid.resubmitNote) && (
            <p className="text-sm font-normal mt-1">
              Note: {bid.plantNote || bid.resubmitNote}
            </p>
          )}
          {bid.resubmitCount !== undefined && bid.resubmitCount > 0 && (
            <p className="text-xs opacity-60 mt-1 font-medium">
              Revision request count: {bid.resubmitCount}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!isSent && status !== "rejected" && status !== "no_bid" && (isAwarded || (bid.bidAmount !== null && bid.bidAmount !== undefined) || bid.canRequestResubmit !== false) && (
        <div className="flex flex-wrap gap-3 mt-5 md:ml-16">
          {isAwarded ? (
            <span className="inline-flex items-center gap-2 bg-[#F4FBF7] text-[#27AE60] border border-[#27AE60]/20 px-4 py-2.5 rounded-[8px] text-sm font-bold shadow-sm">
              <Award size={16} strokeWidth={2.5} className="text-[#27AE60]" />
              Awarded Load
            </span>
          ) : (
            <>
              {bid.bidAmount !== null && bid.bidAmount !== undefined && (
                <button
                  onClick={() => onAward(bidId)}
                  className="flex items-center gap-2 bg-[#00A76F] hover:bg-[#008F5E] text-white px-4 py-2.5 rounded-[8px] text-sm font-bold shadow-sm transition-all"
                >
                  <Award size={16} strokeWidth={2.5} />
                  Award Load
                </button>
              )}
              {bid.canRequestResubmit !== false && (
                <button
                  onClick={() => onRequestRevision(bidId)}
                  className="flex items-center gap-2 bg-[#FF6900] hover:bg-[#e05c00] text-white px-4 py-2.5 rounded-[8px] text-sm font-bold shadow-sm transition-all"
                >
                  <RotateCw size={16} strokeWidth={2.5} />
                  Request Revision
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BidCard;

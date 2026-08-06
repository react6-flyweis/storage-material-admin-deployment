import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Search, ArrowUpDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessModal from "../components/common_component/SuccessModal";
import {
  useGetComparisonSummaryQuery,
  useApproveShipperRequestMutation,
  useRequestResubmitShipperRequestMutation,
} from "@/modules/plant/shipper.hooks";
import type { ComparisonResultItem, ComparisonPartItem } from "@/modules/plant/shipper.api";

const ComparisonResultView: React.FC = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("Report Submitted Successfully");

  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [resubmitNote, setResubmitNote] = useState("");

  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  const [navigateOnClose, setNavigateOnClose] = useState<string | null>(null);

  const { data, isLoading, error } = useGetComparisonSummaryQuery(requestId || "", {
    skip: !requestId,
  });
  const [approveRequest, { isLoading: isApproving }] = useApproveShipperRequestMutation();
  const [requestResubmit, { isLoading: isResubmitting }] = useRequestResubmitShipperRequestMutation();

  const handleApprove = async () => {
    if (!requestId) return;
    try {
      await approveRequest(requestId).unwrap();
      setSuccessTitle("Shipment Approved Successfully");
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Failed to approve request:", err);
    }
  };

  const handleResubmit = async () => {
    if (!requestId || !resubmitNote.trim()) return;
    try {
      await requestResubmit({ requestId, note: resubmitNote }).unwrap();
      setIsResubmitModalOpen(false);
      setResubmitNote("");
      setSuccessTitle("Resubmit Request Sent Successfully");
      setNavigateOnClose(`/projects/${data?.leadId}/shipper-files`);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Failed to request resubmit:", err);
    }
  };

  const getFormattedDescription = (part: ComparisonPartItem | null) => {
    if (!part) return "No details available";
    const parts: string[] = [];
    if (part.description) {
      parts.push(part.description);
    }
    const color = part.partColor || part.color;
    if (color && color !== "N/A") {
      parts.push(`Color: ${color}`);
    }
    if (typeof part.lengthFeet === "number" && part.lengthFeet > 0) {
      parts.push(`Length: ${part.lengthFeet.toFixed(2)} ft`);
    }
    if (typeof part.weight === "number" && part.weight > 0) {
      parts.push(`Weight: ${part.weight.toFixed(2)} lbs`);
    }
    return parts.length > 0 ? parts.join(" | ") : `Color: ${color || "N/A"}`;
  };

  const getDisplayStatusText = (status: string) => {
    switch (status) {
      case "missing_in_vendor_quote":
        return "Missing";
      case "extra_in_vendor_quote":
        return "Extra";
      case "qty_mismatch":
        return "QTY Mismatch";
      case "price_mismatch":
        return "Price Mismatch";
      case "matched":
        return "Matched";
      default:
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Matched":
      case "matched":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#00D261]/10 text-[#008A3B] border border-[#00D261]/20">
            Matched
          </span>
        );
      case "Missing":
      case "missing_in_vendor_quote":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F5B500]/10 text-[#B88600] border border-[#F5B500]/20">
            Missing
          </span>
        );
      case "Extra":
      case "extra_in_vendor_quote":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FF6D00]/10 text-[#D35400] border border-[#FF6D00]/20">
            Extra
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FF6D00]/10 text-[#D35400] border border-[#FF6D00]/20">
            {getDisplayStatusText(status)}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#E5ECFF] gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E51A4]"></div>
        <p className="text-gray-500 font-inter font-medium text-sm">
          Loading comparison results...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 md:p-6 min-h-screen bg-[#E5ECFF] space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-[#1E51A4] hover:bg-[#154085] text-white"
          >
            <ArrowLeft size={18} />
            Back
          </Button>
          <h1 className="text-2xl font-inter font-bold text-[#212B36]">
            Comparison Result
          </h1>
        </div>
        <div className="p-10 text-center bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4">
          <p className="font-semibold text-lg font-inter text-[#212B36]">
            Error Loading Comparison Summary
          </p>
          <p className="text-sm text-gray-500 font-inter max-w-md">
            Something went wrong while retrieving the comparison summary. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const totalCount = data.results?.length ?? 0;
  const matchedCount = data.results?.filter((r: ComparisonResultItem) => r.status === "matched").length ?? 0;
  const missingCount = data.results?.filter((r: ComparisonResultItem) => r.status === "missing_in_vendor_quote").length ?? 0;
  const mismatchCount = data.results?.filter((r: ComparisonResultItem) =>
    r.status !== "matched" &&
    r.status !== "missing_in_vendor_quote" &&
    r.status !== "extra_in_vendor_quote"
  ).length ?? 0;
  const extraCount = data.results?.filter((r: ComparisonResultItem) => r.status === "extra_in_vendor_quote").length ?? 0;

  const stats = [
    { id: "total", label: "Total Items", value: totalCount, color: "bg-[#1E51A4]" },
    { id: "matched", label: "Matched Items", value: matchedCount, color: "bg-[#00D261]" },
    { id: "missing", label: "Part Missing", value: missingCount, color: "bg-[#F5B500]" },
    { id: "mismatch", label: "Not Match", value: mismatchCount, color: "bg-[#E11D48]" },
    { id: "extra", label: "Extra Items", value: extraCount, color: "bg-[#FF6D00]" },
  ];

  const filteredResults = (data.results || []).filter((row) => {
    if (activeKpi) {
      const status = (row.status || "").toLowerCase();
      if (activeKpi === "matched" && status !== "matched") return false;
      if (activeKpi === "missing" && status !== "missing_in_vendor_quote") return false;
      if (activeKpi === "extra" && status !== "extra_in_vendor_quote") return false;
      if (activeKpi === "mismatch") {
        if (status === "matched" || status === "missing_in_vendor_quote" || status === "extra_in_vendor_quote") {
          return false;
        }
      }
    }

    const q = searchQuery.toLowerCase();
    const partCode = (row.expected?.partCode || row.received?.partCode || "").toLowerCase();
    const reason = (row.reason || "").toLowerCase();
    const status = (row.status || "").toLowerCase();
    return partCode.includes(q) || reason.includes(q) || status.includes(q);
  });

  const handleDownloadCSV = () => {
    if (!filteredResults || filteredResults.length === 0) return;

    const headers = [
      "Part Number",
      "Description",
      "Ordered QTY",
      "Shipped QTY",
      "Difference",
      "Reason",
      "Status"
    ];

    const csvRows = filteredResults.map((row) => {
      const part = row.expected || row.received;
      const partNumber = part?.partCode || "-";
      const description = getFormattedDescription(part || null);

      const orderedQty = row.expected?.totalQty ?? 0;
      const shippedQty = row.received?.totalQty ?? 0;
      const difference = row.difference?.qtyDiff !== null && row.difference?.qtyDiff !== undefined
        ? row.difference.qtyDiff
        : (shippedQty - orderedQty);

      const differenceStr = difference > 0 ? `+${difference}` : difference.toString();
      const reason = row.reason || "-";
      const status = getDisplayStatusText(row.status);

      return [
        partNumber,
        description,
        orderedQty.toString(),
        shippedQty.toString(),
        differenceStr,
        reason,
        status
      ];
    });

    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...csvRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `comparison_report_${requestId || "export"}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-[#E5ECFF]">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-[#1E51A4] hover:bg-[#154085] text-white font-inter font-bold"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
            <h1 className="text-2xl font-inter font-bold text-[#212B36]">
              Comparison Result
            </h1>
          </div>
          <p className="text-sm text-gray-600 font-inter md:border-l md:border-gray-300 md:pl-4">
            Project: <span className="font-semibold text-gray-800">{data.projectName}</span> | Vendor: <span className="font-semibold text-gray-800">{data.vendorName} ({data.vendorCode})</span>
          </p>
        </div>
        {data.status === "comparison_completed" && (
          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsResubmitModalOpen(true)}
              disabled={isResubmitting || data.canProceedToApproval}
              className="flex items-center gap-2 font-inter font-bold bg-[#637381] hover:bg-[#454f5b] text-white border-none"
            >
              Request Resubmit
            </Button>
            {data.canProceedToApproval && (
              <Button
                variant="default"
                size="sm"
                onClick={handleApprove}
                disabled={isApproving}
                className="flex items-center gap-2 font-inter font-bold bg-[#00D261] hover:bg-[#00b050] text-white"
              >
                {isApproving ? "Approving..." : "Approve Shipment"}
              </Button>
            )}
          </div>
        )}
        {data.status === "approved" && (
          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/projects/${data.projectId}/shipper-files/${requestId}`)}
              className="font-inter font-bold text-black border-gray-200 bg-white hover:bg-gray-50"
            >
              Back to Shipper File
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(`/plant/load-planning/${data.leadId}`)}
              className="flex items-center gap-2 font-inter font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              Start Load Planning
            </Button>
          </div>
        )}
      </div>

      {/* ── Stats Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-8">
        {stats.map((stat) => {
          const isSelected = activeKpi === stat.id || (stat.id === "total" && activeKpi === null);
          return (
            <div
              key={stat.id}
              onClick={() => setActiveKpi(stat.id === "total" ? null : (activeKpi === stat.id ? null : stat.id))}
              className={`${stat.color} rounded-[10px] p-3 lg:p-5 flex items-center justify-between text-white shadow-sm cursor-pointer border-2 ${isSelected
                ? "border-black shadow-md"
                : "border-transparent"
                }`}
            >
              <span className="text-xs lg:text-sm font-inter font-semibold">
                {stat.label}
              </span>
              <span className="text-lg lg:text-2xl font-inter font-bold">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Search & Download ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-[#919EAB]" />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E4E6] rounded-lg text-sm font-inter placeholder:text-[#919EAB] focus:outline-none focus:ring-1 focus:ring-[#1E51A4]"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadCSV}
          className="ml-auto bg-[#637381] hover:bg-[#454f5b] text-white font-inter font-medium"
        >
          <Download className="mr-2" size={18} />
          Download Report
        </Button>
      </div>

      {/* ── Results Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-[10px] shadow-sm border border-[#F4F6F8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-light-gray,#F8F9FA)] border-b border-[#E2E4E6] text-nowrap">
                <th className="py-4 px-3 md:px-6 text-sm font-inter font-semibold text-black tracking-wider">
                  Part Number
                </th>
                <th className="py-4 px-3 md:px-6 text-sm font-inter font-semibold text-black tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer transition-colors">
                    Description
                    <ArrowUpDown size={14} className="text-[#919EAB]" />
                  </div>
                </th>
                <th className="py-4 px-3 md:px-6 text-sm font-inter font-semibold text-black tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer transition-colors">
                    Ordered QTY
                    <ArrowUpDown size={14} className="text-[#919EAB]" />
                  </div>
                </th>
                <th className="py-4 px-3 md:px-6 text-sm font-inter font-semibold text-black tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer transition-colors">
                    Shipped QTY
                    <ArrowUpDown size={14} className="text-[#919EAB]" />
                  </div>
                </th>
                <th className="py-4 px-3 md:px-6 text-sm font-inter font-semibold text-black tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer transition-colors">
                    Difference
                    <ArrowUpDown size={14} className="text-[#919EAB]" />
                  </div>
                </th>
                <th className="py-4 px-3 md:px-6 text-sm font-inter font-semibold text-black tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer transition-colors">
                    Reason
                    <ArrowUpDown size={14} className="text-[#919EAB]" />
                  </div>
                </th>
                <th className="py-4 px-3 md:px-6 text-sm font-inter font-semibold text-black tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4E6]">
              {filteredResults.map((row) => {
                const part = row.expected || row.received;
                const partNumber = part?.partCode || "-";
                const description = getFormattedDescription(part || null);

                const orderedQty = row.expected?.totalQty ?? 0;
                const shippedQty = row.received?.totalQty ?? 0;
                const difference = row.difference?.qtyDiff !== null && row.difference?.qtyDiff !== undefined
                  ? row.difference.qtyDiff
                  : (shippedQty - orderedQty);

                return (
                  <tr
                    key={row.resultId}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="py-4 px-3 md:px-6 text-sm font-archivo font-normal text-black">
                      {partNumber}
                    </td>
                    <td className="py-4 px-3 md:px-6 text-sm font-inter text-[#637381]">
                      {description}
                    </td>
                    <td className="py-4 px-3 md:px-6 text-sm font-inter text-[#637381]">
                      {orderedQty}
                    </td>
                    <td className="py-4 px-3 md:px-6 text-sm font-inter text-[#637381]">
                      {shippedQty}
                    </td>
                    <td className="py-4 px-3 md:px-6 text-sm font-inter text-[#637381]">
                      {difference > 0 ? `+${difference}` : difference}
                    </td>
                    <td className="py-4 px-3 md:px-6 text-sm font-inter text-[#919EAB]">
                      {row.reason || "-"}
                    </td>
                    <td className="py-4 px-3 md:px-6 text-sm font-inter">
                      {getStatusBadge(row.status)}
                    </td>
                  </tr>
                );
              })}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 font-inter text-sm">
                    No comparison items found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {isResubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold font-inter text-[#212B36]">
              Request Corrected Quote
            </h3>
            <p className="text-sm text-gray-500 font-inter">
              Please provide a note to the vendor explaining what correction is needed.
            </p>
            <textarea
              className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg text-sm font-inter focus:outline-none focus:ring-2 focus:ring-[#1E51A4] focus:border-transparent resize-none"
              placeholder="e.g., Please correct qty mismatch on C62514."
              value={resubmitNote}
              onChange={(e) => setResubmitNote(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsResubmitModalOpen(false);
                  setResubmitNote("");
                }}
                className="border-gray-200 font-medium font-inter text-[#212B36]"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={!resubmitNote.trim() || isResubmitting}
                onClick={handleResubmit}
                className="font-medium font-inter bg-[#1E51A4] hover:bg-[#154085] text-white"
              >
                {isResubmitting ? "Sending..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          if (navigateOnClose) {
            navigate(navigateOnClose);
            setNavigateOnClose(null);
          }
        }}
        title={successTitle}
      />
    </div>
  );
};

export default ComparisonResultView;

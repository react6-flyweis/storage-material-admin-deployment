import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ArrowUpDown, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import steelLogo from "@/assets/steel-building-depot-logo.png";
import { useBomDetailsQuery } from "@/modules/plant/bom.hooks";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";

const BOMFilesDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [filter, setFilter] = useState<"all" | "unpriced" | "frames" | "matched" | "bom_priced">("all");
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data: detailsResponse, isLoading, isFetching, error } = useBomDetailsQuery(
    id || "",
    filter,
    page,
    limit,
    { enabled: Boolean(id) }
  );

  const data = detailsResponse?.data;

  // Extract lead ID from items to fetch project/client information
  const leadId = useMemo(() => {
    if (data?.bomJob?.buildingId) return data.bomJob.buildingId;
    if (!data?.itemsByCategory) return null;
    for (const category in data.itemsByCategory) {
      const items = data.itemsByCategory[category];
      if (items && items.length > 0) {
        return items[0].leadId || items[0].buildingId || null;
      }
    }
    return null;
  }, [data]);

  const { data: projectDetail } = useLeadDetailQuery(leadId || "");


  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E51A4]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="xl:pr-2 md:px-4 px-2 pb-10 space-y-6 font-inter">
        <div className="flex items-center gap-4 pt-1">
          <Button
            variant="outline"
            className="h-9 px-4 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} /> Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-950">BOM Files Details</h1>
        </div>
        <div className="p-8 text-center bg-white rounded-[14px] border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-red-600">Error Loading BOM Details</h3>
          <p className="text-sm text-gray-500">Could not retrieve details for BOM Job ID: {id}</p>
          <Button variant="default" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const projectName = projectDetail?.data?.lead?.projectName || "BOM Details";
  const customerName = projectDetail?.data?.customer
    ? `${projectDetail.data.customer.firstName || ""}`.trim()
    : "N/A";
  const dateStr = projectDetail?.data?.lead?.createdAt
    ? new Date(projectDetail.data.lead.createdAt).toLocaleDateString()
    : "N/A";
  const projectJobId = projectDetail?.data?.lead?.jobId || "N/A";

  const totalWeight = data.summary?.totalWeight ?? Object.values(data.itemsByCategory || {}).reduce(
    (sum, items) => sum + (items || []).reduce((s, item) => s + (item.weight || 0), 0),
    0
  );

  const totalPages = Math.ceil((data.total || 0) / (data.limit || limit));

  const hasItems = data?.itemsByCategory
    ? Object.values(data.itemsByCategory).some((items) => items && items.length > 0)
    : false;

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#eef2fb] min-h-screen font-inter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-lg h-10 px-4 font-medium shadow-sm gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} /> Back
          </Button>
          <h1 className="text-[28px] font-normal text-slate-900 tracking-tight">BOM Files Details</h1>
        </div>
        <div className="flex items-center gap-3">
        </div>
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 p-8 space-y-8">
        {/* Project Context Box */}
        <div className="bg-[#f8f9fc] rounded-2xl p-6">
          <h2 className="text-[22px] font-bold text-slate-900">
            Project: <span className="font-bold">{projectName}</span> | Building -{" "}
            <span className="font-bold">{data.bomJob?.buildingNumber || "N/A"}</span>
          </h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* BOM Summary */}
          <div className="bg-[#f8f9fc] rounded-2xl p-6 border border-gray-100 space-y-5">
            <h3 className="text-lg font-bold text-[#212B36]">BOM Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-sm font-semibold text-slate-700">Total Items</span>
                <span className="text-sm font-bold text-slate-900">{data.summary?.totalItems ?? 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-sm font-semibold text-slate-700">Total Weight</span>
                <span className="text-sm font-bold text-slate-900">
                  {totalWeight.toLocaleString()} lbs
                </span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-sm font-semibold text-slate-700">Priced Items</span>
                <span className="text-sm font-bold text-slate-900">{data.summary?.pricedItems ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-[#f8f9fc] rounded-2xl p-6 border border-gray-100 space-y-5">
            <h3 className="text-lg font-bold text-[#212B36]">Pricing Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-sm font-semibold text-slate-700">Total Cost</span>
                <span className="text-sm font-bold text-slate-900">
                  ${(data.summary?.totalCost ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-sm font-semibold text-slate-700">Unpriced Items QTY</span>
                <span className="text-sm font-bold text-slate-900">
                  {data.summary?.unpricedItems ?? 0}
                </span>
              </div>
              {data.summary && data.summary.unpricedItems > 0 && (
                <div className="pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                    onClick={() => navigate("missing-items")}
                  >
                    Add Item in Cost List
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technical Header Block */}
        <div className="border-[3px] border-black rounded-sm overflow-hidden bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x-[3px] divide-black">
            {/* Logo Section */}
            <div className="md:col-span-4 flex items-center justify-center p-4">
              <img
                src={steelLogo}
                alt="Logo"
                className="h-10 object-contain"
              />
            </div>

            {/* Title & Info Section */}
            <div className="md:col-span-8 flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x-[3px] divide-black h-full">
                <div className="md:col-span-3 flex flex-col divide-y-[3px] divide-black h-full">
                  <div className="p-2 text-center">
                    <h4 className="text-xl font-bold uppercase tracking-widest text-[#212B36]">
                      BOM LINE ITEMS
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 h-full divide-y md:divide-y-0 lg:divide-x-[3px] divide-black border-t-[3px] border-b-[3px] border-black">
                    <div className="p-2 flex items-center justify-center bg-[#F9FAFB]">
                      <span className="text-sm font-bold text-[#212B36]">Customer:</span>
                    </div>
                    <div className="md:col-span-2 p-2 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#212B36]">{customerName}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 h-full divide-y md:divide-y-0 lg:divide-x-[3px] divide-black border-t-[3px] border-black">
                    <div className="p-2 flex items-center justify-center bg-[#F9FAFB]">
                      <span className="text-sm font-bold text-[#212B36]">Project Name:</span>
                    </div>
                    <div className="md:col-span-2 p-2 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#212B36]">{projectName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col divide-y-[3px] divide-black">
                  <div className="grid grid-cols-2 divide-x-[3px] divide-black">
                    <div className="p-1 px-2 text-sm font-bold text-[#212B36] bg-[#F9FAFB]">Date</div>
                    <div className="p-1 px-2 text-sm font-bold text-[#212B36]">{dateStr}</div>
                  </div>
                  <div className="grid grid-cols-2 divide-x-[3px] divide-black h-full">
                    <div className="p-1 px-2 text-sm font-bold text-[#212B36] bg-[#F9FAFB]">Job Id</div>
                    <div className="p-1 px-2 text-sm font-bold text-[#212B36]">{projectJobId}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto whitespace-nowrap border-b border-gray-200 scrollbar-none">
          {(["all", "unpriced", "bom_priced", "frames", "matched"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setFilter(tab);
                setPage(1);
              }}
              className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors capitalize shrink-0 ${filter === tab
                ? "border-[#1E51A4] text-[#1E51A4]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab === "all"
                ? "All Items"
                : tab === "frames"
                  ? "Frame Items"
                  : tab === "bom_priced"
                    ? "BOM Priced"
                    : `${tab} Items`}
            </button>
          ))}
        </div>

        {/* Main Data Content */}
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-gray-100 rounded-xl bg-[#F9FAFB]/50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E51A4] mb-3"></div>
            <p className="text-sm text-gray-500 font-medium">Updating items...</p>
          </div>
        ) : !hasItems ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-200 rounded-xl bg-white">
            <div className="size-14 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-[#919EAB]">
              <Inbox className="size-8" />
            </div>
            <h3 className="text-base font-bold text-[#212B36]">No BOM items found</h3>
            <p className="text-sm text-[#637381] mt-1 max-w-sm px-4">
              {filter === "all"
                ? "There are no line items in this BOM file."
                : `There are no line items matching the "${filter.replace("_", " ")}" filter.`}
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-[#f8f9fc] border-b border-slate-200">
                    <th className="py-3 px-4 text-[13px] font-bold text-slate-900">
                      <div className="flex items-center gap-1">
                        QTY <ArrowUpDown size={14} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-[13px] font-bold text-slate-900">
                      <div className="flex items-center gap-1">
                        Mark <ArrowUpDown size={14} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Description</th>
                    <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Part</th>
                    <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Color</th>
                    <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Thick</th>
                    <th className="py-3 px-4 text-[13px] font-bold text-slate-900">
                      <div className="flex items-center gap-1 text-nowrap">
                        Length <ArrowUpDown size={14} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-[13px] font-bold text-slate-900">
                      <div className="flex items-center gap-1 text-nowrap">
                        Weight <ArrowUpDown size={14} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-[13px] font-bold text-slate-900">
                      <div className="flex items-center gap-1">
                        Amount <ArrowUpDown size={14} className="text-gray-400" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(data.itemsByCategory || {}).map(([category, items]) => {
                    if (!items || items.length === 0) return null;
                    return (
                      <React.Fragment key={category}>
                        <tr className="bg-slate-50 border-y border-slate-100">
                          <td
                            colSpan={9}
                            className="py-2.5 px-4 text-xs font-bold text-[#1E51A4] uppercase tracking-wider"
                          >
                            {category.replace(/_/g, " ")} ({items.length})
                          </td>
                        </tr>
                        {items.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 text-sm font-medium text-slate-700">
                              {item.quantity}
                            </td>
                            <td className="py-4 px-4 text-sm font-medium text-slate-700">
                              {item.markId}
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-400">
                              {item.description}
                            </td>
                            <td className="py-4 px-4 text-sm font-medium text-slate-700">
                              {item.partCode}
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-400">
                              {item.partColor}
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-400">
                              {item.gauge || item.type || "--"}
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-700">
                              {item.lengthRaw || (item.lengthFeet ? `${item.lengthFeet}'` : "--")}
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-400">
                              {item.weight}
                            </td>
                            <td
                              className={`py-4 px-4 text-sm font-semibold ${!item.isPriced ? "text-[#919EAB]" : "text-slate-700"
                                }`}
                            >
                              {item.isPriced
                                ? `$${item.finalTotalCost.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                                : "Unpriced"}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BOMFilesDetailsView;

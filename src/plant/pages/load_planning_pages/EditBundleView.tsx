import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Check, ChevronUp, ChevronDown } from "lucide-react";
import { useGetBundleDetailsQuery, useEditBundleMutation } from "@/modules/plant/load-planning.hooks";

interface TableItem {
  id: string;
  qty: number;
  item: string;
  description: string;
  length: string;
  weight: number;
}

type SortField = "qty" | "item" | "length";
type SortOrder = "asc" | "desc";

const EditBundleView: React.FC = () => {
  const { projectId, bundleId } = useParams<{ projectId: string; bundleId: string }>();
  const navigate = useNavigate();

  const { data: bundleDetails, isLoading, error } = useGetBundleDetailsQuery(bundleId || "", {
    skip: !bundleId,
  });

  const [editBundle, { isPending: isSaving }] = useEditBundleMutation();

  const items = useMemo<TableItem[]>(() => {
    if (!bundleDetails || !bundleDetails.items) return [];
    return bundleDetails.items.map((item) => {
      return {
        id: item._id,
        qty: item.qty,
        item: item.partCode,
        description: item.description || "",
        length: `${Number(item.lengthFeet || 0).toFixed(2)} ft`,
        weight: item.weight,
      };
    });
  }, [bundleDetails]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [lastItems, setLastItems] = useState<TableItem[]>([]);

  const [handlingInstruction, setHandlingInstruction] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [lastBundleDetails, setLastBundleDetails] = useState<any>(null);

  if (items !== lastItems) {
    setLastItems(items);
    setSelectedIds(new Set(items.map((item) => item.id)));
    const initialQuants: Record<string, number> = {};
    items.forEach((item) => {
      initialQuants[item.id] = item.qty;
    });
    setItemQuantities(initialQuants);
  }

  if (bundleDetails && bundleDetails !== lastBundleDetails) {
    setLastBundleDetails(bundleDetails);
    setHandlingInstruction(bundleDetails.bundle?.handlingInstruction || "");
    setNotes(bundleDetails.bundle?.notes || "");
  }

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const handleQtyChange = (id: string, val: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, val),
    }));
  };

  const totalWeight = useMemo(() => {
    return items
      .filter((item) => selectedIds.has(item.id))
      .reduce((sum, item) => {
        const currentQty = itemQuantities[item.id] ?? item.qty;
        const unitWeight = item.qty > 0 ? item.weight / item.qty : 0;
        return sum + unitWeight * currentQty;
      }, 0);
  }, [items, selectedIds, itemQuantities]);

  const itemsNameStr = useMemo(() => {
    const active = items.filter((item) => selectedIds.has(item.id));
    if (active.length === 0) return "No items";
    const firstItemCode = active[0].item;
    return `${firstItemCode} × ${active.length}`;
  }, [items, selectedIds]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedItems = useMemo(() => {
    if (!sortField) return items;

    return [...items].sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      if (sortField === "qty") {
        valA = itemQuantities[a.id] ?? a.qty;
        valB = itemQuantities[b.id] ?? b.qty;
      } else if (sortField === "item") {
        valA = a.item;
        valB = b.item;
      } else if (sortField === "length") {
        valA = a.length;
        valB = b.length;
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      } else {
        return sortOrder === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      }
    });
  }, [items, sortField, sortOrder, itemQuantities]);

  const handleSave = async () => {
    try {
      const payloadItems = items
        .filter((item) => selectedIds.has(item.id))
        .map((item) => {
          const originalItem = bundleDetails?.items.find((i) => i._id === item.id);
          return {
            _id: item.id,
            vendorQuoteLineId: originalItem?.vendorQuoteLineId || "",
            qty: itemQuantities[item.id] ?? item.qty,
          };
        });

      await editBundle({
        bundleId: bundleId || "",
        body: {
          items: payloadItems,
          handlingInstruction,
          notes,
        },
      }).unwrap();

      setToastMessage("Bundle saved successfully!");
      setTimeout(() => {
        setToastMessage(null);
        navigate(`/plant/load-planning/${projectId}/bundle-planner`);
      }, 1500);
    } catch (err: any) {
      console.error("Failed to edit bundle:", err);
      const errMsg = err?.data?.message || err?.message || "Failed to save bundle";
      setToastMessage(`Error: ${errMsg}`);
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white font-inter">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6E38F7]"></div>
        <p className="text-gray-500 font-medium text-sm">Loading bundle details...</p>
      </div>
    );
  }

  if (error) {
    const errorObj = error as { data?: { message?: string }; message?: string };
    const errorMsg = errorObj?.data?.message || errorObj?.message || "Failed to load bundle details.";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white font-inter p-6">
        <p className="text-red-500 font-bold text-lg">Error loading bundle details</p>
        <p className="text-gray-500 text-sm max-w-md text-center">{errorMsg}</p>
        <button
          onClick={() => navigate(`/plant/load-planning/${projectId}/bundle-planner`)}
          className="mt-4 bg-[#6E38F7] hover:bg-[#5D2EE0] text-white font-bold text-sm px-6 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          Back to Bundle Planner
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 font-inter relative">
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce ${
          toastMessage.includes("Error:") ? "bg-red-500" : "bg-[#10B981]"
        }`}>
          <Check size={18} strokeWidth={3} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/plant/load-planning/${projectId}/bundle-planner`)}
            className="text-[#212B36] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#212B36]">Edit Bundle</h1>
            <p className="text-sm text-[#637381] mt-1">
              Select Items and edit details to update the bundle
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#6E38F7] hover:bg-[#5D2EE0] disabled:bg-gray-400 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          {isSaving ? "Saving..." : "Save Bundle"}
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-[#E2E4E6] p-6 shadow-sm space-y-8">
        <div className="overflow-x-auto rounded-lg border border-[#E2E4E6]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#212B36] text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6 w-16">#</th>
                <th className="py-4 px-6">Bundle ID</th>
                <th className="py-4 px-6">Profile</th>
                <th className="py-4 px-6">Items</th>
                <th className="py-4 px-6">Length</th>
                <th className="py-4 px-6">Total Weight</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-[#212B36] font-semibold text-sm">
                <td className="py-6 px-6 text-[#637381]">1</td>
                <td className="py-6 px-6 font-bold">
                  {bundleDetails?.bundle?.bundleNo || bundleId || "BND-001"}
                </td>
                <td className="py-6 px-6 text-[#637381] capitalize">
                  {bundleDetails?.bundle?.bundleType || "Beam"}
                </td>
                <td className="py-6 px-6 text-[#637381]">{itemsNameStr}</td>
                <td className="py-6 px-6 text-[#637381]">
                  {bundleDetails?.bundle?.maxLengthFeet
                    ? `${Number(bundleDetails.bundle.maxLengthFeet).toFixed(2)} ft`
                    : "20.00 ft"}
                </td>
                <td className="py-6 px-6 text-[#637381]">
                  {totalWeight ? `${totalWeight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LBS` : "0.00 LBS"}
                </td>
                <td className="py-6 px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#637381] capitalize">
                      {bundleDetails?.bundle?.status || "Draft"}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E2E4E6]">
          <div>
            <label className="block text-xs font-bold text-[#637381] uppercase tracking-wider mb-2">Handling Instructions</label>
            <textarea
              value={handlingInstruction}
              onChange={(e) => setHandlingInstruction(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 border border-[#E2E4E6] rounded-lg text-sm text-[#212B36] font-semibold focus:ring-1 focus:ring-[#6E38F7] outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#637381] uppercase tracking-wider mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 border border-[#E2E4E6] rounded-lg text-sm text-[#212B36] font-semibold focus:ring-1 focus:ring-[#6E38F7] outline-none resize-none"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto rounded-lg border border-[#E2E4E6]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E2E4E6] text-xs font-bold text-[#212B36] uppercase tracking-wider">
                <th className="py-4 px-6 w-16">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === items.length && items.length > 0}
                      onChange={handleToggleAll}
                      className="w-4 h-4 rounded text-[#6E38F7] border-[#D0D5DD] focus:ring-[#6E38F7] cursor-pointer"
                    />
                  </div>
                </th>
                <th className="py-4 px-6 w-32">
                  <button
                    onClick={() => handleSort("qty")}
                    className="flex items-center gap-1.5 hover:text-[#6E38F7] font-bold cursor-pointer"
                  >
                    QTY
                    <span className="flex flex-col text-[8px] leading-[6px]">
                      <ChevronUp size={8} className={sortField === "qty" && sortOrder === "asc" ? "text-[#6E38F7]" : "text-gray-400"} />
                      <ChevronDown size={8} className={sortField === "qty" && sortOrder === "desc" ? "text-[#6E38F7]" : "text-gray-400"} />
                    </span>
                  </button>
                </th>
                <th className="py-4 px-6 w-32">
                  <button
                    onClick={() => handleSort("item")}
                    className="flex items-center gap-1.5 hover:text-[#6E38F7] font-bold cursor-pointer"
                  >
                    Item
                    <span className="flex flex-col text-[8px] leading-[6px]">
                      <ChevronUp size={8} className={sortField === "item" && sortOrder === "asc" ? "text-[#6E38F7]" : "text-gray-400"} />
                      <ChevronDown size={8} className={sortField === "item" && sortOrder === "desc" ? "text-[#6E38F7]" : "text-gray-400"} />
                    </span>
                  </button>
                </th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 w-32">
                  <button
                    onClick={() => handleSort("length")}
                    className="flex items-center gap-1.5 hover:text-[#6E38F7] font-bold cursor-pointer"
                  >
                    Length
                    <span className="flex flex-col text-[8px] leading-[6px]">
                      <ChevronUp size={8} className={sortField === "length" && sortOrder === "asc" ? "text-[#6E38F7]" : "text-gray-400"} />
                      <ChevronDown size={8} className={sortField === "length" && sortOrder === "desc" ? "text-[#6E38F7]" : "text-gray-400"} />
                    </span>
                  </button>
                </th>
                <th className="py-4 px-6 w-28">Unit Weight</th>
                <th className="py-4 px-6 w-28">Total Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4E6] text-sm text-[#212B36]">
              {sortedItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const currentQty = itemQuantities[item.id] ?? item.qty;
                const unitWeight = item.qty > 0 ? item.weight / item.qty : 0;
                const itemTotalWeight = unitWeight * currentQty;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#F8F9FA] transition-colors ${
                      isSelected ? "bg-[#F8F9FA]/50" : ""
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-4 h-4 rounded text-[#6E38F7] border-[#D0D5DD] focus:ring-[#6E38F7] cursor-pointer"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <input
                        type="number"
                        min={0}
                        value={currentQty}
                        onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0)}
                        disabled={!isSelected}
                        className="w-20 px-2 py-1 border border-[#E2E4E6] rounded text-[#212B36] font-semibold focus:ring-1 focus:ring-[#6E38F7] outline-none disabled:opacity-50"
                      />
                    </td>
                    <td className="py-4 px-6 font-semibold">{item.item}</td>
                    <td className="py-4 px-6 text-[#637381] font-medium max-w-xs md:max-w-sm whitespace-normal">
                      {item.description}
                    </td>
                    <td className="py-4 px-6 font-medium text-[#212B36]">{item.length}</td>
                    <td className="py-4 px-6 text-[#637381] font-medium">{unitWeight.toFixed(2)}</td>
                    <td className="py-4 px-6 text-[#637381] font-medium">{itemTotalWeight.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EditBundleView;

import React from "react";
import Button from "../common_component/Button";
import Modal from "../Modal";
import SubHeading from "../common_component/SubHeading";
import type { PackingListEntry, Bundle } from "@/modules/plant/load-planning.api";
import { getQRCodeUrl, getPackingListQRDataStr } from "@/lib/utils";
import {
  exportPackingListToPDF,
  exportPackingListToCSV,
  type ExportLoadInfo,
  type ExportSummary,
  type ExportBundleItem,
} from "@/lib/exportUtils";

interface PackingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  showQr?: boolean;
  packingList?: PackingListEntry | null;
  bundles?: Bundle[];
  projectName?: string;
  planNumber?: string;
  planId?: string;
}

const PackingListModal: React.FC<PackingListModalProps> = ({
  isOpen,
  onClose,
  showQr,
  packingList,
  bundles = [],
  projectName = "N/A",
  planNumber,
  planId,
}) => {
  const resolvedBundles = bundles.filter((b) =>
    (packingList?.bundleIds || []).includes(b._id)
  );

  const loadInfo: ExportLoadInfo = {
    packingListNo: packingList?.packingListNo || "-",
    loadId: planNumber || "-",
    projectName: projectName || "N/A",
    truck: packingList?.truckLabel || packingList?.truckType || (packingList?.truckNo ? String(packingList.truckNo) : "-"),
    driver: "-",
    destination: "-",
    dispatchDate: "-",
  };

  const summary: ExportSummary = {
    totalBundles: packingList?.totalBundles || packingList?.bundleIds.length || 0,
    totalItems: packingList?.totalItems || resolvedBundles.reduce((sum, b) => sum + (b.totalQty || b.itemCount || 0), 0),
    totalWeight: packingList?.totalWeight || 0,
    maxLengthFeet: packingList?.maxLengthFeet || 0,
  };

  const bundleList: ExportBundleItem[] = resolvedBundles.map((b) => ({
    _id: b._id,
    bundleNo: b.bundleNo,
    partNumber: b.bundleType || b.title || "N/A",
    qty: b.totalQty || b.itemCount || 0,
    length: b.maxLengthFeet || 0,
    weight: b.totalWeight || 0,
    status: b.status || "Ready",
  }));

  const standaloneBase = import.meta.env.VITE_STANDLONE_PAGE_BASE || "";
  const qrDataStr = getPackingListQRDataStr(planId);

  const handlePdfDownload = () => {
    if (packingList) {
      exportPackingListToPDF(loadInfo, summary, bundleList, !!showQr, planId);
    }
  };

  const handleExcelExport = () => {
    if (packingList) {
      exportPackingListToCSV(loadInfo, summary, bundleList);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-5xl"
      height="max-h-[90vh]"
      hideHeader={true}
    >
      <div className="md:p-4 p-2">
        {/* Header Actions */}
        <div className="flex flex-wrap justify-between items-start mb-10 gap-4">
          <Button variant="white" size="sm" onClick={onClose}>
            Back
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button variant="purpleFilled" size="sm" onClick={handlePdfDownload} disabled={!packingList}>
              Download PDF
            </Button>
            <Button variant="purpleFilled" size="sm" onClick={handleExcelExport} disabled={!packingList}>
              Export Excel
            </Button>
          </div>
        </div>

        {showQr && (
          <div className="mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
              {/* QR Code */}
              <div className="w-48 h-48 md:w-56 md:h-56 shrink-0 bg-white border border-gray-200 flex items-center justify-center p-2 rounded-lg">
                <img
                  src={getQRCodeUrl(qrDataStr, "250x250")}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Data List */}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg md:text-xl font-inter font-semibold text-gray-800">
                  project={loadInfo.projectName}
                </h3>
                <div className="space-y-1 text-sm md:text-base font-normal">
                  <p className="flex gap-2">
                    <span className="text-gray-500 min-w-[80px]">Shipper :</span>
                    <span className="text-gray-800 font-medium">shipper={loadInfo.loadId}</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-gray-500 min-w-[80px]">Load :</span>
                    <span className="text-gray-800 font-medium">load_id={loadInfo.packingListNo}</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-gray-500 min-w-[80px]">Bundles :</span>
                    <span className="text-gray-800 font-medium">bundle_ids={bundleList.map((b) => b.bundleNo).join(", ") || "-"}</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-gray-500 min-w-[80px]">Parts :</span>
                    <span className="text-gray-800 font-medium">parts={Array.from(new Set(bundleList.map((b) => b.partNumber).filter(Boolean))).join(", ") || "-"}</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-gray-500 min-w-[80px]">Weight :</span>
                    <span className="text-gray-800 font-medium">weight={summary.totalWeight ? `${summary.totalWeight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LBS` : "-"}</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-gray-500 min-w-[80px]">Length :</span>
                    <span className="text-gray-800 font-medium">length={summary.maxLengthFeet ? `${summary.maxLengthFeet.toFixed(2)} FT` : "-"}</span>
                  </p>
                  {planId && (
                    <p className="flex gap-2">
                      <span className="text-gray-500 min-w-[80px]">URL :</span>
                      <span className="text-gray-800 font-medium break-all">{`${standaloneBase.replace(/\/+$/, "")}/packing-list-plan/${planId}`}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-8">
          {/* Load Information */}
          <div>
            <SubHeading text="Load Information" />
            <div className="space-y-2 mt-3">
              {[
                { label: "Packing List ID", value: loadInfo.packingListNo },
                { label: "Load ID", value: loadInfo.loadId },
                { label: "Project", value: loadInfo.projectName },
                { label: "Truck", value: loadInfo.truck },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-gray-800 font-medium">
                    {item.label}
                  </span>
                  <span className="text-gray-800 font-medium text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Packing Summary */}
          <div className="space-y-8">
            <div>
              <SubHeading text="Packing Summary" />
              <div className="space-y-3 mt-3">
                {[
                  { label: "Total Bundles", value: summary.totalBundles.toString() },
                  { label: "Total Items", value: summary.totalItems.toString() },
                  { label: "Total weight", value: `${summary.totalWeight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lbs` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-gray-800 font-medium">
                      {item.label}
                    </span>
                    <span className="text-gray-800 font-medium text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bundle List */}
        <div>
          <SubHeading text="Bundle List" />
          <div className="overflow-x-auto rounded-sm border border-gray-100">
            <table className="w-full text-left border-collapse font-inter min-w-[800px]">
              <thead>
                <tr className="bg-[#212B36] text-white text-xs font-medium">
                  <th className="py-4 px-6 w-16">#</th>
                  <th className="py-4 px-6">Bundle ID</th>
                  <th className="py-4 px-6">Part Number</th>
                  <th className="py-4 px-6">Quantity</th>
                  <th className="py-4 px-6">Length</th>
                  <th className="py-4 px-6 w-24">Weight</th>
                  <th className="py-4 px-6" colSpan={2}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {bundleList.map((bundle, index) => (
                  <tr key={bundle._id || index} className="hover:bg-gray-50/50">
                    <td className="py-6 px-6 font-normal text-gray-800">
                      {index + 1}
                    </td>
                    <td className="py-6 px-6 font-medium text-gray-800">
                      {bundle.bundleNo}
                    </td>
                    <td className="py-6 px-6 font-normal text-gray-600">
                      {bundle.partNumber}
                    </td>
                    <td className="py-6 px-6 font-normal text-gray-600">
                      {bundle.qty}
                    </td>
                    <td className="py-6 px-6 font-normal text-gray-600">
                      {bundle.length.toFixed(2)}ft
                    </td>
                    <td className="py-6 px-6 font-normal text-gray-600 w-24">
                      <div className="flex flex-col">
                        <span>{bundle.weight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span>LBS</span>
                      </div>
                    </td>
                    <td className="py-6 px-6 font-normal text-gray-600 capitalize" colSpan={2}>
                      {bundle.status}
                    </td>
                  </tr>
                ))}
                {bundleList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No bundles assigned to this packing list.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PackingListModal;

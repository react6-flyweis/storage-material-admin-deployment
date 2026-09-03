import React from "react";
import { X } from "lucide-react";
import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import { getQRCodeUrl, type QRModalData, formatValue, printQRCodeLabel } from "@/lib/utils/qr";

interface QRCodeDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: QRModalData | null;
}

const QRCodeDataModal: React.FC<QRCodeDataModalProps> = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  const qrDataObj = {
    project: data.projectName || "",
    shipper: data.shipperRef || "",
    load_id: data.loadId || "",
    bundle_id: data.id || "",
    parts: data.parts || "",
    weight: formatValue(data.weight),
    length: formatValue(data.length),
  };

  const standaloneBase = import.meta.env.VITE_STANDLONE_PAGE_BASE || "";
  const qrCodeUrl = data.bundleId
    ? getQRCodeUrl(`${standaloneBase.replace(/\/+$/, "")}/bundle/${data.bundleId}`, "250x250")
    : getQRCodeUrl(qrDataObj, "250x250");

  const handlePrint = () => {
    printQRCodeLabel(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader width="max-w-2xl">
      <div className="relative p-2 md:p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 md:top-2 md:right-2  bg-black text-white rounded-full p-1.5 shadow-sm hover:bg-gray-800 transition-colors z-50"
        >
          <X className="size-3 md:size-4" />
        </button>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-inter font-bold text-center mb-10 text-[#212B36]">
          QR Code Data
        </h2>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
          {/* QR Code Dynamic Image */}
          <div className="w-48 h-48 md:size-52 shrink-0 bg-white border border-gray-150 flex items-center justify-center p-2 rounded-lg">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Data List */}
          <div className="flex-1 space-y-2">
            <h3 className="text-lg md:text-xl font-inter font-semibold text-(--text-color-gray-5)">
              project={qrDataObj.project}
            </h3>
            <div className="space-y-1 text-sm md:text-base font-normal">
              {/* <p className="flex gap-2">
                <span className="text-(--text-color-gray-4) min-w-[80px]">Shipper :</span>
                <span className="text-(--text-color-gray-5) font-medium">shipper={qrDataObj.shipper}</span>
              </p> */}
              <p className="flex gap-2">
                <span className="text-(--text-color-gray-4) min-w-[80px]">Load :</span>
                <span className="text-(--text-color-gray-5) font-medium">load_id={qrDataObj.load_id}</span>
              </p>
              <p className="flex gap-2">
                <span className="text-(--text-color-gray-4) min-w-[80px]">Bundle :</span>
                <span className="text-(--text-color-gray-5) font-medium">bundle_id={qrDataObj.bundle_id}</span>
              </p>
              <p className="flex gap-2">
                <span className="text-(--text-color-gray-4) min-w-[80px]">Parts :</span>
                <span className="text-(--text-color-gray-5) font-medium">parts={qrDataObj.parts}</span>
              </p>
              <p className="flex gap-2">
                <span className="text-(--text-color-gray-4) min-w-[80px]">Weight :</span>
                <span className="text-(--text-color-gray-5) font-medium">weight={qrDataObj.weight}</span>
              </p>
              <p className="flex gap-2">
                <span className="text-(--text-color-gray-4) min-w-[80px]">Length :</span>
                <span className="text-(--text-color-gray-5) font-medium">Length={qrDataObj.length}</span>
              </p>
              {/* {data.bundleId && (
                <p className="flex gap-2">
                  <span className="text-(--text-color-gray-4) min-w-[80px]">URL :</span>
                  <span className="text-(--text-color-gray-5) font-medium break-all">
                    {`${standaloneBase.replace(/\/+$/, "")}/bundle/${data.bundleId}`}
                  </span>
                </p>
              )} */}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-12">
          <Button size="lg" className="w-full bg-[linear-gradient(90deg,#2563EB_0%,#4F46E5_100%)] text-white hover:opacity-90 font-semibold" onClick={handlePrint}>
            Export PDF
          </Button>
          <Button size="lg" className="w-full bg-[linear-gradient(90deg,#2563EB_0%,#4F46E5_100%)] text-white hover:opacity-90 font-semibold" onClick={handlePrint}>
            Print
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeDataModal;

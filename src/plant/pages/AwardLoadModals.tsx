import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { FreightBidItem } from "@/modules/plant/freight.api";
import { Loader2 } from "lucide-react";

// --- Award Load Modal ---
interface AwardLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  carrier: FreightBidItem | null;
  isLoading: boolean;
  error?: string;
}

export const AwardLoadModal: React.FC<AwardLoadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  carrier,
  isLoading,
  error,
}) => {
  if (!carrier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl">
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Award Freight Load</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to award this freight load to <strong className="text-gray-900">{carrier.carrierName}</strong>?
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Carrier Name</span>
              <span className="font-semibold text-gray-900">{carrier.carrierName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Bid Amount</span>
              <span className="font-bold text-green-600">${carrier.bidAmount?.toLocaleString()}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#00A76F] hover:bg-[#008F5E] text-white rounded-xl h-11"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Award
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Award Success Modal ---
interface AwardSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
  carrier: FreightBidItem | null;
  projectName: string;
  deliveryId: string;
  deliveryDate: string;
  poc: string;
  location: string;
}

export const AwardSuccessModal: React.FC<AwardSuccessModalProps> = ({
  isOpen,
  onClose,
  onOk,
  carrier,
  projectName,
  deliveryId,
  deliveryDate,
  poc,
  location,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl">
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-[#00A76F]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 font-inter">Load Awarded Successfully</h3>
            <p className="text-sm text-gray-500">
              The load request has been awarded to {carrier?.carrierName}.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl text-left space-y-3 font-inter">
            <div className="text-xs">
              <span className="text-gray-400 font-bold block uppercase">Project Name</span>
              <span className="font-semibold text-gray-800">{projectName}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400 font-bold block uppercase">Delivery ID</span>
              <span className="font-semibold text-gray-800">{deliveryId}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400 font-bold block uppercase">Delivery Date</span>
              <span className="font-semibold text-gray-800">{deliveryDate}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400 font-bold block uppercase">Point of Contact</span>
              <span className="font-semibold text-gray-800">{poc}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400 font-bold block uppercase">Location</span>
              <span className="font-semibold text-gray-800">{location}</span>
            </div>
          </div>

          <Button
            className="w-full bg-[#4250ee] hover:bg-[#3440cc] text-white rounded-xl h-11"
            onClick={onOk}
          >
            Ok
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Request Revision Modal ---
interface RequestRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { targetAmount: string; message: string }) => void;
  carrier: FreightBidItem | null;
  isLoading: boolean;
  error?: string;
}

export const RequestRevisionModal: React.FC<RequestRevisionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  carrier,
  isLoading,
  error,
}) => {
  const [targetAmount, setTargetAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ targetAmount, message });
  };

  if (!carrier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Request Bid Revision</h3>
            <p className="text-sm text-gray-500">
              Request {carrier.carrierName} to resubmit their bid with a revised amount.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Current Bid</label>
              <div className="text-lg font-bold text-gray-900">${carrier.bidAmount?.toLocaleString()}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Target Amount (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 2600"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E51A4]/20 focus:border-[#1E51A4]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Message / Note</label>
              <textarea
                placeholder="Write your note to carrier here..."
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E51A4]/20 focus:border-[#1E51A4] h-24 resize-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl h-11"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#FF6900] hover:bg-[#e05c00] text-white rounded-xl h-11"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- Revision Success Modal ---
interface RevisionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
  carrier: FreightBidItem | null;
  targetAmount: string;
  message: string;
}

export const RevisionSuccessModal: React.FC<RevisionSuccessModalProps> = ({
  isOpen,
  onClose,
  onOk,
  carrier,
  targetAmount,
  message,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl">
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#FF6900]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Revision Requested</h3>
            <p className="text-sm text-gray-500">
              Revision request sent to {carrier?.carrierName}.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl text-left space-y-3 font-inter">
            <div className="text-xs">
              <span className="text-gray-400 font-bold block uppercase">Target Amount</span>
              <span className="font-semibold text-gray-800">{targetAmount ? `$${Number(targetAmount).toLocaleString()}` : "N/A"}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400 font-bold block uppercase">Message / Note</span>
              <span className="font-semibold text-gray-800">{message || "—"}</span>
            </div>
          </div>

          <Button
            className="w-full bg-[#4250ee] hover:bg-[#3440cc] text-white rounded-xl h-11"
            onClick={onOk}
          >
            Ok
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, UploadCloud, Scale, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGetConsolidatedBOMUrlQuery,
} from "@/modules/plant/bom.hooks";
import {
  useGetShipperDocumentQuery,
  useGetProjectShipperRequestsQuery,
  useCompareShipperRequestMutation,
} from "@/modules/plant/shipper.hooks";
import { truncateMiddle } from "@/lib/utils";

export default function OrderVerification() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { leadId, projectId, requestId } = useParams();

  const {
    data: shipperDoc,
    isLoading: isShipperDocLoading,
    isFetching: isShipperDocFetching,
  } = useGetShipperDocumentQuery(requestId || "", {
    skip: !requestId,
  });

  const effectiveLeadId = leadId || shipperDoc?.leadId || shipperDoc?.projectId || projectId || "";

  const {
    data: bomUrlData,
    isLoading: isBomUrlLoading,
    isFetching: isBomUrlFetching,
  } = useGetConsolidatedBOMUrlQuery(effectiveLeadId);

  const [selectedVendor, setSelectedVendor] = useState("");
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);

  const [bomFile, setBomFile] = useState<string | null>("");
  const [shipperFile, setShipperFile] = useState<string | null>("");

  const {
    data: shipperRequestsData,
    isLoading: isShipperRequestsLoading,
    isFetching: isShipperRequestsFetching,
  } = useGetProjectShipperRequestsQuery(effectiveLeadId, {
    skip: !effectiveLeadId || !!requestId,
  });

  const isBomLoading = isBomUrlLoading || (Boolean(effectiveLeadId) && isBomUrlFetching && !bomFile);
  const isShipperLoading = requestId
    ? isShipperDocLoading || (isShipperDocFetching && !shipperFile)
    : isShipperRequestsLoading || (isShipperRequestsFetching && !shipperFile);

  const vendorOptions = (shipperRequestsData?.shipperRequests || []).map((req) => ({
    label: req.vendorName,
    value: req.vendorName,
  }));

  useEffect(() => {
    if (shipperDoc?.fileName) {
      setTimeout(() => {
        setShipperFile(shipperDoc.fileName);
      }, 0);
    }
    if (shipperDoc?.vendorName) {
      setTimeout(() => {
        setSelectedVendor(shipperDoc.vendorName);
      }, 0);
    }
  }, [shipperDoc]);

  useEffect(() => {
    if (!requestId && shipperRequestsData?.shipperRequests && shipperRequestsData.shipperRequests.length > 0) {
      const exists = shipperRequestsData.shipperRequests.some(
        (req) => req.vendorName === selectedVendor
      );
      if (!exists) {
        setTimeout(() => {
          setSelectedVendor(shipperRequestsData.shipperRequests[0].vendorName);
        }, 0);
      }
    }
  }, [shipperRequestsData, requestId, selectedVendor]);

  useEffect(() => {
    if (!requestId && shipperRequestsData?.shipperRequests) {
      const match = shipperRequestsData.shipperRequests.find(
        (req) => req.vendorName === selectedVendor
      );
      setTimeout(() => {
        if (match) {
          setShipperFile(match.fileName || "");
        } else {
          setShipperFile("");
        }
      }, 0);
    }
  }, [selectedVendor, shipperRequestsData, requestId]);

  useEffect(() => {
    if (bomUrlData?.fileUrl) {
      const url = bomUrlData.fileUrl;
      const fileId = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
      setTimeout(() => {
        setBomFile(decodeURIComponent(fileId) || "Consolidated_BOM.xlsx");
      }, 0);
    }
  }, [bomUrlData]);

  const [compareShipperRequest, { isLoading: isComparing }] = useCompareShipperRequestMutation();

  const activeRequestId = requestId || shipperRequestsData?.shipperRequests?.find(
    (req) => req.vendorName === selectedVendor
  )?.requestId;

  const handleCompare = async () => {
    if (!activeRequestId) return;
    try {
      await compareShipperRequest(activeRequestId).unwrap();
      setIsProcessingModalOpen(true);
    } catch (err) {
      console.error("Failed to start comparison:", err);
    }
  };

  const handleModalOk = () => {
    setIsProcessingModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["plant", "shipper"] });
    const targetLeadId = effectiveLeadId || shipperRequestsData?.leadId || shipperRequestsData?.projectId;
    if (targetLeadId && activeRequestId) {
      queryClient.invalidateQueries({ queryKey: ["plant", "shipper", "document", activeRequestId] });
      navigate(`/plant/shipper-quotation/${targetLeadId}/file/${activeRequestId}`);
    } else if (targetLeadId) {
      queryClient.invalidateQueries({ queryKey: ["plant", "shipper", "project-requests", targetLeadId] });
      navigate(`/plant/shipper-quotation/${targetLeadId}`);
    } else {
      navigate("/plant/shippers");
    }
  };


  return (
    <div className="flex-1 space-y-6 p-6 bg-[#eef2fa] min-h-screen font-sans flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-start mb-4">
        <Button 
          variant="default" 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm h-9 px-4 mr-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight leading-none mb-1">
            Order Verification
          </h1>
          <p className="text-sm text-gray-500">File Update & Compare</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12">
        {!requestId && vendorOptions.length > 0 && (
          <div className="mb-8 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor</label>
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendorOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* BOM File Dropzone */}
          <div className="border-2 border-dashed border-blue-400/60 rounded-xl p-8 flex flex-col items-center justify-center min-h-[280px] bg-blue-50/30 relative">
            <div className="w-16 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-6 shadow-sm relative">
              <div className="absolute -top-2 w-10 h-3 bg-blue-600 rounded-t-lg right-3"></div>
              <div className="bg-white rounded-full p-1 shadow-sm mt-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-medium text-gray-900 mb-8">Uploaded BOM File</h3>
            
            {isBomLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-xs text-gray-500 font-medium font-sans">Loading BOM file...</span>
              </div>
            ) : bomFile ? (
              <div className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm relative z-10">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="bg-red-500 text-white font-bold text-[10px] px-2.5 py-2 rounded flex items-center justify-center shadow-sm shrink-0">
                    XLSX
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate" title={bomFile}>
                      {truncateMiddle(bomFile)}
                    </p>
                    <p className="text-xs text-gray-500">Consolidated BOM</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No BOM file found</p>
            )}
          </div>

          {/* Shipper File Dropzone */}
          <div className="border-2 border-dashed border-blue-400/60 rounded-xl p-8 flex flex-col items-center justify-center min-h-[280px] bg-blue-50/30 relative">
            <div className="w-16 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-6 shadow-sm relative">
              <div className="absolute -top-2 w-10 h-3 bg-blue-600 rounded-t-lg right-3"></div>
              <div className="bg-white rounded-full p-1 shadow-sm mt-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-medium text-gray-900 mb-8">Uploaded Shipper File</h3>
            
            {isShipperLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-xs text-gray-500 font-medium font-sans">Loading Shipper file...</span>
              </div>
            ) : shipperFile ? (
              <div className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm relative z-10">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="bg-green-600 text-white font-bold text-xs px-2.5 py-2 rounded flex items-center justify-center shadow-sm shrink-0">
                    CSV
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 uppercase truncate" title={shipperFile}>
                      {truncateMiddle(shipperFile)}
                    </p>
                    <p className="text-xs text-gray-500">Shipper Document</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No shipper file found</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button 
            className="bg-[#6344f5] hover:bg-[#5233d6] text-white px-8 h-12 rounded-lg shadow-md font-medium text-base transition-colors"
            onClick={handleCompare}
            disabled={!bomFile || !shipperFile || isComparing || isBomLoading || isShipperLoading}
          >
            {isComparing ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Scale className="w-5 h-5 mr-2" />
            )}
            Compare Files
          </Button>
        </div>
      </div>

      {/* Processing Modal */}
      <Dialog open={isProcessingModalOpen} onOpenChange={setIsProcessingModalOpen}>
        <DialogContent className="sm:max-w-md p-10 flex flex-col items-center justify-center text-center gap-6 rounded-3xl">
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle className="text-3xl font-bold text-gray-900 mb-4">Processing Files...</DialogTitle>
            <DialogDescription className="text-base text-gray-900 font-medium leading-relaxed max-w-[280px]">
              It Takes a little time we will Notify you after Comparison
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full sm:justify-center mt-2">
            <Button 
              type="button" 
              className="bg-[#3b66f5] hover:bg-[#2b51d6] text-white w-full max-w-[240px] h-12 rounded-xl text-lg font-semibold shadow-md"
              onClick={handleModalOk}
            >
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

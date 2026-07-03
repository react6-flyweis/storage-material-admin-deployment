import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, FileText, UploadCloud, X, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function OrderVerification() {
  const navigate = useNavigate();
  const [bomFile, setBomFile] = useState<boolean>(true);
  const [shipperFile, setShipperFile] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#eef2fa] min-h-screen font-sans flex flex-col items-center">
      <div className="w-full max-w-5xl flex items-center justify-start mb-4">
        <Button 
          variant="default" 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm h-9 px-4 mr-4"
          onClick={() => navigate('/plant')}
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

      <div className="w-full max-w-5xl bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12">
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
            
            {bomFile ? (
              <div className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm relative z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-red-500 text-white font-bold text-[10px] w-10 h-10 rounded flex items-center justify-center shadow-sm">
                    PDF
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Test_Reconciliation_Data</p>
                    <p className="text-xs text-gray-500">5.3MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setBomFile(false)}
                  className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setBomFile(true)} className="relative z-10">
                Select File
              </Button>
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
            
            {shipperFile ? (
              <div className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm relative z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-green-600 text-white font-bold text-xs w-10 h-10 rounded flex items-center justify-center shadow-sm">
                    X
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 uppercase">1215-USB_SHIPPER</p>
                    <p className="text-xs text-gray-500">5.3MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShipperFile(false)}
                  className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShipperFile(true)} className="relative z-10">
                Select File
              </Button>
            )}
          </div>

        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button 
            className="bg-[#6344f5] hover:bg-[#5233d6] text-white px-8 h-12 rounded-lg shadow-md font-medium text-base transition-colors"
            onClick={() => setIsModalOpen(true)}
            disabled={!bomFile || !shipperFile}
          >
            <Scale className="w-5 h-5 mr-2" />
            Compare Files
          </Button>
        </div>
      </div>

      {/* Processing Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
              onClick={() => setIsModalOpen(false)}
            >
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

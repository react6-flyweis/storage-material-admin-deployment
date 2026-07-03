import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudUpload, Trash2, FileText, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";

interface UploadBOMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadBOMModal({ isOpen, onClose }: UploadBOMModalProps) {
  const navigate = useNavigate();
  const [files, setFiles] = useState<{name: string; size: string}[]>([
    { name: "MBS_Invoice (4).xls", size: "3MB" }
  ]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setShowSuccess(true);
  };

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  const handleViewBOM = () => {
    handleClose();
    navigate("/plant/bom-details/123");
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[400px] p-8 bg-white border-none rounded-2xl flex flex-col items-center justify-center space-y-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mt-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={3} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 text-center">
            File Uploaded Successfully!
          </h2>
          <Button 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-medium mt-4"
            onClick={handleViewBOM}
          >
            View BOM File
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 border-none bg-white rounded-2xl overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-900">
            Upload BOM File
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Upload a bill of materials xls file to start processing your items costs
          </p>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-6">
          <div className="border-2 border-dashed border-gray-200 rounded-xl bg-[#FAFAFA] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
              <CloudUpload className="w-6 h-6 text-[#5C5CFF]" />
            </div>
            <p className="text-base text-gray-900 font-medium mb-1">
              Drag your document here or <span className="text-[#5C5CFF]">Browse</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
              <span>Format : xls</span>
              <span>Max size : 25mb</span>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="h-11 px-8 rounded-lg border-gray-200 text-gray-700 font-medium"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSave}
              className="h-11 px-10 rounded-lg bg-[#5C5CFF] hover:bg-blue-600 text-white font-medium"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

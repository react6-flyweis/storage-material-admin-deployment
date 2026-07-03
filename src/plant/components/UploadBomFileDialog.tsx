import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, File as FileIcon } from "lucide-react";

interface UploadBomFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadBomFileDialog({
  open,
  onOpenChange,
}: UploadBomFileDialogProps) {
  const [uploadedFile, setUploadedFile] = useState<{name: string, size: string} | null>(
    { name: "BOM-Project 001", size: "5.3MB" } // Mock state to match screenshot
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl border-0 bg-white shadow-xl">
        
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900">Upload BOM File</DialogTitle>
          </div>
          <p className="text-sm text-slate-500 mt-1">Add your documents here, and you can upload up to 5 files max</p>
        </DialogHeader>

        <div className="border-2 border-dashed border-[#3b59df]/30 rounded-xl bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-[#3b59df] text-white rounded-lg flex items-center justify-center mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-900 font-medium mb-2">Drag your file(s) to start uploading</p>
          <div className="flex items-center gap-2 w-full max-w-[200px] mb-4">
            <div className="flex-1 h-[1px] bg-slate-200"></div>
            <span className="text-xs font-semibold text-slate-400 uppercase">OR</span>
            <div className="flex-1 h-[1px] bg-slate-200"></div>
          </div>
          <Button variant="outline" className="rounded-full border-[#3b59df] text-[#3b59df] hover:bg-[#3b59df]/5 font-semibold px-6">
            Browse files
          </Button>
        </div>
        
        <p className="text-[13px] text-slate-500 mt-3 mb-6">Only support .jpg, .png and .svg and zip files</p>

        {uploadedFile && (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">
                PDF
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{uploadedFile.name}</p>
                <p className="text-[12px] text-slate-500">{uploadedFile.size}</p>
              </div>
            </div>
            <button 
              className="text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setUploadedFile(null)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-2">
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 w-[100px] font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            className="rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white w-[100px] font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Upload
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

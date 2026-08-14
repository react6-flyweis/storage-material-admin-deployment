import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProcessingFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
}

const ProcessingFilesModal: React.FC<ProcessingFilesModalProps> = ({
  isOpen,
  onClose,
  onOk,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-10 flex flex-col items-center justify-center text-center gap-6 rounded-3xl">
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle className="text-3xl font-bold text-gray-900 mb-4">
            Processing Files...
          </DialogTitle>
          <DialogDescription className="text-base text-gray-900 font-medium leading-relaxed max-w-[280px]">
            It Takes a little time we will Notify you after Comparison
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full sm:justify-center mt-2">
          <Button
            type="button"
            className="bg-[#3b66f5] hover:bg-[#2b51d6] text-white w-full max-w-[240px] h-12 rounded-xl text-lg font-semibold shadow-md"
            onClick={onOk}
          >
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessingFilesModal;

import React from "react";
import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import SuccessModalCheckIcon from "../../assets/SuccessModalCheckIcon.svg";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subTitle?: string;
  buttonText?: string;
  children?: React.ReactNode;
  isLogoBottom?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Entry Added",
  subTitle,
  buttonText = "Ok",
  children,
  isLogoBottom = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-lg" hideHeader={true}>
      <div className="flex flex-col items-center text-center justify-center p-4 font-inter">
        {!isLogoBottom && (
          <div className="md:-mt-6 md:-mb-6">
            <img
              src={SuccessModalCheckIcon}
              alt="Success"
              className="md:w-40 md:h-40 w-36 h-36 mb-6"
            />
          </div>
        )}
        {title && (
          <h2 className="text-xl sm:text-2xl md:text-2xl font-semibold text-black mb-1 mx-4">
            {title}
          </h2>
        )}
        {subTitle && (
          <h2 className="text-lg md:text-xl font-semibold text-black mb-6">
            {subTitle}
          </h2>
        )}

        {children}

        {isLogoBottom && (
          <div className="md:-mt-6 md:-mb-6">
            <img
              src={SuccessModalCheckIcon}
              alt="Success"
              className="md:w-60 md:h-60 w-36 h-36"
            />
          </div>
        )}

        <Button
          onClick={onClose}
          className="w-40 md:w-60 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-xl py-6 text-lg font-medium mt-3"
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
};


export default SuccessModal;
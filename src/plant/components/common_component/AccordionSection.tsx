import React, { useState } from "react";
import { ChevronDown, Info } from "lucide-react";

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b border-gray-100 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center font-bold text-gray-700">
          <Info className="w-5 h-5 text-teal-500 mr-2" />
          {title}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && <div className="p-6">{children}</div>}
    </div>
  );
};

export default AccordionSection;

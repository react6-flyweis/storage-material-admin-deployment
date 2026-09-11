import React, { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Check, ArrowLeft } from "lucide-react";
import Button from "@/plant/components/common_component/Button";
import TitleSubtitle from "@/plant/components/common_component/TitleSubtitle";

export interface HeaderAction {
  label: string;
  variant: "primary" | "secondary" | "gradient" | "outline" | "danger" | "white" | "purpleFilled" | "greenFilled" | "blueFilled" | "grayFilled";
  className: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface LoadPlanningHeaderProps {
  requestId: string;
  title: string;
  description: string;
  actions?: HeaderAction[];
}

const STEPS_CLICKABLE = import.meta.env.DEV ? true : false;

const stepsConfig = [
  {
    name: "Item Analysis",
    title: "Item Analysis",
    description: "Analyze the material list for accuracy and identify any missing or incompatible items.",
    path: "item-analysis",
  },
  {
    name: "Bundle Planner",
    title: "Bundle / Pallet Planner",
    description: "Group items into optimized bundles or pallets for efficient truck loading and site unloading.",
    path: "bundle-planner",
  },
  {
    name: "Truck Optimizer",
    title: "Truckload Optimizer",
    description: "Optimize bundle assignments into truckloads to maximize utilization and prepare shipments for dispatch.",
    path: "truck-optimizer",
  },
  {
    name: "Packing List",
    title: "Packing List",
    description: "Generate and manage packing lists for truckloads and bundles.",
    path: "packing-list",
  },
  {
    name: "QR Label",
    title: "QR Label Generator",
    description: "Generate and print QR labels for bundles and pallets to enable scanning and tracking.",
    path: "qr-label",
  },
  {
    name: "Load Plan Review",
    title: "Load Plan Review",
    description: "Final check of the entire load plan, including bundles, trucks, and weights, before selecting freight carriers.",
    path: "load-plan-review",
  },
  {
    name: "Freight Selection",
    title: "Create Freight Request",
    description: "Request freight pricing from carriers and compare competitive bids",
    path: "freight-selection",
  },
];

const LoadPlanningHeader: React.FC<LoadPlanningHeaderProps> = ({
  requestId,
  title,
  description,
  actions = [],
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const pathStepIndex = stepsConfig.findIndex((step) =>
    location.pathname.includes(step.path)
  );

  const currentStepIndex = pathStepIndex !== -1 ? pathStepIndex : 0;

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(
        '[data-active="true"]'
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentStepIndex]);

  const handleStepClick = (idx: number) => {
    if (!STEPS_CLICKABLE) return;
    const step = stepsConfig[idx];
    if (step && requestId) {
      navigate(`/plant/load-planning/${requestId}/${step.path}`);
    }
  };

  const handleBack = () => {
    navigate(`/plant/load-planning`);
  };

  return (
    <div className="md:px-4 px-2">
      {/* ── Stepper ─────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="bg-white rounded-[14px] py-8 px-4 mb-6 border border-gray-100 overflow-x-auto custom-scrollbar shadow-sm"
      >
        <div className="relative flex items-center justify-between min-w-[1100px] lg:min-w-0 max-w-6xl mx-auto px-10 lg:px-14">
          {/* Progress Line Background */}
          <div className="absolute top-[13px] left-14 right-14 lg:left-[70px] lg:right-[70px] h-[2px] bg-gray-100">
            {/* Active Progress Line */}
            <div className="h-[4px] bg-[#0043CE] transition-all duration-300 w-full" />
          </div>

          {stepsConfig.map((step, idx) => (
            <div
              key={step.name}
              data-active={idx === currentStepIndex}
              className="relative z-10 flex flex-col items-center cursor-pointer"
              onClick={() => handleStepClick(idx)}
            >
              <div
                className={`w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all duration-200 ${
                  idx <= currentStepIndex
                    ? "bg-[#0043CE]"
                    : "bg-white border border-[#C6C6C6]"
                } ${idx === currentStepIndex ? "ring-2 ring-[#0043CE]/10" : ""}`}
              >
                {idx < currentStepIndex ? (
                  <Check size={14} className="text-white" strokeWidth={3} />
                ) : idx === currentStepIndex ? (
                  <div className="w-[20px] h-[20px] rounded-full bg-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0043CE]" />
                  </div>
                ) : null}
              </div>
              <span
                className={`mt-4 text-xs font-inter whitespace-nowrap transition-colors ${
                  idx === currentStepIndex
                    ? "text-black font-normal"
                    : "text-[#919EAB] font-normal"
                }`}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Header Info & Actions */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4 px-2">
        <div className="flex gap-4">
          <button
            onClick={handleBack}
            className="text-black transition-colors cursor-pointer"
          >
            <ArrowLeft size={22} />
          </button>
          <TitleSubtitle
            title={title}
            subtitle={description}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant}
              className={action.className}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadPlanningHeader;

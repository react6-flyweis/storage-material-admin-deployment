import SuccessModal from "../components/common_component/SuccessModal";

export const RescheduleSuccessModal = ({
  isOpen,
  onClose,
  projectName = "",
  newDate = "",
  timeWindow = "",
  contact = ""
}: {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  newDate?: string;
  timeWindow?: string;
  contact?: string;
}) => (
  <SuccessModal
    isOpen={isOpen}
    onClose={onClose}
    title=""
    isLogoBottom={false}
  >
    <div className="text-center space-y-6 mb-8 font-inter">
      <h2 className="text-2xl md:text-3xl font-bold text-[#212B36] leading-tight px-4">
        Your delivery for <br /> <span className="font-extrabold">"{projectName}"</span> <br /> has been rescheduled.
      </h2>

      <div className="space-y-2 py-4">
        <p className="text-lg font-semibold text-[#212B36]">New Date: {newDate}</p>
        <p className="text-lg font-semibold text-[#212B36]">Time Window: {timeWindow}</p>
        <p className="text-lg font-semibold text-[#212B36]">Contact: {contact}</p>
      </div>
    </div>
  </SuccessModal>
);

export const InTransitSuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <SuccessModal
    isOpen={isOpen}
    onClose={onClose}
    title=""
    isLogoBottom={false}
  >
    <div className="text-center space-y-6 mb-8 font-inter">
      <h2 className="text-3xl font-bold text-[#212B36] px-4">
        Your delivery is now in transit.
      </h2>

      <div className="py-4">
        <p className="text-lg font-semibold text-[#212B36]">ETA: 8:00 AM – 12:00 PM</p>
      </div>
    </div>
  </SuccessModal>
);

export const DeliveredSuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <SuccessModal
    isOpen={isOpen}
    onClose={onClose}
    title=""
    isLogoBottom={false}
  >
    <div className="text-center space-y-6 mb-8 font-inter">
      <h2 className="text-3xl font-bold text-[#212B36] px-4 leading-tight">
        Your delivery is Marked <br /> as Delivered
      </h2>

      <div className="space-y-2 py-4">
        <p className="text-lg font-semibold text-[#212B36]">Delivered Time : 11:00 AM</p>
        <p className="text-lg font-semibold text-[#212B36]">Received By: Receiver Name</p>
        <p className="text-lg font-semibold text-[#212B36]">Delivery Notes : NA</p>
      </div>
    </div>
  </SuccessModal>
);

export const StatusUpdatedSuccessModal = ({
  isOpen,
  onClose,
  projectName = "",
  statusLabel = "",
  timestamp,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  statusLabel: string;
  timestamp?: string;
}) => (
  <SuccessModal
    isOpen={isOpen}
    onClose={onClose}
    title=""
    isLogoBottom={false}
  >
    <div className="text-center space-y-6 mb-8 font-inter">
      <h2 className="text-2xl md:text-3xl font-bold text-[#212B36] px-4 leading-tight">
        Delivery Status Updated to <br />
        <span className="text-blue-600 font-extrabold">{statusLabel}</span>
      </h2>

      <div className="space-y-2 py-4">
        {projectName && (
          <p className="text-base font-semibold text-[#212B36]">
            Project: <span className="text-[#637381]">{projectName}</span>
          </p>
        )}
        <p className="text-sm font-medium text-[#637381]">
          Updated: {timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  </SuccessModal>
);


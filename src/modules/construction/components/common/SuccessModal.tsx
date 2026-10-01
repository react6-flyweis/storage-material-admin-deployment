import { useNavigate } from "react-router";
import successmodalimg from "../../assets/successmodalimg.svg";

type SuccessModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  redirectTo?: string;
};

export default function SuccessModal({
  open,
  title,
  description,
  onClose,
  redirectTo,
}: SuccessModalProps) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleOk = () => {
    onClose();

    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-[642px]
          bg-white
          rounded-xl
          md:p-[40px] sm:p-10 p-6
          flex flex-col items-center text-center
        "
      >
        <h2
          className="
            text-black max-w-[336px] leading-[1.2]
            text-[28px] sm:text-[36px]
            font-semibold
          "
        >
          {title}
        </h2>

        {description && (
          <p className="text-gray-500 text-sm mt-2 max-w-[400px]">
            {description}
          </p>
        )}

        <img
          src={successmodalimg}
          alt="success"
          className="w-[180px] h-[180px] sm:w-[250px] sm:h-[250px]"
        />

        <button
          onClick={handleOk}
          className="
            w-full max-w-[420px]
            py-2.5
            rounded-[14px]
            text-white
            text-[20px] sm:text-[24px]
            font-semibold
            bg-gradient-to-r from-[#2563EB] to-[#4F46E5]
            hover:opacity-90
            transition
          "
        >
          Ok
        </button>
      </div>
    </div>
  );
}

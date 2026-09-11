import React from "react";
import clsx from "clsx";

type Variant =
  | "primary"
  | "secondary"
  | "gradient"
  | "outline"
  | "danger"
  | "white"
  | "purpleFilled"
  | "greenFilled"
  | "blueFilled"
  | "grayFilled"
  | "mint"
  | "gradientGreen"
  | "error"
  | "orangeFilled"
  | "gradientOrange"
  | "outlineGreen"
  | "blueOutlined";

type Size = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const baseStyles =
  "font-inter w-fit gap-2 shrink-0 font-medium transition-all duration-200 rounded-[8px] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#1E51A4] border border-[#1E51A4] text-white hover:opacity-90 shadow-xs shadow-blue-500/20",
  secondary:
    "bg-white border border-[#446DF6] text-[#446DF6] rounded-lg text-sm font-inter font-bold hover:bg-[#446DF6]/5 transition-colors",
  gradient:
    "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-xs shadow-blue-500/20",
  outline: "border border-gray-200 text-[#D1D5DC] hover:bg-gray-50 text-black",
  danger: "bg-red-500 text-white hover:opacity-90",
  white:
    "bg-white text-black hover:bg-gray-50 border border-[#E2E4E6] shadow-xs font-medium",
  purpleFilled:
    "bg-[#7539FF] text-white hover:opacity-90 border border-[#E2E4E6] shadow-xs font-medium",
  greenFilled:
    "bg-[#3AB449] text-white hover:opacity-90 border border-[#E2E4E6] shadow-xs font-medium",
  blueFilled:
    "bg-[#2563EB] text-white hover:opacity-90 border border-[#E2E4E6] shadow-xs font-medium",
  grayFilled:
    "bg-[#5D6772] text-white border border-[#E2E4E6] shadow-xs font-medium",
  mint: "bg-[#00C8B3] text-black border border-[#FCF8EB] font-medium",
  gradientGreen:
    "bg-[linear-gradient(90deg,_#00A63E_0%,_#008236_100%)] text-white",
  error: "text-[#E7000B] bg-white border border-[#E2E4E6]",
  orangeFilled: "bg-[#FF6900] text-white",
  gradientOrange:
    "bg-[linear-gradient(90deg,_#D08700_0%,_#A65F00_100%)] text-white",
  outlineGreen: "border bg-white text-[#008236] border-[#00C853]",
  blueOutlined: "border-2 border-[#155DFC] text-[#051321] text-sm font-medium shadow-sm hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 md:text-sm text-xs",
  md: "px-6 py-3 md:text-sm text-xs",
  lg: "px-8 py-3 md:text-base text-sm",
  xl: "px-10 py-3 md:text-base text-sm",
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

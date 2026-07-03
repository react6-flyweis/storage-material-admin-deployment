import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(phone: string | undefined | null) {
  if (!phone) return "N/A";
  if (phone.startsWith("+")) return phone;
  const digits = phone.replace(/\D/g, "");
  const isUS = digits.startsWith("1");
  const remaining = isUS ? digits.slice(1) : digits;
  return remaining ? `+1 ${remaining}` : "+1 ";
}

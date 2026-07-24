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

export function truncateMiddle(str: string, maxLength: number = 30, frontLength: number = 12, backLength: number = 12) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, frontLength) + "..." + str.slice(-backLength);
}

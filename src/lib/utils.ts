import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return '0'
  return n.toFixed(digits)
}

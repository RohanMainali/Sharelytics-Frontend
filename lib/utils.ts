import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: string | number): string {
  if (typeof value === "string") {
    // Remove commas if present and convert to number
    const numValue = Number.parseFloat(value.replace(/,/g, ""))
    if (isNaN(numValue)) return value
    value = numValue
  }

  return new Intl.NumberFormat("en-IN").format(value)
}

export function formatPercentage(value: string | number): string {
  if (typeof value === "string") {
    // Remove % if present and convert to number
    const numValue = Number.parseFloat(value.replace(/%/g, ""))
    if (isNaN(numValue)) return value
    value = numValue
  }

  return `${value.toFixed(2)}%`
}

export function getChangeColor(change: string | number): string {
  if (typeof change === "string") {
    change = Number.parseFloat(change.replace(/[+%,]/g, ""))
  }

  if (isNaN(change)) return "text-gray-700"
  if (change > 0) return "text-green-600"
  if (change < 0) return "text-red-600"
  return "text-gray-700"
}

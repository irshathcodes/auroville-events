import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateParam(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/**
 * Returns a Date object representing "now" in Auroville's timezone (Asia/Kolkata, UTC+5:30).
 * Important for SSR on Cloudflare Workers which run in UTC.
 */
export function getAurovilleToday(): Date {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  return new Date(istString);
}

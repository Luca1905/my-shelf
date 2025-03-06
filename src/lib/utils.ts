import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " bytes";
  
  const units = ["KB", "MB", "GB", "TB"];
  let u = -1;
  const r = 10**2;
  
  do {
    bytes /= 1024;
    u++;
  } while (Math.round(bytes * r) / r >= 1000 && u < units.length - 1);
  
  const decimals = bytes >= 100 ? 0 : bytes >= 10 ? 1 : 2;
  return bytes.toFixed(decimals) + " " + units[u];
}


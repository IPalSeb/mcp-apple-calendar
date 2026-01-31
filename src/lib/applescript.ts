import { execFile } from "node:child_process";

export function runAppleScript(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("osascript", ["-e", script], (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Parse an ISO date string into components without timezone shifting.
 * Handles both "2026-01-30" (date only) and "2026-01-30T10:00:00" (datetime).
 */
function parseISO(iso: string): { year: number; month: number; day: number; hours: number; minutes: number; seconds: number } {
  const [datePart, timePart] = iso.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  let hours = 0, minutes = 0, seconds = 0;
  if (timePart) {
    const timeParts = timePart.replace(/Z$/, "").split(":");
    hours = Number(timeParts[0]) || 0;
    minutes = Number(timeParts[1]) || 0;
    seconds = Math.floor(Number(timeParts[2]) || 0);
  }
  return { year, month, day, hours, minutes, seconds };
}

/**
 * Returns AppleScript code that constructs a date object programmatically.
 * This avoids locale-dependent date string parsing entirely.
 * The variable will be named with the given `varName`.
 */
export function isoToAppleScriptDateVar(iso: string, varName: string): string {
  const { year, month, day, hours, minutes, seconds } = parseISO(iso);
  return `set ${varName} to current date
set year of ${varName} to ${year}
set month of ${varName} to ${month}
set day of ${varName} to ${day}
set hours of ${varName} to ${hours}
set minutes of ${varName} to ${minutes}
set seconds of ${varName} to ${seconds}`;
}

/**
 * Escape a string for safe use inside AppleScript double quotes.
 */
export function escapeAppleScript(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

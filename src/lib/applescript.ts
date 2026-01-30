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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function isoToAppleScriptDate(iso: string): string {
  const d = new Date(iso);
  const month = MONTHS[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${month} ${day}, ${year} at ${h12}:${mm}:${ss} ${ampm}`;
}

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript, isoToAppleScriptDateVar, escapeAppleScript } from "../lib/applescript.js";

export function registerListEvents(server: McpServer) {
  server.tool(
    "list_events",
    "List events in a date range from Apple Calendar",
    {
      start: z.string().describe("Start date in ISO format (e.g. 2026-01-30). Date-only values are treated as 00:00:00 of that day."),
      end: z.string().describe("End date in ISO format (e.g. 2026-02-06). Date-only values are treated as end-of-day (23:59:59) so passing the same value for start and end returns the full day."),
      calendar: z.string().optional().describe("Filter by calendar name"),
    },
    async ({ start, end, calendar }) => {
      const endIso = end.includes("T") ? end : `${end}T23:59:59`;
      const setD1 = isoToAppleScriptDateVar(start, "d1");
      const setD2 = isoToAppleScriptDateVar(endIso, "d2");

      const calendarFilter = calendar
        ? `set cals to {calendar "${escapeAppleScript(calendar)}"}`
        : `set cals to calendars`;

      const script = `
tell application "Calendar"
  ${calendarFilter}
  ${setD1}
  ${setD2}
  set output to ""
  repeat with cal in cals
    set evts to (every event of cal whose start date >= d1 and start date <= d2)
    repeat with e in evts
      set output to output & summary of e & " | " & name of cal & " | " & start date of e & " → " & end date of e & linefeed
    end repeat
  end repeat
  return output
end tell`;

      try {
        const result = await runAppleScript(script);
        const lines = result.split("\n").filter(Boolean);
        const events = lines.map((line) => {
          const [summary, cal, dates] = line.split(" | ");
          const [startStr, endStr] = (dates || "").split(" → ");
          return { summary: summary?.trim(), calendar: cal?.trim(), start: startStr?.trim(), end: endStr?.trim() };
        });
        return {
          content: [{ type: "text", text: JSON.stringify(events, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing events: ${error}` }],
          isError: true,
        };
      }
    }
  );
}

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript, isoToAppleScriptDate } from "../lib/applescript.js";

export function registerListEvents(server: McpServer) {
  server.tool(
    "list_events",
    "List events in a date range from Apple Calendar",
    {
      start: z.string().describe("Start date in ISO format (e.g. 2026-01-30)"),
      end: z.string().describe("End date in ISO format (e.g. 2026-02-06)"),
      calendar: z.string().optional().describe("Filter by calendar name"),
    },
    async ({ start, end, calendar }) => {
      const startDate = isoToAppleScriptDate(start);
      const endDate = isoToAppleScriptDate(end);

      const calendarFilter = calendar
        ? `set cals to {calendar "${calendar}"}`
        : `set cals to calendars`;

      const script = `
tell application "Calendar"
  ${calendarFilter}
  set d1 to date "${startDate}"
  set d2 to date "${endDate}"
  set output to ""
  repeat with cal in cals
    set evts to (every event of cal whose start date >= d1 and start date < d2)
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

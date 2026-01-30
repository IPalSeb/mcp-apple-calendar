import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "../lib/applescript.js";

export function registerSearchEvents(server: McpServer) {
  server.tool(
    "search_events",
    "Search events by title text in Apple Calendar",
    {
      query: z.string().describe("Text to search for in event titles"),
      calendar: z.string().optional().describe("Filter by calendar name"),
      limit: z.number().optional().default(20).describe("Maximum number of results (default 20)"),
    },
    async ({ query, calendar, limit }) => {
      const calendarFilter = calendar
        ? `set cals to {calendar "${calendar}"}`
        : `set cals to calendars`;

      const script = `
tell application "Calendar"
  ${calendarFilter}
  set output to ""
  set count_ to 0
  repeat with cal in cals
    set evts to (every event of cal whose summary contains "${query}")
    repeat with e in evts
      if count_ < ${limit} then
        set output to output & summary of e & " | " & name of cal & " | " & start date of e & " → " & end date of e & linefeed
        set count_ to count_ + 1
      end if
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
          content: [{ type: "text", text: `Error searching events: ${error}` }],
          isError: true,
        };
      }
    }
  );
}

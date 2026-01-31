import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript, isoToAppleScriptDateVar, escapeAppleScript } from "../lib/applescript.js";

export function registerCreateEvent(server: McpServer) {
  server.tool(
    "create_event",
    "Create a new event in Apple Calendar",
    {
      title: z.string().describe("Event title"),
      start: z.string().describe("Start datetime in ISO format (e.g. 2026-01-30T10:00:00)"),
      end: z.string().describe("End datetime in ISO format (e.g. 2026-01-30T11:00:00)"),
      calendar: z.string().describe("Calendar name to create the event in"),
      location: z.string().optional().describe("Event location"),
      description: z.string().optional().describe("Event description/notes"),
      allDay: z.boolean().optional().default(false).describe("Whether this is an all-day event"),
    },
    async ({ title, start, end, calendar, location, description, allDay }) => {
      const setStartDate = isoToAppleScriptDateVar(start, "startDate");
      const setEndDate = isoToAppleScriptDateVar(end, "endDate");

      const properties = [
        `summary:"${escapeAppleScript(title)}"`,
        `start date:startDate`,
        `end date:endDate`,
      ];

      if (allDay) {
        properties.push(`allday event:true`);
      }
      if (description) {
        properties.push(`description:"${escapeAppleScript(description)}"`);
      }
      if (location) {
        properties.push(`location:"${escapeAppleScript(location)}"`);
      }

      const script = `
tell application "Calendar"
  ${setStartDate}
  ${setEndDate}
  tell calendar "${escapeAppleScript(calendar)}"
    make new event with properties {${properties.join(", ")}}
  end tell
end tell`;

      try {
        await runAppleScript(script);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Event "${title}" created in calendar "${calendar}"`,
                start,
                end,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating event: ${error}` }],
          isError: true,
        };
      }
    }
  );
}

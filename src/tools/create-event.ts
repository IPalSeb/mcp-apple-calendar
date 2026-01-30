import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript, isoToAppleScriptDate } from "../lib/applescript.js";

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
      const startDate = isoToAppleScriptDate(start);
      const endDate = isoToAppleScriptDate(end);

      const properties = [
        `summary:"${title}"`,
        `start date:date "${startDate}"`,
        `end date:date "${endDate}"`,
      ];

      if (allDay) {
        properties.push(`allday event:true`);
      }
      if (description) {
        properties.push(`description:"${description.replace(/"/g, '\\"')}"`);
      }
      if (location) {
        properties.push(`location:"${location.replace(/"/g, '\\"')}"`);
      }

      const script = `
tell application "Calendar"
  tell calendar "${calendar}"
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
                start: startDate,
                end: endDate,
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

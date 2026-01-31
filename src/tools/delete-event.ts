import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript, escapeAppleScript } from "../lib/applescript.js";

export function registerDeleteEvent(server: McpServer) {
  server.tool(
    "delete_event",
    "Delete event(s) by title from a specific Apple Calendar",
    {
      title: z.string().describe("Exact event title to delete"),
      calendar: z.string().describe("Calendar name where the event is"),
    },
    async ({ title, calendar }) => {
      const script = `
tell application "Calendar"
  tell calendar "${escapeAppleScript(calendar)}"
    set matchingEvents to (every event whose summary is "${escapeAppleScript(title)}")
    set eventCount to count of matchingEvents
    delete matchingEvents
    return eventCount
  end tell
end tell`;

      try {
        const result = await runAppleScript(script);
        const count = parseInt(result, 10) || 0;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Deleted ${count} event(s) with title "${title}" from calendar "${calendar}"`,
                deletedCount: count,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error deleting event: ${error}` }],
          isError: true,
        };
      }
    }
  );
}

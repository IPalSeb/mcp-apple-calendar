import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "../lib/applescript.js";

export function registerListCalendars(server: McpServer) {
  server.tool("list_calendars", "List all available calendars in Apple Calendar", {}, async () => {
    const script = `
tell application "Calendar"
  set output to ""
  repeat with cal in calendars
    set output to output & name of cal & linefeed
  end repeat
  return output
end tell`;

    try {
      const result = await runAppleScript(script);
      const calendars = result.split("\n").filter(Boolean);
      return {
        content: [{ type: "text", text: JSON.stringify(calendars, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error listing calendars: ${error}` }],
        isError: true,
      };
    }
  });
}

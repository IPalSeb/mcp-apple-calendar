#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerListCalendars } from "./tools/list-calendars.js";
import { registerListEvents } from "./tools/list-events.js";
import { registerSearchEvents } from "./tools/search-events.js";
import { registerCreateEvent } from "./tools/create-event.js";
import { registerDeleteEvent } from "./tools/delete-event.js";

const server = new McpServer({
  name: "mcp-apple-calendar",
  version: "1.0.0",
});

registerListCalendars(server);
registerListEvents(server);
registerSearchEvents(server);
registerCreateEvent(server);
registerDeleteEvent(server);

const transport = new StdioServerTransport();
await server.connect(transport);

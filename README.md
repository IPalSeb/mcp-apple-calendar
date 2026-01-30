# mcp-apple-calendar

MCP server for interacting with Apple Calendar on macOS via AppleScript.

## Requirements

- macOS (uses AppleScript to communicate with Calendar.app)
- Node.js >= 18

## Installation

### With npx (recommended)

No installation needed. Configure directly in your MCP client:

```json
{
  "mcpServers": {
    "mcp-apple-calendar": {
      "command": "npx",
      "args": ["-y", "mcp-apple-calendar"]
    }
  }
}
```

### From source

```bash
git clone https://github.com/IPalSeb/mcp-apple-calendar.git
cd mcp-apple-calendar
npm install
npm run build
```

Then configure:

```json
{
  "mcpServers": {
    "mcp-apple-calendar": {
      "command": "node",
      "args": ["/path/to/mcp-apple-calendar/dist/index.js"]
    }
  }
}
```

## Tools

### `list_calendars`

List all available calendars.

**Parameters**: none

### `list_events`

List events in a date range.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start` | string | yes | Start date in ISO format (e.g. `2026-01-30`) |
| `end` | string | yes | End date in ISO format (e.g. `2026-02-06`) |
| `calendar` | string | no | Filter by calendar name |

### `search_events`

Search events by title text.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | yes | Text to search for in event titles |
| `calendar` | string | no | Filter by calendar name |
| `limit` | number | no | Max results (default 20) |

### `create_event`

Create a new event.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | yes | Event title |
| `start` | string | yes | Start datetime in ISO format |
| `end` | string | yes | End datetime in ISO format |
| `calendar` | string | yes | Calendar name |
| `location` | string | no | Event location |
| `description` | string | no | Event description |
| `allDay` | boolean | no | All-day event (default false) |

### `delete_event`

Delete event(s) by exact title.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | yes | Exact event title |
| `calendar` | string | yes | Calendar name |

## Permissions

On first use, macOS will ask you to grant calendar access to the terminal application running the server (Terminal, iTerm2, etc.). You must allow this for the tools to work.

## License

MIT

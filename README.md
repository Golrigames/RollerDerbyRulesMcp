# 🛼 MCP Server Roller Derby Rules

MCP (Model Context Protocol) server to access Roller Derby rules extracted from a PDF (French)

## Installation

```bash
npm install
```

## Usage

### Start the server

```bash
npm start
```

### Development mode (with auto-reload)

```bash
npm run dev
```

## Features

### Tools

1. **list_sections** - List all available sections
2. **get_section** - Get the content of a specific section
   - Available sections: `introduction`, `parametres`, `le-jeu`, `score`, `penalites`, `arbitrage`
3. **search_rules** - Search by keyword in the rules
   - Parameters:
     - `query`: search term
     - `section` (optional): specific section to search in

### Resources

- `derby://rules/complete` - Complete rules document
- `derby://rules/section/00-introduction` - Introduction section
- `derby://rules/section/01-parametres` - Parameters section
- `derby://rules/section/02-le-jeu` - The game section
- `derby://rules/section/03-score` - Score section
- `derby://rules/section/04-penalites` - Penalties section
- `derby://rules/section/05-arbitrage` - Officiating section

## Configuration

### Claude Desktop

Add this server to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "derby-rules": {
      "command": "node",
      "args": ["/absolute/path/to/mcpDerby/index.js"]
    }
  }
}
```

### GitHub Copilot (VS Code) Local path

1. Install the "GitHub Copilot" extension in VS Code
2. Open settings (Ctrl+, or Cmd+,)
3. Search for "MCP" or "Model Context Protocol"
4. Add a `mcp.json` in .vscode directory inside your project :

```json
{
  "servers": {
    "derby-rules": {
      "command": "node",
      "args": ["/absolute/path/to/mcpDerby/index.js"]
    }
  }
}
```

### ChatGPT Desktop

MCP support is not yet natively available in ChatGPT Desktop. You can:

1. **Use the OpenAI API** with an MCP-compatible client
2. **Copy-paste** content from markdown files in `output/`
3. **Use an MCP proxy** that exposes data via REST API

### Other MCP clients

For any MCP-compatible client, use:

**Command**: `node`  
**Arguments**: `["/absolute/path/to/mcpDerby/index.js"]`  
**Transport**: `stdio`

## Data structure

Rules are organized into:

- A complete file: `output/contenu-complet.md`
- Individual sections in: `output/sections/`

## Usage examples

### Search for "jammer" in all rules

```json
{
  "tool": "search_rules",
  "arguments": {
    "query": "jammer"
  }
}
```

### Get the penalties section

```json
{
  "tool": "get_section",
  "arguments": {
    "section": "penalites"
  }
}
```

### Read the complete resource

```
derby://rules/complete
```

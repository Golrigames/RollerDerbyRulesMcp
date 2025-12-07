#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to data files
const OUTPUT_DIR = path.join(__dirname, "output");
const SECTIONS_DIR = path.join(OUTPUT_DIR, "sections");
const COMPLETE_FILE = path.join(OUTPUT_DIR, "contenu-complet.md");

// Create MCP server with high-level API
const server = new McpServer(
  {
    name: "mcp-derby-rules",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List of available sections
const SECTIONS = [
  { id: "00-introduction", name: "Introduction", file: "00-introduction.md" },
  {
    id: "01-parametres",
    name: "Match parameters and safety",
    file: "01-parametres.md",
  },
  { id: "02-le-jeu", name: "The game", file: "02-le-jeu.md" },
  { id: "03-score", name: "Score", file: "03-score.md" },
  { id: "04-penalites", name: "Penalties", file: "04-penalites.md" },
  { id: "05-arbitrage", name: "Officiating", file: "05-arbitrage.md" },
];

// Section mapping for easy access
const sectionMap = {
  introduction: "00-introduction.md",
  parametres: "01-parametres.md",
  "le-jeu": "02-le-jeu.md",
  score: "03-score.md",
  penalites: "04-penalites.md",
  arbitrage: "05-arbitrage.md",
};

// Register resources using high-level API

// Complete rules resource
server.registerResource(
  "complete-rules",
  "derby://rules/complete",
  {
    title: "Complete Roller Derby Rules",
    description: "Complete document containing all rules",
    mimeType: "text/markdown",
  },
  async () => {
    const content = await fs.readFile(COMPLETE_FILE, "utf-8");
    return {
      contents: [
        {
          uri: "derby://rules/complete",
          text: content,
        },
      ],
    };
  }
);

// Individual section resources
for (const section of SECTIONS) {
  const uri = `derby://rules/section/${section.id}`;
  server.registerResource(
    section.id,
    uri,
    {
      title: section.name,
      description: `Section: ${section.name}`,
      mimeType: "text/markdown",
    },
    async () => {
      const filePath = path.join(SECTIONS_DIR, section.file);
      const content = await fs.readFile(filePath, "utf-8");
      return {
        contents: [
          {
            uri,
            text: content,
          },
        ],
      };
    }
  );
}

// Register tools using high-level API

// Tool: list_sections
server.registerTool(
  "list_sections",
  {
    description: "List all available rules sections",
    inputSchema: {},
  },
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            SECTIONS.map((s) => ({ id: s.id, name: s.name })),
            null,
            2
          ),
        },
      ],
    };
  }
);

// Tool: get_section
server.registerTool(
  "get_section",
  {
    description: "Get the complete content of a specific rules section",
    inputSchema: {
      type: "object",
      properties: {
        section: {
          type: "string",
          description: "The section to retrieve",
          enum: [
            "introduction",
            "parametres",
            "le-jeu",
            "score",
            "penalites",
            "arbitrage",
          ],
        },
      },
      required: ["section"],
    },
  },
  async (args) => {
    const filename = sectionMap[args.section];
    if (!filename) {
      return {
        content: [
          {
            type: "text",
            text: `Invalid section: ${args.section}`,
          },
        ],
        isError: true,
      };
    }

    const filePath = path.join(SECTIONS_DIR, filename);
    const content = await fs.readFile(filePath, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };
  }
);

// Tool: search_rules
server.registerTool(
  "search_rules",
  {
    description: "Search Roller Derby rules by keyword",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search term to look for in the rules",
        },
        section: {
          type: "string",
          description: "Specific section to search in (optional)",
          enum: [
            "introduction",
            "parametres",
            "le-jeu",
            "score",
            "penalites",
            "arbitrage",
            "all",
          ],
        },
      },
      required: ["query"],
    },
  },
  async (args) => {
    const query = args.query.toLowerCase();
    const searchSection = args.section || "all";
    let results = [];

    if (searchSection === "all") {
      // Search in complete file
      const content = await fs.readFile(COMPLETE_FILE, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(query)) {
          // Add context (line before and after)
          const context = lines
            .slice(Math.max(0, index - 1), Math.min(lines.length, index + 2))
            .join("\n");
          results.push({
            line: index + 1,
            context: context,
          });
        }
      });
    } else {
      // Search in a specific section
      const filename = sectionMap[searchSection];
      if (filename) {
        const filePath = path.join(SECTIONS_DIR, filename);
        const content = await fs.readFile(filePath, "utf-8");
        const lines = content.split("\n");

        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(query)) {
            const context = lines
              .slice(Math.max(0, index - 1), Math.min(lines.length, index + 2))
              .join("\n");
            results.push({
              section: searchSection,
              line: index + 1,
              context: context,
            });
          }
        });
      }
    }

    return {
      content: [
        {
          type: "text",
          text:
            results.length > 0
              ? JSON.stringify(results, null, 2)
              : `No results found for "${args.query}"`,
        },
      ],
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Derby Server started on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

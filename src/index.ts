import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// 1. Initialize the MCP Server
const server = new Server(
  {
    name: "weather-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, 
    },
  }
);

// 2. Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_weather",
        description: "Get the current weather simulation for a given city",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "The name of the city",
            },
          },
          required: ["city"],
        },
      },
    ],
  };
});

// 3. Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "get_weather") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const city = String(request.params.arguments?.city ?? "Unknown");
  
  const conditions = ["Sunny", "Rainy", "Cloudy", "Overcast"];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const randomTemp = Math.floor(Math.random() * 15) + 65; 

  return {
    content: [
      {
        type: "text",
        text: `The weather in ${city} is currently ${randomCondition} at ${randomTemp}°F.`,
      },
    ],
  };
});

// 4. Connect using Standard Input/Output (Stdio) transport
async function main() {
  const transport = new StdioServerTransport(); // Fixed typo here
  await server.connect(transport);
  console.error("Weather MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

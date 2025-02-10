#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { list, shape, interactWith } from "../../src/index.js";
import type {
  DeviceDefinition,
  DeviceId,
  DeviceInteractors,
  DeviceTarget,
} from "../../src/types.js";

const server = new Server(
  {
    name: "Device Shaper",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Tool schemas and types
type ListDevicesParams = z.infer<typeof listDevicesSchema>;
type ShapeDeviceParams = z.infer<typeof shapeDeviceSchema>;
type InteractDeviceParams = z.infer<typeof interactDeviceSchema>;

const platformSchema = z.enum(["ios", "android"]);

const listDevicesSchema = z.object({
  platform: platformSchema.optional(),
  filters: z
    .object({
      state: z.enum(["booted", "shutdown"]).optional(),
      osVersion: z.string().optional(),
      model: z.string().optional(),
    })
    .optional(),
});

const shapeDeviceSchema = z.object({
  platform: platformSchema,
  target: z.object({
    model: z.string().optional(),
    osVersion: z.string().optional(),
    state: z.enum(["booted", "shutdown"]).optional(),
    visibility: z.enum(["visible", "headless"]).optional(),
  }),
});

const interactDeviceSchema = z.object({
  platform: platformSchema,
  uniqueId: z.string(),
  action: z.enum(["screenshot", "open_url"]),
  params: z
    .object({
      url: z.string().optional(),
      path: z.string().optional(),
    })
    .optional(),
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_devices",
      description: "List available iOS/Android devices",
      inputSchema: listDevicesSchema,
    },
    {
      name: "shape_device",
      description: "Configure device characteristics",
      inputSchema: shapeDeviceSchema,
    },
    {
      name: "interact_with_device",
      description: "Interact with a device",
      inputSchema: interactDeviceSchema,
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "list_devices": {
      const { platform, filters } = args as ListDevicesParams;
      const devices = await list({ platform, ...filters });
      return { devices };
    }

    case "shape_device": {
      const { platform, target } = args as ShapeDeviceParams;
      // Cast to any first to bypass the union type check, then to DeviceTarget
      const deviceTarget = {
        platform,
        ...target,
      } as any as DeviceTarget;
      const device = await shape(deviceTarget);
      return { device };
    }

    case "interact_with_device": {
      const { platform, uniqueId, action, params = {} } = args as InteractDeviceParams;
      const device = interactWith({ platform, uniqueId });

      switch (action) {
        case "screenshot":
          if (params.path) {
            await device.screenshot(params.path);
            return { success: true };
          } else {
            const buffer = await device.screenshot();
            return { screenshot: buffer.toString("base64") };
          }
        case "open_url":
          if (!params.url) {
            throw new Error("URL is required for open_url action");
          }
          await device.openURL(params.url);
          return { success: true };
      }
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Device Shaper MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

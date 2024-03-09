import { z } from "zod";

import { bug } from "#std/error";
import { createQuery } from "#std/query";
import { run } from "#std/run";

import type { DeviceModel } from "../../types";

export const simctlList = createQuery(async () => {
  const simctlOutput = await run("xcrun", ["simctl", "list", "--json"]);

  return OutputSchema.parse(JSON.parse(simctlOutput));
});

const OutputSchema = z.object({
  devices: z.unknown(),
  runtimes: z.unknown(),
  devicetypes: z.unknown(),
});

/**
 *
 * @param input a string like com.apple.CoreSimulator.SimDeviceType.iPhone-14-Pro-Max
 * @returns `iPhone-14-Pro-Max`
 */
export const extractDeviceModel = (input: string) => {
  const split = input.split(".");

  const modelName = split[split.length - 1];

  if (!modelName) {
    throw bug(`Could not extract iOS model from ${input}`);
  }

  return modelName as DeviceModel;
};

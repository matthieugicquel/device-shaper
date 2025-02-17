import * as R from "remeda";
import { z } from "zod";

import type { DeviceDefinition, OsVersion } from "../../types";
import { extractDeviceModel, simctlList } from "./all";

export const listSimulators = async () => {
  const { devices } = await simctlList();

  return R.pipe(
    DevicesSchema.parse(devices),
    R.toPairs,
    R.flatMap(([runtime, devicesForRuntime]) => {
      if (!devicesForRuntime) return [];

      return devicesForRuntime
        .filter((device) => device.isAvailable)
        .map((device): DeviceDefinition & { state: "booted" | "shutdown" } => {
          return {
            platform: "ios",
            uniqueId: device.udid,
            name: device.name,
            model: extractDeviceModel(device.deviceTypeIdentifier),
            osVersion: runtime as `${number}.${number}`,
            state: device.state === "Booted" ? "booted" : "shutdown", // TODO: be more precise
          };
        });
    }),
  );
};

listSimulators.invalidate = simctlList.invalidate;

const OsVersionSchema = z.string().transform<OsVersion>((value, ctx) => {
  const split = value.split("-");

  const major = split[split.length - 2];
  const minor = split[split.length - 1];

  if (!major) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Could not find major os version",
    });

    return z.NEVER;
  }

  if (!minor) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Could not find minor os version",
    });

    return z.NEVER;
  }

  return `${major}.${minor}` as OsVersion;
});

const DeviceSchema = z.object({
  udid: z.string(),
  name: z.string(),
  deviceTypeIdentifier: z.string(), // eg com.apple.CoreSimulator.SimDeviceType.iPhone-14-Pro-Max
  state: z.enum(["Shutdown", "Booted", "Shutting Down", "Booting"]),
  isAvailable: z.boolean(),
});

const DevicesSchema = z.record(OsVersionSchema, z.array(DeviceSchema));

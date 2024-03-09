import * as R from "remeda";
import { z } from "zod";

import type {
  DeviceDefinition,
  DeviceModel,
  OsVersion,
  PlatformState,
} from "../deviceShaper.types";
import { createQuery } from "#vzr/utils/query";
import { run } from "#vzr/utils/run";

export const fetchState = createQuery(async (): Promise<PlatformState> => {
  const simctlOutput = await run("xcrun", ["simctl", "list", "--json"]);

  const { devices, runtimes } = OutputSchema.parse(JSON.parse(simctlOutput));

  const adapatedDevices = R.pipe(
    devices,
    R.toPairs,
    R.flatMap(([runtime, devicesForRuntime]) => {
      if (!devicesForRuntime) return [];

      return devicesForRuntime.map((device): DeviceDefinition => {
        return {
          platform: "ios",
          uniqueId: device.udid,
          name: device.name,
          model: device.deviceTypeIdentifier,
          osVersion: runtime as `${number}.${number}`,
          // state: when(device.state, { Shutdown: "shutdown", Booted: "booted" }),
        };
      });
    }),
  );

  const adaptedRuntimes = runtimes.map((runtime) => {
    return { osVersion: runtime.identifier };
  });

  return {
    devices: adapatedDevices,
    runtimes: adaptedRuntimes,
  };
});

const DeviceModelSchema = z.string().transform<DeviceModel>((value, ctx) => {
  const split = value.split("."); // input like com.apple.CoreSimulator.SimDeviceType.iPhone-14-Pro-Max

  const deviceModel = split[split.length - 1];

  if (!deviceModel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Could not find device model",
    });

    return z.NEVER;
  }

  return deviceModel as DeviceModel;
});

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
  deviceTypeIdentifier: DeviceModelSchema,
  state: z.enum(["Shutdown", "Booted"]),
});

const OutputSchema = z.object({
  devices: z.record(OsVersionSchema, z.array(DeviceSchema)),
  runtimes: z.array(z.object({ identifier: OsVersionSchema })),
});

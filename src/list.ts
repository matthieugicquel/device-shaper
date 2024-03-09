import * as R from "remeda";
import { match } from "ts-pattern";

import { createDebug } from "#std/debug";

import { android } from "./android/android";
import { simctl } from "./simctl/simctl";
import type { DeviceDefinition, DeviceTarget } from "./types";

const debug = createDebug("list");

type AllowedFilters = Pick<
  DeviceTarget,
  "platform" | "uniqueId" | "name" | "model" | "osVersion" | "state"
>;

export const list = async (filters: AllowedFilters): Promise<DeviceDefinition[]> => {
  const devices = await match(filters.platform)
    .with("ios", () => simctl.getDevices())
    .with("android", () => android.getDevices())
    .with(undefined, () =>
      Promise.all([simctl.getDevices(), android.getDevices()]).then((r) => R.flatten(r)),
    )
    .exhaustive();

  debug(`filtering ${devices.length} devices`);

  const filteredDevices = [...devices];

  // Fetch info for modifiers that are specified in the filters
  for (const device of devices) {
    const shaper = match(device.platform)
      .with("ios", () => simctl)
      .with("android", () => android)
      .exhaustive();

    const modifiers = shaper.getModifiers(device.uniqueId);

    const exclude = () => {
      delete filteredDevices[filteredDevices.indexOf(device)];
    };

    for (const key of R.keys.strict(filters)) {
      const value = filters[key];
      if (value === undefined) continue;

      // Keys that we get from the definition, without other requests
      if (["uniqueId", "name", "model", "osVersion"].includes(key)) {
        // @ts-expect-error -- doesn't understand includes
        const deviceValue = device[key];
        if (deviceValue !== value) {
          debug(
            `excluding ${device.name} because ${key} does not match (filter: ${value}, device: ${deviceValue})`,
          );
          exclude();
        }
      }

      // Keys that we need to fetch from the modifiers
      if (["state"].includes(key)) {
        // @ts-expect-error -- doesn't understand includes
        const modifier = modifiers[key];
        const deviceValue = await modifier.getCurrent();
        if (deviceValue !== value) {
          debug(
            `excluding ${device.name} because ${key} does not match (filter: ${value}, device: ${deviceValue})`,
          );
          exclude();
        }
      }
    }
  }

  return filteredDevices.filter(Boolean);
};

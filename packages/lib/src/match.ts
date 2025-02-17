import { createDebug } from "#std/debug";
import { usageError } from "#std/error";

import type { DeviceDefinition, DeviceTarget } from "./types";

const debug = createDebug("match");

/**
 * These items need to match perfectly, we won't be modifying them on existing devices
 */
const immutableCharacteristics: (keyof DeviceDefinition)[] = [
  "platform",
  "uniqueId",
  "model",
  "name",
  "osVersion",
];

export const matchTargetToExisting = (
  target: DeviceTarget,
  existingDevices: DeviceDefinition[],
): string | undefined => {
  const targetIdExists =
    target.uniqueId && existingDevices.some((device) => device.uniqueId === target.uniqueId);

  let matches = [...existingDevices];

  debug(`looking for matches in ${matches.length} devices`);

  for (const characteristic of immutableCharacteristics) {
    if (!target[characteristic]) continue;

    matches = matches.filter((device) => {
      return device[characteristic] === target[characteristic];
    });

    debug(`${matches.length} potential matches after checking ${characteristic}`);

    if (matches.length === 0 && targetIdExists) {
      throw usageError(
        `Device with udid "${target.uniqueId}" exists but doesn't match ${characteristic} "${target[characteristic]}"`,
      );
    }

    if (matches.length === 0 && target.uniqueId) {
      throw usageError(`Can't create a device with fixed udid "${target.uniqueId}"`);
    }
  }

  const match = matches[0];

  if (!match) return undefined;

  debug("found match with udid %s", match.uniqueId);

  return match.uniqueId;
};

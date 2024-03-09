import type {
  DeviceDefinition,
  DeviceTarget,
  MatchedDeviceTarget,
} from "./deviceShaper.types";

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

export type MatchSuccessResult = {
  result: "match";
  target: MatchedDeviceTarget;
  device: DeviceDefinition;
  problem?: undefined;
};

type MatchResult =
  | MatchSuccessResult
  | {
      result: "must-create-device";
      target: DeviceTarget;
      device?: undefined;
      problem: string;
    }
  | {
      result: "impossible";
      target: DeviceTarget;
      device?: undefined;
      problem: string;
    };

export const matchTargetToExisting = (
  target: DeviceTarget,
  existingDevices: DeviceDefinition[],
): MatchResult => {
  const deviceWithTargetUniqueId = target.uniqueId
    ? existingDevices.find((device) => device.uniqueId === target.uniqueId)
    : undefined;

  let matches = [...existingDevices];

  for (const characteristic of immutableCharacteristics) {
    if (!target[characteristic]) continue;

    matches = matches.filter((device) => {
      return device[characteristic] === target[characteristic];
    });

    if (matches.length !== 0) continue;

    if (deviceWithTargetUniqueId) {
      return {
        result: "impossible",
        target,

        problem: `device with udid "${deviceWithTargetUniqueId.uniqueId}" exists but doesn't match ${characteristic} "${target[characteristic]}"`,
      };
    }

    if (characteristic === "uniqueId") {
      return {
        result: "impossible",
        target,

        problem: `can't create a device with fixed udid "${target.uniqueId}"`,
      };
    }

    return {
      result: "must-create-device",
      target,

      problem: `no match for ${characteristic} "${target[characteristic]}"`,
    };
  }

  const match = matches[0];

  if (!match) throw new Error("this should not happen");

  return { result: "match", target: { ...target, ...match }, device: match };
};

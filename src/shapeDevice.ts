import type { DeviceTarget } from "./deviceShaper.types";
import { getShaper } from "./getShaper";
import { matchTargetToExisting } from "./match";
import { impossible, knownErrorWithoutStack } from "#vzr/utils/error";

export const shapeDevice = async (target: DeviceTarget) => {
  const shaper = getShaper(target);

  const { devices: existingDevices } = await shaper.fetchState();

  const matchResult = matchTargetToExisting(target, existingDevices);

  if (matchResult.result === "impossible") {
    throw knownErrorWithoutStack(matchResult.problem, matchResult.target);
  }

  const matchedTarget = await (() => {
    if (matchResult.result === "match") {
      return matchResult.target;
    }

    if (matchResult.result === "must-create-device") {
      return shaper.createDevice(matchResult.target);
    }

    throw impossible();
  })();

  const shapingResult = await shaper.shapeDevice(matchedTarget);

  return shapingResult;
};

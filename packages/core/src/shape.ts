import * as R from "remeda";
import { match } from "ts-pattern";

import { createDebug } from "#std/debug";
import { usageError } from "#std/error";

import { android } from "#src/android/android";
import { matchTargetToExisting } from "#src/match";
import { simctl } from "#src/simctl/simctl";
import type { DeviceId, DeviceTarget } from "#src/types";

const debug = createDebug("shape");

/**
 * Modify or create a device to match the given target
 * @param target A config object describing the characteristics of the device to shape
 * @returns The unique id of the shaped device
 */
export const shape = async (target: DeviceTarget): Promise<DeviceId> => {
  if (!target.platform) throw usageError("platform is required to shape a device");

  const shaper = match(target.platform)
    .with("ios", () => simctl)
    .with("android", () => android)
    .exhaustive();

  let uniqueId = matchTargetToExisting(target, await shaper.getDevices());

  if (!uniqueId) {
    debug("creating a new device");
    const createdDevice = await shaper.createDevice(target);
    uniqueId = createdDevice.uniqueId;
  }

  debug(`[${target.platform}] shaping device ${uniqueId}`);

  const modifiers = shaper.getModifiers(uniqueId);

  for (const modifierKey of R.keys.strict(modifiers)) {
    const targetValue = target[modifierKey];

    if (!targetValue) continue;

    const modifier = modifiers[modifierKey];

    debug(`[${target.platform}] applying modifier ${modifierKey} -> %o`, targetValue);

    const currentValue = await modifier.getCurrent();

    if (currentValue && R.isDeepEqual(currentValue, targetValue)) {
      debug(`[${target.platform}] modifier ${modifierKey} already matches`);
      continue;
    }

    // @ts-expect-error - Not sure how to handle that with TS
    await modifier.apply(targetValue);
  }

  // TODO: handle reboots when relevant

  debug(`[${target.platform}] shaped  device ${uniqueId}`);

  return { platform: target.platform, uniqueId };
};

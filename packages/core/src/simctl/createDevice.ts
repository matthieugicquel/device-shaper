import * as R from "remeda";

import { bug, fixYourInstall } from "#std/error";
import { isRunCommandError, run } from "#std/run";

import { listSimulators } from "#src/simctl/queries/devices";
import { listModels } from "#src/simctl/queries/models";
import type { DeviceId, DeviceTarget } from "#src/types";

export const createDevice = async (target: DeviceTarget): Promise<DeviceId> => {
  if (target.platform !== "ios") {
    throw bug("called simctl shaper to create non-iOS device");
  }

  const model = await (async () => {
    if (target.model) {
      return target.model;
    }

    const models = await listModels();

    const bestModel = R.last(models);

    if (bestModel) {
      return bestModel;
    }

    throw fixYourInstall("No iOS simulator models found");
  })();

  const { name, osVersion } = target;

  const params = [
    "simctl",
    "create",
    name ?? model,
    `com.apple.CoreSimulator.SimDeviceType.${model}`,
    target.osVersion ? `ios${osVersion}` : undefined,
  ].filter(Boolean) as string[];

  try {
    const createdUDID = await run("xcrun", params);

    listSimulators.invalidate();

    return { platform: "ios", uniqueId: createdUDID };
  } catch (error) {
    if (!isRunCommandError(error)) throw error;

    if (error.stderr.includes("Invalid runtime") && target.osVersion) {
      /*
       * How to install a simulator runtime?
       * either https://developer.apple.com/documentation/xcode/installing-additional-simulator-runtimes
       *
       * or
       * ```sh
       * brew install timsutton/formulae/speedwagon
       * speedwagon download "iOS XX.Y" (or iOS XX for Y=0)
       * xcrun simctl runtime add iOS_XX.Y_Simulator_Runtime.dmg
       * ```
       */
      throw fixYourInstall(
        `Runtime ${target.osVersion} is not installed. See https://developer.apple.com/documentation/xcode/installing-additional-simulator-runtimes`,
      );
    }

    throw error;
  }
};

import type { DeviceModel, OsVersion } from "../deviceShaper.types";
import { fetchState } from "./fetchState";
import { knownErrorWithoutStack } from "#vzr/utils/error";
import { isRunCommandError, run } from "#vzr/utils/run";

type CreateParams = {
  model: DeviceModel;
  name: string;
  osVersion: OsVersion;
};

export type CreateSuccessResult = {
  result: "created";
  uniqueId: string;
};

export const createDevice = async (target: CreateParams): Promise<CreateSuccessResult> => {
  const { name, model, osVersion } = target;

  const fullModel = `com.apple.CoreSimulator.SimDeviceType.${model}`;

  const params = ["simctl", "create", name, fullModel, `ios${osVersion}`];

  try {
    const createdUDID = await run("xcrun", params);

    fetchState.invalidate();

    return { result: "created", uniqueId: createdUDID };
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
      throw knownErrorWithoutStack("must-install-runtime", { osVersion: target.osVersion });
    }

    throw error;
  }
};

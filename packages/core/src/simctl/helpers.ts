import type execa from "execa";
import os from "os";
import path from "path";

import { sleep } from "#std/async";
import { isRunCommandError, run } from "#std/run";

export const getSimulatorDataPath = (uniqueId: string) => {
  return path.join(os.homedir(), `Library/Developer/CoreSimulator/Devices/${uniqueId}/data`);
};

export const getSimulatorDataFilePath = (uniqueId: string, relativePath: string) => {
  return path.join(getSimulatorDataPath(uniqueId), relativePath);
};

export const runSimctl = async (
  args: [command: string, simulatorId: string, ...other: string[]],
  options?: execa.Options,
) => {
  try {
    return await run("xcrun", ["simctl", ...args], options);
  } catch (error) {
    if (!isRunCommandError(error)) throw error;

    if (error.exitCode === 60) {
      // The operation couldn’t be completed. Operation timed out
      // Make a single retry in this case

      await sleep(3000);

      return run("xcrun", ["simctl", ...args], options);
    }

    throw error;
  }
};

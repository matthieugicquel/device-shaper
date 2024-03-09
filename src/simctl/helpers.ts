import os from "os";
import path from "path";
import * as R from "remeda";

import type { RuntimeDefinition } from "../deviceShaper.types";
import { fixYourInstall } from "#vzr/utils/error";

export const findBestAvailableRuntime = (runtimes: RuntimeDefinition[]) => {
  const choice = R.last(runtimes);
  if (!choice) throw fixYourInstall("There are no installed runtimes");

  return choice;
};

export const getSimulatorDataPath = (uniqueId: string) => {
  return path.join(os.homedir(), `Library/Developer/CoreSimulator/Devices/${uniqueId}/data`);
};

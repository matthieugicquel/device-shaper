import os from "os";
import path from "path";

export const getSimulatorDataPath = (uniqueId: string) => {
  return path.join(os.homedir(), `Library/Developer/CoreSimulator/Devices/${uniqueId}/data`);
};

export const getSimulatorDataFilePath = (uniqueId: string, relativePath: string) => {
  return path.join(getSimulatorDataPath(uniqueId), relativePath);
};

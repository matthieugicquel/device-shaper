import type { DeviceShaper } from "../types";
import { createDevice } from "./createDevice";
import { getInteractors } from "./interactors";
import { getModifiers } from "./modifiers";
import { listSimulators } from "./queries/devices";

export const simctl: DeviceShaper = {
  getDevices: listSimulators,
  createDevice,
  getModifiers,
  getInteractors,
};
